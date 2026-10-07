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
import { ProductCategory } from '@/types';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { parseRupiah } from '@/utils/currency';

const CATEGORIES: { label: string; value: ProductCategory }[] = [
  { label: 'Rokok', value: 'rokok' },
  { label: 'Minuman', value: 'minuman' },
  { label: 'Mie Instan', value: 'mie' },
  { label: 'Sembako', value: 'sembako' },
  { label: 'Snack', value: 'snack' },
  { label: 'Lainnya', value: 'lainnya' },
];

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { role } = useAuth();
  const { getProductById, updateProduct } = useProducts();
  const router = useRouter();

  const product = id ? getProductById(id) : undefined;

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('rokok');
  const [buyPrice, setBuyPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [stock, setStock] = useState('');
  const [barcode, setBarcode] = useState('');
  const [unit, setUnit] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setBuyPrice(product.buyPrice.toString());
      setSellPrice(product.sellPrice.toString());
      setStock(product.stock.toString());
      setBarcode(product.barcode);
      setUnit(product.unit);
    }
  }, [product]);

  if (role !== 'pemilik') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.deniedBox}>
          <Text style={styles.deniedTitle}>Akses Ditolak</Text>
          <Text style={styles.deniedDesc}>Hanya Pemilik yang dapat mengedit produk.</Text>
          <Button title="Kembali" onPress={() => router.back()} style={{ marginTop: 16 }} />
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.deniedBox}>
          <Text style={styles.deniedTitle}>Produk Tidak Ditemukan</Text>
          <Button title="Kembali" onPress={() => router.back()} style={{ marginTop: 16 }} />
        </View>
      </SafeAreaView>
    );
  }

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert('Validasi', 'Nama produk tidak boleh kosong.');
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
      await updateProduct(product.id, {
        name: name.trim(),
        category,
        buyPrice: numBuy,
        sellPrice: numSell,
        stock: numStock,
        barcode: barcode.trim(),
        unit: unit.trim() || 'pcs',
      });

      Alert.alert('Sukses', `Data produk "${name}" berhasil diperbarui.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Gagal memperbarui produk.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Data Produk</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Input label="Nama Produk *" value={name} onChangeText={setName} />

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

          <View style={styles.priceRow}>
            <View style={{ flex: 1 }}>
              <Input
                label="Harga Beli (Modal)"
                prefix="Rp"
                keyboardType="numeric"
                value={buyPrice ? parseRupiah(buyPrice).toLocaleString('id-ID') : ''}
                onChangeText={setBuyPrice}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Input
                label="Harga Jual *"
                prefix="Rp"
                keyboardType="numeric"
                value={sellPrice ? parseRupiah(sellPrice).toLocaleString('id-ID') : ''}
                onChangeText={setSellPrice}
              />
            </View>
          </View>

          <View style={styles.priceRow}>
            <View style={{ flex: 1 }}>
              <Input
                label="Stok *"
                keyboardType="numeric"
                value={stock}
                onChangeText={setStock}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Input label="Satuan Unit" value={unit} onChangeText={setUnit} />
            </View>
          </View>

          <Input
            label="Kode Barcode"
            value={barcode}
            onChangeText={setBarcode}
            icon="barcode-outline"
          />

          <Button
            title="Simpan Perubahan"
            onPress={handleUpdate}
            loading={loading}
            size="large"
            style={{ marginTop: 24 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
});
