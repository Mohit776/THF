/**
 * app/edit/EditDetailsScreen.tsx
 *
 * Edit partner profile.
 * On mount: loads from AsyncStorage cache (instant) then refreshes from Firestore.
 * On save: writes to Firestore then updates cache.
 */

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Modal, Platform, ScrollView, StatusBar, StyleSheet, TextInput, TouchableOpacity, View,  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '@/src/services/firebaseConfig';
import { getUserProfile, updateUserProfile } from '@/src/services/userService';
import { Image } from 'expo-image';
import { useLanguage } from '@/src/hooks/useLanguage';
import { CustomText as Text } from '../../components/CustomText';

const PROFILE_CACHE_KEY = 'user_profile_cache';
const GENDERS = ['Male', 'Female', 'Other'];
const CITIES = [  "Delhi",
  "Noida",
  "Ghaziabad",
  "Faridabad",
  "Gurugram",
  "Mumbai",
  'Bengaluru',
  'Chennai',
  'Kolkata',
  'Hyderabad',
  'Pune',
  'Jaipur',
  'Lucknow',
  'Chandigarh',
  'Indore',
  'Kochi',
  'Ahmedabad',
  'Bhubaneswar',
  'Nagpur',
  'Dehradun',
  'Shimla',
  'Jalandhar',
  'Mysuru',
  'Udaipur',
  'Varanasi',
  'Rajkot',
  'Haridwar',
  'Rishikesh',
  'Mussoorie'
];

// ── Editable field ──────────────────────────────────────────────────────────
interface EditFieldProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  multiline?: boolean;
  disabled?: boolean;
  maxLength?: number;
}

function EditField({ label, value, onChangeText, keyboardType = 'default', multiline = false, disabled, maxLength }: EditFieldProps) {
  const [focused, setFocused] = useState(false);
  const [editable, setEditable] = useState(false);

  const handlePencil = () => {
    setEditable(true);
    setFocused(true);
  };

  return (
    <View style={[fieldStyles.wrapper, focused && fieldStyles.wrapperFocused]}>
      <Text style={[fieldStyles.label, focused && fieldStyles.labelFocused]}>{label}</Text>
      <View style={fieldStyles.row}>
        <TextInput
          style={[fieldStyles.input, multiline && fieldStyles.multiline]}
          value={value}
          onChangeText={onChangeText}
          editable={!disabled && (multiline || editable)}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          textAlignVertical={multiline ? 'top' : 'center'}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); setEditable(false); }}
          placeholderTextColor="#bbb"
          maxLength={maxLength}
        />
        {!multiline && !disabled && (
          <TouchableOpacity onPress={handlePencil} style={fieldStyles.pencilBtn} activeOpacity={0.7}>
            <Image source={require('@/assets/THF/edit.svg')} style={fieldStyles.pencilIcon} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ── Dropdown ────────────────────────────────────────────────────────────────
interface DropdownFieldProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (v: string) => void;
  disabled?: boolean;
}

function DropdownField({ label, value, options, onSelect, disabled }: DropdownFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={dropStyles.wrapper}
        onPress={() => !disabled && setVisible(true)}
        activeOpacity={disabled ? 1 : 0.8}
      >
        <Text style={dropStyles.label}>{label}</Text>
        <View style={dropStyles.row}>
          <Text style={[dropStyles.value, !value && dropStyles.placeholder]}>
            {value || `${label}`}
          </Text>
          {!disabled && <Image source={require('@/assets/THF/Right Chevron.svg')} style={dropStyles.chevron} />}
        </View>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <TouchableOpacity style={dropStyles.overlay} onPress={() => setVisible(false)} activeOpacity={1}>
          <View style={dropStyles.sheet}>
            <Text style={dropStyles.sheetTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[dropStyles.option, value === item && dropStyles.optionSelected]}
                  onPress={() => { onSelect(item); setVisible(false); }}
                >
                  <Text style={[dropStyles.optionText, value === item && dropStyles.optionTextSelected]}>
                    {item}
                  </Text>
                  {value === item && <Text style={dropStyles.optionCheck}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

// ── Main Screen ─────────────────────────────────────────────────────────────
export default function EditDetailsScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [emergency, setEmergency] = useState('');
  const [gender, setGender] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [pinCode, setPinCode] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ── Load profile: cache first, then Firestore ─────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        // 1. Serve cached data immediately
        const cached = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
        if (cached) {
          const p = JSON.parse(cached);
          if (!cancelled) populateForm(p);
        }

        // 2. Refresh from Firestore
        const uid = auth.currentUser?.uid;
        if (!uid) { setLoading(false); return; }
        const fresh = await getUserProfile(uid);
        if (fresh && !cancelled) {
          populateForm(fresh);
          await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(fresh));
        }
      } catch (err) {
        console.error('[EditDetailsScreen] load error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  function populateForm(p: any) {
    setName(p.name ?? '');
    setEmail(p.email ?? '');
    setMobile(p.phone ?? '');
    setEmergency(p.emergencyPhone ?? '');
    setGender(p.gender ? p.gender.charAt(0).toUpperCase() + p.gender.slice(1) : '');
    setCity(p.city ?? '');
    setAddress(p.address ?? '');
    setPinCode(p.pinCode ?? '');
  }

  // ── Save to Firestore + cache ─────────────────────────────────────────
  const handleSave = async () => {
    if (saving) return;
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert(t('error'), t('notLoggedInRestart'));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: mobile.trim(),
        emergencyPhone: emergency.trim(),
        gender: gender.toLowerCase() as 'male' | 'female' | 'other',
        city,
        address: address.trim(),
        pinCode: pinCode.trim(),
      };

      await updateUserProfile(uid, payload);

      // Refresh cache
      const fresh = await getUserProfile(uid);
      if (fresh) await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(fresh));

      Alert.alert(t('saved'), t('savedDetails'), [
        { text: t('ok'), onPress: () => router.back() },
      ]);
    } catch (err: any) {
      console.error('[EditDetailsScreen] save error:', err);
      Alert.alert(t('error'), err?.message ?? t('failedSave'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent:'center', alignItems:'center' }]}>
        <ActivityIndicator color="#E8304A" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Back btn */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Image source={require('../../assets/THF/left.svg')} style={{ width: 24, height: 24 }} contentFit="contain" />
          </TouchableOpacity>

          {/* Header */}
          <Text style={styles.heading}>{t('editDetails')}</Text>

          <EditField label={t('enterNameLabel')} value={name} onChangeText={setName} disabled={saving} />
          <EditField label={t('enterEmailLabel')} value={email} onChangeText={setEmail} keyboardType="email-address" disabled={saving} />
          <EditField label={t('enterMobileLabel')} value={mobile} onChangeText={setMobile} keyboardType="phone-pad" disabled={saving} />
          <EditField label={t('emergencyContactLabel')} value={emergency} onChangeText={setEmergency} keyboardType="phone-pad" disabled={saving} maxLength={10} />

          <DropdownField label={t('selectGenderLabel')} value={gender} options={GENDERS} onSelect={setGender} disabled={saving} />
          <DropdownField label={t('selectCityLabel')} value={city} options={CITIES} onSelect={setCity} disabled={saving} />

          <EditField label={t('addressLabel2')} value={address} onChangeText={setAddress} multiline disabled={saving} />

          <EditField label={t('pinCodeLabel')} value={pinCode} onChangeText={setPinCode} keyboardType="phone-pad" disabled={saving} maxLength={6} />

          <View style={{ height: 16 }} />
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveText}>{t('saveAndUpdate')}</Text>
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
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  
  backBtn: { paddingTop: 16, paddingBottom: 4, alignSelf: 'flex-start' },
  backArrow: {
    fontSize: 24,
    color: '#3b5bdb',
    fontWeight: '500',
  },

  heading: { fontSize: 24, fontWeight: '700', color: '#111', marginTop: 12, marginBottom: 4 },
  footer: { paddingHorizontal: 20, paddingBottom: 36, paddingTop: 10, backgroundColor: '#fff' },
  saveBtn: {
    backgroundColor: '#E8304A',
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: '#E8304A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '600', letterSpacing: 0.3 },
});

const fieldStyles = StyleSheet.create({
  wrapper: {
    borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16, marginTop: 8, backgroundColor: '#fff',
    position: 'relative',
  },
  wrapperFocused: { borderColor: '#E8304A' },
  label: { 
    position: 'absolute', top: -8, left: 12, backgroundColor: '#fff', paddingHorizontal: 4,
    fontSize: 12, color: '#aaa', fontWeight: '500', letterSpacing: 0.3, zIndex: 1 
  },
  labelFocused: { color: '#E8304A' },
  row: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, fontSize: 15, color: '#111', paddingVertical: 0 },
  multiline: { minHeight: 70, paddingTop: 4 },
  pencilBtn: { padding: 4 },
  pencilIcon: { width: 20, height: 20 },
});

const dropStyles = StyleSheet.create({
  wrapper: {
    borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16, marginTop: 8, backgroundColor: '#fff',
    position: 'relative',
  },
  label: { 
    position: 'absolute', top: -8, left: 12, backgroundColor: '#fff', paddingHorizontal: 4,
    fontSize: 12, color: '#aaa', fontWeight: '500', letterSpacing: 0.3, zIndex: 1 
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  value: { fontSize: 15, color: '#111', flex: 1 },
  placeholder: { color: '#bbb' },
  chevron: { width: 20, height: 20, marginLeft: 8 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingTop: 20, paddingBottom: 40, maxHeight: 360,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: '#111', paddingHorizontal: 20, marginBottom: 12 },
  option: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  optionSelected: { backgroundColor: '#fff8f8' },
  optionText: { fontSize: 15, color: '#444' },
  optionTextSelected: { color: '#E8304A', fontWeight: '600' },
  optionCheck: { color: '#E8304A', fontWeight: '700', fontSize: 15 },
});
