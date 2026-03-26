import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '@/src/hooks/useLanguage';

const { width, height } = Dimensions.get('window');

const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'हिंदी (Hindi)' },
];

interface LanguageSelectScreenProps {
  onContinue?: (selected: string) => void;
}

export default function LanguageSelectScreen({ onContinue }: LanguageSelectScreenProps) {
  const router = useRouter();
  const [selected, setSelected] = useState('en');
  const { t } = useLanguage();

  const handleContinue = (mode: 'login' | 'signup') => {
    if (onContinue) {
      onContinue(selected);
    } else {
      router.push({
        pathname: '/welcome/MobileLogin',
        params: { mode },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Hero Image */}
      <View style={styles.imageContainer}>
        <Image
          source={require('../../assets/THF/language.png')} // Replace with your actual image path
          style={styles.heroImage}
          resizeMode="cover"
        />
        {/* Gradient overlay at the bottom of image */}
        <View style={styles.imageOverlay} />
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <Text style={styles.title}>{t('selectLanguageTitle')}</Text>

        {/* Language Options */}
        <View style={styles.optionsRow}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.id}
              style={[
                styles.optionButton,
                selected === lang.id && styles.optionButtonSelected,
              ]}
              onPress={() => setSelected(lang.id)}
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
              <View
                style={[
                  styles.radioOuter,
                  selected === lang.id && styles.radioOuterSelected,
                ]}
              >
                {selected === lang.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Auth Buttons */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => handleContinue('signup')}
          activeOpacity={0.85}
        >
          <Text style={styles.continueText}>{t('signUp')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => handleContinue('login')}
          activeOpacity={0.85}
        >
          <Text style={styles.loginText}>{t('login')}</Text>
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

  /* Continue Button */
  continueButton: {
    backgroundColor: '#E8304A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#E8304A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  loginButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8304A',
    marginTop: 12,
  },
  loginText: {
    color: '#E8304A',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
