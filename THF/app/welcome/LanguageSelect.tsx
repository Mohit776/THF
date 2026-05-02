import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, StatusBar, StyleSheet, TouchableOpacity, View,  } from 'react-native';
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
          source={require('../../assets/THF/language-start.png')}
          style={styles.heroImage}
          contentFit="cover"
        />
        {/* Gradient overlay at the bottom of image */}
        <View style={styles.imageOverlay} />
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <Text style={styles.title}>{tFor(selected, 'selectLanguageTitle')}</Text>

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
                <Image
                  source={require('../../assets/THF/Check.svg')}
                  style={styles.checkIcon}
                  contentFit="contain"
                />
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
    height: height * 0.55,
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
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  /* ── Bottom Sheet ── */
  bottomSheet: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 20,
    letterSpacing: 0.1,
  },

  /* ── Language Options ── */
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  optionButtonSelected: {
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  optionText: {
    fontSize: 15,
    color: '#888',
    fontWeight: '400',
  },
  optionTextSelected: {
    color: '#1a1a1a',
    fontWeight: '500',
  },

  /* Radio Button */
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  checkIcon: {
    width: 22,
    height: 22,
  },

  /* Continue Button */
  continueButton: {
    backgroundColor: '#E8304A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#E8304A',
   
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
