import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';

/* ── Types ── */
interface Transaction {
  id: string;
  clientName: string;
  date: string;
  guests: number;
  type: string;
  amount: number;
}

interface EarningsScreenProps {
  month?: string;
  totalEarned?: number;
  comparisonPercent?: number;
  comparisonMonth?: string;
  bookings?: number;
  avgRatings?: number;
  completion?: number;
  transactions?: Transaction[];
  onHelp?: () => void;
  onTabChange?: (tab: string) => void;
}

/* ── Transaction Row ── */
function TransactionRow({ transaction }: { transaction: Transaction }) {
  return (
    <View style={txStyles.row}>
      <View style={txStyles.iconBox}>
        <Text style={txStyles.icon}>✓</Text>
      </View>
      <View style={txStyles.info}>
        <Text style={txStyles.name}>Booking - {transaction.clientName}</Text>
        <Text style={txStyles.meta}>
          {transaction.date} | {transaction.guests} guests | {transaction.type}
        </Text>
      </View>
      <Text style={txStyles.amount}>
        +₹{transaction.amount < 10 ? `0${transaction.amount}` : transaction.amount}
      </Text>
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

function TabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange?: (tab: string) => void;
}) {
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

/* ── Default Data ── */
const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: '1', clientName: 'John de', date: '22 Feb', guests: 10, type: 'Payout', amount: 0 },
  { id: '2', clientName: 'John de', date: '22 Feb', guests: 10, type: 'Payout', amount: 0 },
];

/* ── Main Screen ── */
export default function EarningsScreen({
  month = 'February 2026',
  totalEarned = 0,
  comparisonPercent = 0,
  comparisonMonth = 'January 2026',
  bookings = 0,
  avgRatings = 0,
  completion = 0,
  transactions = DEFAULT_TRANSACTIONS,
  onHelp,
  onTabChange,
}: EarningsScreenProps) {
  const [activeTab, setActiveTab] = useState('earnings');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const formatAmount = (amount: number) =>
    amount === 0 ? '00' : amount.toLocaleString('en-IN');

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
            <Text style={styles.brandLine}>The</Text>
            <Text style={styles.brandLine}>Famous</Text>
            <Text style={styles.brandLine}>Halwai</Text>
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
        {/* Heading */}
        <Text style={styles.pageTitle}>My Earnings</Text>
        <Text style={styles.monthLabel}>{month}</Text>

        {/* ── Summary Card ── */}
        <View style={styles.summaryCard}>
          <Text style={styles.totalLabel}>Total earned - Feb 2026</Text>
          <Text style={styles.totalAmount}>₹{formatAmount(totalEarned)}</Text>
          <Text style={styles.comparison}>
            {comparisonPercent}0% compared to {comparisonMonth}
          </Text>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{bookings}</Text>
              <Text style={styles.statLabel}>Bookings</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{avgRatings}</Text>
              <Text style={styles.statLabel}>Avg. Ratings</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completion}%</Text>
              <Text style={styles.statLabel}>Completion</Text>
            </View>
          </View>
        </View>

        {/* ── Recent Transactions ── */}
        <Text style={styles.sectionTitle}>Recent transactions</Text>

        <View style={styles.transactionsList}>
          {transactions.map((tx, index) => (
            <View key={tx.id}>
              <TransactionRow transaction={tx} />
              {index < transactions.length - 1 && <View style={styles.txDivider} />}
            </View>
          ))}
        </View>

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
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },

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
  brandLine: { fontSize: 11, color: '#333', fontWeight: '400', lineHeight: 14 },
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

  pageTitle: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 4 },
  monthLabel: { fontSize: 14, color: '#888', marginBottom: 16 },

  /* Summary Card */
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  totalLabel: { fontSize: 13, color: '#888', marginBottom: 6 },
  totalAmount: { fontSize: 40, fontWeight: '800', color: '#111', marginBottom: 6 },
  comparison: { fontSize: 13, color: '#888', marginBottom: 16 },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginBottom: 16 },
  statsRow: { flexDirection: 'row' },
  statItem: { flex: 1, alignItems: 'flex-start' },
  statValue: { fontSize: 18, fontWeight: '700', color: '#22a75a', marginBottom: 3 },
  statLabel: { fontSize: 12, color: '#999' },

  /* Section */
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 14 },

  /* Transactions */
  transactionsList: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  txDivider: { height: 1, backgroundColor: '#f5f5f5', marginHorizontal: 16 },
});

const txStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 14, color: '#888' },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: '#222', marginBottom: 3 },
  meta: { fontSize: 12, color: '#999' },
  amount: { fontSize: 15, fontWeight: '700', color: '#22a75a' },
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
