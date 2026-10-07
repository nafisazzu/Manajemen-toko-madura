import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Transaction } from '@/types';
import { Button } from './Button';
import { formatRupiah } from '@/utils/currency';
import { formatDateTime } from '@/utils/date';
import { generateTextReceipt } from '@/utils/receiptGenerator';

interface ReceiptModalProps {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  visible,
  transaction,
  onClose,
}) => {
  if (!transaction) return null;

  const handleShare = async () => {
    try {
      const text = generateTextReceipt(transaction);
      await Share.share({
        message: text,
        title: `Struk Belanja ${transaction.invoiceNumber}`,
      });
    } catch {
      Alert.alert('Error', 'Gagal membagikan struk.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header Banner */}
          <View style={styles.successHeader}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.successTitle}>Transaksi Berhasil!</Text>
            <Text style={styles.successSubtitle}>Struk belanja telah dicatat</Text>
          </View>

          {/* Paper Receipt Simulation */}
          <ScrollView style={styles.paperReceipt} showsVerticalScrollIndicator={false}>
            {/* Store Header */}
            <View style={styles.receiptStore}>
              <Text style={styles.storeName}>TOKO MADURA</Text>
              <Text style={styles.storeAddress}>Jl. Raya Toko Madura 24 Jam</Text>
              <Text style={styles.storePhone}>Telp / WA: 0812-3456-7890</Text>
            </View>

            <View style={styles.dashedDivider} />

            {/* Meta Info */}
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>No. Struk</Text>
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
              <Text style={styles.metaLabel}>Metode</Text>
              <Text style={styles.metaValue}>{transaction.paymentMethod.toUpperCase()}</Text>
            </View>

            <View style={styles.dashedDivider} />

            {/* Item Rows */}
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

            {/* Totals */}
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

            {/* Footer */}
            <View style={styles.receiptFooter}>
              <Text style={styles.footerThanks}>MATOR SAKALANGKONG</Text>
              <Text style={styles.footerNote}>Terima kasih atas kunjungan Anda!</Text>
              <Text style={styles.footerHours}>Buka 24 Jam Non-Stop</Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.modalActions}>
            <Button
              title="Bagikan / WA"
              variant="outline"
              icon="share-social-outline"
              onPress={handleShare}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Transaksi Baru"
              icon="checkmark-outline"
              onPress={onClose}
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    width: '100%',
    maxHeight: '90%',
    overflow: 'hidden',
  },
  successHeader: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    alignItems: 'center',
  },
  successIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  successTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  successSubtitle: {
    color: '#A7F3D0',
    fontSize: 12,
  },
  paperReceipt: {
    padding: 18,
    backgroundColor: '#FAFAF9',
  },
  receiptStore: {
    alignItems: 'center',
    marginBottom: 10,
  },
  storeName: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  storeAddress: {
    fontSize: 11,
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
    marginVertical: 10,
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
    fontWeight: '600',
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
    fontWeight: '700',
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
    fontSize: 17,
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
    fontWeight: '800',
    color: Colors.emerald,
  },
  receiptFooter: {
    alignItems: 'center',
    marginVertical: 8,
  },
  footerThanks: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  footerNote: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  footerHours: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
