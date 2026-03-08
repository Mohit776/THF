import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  TouchableOpacity,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

interface OTPScreenProps {
  phoneNumber?: string;
  onVerify?: (otp: string) => void;
  onBack?: () => void;
}

export default function OTPScreen({ phoneNumber = '+91 99278204579', onVerify, onBack }: OTPScreenProps) {
  const router = useRouter();
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [whatsapp, setWhatsapp] = useState(true);
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (timer === 0) { setCanResend(true); return; }
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const handleResend = () => {
    if (!canResend) return;
    setOtp(Array(OTP_LENGTH).fill(''));
    setFocusedIndex(0);
    inputRefs.current[0]?.focus();
    setTimer(RESEND_SECONDS);
    setCanResend(false);
  };

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    }
  };

  const isComplete = otp.every((d) => d !== '');

  const handleVerify = () => {
    if (isComplete) {
      if (onVerify) {
        onVerify(otp.join(''));
      } else {
        router.replace('/kyc/DetailsScreen');
      }
    }
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.inner}>
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

          {/* Heading */}
          <Text style={styles.heading}>Enter the 6 digit OTP</Text>
          <Text style={styles.subheading}>
            Enter the six digit code we have sent to{'\n'}
            <Text style={styles.phone}>{phoneNumber}</Text>
          </Text>

          {/* OTP Boxes */}
          <View style={styles.otpRow}>
            {Array(OTP_LENGTH).fill(0).map((_, i) => (
              <TextInput
                key={i}
                ref={(r) => { inputRefs.current[i] = r; }}
                style={[
                  styles.otpBox,
                  focusedIndex === i && styles.otpBoxFocused,
                  otp[i] ? styles.otpBoxFilled : null,
                ]}
                value={otp[i]}
                onChangeText={(t) => handleChange(t, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                onFocus={() => setFocusedIndex(i)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                caretHidden
              />
            ))}
          </View>

          {/* Resend */}
          <Text style={styles.resendText}>
            {"Didn't get the OTP? "}
            {canResend ? (
              <Text style={styles.resendLink} onPress={handleResend}>
                Resend SMS
              </Text>
            ) : (
              <Text style={styles.resendTimer}>
                Resend SMS in 00:{pad(timer)}
              </Text>
            )}
          </Text>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottom}>
          {/* WhatsApp Checkbox */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setWhatsapp((v) => !v)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, whatsapp && styles.checkboxChecked]}>
              {whatsapp && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Get updates on Whatsapp</Text>
          </TouchableOpacity>

          {/* Verify Button */}
          <TouchableOpacity
            style={[styles.verifyBtn, isComplete && styles.verifyBtnActive]}
            onPress={handleVerify}
            activeOpacity={isComplete ? 0.85 : 1}
            disabled={!isComplete}
          >
            <Text style={[styles.verifyText, isComplete && styles.verifyTextActive]}>
              Verify
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },

  /* Back */
  backBtn: { marginBottom: 24, marginTop: 12, alignSelf: 'flex-start' },
  backArrow: { fontSize: 36, color: '#3b5bdb', fontWeight: '800' },

  /* Heading */
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  subheading: {
    fontSize: 14,
    color: '#555',
    lineHeight: 21,
    marginBottom: 32,
  },
  phone: { color: '#111', fontWeight: '500' },

  /* OTP Row */
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpBox: {
    width: 48,
    height: 54,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#ddd',
    fontSize: 20,
    fontWeight: '600',
    color: '#111',
    backgroundColor: '#fff',
  },
  otpBoxFocused: {
    borderColor: '#E8304A',
    borderWidth: 2,
  },
  otpBoxFilled: {
    borderColor: '#ccc',
  },

  /* Resend */
  resendText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#555',
  },
  resendTimer: { color: '#555', fontWeight: '500' },
  resendLink: { color: '#3b5bdb', fontWeight: '600' },

  /* Bottom */
  bottom: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 16,
  },

  /* Checkbox */
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#5c6bc0',
    borderColor: '#5c6bc0',
  },
  checkmark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '400',
  },

  /* Verify Button */
  verifyBtn: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#e8e8e8',
  },
  verifyBtnActive: {
    backgroundColor: '#E8304A',
    shadowColor: '#E8304A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  verifyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#aaa',
    letterSpacing: 0.3,
  },
  verifyTextActive: {
    color: '#fff',
  },
});
