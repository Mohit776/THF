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

const formatPan = (text: string): string => {
  return text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
};

interface PanScreenProps {
  onBack?: () => void;
  onUpload?: (panNumber: string) => void;
  onSkip?: () => void;
}

export default function PanScreen({ onBack, onUpload, onSkip }: PanScreenProps) {
  const router = useRouter();
  const [pan, setPan] = useState('');
  const [focused, setFocused] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const isValid = pan.length === 10;

  const handleChange = (text: string) => {
    setPan(formatPan(text));
  };

  const processImage = async (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      try {
        setIsUploading(true);
        setImageUri(uri);

        const downloadUrl = await uploadKycImage(uri, 'pan');
        await AsyncStorage.multiSet([
          ['panPhoto', uri],
          ['panPhotoUrl', downloadUrl],
        ]);

        if (onUpload) {
          onUpload(pan);
        } else {
          router.push('/kyc/UploadDocuments_1');
        }
      } catch (error) {
        console.error('Error uploading PAN:', error);
        Alert.alert('Upload failed', 'Unable to upload PAN document. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleCamera = async () => {
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
      await processImage(result);
    } catch (error) {
      console.error('Error capturing document:', error);
      Alert.alert('Error', 'Failed to capture image');
    }
  };

  const handleGallery = async () => {
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
      await processImage(result);
    } catch (error) {
      console.error('Error selecting document:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleSelectOptions = () => {
    if (!isValid) return;
    Alert.alert(
      'Upload Document',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: handleCamera },
        { text: 'Choose from Gallery', onPress: handleGallery },
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
          <Text style={styles.heading}>Enter your Pan details (Optional)</Text>
          <Text style={styles.subheading}>Upload your own documents for a faster process!</Text>

          <View style={styles.cardContainer}>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={styles.cardImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderBox}>
                <Text style={styles.placeholderText}>No image selected</Text>
              </View>
            )}
          </View>

          {/* Pan Number Input */}
          <View style={[styles.inputWrapper, focused && styles.inputWrapperFocused]}>
            <Text
              style={[
                styles.floatingLabel,
                (focused || pan.length > 0) && styles.floatingLabelFocused,
              ]}
            >
              Enter PAN number
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={pan}
                onChangeText={handleChange}
                autoCapitalize="characters"
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                maxLength={10}
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
            By clicking 'Continue' you give authorization to verify your PAN card.
          </Text>
        </ScrollView>

        {/* Bottom Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.uploadBtn, isValid && styles.uploadBtnActive]}
            onPress={handleSelectOptions}
            activeOpacity={isValid ? 0.85 : 1}
            disabled={!isValid || isUploading}
          >
            <Text style={[styles.uploadText, isValid && styles.uploadTextActive]}>
              {isUploading ? 'Uploading...' : 'Upload Document'}
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
  },
  cardImage: {
    width: width,
    height: (width) * 0.6,
  },
  placeholderBox: {
    width: width - 80,
    height: (width) * 0.4,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ddd',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  placeholderText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
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
