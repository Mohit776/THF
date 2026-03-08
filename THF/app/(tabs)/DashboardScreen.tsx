import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';

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
  onTabChange?: (tab: string) => void;
}

/* ── Summary Card ── */
function SummaryCard({
  icon,
  label,
  value,
  iconBg,
}: {
  icon: string;
  label: string;
  value: string;
  iconBg: string;
}) {
  return (
    <View style={summaryStyles.card}>
      <View style={[summaryStyles.iconBox, { backgroundColor: iconBg }]}>
        <Text style={summaryStyles.icon}>{icon}</Text>
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
              <Text style={bookingStyles.locationBtnText}>📍 Location</Text>
            </TouchableOpacity>
            <TouchableOpacity style={bookingStyles.callBtn} onPress={onCallClient} activeOpacity={0.8}>
              <Text style={bookingStyles.callBtnText}>📞 Call Client</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

/* ── Bottom Tab Bar ── */
const TABS = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'bookings', label: 'My Bookings', icon: '📅' },
  { id: 'earnings', label: 'Earnings', icon: '💰' },
  { id: 'profile', label: 'Profile', icon: '👤' },
];

function TabBar({ activeTab, onTabChange }: { activeTab: string; onTabChange?: (tab: string) => void }) {
  return (
    <View style={tabStyles.container}>
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={tabStyles.tab}
          onPress={() => onTabChange?.(tab.id)}
          activeOpacity={0.7}
        >
          <Text style={[tabStyles.icon, activeTab === tab.id && tabStyles.iconActive]}>
            {tab.icon}
          </Text>
          <Text style={[tabStyles.label, activeTab === tab.id && tabStyles.labelActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

/* ── Main Screen ── */
const DEFAULT_BOOKINGS: Booking[] = [
  {
    id: '1',
    time: '02',
    period: 'pm',
    nextUpLabel: 'Next up - in 2 hours',
    clientName: 'Deepak Sharma',
    occasion: 'Anniversay',
    guests: 8,
    location: 'Lajpat Nagar',
  },
  {
    id: '2',
    time: '07',
    period: 'pm',
    nextUpLabel: 'Next up - in 5 hours',
    clientName: 'Deepak Sharma',
    occasion: 'Anniversay',
    guests: 8,
    location: 'Lajpat Nagar',
  },
];

export default function DashboardScreen({
  chefName = 'Vinod Singh',
  chefId = '1234',
  isVerified = true,
  profileImage,
  bookings = 100,
  earned = 32,
  ratings = 4.9,
  todaysBookings = DEFAULT_BOOKINGS,
  onHelp,
  onViewDetail,
  onLocation,
  onCallClient,
  onTabChange,
}: DashboardScreenProps) {
  const [activeTab, setActiveTab] = useState('home');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Top Nav ── */}
      <View style={styles.navbar}>
        <View style={styles.logoRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>TFH</Text>
          </View>
          <View>
            <Text style={styles.brandLine1}>The</Text>
            <Text style={styles.brandLine2}>Famous</Text>
            <Text style={styles.brandLine2}>Halwai</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.helpBtn} onPress={onHelp} activeOpacity={0.8}>
          <Text style={styles.helpIcon}>📞</Text>
          <Text style={styles.helpText}>Help</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Welcome Card ── */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeLeft}>
            <Text style={styles.welcomeHi}>Welcome!</Text>
            <Text style={styles.welcomeName}>{chefName}</Text>
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
          {profileImage ? (
            <Image source={profileImage} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{chefName.charAt(0)}</Text>
            </View>
          )}
        </View>

        {/* ── Today's Summary ── */}
        <Text style={styles.sectionTitle}>Today's Summary</Text>
        <View style={styles.summaryRow}>
          <SummaryCard icon="📋" label="Bookings" value={String(bookings)} iconBg="#FFF0F0" />
          <SummaryCard icon="💰" label="Earned" value={`₹${earned}`} iconBg="#FFF5E0" />
          <SummaryCard icon="⭐" label="Ratings" value={String(ratings)} iconBg="#FFFBE0" />
        </View>

        {/* ── Today's Bookings ── */}
        <Text style={styles.sectionTitle}>Today's Bookings</Text>
        {todaysBookings.map((booking, index) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            showActions={index === 0}
            onViewDetail={() => onViewDetail?.(booking)}
            onLocation={() => onLocation?.(booking)}
            onCallClient={() => onCallClient?.(booking)}
          />
        ))}

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* ── Bottom Tab Bar ── */}
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </SafeAreaView>
  );
}

/* ── Styles ── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },

  /* Navbar */
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#E8304A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: '#fff', fontWeight: '800', fontSize: 12, letterSpacing: 0.5 },
  brandLine1: { fontSize: 11, color: '#333', fontWeight: '600', lineHeight: 14 },
  brandLine2: { fontSize: 11, color: '#333', fontWeight: '400', lineHeight: 14 },
  helpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  helpIcon: { fontSize: 13 },
  helpText: { fontSize: 14, color: '#333', fontWeight: '500' },

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
  avatar: { width: 64, height: 64, borderRadius: 32, marginLeft: 12 },
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
    marginBottom: 24,
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
    marginBottom: 8,
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
    paddingHorizontal: 14,
  },
  viewBtnText: { fontSize: 13, color: '#333', fontWeight: '500' },
  locationBtn: {
    flex: 1,
    backgroundColor: '#E8304A',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },
  locationBtnText: { fontSize: 13, color: '#fff', fontWeight: '600' },
  callBtn: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },
  callBtnText: { fontSize: 13, color: '#2e7d32', fontWeight: '600' },
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
