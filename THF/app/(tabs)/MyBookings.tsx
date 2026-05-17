import { useLanguage } from '@/src/hooks/useLanguage';
import { getPartnerBookings, type Booking as FSBooking } from '@/src/services/bookingService';
import { auth } from '@/src/services/firebaseConfig';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Modal, RefreshControl, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomText as Text } from '../../components/CustomText';
import Navbar from '../../components/Navbar';
import OtpInputBoxes from '../../components/OtpInputBoxes';

const HARDCODED_OTP = '123456';

/* ── Types ── */
type BookingStatus = 'Today' | 'Active' | 'Completed' | 'Upcoming';
type FilterTab = 'All' | 'Today' | 'Upcoming' | 'Completed';

interface Booking {
  id: string;
  day: string;
  month: string;
  title: string;
  time: string;
  guests: number;
  location: string;
  address?: string;
  amount: number;
  status: BookingStatus;
}

interface NextUpBooking {
  id: string;
  label: string;
  title: string;
  time: string;
  locationNote: string;
  address?: string;
  guests: number;
  cuisine: string;
  occasion: string;
  phone?: string;
}

interface MyBookingsScreenProps {
  dateLabel?: string;
  nextUp?: NextUpBooking;
  bookings?: Booking[];
  onHelp?: () => void;
  onNavigate?: (booking: NextUpBooking) => void;
  onCallClient?: (booking: NextUpBooking) => void;
  onBookingPress?: (booking: Booking) => void;
  onTabChange?: (tab: string) => void;
}

/* ── Status Badge ── */
function StatusBadge({ status }: { status: BookingStatus }) {
  const config: Record<BookingStatus, { bg: string; color: string }> = {
    Today: { bg: '#FFF3CD', color: '#B8860B' },
    Active: { bg: '#E3F0FF', color: '#1565C0' },
    Completed: { bg: '#E8F5E9', color: '#2e7d32' },
    Upcoming: { bg: '#F3E5F5', color: '#6A1B9A' },
  };
  const { bg, color } = config[status];
  return (
    <View style={[badgeStyles.container, { backgroundColor: bg }]}>
      <Text style={[badgeStyles.text, { color }]}>{status}</Text>
    </View>
  );
}

/* ── Booking List Card ── */
function BookingCard({
  booking,
  onPress,
}: {
  booking: Booking;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={cardStyles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Date Box */}
      <View style={cardStyles.dateBox}>
        <Text style={cardStyles.dateDay}>{booking.day}</Text>
        <Text style={cardStyles.dateMonth}>{booking.month}</Text>
      </View>

      {/* Info */}
      <View style={cardStyles.info}>
        <Text style={cardStyles.title}>{booking.title}</Text>
        <Text style={cardStyles.meta}>
          {booking.time} | {booking.guests} guests
        </Text>
        <Text style={cardStyles.location}>{booking.address ? `${booking.address}, ${booking.location}` : booking.location}</Text>
      </View>

      {/* Right */}
      <View style={cardStyles.right}>
        <Text style={cardStyles.amount}>
          ₹{booking.amount === 0 ? '00' : booking.amount.toLocaleString('en-IN')}
        </Text>
        <StatusBadge status={booking.status} />
      </View>
    </TouchableOpacity>
  );
}




const FILTER_TABS: FilterTab[] = ['All', 'Today', 'Upcoming', 'Completed'];

/* ── Main Screen ── */
export default function MyBookingsScreen() {
  const router = useRouter();
  const [fsBookings, setFsBookings] = useState<FSBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useLanguage();

  // OTP State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  /** Open OTP modal */
  const openOtpModal = () => {
    setOtpCode('');
    setShowOtpModal(true);
  };

  /** Close OTP modal */
  const closeOtpModal = () => {
    setShowOtpModal(false);
    setOtpCode('');
  };

  /** Verify hardcoded OTP */
  const handleVerifyOtp = () => {
    if (otpCode.length < 6) {
      Alert.alert(t('invalidOtp'), t('invalidOtpMsg'));
      return;
    }
    if (otpCode !== HARDCODED_OTP) {
      Alert.alert(t('invalidOtp'), t('otpIncorrect'));
      return;
    }
    closeOtpModal();
    router.push({
      pathname: '/edit/JobTimer' as any,
      params: {
        bookingId: nextUp?.id || '',
        title: nextUp?.title || '',
        time: nextUp?.time || '',
        location: nextUp?.locationNote || '',
        guests: nextUp?.guests?.toString() || '0',
        cuisine: nextUp?.cuisine || '',
        occasion: nextUp?.occasion || 'Celebration',
      },
    });
  };


  const dateLabel = dayjs().format('DD MMM YYYY | hh:mm a');

  const fetchBookings = React.useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
      const data = await getPartnerBookings(uid);
      setFsBookings(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  }, [fetchBookings]);

  useEffect(() => {
    fetchBookings().finally(() => setLoading(false));
  }, [fetchBookings]);

  // Map Firestore bookings to the local display Booking shape
  const mappedBookings: Booking[] = fsBookings.map((b) => {
    const dateObj = b.date
      ? ((b.date as any).toDate ? (b.date as any).toDate() : new Date(b.date as any))
      : new Date();
    const d = dayjs(dateObj);
    const now = dayjs();
    let status: BookingStatus = 'Upcoming';
    if (d.isSame(now, 'day')) status = 'Today';
    if (b.status === 'active') status = 'Active';
    if (b.status === 'completed') status = 'Completed';
    return {
      id: b.bookingId,
      day: d.format('DD'),
      month: d.format('MMM'),
      title: `Booking - ${b.clientName}`,
      time: d.format('h:mm A'),
      guests: b.guests,
      location: b.location,
      address: b.address,
      amount: b.amount,
      status,
    };
  });

  // Next up: earliest today/upcoming non-completed booking
  const nextUpBooking = mappedBookings.find(b => b.status === 'Today' || b.status === 'Active');
  const nextUp: NextUpBooking | undefined = nextUpBooking
    ? {
      id: nextUpBooking.id,
      label: nextUpBooking.status === 'Active' ? t('activeBooking') : t('nextUpToday'),
      title: nextUpBooking.title,
      time: nextUpBooking.time,
      locationNote: nextUpBooking.location,
      address: nextUpBooking.address,
      guests: nextUpBooking.guests,
      cuisine: fsBookings.find(b => b.bookingId === nextUpBooking.id)?.cuisine ?? '',
      occasion: fsBookings.find(b => b.bookingId === nextUpBooking.id)?.eventType ?? '',
      phone: fsBookings.find(b => b.bookingId === nextUpBooking.id)?.phone,
    }
    : undefined;

  const filteredBookings =
    activeFilter === 'All' ? mappedBookings : mappedBookings.filter(b => b.status === activeFilter);

  const insets = useSafeAreaInsets();

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
        <Text style={styles.pageTitle}>{t('myBookings')}</Text>
        <Text style={styles.dateLabel}>{dateLabel}</Text>

        {/* ── Next Up Card ── */}
        {/* {nextUp && (
          <View style={styles.nextUpCard}>
            <Text style={styles.nextUpLabel}>{nextUp.label}</Text>
            <Text style={styles.nextUpTitle}>{nextUp.title}</Text>
            <Text style={styles.nextUpMeta}>{t('time')}: {nextUp.time}</Text>
            <Text style={styles.nextUpMeta} numberOfLines={2}>
              <Text style={{ fontWeight: '700', color: '#444' }}>{t('locationLabel')}: </Text>
              {nextUp.address || nextUp.locationNote}
            </Text>
            {nextUp.address && nextUp.locationNote && (
              <Text style={[styles.nextUpMeta, { marginTop: 2, fontSize: 12, opacity: 0.8 }]}>
                ({nextUp.locationNote})
              </Text>
            )}
            <Text style={styles.nextUpMeta}>{nextUp.guests} Guests | {nextUp.cuisine}</Text>

            <View style={styles.nextUpActions}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#EA243F' }]}
                activeOpacity={0.8}
                onPress={openOtpModal}
              >
                <Text style={styles.actionBtnText} adjustsFontSizeToFit numberOfLines={1}>
                  {t('reachedLocation')}
                </Text>
              </TouchableOpacity>

              <View style={styles.actionBtnRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, { flex: 1, backgroundColor: '#4591E8' }]}
                  activeOpacity={0.8}
                  onPress={() => {
                    const addr = nextUp.address
                      ? `${nextUp.address}, ${nextUp.locationNote}`
                      : nextUp.locationNote;
                    router.push({
                      pathname: '/edit/MapScreen',
                      params: {
                        address: addr,
                        bookingId: nextUp.id ?? '',
                        title: nextUp.title ?? '',
                        time: nextUp.time ?? '',
                        location: addr,
                        guests: String(nextUp.guests ?? 0),
                        cuisine: nextUp.cuisine ?? '',
                        occasion: nextUp.occasion ?? '',
                      },
                    });
                  }}
                >
                  <Text style={styles.actionBtnText} adjustsFontSizeToFit numberOfLines={1}>
                    {t('navigateLocation')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { flex: 1, backgroundColor: '#31B76B' }]}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (nextUp.phone) {
                      Linking.openURL(`tel:${nextUp.phone}`);
                    }
                  }}
                >
                  <Text style={styles.actionBtnText} adjustsFontSizeToFit numberOfLines={1}>
                    {t('callClient')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )} */}

        {/* ── Filter Tabs ── */}
        <View style={styles.filterRow}>
          {FILTER_TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterTab, activeFilter === tab && styles.filterTabActive]}
              onPress={() => setActiveFilter(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterTabText, activeFilter === tab && styles.filterTabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Booking List ── */}
        {loading && !refreshing ? (
          <ActivityIndicator color="#E8304A" style={{ marginTop: 20 }} />
        ) : filteredBookings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>{t('noBookingsFound')}</Text>
          </View>
        ) : (
          <View style={styles.bookingsList}>
            {filteredBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </View>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* ── OTP Modal ── */}
      <Modal visible={showOtpModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('enterOtp')}</Text>
            <Text style={styles.modalSubtitle}>
              Enter the 6-digit OTP to confirm you have reached the location.
            </Text>

            <OtpInputBoxes
              length={6}
              onChange={setOtpCode}
              onComplete={(code) => setOtpCode(code)}
            />

            <TouchableOpacity
              style={[styles.verifyBtn, otpCode.length < 6 && styles.btnDisabled]}
              onPress={handleVerifyOtp}
              activeOpacity={0.8}
              disabled={otpCode.length < 6}
            >
              <Text style={styles.verifyBtnText}>{t('verifyOtp')}</Text>
            </TouchableOpacity>

            {/* Cancel */}
            <TouchableOpacity style={styles.cancelModalBtn} onPress={closeOtpModal}>
              <Text style={styles.cancelModalText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

/* ── Styles ── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },



  pageTitle: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 4 },
  dateLabel: { fontSize: 13, color: '#888', marginBottom: 16 },

  /* Next Up Card */
  nextUpCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#d3dbe2',
  },
  nextUpLabel: { fontSize: 12, color: '#888', marginBottom: 6 },
  nextUpTitle: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 10, lineHeight: 26 },
  nextUpMeta: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
    lineHeight: 18,
  },
  nextUpActions: {
    flexDirection: 'column',
    gap: 10,
    marginTop: 16,
    width: '100%',
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  actionBtn: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionBtnText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',

  },

  /* Filter Tabs */
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  filterTabActive: {
    backgroundColor: '#E8304A',
    borderColor: '#E8304A',
  },
  filterTabText: { fontSize: 12, color: '#555', fontWeight: '500' },
  filterTabTextActive: { color: '#fff', fontWeight: '600' },

  /* List */
  bookingsList: { gap: 12 },

  /* Empty state */
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',

  },
  emptyText: { fontSize: 14, color: '#999', fontWeight: '500' },


  /* OTP Modal UI */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 400, alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 8, textAlign: 'center' },
  modalSubtitle: { fontSize: 14, color: '#666', marginBottom: 24, textAlign: 'center', lineHeight: 20 },
  phoneDisplay: { backgroundColor: '#F5F5F7', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 20, marginBottom: 20 },
  phoneText: { fontSize: 16, fontWeight: '600', color: '#333', letterSpacing: 1 },
  verifyBtn: { backgroundColor: '#E8304A', width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  verifyBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  btnDisabled: { opacity: 0.6 },
  cancelModalBtn: { marginTop: 16, paddingVertical: 8, paddingHorizontal: 16 },
  cancelModalText: { color: '#888', fontWeight: '600', fontSize: 15 },
});

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#d3dbe2',

  },
  dateBox: {
    width: 44,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#d3dbe2',
  },
  dateDay: { fontSize: 20, fontWeight: '700', color: '#111', lineHeight: 24 },
  dateMonth: { fontSize: 11, color: '#888', fontWeight: '500' },
  info: { flex: 1 },
  title: { fontSize: 14, fontWeight: '600', color: '#222', marginBottom: 3 },
  meta: { fontSize: 12, color: '#888', marginBottom: 2 },
  location: { fontSize: 12, color: '#aaa' },
  right: { alignItems: 'flex-end', gap: 6 },
  amount: { fontSize: 15, fontWeight: '700', color: '#22a75a' },
});

const badgeStyles = StyleSheet.create({
  container: {
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  text: { fontSize: 11, fontWeight: '600' },
});

const tabStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingBottom: 8,
    paddingTop: 8,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  icon: { fontSize: 20, marginBottom: 3, opacity: 0.4 },
  iconActive: { opacity: 1 },
  label: { fontSize: 11, color: '#aaa', fontWeight: '500' },
  labelActive: { color: '#E8304A', fontWeight: '600' },
});
