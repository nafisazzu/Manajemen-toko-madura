// =============================================
// TAB PROFIL - akun, pengaturan (normal data), keamanan, logout
// =============================================
import { View, Text, ScrollView, Pressable, Switch, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles, warna } from "../../styles/styles";
import { useResponsive } from "../../hooks/useResponsive";
import { useAuth } from "../../context/AuthContext";
import { usePengaturan } from "../../context/PengaturanContext";
import { bacaJwt } from "../../utils/jwt";
import { formatTanggal } from "../../utils/hitung";
import { ModeSimulasi } from "../../services/http";
import { API_URL } from "../../config";

// Modul 6: pilihan kondisi yang bisa disimulasikan saat demo
const OPSI_SIMULASI: { mode: ModeSimulasi; label: string }[] = [
  { mode: "normal", label: "Normal" },
  { mode: "lambat", label: "Server lambat (timeout)" },
  { mode: "error500", label: "500 Server Error" },
  { mode: "error503", label: "503 Unavailable" },
  { mode: "error404", label: "404 Not Found" },
  { mode: "kosong", label: "Data kosong" },
  { mode: "offline", label: "Offline" },
];

export default function Profil() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { lebarKonten, ukuran, isLandscape, width } = useResponsive();
  const { user, token, logout } = useAuth();
  const jwt = token ? bacaJwt(token) : null;
  const exp = jwt ? new Date(Number(jwt.payload.exp) * 1000) : null;
  const { pengaturan, ubahPengaturan } = usePengaturan();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16, paddingBottom: 16 }]}>
        <Text style={[styles.judulApp, { marginLeft: 0 }, styles.kontenTengah, { maxWidth: lebarKonten }]} accessibilityRole="header">
          Profil
        </Text>
      </View>

      <ScrollView contentContainerStyle={[styles.isi, styles.kontenTengah, { maxWidth: lebarKonten }]}>
        <View
          style={[styles.kartuDetail, { alignItems: "center" }]}
          accessible
          accessibilityLabel={`Masuk sebagai ${user?.nama}, ${user?.email}`}
        >
          <Ionicons name="person-circle" size={64} color={warna.utama} />
          <Text style={[styles.heroJudul, { marginTop: 8 }]}>{user?.nama}</Text>
          <Text style={styles.infoProfil}>{user?.email}</Text>
        </View>

        {/* ---------- Pengaturan = NORMAL DATA (AsyncStorage) ---------- */}
        <Text style={styles.judulBagian} accessibilityRole="header">
          Pengaturan
        </Text>
        <View style={styles.kartuDetail}>
          <Text style={[styles.label, { marginTop: 0 }]}>Nama toko</Text>
          <TextInput
            style={styles.input}
            value={pengaturan.namaToko}
            onChangeText={(namaToko) => ubahPengaturan({ namaToko })}
            accessibilityLabel="Nama toko"
          />
          <View style={[styles.barisDetail, { borderBottomWidth: 0, alignItems: "center", marginTop: 8 }]}>
            <Text style={[styles.nilaiDetail, { marginLeft: 0, textAlign: "left" }]}>Tampilkan catatan transaksi</Text>
            <Switch
              value={pengaturan.tampilkanCatatan}
              onValueChange={(tampilkanCatatan) => ubahPengaturan({ tampilkanCatatan })}
              trackColor={{ true: warna.utama }}
              accessibilityLabel="Tampilkan catatan transaksi"
            />
          </View>
          <Text style={styles.detail}>Disimpan di AsyncStorage (data biasa, tidak rahasia).</Text>
        </View>

        {/* ---------- Modul 6: Mode uji API ---------- */}
        <Text style={styles.judulBagian} accessibilityRole="header">
          Mode Uji API
        </Text>
        <View style={styles.kartuDetail}>
          <Text style={styles.detail}>
            Pilih kondisi, lalu buka tab Beranda/Riwayat atau tarik ke bawah untuk memuat ulang.
          </Text>
          <View style={[styles.filterBaris, { flexWrap: "wrap", gap: 8, marginTop: 8, marginBottom: 0 }]}>
            {OPSI_SIMULASI.map((o) => {
              const aktif = pengaturan.modeSimulasi === o.mode;
              return (
                <Pressable
                  key={o.mode}
                  style={[styles.chip, { marginRight: 0 }, aktif && styles.chipAktif]}
                  onPress={() => ubahPengaturan({ modeSimulasi: o.mode })}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: aktif }}
                >
                  <Text style={[styles.teksChip, aktif && styles.teksChipAktif]}>{o.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={[styles.detail, { marginTop: 8 }]}>API: {API_URL}</Text>
        </View>

        {/* ---------- Keamanan ---------- */}
        <Text style={styles.judulBagian} accessibilityRole="header">
          Keamanan
        </Text>

        {/* Modul 5: isi JWT (header.payload.signature) untuk penjelasan saat demo */}
        {jwt && exp && (
          <View style={[styles.kartuDetail, { marginBottom: 12 }]}>
            <Text style={[styles.label, { marginTop: 0 }]}>Access token (JWT)</Text>
            <Text style={styles.kodeTeks} numberOfLines={2}>
              {token}
            </Text>
            <Text style={styles.label}>Header</Text>
            <Text style={styles.kodeTeks}>{JSON.stringify(jwt.header)}</Text>
            <Text style={styles.label}>Payload (claims)</Text>
            <Text style={styles.kodeTeks}>{JSON.stringify(jwt.payload, null, 1)}</Text>
            <Text style={styles.detail}>
              Berlaku sampai {formatTanggal(exp.toISOString().slice(0, 10))}{" "}
              {exp.toTimeString().slice(0, 5)} · tersimpan di SecureStore · dikirim sebagai Authorization: Bearer
            </Text>
          </View>
        )}
        <Pressable
          style={[styles.tombolAksi, styles.tombolAksiGaris]}
          onPress={() => router.push("/uji-keamanan")}
          accessibilityRole="button"
          accessibilityHint="Membuka halaman pengujian keamanan"
        >
          <Ionicons name="shield-checkmark" size={18} color={warna.utama} />
          <Text style={[styles.teksAksi, styles.teksAksiGaris]}>Uji Keamanan</Text>
        </Pressable>

        <Pressable
          style={[styles.tombolAksi, { backgroundColor: warna.merah, marginTop: 12 }]}
          onPress={logout}
          accessibilityRole="button"
          accessibilityLabel="Keluar"
          accessibilityHint="Menghapus sesi login dari perangkat dan kembali ke halaman masuk"
        >
          <Ionicons name="log-out-outline" size={18} color={warna.putih} />
          <Text style={styles.teksAksi}>Keluar</Text>
        </Pressable>

        {/* Info layar: membantu saat menguji tampilan di berbagai perangkat (Modul 2) */}
        <Text style={[styles.detail, { marginTop: 24, textAlign: "center" }]}>
          Layar {Math.round(width)} dp · {ukuran} · {isLandscape ? "landscape" : "portrait"}
        </Text>
      </ScrollView>
    </View>
  );
}
