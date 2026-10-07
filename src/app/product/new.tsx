import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/context/ProductContext';
import { ProductCategory } from '@/types';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { BarcodeScannerModal } from '@/components/BarcodeScannerModal';
import { parseRupiah } from '@/utils/currency';

const CATEGORIES: { label: string; value: ProductCategory }[] = [
  { label: 'Rokok', value: 'rokok' },
  { label: 'Minuman', value: 'minuman' },
  { label: 'Mie Instan', value: 'mie' },
  { label: 'Sembako', value: 'sembako' },
  { label: 'Snack', value: 'snack' },
  { label: 'Lainnya', value: 'lainnya' },
];

const COMMON_UNITS = ['bungkus', 'botol', 'pcs', 'kg', 'karung', 'renteng', 'pouch', 'dus'];

export default function NewProductScreen() {
  const { role } = useAuth();
  const { addProduct } = useProducts();
  const router = useRouter();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('rokok');
  const [buyPrice, setBuyPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [barcode, setBarcode] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [scannerVisible, setScannerVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Role Guard
  if (role !== 'pemilik') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.deniedBox}>
          <Text style={styles.deniedTitle}>Akses Ditolak</Text>
          <Text style={styles.deniedDesc}>Hanya Pemilik yang dapat menambah produk baru.</Text>
          <Button title="Kembali" onPress={() => router.back()} style={{ marginTop: 16 }} />
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validasi', 'Nama produk wajib diisi.');
      return;
    }

    const numBuy = parseRupiah(buyPrice);
    const numSell = parseRupiah(sellPrice);
    const numStock = parseInt(stock, 10) || 0;

    if (numSell <= 0) {
      Alert.alert('Validasi', 'Harga jual harus lebih dari Rp 0.');
      return;
    }

    try {
      setLoading(true);
      await addProduct({
        name: name.trim(),
        category,
        buyPrice: numBuy,
        sellPrice: numSell,
        stock: numStock,
        barcode: barcode.trim() || `BRC-${Date.now()}`,
        unit: unit.trim() || 'pcs',
        minStockWarning: 3,
      });

      Alert.alert('Sukses', `Produk "${name}" berhasil ditambahkan!`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Gagal menyimpan produk.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tambah Produk Baru</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Input
            label="Nama Produk *"
            placeholder="Contoh: Sampoerna Mild 16"
            value={name}
            onChangeText={setName}
          />

          {/* Kategori */}
          <Text style={styles.fieldLabel}>Kategori Produk *</Text>
          <View style={styles.chipRow}>
            {CATEGORIES.map(c => (
              <TouchableOpacity
                key={c.value}
                style={[styles.chip, category === c.value && styles.chipActive]}
                onPress={() => setCategory(c.value)}
              >
                <Text style={[styles.chipText, category === c.value && styles.chipTextActive]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Harga Beli & Harga Jual */}
          <View style={styles.priceRow}>
            <View style={{ flex: 1 }}>
              <Input
                label="Harga Beli (Modal)"
                prefix="Rp"
                placeholder="0"
                keyboardType="numeric"
                value={buyPrice ? parseRupiah(buyPrice).toLocaleString('id-ID') : ''}
                onChangeText={setBuyPrice}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Input
                label="Harga Jual *"
                prefix="Rp"
                placeholder="0"
                keyboardType="numeric"
                value={sellPrice ? parseRupiah(sellPrice).toLocaleString('id-ID') : ''}
                onChangeText={setSellPrice}
              />
            </View>
          </View>

          {/* Stok Awal & Satuan */}
          <View style={styles.priceRow}>
            <View style={{ flex: 1 }}>
              <Input
                label="Stok Awal *"
                placeholder="10"
                keyboardType="numeric"
                value={stock}
                onChangeText={setStock}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Input
                label="Satuan Unit"
                placeholder="pcs / bks"
                value={unit}
                onChangeText={setUnit}
              />
            </View>
          </View>

          {/* Satuan Chips Cepat */}
          <View style={styles.unitChipRow}>
            {COMMON_UNITS.map(u => (
              <TouchableOpacity
                key={u}
                style={[styles.unitChip, unit === u && styles.unitChipActive]}
                onPress={() => setUnit(u)}
              >
                <Text style={[styles.unitChipText, unit === u && styles.unitChipTextActive]}>
                  {u}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Barcode dengan Tombol Scan Kamera */}
          <View style={styles.barcodeSection}>
            <View style={{ flex: 1 }}>
              <Input
                label="Kode Barcode (Opsional)"
                placeholder="Pindai atau ketik angka barcode"
                value={barcode}
                onChangeText={setBarcode}
                icon="barcode-outline"
              />
            </View>
            <TouchableOpacity
              style={styles.scanBtn}
              onPress={() => setScannerVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="camera-outline" size={20} color="#000000" />
              <Text style={styles.scanBtnText}>Scan</Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Simpan Produk ke Katalog"
            onPress={handleSave}
            loading={loading}
            size="large"
            style={{ marginTop: 24 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <BarcodeScannerModal
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScan={code => setBarcode(code)}
        title="Pindai Barcode Produk Baru"
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
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  priceRow: {
    flexDirection: 'row',
  },
  unitChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: -6,
    marginBottom: 16,
  },
  unitChip: {
    backgroundColor: Colors.surfaceVariant,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  unitChipActive: {
    backgroundColor: Colors.primary,
  },
  unitChipText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  unitChipTextActive: {
    color: '#FFFFFF',
  },
  barcodeSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  scanBtn: {
    backgroundColor: Colors.accent,
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    gap: 6,
  },
  scanBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000000',
  },
});
