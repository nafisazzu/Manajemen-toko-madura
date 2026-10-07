import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/context/ProductContext';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { LowStockBadge } from '@/components/LowStockBadge';
import { formatRupiah } from '@/utils/currency';
import { formatDateWithDay, getTodayString } from '@/utils/date';
import { transactionRepository } from '@/services/repositories';
import { Transaction } from '@/types';

export default function HomeScreen() {
  const { user, role } = useAuth();
  const { products, lowStockProducts, refreshProducts, isLoading } = useProducts();
  const router = useRouter();

  const [todayTransactions, setTodayTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const isPemilik = role === 'pemilik';

  const loadTodayStats = useCallback(async () => {
    try {
      const today = getTodayString();
      const list = await transactionRepository.getByDate(today);
      setTodayTransactions(list);
    } catch (e) {
      console.error('[HomeScreen] Gagal memuat transaksi hari ini:', e);
    }
  }, []);

  useEffect(() => {
    loadTodayStats();
  }, [loadTodayStats]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshProducts(), loadTodayStats()]);
    setRefreshing(false);
  };

  const todayRevenue = todayTransactions.reduce((acc, t) => acc + t.totalAmount, 0);
  const todayProfit = todayTransactions.reduce((acc, t) => acc + t.profit, 0);
  const todayItemsSold = todayTransactions.reduce((acc, t) => acc + t.totalItems, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isLoading}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Greeting Banner */}
        <View style={styles.greetingBox}>
          <View>
            <Text style={styles.greetingDate}>{formatDateWithDay(new Date().toISOString())}</Text>
            <Text style={styles.greetingText}>
              Halo, <Text style={styles.greetingName}>{user?.name || 'Kasir'}</Text> 👋
            </Text>
            <Text style={styles.greetingRole}>
              Role: <Text style={{ fontWeight: '700' }}>{isPemilik ? 'Pemilik (Akses Penuh)' : 'Kasir (Transaksi & Stok)'}</Text>
            </Text>
          </View>
        </View>

        {/* Quick Summary Cards (Laporan Singkat Hari Ini) */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: Colors.primarySubtle }]}>
              <Ionicons name="cash-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.statLabel}>Omzet Hari Ini</Text>
            <Text style={styles.statValue}>{formatRupiah(todayRevenue)}</Text>
            <Text style={styles.statMeta}>{todayTransactions.length} transaksi</Text>
          </Card>

          {isPemilik ? (
            <Card style={styles.statCard}>
              <View style={[styles.statIconCircle, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="trending-up-outline" size={20} color={Colors.emerald} />
              </View>
              <Text style={styles.statLabel}>Laba Kotor Hari Ini</Text>
              <Text style={[styles.statValue, { color: Colors.emerald }]}>
                {formatRupiah(todayProfit)}
              </Text>
              <Text style={styles.statMeta}>{todayItemsSold} item terjual</Text>
            </Card>
          ) : (
            <Card style={styles.statCard}>
              <View style={[styles.statIconCircle, { backgroundColor: Colors.accentLight }]}>
                <Ionicons name="cart-outline" size={20} color={Colors.accentDark} />
              </View>
              <Text style={styles.statLabel}>Barang Terjual</Text>
              <Text style={styles.statValue}>{todayItemsSold} pcs</Text>
              <Text style={styles.statMeta}>Shift aktif</Text>
            </Card>
          )}
        </View>

        {/* Peringatan Stok Menipis (Stok <= 3) */}
        {lowStockProducts.length > 0 && (
          <Card style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <View style={styles.alertTitleRow}>
                <Ionicons name="warning" size={20} color={Colors.danger} />
                <Text style={styles.alertTitle}>
                  Peringatan Stok Menipis ({lowStockProducts.length} Produk)
                </Text>
              </View>
              {isPemilik && (
                <TouchableOpacity
                  onPress={() => router.push('/product/restock')}
                  style={styles.alertRestockBtn}
                >
                  <Text style={styles.alertRestockText}>+ Restok</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.alertDesc}>
              Produk dengan sisa stok $\le 3$ memerlukan penambahan pasokan segera.
            </Text>

            <View style={styles.alertList}>
              {lowStockProducts.slice(0, 4).map(prod => (
                <View key={prod.id} style={styles.alertItemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.alertItemName}>{prod.name}</Text>
                    <Text style={styles.alertItemCategory}>{prod.category.toUpperCase()}</Text>
                  </View>
                  <LowStockBadge stock={prod.stock} unit={prod.unit} size="small" />
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Menu Navigasi Cepat (Quick Actions) */}
        <Text style={styles.sectionTitle}>Aksi Cepat</Text>
        <View style={styles.actionGrid}>
          {/* 1. Transaksi Kasir POS */}
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: Colors.primary }]}
            onPress={() => router.push('/(tabs)/pos')}
            activeOpacity={0.8}
          >
            <View style={styles.actionIconWrapper}>
              <Ionicons name="calculator-outline" size={26} color="#FFFFFF" />
            </View>
            <Text style={[styles.actionCardTitle, { color: '#FFFFFF' }]}>
              Buka Kasir (POS)
            </Text>
            <Text style={[styles.actionCardDesc, { color: '#A7F3D0' }]}>
              Pilih produk, scan barcode & terima pembayaran
            </Text>
          </TouchableOpacity>

          {/* 2. Katalog Produk */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/products')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconWrapper, { backgroundColor: Colors.surfaceVariant }]}>
              <Ionicons name="cube-outline" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.actionCardTitle}>Katalog & Stok</Text>
            <Text style={styles.actionCardDesc}>
              {products.length} macam produk terdaftar
            </Text>
          </TouchableOpacity>

          {/* 3. Barang Masuk / Restok (Khusus Pemilik) */}
          {isPemilik && (
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/product/restock')}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconWrapper, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="arrow-down-circle-outline" size={24} color={Colors.emerald} />
              </View>
              <Text style={styles.actionCardTitle}>Barang Masuk</Text>
              <Text style={styles.actionCardDesc}>
                Catat pembelian barang dari supplier
              </Text>
            </TouchableOpacity>
          )}

          {/* 4. Laporan Penjualan (Khusus Pemilik) */}
          {isPemilik && (
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/reports')}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconWrapper, { backgroundColor: Colors.accentLight }]}>
                <Ionicons name="stats-chart-outline" size={24} color={Colors.accentDark} />
              </View>
              <Text style={styles.actionCardTitle}>Laporan Toko</Text>
              <Text style={styles.actionCardDesc}>
                Analisis omzet, laba kotor & tren harian
              </Text>
            </TouchableOpacity>
          )}

          {/* 5. Riwayat Transaksi */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/transaction/history')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconWrapper, { backgroundColor: '#E0E7FF' }]}>
              <Ionicons name="receipt-outline" size={24} color="#3730A3" />
            </View>
            <Text style={styles.actionCardTitle}>Riwayat Transaksi</Text>
            <Text style={styles.actionCardDesc}>
              Lihat dan cetak ulang struk penjualan
            </Text>
          </TouchableOpacity>
        </View>

        {/* Transaksi Terakhir Hari Ini */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>Transaksi Terbaru</Text>
            <TouchableOpacity onPress={() => router.push('/transaction/history')}>
              <Text style={styles.seeAllText}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>

          {todayTransactions.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="receipt-outline" size={36} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>Belum ada transaksi hari ini</Text>
              <Text style={styles.emptyDesc}>
                Gunakan tab Transaksi untuk memulai pesanan kasir
              </Text>
            </Card>
          ) : (
            todayTransactions.slice(0, 3).map(trx => (
              <TouchableOpacity
                key={trx.id}
                onPress={() => router.push(`/transaction/${trx.id}`)}
                activeOpacity={0.7}
              >
                <Card style={styles.transactionCard}>
                  <View style={styles.trxHeader}>
                    <Text style={styles.trxInvoice}>{trx.invoiceNumber}</Text>
                    <Text style={styles.trxAmount}>{formatRupiah(trx.totalAmount)}</Text>
                  </View>
                  <View style={styles.trxFooter}>
                    <Text style={styles.trxMeta}>
                      {trx.totalItems} item • {trx.cashierName}
                    </Text>
                    <View style={styles.trxBadge}>
                      <Text style={styles.trxBadgeText}>{trx.paymentMethod.toUpperCase()}</Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  greetingBox: {
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  greetingDate: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 2,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  greetingName: {
    color: Colors.primary,
  },
  greetingRole: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 14,
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  statMeta: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
  },
  alertCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    marginBottom: 16,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
  },
  alertRestockBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  alertRestockText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  alertDesc: {
    fontSize: 11,
    color: '#B45309',
    marginBottom: 10,
  },
  alertList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  alertItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  alertItemName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  alertItemCategory: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  actionGrid: {
    gap: 10,
    marginBottom: 20,
  },
  actionCard: {
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  actionCardDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  recentSection: {
    marginTop: 4,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: 8,
  },
  emptyDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  transactionCard: {
    marginBottom: 8,
    padding: 12,
  },
  trxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  trxInvoice: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  trxAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  trxFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trxMeta: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  trxBadge: {
    backgroundColor: Colors.primarySubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trxBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
});
