import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApiProducts } from '@/hooks/useApiProducts';
import { API_BASE_URL } from '@/services/api/config';
import { formatRupiah, toProdukModel } from '@/utils/productMapper';
import type { ProdukModel, StatusStok } from '@/types/api';

const C = {
  green: '#0F3D28',
  greenSoft: '#E3ECE6',
  amber: '#E6A122',
  amberSoft: '#FCF1DC',
  bg: '#F2F5F3',
  ink: '#16241C',
  muted: '#5C6B62',
  border: '#CBD6CF',
  danger: '#B3261E',
  dangerSoft: '#FBEAE8',
  white: '#FFFFFF',
  code: '#10231A',
};

const STATUS_STYLE: Record<StatusStok, { label: string; bg: string; fg: string }> = {
  aman: { label: 'Stok aman', bg: C.greenSoft, fg: C.green },
  menipis: { label: 'Menipis', bg: C.amberSoft, fg: '#8A5A00' },
  habis: { label: 'Habis', bg: C.dangerSoft, fg: C.danger },
};

const ICON_KATEGORI: Record<string, keyof typeof Ionicons.glyphMap> = {
  Rokok: 'flame-outline',
  Minuman: 'water-outline',
  'Mie Instan': 'restaurant-outline',
  Sembako: 'basket-outline',
};

export default function KatalogScreen() {
  const { produk, rawSample, loading, refreshing, error, lastFetched, reload } = useApiProducts();
  const [query, setQuery] = useState('');
  const [kategori, setKategori] = useState<string>('Semua');
  const [showData, setShowData] = useState(false);

  const daftarKategori = useMemo<string[]>(() => {
    const unik: string[] = [];
    produk.forEach((p) => {
      if (!unik.includes(p.kategori)) unik.push(p.kategori);
    });
    return ['Semua', ...unik];
  }, [produk]);

  const tampil = useMemo(() => {
    const q = query.trim().toLowerCase();
    return produk.filter(
      (p) =>
        (kategori === 'Semua' || p.kategori === kategori) &&
        (!q || p.nama.toLowerCase().includes(q) || p.barcode.includes(q)),
    );
  }, [produk, query, kategori]);

  const jumlahMenipis = produk.filter((p) => p.statusStok !== 'aman').length;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.green} />
        <Text style={styles.centerText}>Mengambil produk dari server…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="cloud-offline-outline" size={48} color={C.danger} />
        <Text style={styles.errorTitle}>Data produk belum bisa dimuat</Text>
        <Text style={styles.centerText}>{error}</Text>
        <Pressable style={styles.retry} onPress={reload}>
          <Text style={styles.retryText}>Coba lagi</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.list}
      data={tampil}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload} colors={[C.green]} />}
      ListHeaderComponent={
        <View>
          <View style={styles.source}>
            <View style={styles.sourceRow}>
              <View style={styles.method}>
                <Text style={styles.methodText}>GET</Text>
              </View>
              <Text style={styles.endpoint} numberOfLines={1}>
                {API_BASE_URL}/products
              </Text>
            </View>
            <Text style={styles.sourceMeta}>
              {produk.length} produk dari server
              {lastFetched ? ` · diperbarui ${lastFetched.toLocaleTimeString('id-ID')}` : ''}
              {jumlahMenipis > 0 ? ` · ${jumlahMenipis} perlu restok` : ''}
            </Text>
            <Pressable onPress={() => setShowData((v) => !v)} hitSlop={6}>
              <Text style={styles.toggle}>
                {showData ? 'Sembunyikan' : 'Lihat'} data server vs model aplikasi
              </Text>
            </Pressable>
          </View>

          {showData && rawSample && <DataComparison raw={rawSample} />}

          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={C.muted} />
            <TextInput
              style={styles.search}
              placeholder="Cari nama atau barcode"
              placeholderTextColor={C.muted}
              value={query}
              onChangeText={setQuery}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {daftarKategori.map((k) => (
              <Pressable
                key={k}
                onPress={() => setKategori(k)}
                style={[styles.chip, kategori === k && styles.chipActive]}
              >
                <Text style={[styles.chipText, kategori === k && styles.chipTextActive]}>{k}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      }
      ListEmptyComponent={
        <Text style={styles.empty}>Tidak ada produk yang cocok. Ubah kata kunci atau kategori.</Text>
      }
      renderItem={({ item }) => <ProdukRow item={item} />}
    />
  );
}

function ProdukRow({ item }: { item: ProdukModel }) {
  const s = STATUS_STYLE[item.statusStok];
  return (
    <View style={styles.row}>
      <View style={styles.icon}>
        <Ionicons name={ICON_KATEGORI[item.kategori] ?? 'cube-outline'} size={22} color={C.green} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.nama}>{item.nama}</Text>
        <Text style={styles.meta}>
          {item.kategori} · {item.barcode}
        </Text>
        <View style={[styles.badge, { backgroundColor: s.bg }]}>
          <Text style={[styles.badgeText, { color: s.fg }]}>
            {s.label} · {item.stok} {item.satuan}
          </Text>
        </View>
      </View>
      <Text style={styles.harga}>{formatRupiah(item.hargaJual)}</Text>
    </View>
  );
}

/** Untuk demo: menampilkan satu data mentah dari server dan hasil mapping-nya. */
function DataComparison({ raw }: { raw: unknown }) {
  const model = toProdukModel(raw as Parameters<typeof toProdukModel>[0]);
  return (
    <View style={styles.compare}>
      <Text style={styles.compareTitle}>1. Response JSON dari server (DTO)</Text>
      <Text style={styles.code}>{JSON.stringify(raw, null, 2)}</Text>
      <Text style={styles.compareTitle}>2. Setelah mapping (model aplikasi)</Text>
      <Text style={styles.code}>{JSON.stringify(model, null, 2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  list: { padding: 16, paddingBottom: 32 },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: C.bg },
  centerText: { marginTop: 10, color: C.muted, textAlign: 'center', fontSize: 14, lineHeight: 20 },
  errorTitle: { marginTop: 12, fontSize: 17, fontWeight: '700', color: C.ink },
  retry: { marginTop: 16, backgroundColor: C.green, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  retryText: { color: C.white, fontWeight: '700' },
  source: { backgroundColor: C.green, borderRadius: 14, padding: 14 },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  method: { backgroundColor: C.amber, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  methodText: { color: C.green, fontWeight: '800', fontSize: 12 },
  endpoint: { flex: 1, color: C.white, fontSize: 13, fontFamily: 'monospace' },
  sourceMeta: { color: '#B9CCBF', fontSize: 13, marginTop: 8 },
  toggle: { color: C.amber, fontSize: 13, fontWeight: '700', marginTop: 10 },
  compare: { marginTop: 12, backgroundColor: C.code, borderRadius: 12, padding: 12 },
  compareTitle: { color: C.amber, fontWeight: '700', fontSize: 12, marginTop: 4, marginBottom: 6 },
  code: { color: '#D7E7DC', fontFamily: 'monospace', fontSize: 11, lineHeight: 15, marginBottom: 8 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    backgroundColor: C.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
  },
  search: { flex: 1, paddingVertical: 11, fontSize: 15, color: C.ink },
  chips: { gap: 8, paddingVertical: 12 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: C.white, borderWidth: 1, borderColor: C.border },
  chipActive: { backgroundColor: C.green, borderColor: C.green },
  chipText: { color: C.ink, fontSize: 13 },
  chipTextActive: { color: C.white, fontWeight: '700' },
  empty: { textAlign: 'center', color: C.muted, marginTop: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  icon: { width: 44, height: 44, borderRadius: 10, backgroundColor: C.greenSoft, alignItems: 'center', justifyContent: 'center' },
  nama: { fontSize: 15, fontWeight: '700', color: C.ink },
  meta: { fontSize: 12, color: C.muted, marginTop: 2 },
  badge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, marginTop: 6 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  harga: { fontSize: 15, fontWeight: '800', color: C.green },
});
