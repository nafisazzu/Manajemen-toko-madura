// =============================================
// HALAMAN UJI KEAMANAN (Security Test Matrix)
// =============================================
import { useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { jalankanUjiKeamanan, HasilUji } from "../utils/ujiKeamanan";
import { useResponsive } from "../hooks/useResponsive";
import { styles, warna } from "../styles/styles";

export default function UjiKeamanan() {
  const { lebarKonten } = useResponsive();
  const [hasil, setHasil] = useState<HasilUji[]>([]);
  const [proses, setProses] = useState(false);

  const jalankan = async () => {
    setProses(true);
    setHasil(await jalankanUjiKeamanan());
    setProses(false);
  };

  const jumlahLulus = hasil.filter((h) => h.lulus).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.isi, styles.kontenTengah, { maxWidth: lebarKonten }]}>
      <Text style={styles.heroTeks}>
        Menjalankan skenario pengujian keamanan dan membandingkan hasil aktual dengan hasil yang
        diharapkan. Log juga muncul di console Expo.
      </Text>
      {Platform.OS === "web" && (
        <Text style={[styles.pesanError, { marginTop: 8 }]}>
          Mode web: SecureStore diganti localStorage, jadi uji data sensitif memang akan FAIL.
          Jalankan di HP lewat Expo Go.
        </Text>
      )}

      <Pressable
        style={[styles.tombolUtama, proses && { opacity: 0.6 }]}
        onPress={jalankan}
        disabled={proses}
        accessibilityRole="button"
        accessibilityLabel="Jalankan uji keamanan"
      >
        {proses ? <ActivityIndicator color={warna.putih} /> : <Text style={styles.teksTombolUtama}>Jalankan Uji</Text>}
      </Pressable>

      {hasil.length > 0 && (
        <Text style={[styles.judulBagian, { marginBottom: 4 }]} accessibilityLiveRegion="polite">
          Hasil: {jumlahLulus}/{hasil.length} lulus
        </Text>
      )}

      {hasil.map((h) => (
        <View
          key={h.no}
          style={[styles.kartuDetail, { marginTop: 8 }]}
          accessible
          accessibilityLabel={`Uji ${h.no}, ${h.skenario}. Diharapkan ${h.diharapkan}, hasil ${h.aktual}. ${h.lulus ? "Lulus" : "Gagal"}`}
        >
          <View style={styles.headerBaris}>
            <Text style={styles.namaBarang}>
              {h.no}. {h.skenario}
            </Text>
            <View style={styles.headerKiri}>
              <Ionicons name={h.lulus ? "checkmark-circle" : "close-circle"} size={20} color={h.lulus ? warna.hijau : warna.merah} />
              {/* Status juga ditulis dengan teks, tidak hanya warna */}
              <Text style={{ marginLeft: 4, fontWeight: "bold", color: h.lulus ? warna.hijau : warna.merah }}>
                {h.lulus ? "PASS" : "FAIL"}
              </Text>
            </View>
          </View>
          <Text style={styles.detail}>{h.langkah}</Text>
          <Text style={styles.detail}>
            Diharapkan: {h.diharapkan} · Aktual: {h.aktual}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
