import { uploadKycImage } from '@/src/services/kycStorageService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '@/src/hooks/useLanguage';

const { width } = Dimensions.get('window');

interface SelfieScreenProps {
  onBack?: () => void;
  onProceed?: () => void;
}

export default function SelfieScreen({ onBack, onProceed }: SelfieScreenProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const floatAnim = useRef(new Animated.Value(0)).current;
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -10, duration: 1500, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const processImage = async (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      try {
        setIsUploading(true);
        setImageUri(uri);

        const downloadUrl = await uploadKycImage(uri, 'selfie');
        await AsyncStorage.multiSet([
          ['profilePhoto', uri],
          ['profilePhotoUrl', downloadUrl],
        ]);

        if (onProceed) {
          onProceed();
        } else {
          router.replace('/kyc/UploadDocuments_1');
        }
      } catch (error) {
        console.error('Error uploading selfie:', error);
        Alert.alert(t('uploadFailed'), 'Unable to upload selfie. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(t('permRequired'), t('camPermSelfie'));
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        aspect: [1, 1],
        quality: 0.7,
      });
      await processImage(result);
    } catch (error) {
      console.error('Error capturing selfie:', error);
      Alert.alert('Error', 'Failed to capture image');
    }
  };

  const handleGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(t('permRequired'), t('galPermSelfie'));
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        aspect: [1, 1],
        quality: 0.7,
      });
      await processImage(result);
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleSelectOptions = () => {
    Alert.alert(
      t('uploadPhoto'),
      t('chooseOption'),
      [  { text: t('cancel'), style: 'cancel' },
        { text: t('takePhoto'), onPress: handleCamera },
        { text: t('chooseGallery'), onPress: handleGallery },
      
      ],
      { cancelable: true }
    );
  };

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
        <Text style={styles.heading}>{t('selfieHeading')}</Text>
        <Text style={styles.subheading}>{t('selfieSub')}</Text>

        {/* ── Replace source with your image import ── */}
        <View style={[styles.illustrationWrapper]}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={[styles.illustration, { borderRadius: width * 0.36 }]}
              contentFit="cover"
            />
          ) : (
            <Image
              source={require('../../assets/THF/selfi.svg')} // 👈 Replace with your image
              style={styles.illustration}
              contentFit="contain"
            />
          )}
        </View>
      </View>

      {/* Proceed Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.proceedBtn}
          onPress={handleSelectOptions}
          activeOpacity={0.85}
          disabled={isUploading}
        >
          <Text style={styles.proceedText}>
            {isUploading ? t('uploading') : t('proceedCapture')}
          </Text>
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
  backArrow: {
    fontSize: 24,
    color: '#3b5bdb',
    fontWeight: '500',
  },

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
