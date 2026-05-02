import React from 'react';
import { View, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { Image } from 'expo-image';
import { CustomText as Text } from './CustomText';

interface NavbarProps {
  onHelp?: () => void;
}

export default function Navbar({ onHelp }: NavbarProps) {
  const handleHelp = async () => {
    if (onHelp) {
      onHelp();
      return;
    }

    const phoneNumber = '8926262675';
    const whatsappUrl = `whatsapp://send?phone=+91${phoneNumber}&text=Hello, I need help with THF Partner App.`;
    const fallbackUrl = `https://wa.me/91${phoneNumber}`;

    try {
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        await Linking.openURL(fallbackUrl);
      }
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      Alert.alert('Error', 'Could not open WhatsApp. Please make sure it is installed.');
    }
  };

  return (
    <View style={styles.navbar}>
      <Image source={require('../assets/THF/tfh-logo.svg')} style={{ width: 100.5, height: 36 }} />
      <TouchableOpacity style={styles.helpBtn} onPress={handleHelp} activeOpacity={0.8}>
        <Text style={styles.helpIcon}>📞</Text>
        <Text style={styles.helpText}>Help</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#E8304A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: '#fff', fontWeight: '800', fontSize: 12, letterSpacing: 0.5 },
  brandLine1: { fontSize: 11, color: '#333', fontWeight: '600', lineHeight: 14 },
  brandLine2: { fontSize: 11, color: '#333', fontWeight: '400', lineHeight: 14 },
  helpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  helpIcon: { fontSize: 13 },
  helpText: { fontSize: 14, color: '#333', fontWeight: '500' },
});
