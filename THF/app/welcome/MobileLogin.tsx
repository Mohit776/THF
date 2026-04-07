import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { loginWithPhonePassword, sendOtp } from '@/lib/auth';
import { saveSession } from '@/src/services/sessionStorage';
import { getUserProfile, getUserProfileByPhone } from '@/src/services/userService';
import { useLanguage } from '@/src/hooks/useLanguage';

const { height } = Dimensions.get('window');

interface MobileLoginScreenProps {
  onGetStarted?: (mobile: string) => void;
}

export default function MobileLoginScreen({ onGetStarted }: MobileLoginScreenProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const params = useLocalSearchParams<{ mode?: 'login' | 'signup' }>();

  const mode = params.mode === 'login' ? 'login' : 'signup';
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValidMobile = mobile.trim().length >= 10;
  const isValidPassword = password.trim().length >= 6;
  const canContinue = mode === 'login' ? isValidMobile && isValidPassword : isValidMobile;

  const hasCompletedProfile = (profile: Awaited<ReturnType<typeof getUserProfile>>): boolean => {
    return profile !== null;
  };

  const handleGetStarted = async () => {
    if (!canContinue) return;

    if (onGetStarted) {
      onGetStarted(mobile.trim());
      return;
    }

    setLoading(true);
    try {
      const phoneNumber = `+91${mobile.trim()}`;
      if (mode === 'signup') {
        const existingProfile = await getUserProfileByPhone(phoneNumber);
        if (existingProfile) {
          Alert.alert(
            t('alreadyRegistered'),
            t('alreadyRegisteredMsg'),
            [
              {
                text: t('ok'),
                onPress: () =>
                  router.replace({
                    pathname: '/welcome/MobileLogin',
                    params: { mode: 'login' },
                  }),
              },
            ]
          );
          setLoading(false);
          return;
        }

        const verificationId = await sendOtp(phoneNumber);

        // Signup flow uses OTP verification.
        router.push({
          pathname: '/welcome/OTP',
          params: {
            verificationId,
            phoneNumber,
            mode: 'signup',
          },
        });
      } else {
        const result = await loginWithPhonePassword(phoneNumber, password.trim());
        await saveSession({ uid: result.uid, phoneNumber: result.phoneNumber });
        const existingProfile = await getUserProfile(result.uid);

        if (hasCompletedProfile(existingProfile)) {
          router.replace('/(tabs)/Dashboard');
        } else {
          router.replace('/kyc/Experience');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      Alert.alert(
        t('error'),
        error?.message ||
          t('failedSaveRetry'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        {/* Hero Image */}


        {/* Bottom Content */}
        <View style={styles.bottomSheet}>
          <Text style={styles.title}>
            {mode === 'login' ? t('loginWithMobile') : t('signUpWithMobile')}
          </Text>

          {/* Mobile Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.countryCode}>+91</Text>
            <View style={styles.separator} />
            <TextInput
              style={styles.input}
              placeholder={t('enterMobileNumber')}
              placeholderTextColor="#b0b0b0"
              keyboardType="phone-pad"
              maxLength={10}
              value={mobile}
              onChangeText={setMobile}
              returnKeyType="done"
              onSubmitEditing={handleGetStarted}
              editable={!loading}
            />
          </View>

          {mode === 'login' && (
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder={t('enterPassword')}
                placeholderTextColor="#b0b0b0"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                returnKeyType="done"
                onSubmitEditing={handleGetStarted}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color="#000000"
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Forgot Password Link (login mode only) */}
          {mode === 'login' && (
            <TouchableOpacity
              onPress={() => router.push('/welcome/ForgotPassword' as any)}
              disabled={loading}
              style={styles.forgotPasswordBtn}
            >
              <Text style={styles.forgotPasswordText}>{t('forgotPassword')}</Text>
            </TouchableOpacity>
          )}

          {/* Get Started Button */}
          <TouchableOpacity
            style={[styles.button, canContinue && !loading ? styles.buttonActive : styles.buttonDisabled]}
            onPress={handleGetStarted}
            activeOpacity={canContinue && !loading ? 0.85 : 1}
            disabled={!canContinue || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={[styles.buttonText, canContinue ? styles.buttonTextActive : styles.buttonTextDisabled]}>
                {mode === 'login' ? t('login') : t('getStarted2')}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              router.replace({
                pathname: '/welcome/MobileLogin',
                params: { mode: mode === 'login' ? 'signup' : 'login' },
              })
            }
            disabled={loading}
            style={styles.switchModeBtn}
          >
            <Text style={styles.switchModeText}>
              {mode === 'login' ? t('dontHaveAccount') : t('alreadyHaveAccount')}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flex: {
    flex: 1,
  },

  /* ── Hero Image ── */
  imageContainer: {
    width: '100%',
    height: height * 0.65,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },

  /* ── Back Btn ── */
  backBtn: {
    paddingHorizontal: 24,
    paddingTop: 16,
    alignSelf: 'flex-start',
    zIndex: 10,
  },
  backArrow: {
    fontSize: 24,
    color: '#3b5bdb',
    fontWeight: '500',
  },

  /* ── Bottom Sheet ── */
  bottomSheet: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 24,
    marginTop: 100,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 20,
    letterSpacing: 0.1,
  },

  /* ── Input ── */
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: '#CCC',
    marginHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    height: '100%',
  },
  eyeIcon: {
    paddingLeft: 8,
  },

  /* ── Button ── */
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#E8304A',
    shadowColor: '#E8304A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#e8e8e8',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  buttonTextActive: {
    color: '#fff',
  },
  buttonTextDisabled: {
    color: '#aaa',
  },
  forgotPasswordBtn: {
    alignSelf: 'flex-end',
    marginBottom: 8,
    marginTop: -8,
  },
  forgotPasswordText: {
    color: '#E8304A',
    fontSize: 13,
    fontWeight: '500',
  },
  switchModeBtn: {
    marginTop: 16,
    alignItems: 'center',
  },
  switchModeText: {
    color: '#E8304A',
    fontSize: 14,
    fontWeight: '500',
  },
});
