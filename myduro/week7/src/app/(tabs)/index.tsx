// =============================================
// MODUL 2 (Sprint 01) - HALAMAN BERANDA MyDuro
// Minimal: Header, Judul, Informasi utama, Image/visual,
// Button/action, Content section (+ navigasi bawah dari Tabs)
// =============================================
import { useMemo } from "react";
import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { hitungRingkasan } from "../../utils/hitung";
import { styles, warna } from "../../styles/styles";
import { useTransaksi } from "../../context/TransaksiContext";
import { useResponsive } from "../../hooks/useResponsive";
import { useAuth } from "../../context/AuthContext";
import { usePengaturan } from "../../context/PengaturanContext";
import TransaksiCard from "../../components/TransaksiCard";
import KotakRingkasan from "../../components/KotakRingkasan";
import StatusTampilan from "../../components/StatusTampilan";

export default function Beranda() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { daftar, status, error, jumlahPercobaan, muatUlang } = useTransaksi();
  const { user } = useAuth();
  const { pengaturan } = usePengaturan();
  const { ukuran, kolom, lebarKonten, tinggiHero, isLandscape } = useResponsive();

  const ringkasan = useMemo(() => hitungRingkasan(daftar), [daftar]);
  const terbaru = daftar.slice(0, kolom === 2 ? 4 : 3);

  // Layar lebar: 3 kotak sejajar. HP: 2 kotak + selisih selebar layar.
  const lebarKotak = ukuran === "lebar" ? "30%" : "45%";
  // Landscape di HP: gambar hero di samping teks agar tidak memakan tinggi layar
  const heroSamping = isLandscape && ukuran === "lebar";

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      {/* ---------- HEADER ---------- */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={[styles.kontenTengah, { maxWidth: lebarKonten }]}>
          <View style={styles.headerBaris}>
            <View style={styles.headerKiri}>
              <Ionicons name="storefront" size={28} color={warna.putih} accessibilityElementsHidden />
              {/* accessibilityRole="header": screen reader mengumumkan ini sebagai judul */}
              <Text style={styles.judulApp} accessibilityRole="header">
                MyDuro
              </Text>
            </View>
            <Pressable
              style={styles.tombolTambah}
              onPress={() => router.push("/tambah")}
              accessibilityRole="button"
              accessibilityLabel="Tambah transaksi"
              accessibilityHint="Membuka formulir untuk mencatat penjualan atau pembelian baru"
            >
              <Ionicons name="add" size={18} color={warna.utama} />
              <Text style={styles.teksTombol}>Tambah</Text>
            </Pressable>
          </View>
          <Text style={styles.sapaan}>
            Halo, {user?.nama} 👋 · {pengaturan.namaToko}
          </Text>
        </View>
      </View>

      <View style={[styles.isi, styles.kontenTengah, { maxWidth: lebarKonten }]}>
        {/* ---------- HERO: judul + informasi utama + gambar + aksi ---------- */}
        <View style={[styles.hero, heroSamping && { flexDirection: "row" }]}>
          <Image
            source={require("../../../assets/images/hero-toko.jpg")}
            style={[
              styles.heroGambar,
              heroSamping ? { width: "45%", height: "100%", minHeight: 180 } : { height: tinggiHero },
            ]}
            resizeMode="cover"
            accessible
            accessibilityRole="image"
            accessibilityLabel="Ilustrasi Toko Madura dengan rak barang dan buku catatan transaksi"
          />
          <View style={[styles.heroIsi, heroSamping && { flex: 1 }]}>
            <Text style={styles.heroJudul} accessibilityRole="header">
              Catat Setiap Transaksi Toko
            </Text>
            <Text style={styles.heroTeks}>
              Pantau uang masuk dari penjualan dan uang keluar untuk belanja stok. Semua riwayat
              tersimpan rapi di satu aplikasi.
            </Text>
            <View style={styles.heroAksi}>
              <Pressable
                style={styles.tombolAksi}
                onPress={() => router.push("/tambah")}
                accessibilityRole="button"
                accessibilityLabel="Catat transaksi baru"
                accessibilityHint="Membuka formulir transaksi"
              >
                <Ionicons name="create-outline" size={18} color={warna.putih} />
                <Text style={styles.teksAksi}>Catat Transaksi</Text>
              </Pressable>
              <Pressable
                style={[styles.tombolAksi, styles.tombolAksiGaris]}
                onPress={() => router.push("/riwayat")}
                accessibilityRole="button"
                accessibilityLabel="Lihat riwayat transaksi"
              >
                <Ionicons name="list" size={18} color={warna.utama} />
                <Text style={[styles.teksAksi, styles.teksAksiGaris]}>Lihat Riwayat</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* MODUL 6: ringkasan & daftar hanya tampil jika data berhasil dimuat */}
        {status === "loading" || status === "idle" ? (
          <StatusTampilan jenis="loading" jumlahPercobaan={jumlahPercobaan} />
        ) : status === "error" ? (
          <StatusTampilan jenis="error" error={error} onCobaLagi={muatUlang} />
        ) : (
          <>
          {/* ---------- RINGKASAN (layout responsif) ---------- */}
          <View style={styles.ringkasanGrid}>
            <KotakRingkasan
              label="Penjualan (uang masuk)"
              nilai={ringkasan.totalPenjualan}
              ikon="trending-up"
              warnaNilai={warna.hijau}
              lebar={lebarKotak}
            />
            <KotakRingkasan
              label="Pembelian (uang keluar)"
              nilai={ringkasan.totalPembelian}
              ikon="trending-down"
              warnaNilai={warna.merah}
              lebar={lebarKotak}
            />
            <KotakRingkasan
              label={ringkasan.selisih >= 0 ? "Selisih (untung)" : "Selisih (rugi)"}
              nilai={ringkasan.selisih}
              ikon="wallet"
              warnaNilai={ringkasan.selisih >= 0 ? warna.hijau : warna.merah}
              lebar={ukuran === "lebar" ? "30%" : "100%"}
            />
          </View>

          {/* ---------- CONTENT SECTION: transaksi terbaru ---------- */}
          <View style={styles.bagianBaris}>
            <Text style={styles.judulBagianPolos} accessibilityRole="header">
              Transaksi Terbaru
            </Text>
            <Pressable
              onPress={() => router.push("/riwayat")}
              accessibilityRole="link"
              accessibilityLabel="Lihat semua transaksi"
            >
              <Text style={styles.linkTeks}>Lihat Semua</Text>
            </Pressable>
          </View>

          {terbaru.length === 0 ? (
            <Text style={styles.kosong}>Belum ada transaksi.</Text>
          ) : (
            <View style={styles.grid}>
              {terbaru.map((trx) => (
                <TransaksiCard
                  key={trx.id}
                  data={trx}
                  style={{ width: kolom === 2 ? "49%" : "100%" }}
                  onPress={() => router.push({ pathname: "/detail/[id]", params: { id: trx.id } })}
                />
              ))}
            </View>
          )}
          </>
        )}
      </View>
    </ScrollView>
  );
}
