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

import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { loginWithPhonePassword, sendOtp } from '@/lib/auth';
import { saveSession } from '@/src/services/sessionStorage';
import { getUserProfile, getUserProfileByPhone } from '@/src/services/userService';

const { height } = Dimensions.get('window');

interface MobileLoginScreenProps {
  onGetStarted?: (mobile: string) => void;
}

export default function MobileLoginScreen({ onGetStarted }: MobileLoginScreenProps) {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: 'login' | 'signup' }>();

  const mode = params.mode === 'login' ? 'login' : 'signup';
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidMobile = mobile.trim().length >= 10;
  const isValidPassword = password.trim().length >= 8;
  const canContinue = mode === 'login' ? isValidMobile && isValidPassword : isValidMobile;

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
            'Already Registered',
            'This mobile number is already registered. Please login instead.',
            [
              {
                text: 'OK',
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
        'Error',
        error?.message ||
          'Authentication failed. If you are logging in on a new device, complete signup OTP once to link this device, then login with password.',
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
        {/* Hero Image */}


        {/* Bottom Content */}
        <View style={styles.bottomSheet}>
          <Text style={styles.title}>
            {mode === 'login' ? 'Login with mobile and password' : 'Sign up with mobile number'}
          </Text>

          {/* Mobile Input */}
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Enter your mobile number"
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
                placeholder="Enter your password"
                placeholderTextColor="#b0b0b0"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                returnKeyType="done"
                onSubmitEditing={handleGetStarted}
                editable={!loading}
              />
            </View>
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
                {mode === 'login' ? 'Login' : 'Get Started'}
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
              {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Login'}
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
    marginBottom: 16,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1a1a1a',
    backgroundColor: '#fff',
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
