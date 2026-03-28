/**
 * src/hooks/useLanguage.ts
 *
 * Lightweight hook that reads `profile.language` from the user store
 * and returns a `t(key)` translation function.
 *
 * Falls back to AsyncStorage `selected_language` key (set by LanguageSelect)
 * for pre-auth screens where no profile is loaded yet.
 *
 * Usage:
 *   const { t } = useLanguage();
 *   <Text>{t('myBookings')}</Text>
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { getTranslation, type Language, type TranslationKey } from '../i18n/translations';
import { useUserStore } from './useUserStore';

const LANG_CACHE_KEY = 'selected_language';

export function useLanguage() {
  const { profile } = useUserStore();
  const [cachedLang, setCachedLang] = useState<Language>('en');

  // If profile has a language set, use it; otherwise read from cache (pre-auth)
  const lang: Language = (profile?.language as Language) ?? cachedLang;

  useEffect(() => {
    // Only load from AsyncStorage if profile doesn't have a language
    if (!profile?.language) {
      AsyncStorage.getItem(LANG_CACHE_KEY).then((stored) => {
        if (stored === 'hi' || stored === 'en') {
          setCachedLang(stored);
        }
      });
    }
  }, [profile?.language]);

  function t(key: TranslationKey): string {
    return getTranslation(key, lang);
  }

  return { t, lang };
}
