import React, { useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, KeyboardAvoidingView, Platform, StatusBar, StyleSheet, TextInput, TouchableOpacity, View,  } from 'react-native';

import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { sendOtp } from '@/lib/auth';
import { getUserProfileByPhone } from '@/src/services/userService';
import { useLanguage } from '@/src/hooks/useLanguage';
import { Image } from 'expo-image';
import { CustomText as Text } from '../../components/CustomText';

const { height } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidMobile = mobile.trim().length >= 10;

  const handleSendOtp = async () => {
    if (!isValidMobile || loading) return;

    setLoading(true);
    try {
      const phoneNumber = `+91${mobile.trim()}`;

      // Verify user is registered before sending OTP
      const existingProfile = await getUserProfileByPhone(phoneNumber);
      if (!existingProfile) {
        Alert.alert(
          t('notRegistered'),
          t('notRegisteredMsg'),
          [
            {
              text: t('ok'),
              onPress: () =>
                router.replace({
                  pathname: '/welcome/MobileLogin',
                  params: { mode: 'signup' },
                }),
            },
          ]
        );
        setLoading(false);
        return;
      }

      // Track if auto-verification happened (Android same device)
      let autoVerifyHandled = false;

      const verificationId = await sendOtp(
        phoneNumber,
        async (autoVerifiedUser) => {
          // Android auto-verified the OTP on same device!
          autoVerifyHandled = true;
          console.log('[ForgotPassword] Auto-verified, skipping OTP screen');
          router.replace({
            pathname: '/welcome/ResetPassword',
            params: {
              phoneNumber,
              mode: 'forgot_password',
            },
          });
        },
      );

      // Only navigate to OTP screen if auto-verification didn't handle it
      if (!autoVerifyHandled) {
        router.push({
          pathname: '/welcome/OTP',
          params: {
            verificationId,
            phoneNumber,
            mode: 'forgot_password',
          },
        });
      }
    } catch (error: any) {
      console.error('Forgot password OTP error:', error);
      Alert.alert(
        t('error'),
        error?.message || t('failedResendOtp'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Image source={require('../../assets/THF/left.svg')} style={{ width: 24, height: 24 }} contentFit="contain" />
          </TouchableOpacity>

          {/* Title & Subtitle */}
          <Text style={styles.title}>{t('forgotPasswordTitle')}</Text>
          <Text style={styles.subtitle}>{t('forgotPasswordSub')}</Text>

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
              onSubmitEditing={handleSendOtp}
              editable={!loading}
            />
          </View>

          {/* Send OTP Button */}
          <TouchableOpacity
            style={[
              styles.button,
              isValidMobile && !loading
                ? styles.buttonActive
                : styles.buttonDisabled,
            ]}
            onPress={handleSendOtp}
            activeOpacity={isValidMobile && !loading ? 0.85 : 1}
            disabled={!isValidMobile || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text
                style={[
                  styles.buttonText,
                  isValidMobile
                    ? styles.buttonTextActive
                    : styles.buttonTextDisabled,
                ]}
              >
                {t('sendOtp')}
              </Text>
            )}
          </TouchableOpacity>

          {/* Back to Login */}
          <TouchableOpacity
            onPress={() =>
              router.replace({
                pathname: '/welcome/MobileLogin',
                params: { mode: 'login' },
              })
            }
            disabled={loading}
            style={styles.backToLoginBtn}
          >
            <Text style={styles.backToLoginText}>{t('backToLogin')}</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },

  /* Back */
  backBtn: {
    marginBottom: 24,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  backArrow: {
    fontSize: 24,
    color: '#3b5bdb',
    fontWeight: '500',
  },

  /* Title */
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    lineHeight: 21,
    marginBottom: 32,
  },

  /* Input */
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 24,
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

  /* Button */
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

  /* Back to Login */
  backToLoginBtn: {
    marginTop: 16,
    alignItems: 'center',
  },
  backToLoginText: {
    color: '#1E62F7',
    fontSize: 14,
    fontWeight: '500',
  },
});
