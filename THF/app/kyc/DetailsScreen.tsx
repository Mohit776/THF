import React, { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  KeyboardTypeOptions,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const GENDERS = ['Male', 'Female', 'Other'];
const CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad'];

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const isValidPhone = (p: string) => /^[0-9]{10}$/.test(p);

interface FloatingInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  isValid?: boolean;
}

function FloatingInput({ label, value, onChangeText, keyboardType = 'default', multiline = false, isValid }: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const showValid = isValid && value.length > 0;

  return (
    <View style={[inputStyles.wrapper, focused && inputStyles.wrapperFocused]}>
      <Text style={[inputStyles.label, focused && inputStyles.labelFocused]}>{label}</Text>
      <View style={inputStyles.row}>
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
        />
        {showValid && (
          <View style={inputStyles.checkCircle}>
            <Text style={inputStyles.checkMark}>✓</Text>
          </View>
        )}
      </View>
    </View>
  );
}

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

export interface RegistrationDetails {
  name: string;
  email: string;
  emergency: string;
  gender: string;
  city: string;
  address: string;
}

interface DetailsScreenProps {
  onBack?: () => void;
  onRegister?: (details: RegistrationDetails) => void;
}

export default function DetailsScreen({ onBack, onRegister }: DetailsScreenProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emergency, setEmergency] = useState('');
  const [gender, setGender] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');

  const allFilled =
    name.trim().length > 1 &&
    isValidEmail(email) &&
    isValidPhone(emergency) &&
    gender &&
    city &&
    address.trim().length > 5;

  const handleRegister = () => {
    if (allFilled) {
      if (onRegister) {
        onRegister({ name, email, emergency, gender, city, address });
      } else {
        router.push('/kyc/ExperienceScreen');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* Back */}
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

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.heading}>Please share the details</Text>
          <Text style={styles.subheading}>
            To sign up to an account in the application, enter your details below.
          </Text>

          <FloatingInput
            label="Enter Name"
            value={name}
            onChangeText={setName}
            isValid={name.trim().length > 1}
          />
          <FloatingInput
            label="Enter Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            isValid={isValidEmail(email)}
          />
          <FloatingInput
            label="Emergency contact number"
            value={emergency}
            onChangeText={setEmergency}
            keyboardType="phone-pad"
            isValid={isValidPhone(emergency)}
          />

          <DropdownField label="Select Gender" value={gender} options={GENDERS} onSelect={setGender} />
          <DropdownField label="Select City" value={city} options={CITIES} onSelect={setCity} />

          <FloatingInput
            label="Address"
            value={address}
            onChangeText={setAddress}
            multiline
            isValid={address.trim().length > 5}
          />

          <View style={{ height: 16 }} />
        </ScrollView>

        {/* Register Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.registerBtn, allFilled && styles.registerBtnActive]}
            onPress={handleRegister}
            activeOpacity={allFilled ? 0.85 : 1}
            disabled={!allFilled}
          >
            <Text style={[styles.registerText, allFilled && styles.registerTextActive]}>
              Register
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
  backBtn: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4, alignSelf: 'flex-start' },
  backArrow: { fontSize: 22, color: '#3b5bdb', fontWeight: '500' },
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
    paddingHorizontal: 14, paddingTop: 8, paddingBottom: 4, marginBottom: 14,
    backgroundColor: '#fff',
  },
  wrapperFocused: { borderColor: '#3b5bdb' },
  label: { fontSize: 11, color: '#aaa', marginBottom: 2, fontWeight: '500', letterSpacing: 0.3 },
  labelFocused: { color: '#3b5bdb' },
  row: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, fontSize: 15, color: '#111', paddingVertical: 4 },
  multiline: { minHeight: 70, paddingTop: 4 },
  checkCircle: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#22a75a', alignItems: 'center', justifyContent: 'center', marginLeft: 8,
  },
  checkMark: { color: '#fff', fontSize: 13, fontWeight: '700' },
});

const dropStyles = StyleSheet.create({
  wrapper: {
    borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 10,
    paddingHorizontal: 14, paddingTop: 8, paddingBottom: 10, marginBottom: 14,
  },
  label: { fontSize: 11, color: '#aaa', marginBottom: 4, fontWeight: '500', letterSpacing: 0.3 },
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
  optionCheck: { color: '#E8304A', fontWeight: '700', fontSize: 15 },
});
