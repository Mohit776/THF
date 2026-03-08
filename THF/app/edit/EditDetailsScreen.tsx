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
  Modal,
  FlatList,
} from 'react-native';

const GENDERS = ['Male', 'Female', 'Other'];
const CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad'];

interface EditDetailsScreenProps {
  initialData?: {
    name?: string;
    email?: string;
    mobile?: string;
    emergency?: string;
    gender?: string;
    city?: string;
    address?: string;
  };
  onSave?: (data: {
    name: string;
    email: string;
    mobile: string;
    emergency: string;
    gender: string;
    city: string;
    address: string;
  }) => void;
}

/* ── Editable field with floating label + pencil icon ── */
interface EditFieldProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  multiline?: boolean;
}

function EditField({ label, value, onChangeText, keyboardType = 'default', multiline = false }: EditFieldProps) {
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
          editable={editable}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          textAlignVertical={multiline ? 'top' : 'center'}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); setEditable(false); }}
          placeholderTextColor="#bbb"
        />
        {!multiline && (
          <TouchableOpacity onPress={handlePencil} style={fieldStyles.pencilBtn} activeOpacity={0.7}>
            <Text style={fieldStyles.pencilIcon}>✏️</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

/* ── Dropdown field ── */
interface DropdownFieldProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (v: string) => void;
}

function DropdownField({ label, value, options, onSelect }: DropdownFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity style={dropStyles.wrapper} onPress={() => setVisible(true)} activeOpacity={0.8}>
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

/* ── Main Screen ── */
export default function EditDetailsScreen({ initialData = {}, onSave }: EditDetailsScreenProps) {
  const [name, setName] = useState(initialData.name ?? 'Vinod Singh');
  const [email, setEmail] = useState(initialData.email ?? 'vinodesizgn@gmail.com');
  const [mobile, setMobile] = useState(initialData.mobile ?? '9278204579');
  const [emergency, setEmergency] = useState(initialData.emergency ?? '9278204579');
  const [gender, setGender] = useState(initialData.gender ?? 'Male');
  const [city, setCity] = useState(initialData.city ?? 'Delhi');
  const [address, setAddress] = useState(
    initialData.address ?? 'H-no. 87 kushak no. 2 village kadipur Delhi 110036'
  );

  const handleSave = () => {
    if (onSave) onSave({ name, email, mobile, emergency, gender, city, address });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.heading}>Edit details</Text>

          <EditField label="Enter Name" value={name} onChangeText={setName} />
          <EditField label="Enter Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <EditField label="Enter mobile number" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
          <EditField label="Emergency contact number" value={emergency} onChangeText={setEmergency} keyboardType="phone-pad" />

          <DropdownField label="Select Gender" value={gender} options={GENDERS} onSelect={setGender} />
          <DropdownField label="Select City" value={city} options={CITIES} onSelect={setCity} />

          <EditField label="Address" value={address} onChangeText={setAddress} multiline />

          <View style={{ height: 16 }} />
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Text style={styles.saveText}>Save and Update</Text>
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
  heading: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 20 },
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
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 4,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  wrapperFocused: { borderColor: '#E8304A' },
  label: { fontSize: 11, color: '#aaa', marginBottom: 2, fontWeight: '500', letterSpacing: 0.3 },
  labelFocused: { color: '#E8304A' },
  row: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, fontSize: 15, color: '#111', paddingVertical: 4 },
  multiline: { minHeight: 70, paddingTop: 4 },
  pencilBtn: { padding: 4 },
  pencilIcon: { fontSize: 15 },
});

const dropStyles = StyleSheet.create({
  wrapper: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 10,
    marginBottom: 12,
  },
  label: { fontSize: 11, color: '#aaa', marginBottom: 4, fontWeight: '500', letterSpacing: 0.3 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  value: { fontSize: 15, color: '#111', flex: 1 },
  placeholder: { color: '#bbb' },
  chevron: { fontSize: 18, color: '#666', marginLeft: 8 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: 360,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: '#111', paddingHorizontal: 20, marginBottom: 12 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionSelected: { backgroundColor: '#fff8f8' },
  optionText: { fontSize: 15, color: '#444' },
  optionTextSelected: { color: '#E8304A', fontWeight: '600' },
  optionCheck: { color: '#E8304A', fontWeight: '700', fontSize: 15 },
});
