import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Navbar from '../../components/Navbar';
import { auth } from '@/src/services/firebaseConfig';
import { getPartnerBookings, type Booking as FSBooking } from '@/src/services/bookingService';
import dayjs from 'dayjs';
import { useLanguage } from '@/src/hooks/useLanguage';

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
  amount: number;
  status: BookingStatus;
}

interface NextUpBooking {
  label: string;
  title: string;
  time: string;
  locationNote: string;
  guests: number;
  cuisine: string;
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
    Today:     { bg: '#FFF3CD', color: '#B8860B' },
    Active:    { bg: '#E3F0FF', color: '#1565C0' },
    Completed: { bg: '#E8F5E9', color: '#2e7d32' },
    Upcoming:  { bg: '#F3E5F5', color: '#6A1B9A' },
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
        <Text style={cardStyles.location}>{booking.location}</Text>
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
  const [fsBookings, setFsBookings] = useState<FSBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useLanguage();

  // OTP and Timer State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpText, setOtpText] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Timer Effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning && !isPaused) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isPaused]);

  const verifyOtp = () => {
    if (otpText.length >= 4) {
      setShowOtpModal(false);
      setIsTimerRunning(true);
      setIsPaused(false);
      setTimerSeconds(0);
      setOtpText('');
    } else {
      Alert.alert(t('invalidOtp'), t('invalidOtpMsg'));
    }
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
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
    const dateObj = (b.date as any).toDate ? (b.date as any).toDate() : new Date(b.date as any);
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
      amount: b.amount,
      status,
    };
  });

  // Next up: earliest today/upcoming non-completed booking
  const nextUpBooking = mappedBookings.find(b => b.status === 'Today' || b.status === 'Active');
  const nextUp: NextUpBooking | undefined = nextUpBooking
    ? {
        label: nextUpBooking.status === 'Active' ? t('activeBooking') : t('nextUpToday'),
        title: nextUpBooking.title,
        time: nextUpBooking.time,
        locationNote: nextUpBooking.location,
        guests: nextUpBooking.guests,
        cuisine: fsBookings.find(b => b.bookingId === nextUpBooking.id)?.eventType ?? '',
        phone: fsBookings.find(b => b.bookingId === nextUpBooking.id)?.phone,
      }
    : undefined;

  const filteredBookings =
    activeFilter === 'All' ? mappedBookings : mappedBookings.filter(b => b.status === activeFilter);

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
        <Text style={styles.pageTitle}>{t('myBookings')}</Text>
        <Text style={styles.dateLabel}>{dateLabel}</Text>

        {/* ── Next Up Card ── */}
        {nextUp && (
          <View style={styles.nextUpCard}>
            <Text style={styles.nextUpLabel}>{nextUp.label}</Text>
            <Text style={styles.nextUpTitle}>{nextUp.title}</Text>
            <Text style={styles.nextUpMeta}>{t('time')}: {nextUp.time}</Text>
            <Text style={styles.nextUpMeta}>{t('locationLabel')}: {nextUp.locationNote}</Text>
            <Text style={styles.nextUpMeta}>{nextUp.guests} guests | {nextUp.cuisine}</Text>

            {/* Timer or Actions */}
            {isTimerRunning || isPaused ? (
               <View style={styles.timerContainer}>
                 <View style={styles.timerRow}>
                   <View style={styles.timerCol}>
                     <Text style={styles.timerVal}>{formatTime(timerSeconds).split(':')[0]}</Text>
                     <Text style={styles.timerUnit}>{t('hours')}</Text>
                   </View>
                   <Text style={styles.timerColon}>:</Text>
                   <View style={styles.timerCol}>
                     <Text style={styles.timerVal}>{formatTime(timerSeconds).split(':')[1]}</Text>
                     <Text style={styles.timerUnit}>{t('minutes')}</Text>
                   </View>
                   <Text style={styles.timerColon}>:</Text>
                   <View style={styles.timerCol}>
                     <Text style={styles.timerVal}>{formatTime(timerSeconds).split(':')[2]}</Text>
                     <Text style={styles.timerUnit}>{t('seconds')}</Text>
                   </View>
                 </View>
                 <View style={styles.timerActions}>
                   <TouchableOpacity 
                     style={styles.cancelBtn} 
                     activeOpacity={0.8}
                     onPress={() => {
                        setIsTimerRunning(false);
                        setIsPaused(false);
                        setTimerSeconds(0);
                        setShowOtpModal(false);
                     }}
                   >
                     <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
                   </TouchableOpacity>
                   <TouchableOpacity 
                     style={styles.pauseBtn} 
                     activeOpacity={0.8}
                     onPress={() => {
                        setIsPaused(!isPaused);
                        if (isPaused) {
                           setIsTimerRunning(true);
                        } else {
                           setIsTimerRunning(false);
                        }
                     }}
                   >
                     <Text style={styles.pauseBtnText}>{isPaused ? t('resume') : t('pause')}</Text>
                   </TouchableOpacity>
                 </View>
               </View>
            ) : (
              <View style={styles.nextUpActions}>
                <TouchableOpacity 
                  style={[styles.navBtn, { flex: 1, backgroundColor: '#EA243F' }]} 
                  activeOpacity={0.8}
                  onPress={() => setShowOtpModal(true)}
                >
                  <Text style={[styles.navBtnText, { color: '#fff' }]}>{t('reachedLocation')}</Text>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'space-between' }}>
                <TouchableOpacity 
                  style={[styles.navBtn, { flex: 1 }]} 
                  activeOpacity={0.8}
                  onPress={() => {
                    if (nextUp.locationNote && nextUp.locationNote !== 'not assigned') {
                      Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(nextUp.locationNote)}`);
                    }
                  }}
                >
                  <Text style={styles.navBtnText}>{t('navigateLocation')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.callBtn, { flex: 1 }]} 
                  activeOpacity={0.8}
                  onPress={() => {
                    if (nextUp.phone) {
                      Linking.openURL(`tel:${nextUp.phone}`);
                    } else {
                      Alert.alert(t('unavailable'), t('phoneNotProvided2'));
                    }
                  }}
                >
                  <Text style={styles.callBtnText}>{t('callClient')}</Text>
                </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

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
            <Text style={styles.modalTitle}>{t('otpModalTitle')}</Text>
            <TextInput 
              style={styles.otpInput} 
              placeholder={t('enterOtp')} 
              placeholderTextColor="#aaa"
              keyboardType="number-pad"
              value={otpText}
              onChangeText={setOtpText}
              maxLength={6}
            />
            <TouchableOpacity style={styles.verifyBtn} onPress={verifyOtp} activeOpacity={0.8}>
              <Text style={styles.verifyBtnText}>{t('verifyOtp')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={{ marginTop: 16 }} onPress={() => setShowOtpModal(false)}>
              <Text style={{ color: '#888', fontWeight: '500' }}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

/* ── Styles ── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7' },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  nextUpLabel: { fontSize: 12, color: '#888', marginBottom: 6 },
  nextUpTitle: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 10, lineHeight: 26 },
  nextUpMeta: { fontSize: 13, color: '#555', marginBottom: 4 },
  nextUpActions: { flexDirection: 'column', gap: 10, marginTop: 16 },
  navBtn: {
    borderRadius: 8, paddingHorizontal: 16,
    paddingVertical: 10, alignItems: 'center', backgroundColor: '#4591E8'
  },
  navBtnText: { fontSize: 13, color: '#fff', fontWeight: '500' },
  callBtn: {
     borderRadius: 8, paddingHorizontal: 16,
    paddingVertical: 10, alignItems: 'center',backgroundColor: '#31B76B' 
  },
  callBtnText: { fontSize: 13, color: '#fff', fontWeight: '500' },

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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  emptyText: { fontSize: 14, color: '#999', fontWeight: '500' },

  /* Timer UI */
  timerContainer: { backgroundColor: '#fff', alignItems: 'center', marginTop: 12 },
  timerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  timerCol: { alignItems: 'center', marginHorizontal: 8 },
  timerVal: { fontSize: 52, fontWeight: '800', color: '#31343E' },
  timerUnit: { fontSize: 11, color: '#9FA4B4', fontWeight: '500', marginTop: 4 },
  timerColon: { fontSize: 32, fontWeight: '700', color: '#9FA4B4', paddingBottom: 22, marginHorizontal: 4 },
  timerActions: { flexDirection: 'row', gap: 16, width: '100%', justifyContent: 'center' },
  cancelBtn: { backgroundColor: '#EAEDF1', paddingVertical: 12, paddingHorizontal: 36, borderRadius: 8 },
  cancelBtnText: { color: '#31343E', fontWeight: '500', fontSize: 15 },
  pauseBtn: { backgroundColor: '#EE2A45', paddingVertical: 12, paddingHorizontal: 36, borderRadius: 8 },
  pauseBtnText: { color: '#fff', fontWeight: '500', fontSize: 15 },

  /* OTP Modal UI */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '90%', alignItems: 'center' },
  modalTitle: { fontSize: 16, fontWeight: '600', color: '#111', marginBottom: 20 },
  otpInput: { width: '100%', borderWidth: 1, borderColor: '#D9D9D9', borderRadius: 8, padding: 14, fontSize: 15, marginBottom: 20, color: '#333' },
  verifyBtn: { backgroundColor: '#E8304A', width: '100%', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  verifyBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  dateBox: {
    width: 44,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingVertical: 8,
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
