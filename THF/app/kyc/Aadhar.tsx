import { uploadKycImage } from '@/src/services/kycStorageService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const formatAadhar = (text: string): string => {
  const digits = text.replace(/\D/g, '').slice(0, 12);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
};

interface AadharScreenProps {
  onBack?: () => void;
  onUpload?: (aadharNumber: string) => void;
  onSkip?: () => void;
}

export default function AadharScreen({ onBack, onUpload, onSkip }: AadharScreenProps) {
  const router = useRouter();
  const [aadhar, setAadhar] = useState('');
  const [focused, setFocused] = useState(false);
  const [frontImageUri, setFrontImageUri] = useState<string | null>(null);
  const [backImageUri, setBackImageUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [stage, setStage] = useState<'input' | 'front-uploaded' | 'complete'>('input');

  const rawDigits = aadhar.replace(/\s/g, '');
  const isValid = rawDigits.length === 12;

  const handleChange = (text: string) => {
    setAadhar(formatAadhar(text));
  };

  const processFrontImage = async (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      try {
        setIsUploading(true);
        setFrontImageUri(uri);

        const downloadUrl = await uploadKycImage(uri, 'aadhar-front');
        await AsyncStorage.setItem('aadharPhotoUrl', downloadUrl);
        await AsyncStorage.setItem('aadharPhoto', uri);
        setStage('front-uploaded');
      } catch (error) {
        console.error('Error uploading Aadhar front:', error);
        Alert.alert('Upload failed', 'Unable to upload Aadhar front. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const processBackImage = async (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      try {
        setIsUploading(true);
        setBackImageUri(uri);

        const downloadUrl = await uploadKycImage(uri, 'aadhar-back');
        await AsyncStorage.setItem('aadharPhotoBackUrl', downloadUrl);
        await AsyncStorage.setItem('aadharPhotoBack', uri);
        setStage('complete');

        if (onUpload) {
          onUpload(rawDigits);
        } else {
          router.push('/kyc/UploadDocuments_1');
        }
      } catch (error) {
        console.error('Error uploading Aadhar back:', error);
        Alert.alert('Upload failed', 'Unable to upload Aadhar back. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleCameraFront = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow camera access to upload a document.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
      await processFrontImage(result);
    } catch (error) {
      console.error('Error capturing document:', error);
      Alert.alert('Error', 'Failed to capture image');
    }
  };

  const handleGalleryFront = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow gallery access to choose a document.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
      await processFrontImage(result);
    } catch (error) {
      console.error('Error selecting document:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleCameraBack = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow camera access to upload a document.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
      await processBackImage(result);
    } catch (error) {
      console.error('Error capturing document:', error);
      Alert.alert('Error', 'Failed to capture image');
    }
  };

  const handleGalleryBack = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow gallery access to choose a document.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
      await processBackImage(result);
    } catch (error) {
      console.error('Error selecting document:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleSelectFront = () => {
    if (!isValid) return;
    Alert.alert(
      'Upload Aadhar Front',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: handleCameraFront },
        { text: 'Choose from Gallery', onPress: handleGalleryFront },
      ],
      { cancelable: true }
    );
  };

  const handleSelectBack = () => {
    Alert.alert(
      'Upload Aadhar Back',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: handleCameraBack },
        { text: 'Choose from Gallery', onPress: handleGalleryBack },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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

          {/* Heading */}
          <Text style={styles.heading}>Enter your Aadhar details</Text>
          <Text style={styles.subheading}>Upload your own documents for a faster process!</Text>

          <View style={styles.cardContainer}>
            {stage === 'input' || stage === 'front-uploaded' ? (
              frontImageUri ? (
                <Image
                  source={{ uri: frontImageUri }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              ) : (
                <>
                  <Image
                    source={require('../../assets/THF/aadhar_card.png')}
                    style={styles.cardImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.sideLabel}>Front</Text>
                </>
              )
            ) : (
              backImageUri ? (
                <Image
                  source={{ uri: backImageUri }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              ) : (
                <>
                  <Image
                    source={require('../../assets/THF/aadhar_card.png')}
                    style={styles.cardImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.sideLabel}>Back</Text>
                </>
              )
            )}
          </View>

          {/* Aadhar Number Input */}
          <View style={[styles.inputWrapper, focused && styles.inputWrapperFocused]}>
            <Text
              style={[
                styles.floatingLabel,
                (focused || aadhar.length > 0) && styles.floatingLabelFocused,
              ]}
            >
              Enter Aadhar number
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={aadhar}
                onChangeText={handleChange}
                keyboardType="number-pad"
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                maxLength={14}
              />
              {isValid && (
                <View style={styles.checkCircle}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
              )}
            </View>
          </View>

          {/* Auth note */}
          <Text style={styles.authNote}>
            By clicking 'Continue' you give authorization to verify your Aadhar card.
          </Text>
        </ScrollView>

        {/* Bottom Buttons */}
        <View style={styles.footer}>
          {stage === 'input' ? (
            <>
              <TouchableOpacity
                style={[styles.uploadBtn, isValid && styles.uploadBtnActive]}
                onPress={handleSelectFront}
                activeOpacity={isValid ? 0.85 : 1}
                disabled={!isValid || isUploading}
              >
                <Text style={[styles.uploadText, isValid && styles.uploadTextActive]}>
                  {isUploading ? 'Uploading Front...' : 'Upload Front'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.skipBtn}
                onPress={() => {
                  if (onSkip) {
                    onSkip();
                  } else {
                    router.push('/(tabs)/Dashboard');
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.skipText}>Skip, I'll do it later</Text>
              </TouchableOpacity>
            </>
          ) : stage === 'front-uploaded' ? (
            <>
              <TouchableOpacity
                style={[styles.uploadBtn, styles.uploadBtnActive]}
                onPress={handleSelectBack}
                activeOpacity={0.85}
                disabled={isUploading}
              >
                <Text style={[styles.uploadText, styles.uploadTextActive]}>
                  {isUploading ? 'Uploading Back...' : 'Upload Back'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.skipBtn}
                onPress={() => {
                  if (onSkip) {
                    onSkip();
                  } else {
                    router.push('/(tabs)/Dashboard');
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.skipText}>Skip, I'll do it later</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 12 },

  backBtn: { paddingTop: 16, paddingBottom: 4, alignSelf: 'flex-start' },
  backArrow: { fontSize: 22, color: '#3b5bdb', fontWeight: '500' },

  heading: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 6, marginTop: 8 },
  subheading: { fontSize: 13, color: '#888', lineHeight: 20, marginBottom: 20 },

  /* Card Image */
  cardContainer: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    alignItems: 'center',
    paddingVertical: 16,
    position: 'relative',
  },
  cardImage: {
    width: width,
    height: (width) * 0.6,
  },
  sideLabel: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },

  /* Input */
  inputWrapper: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    backgroundColor: '#fff',
    position: 'relative',
    height: 56,
    justifyContent: 'center',
  },
  inputWrapperFocused: {
    borderColor: '#E8304A',
  },
  floatingLabel: {
    position: 'absolute',
    left: 14,
    top: 18,
    fontSize: 16,
    color: '#aaa',
    zIndex: 1,
    backgroundColor: '#fff',
  },
  floatingLabelFocused: {
    top: -10,
    fontSize: 12,
    color: '#E8304A',
    fontWeight: '500',
    paddingHorizontal: 4,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, fontSize: 16, color: '#111', paddingVertical: 0, height: 24, letterSpacing: 1 },
  checkCircle: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#22a75a', alignItems: 'center', justifyContent: 'center',
  },
  checkMark: { color: '#fff', fontSize: 13, fontWeight: '700' },

  /* Auth note */
  authNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 8,
    paddingHorizontal: 10,
  },

  /* Footer */
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 8,
    backgroundColor: '#fff',
    gap: 14,
  },
  uploadBtn: {
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    backgroundColor: '#e8e8e8',
  },
  uploadBtnActive: {
    backgroundColor: '#E8304A',
    shadowColor: '#E8304A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  uploadText: { fontSize: 16, fontWeight: '600', color: '#aaa', letterSpacing: 0.3 },
  uploadTextActive: { color: '#fff' },

  skipBtn: { alignItems: 'center', paddingVertical: 4 },
  skipText: { fontSize: 14, color: '#E8304A', fontWeight: '500' },
});
