// =============================================
// MODUL 6 (Sprint 05) - API UI STATES
// "UI tidak boleh hanya memiliki kondisi 'data ada'."
// Satu komponen untuk menampilkan: loading, error,
// offline, timeout, dan empty - lengkap dengan tombol Coba Lagi.
// =============================================
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles, warna } from "../styles/styles";
import { InfoError } from "../context/TransaksiContext";

type NamaIkon = keyof typeof Ionicons.glyphMap;

interface StatusTampilanProps {
  jenis: "loading" | "error" | "empty";
  error?: InfoError | null;
  jumlahPercobaan?: number;
  onCobaLagi?: () => void;
}

export default function StatusTampilan({ jenis, error, jumlahPercobaan = 0, onCobaLagi }: StatusTampilanProps) {
  if (jenis === "loading") {
    return (
      <View style={styles.kotakStatus} accessible accessibilityLabel="Memuat data, mohon tunggu" accessibilityLiveRegion="polite">
        <ActivityIndicator size="large" color={warna.utama} />
        <Text style={styles.judulStatus}>{jumlahPercobaan > 1 ? "Mencoba lagi..." : "Memuat data..."}</Text>
        <Text style={styles.teksStatus}>Mohon tunggu sebentar.</Text>
      </View>
    );
  }

  let ikon: NamaIkon = "document-text-outline";
  let judul = "Belum ada transaksi";
  let pesan = "Belum ada data transaksi yang tersedia saat ini.";
  let warnaIkon = warna.teksAbu;

  if (jenis === "error" && error) {
    judul = error.judul;
    pesan = error.pesan;
    warnaIkon = warna.merah;
    ikon =
      error.jenis === "OFFLINE" ? "cloud-offline-outline" :
      error.jenis === "TIMEOUT" ? "time-outline" :
      error.jenis === "NETWORK" ? "server-outline" : "alert-circle-outline";
  }

  return (
    <View style={styles.kotakStatus} accessible={false}>
      <Ionicons name={ikon} size={56} color={warnaIkon} />
      <Text style={styles.judulStatus} accessibilityRole="alert" accessibilityLiveRegion="polite">
        {judul}
      </Text>
      <Text style={styles.teksStatus}>{pesan}</Text>
      {onCobaLagi && (
        <Pressable
          style={[styles.tombolAksi, { marginTop: 16, backgroundColor: jenis === "error" ? warna.merah : warna.utama }]}
          onPress={onCobaLagi}
          accessibilityRole="button"
          accessibilityLabel="Coba lagi"
          accessibilityHint="Mengirim ulang permintaan ke server"
        >
          <Ionicons name="refresh" size={18} color={warna.putih} />
          <Text style={styles.teksAksi}>{jenis === "empty" ? "Muat Ulang" : "Coba Lagi"}</Text>
        </Pressable>
      )}
    </View>
  );
}
