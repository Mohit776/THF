import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

interface AccountDetailsScreenProps {
  onSave?: (data: {
    accountNumber: string;
    ifsc: string;
    bankName: string;
    upiId: string;
  }) => void;
}

export default function AccountDetailsScreen({ onSave }: AccountDetailsScreenProps) {
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [bankName, setBankName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const isValid =
    accountNumber.trim().length > 0 &&
    ifsc.trim().length > 0 &&
    bankName.trim().length > 0;

  const handleSave = () => {
    if (isValid && onSave) {
      onSave({ accountNumber, ifsc, bankName, upiId });
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
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Bank Account Section ── */}
          <Text style={styles.sectionHeading}>Account details</Text>

          <TextInput
            style={inputStyle('account')}
            placeholder="Bank account number"
            placeholderTextColor="#b0b0b0"
            value={accountNumber}
            onChangeText={setAccountNumber}
            keyboardType="number-pad"
            onFocus={() => setFocusedField('account')}
            onBlur={() => setFocusedField(null)}
            returnKeyType="next"
          />

          <TextInput
            style={inputStyle('ifsc')}
            placeholder="IFSC / MICR Code"
            placeholderTextColor="#b0b0b0"
            value={ifsc}
            onChangeText={(t) => setIfsc(t.toUpperCase())}
            autoCapitalize="characters"
            onFocus={() => setFocusedField('ifsc')}
            onBlur={() => setFocusedField(null)}
            returnKeyType="next"
          />

          <TextInput
            style={inputStyle('bank')}
            placeholder="Bank name"
            placeholderTextColor="#b0b0b0"
            value={bankName}
            onChangeText={setBankName}
            onFocus={() => setFocusedField('bank')}
            onBlur={() => setFocusedField(null)}
            returnKeyType="next"
          />

          {/* ── UPI Section ── */}
          <Text style={[styles.sectionHeading, { marginTop: 24 }]}>UPI detail</Text>

          <TextInput
            style={inputStyle('upi')}
            placeholder="UPI id"
            placeholderTextColor="#b0b0b0"
            value={upiId}
            onChangeText={setUpiId}
            autoCapitalize="none"
            onFocus={() => setFocusedField('upi')}
            onBlur={() => setFocusedField(null)}
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />

          <Text style={styles.upiHint}>
            The UPI ID is in the format of name/phone number @bank number.
          </Text>

          <View style={{ height: 16 }} />
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveBtn, isValid && styles.saveBtnActive]}
            onPress={handleSave}
            activeOpacity={isValid ? 0.85 : 1}
            disabled={!isValid}
          >
            <Text style={[styles.saveText, isValid && styles.saveTextActive]}>
              Save and Update
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
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8 },

  sectionHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 16,
  },

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

  upiHint: {
    fontSize: 12,
    color: '#999',
    lineHeight: 18,
    marginTop: 2,
  },

  footer: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 10,
    backgroundColor: '#fff',
  },
  saveBtn: {
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    backgroundColor: '#e8e8e8',
  },
  saveBtnActive: {
    backgroundColor: '#E8304A',
    shadowColor: '#E8304A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#aaa',
    letterSpacing: 0.3,
  },
  saveTextActive: { color: '#fff' },
});
