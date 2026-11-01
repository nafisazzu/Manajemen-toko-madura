// =============================================
// TAB RIWAYAT - daftar semua transaksi + filter
// (dipindah dari index.tsx Modul 1; Modul 2: responsif + aksesibel)
// =============================================
import { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles, warna } from "../../styles/styles";
import { JenisTransaksi } from "../../types/transaksi";
import { useTransaksi } from "../../context/TransaksiContext";
import { useResponsive } from "../../hooks/useResponsive";
import TransaksiCard from "../../components/TransaksiCard";
import StatusTampilan from "../../components/StatusTampilan";

type Filter = "semua" | JenisTransaksi;
const OPSI_FILTER: Filter[] = ["semua", "penjualan", "pembelian"];

export default function Riwayat() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { daftar, status, loading, error, jumlahPercobaan, muatUlang } = useTransaksi();
  const { kolom, lebarKonten } = useResponsive();
  const [filter, setFilter] = useState<Filter>("semua");

  // Dihitung ulang hanya jika daftar atau filter berubah
  const daftarTampil = useMemo(
    () => (filter === "semua" ? daftar : daftar.filter((trx) => trx.jenis === filter)),
    [daftar, filter]
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16, paddingBottom: 16 }]}>
        <View style={[styles.kontenTengah, { maxWidth: lebarKonten }]}>
          <Text style={[styles.judulApp, { marginLeft: 0 }]} accessibilityRole="header">
            Riwayat Transaksi
          </Text>
          <Text style={styles.subJudul}>
            {status === "success" || status === "empty" ? `${daftar.length} transaksi tercatat` : status === "error" ? "Data belum dapat dimuat" : "Memuat..."}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.isi, styles.kontenTengah, { maxWidth: lebarKonten }]}
        // Tarik ke bawah untuk mengambil ulang data dari API
        refreshControl={
          <RefreshControl refreshing={loading && daftar.length > 0} onRefresh={muatUlang} colors={[warna.utama]} />
        }
      >

        <View style={styles.filterBaris} accessibilityRole="tablist">
          {OPSI_FILTER.map((opsi) => (
            <Pressable
              key={opsi}
              style={[styles.chip, filter === opsi && styles.chipAktif]}
              onPress={() => setFilter(opsi)}
              accessibilityRole="tab"
              accessibilityLabel={`Filter ${opsi}`}
              // accessibilityState: screen reader tahu chip mana yang sedang aktif
              accessibilityState={{ selected: filter === opsi }}
            >
              <Text style={[styles.teksChip, filter === opsi && styles.teksChipAktif]}>{opsi}</Text>
            </Pressable>
          ))}
        </View>

        {/* MODUL 6: setiap kondisi request punya tampilan sendiri */}
        {status === "loading" && daftar.length === 0 ? (
          <StatusTampilan jenis="loading" jumlahPercobaan={jumlahPercobaan} />
        ) : status === "error" ? (
          // Request gagal -> data TIDAK ditampilkan, diganti pesan + tombol coba lagi
          <StatusTampilan jenis="error" error={error} onCobaLagi={muatUlang} />
        ) : daftarTampil.length === 0 ? (
          <StatusTampilan jenis="empty" onCobaLagi={muatUlang} />
        ) : (
          <View style={styles.grid}>
            {daftarTampil.map((trx) => (
              <TransaksiCard
                key={trx.id}
                data={trx}
                style={{ width: kolom === 2 ? "49%" : "100%" }}
                onPress={() => router.push({ pathname: "/detail/[id]", params: { id: trx.id } })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
