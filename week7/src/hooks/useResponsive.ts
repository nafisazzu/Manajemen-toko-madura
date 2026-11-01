// =============================================
// MODUL 2 (Sprint 01) - RESPONSIVE LAYOUT
// Hook kecil untuk membaca ukuran & orientasi layar.
// useWindowDimensions otomatis memicu render ulang saat
// layar diputar (portrait <-> landscape) atau ukuran berubah.
// =============================================
import { useWindowDimensions } from "react-native";

export type UkuranLayar = "kecil" | "normal" | "lebar";

export function useResponsive() {
  const { width, height, fontScale } = useWindowDimensions();

  const isLandscape = width > height;

  // Breakpoint sederhana (dalam dp):
  //  < 360  -> HP kecil (± 4 inch)
  //  < 600  -> HP normal (± 6 inch)
  //  >= 600 -> tablet / HP landscape
  const ukuran: UkuranLayar = width < 360 ? "kecil" : width < 600 ? "normal" : "lebar";

  // Jumlah kolom daftar transaksi: 1 di HP, 2 di layar lebar
  const kolom = ukuran === "lebar" ? 2 : 1;

  // Lebar konten dibatasi agar teks tidak terlalu panjang di tablet
  const lebarKonten = Math.min(width, 900);

  // Ukuran gambar hero menyesuaikan layar (rasio 16:9)
  const tinggiHero = Math.round((Math.min(lebarKonten, 600) - 32) * (9 / 16));

  return { width, height, fontScale, isLandscape, ukuran, kolom, lebarKonten, tinggiHero };
}
