/**
 * src/hooks/useLanguage.ts
 *
 * Lightweight hook that reads `profile.language` from the user store
 * and returns a `t(key)` translation function.
 *
 * Usage:
 *   const { t } = useLanguage();
 *   <Text>{t('myBookings')}</Text>
 */

import { useUserStore } from './useUserStore';
import { getTranslation, type Language, type TranslationKey } from '../i18n/translations';

export function useLanguage() {
  const { profile } = useUserStore();
  const lang: Language = (profile?.language as Language) ?? 'en';

  function t(key: TranslationKey): string {
    return getTranslation(key, lang);
  }

  return { t, lang };
}
