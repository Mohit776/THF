import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, StatusBar, RefreshControl, Pressable, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Navbar from '../../components/Navbar';
import { auth } from '@/src/services/firebaseConfig';
import { getPartnerBookings, type Booking } from '@/src/services/bookingService';
import dayjs from 'dayjs';
import { useLanguage } from '@/src/hooks/useLanguage';
import { CustomText as Text } from '../../components/CustomText';
import { Ionicons } from '@expo/vector-icons';

/* ── Local display type for TransactionRow component ── */
interface DisplayTransaction {
  id: string;
  eventName: string;
  date: string;
  type: string;
  amount: number;
}

/* ── Transaction Row Styles (defined before TransactionRow so they are in scope) ── */
const txStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  iconBox: {
    marginRight: 12,
  },
  iconBoxNegative: {
    opacity: 0.8,
  },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: '#1A1C1E', marginBottom: 4 },
  meta: { fontSize: 13, color: '#889098' },
  amount: { fontSize: 16, fontWeight: '700', color: '#22A75D' },
  amountNegative: { color: '#E8304A' },
});

/* ── Transaction Row ── */
function TransactionRow({ transaction }: { transaction: DisplayTransaction }) {
  const isNegative = transaction.amount < 0;

  return (
    <View style={txStyles.row}>
      <View style={[txStyles.iconBox, isNegative ? txStyles.iconBoxNegative : null]}>
        <Ionicons name="checkmark-circle" size={24} color="#22A75D" />
      </View>
      <View style={txStyles.info}>
        <Text style={txStyles.name}>{transaction.eventName}</Text>
        <Text style={txStyles.meta}>
          {transaction.date} | {transaction.type}
        </Text>
      </View>
      <Text style={[txStyles.amount, isNegative && txStyles.amountNegative]}>
        {isNegative ? '-' : '+'}₹{Math.abs(transaction.amount).toLocaleString('en-IN')}
      </Text>
    </View>
  );
}

/* ── Main Screen ── */
export default function EarningsScreen() {
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<DisplayTransaction[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'Daily' | 'Weekly' | 'Monthly'>('Monthly');

  // Date selection states
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [isMonthPickerVisible, setMonthPickerVisible] = useState(false);

  const { t } = useLanguage();

  const availableMonths = Array.from({ length: 12 }).map((_, i) => dayjs().subtract(i, 'month'));

  const fetchTransactions = React.useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
      const bookingsData = await getPartnerBookings(uid);
      const completedBookings = bookingsData.filter(b => b.status === 'completed');
      setAllBookings(completedBookings);
    } catch (error) {
      console.error('[Earnings] fetch error:', error);
    }
  }, []);

  // Filter transactions when date, allBookings, or activeTab changes
  useEffect(() => {
    let monthSum = 0;
    const displayTx: DisplayTransaction[] = [];

    // Month range for the summary card
    const monthStart = selectedDate.startOf('month');
    const monthEnd = selectedDate.endOf('month');

    // Tab range for the transactions list
    const unit = activeTab === 'Daily' ? 'day' : activeTab === 'Weekly' ? 'week' : 'month';
    const tabStart = selectedDate.startOf(unit);
    const tabEnd = selectedDate.endOf(unit);

    allBookings.forEach(booking => {
      const bookingDate = dayjs((booking.date as any)?.toDate?.() ?? booking.date);

      // Update monthly total (for summary card)
      if ((bookingDate.isAfter(monthStart) || bookingDate.isSame(monthStart)) &&
        (bookingDate.isBefore(monthEnd) || bookingDate.isSame(monthEnd))) {
        monthSum += (booking.amount || 0);
      }

      // Update transactions list (based on tab)
      if ((bookingDate.isAfter(tabStart) || bookingDate.isSame(tabStart)) &&
        (bookingDate.isBefore(tabEnd) || bookingDate.isSame(tabEnd))) {
        displayTx.push({
          id: booking.bookingId || Math.random().toString(),
          eventName: booking.eventName || `Booking - ${booking.clientName}`,
          date: bookingDate.format('DD MMM | ddd'),
          type: 'Payout',
          amount: booking.amount || 0,
        });
      }
    });

    setTotalEarned(monthSum);
    setTransactions(displayTx);
  }, [allBookings, selectedDate, activeTab]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  }, [fetchTransactions]);

  useEffect(() => {
    fetchTransactions().finally(() => setLoading(false));
  }, [fetchTransactions]);

  const formatAmount = (amount: number) =>
    amount === 0 ? '0' : amount.toLocaleString('en-IN');

  const comparisonPercent = '22%';
  const insets = useSafeAreaInsets();
  const prevMonthText = selectedDate.subtract(1, 'month').format('MMMM');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f7" />
      <Navbar />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E8304A" />}
      >
        <Text style={styles.pageTitle}>{t('myEarnings')}</Text>

        {/* ── Summary Card ── */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View>
              <Text style={styles.totalLabel}>Total earned</Text>
              <Text style={styles.totalAmount}>₹{formatAmount(totalEarned)}</Text>
            </View>
            <TouchableOpacity style={styles.monthDropdown} onPress={() => setMonthPickerVisible(true)}>
              <Text style={styles.monthDropdownText}>{selectedDate.format('MMMM')}</Text>
              <Ionicons name="chevron-down" size={16} color="#4A4A4A" />
            </TouchableOpacity>
          </View>
          <Text style={styles.comparison}>{comparisonPercent} compared to {prevMonthText}</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {['Daily', 'Weekly', 'Monthly'].map((tab) => (
            <Pressable
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab as 'Daily' | 'Weekly' | 'Monthly')}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── Transactions ── */}
        {loading && !refreshing ? (
          <ActivityIndicator color="#E8304A" style={{ marginTop: 16 }} />
        ) : transactions.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>{t('noTransactions')}</Text>
          </View>
        ) : (
          <View style={styles.transactionsList}>
            {transactions.map((tx) => (
              <TransactionRow key={tx.id} transaction={tx} />
            ))}
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Month Picker Modal */}
      <Modal visible={isMonthPickerVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setMonthPickerVisible(false)}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {availableMonths.map((m, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedDate(m);
                    setMonthPickerVisible(false);
                  }}
                >
                  <Text style={[styles.modalItemText, selectedDate.isSame(m, 'month') && styles.modalItemTextSelected]}>
                    {m.format('MMMM YYYY')}
                  </Text>
                  {selectedDate.isSame(m, 'month') && (
                    <Ionicons name="checkmark" size={20} color="#E8304A" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

/* ── Styles ── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },

  pageTitle: { fontSize: 22, fontWeight: '700', color: '#1A1C1E', marginBottom: 16 },

  /* Summary Card */
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    elevation: 5,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  totalLabel: { fontSize: 14, color: '#6C7278', marginBottom: 4 },
  totalAmount: { fontSize: 32, fontWeight: '800', color: '#1A1C1E', marginBottom: 0 },
  monthDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F4F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  monthDropdownText: { fontSize: 14, color: '#4A4A4A', marginRight: 4, fontWeight: '500' },
  comparison: { fontSize: 14, color: '#6C7278' },

  /* Tabs */
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    backgroundColor: '#fff',
    marginHorizontal: 4,
  },
  tabButtonActive: {
    backgroundColor: '#E8304A',
    borderColor: '#E8304A',
  },
  tabText: {
    fontSize: 14,
    color: '#4A4A4A',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#fff',
  },

  /* Transactions list container */
  transactionsList: {
    gap: 12,
  },

  /* Empty state */
  emptyBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: { fontSize: 14, color: '#889098', fontWeight: '500' },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '80%',
    maxHeight: '60%',
    borderRadius: 16,
    padding: 16,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F7',
  },
  modalItemText: {
    fontSize: 16,
    color: '#4A4A4A',
  },
  modalItemTextSelected: {
    color: '#E8304A',
    fontWeight: '600',
  },
});




