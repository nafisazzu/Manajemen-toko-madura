// =============================================
// KOMPONEN CUSTOM: satu kartu transaksi
// Modul 2: + accessibility & style dari parent (responsive grid)
// =============================================
import { View, Text, Pressable, StyleProp, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Transaksi } from "../types/transaksi";
import { styles, warna } from "../styles/styles";
import { hitungTotal, formatRupiah, formatTanggal } from "../utils/hitung";

// Props: data yang dikirim dari luar ke komponen ini
interface TransaksiCardProps {
  data: Transaksi;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function TransaksiCard({ data, onPress, style }: TransaksiCardProps) {
  // CONDITION: tentukan warna, ikon, dan tanda berdasarkan jenis
  const isPenjualan = data.jenis === "penjualan";
  const warnaJenis = isPenjualan ? warna.hijau : warna.merah;
  const ikon = isPenjualan ? "arrow-down-circle" : "arrow-up-circle";
  const tanda = isPenjualan ? "+" : "-";

  // Kalimat lengkap untuk screen reader (informasi tidak hanya lewat warna)
  const labelAksesibel =
    `${isPenjualan ? "Penjualan, uang masuk" : "Pembelian, uang keluar"}. ` +
    `${data.namaBarang}, ${data.jumlah} ${data.satuan}, total ${formatRupiah(hitungTotal(data))}. ` +
    `Tanggal ${formatTanggal(data.tanggal)}.`;

  return (
    <Pressable
      style={({ pressed }) => [styles.kartu, style, pressed && { opacity: 0.7 }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={labelAksesibel}
      accessibilityHint="Membuka detail transaksi"
    >
      {/* INLINE STYLING: warna latar ikon berubah sesuai jenis transaksi */}
      <View
        style={[styles.ikonBulat, { backgroundColor: isPenjualan ? "#DCFCE7" : "#FEE2E2" }]}
      >
        <Ionicons name={ikon} size={26} color={warnaJenis} />
      </View>

      <View style={styles.kartuTengah}>
        <Text style={styles.namaBarang} numberOfLines={2}>
          {data.namaBarang}
        </Text>
        <Text style={styles.detail}>
          {data.jumlah} {data.satuan} × {formatRupiah(data.hargaSatuan)}
        </Text>
        <Text style={styles.detail}>
          {formatTanggal(data.tanggal)} · {isPenjualan ? "Masuk" : "Keluar"}
        </Text>

        {/* Catatan hanya tampil kalau ada (properti opsional) */}
        {data.catatan ? <Text style={styles.catatan}>“{data.catatan}”</Text> : null}
      </View>

      <Text style={[styles.nominal, { color: warnaJenis }]}>
        {tanda}
        {formatRupiah(hitungTotal(data))}
      </Text>
    </Pressable>
  );
}
