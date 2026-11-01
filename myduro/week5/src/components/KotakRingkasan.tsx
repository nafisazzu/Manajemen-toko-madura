// =============================================
// MODUL 2 (Sprint 01) - komponen ringkasan yang reusable
// =============================================
import { View, Text, DimensionValue } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles/styles";
import { formatRupiah } from "../utils/hitung";

interface KotakRingkasanProps {
  label: string;
  nilai: number;
  ikon: keyof typeof Ionicons.glyphMap;
  warnaNilai: string;
  lebar: DimensionValue; // dikirim dari parent agar layout bisa responsif
}

export default function KotakRingkasan({ label, nilai, ikon, warnaNilai, lebar }: KotakRingkasanProps) {
  return (
    <View
      style={[styles.kotakRingkasan, { flexBasis: lebar, flexGrow: 1 }]}
      // accessible: screen reader membaca kotak ini sebagai satu kesatuan
      accessible
      accessibilityLabel={`${label}: ${formatRupiah(nilai)}`}
    >
      <Ionicons name={ikon} size={20} color={warnaNilai} />
      <Text style={styles.labelRingkasan}>{label}</Text>
      <Text style={[styles.nilaiRingkasan, { color: warnaNilai }]} numberOfLines={1} adjustsFontSizeToFit>
        {formatRupiah(nilai)}
      </Text>
    </View>
  );
}
