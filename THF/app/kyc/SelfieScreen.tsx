import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface SelfieScreenProps {
  onBack?: () => void;
  onProceed?: () => void;
}

export default function SelfieScreen({ onBack, onProceed }: SelfieScreenProps) {
  const router = useRouter();
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -10, duration: 1500, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

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

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.heading}>Let's click a selfie</Text>
        <Text style={styles.subheading}>
          Please remove spectacles, hat and mask. A clearly visible face will get approved faster.
        </Text>

        {/* ── Replace source with your image import ── */}
        <View style={[styles.illustrationWrapper]}>
          <Image
            source={require('../../assets/THF/upload_selfie.png')} // 👈 Replace with your image
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Proceed Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.proceedBtn}
          onPress={() => {
            if (onProceed) {
              onProceed();
            } else {
              router.replace('/(tabs)/DashboardScreen');
            }
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.proceedText}>Proceed to Capture</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  backBtn: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
    alignSelf: 'flex-start',
  },
  backArrow: { fontSize: 22, color: '#3b5bdb', fontWeight: '500' },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
  },
  subheading: {
    fontSize: 13,
    color: '#888',
    lineHeight: 20,
    marginBottom: 16,
  },

  illustrationWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: {
    width: width * 0.72,
    height: width * 0.85,
  },

  footer: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
  },
  proceedBtn: {
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
  proceedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
