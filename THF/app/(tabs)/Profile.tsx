import { signOut } from '@/lib/auth';
import { clearUserCache, useUserStore } from '@/src/hooks/useUserStore';
import { auth } from '@/src/services/firebaseConfig';
import { clearSession } from '@/src/services/sessionStorage';
import { getPartnerBookings } from '@/src/services/bookingService';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Navbar from '../../components/Navbar';
import { useLanguage } from '@/src/hooks/useLanguage';

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
            router.replace('/welcome/LanguageSelect');
          } catch (error) {
            Alert.alert(t('error'), t('failedLogout'));
          }
        },
      },
    ]);
  };

  if (loading && !profile) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color="#E8304A" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
          <View style={styles.avatarWrapper}>
            {profile?.kycDocuments?.selfieUrl ? (
              <Image 
                source={{ uri: profile.kycDocuments.selfieUrl }} 
                style={styles.avatar} 
                contentFit="cover" 
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{chefName ? chefName.charAt(0).toUpperCase() : '?'}</Text>
              </View>
            )}
          </View>
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

        {/* ── KYC Status Row ── */}
        {/* ── Stats Section ── */}
        <View style={styles.threeStatsRow}>
          <View style={styles.threeStatCard}>
            <Text style={styles.threeStatValue}>{stats.bookings}</Text>
            <Text style={styles.threeStatLabel}>{t('bookings')}</Text>
          </View>
          <View style={styles.threeStatCard}>
            <Text style={styles.threeStatValue}>
              {stats.earnings >= 1000 ? `₹${(stats.earnings / 1000).toFixed(1)}k` : `₹${stats.earnings}`}
            </Text>
            <Text style={styles.threeStatLabel}>{t('earnings')}</Text>
          </View>
          <View style={styles.threeStatCard}>
            <Text style={styles.threeStatValue}>{profile?.experience?.length || 0}</Text>
            <Text style={styles.threeStatLabel}>{t('expTags')}</Text>
          </View>
        </View>

        {/* ── Menu Items ── */}
        <View style={styles.menuSection}>
          <MenuRow label={t('accountDetail')} onPress={() => router.push('/edit/AccountDetails')} />
          <View style={styles.menuDivider} />
          <MenuRow label={t('bankDetails')} onPress={() => router.push('/edit/EditDetails')} />
          <View style={styles.menuDivider} />
          <MenuRow label={t('referFriend')} badge={t('referBadge')} onPress={() => router.push('/edit/ReferFriend')} />
          <View style={styles.menuDivider} />
          <MenuRow label={t('changeLanguage')} onPress={() => router.push('/edit/ChangeLanguage')} />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>

        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ── Styles ── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7' },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
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
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
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
});

const menuStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  label: { fontSize: 15, color: '#222', fontWeight: '400' },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    backgroundColor: '#FFF9E0',
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  badgeText: { fontSize: 11, color: '#B8860B', fontWeight: '600' },
  chevron: { fontSize: 20, color: '#ccc', fontWeight: '300' },
});


