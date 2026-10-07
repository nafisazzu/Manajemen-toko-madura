import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/context/ProductContext';
import { Product, ProductCategory } from '@/types';
import { Header } from '@/components/Header';
import { Input } from '@/components/Input';
import { LowStockBadge } from '@/components/LowStockBadge';
import { formatRupiah } from '@/utils/currency';

const CATEGORIES: { label: string; value: ProductCategory | 'semua' }[] = [
  { label: 'Semua', value: 'semua' },
  { label: 'Rokok', value: 'rokok' },
  { label: 'Minuman', value: 'minuman' },
  { label: 'Mie Instan', value: 'mie' },
  { label: 'Sembako', value: 'sembako' },
  { label: 'Lainnya', value: 'lainnya' },
];

export default function ProductsScreen() {
  const { role } = useAuth();
  const { products, deleteProduct, resetSeedData } = useProducts();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'semua'>('semua');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

  const isPemilik = role === 'pemilik';

  const filtered = products.filter(p => {
    const matchesCat = selectedCategory === 'semua' || p.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.barcode.includes(query) ||
      p.category.toLowerCase().includes(query);
    const matchesLowStock = !filterLowStockOnly || p.stock <= p.minStockWarning;
    return matchesCat && matchesSearch && matchesLowStock;
  });

  const handleDelete = (product: Product) => {
    Alert.alert(
      'Hapus Produk',
      `Apakah Anda yakin ingin menghapus "${product.name}" dari katalog?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteProduct(product.id);
            if (success) {
              Alert.alert('Sukses', `Produk "${product.name}" berhasil dihapus.`);
            }
          },
        },
      ]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset Data Awal',
      'Kembalikan katalog ke 15 data produk kelontong bawaan?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetSeedData();
            Alert.alert('Sukses', 'Data contoh 15 produk telah dimuat ulang.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />

      {/* Action Bar for Pemilik */}
      <View style={styles.topActionBar}>
        <View>
          <Text style={styles.catalogHeading}>Katalog Produk & Stok</Text>
          <Text style={styles.catalogSub}>
            Total: {products.length} produk ({products.filter(p => p.stock <= 3).length} stok tipis)
          </Text>
        </View>

        {isPemilik && (
          <View style={styles.pemilikBtnGroup}>
            <TouchableOpacity
              style={styles.restockTopBtn}
              onPress={() => router.push('/product/restock')}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-down-circle" size={16} color={Colors.emerald} />
              <Text style={styles.restockTopBtnText}>Barang Masuk</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addProductBtn}
              onPress={() => router.push('/product/new')}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.addProductBtnText}>Tambah</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Search & Low Stock Toggle */}
      <View style={styles.searchSection}>
        <Input
          placeholder="Cari nama barang atau barcode..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          icon="search"
          style={{ minHeight: 42 }}
        />

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.lowStockToggle,
              filterLowStockOnly && styles.lowStockToggleActive,
            ]}
            onPress={() => setFilterLowStockOnly(!filterLowStockOnly)}
          >
            <Ionicons
              name={filterLowStockOnly ? 'checkbox' : 'square-outline'}
              size={16}
              color={filterLowStockOnly ? '#FFFFFF' : Colors.warning}
            />
            <Text
              style={[
                styles.lowStockToggleText,
                filterLowStockOnly && styles.lowStockToggleTextActive,
              ]}
            >
              Hanya Stok Menipis ( $\le 3$ )
            </Text>
          </TouchableOpacity>

          {isPemilik && (
            <TouchableOpacity onPress={handleResetData} style={styles.resetBtn}>
              <Ionicons name="refresh-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.resetBtnText}>Reset Data</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Pills */}
      <View style={styles.categoryScrollWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.value}
              style={[
                styles.categoryChip,
                selectedCategory === cat.value && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(cat.value)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === cat.value && styles.categoryChipTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Product List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.itemCard}
            onPress={() => router.push(`/product/${item.id}`)}
            activeOpacity={0.7}
          >
            <View style={styles.itemHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <View style={styles.itemMetaRow}>
                  <Text style={styles.itemCategory}>{item.category.toUpperCase()}</Text>
                  <Text style={styles.metaSeparator}>•</Text>
                  <Text style={styles.itemBarcode}>Barcode: {item.barcode}</Text>
                </View>
              </View>
              <LowStockBadge stock={item.stock} unit={item.unit} size="small" />
            </View>

            <View style={styles.priceStockRow}>
              <View>
                <Text style={styles.sellPriceLabel}>Harga Jual:</Text>
                <Text style={styles.sellPriceValue}>{formatRupiah(item.sellPrice)}</Text>
              </View>

              {isPemilik && (
                <View style={styles.buyPriceBox}>
                  <Text style={styles.buyPriceLabel}>Harga Beli (Modal):</Text>
                  <Text style={styles.buyPriceValue}>{formatRupiah(item.buyPrice)}</Text>
                </View>
              )}

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.stockLabel}>Sisa Stok:</Text>
                <Text
                  style={[
                    styles.stockValue,
                    item.stock <= 3 && { color: Colors.danger },
                  ]}
                >
                  {item.stock} {item.unit}
                </Text>
              </View>
            </View>

            {/* Action Buttons for Pemilik */}
            {isPemilik && (
              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={styles.itemActionBtn}
                  onPress={() =>
                    router.push({
                      pathname: '/product/restock',
                      params: { productId: item.id },
                    })
                  }
                >
                  <Ionicons name="add-circle-outline" size={16} color={Colors.emerald} />
                  <Text style={[styles.itemActionText, { color: Colors.emerald }]}>
                    Restok
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.itemActionBtn}
                  onPress={() =>
                    router.push({
                      pathname: '/product/edit',
                      params: { id: item.id },
                    })
                  }
                >
                  <Ionicons name="create-outline" size={16} color={Colors.primary} />
                  <Text style={[styles.itemActionText, { color: Colors.primary }]}>
                    Edit
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.itemActionBtn}
                  onPress={() => handleDelete(item)}
                >
                  <Ionicons name="trash-outline" size={16} color={Colors.danger} />
                  <Text style={[styles.itemActionText, { color: Colors.danger }]}>
                    Hapus
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Katalog Kosong</Text>
            <Text style={styles.emptySubtitle}>Tidak ada produk yang cocok dengan filter</Text>
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
  topActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  catalogHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  catalogSub: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  pemilikBtnGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  restockTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  restockTopBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.emerald,
  },
  addProductBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  addProductBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -4,
    marginBottom: 8,
  },
  lowStockToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  lowStockToggleActive: {
    backgroundColor: Colors.warning,
    borderColor: Colors.warning,
  },
  lowStockToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  lowStockToggleTextActive: {
    color: '#FFFFFF',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 6,
  },
  resetBtnText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  categoryScrollWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 8,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    gap: 10,
    paddingBottom: 40,
  },
  itemCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 6,
  },
  itemCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  metaSeparator: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  itemBarcode: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  priceStockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceVariant,
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  sellPriceLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  sellPriceValue: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.primary,
  },
  buyPriceBox: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 8,
  },
  buyPriceLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  buyPriceValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  stockLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  stockValue: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 16,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  itemActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  itemActionText: {
    fontSize: 12,
    fontWeight: '700',
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
