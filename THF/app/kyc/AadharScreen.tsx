import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const formatAadhar = (text: string): string => {
  const digits = text.replace(/\D/g, '').slice(0, 12);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
};

interface AadharScreenProps {
  onBack?: () => void;
  onUpload?: (aadharNumber: string) => void;
  onSkip?: () => void;
}

export default function AadharScreen({ onBack, onUpload, onSkip }: AadharScreenProps) {
  const router = useRouter();
  const [aadhar, setAadhar] = useState('');
  const [focused, setFocused] = useState(false);

  const rawDigits = aadhar.replace(/\s/g, '');
  const isValid = rawDigits.length === 12;

  const handleChange = (text: string) => {
    setAadhar(formatAadhar(text));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back */}
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

          {/* Heading */}
          <Text style={styles.heading}>Enter your Aadhar details</Text>
          <Text style={styles.subheading}>Upload your own documents for a faster process!</Text>

          {/* 👇 Replace with your Aadhar card image */}
          <View style={styles.cardContainer}>
            <Image
              source={require('../../assets/THF/aadhar_card.png')} // 👈 Replace with your image
              style={styles.cardImage}
              resizeMode="contain"
            />
          </View>

          {/* Aadhar Number Input */}
          <View style={[styles.inputWrapper, focused && styles.inputWrapperFocused]}>
            <Text style={[styles.floatLabel, focused && styles.floatLabelFocused]}>
              Enter Aadhar number
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={aadhar}
                onChangeText={handleChange}
                keyboardType="number-pad"
                placeholder="1234 1234 1234"
                placeholderTextColor="#bbb"
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                maxLength={14}
              />
              {isValid && (
                <View style={styles.checkCircle}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
              )}
            </View>
          </View>

          {/* Auth note */}
          <Text style={styles.authNote}>
            By clicking 'Continue' you give authorization to verify your Aadhar card.
          </Text>
        </ScrollView>

        {/* Bottom Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.uploadBtn, isValid && styles.uploadBtnActive]}
            onPress={() => {
              if (isValid) {
                if (onUpload) {
                  onUpload(rawDigits);
                } else {
                  router.push('/kyc/SelfieScreen');
                }
              }
            }}
            activeOpacity={isValid ? 0.85 : 1}
            disabled={!isValid}
          >
            <Text style={[styles.uploadText, isValid && styles.uploadTextActive]}>
              Upload Document
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() => {
              if (onSkip) {
                onSkip();
              } else {
                router.push('/kyc/SelfieScreen');
              }
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Skip, I'll do it letter</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 12 },

  backBtn: { paddingTop: 16, paddingBottom: 4, alignSelf: 'flex-start' },
  backArrow: { fontSize: 22, color: '#3b5bdb', fontWeight: '500' },

  heading: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 6, marginTop: 8 },
  subheading: { fontSize: 13, color: '#888', lineHeight: 20, marginBottom: 20 },

  /* Card Image */
  cardContainer: {
    width: '100%',
    backgroundColor: '#b0b8c8',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  cardImage: {
    width: width - 64,
    height: (width - 64) * 0.6,
  },

  /* Input */
  inputWrapper: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 6,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  inputWrapperFocused: { borderColor: '#E8304A' },
  floatLabel: { fontSize: 11, color: '#aaa', fontWeight: '500', letterSpacing: 0.3, marginBottom: 2 },
  floatLabelFocused: { color: '#E8304A' },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, fontSize: 16, color: '#111', paddingVertical: 4, letterSpacing: 1 },
  checkCircle: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#22a75a', alignItems: 'center', justifyContent: 'center',
  },
  checkMark: { color: '#fff', fontSize: 13, fontWeight: '700' },

  /* Auth note */
  authNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 8,
    paddingHorizontal: 10,
  },

  /* Footer */
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 8,
    backgroundColor: '#fff',
    gap: 14,
  },
  uploadBtn: {
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    backgroundColor: '#e8e8e8',
  },
  uploadBtnActive: {
    backgroundColor: '#E8304A',
    shadowColor: '#E8304A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  uploadText: { fontSize: 16, fontWeight: '600', color: '#aaa', letterSpacing: 0.3 },
  uploadTextActive: { color: '#fff' },

  skipBtn: { alignItems: 'center', paddingVertical: 4 },
  skipText: { fontSize: 14, color: '#E8304A', fontWeight: '500' },
});
