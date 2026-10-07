import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/context/ProductContext';
import { Product } from '@/types';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { BarcodeScannerModal } from '@/components/BarcodeScannerModal';
import { formatRupiah, parseRupiah } from '@/utils/currency';

export default function RestockScreen() {
  const { productId } = useLocalSearchParams<{ productId?: string }>();
  const { role, user } = useAuth();
  const { products, getProductById, getProductByBarcode, restockProduct } = useProducts();
  const router = useRouter();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('10');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [scannerVisible, setScannerVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Pre-select product if passed from params
  useEffect(() => {
    if (productId) {
      const found = getProductById(productId);
      if (found) {
        setSelectedProduct(found);
        setPurchasePrice(found.buyPrice.toString());
      }
    } else if (products.length > 0 && !selectedProduct) {
      setSelectedProduct(products[0]);
      setPurchasePrice(products[0].buyPrice.toString());
    }
  }, [productId, products, getProductById]);

  if (role !== 'pemilik') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.deniedBox}>
          <Text style={styles.deniedTitle}>Akses Ditolak</Text>
          <Text style={styles.deniedDesc}>
            Hanya Pemilik Toko yang dapat mencatat barang masuk (restok).
          </Text>
          <Button title="Kembali" onPress={() => router.back()} style={{ marginTop: 16 }} />
        </View>
      </SafeAreaView>
    );
  }

  const handleSelectProduct = (prod: Product) => {
    setSelectedProduct(prod);
    setPurchasePrice(prod.buyPrice.toString());
  };

  const handleBarcodeScan = (barcode: string) => {
    const found = getProductByBarcode(barcode);
    if (!found) {
      Alert.alert(
        'Produk Tidak Ditemukan',
        `Barcode "${barcode}" belum ada di database produk.`
      );
      return;
    }
    handleSelectProduct(found);
  };

  const handleSaveRestock = async () => {
    if (!selectedProduct) {
      Alert.alert('Peringatan', 'Pilih produk yang akan direstok.');
      return;
    }

    const numQty = parseInt(quantity, 10);
    if (isNaN(numQty) || numQty <= 0) {
      Alert.alert('Peringatan', 'Jumlah barang masuk harus lebih dari 0.');
      return;
    }

    const numPrice = purchasePrice ? parseRupiah(purchasePrice) : selectedProduct.buyPrice;

    try {
      setLoading(true);
      await restockProduct(
        selectedProduct.id,
        numQty,
        numPrice,
        supplier.trim() || 'Supplier Grosir',
        notes.trim() || 'Barang masuk restok',
        user?.name || 'Pemilik Toko'
      );

      Alert.alert(
        'Barang Masuk Berhasil!',
        `Stok "${selectedProduct.name}" bertambah ${numQty} ${selectedProduct.unit}. Total stok sekarang: ${selectedProduct.stock + numQty} ${selectedProduct.unit}.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Gagal menyimpan data restok.');
    } finally {
      setLoading(false);
    }
  };

  const currentStock = selectedProduct ? selectedProduct.stock : 0;
  const addedQty = parseInt(quantity, 10) || 0;
  const previewStock = currentStock + addedQty;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Barang Masuk (Restok)</Text>
        <TouchableOpacity
          onPress={() => setScannerVisible(true)}
          style={styles.headerScanBtn}
        >
          <Ionicons name="barcode-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Pilih Produk */}
          <Text style={styles.sectionLabel}>Pilih Produk yang Masuk:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productPickerScroll}
          >
            {products.map(prod => (
              <TouchableOpacity
                key={prod.id}
                style={[
                  styles.productPickCard,
                  selectedProduct?.id === prod.id && styles.productPickCardActive,
                ]}
                onPress={() => handleSelectProduct(prod)}
              >
                <Text
                  style={[
                    styles.productPickName,
                    selectedProduct?.id === prod.id && styles.productPickNameActive,
                  ]}
                  numberOfLines={1}
                >
                  {prod.name}
                </Text>
                <Text style={styles.productPickStock}>
                  Stok saat ini: {prod.stock} {prod.unit}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Selected Product Card Preview */}
          {selectedProduct && (
            <Card style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <View>
                  <Text style={styles.previewName}>{selectedProduct.name}</Text>
                  <Text style={styles.previewCategory}>
                    Kategori: {selectedProduct.category.toUpperCase()} • Barcode: {selectedProduct.barcode}
                  </Text>
                </View>
              </View>

              <View style={styles.stockCalculatorRow}>
                <View style={styles.calcBox}>
                  <Text style={styles.calcLabel}>Stok Saat Ini</Text>
                  <Text style={styles.calcValue}>{currentStock} {selectedProduct.unit}</Text>
                </View>
                <Ionicons name="add" size={20} color={Colors.emerald} />
                <View style={styles.calcBox}>
                  <Text style={styles.calcLabel}>Tambah</Text>
                  <Text style={[styles.calcValue, { color: Colors.emerald }]}>
                    +{addedQty} {selectedProduct.unit}
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color={Colors.primary} />
                <View style={[styles.calcBox, { backgroundColor: '#DCFCE7' }]}>
                  <Text style={styles.calcLabel}>Total Baru</Text>
                  <Text style={[styles.calcValue, { color: Colors.primaryDark, fontWeight: '900' }]}>
                    {previewStock} {selectedProduct.unit}
                  </Text>
                </View>
              </View>
            </Card>
          )}

          {/* Form Input Barang Masuk */}
          <View style={styles.formSection}>
            <Input
              label="Jumlah Tambahan Barang Masuk *"
              placeholder="Contoh: 20"
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
              icon="add-circle-outline"
            />

            <Input
              label="Harga Beli Modal per Unit (Opsional)"
              prefix="Rp"
              placeholder="Sesuai harga beli faktur terbaru"
              keyboardType="numeric"
              value={purchasePrice ? parseRupiah(purchasePrice).toLocaleString('id-ID') : ''}
              onChangeText={setPurchasePrice}
            />

            <Input
              label="Nama Supplier / Distributor"
              placeholder="Contoh: PT Sumber Pangan / Grosir Madura"
              value={supplier}
              onChangeText={setSupplier}
              icon="business-outline"
            />

            <Input
              label="Catatan Pembelian"
              placeholder="Contoh: Pembelian stok grosir faktur #889"
              value={notes}
              onChangeText={setNotes}
            />

            <Button
              title="Simpan Barang Masuk & Update Stok"
              icon="arrow-down-circle-outline"
              onPress={handleSaveRestock}
              loading={loading}
              size="large"
              style={{ marginTop: 14 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <BarcodeScannerModal
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScan={handleBarcodeScan}
        title="Scan Barcode untuk Restok"
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
  headerScanBtn: {
    padding: 6,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  deniedBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  deniedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  deniedDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  productPickerScroll: {
    gap: 8,
    marginBottom: 16,
  },
  productPickCard: {
    backgroundColor: Colors.surface,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 140,
    maxWidth: 180,
  },
  productPickCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySubtle,
  },
  productPickName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  productPickNameActive: {
    color: Colors.primary,
  },
  productPickStock: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
  },
  previewCard: {
    marginBottom: 16,
    backgroundColor: Colors.surface,
  },
  previewHeader: {
    marginBottom: 12,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  previewCategory: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  stockCalculatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceVariant,
    padding: 10,
    borderRadius: 10,
  },
  calcBox: {
    alignItems: 'center',
    padding: 6,
    borderRadius: 6,
  },
  calcLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  calcValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  formSection: {
    marginTop: 4,
  },
});
