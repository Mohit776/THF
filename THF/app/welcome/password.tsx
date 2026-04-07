import { savePhonePassword } from '@/lib/auth';
import { useLanguage } from '@/src/hooks/useLanguage';
import { auth } from '@/src/services/firebaseConfig';
import { saveSession } from '@/src/services/sessionStorage';
import { getUserProfile } from '@/src/services/userService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
const EyeIcon = ({ stroke = "#6B7280" }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M12 16.01C14.2091 16.01 16 14.2191 16 12.01C16 9.80087 14.2091 8.01001 12 8.01001C9.79086 8.01001 8 9.80087 8 12.01C8 14.2191 9.79086 16.01 12 16.01Z" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M2 11.98C8.09 1.31996 15.91 1.32996 22 11.98" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M22 12.01C15.91 22.67 8.09 22.66 2 12.01" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const EyeOffIcon = ({ stroke = "#6B7280" }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M14.83 9.17999C14.2706 8.61995 13.5576 8.23846 12.7813 8.08386C12.0049 7.92926 11.2002 8.00851 10.4689 8.31152C9.73758 8.61453 9.11264 9.12769 8.67316 9.78607C8.23367 10.4444 7.99938 11.2184 8 12.01C7.99916 13.0663 8.41619 14.08 9.16004 14.83" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 16.01C13.0609 16.01 14.0783 15.5886 14.8284 14.8384C15.5786 14.0883 16 13.0709 16 12.01" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M17.61 6.39004L6.38 17.62C4.6208 15.9966 3.14099 14.0944 2 11.99C6.71 3.76002 12.44 1.89004 17.61 6.39004Z" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M20.9994 3L17.6094 6.39" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M6.38 17.62L3 21" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M19.5695 8.42999C20.4801 9.55186 21.2931 10.7496 21.9995 12.01C17.9995 19.01 13.2695 21.4 8.76953 19.23" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
export default function CreatePasswordScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const params = useLocalSearchParams<{ phoneNumber?: string }>();
  const phoneNumber = params.phoneNumber ?? auth.currentUser?.phoneNumber ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedPassword, setFocusedPassword] = useState(false);
  const [focusedConfirm, setFocusedConfirm] = useState(false);

  const isPasswordValid = password.length >= 6;
  const passwordsMatch = isPasswordValid && password === confirmPassword;
  const canContinue = passwordsMatch;

  const hasCompletedProfile = (profile: Awaited<ReturnType<typeof getUserProfile>>): boolean => {
    if (!profile) return false;
    return Boolean(
      profile.name?.trim() &&
      profile.email?.trim() &&
      profile.phone?.trim() &&
      profile.emergencyPhone?.trim() &&
      profile.gender?.trim() &&
      profile.city?.trim() &&
      profile.address?.trim() &&
      Array.isArray(profile.experience) &&
      profile.experience.length > 0,
    );
  };

  const handleContinue = async () => {
    if (!canContinue || loading) return;
    if (!phoneNumber) {
      Alert.alert(t('error'), t('phoneMissing'));
      return;
    }

    setLoading(true);
    try {
      await savePhonePassword(phoneNumber, password);

      const uid = auth.currentUser?.uid;
      if (!uid) {
        Alert.alert(t('error'), t('sessionExpired'));
        return;
      }

      await saveSession({ uid, phoneNumber });

      const profile = await getUserProfile(uid);
      if (hasCompletedProfile(profile)) router.replace('/(tabs)/Dashboard');
      else router.replace('/kyc/Experience');
    } catch (error: any) {
      Alert.alert(t('error'), error?.message ?? t('couldNotSavePassword'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        {/* Back Arrow */}
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>{t('createPasswordTitle')}</Text>

        {/* Password Field */}
        <View style={[styles.inputWrapper, focusedPassword && styles.inputWrapperFocused]}>
          <Text
            style={[
              styles.floatingLabel,
              (focusedPassword || password.length > 0) && styles.floatingLabelFocused,
            ]}
          >
            {t('newPassword')}
          </Text>
          <TextInput
            style={styles.input}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            onFocus={() => setFocusedPassword(true)}
            onBlur={() => setFocusedPassword(false)}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable
            onPress={() => setShowPassword((v) => !v)}
            style={styles.eyeButton}
            hitSlop={8}
          >
            {showPassword ? <EyeOffIcon stroke="#aaa" /> : <EyeIcon stroke="#aaa" />}
          </Pressable>
        </View>
        <Text style={styles.passwordNote}>
          {t('passwordNote')}
        </Text>



        {/* Confirm Password Field */}
        <View style={[styles.inputWrapper, styles.inputWrapperMarginTop, focusedConfirm && styles.inputWrapperFocused]}>
          <Text
            style={[
              styles.floatingLabel,
              (focusedConfirm || confirmPassword.length > 0) && styles.floatingLabelFocused,
            ]}
          >
            {t('confirmPassword')}
          </Text>
          <TextInput
            style={styles.input}
            secureTextEntry={!showConfirm}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onFocus={() => setFocusedConfirm(true)}
            onBlur={() => setFocusedConfirm(false)}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable
            onPress={() => setShowConfirm((v) => !v)}
            style={styles.eyeButton}
            hitSlop={8}
          >
            {showConfirm ? <EyeOffIcon stroke="#aaa" /> : <EyeIcon stroke="#aaa" />}
          </Pressable>
        </View>

        {/* Mismatch hint */}
        {confirmPassword.length > 0 && !passwordsMatch && (
          <Text style={styles.mismatchText}>{t('passwordMismatch')}</Text>
        )}

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.continueButton, canContinue && styles.continueButtonActive]}
          activeOpacity={canContinue && !loading ? 0.8 : 1}
          disabled={!canContinue || loading}
          onPress={handleContinue}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text
              style={[
                styles.continueText,
                canContinue && styles.continueTextActive,
              ]}
            >
              {t('continueBtn')}
            </Text>
          )}
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footerText}>
          {t('footerLegal')}{'\n'}
          Tracto Healthcare{' '}
          <Text style={styles.footerLink}>{t('termsConditions')}</Text>,{' '}
          <Text style={styles.footerLink}>{t('privacyPolicy')}</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    marginBottom: 20,
  },
  backArrow: {
    fontSize: 24,
    color: '#3b5bdb',
    fontWeight: '500',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 28,
    letterSpacing: -0.3,
  },

  // Input
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 56,
    backgroundColor: '#fff',
    position: 'relative',
    justifyContent: 'center',
  },
  inputWrapperFocused: {
    borderColor: '#E8304A',
  },
  inputWrapperMarginTop: {
    marginTop: 20,
  },
  floatingLabel: {
    position: 'absolute',
    left: 14,
    top: 18,
    fontSize: 16,
    color: '#aaa',
    zIndex: 1,
    backgroundColor: '#fff',
  },
  floatingLabelFocused: {
    top: -10,
    fontSize: 12,
    color: '#E8304A',
    fontWeight: '500',
    paddingHorizontal: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 0,
    height: 24,
  },
  eyeButton: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 16,
    opacity: 0.6,
  },
  passwordNote: {
    fontSize: 12,
    color: '#6B7281',
    marginTop: 6,
    marginLeft: 4,
    fontStyle: 'italic',
  },



  // Mismatch
  mismatchText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
    marginLeft: 4,
  },

  // Continue Button
  continueButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },
  continueButtonActive: {
    backgroundColor: '#E8304A',
  },
  continueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  continueTextActive: {
    color: '#FFFFFF',
  },

  // Footer
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
  footerLink: {
    color: '#E8304A',
    fontWeight: '500',
  },
});