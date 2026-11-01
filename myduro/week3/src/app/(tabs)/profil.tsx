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

export default function Profil() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { lebarKonten, ukuran, isLandscape, width } = useResponsive();
  const { user, logout } = useAuth();
  const { pengaturan, ubahPengaturan } = usePengaturan();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16, paddingBottom: 16 }]}>
        <Text style={[styles.judulApp, styles.kontenTengah, { maxWidth: lebarKonten }]} accessibilityRole="header">
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
            <Text style={styles.nilaiDetail}>Tampilkan catatan transaksi</Text>
            <Switch
              value={pengaturan.tampilkanCatatan}
              onValueChange={(tampilkanCatatan) => ubahPengaturan({ tampilkanCatatan })}
              trackColor={{ true: warna.utama }}
              accessibilityLabel="Tampilkan catatan transaksi"
            />
          </View>
          <Text style={styles.detail}>Disimpan di AsyncStorage (data biasa, tidak rahasia).</Text>
        </View>

        {/* ---------- Keamanan ---------- */}
        <Text style={styles.judulBagian} accessibilityRole="header">
          Keamanan
        </Text>
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
