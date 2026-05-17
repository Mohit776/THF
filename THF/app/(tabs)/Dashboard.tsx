import { useUserStore } from '@/src/hooks/useUserStore';
import { getPartnerBookings, type Booking as FirestoreBooking, listenToBroadcastedBookings, acceptBroadcastedBooking } from '@/src/services/bookingService';
import { registerForPushNotifications, sendLocalNotification } from '@/src/services/notificationService';
import { auth } from '@/src/services/firebaseConfig';
import dayjs from 'dayjs';
import { Image } from 'expo-image';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StatusBar, StyleSheet, RefreshControl, TouchableOpacity, View, Linking, Alert, Modal, Animated, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import Navbar from '../../components/Navbar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '@/src/hooks/useLanguage';
import { CustomText as Text } from '../../components/CustomText';
const { width } = Dimensions.get('window');

/* ── Types ── */
interface Booking {
  id: string;
  time: string;
  period: string;
  nextUpLabel: string;
  clientName: string;
  occasion: string;
  guests: number;
  location: string;
  address?: string;
  phone?: string;
  cuisine?: string;
}

interface DashboardScreenProps {
  chefName?: string;
  chefId?: string;
  isVerified?: boolean;
  profileImage?: any;
  bookings?: number;
  earned?: number;
  ratings?: number;
  todaysBookings?: Booking[];
  onHelp?: () => void;
  onViewDetail?: (booking: Booking) => void;
  onLocation?: (booking: Booking) => void;
  onCallClient?: (booking: Booking) => void;
}

/* ── Summary Card ── */

const BookingIcon = ({ }) => (
  <Image source={require('@/assets/THF/simple-line-icons_calender.svg')} style={{ width: 20, height: 20 }} />
);

const WalletIcon = ({ }) => (
  <Image source={require('@/assets/THF/Group 1171283276.svg')} style={{ width: 20, height: 20 }} />
);

const KycIcon = ({ }) => (
  <Image source={require('@/assets/THF/Star 1.svg')} style={{ width: 20, height: 20 }} />
);

function SummaryCard({
  icon,
  label,
  value,
  iconBg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconBg: string;
}) {
  return (
    <View style={summaryStyles.card}>
      <View style={[summaryStyles.iconBox, { backgroundColor: iconBg }]}>
        {icon}
      </View>
      <Text style={summaryStyles.label}>{label}</Text>
      <Text style={summaryStyles.value}>{value}</Text>
    </View>
  );
}

/* ── Booking Card ── */
function BookingCard({
  booking,
  showActions,
  onViewDetail,
  onLocation,
  onCallClient,
  t,
}: {
  booking: Booking;
  showActions: boolean;
  onViewDetail?: () => void;
  onLocation?: () => void;
  onCallClient?: () => void;
  t: (key: any) => string;
}) {
  return (
    <View style={bookingStyles.card}>
      <View style={bookingStyles.row}>
        {/* Time */}
        <View style={bookingStyles.timeBox}>
          <Text style={bookingStyles.timeNum}>{booking.time}</Text>
          <Text style={bookingStyles.timePeriod}>{booking.period}</Text>
        </View>

        {/* Info */}
        <View style={bookingStyles.info}>
          <Text style={bookingStyles.nextUp}>{booking.nextUpLabel}</Text>
          <Text style={bookingStyles.clientName}>{booking.clientName}</Text>
          <Text style={bookingStyles.meta}>
            {booking.occasion} | {booking.guests} {t('guests')} | {booking.address ? `${booking.address}, ` : ''}{booking.location}
          </Text>
        </View>
      </View>

      {showActions && (
        <>
          <View style={bookingStyles.divider} />
          <View style={bookingStyles.actions}>
            <TouchableOpacity style={bookingStyles.viewBtn} onPress={onViewDetail} activeOpacity={0.8}>
              <Text style={bookingStyles.viewBtnText}>{t('viewDetail')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={bookingStyles.locationBtn} onPress={onLocation} activeOpacity={0.8}>
              <Text style={bookingStyles.locationBtnText}>{t('navigate')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={bookingStyles.callBtn} onPress={onCallClient} activeOpacity={0.8}>
              <Ionicons name="call-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={bookingStyles.callBtnText}> {t('callClient')}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}



/* ── Broadcasted Booking Card ── */
function BroadcastedBookingCard({
  booking,
  onAccept,
  isAccepting,
  onIgnore,
  t,
}: {
  booking: FirestoreBooking & { bookingId?: string };
  onAccept: () => void;
  isAccepting: boolean;
  onIgnore: () => void;
  t: (key: any) => string;
}) {
  const bTime = booking.date ? dayjs((booking.date as any).toDate?.() ?? booking.date) : dayjs(null);
  const slideAnim = React.useRef(new Animated.Value(100)).current; // slide up from 100px

  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      damping: 15,
      stiffness: 200,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  return (
    <Animated.View style={[bookingStyles.card, { transform: [{ translateY: slideAnim }] }]}>
      <View style={bookingStyles.row}>
        {/* Time */}
        <View style={bookingStyles.timeBox}>
          <Text style={bookingStyles.timeNum}>{bTime.isValid() ? bTime.format('hh') : '--'}</Text>
          <Text style={bookingStyles.timePeriod}>{bTime.isValid() ? bTime.format('a') : '--'}</Text>
        </View>

        {/* Info */}
        <View style={bookingStyles.info}>
          <Text style={[bookingStyles.nextUp, { color: '#E8304A', fontWeight: 'bold' }]}>{t('newBookingAvailable')}</Text>
          <Text style={bookingStyles.clientName}>{booking.clientName}</Text>
          <Text style={bookingStyles.meta}>
            {bTime.isValid() ? bTime.format('MMM DD, YYYY') : ''} | {booking.eventType} | {booking.guests} guests
          </Text>
          <Text style={bookingStyles.meta} numberOfLines={1}>
            {booking.address ? `${booking.address}, ` : ''}{booking.location}
          </Text>
          <Text style={{ marginTop: 4, fontWeight: 'bold', color: '#111', fontSize: 13 }}>
            {t('amount')}: ₹{booking.amount}
          </Text>
        </View>
      </View>

      <View style={bookingStyles.divider} />
      <View style={bookingStyles.actions}>
        <TouchableOpacity
          style={[bookingStyles.locationBtn, { backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#DDD' }]}
          onPress={onIgnore}
          activeOpacity={0.8}
        >
          <Text style={[bookingStyles.locationBtnText, { color: '#666' }]}>{t('ignore')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[bookingStyles.locationBtn, { backgroundColor: '#31B76B' }]}
          onPress={onAccept}
          disabled={isAccepting}
          activeOpacity={0.8}
        >
          {isAccepting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={bookingStyles.locationBtnText}>{t('acceptBooking')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

/* ── Main Screen ── */
export default function DashboardScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { profile, loading: profileLoading, refresh: refreshProfile } = useUserStore();
  const [bookings, setBookings] = useState<FirestoreBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const [broadcastedBookings, setBroadcastedBookings] = useState<(FirestoreBooking & { bookingId?: string })[]>([]);
  const [acceptingBookingId, setAcceptingBookingId] = useState<string | null>(null);
  const [ignoredBookingIds, setIgnoredBookingIds] = useState<string[]>([]);

  const prevBroadcastCount = useRef(0);

  // Disable back button on Dashboard
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp();
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  // Register push token on mount
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (uid) {
      registerForPushNotifications(uid);
    }

    const loadIgnored = async () => {
      const stored = await AsyncStorage.getItem('ignored_bookings');
      if (stored) setIgnoredBookingIds(JSON.parse(stored));
    };
    loadIgnored();
  }, [profile]);

  useEffect(() => {
    if (!auth.currentUser?.uid) return;

    const unsubscribe = listenToBroadcastedBookings((bBookings) => {
      prevBroadcastCount.current = bBookings.length;
      setBroadcastedBookings(bBookings);
    });
    return () => unsubscribe();
  }, [profile]);

  const handleAcceptBroadcastedBooking = async (bookingId: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert('Error', 'Not authenticated');
      return;
    }
    setAcceptingBookingId(bookingId);
    try {
      if (bookingId) {
        await acceptBroadcastedBooking(bookingId, uid);
        Alert.alert('Success', 'Booking accepted successfully!');
        await fetchDashboardData();
      }
    } catch (error: any) {
      Alert.alert(t('error'), error.message || 'Failed to accept booking. It might have been claimed by someone else.');
    } finally {
      setAcceptingBookingId(null);
    }
  };

  const handleIgnoreBroadcastedBooking = async (bookingId: string) => {
    const newIgnored = [...ignoredBookingIds, bookingId];
    setIgnoredBookingIds(newIgnored);
    try {
      await AsyncStorage.setItem('ignored_bookings', JSON.stringify(newIgnored));
    } catch (e) {
      console.error('Failed to save ignored booking', e);
    }
  };

  const fetchDashboardData = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
      if (refreshProfile) await refreshProfile();
      const data = await getPartnerBookings(uid);
      setBookings(data);
    } catch (error) {
      console.error(error);
    }
  }, [refreshProfile]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData().finally(() => setBookingsLoading(false));
  }, [fetchDashboardData]);

  const chefName = profile?.name ?? '';
  const chefId = auth.currentUser?.uid?.slice(0, 6).toUpperCase() ?? '----';
  const isVerified = profile?.kycStatus === 'approved';

  // Today's bookings (status = active or accepted with today's date)
  const todayStr = dayjs().format('YYYY-MM-DD');
  const todaysBookings = bookings.filter((b) => {
    const bDate = b.date ? dayjs((b.date as any).toDate?.() ?? b.date).format('YYYY-MM-DD') : null;
    return bDate === todayStr && (b.status === 'active' || b.status === 'accepted' || b.status === 'pending');
  });

  // Stats: total bookings & earnings
  const totalBookingsCount = bookings.length;
  const totalEarned = bookings.reduce((sum, b) => sum + (b.amount ?? 0), 0);

  // Today's completed bookings earnings
  const todayStr_long = dayjs().format('YYYY-MM-DD');
  const todayEarned = bookings.reduce((sum, b) => {
    const bDate = b.date ? dayjs((b.date as any).toDate?.() ?? b.date).format('YYYY-MM-DD') : null;
    if (bDate === todayStr_long && b.status === 'completed') {
      return sum + (b.amount ?? 0);
    }
    return sum;
  }, 0);


  const insets = useSafeAreaInsets();

  if (profileLoading && !profile) {
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

        {/* ── Welcome Card ── */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeLeft}>
            <Text style={styles.welcomeHi}>{t('welcome')}</Text>
            <Text style={styles.welcomeName}>{chefName || 'Partner'}</Text>
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
          <View style={styles.avatarPlaceholder}>
            {profile?.kycDocuments?.selfieUrl ? (
              <Image
                source={{ uri: profile.kycDocuments.selfieUrl }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <Text style={styles.avatarInitial}>
                {chefName ? chefName.charAt(0).toUpperCase() : '?'}
              </Text>
            )}
          </View>
        </View>

        {/* ── Broadcasted Bookings ── */}
        {isVerified && broadcastedBookings.filter(b => b.bookingId && !ignoredBookingIds.includes(b.bookingId)).length > 0 && (
          <View style={{ marginBottom: 16 }}>
            {broadcastedBookings
              .filter(b => b.bookingId && !ignoredBookingIds.includes(b.bookingId))
              .map((b) => (
                <BroadcastedBookingCard
                  key={b.bookingId}
                  booking={b}
                  onAccept={() => b.bookingId && handleAcceptBroadcastedBooking(b.bookingId)}
                  isAccepting={acceptingBookingId === b.bookingId}
                  onIgnore={() => b.bookingId && handleIgnoreBroadcastedBooking(b.bookingId)}
                  t={t}
                />
              ))}
          </View>
        )}

        {/* ── Today's Summary ── */}
        <Text style={styles.sectionTitle}>{t('todaySummary')}</Text>
        <View style={styles.summaryRow}>
          <SummaryCard icon={<BookingIcon />} label={t('bookings')} value={String(todaysBookings.length)} iconBg="#ffffff" />
          <SummaryCard icon={<WalletIcon />} label={t('earned')} value={`₹${todayEarned}`} iconBg="#ffffff" />
          <SummaryCard icon={<KycIcon />} label={t('ratings')} value={'4.8'} iconBg="#ffffff" />
        </View>

        {isVerified && <Text style={styles.sectionTitle}>{t('todayBookings')}</Text>}

        {/* ── Today's Bookings ── */}
        {!profile?.kycDocuments ? (
          <View style={styles.verificationCard}>
            <Text style={styles.verificationTitle}>{t('noBookingKyc')}</Text>
            <Text style={styles.verificationSubtitle}>
              {t('kycRequired')}
            </Text>
            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={() => router.push('/kyc/UploadDocuments_1')}
              activeOpacity={0.8}
            >
              <Text style={styles.uploadBtnText}>{t('uploadDocument')}</Text>
            </TouchableOpacity>
          </View>
        ) : (profile?.kycStatus === 'pending' || profile?.kycStatus === 'pending_verification') ? (
          <View style={styles.verificationCard}>
            <Text style={styles.verificationTitle}>{t('pendingVerification')}</Text>
            <Text style={styles.verificationSubtitle}>
              {t('pendingVerifMsg')}
            </Text>
          </View>
        ) : !isVerified ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>{t('noBookingKyc')}</Text>
          </View>
        ) : bookingsLoading && !refreshing ? (
          <ActivityIndicator color="#E8304A" style={{ marginTop: 20 }} />
        ) : todaysBookings.length === 0 ? (
          <View style={styles.emptyCard}>

            <Text style={styles.emptyText}>{t('noBookingsToday')}</Text>
          </View>
        ) : (

          todaysBookings.map((booking, index) => (
            <BookingCard
              key={booking.bookingId}
              booking={{
                id: booking.bookingId,
                time: dayjs((booking.date as any).toDate?.() ?? booking.date).format('hh'),
                period: dayjs((booking.date as any).toDate?.() ?? booking.date).format('a'),
                nextUpLabel: index === 0 ? 'Next up' : 'Upcoming',
                clientName: booking.clientName,
                occasion: booking.eventType,
                guests: booking.guests,
                location: booking.location,
                address: booking.address,
                phone: booking.phone,
                cuisine: booking.cuisine,
              }}
              showActions={index === 0}
              t={t}
              onViewDetail={() => {
                setSelectedBooking({
                  id: booking.bookingId,
                  time: dayjs((booking.date as any).toDate?.() ?? booking.date).format('hh'),
                  period: dayjs((booking.date as any).toDate?.() ?? booking.date).format('a'),
                  nextUpLabel: index === 0 ? t('nextUp') : t('upcoming'),
                  clientName: booking.clientName,
                  occasion: booking.eventType,
                  guests: booking.guests,
                  location: booking.location,
                  address: booking.address,
                  phone: booking.phone,
                  cuisine: booking.cuisine,
                });
              }}
              onCallClient={() => {
                if (booking.phone) {
                  Linking.openURL(`tel:${booking.phone}`);
                } else {
                  Alert.alert(t('unavailable'), t('phoneNotProvided'));
                }
              }}
              onLocation={() => {
                const targetAddress = booking.address ? `${booking.address}, ${booking.location}` : booking.location;
                if (targetAddress) {
                  router.push({
                    pathname: '/edit/MapScreen',
                    params: {
                      address: targetAddress,
                      bookingId: booking.bookingId ?? '',
                      title: booking.clientName ?? '',
                      time: dayjs((booking.date as any).toDate?.() ?? booking.date).format('hh:mm A'),
                      location: targetAddress,
                      guests: String(booking.guests ?? 0),
                      cuisine: booking.cuisine ?? '',
                      occasion: booking.eventType ?? '',
                    },
                  });
                }
              }}
            />
          ))
        )}

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* ── Booking Detail Modal ── */}
      <Modal
        visible={!!selectedBooking}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedBooking(null)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modalContainer}>
            <View style={modalStyles.headerRow}>
              <Text style={modalStyles.nextUpText}>{selectedBooking?.nextUpLabel} - in 2 hours</Text>
              <TouchableOpacity style={modalStyles.closeButton} onPress={() => setSelectedBooking(null)} activeOpacity={0.8}>
                <Ionicons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={modalStyles.title}>
              {selectedBooking?.clientName}
            </Text>
            <View style={modalStyles.detailRow}>
              <Text style={modalStyles.detailLabel}>Occasion: </Text>
              <Text style={modalStyles.detailValue}>{selectedBooking?.occasion}</Text>
            </View>
            <View style={modalStyles.detailRow}>
              <Text style={modalStyles.detailLabel}>Time: </Text>
              <Text style={modalStyles.detailValue}>{selectedBooking?.time} - {selectedBooking?.period}</Text>
            </View>
            <View style={modalStyles.detailRow}>
              <Text style={modalStyles.detailLabel}>Location: </Text>
              <Text style={modalStyles.detailValue}>{selectedBooking?.address ? `${selectedBooking.address}, ` : ''}{selectedBooking?.location}</Text>
            </View>
            <View style={modalStyles.detailRow}>
              <Text style={modalStyles.detailLabel}>No. of People: </Text>
              <Text style={modalStyles.detailValue}>{selectedBooking?.guests} guests</Text>
            </View>
            <View style={modalStyles.detailRow}>
              <Text style={modalStyles.detailLabel}>Cuisine Type: </Text>
              <Text style={modalStyles.detailValue}>{selectedBooking?.cuisine || 'Not specified'}</Text>
            </View>



            <View style={modalStyles.actionRow}>
              <TouchableOpacity
                style={modalStyles.actionButtonBlue}
                activeOpacity={0.8}
                onPress={() => {
                  const targetAddress = selectedBooking?.address ? `${selectedBooking.address}, ${selectedBooking.location}` : selectedBooking?.location;
                  if (targetAddress) {
                    setSelectedBooking(null);
                    router.push({
                      pathname: '/edit/MapScreen',
                      params: {
                        address: targetAddress,
                        bookingId: selectedBooking?.id ?? '',
                        title: selectedBooking?.clientName ?? '',
                        time: `${selectedBooking?.time} ${selectedBooking?.period}`,
                        location: targetAddress,
                        guests: String(selectedBooking?.guests ?? 0),
                        cuisine: selectedBooking?.cuisine ?? '',
                        occasion: selectedBooking?.occasion ?? '',
                      },
                    });
                  }
                }}
              >
                <Text style={modalStyles.actionButtonText}>{t('navigate')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={modalStyles.actionButtonGreen}
                activeOpacity={0.8}
                onPress={() => {
                  if (selectedBooking?.phone) {
                    Linking.openURL(`tel:${selectedBooking.phone}`);
                  } else {
                    Alert.alert(t('unavailable'), t('phoneNotProvided2'));
                  }
                }}
              >
                <Ionicons name="call-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={modalStyles.actionButtonText}>{t('callClient')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 80,
    borderWidth: 1,
    borderColor: '#d3dbe2',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nextUpText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: '#9ca3af',
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    lineHeight: 28,
  },
  detailText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 20,
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 15,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
    flex: 1,
  },
  mapPlaceholder: {
    height: 120,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  mapText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  mapSubText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButtonBlue: {
    flex: 1,
    backgroundColor: '#4591E8',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionButtonGreen: {
    flex: 1,
    backgroundColor: '#31B76B',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

/* ── Styles ── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },



  /* Welcome Card */
  welcomeCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#d3dbe2',
  },
  welcomeLeft: { flex: 1 },
  welcomeHi: { fontSize: 13, color: '#888', marginBottom: 2 },
  welcomeName: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 10 },
  badgeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
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
  avatar: { width: 64, height: 64, borderRadius: 32 },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8304A',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  avatarInitial: { color: '#fff', fontSize: 24, fontWeight: '700' },

  /* Section title */
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 14,
  },

  /* Summary Row */
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },

  /* Empty state */
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d3dbe2',
  },
  emptyText: { fontSize: 14, color: '#999', fontWeight: '500' },

  /* Verification state */
  verificationCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d3dbe2',
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
    textAlign: 'center',
  },
  verificationSubtitle: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  uploadBtn: {
    backgroundColor: '#E8304A',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  uploadBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

const summaryStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#d3dbe2',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  icon: { fontSize: 16 },
  label: { fontSize: 11, color: '#999', marginBottom: 4 },
  value: { fontSize: 20, fontWeight: '700', color: '#111' },
});

const bookingStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d3dbe2',
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  timeBox: {
    alignItems: 'center',
    minWidth: 36,
    borderWidth: 1,
    borderColor: '#D3DAE3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  timeNum: { fontSize: 26, fontWeight: '700', color: '#111', lineHeight: 30 },
  timePeriod: { fontSize: 12, color: '#999', fontWeight: '500' },
  info: { flex: 1 },
  nextUp: { fontSize: 11, color: '#888', marginBottom: 3 },
  clientName: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 3 },
  meta: { fontSize: 12, color: '#999' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 14 },
  actions: { flexDirection: 'row', gap: 10 },
  viewBtn: {
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 10,
  },
  viewBtnText: { fontSize: 13, color: '#333', fontWeight: '500' },
  locationBtn: {
    flex: 1,
    backgroundColor: '#4591E8',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },
  locationBtnText: { fontSize: 13, color: '#fff', fontWeight: '600' },
  callBtn: {
    flex: 1,
    backgroundColor: '#31B76B',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 10
  },
  callBtnText: { fontSize: 13, color: '#fff', fontWeight: '600' },
});

