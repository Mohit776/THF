import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { auth } from '@/src/services/firebaseConfig';
import { getUserProfile, updateUserProfile } from '@/src/services/userService';
import { useLanguage } from '@/src/hooks/useLanguage';

interface AccountDetailsScreenProps {
  onSave?: (data: {
    accountNumber: string;
    ifsc: string;
    bankName: string;
    upiId: string;
  }) => void;
}

export default function AccountDetailsScreen({ onSave }: AccountDetailsScreenProps) {
  const router = useRouter();
  const { t } = useLanguage();

  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [bankName, setBankName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) {
          setLoading(false);
          return;
        }
        const profile = await getUserProfile(uid);
        if (profile?.bankDetails) {
          setAccountNumber(profile.bankDetails.accountNumber || '');
          setIfsc(profile.bankDetails.ifsc || '');
          setBankName(profile.bankDetails.bankName || '');
          setUpiId(profile.bankDetails.upiId || '');
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const isValid =
    accountNumber.trim().length > 0 &&
    ifsc.trim().length > 0 &&
    bankName.trim().length > 0;

  const handleSave = async () => {
    if (!isValid || saving) return;

    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert(t('error'), t('notLoggedInRestart'));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        bankDetails: {
          accountNumber: accountNumber.trim(),
          ifsc: ifsc.trim().toUpperCase(),
          bankName: bankName.trim(),
          upiId: upiId.trim(),
        }
      };
      await updateUserProfile(uid, payload);
      
      if (onSave) {
        onSave({ accountNumber, ifsc, bankName, upiId });
      }

      Alert.alert(t('saved'), t('savedAccountDetails'), [
        { text: t('ok'), onPress: () => router.back() }
      ]);
    } catch (err: any) {
      console.error('[AccountDetailsScreen] save error:', err);
      Alert.alert(t('error'), err?.message ?? t('failedAccountUpdate'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color="#E8304A" size="large" />
      </SafeAreaView>
    );
  }

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
          {/* Back btn */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          {/* ── Bank Account Section ── */}
          <Text style={styles.sectionHeading}>{t('accountDetailsTitle')}</Text>

          <View style={[styles.inputWrapper, focusedField === 'account' && styles.inputWrapperFocused]}>
            <Text style={[styles.floatingLabel, focusedField === 'account' && styles.floatingLabelFocused]}>{t('bankAccountNumber')}</Text>
            <TextInput
              style={styles.input}
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="number-pad"
              onFocus={() => setFocusedField('account')}
              onBlur={() => setFocusedField(null)}
              returnKeyType="next"
            />
          </View>

          <View style={[styles.inputWrapper, focusedField === 'ifsc' && styles.inputWrapperFocused]}>
            <Text style={[styles.floatingLabel, focusedField === 'ifsc' && styles.floatingLabelFocused]}>{t('ifscCode')}</Text>
            <TextInput
              style={styles.input}
              value={ifsc}
              onChangeText={(t) => setIfsc(t.toUpperCase())}
              autoCapitalize="characters"
              onFocus={() => setFocusedField('ifsc')}
              onBlur={() => setFocusedField(null)}
              returnKeyType="next"
            />
          </View>

          <View style={[styles.inputWrapper, focusedField === 'bank' && styles.inputWrapperFocused]}>
            <Text style={[styles.floatingLabel, focusedField === 'bank' && styles.floatingLabelFocused]}>{t('bankNameLabel')}</Text>
            <TextInput
              style={styles.input}
              value={bankName}
              onChangeText={setBankName}
              onFocus={() => setFocusedField('bank')}
              onBlur={() => setFocusedField(null)}
              returnKeyType="next"
            />
          </View>

          {/* ── UPI Section ── */}
          <Text style={[styles.sectionHeading, { marginTop: 24 }]}>{t('upiDetail')}</Text>

          <View style={[styles.inputWrapper, focusedField === 'upi' && styles.inputWrapperFocused]}>
            <Text style={[styles.floatingLabel, focusedField === 'upi' && styles.floatingLabelFocused]}>{t('upiIdLabel')}</Text>
            <TextInput
              style={styles.input}
              value={upiId}
              onChangeText={setUpiId}
              autoCapitalize="none"
              onFocus={() => setFocusedField('upi')}
              onBlur={() => setFocusedField(null)}
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
          </View>

          <Text style={styles.upiHint}>
            {t('upiHint')}
          </Text>

          <View style={{ height: 16 }} />
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveBtn, isValid && styles.saveBtnActive]}
            onPress={handleSave}
            activeOpacity={isValid && !saving ? 0.85 : 1}
            disabled={!isValid || saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={[styles.saveText, isValid && styles.saveTextActive]}>
                {t('saveAndUpdate')}
              </Text>
            )}
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
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

  backBtn: { paddingTop: 16, paddingBottom: 4, alignSelf: 'flex-start' },
  backArrow: {
    fontSize: 24,
    color: '#3b5bdb',
    fontWeight: '500',
  },

  sectionHeading: { fontSize: 18, fontWeight: '700', color: '#111', marginTop: 12, marginBottom: 16 },

  inputWrapper: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    marginTop: 8,
    backgroundColor: '#fff',
    position: 'relative',
  },
  inputWrapperFocused: {
    borderColor: '#E8304A',
  },
  floatingLabel: {
    position: 'absolute',
    top: -8,
    left: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    fontSize: 12,
    color: '#aaa',
    fontWeight: '500',
    letterSpacing: 0.3,
    zIndex: 1,
  },
  floatingLabelFocused: {
    color: '#E8304A',
  },
  input: {
    fontSize: 15,
    color: '#111',
    paddingVertical: 0,
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
