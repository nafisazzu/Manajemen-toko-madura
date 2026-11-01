// =============================================
// MODUL 7 (Sprint 06) - GRAFIK PERUBAHAN NILAI SENSOR
// Grafik titik sederhana tanpa library tambahan:
// setiap sampel X/Y/Z digambar sebagai titik kecil.
// =============================================
import { View, Text } from "react-native";
import { styles, warna } from "../styles/styles";

export const WARNA_SUMBU = { x: "#DC2626", y: "#16A34A", z: "#2563EB" };

export interface Sampel {
  x: number;
  y: number;
  z: number;
}

interface GrafikSensorProps {
  riwayat: Sampel[]; // nilai dalam m/s²
  lebar: number;
  tinggi?: number;
  batas?: number; // nilai maksimum sumbu Y grafik (m/s²)
}

export default function GrafikSensor({ riwayat, lebar, tinggi = 160, batas = 20 }: GrafikSensorProps) {
  const jarak = riwayat.length > 1 ? lebar / (riwayat.length - 1) : 0;
  const keY = (nilai: number) => {
    const n = Math.max(-batas, Math.min(batas, nilai)); // potong nilai ekstrem
    return tinggi / 2 - (n / batas) * (tinggi / 2);
  };

  return (
    <View accessible accessibilityLabel="Grafik perubahan nilai accelerometer sumbu X, Y, dan Z">
      <View style={[styles.grafik, { width: lebar, height: tinggi }]}>
        {/* garis nol & garis bantu */}
        {[-batas / 2, 0, batas / 2].map((g) => (
          <View key={g} style={[styles.garisBantu, { top: keY(g), opacity: g === 0 ? 0.6 : 0.25 }]} />
        ))}
        {riwayat.map((s, i) =>
          (["x", "y", "z"] as const).map((sumbu) => (
            <View
              key={`${i}-${sumbu}`}
              style={[
                styles.titikGrafik,
                { left: i * jarak - 2, top: keY(s[sumbu]) - 2, backgroundColor: WARNA_SUMBU[sumbu] },
              ]}
            />
          ))
        )}
        <Text style={[styles.labelGrafik, { top: 2 }]}>{batas}</Text>
        <Text style={[styles.labelGrafik, { top: tinggi / 2 - 8 }]}>0</Text>
        <Text style={[styles.labelGrafik, { bottom: 2 }]}>-{batas}</Text>
      </View>
      <View style={[styles.headerKiri, { justifyContent: "center", marginTop: 8, gap: 16 }]}>
        {(["x", "y", "z"] as const).map((sumbu) => (
          <View key={sumbu} style={styles.headerKiri}>
            <View style={[styles.titikGrafik, { position: "relative", backgroundColor: WARNA_SUMBU[sumbu], width: 10, height: 10, borderRadius: 5 }]} />
            <Text style={{ marginLeft: 4, color: warna.teks, fontWeight: "600" }}>{sumbu.toUpperCase()}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
