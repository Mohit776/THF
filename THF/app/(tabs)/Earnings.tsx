import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Navbar from '../../components/Navbar';
import { auth } from '@/src/services/firebaseConfig';
import { getPartnerTransactions, type Transaction as FSTransaction } from '@/src/services/transactionService';
import dayjs from 'dayjs';
import { useLanguage } from '@/src/hooks/useLanguage';

/* ── Local display type for TransactionRow component ── */
interface DisplayTransaction {
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
  transactions?: DisplayTransaction[];
  onHelp?: () => void;
  onTabChange?: (tab: string) => void;
}

/* ── Transaction Row ── */
function TransactionRow({ transaction }: { transaction: DisplayTransaction }) {
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

/* ── Default Data ── */
const DEFAULT_TRANSACTIONS: DisplayTransaction[] = [
  { id: '1', clientName: 'John de', date: '22 Feb', guests: 10, type: 'Payout', amount: 0 },
  { id: '2', clientName: 'John de', date: '22 Feb', guests: 10, type: 'Payout', amount: 0 },
];

/* ── Main Screen ── */
export default function EarningsScreen() {
  const [transactions, setTransactions] = useState<FSTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const month = dayjs().format('MMMM YYYY');
  const { t } = useLanguage();

  const fetchTransactions = React.useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
      const data = await getPartnerTransactions(uid);
      setTransactions(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  }, [fetchTransactions]);

  useEffect(() => {
    fetchTransactions().finally(() => setLoading(false));
  }, [fetchTransactions]);

  const totalEarned = transactions.reduce((s, t) => s + (t.amount ?? 0), 0);
  const bookingsCount = transactions.length;

  const formatAmount = (amount: number) =>
    amount === 0 ? '00' : amount.toLocaleString('en-IN');

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
        <Text style={styles.pageTitle}>{t('myEarnings')}</Text>
        <Text style={styles.monthLabel}>{month}</Text>

        {/* ── Summary Card ── */}
        <View style={styles.summaryCard}>
          <Text style={styles.totalLabel}>{t('totalEarned')} - {month}</Text>
          <Text style={styles.totalAmount}>₹{formatAmount(totalEarned)}</Text>
          <Text style={styles.comparison}>{bookingsCount} {t('transactionsThisMonth')}</Text>
          <View style={styles.divider} />
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{bookingsCount}</Text>
              <Text style={styles.statLabel}>{t('transactions')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>₹{formatAmount(totalEarned)}</Text>
              <Text style={styles.statLabel}>{t('totalEarnedLabel')}</Text>
            </View>
          </View>
        </View>

        {/* ── Recent Transactions ── */}
        <Text style={styles.sectionTitle}>{t('recentTransactions')}</Text>
        {loading && !refreshing ? (
          <ActivityIndicator color="#E8304A" style={{ marginTop: 16 }} />
        ) : transactions.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>{t('noTransactions')}</Text>
          </View>
        ) : (
          <View style={styles.transactionsList}>
            {transactions.map((tx, index) => (
              <View key={tx.transactionId}>
                <TransactionRow transaction={{
                  id: tx.transactionId,
                  clientName: tx.bookingId,
                  date: dayjs((tx.createdAt as any).toDate?.() ?? tx.createdAt).format('DD MMM'),
                  guests: 0,
                  type: tx.type,
                  amount: tx.amount,
                }} />
                {index < transactions.length - 1 && <View style={styles.txDivider} />}
              </View>
            ))}
          </View>
        )}

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

  /* Empty state */
  emptyBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  emptyText: { fontSize: 14, color: '#999', fontWeight: '500' },
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

