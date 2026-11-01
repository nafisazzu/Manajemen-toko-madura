// =============================================
// TAB PROFIL - informasi toko
// =============================================
import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles, warna } from "../../styles/styles";
import { useResponsive } from "../../hooks/useResponsive";

export default function Profil() {
  const insets = useSafeAreaInsets();
  const { lebarKonten, ukuran, isLandscape, width } = useResponsive();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16, paddingBottom: 16 }]}>
        <Text style={[styles.judulApp, styles.kontenTengah, { maxWidth: lebarKonten }]} accessibilityRole="header">
          Profil
        </Text>
      </View>

      <ScrollView contentContainerStyle={[styles.isi, styles.kontenTengah, { maxWidth: lebarKonten }]}>
        <View style={[styles.kartuDetail, { alignItems: "center" }]} accessible accessibilityLabel="Toko Madura Berkah, Malang">
          <Ionicons name="storefront" size={56} color={warna.utama} />
          <Text style={[styles.heroJudul, { marginTop: 8 }]}>Toko Madura Berkah</Text>
          <Text style={styles.infoProfil}>Malang, Jawa Timur</Text>
        </View>

        {/* Info layar: membantu saat menguji tampilan di berbagai perangkat (Task 02) */}
        <View style={[styles.kartuDetail, { marginTop: 12 }]}>
          <Text style={styles.label}>Info layar (uji responsif)</Text>
          <Text style={styles.infoProfil}>
            Lebar {Math.round(width)} dp · kategori {ukuran} · {isLandscape ? "landscape" : "portrait"}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
