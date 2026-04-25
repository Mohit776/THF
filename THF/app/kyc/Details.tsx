/**
 * app/kyc/DetailsScreen.tsx
 *
 * Collects basic user details after OTP login.
 * On submit → saves to Firestore (users collection) + AsyncStorage cache,
 * then navigates to the next KYC step.
 */

import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, KeyboardTypeOptions, Modal, Platform, ScrollView, StatusBar, StyleSheet, TextInput, TouchableOpacity, View,  } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '@/src/services/firebaseConfig';
import { createUserProfile, getUserProfile } from '@/src/services/userService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '@/src/hooks/useLanguage';
import { Image } from 'expo-image';
import { CustomText as Text } from '../../components/CustomText';

const PROFILE_CACHE_KEY = 'user_profile_cache';

const SELECTED_SVG = `<svg width="24" height="24" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0)">
<rect x="1.35" y="1.35" width="15.3" height="15.3" rx="7.65" fill="#03884B"/>
<g clip-path="url(#clip1)">
<path d="M5.5 9L8 11.5L13 6.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</g>
</g>
<defs>
<clipPath id="clip0"><rect width="18" height="18" fill="white"/></clipPath>
<clipPath id="clip1"><rect width="12" height="12" fill="white" transform="translate(3 3)"/></clipPath>
</defs>
</svg>`;

const GENDERS = ['Male', 'Female', 'Other'];
const CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad'];
const ZONES = ['North zone', 'South zone', 'East zone', 'West zone', 'Central zone'];

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const isValidPhone = (p: string) => /^[0-9]{10}$/.test(p);

/**
 * Issue #4: Normalize zone string before writing to Firestore.
 * The mobile dropdown shows "North zone" etc., but Firestore (and admin panel)
 * expects canonical lowercase single-word values: "north", "south", etc.
 */
function normalizeZoneForStorage(displayZone: string): string {
  return displayZone.toLowerCase().replace(/\s*zone\s*/i, '').trim();
}

// ── Floating Input ──────────────────────────────────────────────────────────
interface FloatingInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  isValid?: boolean;
  editable?: boolean;
  prefix?: string;
  maxLength?: number;
}

function FloatingInput({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  multiline = false,
  isValid,
  editable = true,
  prefix,
  maxLength,
}: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const showValid = isValid && value.length > 0;

  return (
    <View style={[inputStyles.wrapper, focused && inputStyles.wrapperFocused]}>
      <Text style={[inputStyles.label, focused && inputStyles.labelFocused]}>{label}</Text>
      <View style={inputStyles.row}>
        {prefix && (
          <>
            <Text style={inputStyles.prefix}>{prefix}</Text>
            <View style={inputStyles.separator} />
          </>
        )}
        <TextInput
          style={[inputStyles.input, multiline && inputStyles.multiline]}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          textAlignVertical={multiline ? 'top' : 'center'}
          placeholderTextColor="#bbb"
          editable={editable}
          maxLength={maxLength}
        />
        {showValid && (
          <SvgXml xml={SELECTED_SVG} width={24} height={24} style={{ marginLeft: 8 }} />
        )}
      </View>
    </View>
  );
}

// ── Dropdown Field ──────────────────────────────────────────────────────────
interface DropdownFieldProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
}

function DropdownField({ label, value, options, onSelect }: DropdownFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={dropStyles.wrapper}
        onPress={() => setVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={dropStyles.label}>{label}</Text>
        <View style={dropStyles.row}>
          <Text style={[dropStyles.value, !value && dropStyles.placeholder]}>
            {value || `Select ${label}`}
          </Text>
          <Text style={dropStyles.chevron}>⌄</Text>
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
                  {value === item && <SvgXml xml={SELECTED_SVG} width={20} height={20} />}
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
export interface RegistrationDetails {
  name: string;
  email: string;
  emergency: string;
  gender: string;
  city: string;
  zone: string;
  address: string;
}

interface DetailsScreenProps {
  onBack?: () => void;
  onRegister?: (details: RegistrationDetails) => void;
}

export default function DetailsScreen({ onBack, onRegister }: DetailsScreenProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emergency, setEmergency] = useState('');
  const [gender, setGender] = useState('');
  const [city, setCity] = useState('');
  const [zone, setZone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    const loadProfile = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      try {
        const existing = await getUserProfile(uid);
        if (existing) {
          if (existing.name) setName(existing.name);
          if (existing.email) setEmail(existing.email);
          if (existing.emergencyPhone) setEmergency(existing.emergencyPhone);
          if (existing.gender) {
            setGender(existing.gender.charAt(0).toUpperCase() + existing.gender.slice(1));
          }
          if (existing.city) setCity(existing.city);
          if (existing.zone) setZone(existing.zone);
          if (existing.address) setAddress(existing.address);
        }
      } catch (e) {
        console.error("Failed to load existing profile", e);
      }
    };
    loadProfile();
  }, []);

  const allFilled =
    name.trim().length > 1 &&
    (email.trim() === '' || isValidEmail(email)) &&
    isValidPhone(emergency) &&
    gender &&
    city &&
    zone &&
    address.trim().length > 5;

  const handleRegister = async () => {
    if (!allFilled || saving) return;

    // Custom callback mode (e.g., used as a nested component)
    if (onRegister) {
      onRegister({ name, email, emergency, gender, city, zone, address });
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert('Error', 'You are not logged in. Please restart the app.');
      return;
    }

    setSaving(true);
    try {
      // ── Write to Firestore ──────────────────────────────────────────
      // Check whether a profile already exists (e.g. user re-registers)
      const existing = await getUserProfile(uid);
      const phone = auth.currentUser?.phoneNumber ?? '';

      const profileData: any = {
        name: name.trim(),
        email: email.trim(),
        phone,
        emergencyPhone: emergency.trim(),
        gender: gender.toLowerCase() as 'male' | 'female' | 'other',
        city,
        // Issue #4: normalize zone before saving — "North zone" → "north"
        zone: normalizeZoneForStorage(zone),
        address: address.trim(),
        language: 'en',
      };

      if (!existing || !existing.experience) {
        profileData.experience = [];
      }

      if (existing) {
        // Already exists — partial update via userService
        const { updateUserProfile } = await import('@/src/services/userService');
        await updateUserProfile(uid, profileData);
      } else {
        await createUserProfile(uid, profileData);
      }

      // ── Write to AsyncStorage cache ─────────────────────────────────
      const freshProfile = await getUserProfile(uid);
      if (freshProfile) {
        await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(freshProfile));
      }

      router.push('/kyc/UploadDocuments_1');
    } catch (err: any) {
      console.error('[DetailsScreen] save error:', err);
      Alert.alert('Error', err?.message ?? 'Failed to save details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* Back */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => { if (onBack) onBack(); else router.back(); }}
          activeOpacity={0.7}
        >
          <Image source={require('../../assets/THF/left.svg')} style={{ width: 24, height: 24 }} contentFit="contain" />
        </TouchableOpacity>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.heading}>{t('kycDetailsHeading')}</Text>
          <Text style={styles.subheading}>{t('kycDetailsSub')}</Text>

          <FloatingInput label={t('enterName')} value={name} onChangeText={setName} isValid={name.trim().length > 1} editable={!saving} />
          <FloatingInput label={t('enterEmail')} value={email} onChangeText={setEmail} keyboardType="email-address" isValid={email.length > 0 ? isValidEmail(email) : true} editable={!saving} />
          <FloatingInput label={t('emergencyContact')} value={emergency} onChangeText={setEmergency} keyboardType="phone-pad" isValid={isValidPhone(emergency)} editable={!saving} prefix="+91" maxLength={10} />

          <DropdownField label={t('selectGender')} value={gender} options={GENDERS} onSelect={setGender} />
          <DropdownField label={t('selectCity')} value={city} options={CITIES} onSelect={setCity} />
          <DropdownField label={t('selectZone')} value={zone} options={ZONES} onSelect={setZone} />

          <FloatingInput label={t('addressLabel')} value={address} onChangeText={setAddress} multiline isValid={address.trim().length > 5} editable={!saving} />

          <View style={{ height: 16 }} />
        </ScrollView>

        {/* Register Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.registerBtn, allFilled && !saving && styles.registerBtnActive]}
            onPress={handleRegister}
            activeOpacity={allFilled && !saving ? 0.85 : 1}
            disabled={!allFilled || saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={[styles.registerText, allFilled && styles.registerTextActive]}>
                {t('register')}
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
  backBtn: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4, alignSelf: 'flex-start' },
  backArrow: {
    fontSize: 24,
    color: '#3b5bdb',
    fontWeight: '500',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 8 },
  heading: { fontSize: 24, fontWeight: '700', color: '#111', marginBottom: 8, lineHeight: 32 },
  subheading: { fontSize: 13, color: '#888', lineHeight: 20, marginBottom: 24 },
  footer: { paddingHorizontal: 20, paddingBottom: 32, paddingTop: 10, backgroundColor: '#fff' },
  registerBtn: {
    borderRadius: 12, paddingVertical: 16, alignItems: 'center', backgroundColor: '#e8e8e8',
  },
  registerBtnActive: {
    backgroundColor: '#E8304A',
    shadowColor: '#E8304A', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  registerText: { fontSize: 16, fontWeight: '600', color: '#aaa', letterSpacing: 0.3 },
  registerTextActive: { color: '#fff' },
});

const inputStyles = StyleSheet.create({
  wrapper: {
    borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16, marginTop: 8,
    backgroundColor: '#fff', position: 'relative',
  },
  wrapperFocused: { borderColor: '#3b5bdb' },
  label: { 
    position: 'absolute', top: -8, left: 12, backgroundColor: '#fff', paddingHorizontal: 4,
    fontSize: 12, color: '#aaa', fontWeight: '500', letterSpacing: 0.3, zIndex: 1 
  },
  labelFocused: { color: '#3b5bdb' },
  row: { flexDirection: 'row', alignItems: 'center' },
  prefix: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111',
    marginRight: 0,
  },
  separator: {
    width: 1,
    height: 20,
    backgroundColor: '#ddd',
    marginHorizontal: 12,
  },
  input: { flex: 1, fontSize: 15, color: '#111', paddingVertical: 0 },
  multiline: { minHeight: 70, paddingTop: 4 },
});

const dropStyles = StyleSheet.create({
  wrapper: {
    borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16, marginTop: 8,
    backgroundColor: '#fff', position: 'relative',
  },
  label: { 
    position: 'absolute', top: -8, left: 12, backgroundColor: '#fff', paddingHorizontal: 4,
    fontSize: 12, color: '#aaa', fontWeight: '500', letterSpacing: 0.3, zIndex: 1 
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  value: { fontSize: 15, color: '#111', flex: 1 },
  placeholder: { color: '#bbb' },
  chevron: { fontSize: 18, color: '#666', marginLeft: 8 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingTop: 20, paddingBottom: 40, maxHeight: 360,
  },
  sheetTitle: {
    fontSize: 16, fontWeight: '700', color: '#111',
    paddingHorizontal: 20, marginBottom: 12,
  },
  option: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  optionSelected: { backgroundColor: '#fff8f8' },
  optionText: { fontSize: 15, color: '#444' },
  optionTextSelected: { color: '#E8304A', fontWeight: '600' },
});
