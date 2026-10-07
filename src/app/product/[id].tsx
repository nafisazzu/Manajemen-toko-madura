import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/context/ProductContext';
import { restockRepository } from '@/services/repositories';
import { RestockLog } from '@/types';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { LowStockBadge } from '@/components/LowStockBadge';
import { formatRupiah } from '@/utils/currency';
import { formatDateTime } from '@/utils/date';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { role } = useAuth();
  const { getProductById, deleteProduct } = useProducts();
  const router = useRouter();

  const [restockLogs, setRestockLogs] = useState<RestockLog[]>([]);
  const product = id ? getProductById(id) : undefined;
  const isPemilik = role === 'pemilik';

  useEffect(() => {
    if (id) {
      restockRepository.getByProductId(id).then(logs => setRestockLogs(logs));
    }
  }, [id]);

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Produk tidak ditemukan</Text>
          <Button title="Kembali" onPress={() => router.back()} style={{ marginTop: 16 }} />
        </View>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Hapus Produk',
      `Yakin ingin menghapus "${product.name}" dari katalog?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            await deleteProduct(product.id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Produk</Text>
        {isPemilik ? (
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/product/edit', params: { id: product.id } })}
            style={styles.editBtn}
          >
            <Ionicons name="create-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Main Info Card */}
        <Card style={styles.mainCard}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.category}>{product.category.toUpperCase()}</Text>
            </View>
            <LowStockBadge stock={product.stock} unit={product.unit} />
          </View>

          <View style={styles.divider} />

          {/* Pricing Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Harga Jual</Text>
              <Text style={styles.priceHighlight}>{formatRupiah(product.sellPrice)}</Text>
              <Text style={styles.infoSub}>per {product.unit}</Text>
            </View>

            {isPemilik && (
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Harga Beli (Modal)</Text>
                <Text style={styles.costHighlight}>{formatRupiah(product.buyPrice)}</Text>
                <Text style={styles.infoSub}>
                  Laba: {formatRupiah(product.sellPrice - product.buyPrice)}
                </Text>
              </View>
            )}

            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Sisa Stok Fisik</Text>
              <Text
                style={[
                  styles.stockHighlight,
                  product.stock <= 3 && { color: Colors.danger },
                ]}
              >
                {product.stock} {product.unit}
              </Text>
              <Text style={styles.infoSub}>
                {product.stock <= 3 ? 'Perlu Restok!' : 'Stok Aman'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Barcode Info */}
          <View style={styles.barcodeBox}>
            <Ionicons name="barcode-outline" size={24} color={Colors.textSecondary} />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.barcodeLabel}>Kode Barcode</Text>
              <Text style={styles.barcodeValue}>{product.barcode}</Text>
            </View>
          </View>
        </Card>

        {/* Pemilik Action Buttons */}
        {isPemilik && (
          <View style={styles.actionRow}>
            <Button
              title="Barang Masuk (+Restok)"
              icon="add-circle-outline"
              variant="secondary"
              onPress={() =>
                router.push({
                  pathname: '/product/restock',
                  params: { productId: product.id },
                })
              }
              style={{ flex: 1, marginRight: 6 }}
            />
            <Button
              title="Hapus"
              icon="trash-outline"
              variant="danger"
              onPress={handleDelete}
              style={{ flex: 0.5, marginLeft: 6 }}
            />
          </View>
        )}

        {/* Riwayat Barang Masuk (Restock History) */}
        {isPemilik && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Riwayat Barang Masuk (Restok)</Text>
            {restockLogs.length === 0 ? (
              <Card style={styles.emptyLogsCard}>
                <Text style={styles.emptyLogsText}>Belum ada riwayat restok tercatat</Text>
              </Card>
            ) : (
              restockLogs.map(log => (
                <Card key={log.id} style={styles.logCard}>
                  <View style={styles.logHeader}>
                    <Text style={styles.logQty}>+{log.quantityAdded} {product.unit}</Text>
                    <Text style={styles.logDate}>{formatDateTime(log.createdAt)}</Text>
                  </View>
                  <Text style={styles.logCost}>
                    Modal: {formatRupiah(log.purchasePrice)} • Total: {formatRupiah(log.totalCost)}
                  </Text>
                  {log.supplier && (
                    <Text style={styles.logSupplier}>Supplier: {log.supplier}</Text>
                  )}
                  {log.notes && (
                    <Text style={styles.logNotes}>"{log.notes}"</Text>
                  )}
                </Card>
              ))
            )}
          </View>
        )}
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
  editBtn: {
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
    fontSize: 16,
    color: Colors.textSecondary,
  },
  mainCard: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productName: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  category: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '700',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 14,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  priceHighlight: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.primary,
  },
  costHighlight: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  stockHighlight: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  infoSub: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  barcodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceVariant,
    padding: 10,
    borderRadius: 8,
  },
  barcodeLabel: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  barcodeValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  historySection: {
    marginTop: 6,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  emptyLogsCard: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyLogsText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  logCard: {
    marginBottom: 8,
    padding: 12,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  logQty: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.emerald,
  },
  logDate: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  logCost: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  logSupplier: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  logNotes: {
    fontSize: 11,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
