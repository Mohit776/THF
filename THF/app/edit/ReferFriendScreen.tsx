import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

interface ReferFriendScreenProps {
  onGenerate?: (data: { name: string; contact: string; email: string }) => void;
}

export default function ReferFriendScreen({ onGenerate }: ReferFriendScreenProps) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const isValid = name.trim().length > 0 && contact.trim().length >= 10;

  const handleGenerate = () => {
    if (isValid && onGenerate) {
      onGenerate({ name: name.trim(), contact: contact.trim(), email: email.trim() });
    }
  };

  const inputStyle = (field: string) => [
    styles.input,
    focusedField === field && styles.inputFocused,
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <Text style={styles.heading}>Refer a friend</Text>

          {/* Friend Name */}
          <TextInput
            style={inputStyle('name')}
            placeholder="Enter friend name"
            placeholderTextColor="#b0b0b0"
            value={name}
            onChangeText={setName}
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField(null)}
            returnKeyType="next"
          />

          {/* Contact Number */}
          <TextInput
            style={inputStyle('contact')}
            placeholder="Contact number"
            placeholderTextColor="#b0b0b0"
            value={contact}
            onChangeText={setContact}
            onFocus={() => setFocusedField('contact')}
            onBlur={() => setFocusedField(null)}
            keyboardType="phone-pad"
            maxLength={15}
            returnKeyType="next"
          />

          {/* Email (optional) */}
          <TextInput
            style={inputStyle('email')}
            placeholder="Email id (optional)"
            placeholderTextColor="#b0b0b0"
            value={email}
            onChangeText={setEmail}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={handleGenerate}
          />
        </View>

        {/* Generate Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.generateBtn, isValid && styles.generateBtnActive]}
            onPress={handleGenerate}
            activeOpacity={isValid ? 0.85 : 1}
            disabled={!isValid}
          >
            <Text style={[styles.generateText, isValid && styles.generateTextActive]}>
              Generate Referral Link
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

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 20,
  },

  /* Inputs */
  input: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#111',
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  inputFocused: {
    borderColor: '#E8304A',
  },

  /* Footer */
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
  },
  generateBtn: {
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    backgroundColor: '#e8e8e8',
  },
  generateBtnActive: {
    backgroundColor: '#E8304A',
    shadowColor: '#E8304A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  generateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#aaa',
    letterSpacing: 0.3,
  },
  generateTextActive: {
    color: '#fff',
  },
});
