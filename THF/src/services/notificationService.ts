/**
 * src/services/notificationService.ts
 *
 * Push-notification helpers using expo-notifications.
 * Registers for Expo push tokens, stores them in Firestore,
 * and exposes helpers for scheduling local notifications.
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

// NOTE: setNotificationHandler is now configured in app/_layout.tsx
// so it runs at app startup regardless of which screen loads first.

// ---------------------------------------------------------------------------
// Register for push notifications & store token in Firestore
// ---------------------------------------------------------------------------

/**
 * Request permission, get Expo push token, and save it to the user's
 * Firestore document at `users/{uid}.expoPushToken`.
 *
 * Returns the token string, or `null` if registration fails.
 */
export async function registerForPushNotifications(
  uid: string,
): Promise<string | null> {
  try {
    // Must be a physical device
    if (!Device.isDevice) {
      console.warn('[notifications] Push notifications require a physical device');
      return null;
    }

    // Check / request permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[notifications] Permission not granted');
      return null;
    }

    // Get the native FCM (or APNs on iOS) device push token
    const tokenData = await Notifications.getDevicePushTokenAsync();
    const token = tokenData.data;
    console.log('[notifications] Device push token (FCM/APNs):', token);

    // Store token in Firestore as fcmToken
    await setDoc(
      doc(db, 'users', uid),
      { fcmToken: token },
      { merge: true },
    );
    console.log('[notifications] Device token saved to Firestore for uid:', uid);

    // Android: set notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#E8304A',
        sound: 'default',
      });
    }

    return token;
  } catch (error) {
    console.error('[notifications] Registration error:', error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Local notification helper
// ---------------------------------------------------------------------------

/**
 * Schedule an immediate local notification (useful for foreground alerts).
 */
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>,
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: 'default',
    },
    trigger: null, // fire immediately
  });
}
