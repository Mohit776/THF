import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { linkKycToUser } from '@/src/services/kycStorageService';

interface DocumentItem {
  id: string;
  label: string;
  uploaded: boolean;
  optional?: boolean;
}

interface UploadDocumentsScreenProps {
  docs?: DocumentItem[];
  onBack?: () => void;
  onContinue?: (docs: DocumentItem[]) => void;
  onDocumentPress?: (doc: DocumentItem) => void;
  onSkip?: () => void;
}

const DEFAULT_DOCS: DocumentItem[] = [
  { id: 'selfie', label: 'Upload profile picture (Selfie)', uploaded: false },
  { id: 'aadhar', label: 'Upload Aadhar card front & back', uploaded: false },
  { id: 'pan', label: 'Upload PAN number (Optional)', uploaded: false, optional: true },
];

export default function UploadDocumentsScreen({
  docs: initialDocs = DEFAULT_DOCS,
  onBack,
  onContinue,
  onDocumentPress,
  onSkip,
}: UploadDocumentsScreenProps) {
  const router = useRouter();
  const [docs, setDocs] = useState<DocumentItem[]>(initialDocs);
  const [isLinking, setIsLinking] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const syncUploadedStatus = async () => {
        try {
          const values = await AsyncStorage.multiGet([
            'profilePhotoUrl',
            'aadharPhotoUrl',
            'aadharPhotoBackUrl',
            'panPhotoUrl',
          ]);

          const isValid = (val: string | null) => 
            typeof val === 'string' && val.trim() !== '' && val !== 'null' && val !== 'undefined' && val !== 'false';

          const uploadedMap = {
            selfie: isValid(values[0][1]),
            aadhar: isValid(values[1][1]) && isValid(values[2][1]), // Both front & back required
            pan: isValid(values[3][1]),
          };

          setDocs((prev) =>
            prev.map((doc) => ({
              ...doc,
              uploaded: uploadedMap[doc.id as keyof typeof uploadedMap],
            }))
          );
        } catch (error) {
          console.error('Failed to sync uploaded document status:', error);
        }
      };

      syncUploadedStatus();
    }, [])
  );

  const allUploaded = docs.every((d) => d.optional || d.uploaded);

  const handleDocPress = (doc: DocumentItem) => {
    onDocumentPress?.(doc);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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

        <View style={styles.content}>
          <Text style={styles.heading}>Upload documents</Text>
          <Text style={styles.subheading}>
            Please submit the below documents for verification & upload originals to avoid rejection
          </Text>

          <View style={styles.docList}>
            {docs.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                style={styles.docRow}
                onPress={() => {
                  handleDocPress(doc);
                  switch (doc.id) {
                    case 'selfie':
                      router.push('/kyc/Selfie');
                      break;
                    case 'aadhar':
                      router.push('/kyc/Aadhar');
                      break;
                    case 'pan':
                      router.push('/kyc/Pan');
                      break;
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.docLabel}>{doc.label}</Text>
                {doc.uploaded ? (
                  <View style={styles.statusIcon}>
                    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                        fill="#16A34A"
                      />
                      <Path
                        d="m10.25 15.35-2.9-2.9a1 1 0 1 1 1.42-1.42l2.2 2.2 4.18-4.18a1 1 0 0 1 1.41 1.42l-4.88 4.88a1 1 0 0 1-1.43 0z"
                        fill="#FFFFFF"
                      />
                    </Svg>
                  </View>
                ) : (
                  <Text style={styles.chevron}>›</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueBtn, allUploaded && styles.continueBtnActive]}
            onPress={async () => {
              if (allUploaded) {
                if (onContinue) {
                  onContinue(docs);
                } else {
                  setIsLinking(true);
                  try {
                    const values = await AsyncStorage.multiGet([
                      'profilePhotoUrl',
                      'aadharPhotoUrl',
                      'aadharPhotoBackUrl',
                      'panPhotoUrl',
                    ]);
                    
                    const kycData = {
                      selfieUrl: values[0][1] || '',
                      aadharFrontUrl: values[1][1] || '',
                      aadharBackUrl: values[2][1] || '',
                      panUrl: values[3][1] || ''
                    };
                    
                    await linkKycToUser(kycData);
                    router.push('/(tabs)/Dashboard');
                  } catch (error) {
                    console.error('Failed to link KYC documents:', error);
                    Alert.alert('Error', 'Failed to link documents. Please try again.');
                  } finally {
                    setIsLinking(false);
                  }
                }
              }
            }}
            activeOpacity={allUploaded ? 0.85 : 1}
            disabled={!allUploaded || isLinking}
          >
            {isLinking ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.continueText, allUploaded && styles.continueTextActive]}>
                Continue
              </Text>
            )}
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

  backBtn: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4, alignSelf: 'flex-start' },
  backArrow: { fontSize: 22, color: '#3b5bdb', fontWeight: '500' },

  content: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
  heading: { fontSize: 24, fontWeight: '700', color: '#111', marginBottom: 8 },
  subheading: { fontSize: 13, color: '#888', lineHeight: 20, marginBottom: 28 },

  docList: { gap: 12 },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    borderRadius: 10,
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  docLabel: { fontSize: 15, color: '#333', fontWeight: '400', flex: 1 },
  statusIcon: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  chevron: { fontSize: 22, color: '#aaa' },

  footer: { paddingHorizontal: 20, paddingBottom: 36, paddingTop: 12, gap: 14 },
  continueBtn: {
    borderRadius: 14,
    paddingVertical: 17,
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
  continueText: { fontSize: 16, fontWeight: '600', color: '#aaa', letterSpacing: 0.3 },
  continueTextActive: { color: '#fff' },
  skipBtn: { alignItems: 'center', paddingVertical: 4 },
  skipText: { fontSize: 14, color: '#E8304A', fontWeight: '500' },
});
