import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const OPTIONS = [
  'Hotel',
  'Hostels',
  'Canteen',
  'Houses',
  'Restaurant',
  'Pub & bar',
  'Other',
];

interface ExperienceScreenProps {
  onBack?: () => void;
  onContinue?: (selected: string) => void;
}

export default function ExperienceScreen({ onBack, onContinue }: ExperienceScreenProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = () => {
    if (selected) {
      if (onContinue) {
        onContinue(selected);
      } else {
        router.push('/kyc/AadharScreen');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Heading */}
        <Text style={styles.heading}>Please share your experience</Text>
        <Text style={styles.subheading}>
          This will help us to understand the area of expertise so that we could allocate the bookings accordingly
        </Text>

        {/* Options */}
        <View style={styles.optionsList}>
          {OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionRow,
                selected === option && styles.optionRowSelected,
              ]}
              onPress={() => setSelected(option)}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionText, selected === option && styles.optionTextSelected]}>
                {option}
              </Text>
              <View style={[styles.radio, selected === option && styles.radioSelected]}>
                {selected === option && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, selected && styles.continueBtnActive]}
          onPress={handleContinue}
          activeOpacity={selected ? 0.85 : 1}
          disabled={!selected}
        >
          <Text style={[styles.continueText, selected && styles.continueTextActive]}>
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  /* Back */
  backBtn: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4, alignSelf: 'flex-start' },
  backArrow: { fontSize: 22, color: '#3b5bdb', fontWeight: '500' },

  /* Scroll */
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 16 },

  /* Heading */
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    marginBottom: 10,
    lineHeight: 32,
  },
  subheading: {
    fontSize: 13,
    color: '#888',
    lineHeight: 20,
    marginBottom: 28,
  },

  /* Options */
  optionsList: { gap: 10 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    backgroundColor: '#fff',
  },
  optionRowSelected: {
    borderColor: '#E8304A',
    backgroundColor: '#fff8f8',
  },
  optionText: {
    fontSize: 15,
    color: '#444',
    fontWeight: '400',
  },
  optionTextSelected: {
    color: '#111',
    fontWeight: '500',
  },

  /* Radio */
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: '#E8304A' },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: '#E8304A',
  },

  /* Footer */
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
    backgroundColor: '#fff',
  },
  continueBtn: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#e8e8e8',
  },
  continueBtnActive: {
    backgroundColor: '#E8304A',
    shadowColor: '#E8304A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  continueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#aaa',
    letterSpacing: 0.3,
  },
  continueTextActive: { color: '#fff' },
});
