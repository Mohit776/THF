import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTranslation, type Language } from '@/src/i18n/translations';
import { CustomText as Text } from '../../components/CustomText';

const { width, height } = Dimensions.get('window');

const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'हिंदी (Hindi)' },
];

/** Translate using the *currently selected* language (not stored profile). */
function tFor(lang: Language, key: Parameters<typeof getTranslation>[0]) {
  return getTranslation(key, lang);
}

interface LanguageSelectScreenProps {
  onContinue?: (selected: string) => void;
}

const LANG_CACHE_KEY = 'selected_language';

export default function LanguageSelectScreen({ onContinue }: LanguageSelectScreenProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Language>('en');

  const handleContinue = async () => {
    // Persist selected language so MobileLogin & OTP use it immediately
    await AsyncStorage.setItem(LANG_CACHE_KEY, selected);
    if (onContinue) {
      onContinue(selected);
    } else {
      router.push('/welcome/MobileLogin');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Hero Image */}
      <View style={styles.imageContainer}>
        <Image
          source={require('../../assets/THF/top-hero.png')}
          style={styles.heroImage}
          contentFit="cover"
        />
        {/* Gradient overlay at the bottom of image */}
        <View style={styles.imageOverlay} />
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.header}>
          <Text style={styles.title}>{tFor(selected, 'selectLanguageTitle')}</Text>
        </View>

        {/* Language Options */}
        <View style={styles.optionsRow}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.id}
              style={[
                styles.optionButton,
                selected === lang.id && styles.optionButtonSelected,
              ]}
              onPress={() => setSelected(lang.id as Language)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.optionText,
                  selected === lang.id && styles.optionTextSelected,
                ]}
              >
                {lang.label}
              </Text>
              {selected === lang.id ? (
                <View style={styles.checkCircle}>
                  <Image
                    source={require('../../assets/THF/Check.svg')}
                    style={styles.checkIcon}
                    contentFit="contain"
                    tintColor="#fff"
                  />
                </View>
              ) : (
                <View style={styles.radioOuter} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Auth Buttons */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => handleContinue()}
          activeOpacity={0.85}
        >
          <Text style={styles.continueText}>{tFor(selected, 'continueBtn')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  /* ── Hero Image ── */
  imageContainer: {
    width: '100%',
    height: height * 0.6,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
 
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  /* ── Bottom Sheet ── */
  bottomSheet: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '400',
    color: '#2D3748',
    textAlign: 'center',
  },

  /* ── Language Options ── */
  optionsRow: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    height: 55,
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
  },
  optionButtonSelected: {
    borderColor: '#CBD5E0',
    backgroundColor: '#fff',
  },
  optionText: {
    fontSize: 17,
    color: '#718096',
    fontWeight: '400',
  },
  optionTextSelected: {
    color: '#4A5568',
    fontWeight: '500',
  },

  /* Radio Button */
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#718096',
    backgroundColor: '#fff',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    width: 14,
    height: 14,
  },

  /* Continue Button */
  continueButton: {
    backgroundColor: '#E53E3E',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  continueText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
