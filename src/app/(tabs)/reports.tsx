import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { formatRupiah } from '@/utils/currency';
import { formatDate, getTodayString, getCurrentMonthString } from '@/utils/date';
import { transactionRepository } from '@/services/repositories';
import { DailyReport, MonthlyReport, Transaction } from '@/types';
import { ReceiptModal } from '@/components/ReceiptModal';

export default function ReportsScreen() {
  const { role } = useAuth();
  const router = useRouter();

  const [reportType, setReportType] = useState<'harian' | 'bulanan'>('harian');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthString());

  const [dailyData, setDailyData] = useState<DailyReport | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(false);

  const [activeReceipt, setActiveReceipt] = useState<Transaction | null>(null);

  const loadDailyReport = useCallback(async (date: string) => {
    try {
      setLoading(true);
      const rep = await transactionRepository.getDailyReport(date);
      setDailyData(rep);
    } catch (e) {
      console.error('[ReportsScreen] Gagal memuat laporan harian:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMonthlyReport = useCallback(async (month: string) => {
    try {
      setLoading(true);
      const rep = await transactionRepository.getMonthlyReport(month);
      setMonthlyData(rep);
    } catch (e) {
      console.error('[ReportsScreen] Gagal memuat laporan bulanan:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (role === 'pemilik') {
      if (reportType === 'harian') {
        loadDailyReport(selectedDate);
      } else {
        loadMonthlyReport(selectedMonth);
      }
    }
  }, [role, reportType, selectedDate, selectedMonth, loadDailyReport, loadMonthlyReport]);

  // Guard jika bukan pemilik
  if (role !== 'pemilik') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header />
        <View style={styles.accessDeniedBox}>
          <Ionicons name="lock-closed" size={64} color={Colors.warning} />
          <Text style={styles.accessDeniedTitle}>Akses Khusus Pemilik</Text>
          <Text style={styles.accessDeniedDesc}>
            Laporan keuangan, omzet, dan laba kotor toko hanya dapat diakses oleh Pemilik Toko.
          </Text>
          <Button
            title="Kembali ke Beranda"
            onPress={() => router.push('/(tabs)')}
            style={{ marginTop: 20 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const handleShareReport = async () => {
    let reportText = '';
    if (reportType === 'harian' && dailyData) {
      reportText = `*LAPORAN PENJUALAN HARIAN - TOKO MADURA*\n`;
      reportText += `Tanggal: ${formatDate(dailyData.date)}\n`;
      reportText += `--------------------------------\n`;
      reportText += `Total Omzet      : ${formatRupiah(dailyData.totalRevenue)}\n`;
      reportText += `Total Laba Kotor : ${formatRupiah(dailyData.totalProfit)}\n`;
      reportText += `Jumlah Transaksi : ${dailyData.transactionCount}\n`;
      reportText += `Total Barang     : ${dailyData.itemsSoldCount} pcs\n`;
      reportText += `--------------------------------\n`;
      reportText += `_Laporan otomatis aplikasi Toko Madura_`;
    } else if (monthlyData) {
      reportText = `*LAPORAN PENJUALAN BULANAN - TOKO MADURA*\n`;
      reportText += `Bulan: ${monthlyData.month}\n`;
      reportText += `--------------------------------\n`;
      reportText += `Total Omzet Bulanan : ${formatRupiah(monthlyData.totalRevenue)}\n`;
      reportText += `Total Laba Bulanan  : ${formatRupiah(monthlyData.totalProfit)}\n`;
      reportText += `Total Transaksi     : ${monthlyData.transactionCount}\n`;
      reportText += `--------------------------------\n`;
      reportText += `_Laporan otomatis aplikasi Toko Madura_`;
    }

    try {
      await Share.share({ message: reportText });
    } catch {
      Alert.alert('Error', 'Gagal membagikan laporan.');
    }
  };

  const marginPercentage =
    dailyData && dailyData.totalRevenue > 0
      ? Math.round((dailyData.totalProfit / dailyData.totalRevenue) * 100)
      : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Type Toggle (Harian / Bulanan) */}
        <View style={styles.tabToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, reportType === 'harian' && styles.toggleBtnActive]}
            onPress={() => setReportType('harian')}
          >
            <Ionicons
              name="calendar-outline"
              size={16}
              color={reportType === 'harian' ? '#FFFFFF' : Colors.textSecondary}
            />
            <Text
              style={[
                styles.toggleBtnText,
                reportType === 'harian' && styles.toggleBtnTextActive,
              ]}
            >
              Laporan Harian
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, reportType === 'bulanan' && styles.toggleBtnActive]}
            onPress={() => setReportType('bulanan')}
          >
            <Ionicons
              name="bar-chart-outline"
              size={16}
              color={reportType === 'bulanan' ? '#FFFFFF' : Colors.textSecondary}
            />
            <Text
              style={[
                styles.toggleBtnText,
                reportType === 'bulanan' && styles.toggleBtnTextActive,
              ]}
            >
              Laporan Bulanan
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date / Month Indicator Banner */}
        <View style={styles.dateSelectorCard}>
          <View>
            <Text style={styles.dateSelectorLabel}>
              {reportType === 'harian' ? 'Tanggal Laporan:' : 'Periode Bulan:'}
            </Text>
            <Text style={styles.dateSelectorValue}>
              {reportType === 'harian'
                ? formatDate(selectedDate)
                : `Bulan ${selectedMonth}`}
            </Text>
          </View>

          <TouchableOpacity style={styles.shareBtn} onPress={handleShareReport}>
            <Ionicons name="share-social-outline" size={16} color={Colors.primary} />
            <Text style={styles.shareBtnText}>Bagikan</Text>
          </TouchableOpacity>
        </View>

        {reportType === 'harian' ? (
          <>
            {/* KPI Cards Grid */}
            <View style={styles.kpiGrid}>
              {/* Omzet */}
              <Card style={styles.kpiCard}>
                <View style={[styles.kpiIcon, { backgroundColor: Colors.primarySubtle }]}>
                  <Ionicons name="cash" size={20} color={Colors.primary} />
                </View>
                <Text style={styles.kpiLabel}>Total Omzet</Text>
                <Text style={styles.kpiValue}>
                  {formatRupiah(dailyData?.totalRevenue || 0)}
                </Text>
                <Text style={styles.kpiSub}>Pendapatan kotor</Text>
              </Card>

              {/* Laba Kotor */}
              <Card style={styles.kpiCard}>
                <View style={[styles.kpiIcon, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="trending-up" size={20} color={Colors.emerald} />
                </View>
                <Text style={styles.kpiLabel}>Laba Kotor</Text>
                <Text style={[styles.kpiValue, { color: Colors.emerald }]}>
                  {formatRupiah(dailyData?.totalProfit || 0)}
                </Text>
                <Text style={styles.kpiSub}>Margin: ~{marginPercentage}%</Text>
              </Card>

              {/* Jumlah Transaksi */}
              <Card style={styles.kpiCard}>
                <View style={[styles.kpiIcon, { backgroundColor: '#E0E7FF' }]}>
                  <Ionicons name="receipt" size={20} color="#3730A3" />
                </View>
                <Text style={styles.kpiLabel}>Transaksi</Text>
                <Text style={styles.kpiValue}>{dailyData?.transactionCount || 0}</Text>
                <Text style={styles.kpiSub}>Nota belanja</Text>
              </Card>

              {/* Barang Terjual */}
              <Card style={styles.kpiCard}>
                <View style={[styles.kpiIcon, { backgroundColor: Colors.accentLight }]}>
                  <Ionicons name="cube" size={20} color={Colors.accentDark} />
                </View>
                <Text style={styles.kpiLabel}>Item Terjual</Text>
                <Text style={styles.kpiValue}>{dailyData?.itemsSoldCount || 0}</Text>
                <Text style={styles.kpiSub}>Pcs barang</Text>
              </Card>
            </View>

            {/* Transaction List of the Day */}
            <Text style={styles.listHeading}>Daftar Transaksi Hari Ini</Text>
            {(!dailyData || dailyData.transactions.length === 0) ? (
              <Card style={styles.emptyCard}>
                <Ionicons name="receipt-outline" size={40} color={Colors.textMuted} />
                <Text style={styles.emptyTitle}>Belum ada transaksi di tanggal ini</Text>
              </Card>
            ) : (
              dailyData.transactions.map(trx => (
                <TouchableOpacity
                  key={trx.id}
                  onPress={() => setActiveReceipt(trx)}
                  activeOpacity={0.7}
                >
                  <Card style={styles.trxItemCard}>
                    <View style={styles.trxRowTop}>
                      <Text style={styles.trxInvoice}>{trx.invoiceNumber}</Text>
                      <Text style={styles.trxAmount}>{formatRupiah(trx.totalAmount)}</Text>
                    </View>
                    <View style={styles.trxRowBottom}>
                      <Text style={styles.trxSubMeta}>
                        {trx.totalItems} item • Laba: {formatRupiah(trx.profit)}
                      </Text>
                      <Text style={styles.trxCashier}>{trx.cashierName}</Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))
            )}
          </>
        ) : (
          <>
            {/* Monthly KPIs */}
            <View style={styles.kpiGrid}>
              <Card style={styles.kpiCard}>
                <View style={[styles.kpiIcon, { backgroundColor: Colors.primarySubtle }]}>
                  <Ionicons name="cash" size={20} color={Colors.primary} />
                </View>
                <Text style={styles.kpiLabel}>Omzet Bulanan</Text>
                <Text style={styles.kpiValue}>
                  {formatRupiah(monthlyData?.totalRevenue || 0)}
                </Text>
                <Text style={styles.kpiSub}>{monthlyData?.transactionCount || 0} transaksi</Text>
              </Card>

              <Card style={styles.kpiCard}>
                <View style={[styles.kpiIcon, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="trending-up" size={20} color={Colors.emerald} />
                </View>
                <Text style={styles.kpiLabel}>Total Laba</Text>
                <Text style={[styles.kpiValue, { color: Colors.emerald }]}>
                  {formatRupiah(monthlyData?.totalProfit || 0)}
                </Text>
                <Text style={styles.kpiSub}>Laba kotor akumulasi</Text>
              </Card>
            </View>

            {/* Daily Summaries Breakdown */}
            <Text style={styles.listHeading}>Rincian Penjualan per Tanggal</Text>
            {(!monthlyData || monthlyData.dailySummaries.length === 0) ? (
              <Card style={styles.emptyCard}>
                <Ionicons name="bar-chart-outline" size={40} color={Colors.textMuted} />
                <Text style={styles.emptyTitle}>Belum ada data penjualan pada bulan ini</Text>
              </Card>
            ) : (
              monthlyData.dailySummaries.map(day => (
                <Card key={day.date} style={styles.dailySummaryCard}>
                  <View style={styles.dailySummaryHeader}>
                    <Text style={styles.dailyDate}>{formatDate(day.date)}</Text>
                    <Text style={styles.dailyRevenue}>{formatRupiah(day.revenue)}</Text>
                  </View>
                  <View style={styles.dailySummaryFooter}>
                    <Text style={styles.dailyTransactions}>
                      {day.transactions} Transaksi
                    </Text>
                    <Text style={styles.dailyProfit}>
                      Laba: {formatRupiah(day.profit)}
                    </Text>
                  </View>
                </Card>
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* Struk Modal */}
      <ReceiptModal
        visible={!!activeReceipt}
        transaction={activeReceipt}
        onClose={() => setActiveReceipt(null)}
      />
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
    paddingBottom: 40,
  },
  accessDeniedBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  accessDeniedTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginTop: 16,
  },
  accessDeniedDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  tabToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceVariant,
    padding: 4,
    borderRadius: 12,
    marginBottom: 14,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  toggleBtnActive: {
    backgroundColor: Colors.primary,
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
  },
  dateSelectorCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  dateSelectorLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  dateSelectorValue: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primarySubtle,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  shareBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  kpiCard: {
    width: '48%',
    padding: 12,
  },
  kpiIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  kpiLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  kpiSub: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  listHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyTitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 8,
  },
  trxItemCard: {
    marginBottom: 8,
    padding: 12,
  },
  trxRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  trxInvoice: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  trxAmount: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.primary,
  },
  trxRowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trxSubMeta: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  trxCashier: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  dailySummaryCard: {
    marginBottom: 8,
    padding: 12,
  },
  dailySummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dailyDate: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  dailyRevenue: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.primary,
  },
  dailySummaryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dailyTransactions: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  dailyProfit: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.emerald,
  },
});
