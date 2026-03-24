import { useUserStore } from '@/src/hooks/useUserStore';
import { getPartnerBookings, type Booking as FirestoreBooking, listenToBroadcastedBookings, acceptBroadcastedBooking } from '@/src/services/bookingService';
import { registerForPushNotifications, sendLocalNotification } from '@/src/services/notificationService';
import { auth } from '@/src/services/firebaseConfig';
import dayjs from 'dayjs';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  RefreshControl,
  TouchableOpacity,
  View,
  Linking,
  Alert,
  Modal,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import Navbar from '../../components/Navbar';
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
  phone?: string;
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
}: {
  booking: Booking;
  showActions: boolean;
  onViewDetail?: () => void;
  onLocation?: () => void;
  onCallClient?: () => void;
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
            {booking.occasion} | {booking.guests} guests | {booking.location}
          </Text>
        </View>
      </View>

      {showActions && (
        <>
          <View style={bookingStyles.divider} />
          <View style={bookingStyles.actions}>
            <TouchableOpacity style={bookingStyles.viewBtn} onPress={onViewDetail} activeOpacity={0.8}>
              <Text style={bookingStyles.viewBtnText}>View detail</Text>
            </TouchableOpacity>
            <TouchableOpacity style={bookingStyles.locationBtn} onPress={onLocation} activeOpacity={0.8}>
              <Text style={bookingStyles.locationBtnText}>Location</Text>
            </TouchableOpacity>
            <TouchableOpacity style={bookingStyles.callBtn} onPress={onCallClient} activeOpacity={0.8}>
              <Ionicons name="call-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={bookingStyles.callBtnText}> Call Client</Text>
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
}: {
  booking: FirestoreBooking & { bookingId?: string };
  onAccept: () => void;
  isAccepting: boolean;
}) {
  const bTime = dayjs((booking.date as any).toDate?.() ?? booking.date);
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
          <Text style={[bookingStyles.nextUp, { color: '#E8304A', fontWeight: 'bold' }]}>NEW BOOKING AVAILABLE!</Text>
          <Text style={bookingStyles.clientName}>{booking.clientName}</Text>
          <Text style={bookingStyles.meta}>
            {bTime.isValid() ? bTime.format('MMM DD, YYYY') : ''} | {booking.eventType} | {booking.guests} guests
          </Text>
          <Text style={bookingStyles.meta} numberOfLines={1}>
            {booking.location}
          </Text>
          <Text style={{ marginTop: 4, fontWeight: 'bold', color: '#111', fontSize: 13 }}>
            Amount: ₹{booking.amount}
          </Text>
        </View>
      </View>

      <View style={bookingStyles.divider} />
      <View style={bookingStyles.actions}>
        <TouchableOpacity 
          style={[bookingStyles.locationBtn, { backgroundColor: '#31B76B' }]} 
          onPress={onAccept} 
          disabled={isAccepting}
          activeOpacity={0.8}
        >
          {isAccepting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={bookingStyles.locationBtnText}>Accept Booking</Text>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

/* ── Main Screen ── */
export default function DashboardScreen() {
  const router = useRouter();
  const { profile, loading: profileLoading, refresh: refreshProfile } = useUserStore();
  const [bookings, setBookings] = useState<FirestoreBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const [broadcastedBookings, setBroadcastedBookings] = useState<(FirestoreBooking & { bookingId?: string })[]>([]);
  const [acceptingBookingId, setAcceptingBookingId] = useState<string | null>(null);

  const prevBroadcastCount = useRef(0);

  // Register push token on mount
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (uid) {
      registerForPushNotifications(uid);
    }
  }, [profile]);

  useEffect(() => {
    if (!auth.currentUser?.uid) return;

    const unsubscribe = listenToBroadcastedBookings((bBookings) => {
      // Send local notification if new bookings appeared
      if (bBookings.length > prevBroadcastCount.current && prevBroadcastCount.current >= 0) {
        const newest = bBookings[0];
        if (newest && prevBroadcastCount.current > 0) {
          sendLocalNotification(
            '🍳 New Booking Available!',
            `${newest.clientName} - ${newest.eventType} - ${newest.guests} guests`,
            { type: 'broadcast_booking' },
          );
        }
      }
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
      Alert.alert('Error', error.message || 'Failed to accept booking. It might have been claimed by someone else.');
    } finally {
      setAcceptingBookingId(null);
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

  if (profileLoading && !profile) {
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

        {/* ── Welcome Card ── */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeLeft}>
            <Text style={styles.welcomeHi}>Welcome!</Text>
            <Text style={styles.welcomeName}>{chefName || 'Partner'}</Text>
            <View style={styles.badgeRow}>
              {isVerified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ verified</Text>
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
        {isVerified && broadcastedBookings.length > 0 && (
          <View style={{ marginBottom: 16 }}>
             {broadcastedBookings.map((b) => (
                <BroadcastedBookingCard 
                  key={b.bookingId} 
                  booking={b} 
                  onAccept={() => b.bookingId && handleAcceptBroadcastedBooking(b.bookingId)}
                  isAccepting={acceptingBookingId === b.bookingId}
                />
             ))}
          </View>
        )}

        {/* ── Today's Summary ── */}
        <Text style={styles.sectionTitle}>Today's Summary</Text>
        <View style={styles.summaryRow}>
          <SummaryCard icon={<BookingIcon />} label="Bookings" value={String(totalBookingsCount)} iconBg="#ffffff" />
          <SummaryCard icon={<WalletIcon />} label="Earned" value={`₹${totalEarned}`} iconBg="#ffffff" />
          <SummaryCard icon={<KycIcon />} label="Ratings" value={'4.8'} iconBg="#ffffff" />
        </View>

        <Text style={styles.sectionTitle}>Today's Bookings</Text>

        {/* ── Today's Bookings ── */}
        {!profile?.kycDocuments ? (
          <View style={styles.verificationCard}>
            <Text style={styles.verificationTitle}>You have not assigned any booking</Text>
            <Text style={styles.verificationSubtitle}>
              Why this? As per our company policy you need to upload your govt. approved documents with to verify your identity.
            </Text>
            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={() => router.push('/kyc/UploadDocuments_1')}
              activeOpacity={0.8}
            >
              <Text style={styles.uploadBtnText}>Upload Document</Text>
            </TouchableOpacity>
          </View>
        ) : !isVerified ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>You have not assigned any booking</Text>
          </View>
        ) : bookingsLoading && !refreshing ? (
          <ActivityIndicator color="#E8304A" style={{ marginTop: 20 }} />
        ) : todaysBookings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No bookings for today</Text>
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
                phone: booking.phone,
              }}
              showActions={index === 0}
              onViewDetail={() => {
                setSelectedBooking({
                  id: booking.bookingId,
                  time: dayjs((booking.date as any).toDate?.() ?? booking.date).format('hh'),
                  period: dayjs((booking.date as any).toDate?.() ?? booking.date).format('a'),
                  nextUpLabel: index === 0 ? 'Next up' : 'Upcoming',
                  clientName: booking.clientName,
                  occasion: booking.eventType,
                  guests: booking.guests,
                  location: booking.location,
                  phone: booking.phone,
                });
              }}
              onCallClient={() => {
                if (booking.phone) {
                  Linking.openURL(`tel:${booking.phone}`);
                } else {
                  Alert.alert('Unavailable', 'Phone number not provided for this booking');
                }
              }}
              onLocation={() => {
                if (booking.location) {
                  Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(booking.location)}`);
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
              {selectedBooking?.clientName} {selectedBooking?.occasion}
            </Text>
            <Text style={modalStyles.detailText}>
              Time: {selectedBooking?.time} - {selectedBooking?.period}
            </Text>
            <Text style={modalStyles.detailText}>
              Location: {selectedBooking?.location}
            </Text>
            <Text style={modalStyles.detailText}>
              {selectedBooking?.guests} guests | North Indian + Cake
            </Text>
            
            <View style={modalStyles.mapPlaceholder}>
              <Text style={modalStyles.mapText}>Map Preview</Text>
              <Text style={modalStyles.mapSubText}>{selectedBooking?.location}</Text>
            </View>
            
            <View style={modalStyles.actionRow}>
              <TouchableOpacity 
                style={modalStyles.actionButtonBlue}
                activeOpacity={0.8}
                onPress={() => {
                  if (selectedBooking?.location) {
                    Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(selectedBooking.location)}`);
                  }
                }}
              >
                <Text style={modalStyles.actionButtonText}>Get Direction</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={modalStyles.actionButtonGreen}
                activeOpacity={0.8}
                onPress={() => {
                  if (selectedBooking?.phone) {
                    Linking.openURL(`tel:${selectedBooking.phone}`);
                  } else {
                    Alert.alert('Unavailable', 'Phone number not provided');
                  }
                }}
              >
                <Ionicons name="call-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={modalStyles.actionButtonText}>Call Client</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
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
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
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
    marginBottom: 6,
    lineHeight: 20,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  emptyText: { fontSize: 14, color: '#999', fontWeight: '500' },

  /* Verification state */
  verificationCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
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
   
  },
  callBtnText: { fontSize: 13, color: '#fff', fontWeight: '600' },
});


