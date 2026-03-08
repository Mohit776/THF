import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

interface MobileLoginScreenProps {
  onGetStarted?: (mobile: string) => void;
}

export default function MobileLoginScreen({ onGetStarted }: MobileLoginScreenProps) {
  const router = useRouter();
  const [mobile, setMobile] = useState('');

  const isValid = mobile.trim().length >= 10;

  const handleGetStarted = () => {
    if (isValid) {
      if (onGetStarted) {
        onGetStarted(mobile.trim());
      } else {
        router.push('/welcome/OTPScreen');
      }
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
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/THF/login.png')} // Replace with your image path
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        {/* Bottom Content */}
        <View style={styles.bottomSheet}>
          <Text style={styles.title}>Please enter mobile number</Text>

          {/* Mobile Input */}
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Enter your mobile number"
              placeholderTextColor="#b0b0b0"
              keyboardType="phone-pad"
              maxLength={15}
              value={mobile}
              onChangeText={setMobile}
              returnKeyType="done"
              onSubmitEditing={handleGetStarted}
            />
          </View>

          {/* Get Started Button */}
          <TouchableOpacity
            style={[styles.button, isValid ? styles.buttonActive : styles.buttonDisabled]}
            onPress={handleGetStarted}
            activeOpacity={isValid ? 0.85 : 1}
            disabled={!isValid}
          >
            <Text style={[styles.buttonText, isValid ? styles.buttonTextActive : styles.buttonTextDisabled]}>
              Get Started
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
});
