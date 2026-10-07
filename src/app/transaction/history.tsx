import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { transactionRepository } from '@/services/repositories';
import { Transaction } from '@/types';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import { formatRupiah } from '@/utils/currency';
import { formatDateTime } from '@/utils/date';

export default function TransactionHistoryScreen() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const list = await transactionRepository.getAll();
      setTransactions(list);
    } catch (e) {
      console.error('[HistoryScreen] Gagal memuat riwayat:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = transactions.filter(t => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const matchInvoice = t.invoiceNumber.toLowerCase().includes(q);
    const matchCashier = t.cashierName.toLowerCase().includes(q);
    const matchItem = t.items.some(it => it.productName.toLowerCase().includes(q));
    return matchInvoice || matchCashier || matchItem;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Riwayat Transaksi</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchBox}>
        <Input
          placeholder="Cari no. faktur atau nama produk..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          icon="search"
          style={{ minHeight: 42 }}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} colors={[Colors.primary]} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/transaction/${item.id}`)}
            activeOpacity={0.7}
          >
            <Card style={styles.trxCard}>
              <View style={styles.trxHeader}>
                <View>
                  <Text style={styles.trxInvoice}>{item.invoiceNumber}</Text>
                  <Text style={styles.trxDate}>{formatDateTime(item.createdAt)}</Text>
                </View>
                <Text style={styles.trxAmount}>{formatRupiah(item.totalAmount)}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.trxFooter}>
                <Text style={styles.trxSummary}>
                  {item.totalItems} item • {item.cashierName}
                </Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.paymentMethod.toUpperCase()}</Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Tidak ada riwayat transaksi</Text>
            <Text style={styles.emptySubtitle}>Transaksi baru akan tercatat di sini</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  searchBox: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  list: {
    padding: 16,
    paddingTop: 4,
    gap: 10,
    paddingBottom: 40,
  },
  trxCard: {
    padding: 14,
  },
  trxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  trxInvoice: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  trxDate: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  trxAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  trxFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trxSummary: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  badge: {
    backgroundColor: Colors.primarySubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
});
