import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useProducts } from '@/context/ProductContext';
import { useCart } from '@/context/CartContext';
import { Product, ProductCategory, Transaction } from '@/types';
import { Header } from '@/components/Header';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { LowStockBadge } from '@/components/LowStockBadge';
import { BarcodeScannerModal } from '@/components/BarcodeScannerModal';
import { ReceiptModal } from '@/components/ReceiptModal';
import { formatRupiah, parseRupiah } from '@/utils/currency';

const CATEGORIES: { label: string; value: ProductCategory | 'semua' }[] = [
  { label: 'Semua', value: 'semua' },
  { label: 'Rokok', value: 'rokok' },
  { label: 'Minuman', value: 'minuman' },
  { label: 'Mie Instan', value: 'mie' },
  { label: 'Sembako', value: 'sembako' },
  { label: 'Lainnya', value: 'lainnya' },
];

export default function PosScreen() {
  const { products, getProductByBarcode } = useProducts();
  const {
    items,
    totalItems,
    totalAmount,
    cashPaid,
    changeAmount,
    paymentMethod,
    setCashPaid,
    setPaymentMethod,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    setQuickCash,
    setExactCash,
    checkout,
  } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'semua'>('semua');
  const [scannerVisible, setScannerVisible] = useState(false);
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);
  const [receiptVisible, setReceiptVisible] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  // Filter products by search and category
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'semua' || p.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.barcode.includes(query) ||
      p.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const handleBarcodeScan = (barcode: string) => {
    const found = getProductByBarcode(barcode);
    if (!found) {
      Alert.alert(
        'Produk Tidak Ditemukan',
        `Barcode "${barcode}" belum terdaftar di database produk toko.`,
        [{ text: 'OK' }]
      );
      return;
    }

    const res = addToCart(found, 1);
    if (!res.success) {
      Alert.alert('Gagal Menambah', res.message || 'Stok tidak mencukupi.');
    } else {
      Alert.alert('Sukses', `"${found.name}" berhasil dimasukkan ke keranjang.`);
    }
  };

  const handleProductPress = (product: Product) => {
    const res = addToCart(product, 1);
    if (!res.success) {
      Alert.alert('Peringatan Stok', res.message || 'Stok tidak cukup.');
    }
  };

  const handleDoCheckout = async () => {
    try {
      setCheckingOut(true);
      const trx = await checkout();
      setCartModalVisible(false);
      setCompletedTransaction(trx);
      setReceiptVisible(true);
    } catch (e: any) {
      Alert.alert('Transaksi Ditolak', e.message || 'Gagal memproses transaksi.');
    } finally {
      setCheckingOut(false);
    }
  };

  const QUICK_CASH_OPTIONS = [10000, 20000, 50000, 100000];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />

      {/* Top Search & Barcode Scan Bar */}
      <View style={styles.searchBarContainer}>
        <Input
          placeholder="Cari nama atau barcode..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          icon="search"
          style={{ flex: 1, minHeight: 44 }}
        />
        <TouchableOpacity
          style={styles.scanBtn}
          onPress={() => setScannerVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="barcode-outline" size={22} color="#000000" />
          <Text style={styles.scanBtnText}>Scan</Text>
        </TouchableOpacity>
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

      {/* Products Grid */}
      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.productList}
        renderItem={({ item }) => {
          const inCartItem = items.find(it => it.productId === item.id);
          const isOutOfStock = item.stock <= 0;

          return (
            <TouchableOpacity
              style={[styles.productCard, isOutOfStock && styles.productCardDisabled]}
              onPress={() => handleProductPress(item)}
              disabled={isOutOfStock}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.categoryTag}>{item.category.toUpperCase()}</Text>
                {inCartItem && (
                  <View style={styles.cartQtyBadge}>
                    <Text style={styles.cartQtyBadgeText}>{inCartItem.quantity}</Text>
                  </View>
                )}
              </View>

              <Text style={styles.productName} numberOfLines={2}>
                {item.name}
              </Text>

              <Text style={styles.productPrice}>{formatRupiah(item.sellPrice)}</Text>

              <View style={styles.cardFooter}>
                <LowStockBadge stock={item.stock} unit={item.unit} size="small" />
                {item.stock > 3 && (
                  <Text style={styles.normalStockText}>
                    Stok: {item.stock} {item.unit}
                  </Text>
                )}
                <View style={[styles.addBtnCircle, isOutOfStock && styles.addBtnCircleDisabled]}>
                  <Ionicons
                    name={isOutOfStock ? 'close' : 'add'}
                    size={16}
                    color={isOutOfStock ? Colors.textMuted : '#FFFFFF'}
                  />
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Produk tidak ditemukan</Text>
            <Text style={styles.emptySubtitle}>Coba kata kunci pencarian lain</Text>
          </View>
        }
      />

      {/* Bottom Sticky Cart Summary Bar */}
      {totalItems > 0 && (
        <View style={styles.bottomCartBar}>
          <View style={styles.cartBarInfo}>
            <View style={styles.cartCountPill}>
              <Ionicons name="cart" size={16} color="#000000" />
              <Text style={styles.cartCountText}>{totalItems} Item</Text>
            </View>
            <Text style={styles.cartBarTotal}>{formatRupiah(totalAmount)}</Text>
          </View>

          <Button
            title="Bayar Sekarang"
            icon="arrow-forward-outline"
            onPress={() => {
              setExactCash();
              setCartModalVisible(true);
            }}
            variant="accent"
            size="medium"
          />
        </View>
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScan={handleBarcodeScan}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        visible={receiptVisible}
        transaction={completedTransaction}
        onClose={() => {
          setReceiptVisible(false);
          setCompletedTransaction(null);
        }}
      />

      {/* Checkout / Cart Sheet Modal */}
      <Modal
        visible={cartModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setCartModalVisible(false)}
      >
        <SafeAreaView style={styles.cartSheetContainer}>
          <View style={styles.cartSheetHeader}>
            <Text style={styles.cartSheetTitle}>Keranjang Belanja</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={clearCart} style={styles.clearCartBtn}>
                <Text style={styles.clearCartText}>Kosongkan</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCartModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Cart Item List */}
          <ScrollView style={styles.cartItemList} showsVerticalScrollIndicator={false}>
            {items.map(it => (
              <View key={it.productId} style={styles.cartItemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cartItemName}>{it.productName}</Text>
                  <Text style={styles.cartItemPrice}>
                    {formatRupiah(it.sellPrice)} / {it.unit}
                  </Text>
                  <Text style={styles.cartItemSubtotal}>
                    Total: {formatRupiah(it.subtotal)}
                  </Text>
                </View>

                {/* Stepper Quantity */}
                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => updateQuantity(it.productId, it.quantity - 1)}
                  >
                    <Ionicons name="remove" size={16} color={Colors.primary} />
                  </TouchableOpacity>
                  <Text style={styles.stepNumber}>{it.quantity}</Text>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => {
                      const res = updateQuantity(it.productId, it.quantity + 1);
                      if (!res.success) {
                        Alert.alert('Batas Stok', res.message || 'Stok tidak cukup.');
                      }
                    }}
                  >
                    <Ionicons name="add" size={16} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteItemBtn}
                    onPress={() => removeFromCart(it.productId)}
                  >
                    <Ionicons name="trash-outline" size={16} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Payment Section */}
            <Card style={styles.paymentCard}>
              <Text style={styles.paymentSectionTitle}>Metode Pembayaran</Text>
              <View style={styles.paymentMethodRow}>
                <TouchableOpacity
                  style={[
                    styles.methodBtn,
                    paymentMethod === 'tunai' && styles.methodBtnActive,
                  ]}
                  onPress={() => setPaymentMethod('tunai')}
                >
                  <Ionicons
                    name="cash-outline"
                    size={20}
                    color={paymentMethod === 'tunai' ? '#FFFFFF' : Colors.textPrimary}
                  />
                  <Text
                    style={[
                      styles.methodBtnText,
                      paymentMethod === 'tunai' && styles.methodBtnTextActive,
                    ]}
                  >
                    Tunai (Cash)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.methodBtn,
                    paymentMethod === 'qris' && styles.methodBtnActive,
                  ]}
                  onPress={() => {
                    setPaymentMethod('qris');
                    setExactCash();
                  }}
                >
                  <Ionicons
                    name="qr-code-outline"
                    size={20}
                    color={paymentMethod === 'qris' ? '#FFFFFF' : Colors.textPrimary}
                  />
                  <Text
                    style={[
                      styles.methodBtnText,
                      paymentMethod === 'qris' && styles.methodBtnTextActive,
                    ]}
                  >
                    QRIS
                  </Text>
                </TouchableOpacity>
              </View>

              {paymentMethod === 'tunai' && (
                <View style={styles.cashInputSection}>
                  <Text style={styles.cashInputLabel}>Uang Diterima dari Pembeli:</Text>

                  {/* Nominal Cepat */}
                  <View style={styles.quickNominalRow}>
                    <TouchableOpacity
                      style={styles.quickNominalBtn}
                      onPress={setExactCash}
                    >
                      <Text style={styles.quickNominalText}>Uang Pas</Text>
                    </TouchableOpacity>
                    {QUICK_CASH_OPTIONS.map(val => (
                      <TouchableOpacity
                        key={val}
                        style={styles.quickNominalBtn}
                        onPress={() => setQuickCash(val)}
                      >
                        <Text style={styles.quickNominalText}>
                          {val / 1000}k
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Input
                    prefix="Rp"
                    value={cashPaid > 0 ? cashPaid.toLocaleString('id-ID') : ''}
                    onChangeText={txt => setCashPaid(parseRupiah(txt))}
                    keyboardType="numeric"
                    placeholder="0"
                    style={{ fontSize: 20, fontWeight: '800' }}
                  />

                  {/* Kembalian */}
                  <View style={styles.changeDisplayBox}>
                    <Text style={styles.changeDisplayLabel}>Kembalian:</Text>
                    <Text
                      style={[
                        styles.changeDisplayValue,
                        cashPaid < totalAmount && { color: Colors.danger },
                      ]}
                    >
                      {cashPaid < totalAmount
                        ? `Kurang ${formatRupiah(totalAmount - cashPaid)}`
                        : formatRupiah(changeAmount)}
                    </Text>
                  </View>
                </View>
              )}
            </Card>
          </ScrollView>

          {/* Bottom Checkout Button */}
          <View style={styles.cartSheetFooter}>
            <View style={styles.sheetTotalRow}>
              <Text style={styles.sheetTotalLabel}>Total Tagihan:</Text>
              <Text style={styles.sheetTotalAmount}>{formatRupiah(totalAmount)}</Text>
            </View>

            <Button
              title={checkingOut ? 'Memproses...' : 'Selesaikan Transaksi & Buat Struk'}
              onPress={handleDoCheckout}
              loading={checkingOut}
              size="large"
              disabled={paymentMethod === 'tunai' && cashPaid < totalAmount}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 8,
  },
  scanBtn: {
    backgroundColor: Colors.accent,
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  scanBtnText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 13,
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
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  productList: {
    padding: 12,
    paddingBottom: 90,
  },
  columnWrapper: {
    gap: 10,
    marginBottom: 10,
  },
  productCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'space-between',
    minHeight: 140,
  },
  productCardDisabled: {
    opacity: 0.5,
    backgroundColor: '#F3F4F6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryTag: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  cartQtyBadge: {
    backgroundColor: Colors.accent,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartQtyBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 18,
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.primary,
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  normalStockText: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  addBtnCircle: {
    backgroundColor: Colors.primary,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  addBtnCircleDisabled: {
    backgroundColor: Colors.borderDark,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
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
  bottomCartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  cartBarInfo: {
    flex: 1,
  },
  cartCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cartCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  cartBarTotal: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primary,
  },
  cartSheetContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  cartSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  cartSheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  clearCartBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  clearCartText: {
    fontSize: 13,
    color: Colors.danger,
    fontWeight: '700',
  },
  cartItemList: {
    flex: 1,
    padding: 16,
  },
  cartItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cartItemPrice: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cartItemSubtotal: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 4,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceVariant,
    borderRadius: 8,
    padding: 4,
    gap: 6,
  },
  stepBtn: {
    width: 28,
    height: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    minWidth: 20,
    textAlign: 'center',
  },
  deleteItemBtn: {
    padding: 6,
    marginLeft: 4,
  },
  paymentCard: {
    marginTop: 10,
    marginBottom: 24,
  },
  paymentSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  methodBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: 6,
  },
  methodBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  methodBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  methodBtnTextActive: {
    color: '#FFFFFF',
  },
  cashInputSection: {
    marginTop: 6,
  },
  cashInputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  quickNominalRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  quickNominalBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceVariant,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickNominalText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  changeDisplayBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceVariant,
    padding: 12,
    borderRadius: 8,
    marginTop: 6,
  },
  changeDisplayLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  changeDisplayValue: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.emerald,
  },
  cartSheetFooter: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sheetTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sheetTotalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  sheetTotalAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primary,
  },
});
