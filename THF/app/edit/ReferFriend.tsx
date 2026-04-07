import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '@/src/services/firebaseConfig';
import { createReferral, isPhoneAlreadyReferred } from '@/src/services/referralService';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/src/hooks/useLanguage';

interface ReferFriendScreenProps {
  onGenerate?: (data: { name: string; contact: string; email: string }) => void;
}

export default function ReferFriendScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const rawPhone = contact.replace(/\D/g, '');
  const isValid = name.trim().length > 0 && rawPhone.length >= 10;

  const handleGenerate = async () => {
    if (!isValid || saving) return;

    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert(t('error'), t('notLoggedInRestart'));
      return;
    }

    const e164Phone = `+91${rawPhone.slice(-10)}`;
    setSaving(true);
    try {
      // Duplicate check
      const already = await isPhoneAlreadyReferred(e164Phone);
      if (already) {
        Alert.alert(t('alreadyReferred'), `${contact} ${t('alreadyReferredMsg')}`);
        return;
      }

      const referralId = await createReferral({ referrerId: uid, referredPhone: e164Phone });
      Alert.alert(t('referralSent'), `${t('referralSentMsg')} ID: ${referralId.slice(0, 8)}...`);
      setName('');
      setContact('');
      setEmail('');
    } catch (err: any) {
      console.error('[ReferFriendScreen] error:', err);
      Alert.alert(t('error'), err?.message ?? t('failedReferral'));
    } finally {
      setSaving(false);
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
          {/* Back btn */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          <Text style={styles.heading}>{t('referAFriend')}</Text>

          {/* Friend Name */}
          <View style={[styles.inputWrapper, focusedField === 'name' && styles.inputWrapperFocused]}>
            <Text style={[styles.floatingLabel, focusedField === 'name' && styles.floatingLabelFocused]}>{t('friendName')}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              returnKeyType="next"
            />
          </View>

          {/* Contact Number */}
          <View style={[styles.inputWrapper, focusedField === 'contact' && styles.inputWrapperFocused]}>
            <Text style={[styles.floatingLabel, focusedField === 'contact' && styles.floatingLabelFocused]}>{t('contactNumber')}</Text>
            <TextInput
              style={styles.input}
              value={contact}
              onChangeText={setContact}
              onFocus={() => setFocusedField('contact')}
              onBlur={() => setFocusedField(null)}
              keyboardType="phone-pad"
              maxLength={15}
              returnKeyType="next"
            />
          </View>

          {/* Email (optional) */}
          <View style={[styles.inputWrapper, focusedField === 'email' && styles.inputWrapperFocused]}>
            <Text style={[styles.floatingLabel, focusedField === 'email' && styles.floatingLabelFocused]}>{t('emailOptional')}</Text>
            <TextInput
              style={styles.input}
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
        </View>

        {/* Generate Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.generateBtn, isValid && !saving && styles.generateBtnActive]}
            onPress={handleGenerate}
            activeOpacity={isValid && !saving ? 0.85 : 1}
            disabled={!isValid || saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={[styles.generateText, isValid && styles.generateTextActive]}>
                {t('generateReferral')}
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
  content: { paddingHorizontal: 20, paddingTop: 12 },

  backBtn: { paddingTop: 4, paddingBottom: 4, alignSelf: 'flex-start' },
  backArrow: {
    fontSize: 24,
    color: '#3b5bdb',
    fontWeight: '500',
  },

  heading: { fontSize: 24, fontWeight: '700', color: '#111', marginTop: 12, marginBottom: 24 },

  /* Inputs */
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
