// lib/auth.ts
// Firebase Phone-Auth helpers for OTP signup + password login.
//
// Strategy: "Email/Password provider linking"
//   Signup → After OTP, link an EmailAuthProvider credential to the Phone user.
//   Login  → signInWithEmailAndPassword using a hidden derived email.
//
// Uses @react-native-firebase/auth exclusively (Native SDK).
//
// IMPORTANT: Enable "Email/Password" sign-in provider in Firebase Console:
//   Authentication → Sign-in method → Email/Password → Enable → Save
//   (Disable "Email link / passwordless" — only classic email+password is needed)

import { auth } from '@/src/services/firebaseConfig';
import { firebase } from '@react-native-firebase/auth';
import * as SecureStore from 'expo-secure-store';

// ─── OTP helpers ─────────────────────────────────────────────────────────────

/**
 * Callback type for auto-verification events (Android same-device).
 * When Firebase auto-verifies the OTP (SMS on same device), the user is
 * signed in automatically and this callback fires with the user object.
 */
export type AutoVerifyCallback = (user: FirebaseAuthTypes.User) => void;

/**
 * Send an OTP to the given phone number using the native Firebase SDK.
 * Uses `verifyPhoneNumber` instead of `signInWithPhoneNumber` to properly
 * handle Android auto-verification (same device receives SMS).
 *
 * @param phoneNumber – E.164 format, e.g. "+919205394233"
 * @param onAutoVerified – optional callback fired if Android auto-verifies
 * @param forceResend – set true when resending OTP
 * @returns verificationId
 */
export async function sendOtp(
  phoneNumber: string,
  onAutoVerified?: AutoVerifyCallback,
  forceResend?: boolean,
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    auth
      .verifyPhoneNumber(phoneNumber, forceResend)
      .on('state_changed', async (phoneAuthSnapshot) => {
        switch (phoneAuthSnapshot.state) {
          // ── Step 1: Code sent via SMS ──
          case firebase.auth.PhoneAuthState.CODE_SENT:
            console.log('[OTP] Code sent, verificationId:', phoneAuthSnapshot.verificationId);
            resolve(phoneAuthSnapshot.verificationId);
            break;

          // ── Step 2: Android auto-verified (same device) ──
          case firebase.auth.PhoneAuthState.AUTO_VERIFIED:
            console.log('[OTP] Auto-verified on same device');
            try {
              // Build credential from the auto-verified snapshot
              const credential = firebase.auth.PhoneAuthProvider.credential(
                phoneAuthSnapshot.verificationId,
                phoneAuthSnapshot.code || '',
              );
              const result = await auth.signInWithCredential(credential);
              if (onAutoVerified) {
                onAutoVerified(result.user);
              }
              // Still resolve with verificationId so the UI has it
              resolve(phoneAuthSnapshot.verificationId);
            } catch (err) {
              console.error('[OTP] Auto-verify sign-in failed:', err);
              // Still resolve — user can manually enter OTP
              resolve(phoneAuthSnapshot.verificationId);
            }
            break;

          // ── Auto-verify timed out ──
          case firebase.auth.PhoneAuthState.AUTO_VERIFY_TIMEOUT:
            console.log('[OTP] Auto-verify timeout, user must enter OTP manually');
            resolve(phoneAuthSnapshot.verificationId);
            break;

          // ── Error ──
          case firebase.auth.PhoneAuthState.ERROR:
            console.error('[OTP] Phone auth error:', phoneAuthSnapshot.error);
            reject(
              phoneAuthSnapshot.error ||
              new Error('Phone verification failed. Please try again.'),
            );
            break;

          default:
            break;
        }
      });
  });
}

/**
 * Verify the 6-digit OTP and sign in with Firebase Phone Auth.
 *
 * @param verificationId – from sendOtp
 * @param otp – 6-digit code
 * @param expectedPhoneNumber – optional, to ensure we don't return a wrong existing session
 */
export async function verifyOtp(verificationId: string, otp: string, expectedPhoneNumber?: string) {
  // If the user is already signed in (auto-verified), check if it's the right one
  const currentUser = auth.currentUser;
  if (currentUser && currentUser.phoneNumber) {
    // If we have an expected number, make sure it matches (ignoring +91 or formatting)
    if (expectedPhoneNumber) {
      const current = normalizePhone(currentUser.phoneNumber);
      const expected = normalizePhone(expectedPhoneNumber);
      if (current === expected) {
        console.log('[OTP] User matches expected phone via auto-verification:', currentUser.uid);
        return currentUser;
      }
    } else {
      console.log('[OTP] User already signed in via auto-verification:', currentUser.uid);
      return currentUser;
    }
  }

  try {
    const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, otp);
    const result = await auth.signInWithCredential(credential);
    return result.user;
  } catch (error: any) {
    // If it says session-expired, check one last time if we are signed in now
    // (Sometimes the auth state updates exactly during the failure)
    if (error.code === 'auth/session-expired') {
      const retryUser = auth.currentUser;
      if (retryUser && retryUser.phoneNumber) {
        if (!expectedPhoneNumber || normalizePhone(retryUser.phoneNumber) === normalizePhone(expectedPhoneNumber)) {
          console.log('[OTP] Session expired but user is now signed in:', retryUser.uid);
          return retryUser;
        }
      }
    }
    throw error;
  }
}

// ─── Auth state ───────────────────────────────────────────────────────────────

export function onAuthChange(callback: (user: FirebaseAuthTypes.User | null) => void) {
  return auth.onAuthStateChanged(callback);
}

export async function signOut() {
  return auth.signOut();
}

// ─── Phone ↔ Email mapping ────────────────────────────────────────────────────

function normalizePhone(phoneNumber: string): string {
  const digits = phoneNumber.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  return digits;
}

/** Derives a hidden email from the phone number, e.g. "919205394233@tfh-partner.app" */
function getHiddenEmail(phoneNumber: string): string {
  return `${normalizePhone(phoneNumber)}@tfh-partner.app`;
}

function getLocalPasswordKey(phoneNumber: string): string {
  return `auth_pw_${normalizePhone(phoneNumber)}`;
}

// ─── Reset password (forgot password flow) ───────────────────────────────────

/**
 * Called in the forgot-password flow after OTP verification.
 * Re-authenticates the user with the phone credential, then updates the
 * email/password provider's password.
 *
 * @param phoneNumber    – E.164 phone number
 * @param password       – new plaintext password
 * @param verificationId – from the sendOtp() call
 * @param otp            – the 6-digit code the user entered
 */
export async function resetPasswordWithOtp(
  phoneNumber: string,
  password: string,
  verificationId: string,
  otp: string,
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user found. Please try again.');

  // If we have both verificationId and otp, re-authenticate to prove a recent
  // sign-in. But when OTP is empty (auto-verified on same device), the user was
  // just signed in via phone credential — skip re-auth.
  if (verificationId && otp) {
    const phoneCredential = firebase.auth.PhoneAuthProvider.credential(verificationId, otp);
    await user.reauthenticateWithCredential(phoneCredential);
  } else {
    console.log('[resetPasswordWithOtp] Skipping reauthentication — user was auto-verified');
  }

  // Now update or link the email/password provider.
  const email = getHiddenEmail(phoneNumber);
  const emailCredential = firebase.auth.EmailAuthProvider.credential(email, password);

  try {
    await user.linkWithCredential(emailCredential);
  } catch (error: any) {
    if (
      error.code === 'auth/provider-already-linked' ||
      error.code === 'auth/email-already-in-use' ||
      // React Native Firebase sometimes returns auth/unknown for this case
      (error.code === 'auth/unknown' && error.message?.includes('already been linked'))
    ) {
      // Email provider exists — update the password directly.
      await user.updatePassword(password);
    } else {
      throw error;
    }
  }

  // Cache locally for fast same-device logins.
  await SecureStore.setItemAsync(getLocalPasswordKey(phoneNumber), password);
}

// ─── Signup: link email+password to the existing Phone Auth user ─────────────

/**
 * Called after OTP signup to create a password.
 * Links an Email/Password credential to the already signed-in Phone user.
 * This allows future cross-device logins without OTP.
 *
 * Requires "Email/Password" provider to be enabled in Firebase Console.
 *
 * @param phoneNumber – E.164 phone number
 * @param password    – plaintext password chosen by user
 */
export async function savePhonePassword(
  phoneNumber: string,
  password: string,
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated. Please complete OTP verification first.');

  const email = getHiddenEmail(phoneNumber);
  const credential = firebase.auth.EmailAuthProvider.credential(email, password);

  try {
    await user.linkWithCredential(credential);
  } catch (error: any) {
    // auth/provider-already-linked or auth/email-already-in-use means
    // user already set a password before — update the password instead.
    // Note: React Native Firebase sometimes returns auth/unknown for this case.
    if (
      error.code === 'auth/provider-already-linked' ||
      error.code === 'auth/email-already-in-use' ||
      (error.code === 'auth/unknown' && error.message?.includes('already been linked'))
    ) {
      // Update the existing password to the new one
      await user.updatePassword(password);
    } else {
      throw error;
    }
  }

  // Cache locally for fast same-device checks
  await SecureStore.setItemAsync(getLocalPasswordKey(phoneNumber), password);
}

// ─── Login: signIn with derived email + password ──────────────────────────────

/**
 * Login using phone + password.
 * No prior Firebase Auth session needed — works on any device.
 * Uses the hidden email derived from the phone number.
 *
 * Requires "Email/Password" provider to be enabled in Firebase Console.
 */
export async function loginWithPhonePassword(
  phoneNumber: string,
  password: string,
): Promise<{ uid: string; phoneNumber: string }> {
  const email = getHiddenEmail(phoneNumber);

  try {
    const cred = await auth.signInWithEmailAndPassword(email, password);

    // Refresh local cache
    await SecureStore.setItemAsync(getLocalPasswordKey(phoneNumber), password);

    return {
      uid: cred.user.uid,
      phoneNumber: cred.user.phoneNumber || phoneNumber,
    };
  } catch (error: any) {
    console.error('Email sign-in failed:', error.code, error.message);
    if (
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/invalid-credential'
    ) {
      throw new Error('Invalid mobile number or password.');
    }
    if (error.code === 'auth/operation-not-allowed') {
      throw new Error(
        'Login with password is not configured yet. Please contact support.',
      );
    }
    throw new Error('Login failed. Please try again.');
  }
}

// Re-export the FirebaseAuthTypes namespace for use elsewhere
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
export type { FirebaseAuthTypes };
