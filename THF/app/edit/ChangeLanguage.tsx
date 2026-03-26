import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { auth } from '@/src/services/firebaseConfig';
import { useUserStore } from '@/src/hooks/useUserStore';
import { useLanguage } from '@/src/hooks/useLanguage';

const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'हिंदी (Hindi)' },
];

interface ChangeLanguageScreenProps {
  initialLanguage?: string;
  onSave?: (language: string) => void;
}

export default function ChangeLanguageScreen({
  initialLanguage = 'en',
  onSave,
}: ChangeLanguageScreenProps) {
  const [selected, setSelected] = useState<string>(initialLanguage);
  const router = useRouter();
  const { t } = useLanguage();
  const { profile, updateProfile } = useUserStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.language) {
      setSelected(profile.language);
    }
    setLoading(false);
  }, [profile?.language]);

  const handleSave = async () => {
    if (saving) return;

    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert(t('error'), t('notLoggedIn'));
      return;
    }

    setSaving(true);
    try {
      await updateProfile({ language: selected });
      if (onSave) onSave(selected);
      Alert.alert(t('savedTitle'), t('savedMsg'), [
        { text: t('ok'), onPress: () => router.back() }
      ]);
    } catch (err: any) {
      console.error('[ChangeLanguageScreen] error:', err);
      Alert.alert(t('error'), err?.message ?? t('failedUpdateLang'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color="#E8304A" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />

       <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => router.back()}
                  activeOpacity={0.7}
                >
                  <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.heading}>{t('changeLanguage')}</Text>

        <View style={styles.optionsList}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.id}
              style={styles.optionRow}
              onPress={() => setSelected(lang.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.optionLabel}>{lang.label}</Text>

              {/* Radio */}
              <View style={[styles.radioOuter, selected === lang.id && styles.radioOuterSelected]}>
                {selected === lang.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Save & Update Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveText}>{t('saveUpdate')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 20,
  },

  /* Options */
  optionsList: {
    gap: 10,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  optionLabel: {
    fontSize: 15,
    color: '#555',
    fontWeight: '400',
  },

  /* Radio */
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#E8304A',
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: '#E8304A',
  },

   backBtn: { paddingTop: 16, paddingBottom: 4, paddingLeft: 20, alignSelf: 'flex-start' },
   backArrow: { fontSize: 22, color: '#3b5bdb', fontWeight: '500' },

  /* Footer */
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
  },
  saveBtn: {
    backgroundColor: '#E8304A',
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: '#E8304A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
