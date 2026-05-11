import { signOut } from '@/lib/auth';
import { clearUserCache, useUserStore } from '@/src/hooks/useUserStore';
import { auth, storage } from '@/src/services/firebaseConfig';
import { clearSession } from '@/src/services/sessionStorage';
import { getPartnerBookings } from '@/src/services/bookingService';
import { updateUserProfile } from '@/src/services/userService';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Navbar from '../../components/Navbar';
import { useLanguage } from '@/src/hooks/useLanguage';
import { Fonts } from '@/src/theme/fonts';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { CustomText as Text } from '../../components/CustomText';

/* ── Types ── */
interface ProfileScreenProps {
  chefName?: string;
  chefId?: string;
  specialty?: string;
  cuisine?: string;
  city?: string;
  isVerified?: boolean;
  profileImage?: any;
  bookings?: number;
  earnings?: string;
  experience?: number;
  onHelp?: () => void;
  onEditProfile?: () => void;
  onAccountDetail?: () => void;
  onBankDetails?: () => void;
  onReferFriend?: () => void;
  onReferCustomer?: () => void;
  onChangeLanguage?: () => void;
  onTabChange?: (tab: string) => void;
}

/* ── Menu Row ── */
function MenuRow({
  label,
  badge,
  onPress,
}: {
  label: string;
  badge?: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={menuStyles.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={menuStyles.label}>{label}</Text>
      <View style={menuStyles.right}>
        {badge && (
          <View style={menuStyles.badge}>
            <Text style={menuStyles.badgeText}>{badge}</Text>
          </View>
        )}
        <Text style={menuStyles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

/* ── Main Screen ── */
export default function ProfileScreen() {
  const router = useRouter();
  const { profile, loading, refresh } = useUserStore();
  const { t } = useLanguage();
  const [refreshing, setRefreshing] = React.useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [stats, setStats] = React.useState({ bookings: 0, earnings: 0 });

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    if (refresh) await refresh();
    setRefreshing(false);
  }, [refresh]);

  React.useEffect(() => {
    async function loadStats() {
      if (profile?.userId) {
        try {
          const bookings = await getPartnerBookings(profile.userId);
          const completedBookings = bookings.filter((b: any) => b.status === 'completed');
          const totalEarnings = completedBookings.reduce((sum: number, b: any) => sum + (Number(b.amount) || 0), 0);

          setStats({
            bookings: bookings.length,
            earnings: totalEarnings,
          });
        } catch (error) {
          console.error("Failed to load stats:", error);
        }
      }
    }
    loadStats();
  }, [profile?.userId, refreshing]);

  const chefName = profile?.name ?? '';
  const chefId = auth.currentUser?.uid?.slice(0, 6).toUpperCase() ?? '----';
  const isVerified = profile?.kycStatus === 'approved';
  const city = profile?.city ?? '';
  const language = profile?.language ?? 'en';

  const handleLogout = () => {
    Alert.alert(t('logoutTitle'), t('logoutConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('logout'),
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            await clearUserCache();
            await clearSession();

            // Clear all KYC / document caches to prevent cross-account data leaks
            const kycKeys = [
              'profilePhotoUrl',
              'aadharPhotoUrl',
              'aadharPhotoBackUrl',
              'aadharPhoto',
              'aadharPhotoBack',
              'panPhotoUrl',
              'ignored_bookings',
            ];
            await AsyncStorage.multiRemove(kycKeys);

            router.replace('/welcome/LanguageSelect');
          } catch (error) {
            Alert.alert(t('error'), t('failedLogout'));
          }
        },
      },
    ]);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      uploadProfileImage(result.assets[0].uri);
    }
  };

  const uploadProfileImage = async (uri: string) => {
    if (!profile?.userId) return;
    setUploadingImage(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const fileRef = ref(storage, `kycdocuments/${profile.userId}_selfie_${Date.now()}`);
      await uploadBytes(fileRef, blob);
      const downloadURL = await getDownloadURL(fileRef);

      // Update Firestore user document
      const currentKycData = profile.kycDocuments || {};
      const newKycData = { ...currentKycData, selfieUrl: downloadURL } as any;
      await updateUserProfile(profile.userId, { kycDocuments: newKycData });

      // Refresh store & caches
      if (refresh) await refresh();
      Alert.alert('Success', 'Profile photo updated successfully!');
    } catch (error: any) {
      console.error("Image upload failed:", error);
      Alert.alert('Upload Failed', "Could not upload profile picture. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const insets = useSafeAreaInsets();

  if (loading && !profile) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', paddingTop: insets.top }]}>
        <ActivityIndicator color="#E8304A" size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Navbar />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E8304A" />}
      >
        <Text style={styles.pageTitle}>{t('myProfile')}</Text>

        {/* ── Profile Card ── */}
        <View style={styles.profileCard}>
          <TouchableOpacity 
            style={styles.avatarWrapper} 
            activeOpacity={0.8} 
            onPress={handlePickImage}
            disabled={uploadingImage}
          >
            {uploadingImage ? (
              <View style={[styles.avatarPlaceholder, { backgroundColor: '#ddd' }]}>
                <ActivityIndicator color="#E8304A" />
              </View>
            ) : profile?.kycDocuments?.selfieUrl ? (
              <View>
                <Image
                  source={{ uri: profile.kycDocuments.selfieUrl }}
                  style={styles.avatar}
                  contentFit="cover"
                />
                <View style={styles.editImageBadge}>
                  <Image source={require('@/assets/THF/edit.svg')} style={{ width: 12, height: 12, tintColor: '#fff' }} />
                </View>
              </View>
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{chefName ? chefName.charAt(0).toUpperCase() : '?'}</Text>
                <View style={styles.editImageBadge}>
                  <Image source={require('@/assets/THF/edit.svg')} style={{ width: 12, height: 12, tintColor: '#fff' }} />
                </View>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{chefName || 'Partner'}</Text>
          </View>
          <Text style={styles.specialty}>{t('partner')} | {city || t('cityNotSet')}</Text>
          <View style={styles.badgeRow}>
            {isVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>{t('verified')}</Text>
              </View>
            )}
            <View style={styles.chefIdBadge}>
              <Text style={styles.chefIdText}>Chef-id: {chefId}</Text>
            </View>
          </View>
        </View>


    

        {/* ── Menu Items ── */}
        <View style={styles.menuSection}>
          <MenuRow label={t('accountDetail') || 'Account detail'} onPress={() => router.push('/edit/EditDetails')} />
          <MenuRow label={t('jobPreference') || 'Job preference'} onPress={() => router.push({ pathname: '/kyc/JobPreference', params: { isEditMode: 'true' } })} />
          <MenuRow label={t('workExperience') || 'Work experience'} onPress={() => router.push({ pathname: '/kyc/Experience', params: { isEditMode: 'true' } })} />
          <MenuRow label={t('cuisineType') || 'Cuisine type'} onPress={() => router.push({ pathname: '/kyc/Cuisines', params: { isEditMode: 'true' } })} />
          <MenuRow label={t('bankDetails') || 'Bank details'} onPress={() => router.push('/edit/AccountDetails')} />
          <MenuRow label={t('referFriend') || 'Refer a friend & Earn'} badge="Earn upto ₹5000" onPress={() => router.push('/edit/ReferFriend')} />
          <MenuRow label={t('changeLanguage') || 'Change Language'} onPress={() => router.push('/edit/ChangeLanguage')} />
          <MenuRow label={t('logout') || 'Log out'} onPress={handleLogout} />
        </View>

        <View style={styles.footerInfo}>
          <Text style={styles.versionText}>Version {Constants.expoConfig?.version ?? '1.0.0'}</Text>
          <Text style={styles.developerText}>Developed by The Famous Halwai</Text>

        </View>

        <View style={{ height: 16 }} />
      </ScrollView>
    </View>
  );
}

/* ── Styles ── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 16 },

  /* Profile Card */
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d3dbe2',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6,  
    elevation: 5,
    
  },
  avatarWrapper: { marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8304A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { color: '#fff', fontSize: 32, fontWeight: '700' },
  editImageBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#111',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  name: { fontSize: 20, fontWeight: '700', color: '#111' },
  editBtn: { padding: 2 },
  editIcon: { fontSize: 16 },
  specialty: { fontSize: 13, color: '#888', marginBottom: 12 },
  badgeRow: { flexDirection: 'row', gap: 8 },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  verifiedText: { fontSize: 12, color: '#2e7d32', fontWeight: '500' },
  chefIdBadge: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  chefIdText: { fontSize: 12, color: '#555', fontWeight: '500' },

  /* Stats */
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d3dbe2'
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#999' },
  statDivider: { width: 1, backgroundColor: '#f0f0f0', marginVertical: 4 },

  /* 3-Card Stats */
  threeStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 16,
  },
  threeStatCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e4e7',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  threeStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1f36',
    marginBottom: 4,
  },
  threeStatLabel: {
    fontSize: 11,
    color: '#8792a2',
  },

  /* Menu Section */
  menuSection: {
    paddingVertical: 10,
  },
  menuDivider: { height: 1, backgroundColor: '#f5f5f5', marginHorizontal: 16 },

  /* KYC Card */

  kycLabel: { fontSize: 14, color: '#555', fontWeight: '500' },
  kycValue: { fontSize: 14, fontWeight: '700', color: '#B8860B' },
  logoutBtn: {
    marginTop: 14,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3D4D9',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E8304A',
  },
  footerInfo: {
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
    fontFamily: Fonts.medium,
  },
  developerText: {
    paddingTop: 4,
    fontSize: 13,
    color: '#bbb',
    fontFamily: Fonts.regular,
  },
});

const menuStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  label: { fontSize: 15, color: '#374151', fontWeight: '400' },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    backgroundColor: '#ffedd5',
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  badgeText: { fontSize: 11, color: '#d97706', fontWeight: '600' },
  chevron: { fontSize: 20, color: '#9ca3af', fontWeight: '300' },
});


