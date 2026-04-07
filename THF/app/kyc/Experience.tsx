import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '@/src/services/firebaseConfig';
import { updateUserProfile, getUserProfile } from '@/src/services/userService';
import { useLanguage } from '@/src/hooks/useLanguage';

const PROFILE_CACHE_KEY = 'user_profile_cache';

const SELECTED_SVG = `<svg width="24" height="24" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0)">
<rect x="1.35" y="1.35" width="15.3" height="15.3" rx="7.65" fill="#03884B"/>
<g clip-path="url(#clip1)">
<path d="M5.5 9L8 11.5L13 6.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</g>
</g>
<defs>
<clipPath id="clip0"><rect width="18" height="18" fill="white"/></clipPath>
<clipPath id="clip1"><rect width="12" height="12" fill="white" transform="translate(3 3)"/></clipPath>
</defs>
</svg>`;

const OPTIONS = [
  'Hotel',
  'Hostels',
  'Canteen',
  'Houses',
  'Restaurant',
  'Pub & bar',
  'Other',
];

interface ExperienceScreenProps {
  onBack?: () => void;
  onContinue?: (selected: string[]) => void;
}

export default function ExperienceScreen({ onBack, onContinue }: ExperienceScreenProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      setSelected(selected.filter((item) => item !== option));
    } else {
      setSelected([...selected, option]);
    }
  };

  const handleContinue = async () => {
    if (selected.length === 0 || saving) return;

    if (onContinue) {
      onContinue(selected);
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert('Error', 'Not logged in. Please restart the app.');
      return;
    }

    setSaving(true);
    try {
      // Save experience tags to Firestore
      await updateUserProfile(uid, { experience: selected });

      // Update AsyncStorage cache
      const fresh = await getUserProfile(uid);
      if (fresh) await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(fresh));

      router.push('/kyc/Cuisines');
    } catch (err: any) {
      console.error('[ExperienceScreen] save error:', err);
      Alert.alert('Error', err?.message ?? 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const isSelected = (option: string) => selected.includes(option);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => {
          if (onBack) {
            onBack();
          } else {
            router.back();
          }
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Heading */}
        <Text style={styles.heading}>{t('expHeading')}</Text>
        <Text style={styles.subheading}>{t('expSub')}</Text>

        {/* Options */}
        <View style={styles.optionsList}>
          {OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionRow,
                isSelected(option) && styles.optionRowSelected,
              ]}
              onPress={() => toggleOption(option)}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, isSelected(option) && styles.optionTextSelected]}>
                {option}
              </Text>
              <View style={[styles.checkbox, isSelected(option) && styles.checkboxSelected]}>
                {isSelected(option)
                  ? <SvgXml xml={SELECTED_SVG} width={24} height={24} />
                  : null
                }
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, selected.length > 0 && !saving && styles.continueBtnActive]}
          onPress={handleContinue}
          activeOpacity={selected.length > 0 && !saving ? 0.85 : 1}
          disabled={selected.length === 0 || saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
              <Text style={[styles.continueText, selected.length > 0 && styles.continueTextActive]}>
                {t('continueBtn')}
              </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  /* Back */
  backBtn: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4, alignSelf: 'flex-start' },
  backArrow: {
    fontSize: 24,
    color: '#3b5bdb',
    fontWeight: '500',
  },

  /* Scroll */
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 16 },

  /* Heading */
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    marginBottom: 10,
    lineHeight: 32,
  },
  subheading: {
    fontSize: 13,
    color: '#888',
    lineHeight: 20,
    marginBottom: 28,
  },

  /* Options */
  optionsList: { gap: 10 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    backgroundColor: '#fff',
  },
  optionRowSelected: {
    // No red background or border when selected, keeps the same appearance as unselected
  },
  optionText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '400',
  },
  optionTextSelected: {
    color: '#444',
    fontWeight: '400',
  },

  /* Checkbox */
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#555',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxSelected: {
    borderWidth: 0,        // hide the grey ring — SVG draws its own circle
    backgroundColor: 'transparent',
  },

  /* Footer */
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
    backgroundColor: '#fff',
  },
  continueBtn: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#e8e8e8',
  },
  continueBtnActive: {
    backgroundColor: '#E8304A',
    shadowColor: '#E8304A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  continueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#aaa',
    letterSpacing: 0.3,
  },
  continueTextActive: { color: '#fff' },
});
