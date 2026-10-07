import React, { useState, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { transactionRepository } from '@/services/repositories';
import { Transaction } from '@/types';
import { Button } from '@/components/Button';
import { formatRupiah } from '@/utils/currency';
import { formatDateTime } from '@/utils/date';
import { generateTextReceipt } from '@/utils/receiptGenerator';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [transaction, setTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    if (id) {
      transactionRepository.getById(id).then(t => setTransaction(t));
    }
  }, [id]);

  if (!transaction) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Transaksi</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Transaksi tidak ditemukan</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleShare = async () => {
    try {
      const text = generateTextReceipt(transaction);
      await Share.share({
        message: text,
        title: `Struk ${transaction.invoiceNumber}`,
      });
    } catch {
      Alert.alert('Error', 'Gagal membagikan struk.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Struk Transaksi</Text>
        <TouchableOpacity onPress={handleShare} style={styles.backBtn}>
          <Ionicons name="share-social-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Paper Receipt Simulation */}
        <View style={styles.paperReceipt}>
          <View style={styles.receiptStore}>
            <Text style={styles.storeName}>TOKO MADURA</Text>
            <Text style={styles.storeAddress}>Jl. Raya Toko Madura 24 Jam</Text>
            <Text style={styles.storePhone}>Buka 24 Jam Non-Stop</Text>
          </View>

          <View style={styles.dashedDivider} />

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>No. Faktur</Text>
            <Text style={styles.metaValue}>{transaction.invoiceNumber}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Waktu</Text>
            <Text style={styles.metaValue}>{formatDateTime(transaction.createdAt)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Kasir</Text>
            <Text style={styles.metaValue}>{transaction.cashierName}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Metode Bayar</Text>
            <Text style={styles.metaValue}>{transaction.paymentMethod.toUpperCase()}</Text>
          </View>

          <View style={styles.dashedDivider} />

          {/* Item List */}
          <View style={styles.itemsList}>
            {transaction.items.map((it, idx) => (
              <View key={idx} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{it.productName}</Text>
                  <Text style={styles.itemQtyPrice}>
                    {it.quantity} x {formatRupiah(it.sellPrice)}
                  </Text>
                </View>
                <Text style={styles.itemSubtotal}>{formatRupiah(it.subtotal)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.dashedDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Belanja ({transaction.totalItems} item)</Text>
            <Text style={styles.summaryTotal}>{formatRupiah(transaction.totalAmount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Bayar Tunai</Text>
            <Text style={styles.summaryValue}>{formatRupiah(transaction.cashPaid)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.changeLabel}>Kembalian</Text>
            <Text style={styles.changeValue}>{formatRupiah(transaction.changeAmount)}</Text>
          </View>

          <View style={styles.dashedDivider} />

          <View style={styles.receiptFooter}>
            <Text style={styles.footerThanks}>MATOR SAKALANGKONG</Text>
            <Text style={styles.footerNote}>Terima kasih atas kunjungan Anda!</Text>
          </View>
        </View>

        <Button
          title="Bagikan Struk ke WhatsApp"
          icon="logo-whatsapp"
          variant="accent"
          size="large"
          onPress={handleShare}
          style={{ marginTop: 20 }}
        />
      </ScrollView>
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
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  paperReceipt: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  receiptStore: {
    alignItems: 'center',
    marginBottom: 10,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  storeAddress: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  storePhone: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  dashedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: '#D6D3D1',
    borderStyle: 'dashed',
    marginVertical: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  itemsList: {
    marginVertical: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  itemQtyPrice: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  itemSubtotal: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primary,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  changeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  changeValue: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.emerald,
  },
  receiptFooter: {
    alignItems: 'center',
    marginVertical: 8,
  },
  footerThanks: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  footerNote: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
