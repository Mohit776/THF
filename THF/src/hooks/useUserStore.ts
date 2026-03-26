/**
 * src/hooks/useUserStore.ts
 *
 * Central reactive store for the authenticated partner's profile.
 *
 * Strategy:
 *  - On mount: immediately serve data from AsyncStorage (instant UI)
 *  - Then: hydrate from Firestore and write-back to AsyncStorage cache
 *  - All writes go to Firestore first, then update the cache + local state
 *
 * Usage:
 *   const { profile, loading, updateProfile } = useUserStore();
 */

import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '@/src/services/firebaseConfig';
import {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  type UserProfile,
} from '@/src/services/userService';

const CACHE_KEY = 'user_profile_cache';

const profileListeners = new Set<(profile: UserProfile | null) => void>();

function notifyProfileListeners(p: UserProfile | null) {
  profileListeners.forEach((l) => l(p));
}

export interface UseUserStoreReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  /** Refresh from Firestore and update cache */
  refresh: () => Promise<void>;
  /** Partial update — writes to Firestore then updates cache */
  updateProfile: (data: Partial<Omit<UserProfile, 'userId' | 'createdAt'>>) => Promise<void>;
  /** Create profile for first-time users (called after OTP verification) */
  initProfile: (data: Omit<UserProfile, 'userId' | 'createdAt' | 'kycStatus'>) => Promise<void>;
}

export function useUserStore(): UseUserStoreReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Load from cache first, then hydrate from Firestore ──────────────
  useEffect(() => {
    let cancelled = false;

    // Listen for cross-component profile updates
    const listener = (newProfile: UserProfile | null) => {
      if (!cancelled) {
        setProfile((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(newProfile)) return prev;
          return newProfile ? { ...newProfile } : null;
        });
      }
    };
    profileListeners.add(listener);

    async function load() {
      try {
        // 1. Serve cache immediately for instant UI
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached && !cancelled) {
          const parsed = JSON.parse(cached);
          setProfile(parsed);
          notifyProfileListeners(parsed);
          setLoading(false);
        }

        // 2. Fetch fresh data from Firestore
        const uid = auth.currentUser?.uid;
        if (!uid) {
          if (!cancelled) setLoading(false);
          return;
        }

        const fresh = await getUserProfile(uid);
        if (!cancelled) {
          setProfile(fresh);
          notifyProfileListeners(fresh);
          setLoading(false);
          if (fresh) {
            await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(fresh));
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? 'Failed to load profile');
          setLoading(false);
        }
      }
    }

    load();
    return () => { 
      cancelled = true; 
      profileListeners.delete(listener);
    };
  }, []);

  // ── Refresh from Firestore ───────────────────────────────────────────
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const fresh = await getUserProfile(uid);
      setProfile(fresh);
      notifyProfileListeners(fresh);
      if (fresh) await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(fresh));
    } catch (err: any) {
      setError(err?.message ?? 'Refresh failed');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Partial update ───────────────────────────────────────────────────
  const updateProfile = useCallback(
    async (data: Partial<Omit<UserProfile, 'userId' | 'createdAt'>>) => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) throw new Error('Not authenticated');
        await updateUserProfile(uid, data);

        // Optimistic local update
        setProfile((prev) => {
          if (!prev) return prev;
          const updated = { ...prev, ...data };
          AsyncStorage.setItem(CACHE_KEY, JSON.stringify(updated));
          
          // Use setTimeout to ensure we don't trigger state updates on unmounted components inside the same cycle
          setTimeout(() => notifyProfileListeners(updated), 0);
          
          return updated;
        });
      } catch (err: any) {
        setError(err?.message ?? 'Update failed');
        throw err;
      }
    },
    [],
  );

  // ── Init profile (first login) ───────────────────────────────────────
  const initProfile = useCallback(
    async (data: Omit<UserProfile, 'userId' | 'createdAt' | 'kycStatus'>) => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) throw new Error('Not authenticated');
        await createUserProfile(uid, data);
        await refresh();
      } catch (err: any) {
        setError(err?.message ?? 'Profile creation failed');
        throw err;
      }
    },
    [refresh],
  );

  return { profile, loading, error, refresh, updateProfile, initProfile };
}

/** One-shot helper to clear the local profile cache (e.g. on sign-out) */
export async function clearUserCache() {
  await AsyncStorage.removeItem(CACHE_KEY);
}
