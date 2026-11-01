// =============================================
// EXTERNAL STYLING (Modul 1 - 3.2)
// =============================================
import { StyleSheet } from "react-native";

// Warna utama MyDuro dikumpulkan di satu tempat
export const warna = {
  utama: "#0F766E", // hijau toska
  latar: "#F1F5F9",
  putih: "#FFFFFF",
  teks: "#0F172A",
  teksAbu: "#475569", // dipergelap agar kontras >= 4.5:1 di latar terang
  hijau: "#16A34A", // penjualan (uang masuk)
  merah: "#DC2626", // pembelian (uang keluar)
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: warna.latar,
  },
  isi: {
    padding: 16,
    paddingBottom: 32,
  },

  // ---------- Header ----------
  header: {
    backgroundColor: warna.utama,
    paddingTop: 16, // + inset atas (notch) ditambahkan di komponen
    paddingBottom: 24,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerBaris: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  judulApp: {
    fontSize: 26,
    fontWeight: "bold",
    color: warna.putih,
    marginLeft: 8,
  },
  subJudul: {
    fontSize: 14,
    color: "#CCFBF1",
    marginTop: 4,
  },

  // ---------- Kartu ringkasan ----------
  ringkasanBaris: {
    flexDirection: "row",
    marginTop: 16,
  },
  kotakRingkasan: {
    flex: 1,
    backgroundColor: warna.putih,
    borderRadius: 16,
    padding: 12,
    elevation: 3,
    shadowColor: "#000",
  },
  labelRingkasan: {
    fontSize: 12,
    color: warna.teksAbu,
    marginTop: 4,
  },
  nilaiRingkasan: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 2,
  },
  kotakSelisih: {
    backgroundColor: warna.putih,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    elevation: 3,
    shadowColor: "#000",
  },

  // ---------- Daftar transaksi ----------
  judulBagian: {
    fontSize: 18,
    fontWeight: "bold",
    color: warna.teks,
    marginTop: 24,
    marginBottom: 12,
  },
  kartu: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: warna.putih,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
  },
  ikonBulat: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  kartuTengah: {
    flex: 1,
    marginLeft: 12,
  },
  namaBarang: {
    fontSize: 15,
    fontWeight: "bold",
    color: warna.teks,
  },
  detail: {
    fontSize: 12,
    color: warna.teksAbu,
    marginTop: 2,
  },
  catatan: {
    fontSize: 12,
    color: warna.teksAbu,
    fontStyle: "italic",
    marginTop: 2,
  },
  nominal: {
    fontSize: 15,
    fontWeight: "bold",
  },
    // ---------- Modul 2: tombol, filter, form, detail ----------
  headerKiri: { flexDirection: "row", alignItems: "center" },
  tombolTambah: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: warna.putih,
    minHeight: 48, // minimum touch target (Modul 2)
    paddingHorizontal: 14,
    borderRadius: 24,
  },
  teksTombol: { color: warna.utama, fontWeight: "bold", marginLeft: 4 },
  tengah: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: warna.latar,
    padding: 16,
  },
  filterBaris: { flexDirection: "row", marginBottom: 12 },
  chip: {
    minHeight: 44, // cukup besar untuk disentuh
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: warna.putih,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  chipAktif: { backgroundColor: warna.utama, borderColor: warna.utama },
  teksChip: { fontSize: 13, color: warna.teks },
  teksChipAktif: { color: warna.putih, fontWeight: "bold" },
  kosong: { textAlign: "center", color: warna.teksAbu, marginTop: 16 },
  label: { fontSize: 13, fontWeight: "bold", color: warna.teks, marginTop: 12, marginBottom: 4 },
  input: {
    backgroundColor: warna.putih,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: warna.teks,
  },
  pesanError: { color: warna.merah, marginTop: 12 },
  totalPreview: { fontSize: 16, fontWeight: "bold", color: warna.utama, marginTop: 16 },
  tombolUtama: {
    minHeight: 48,
    backgroundColor: warna.utama,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    marginTop: 16,
  },
  teksTombolUtama: { color: warna.putih, fontWeight: "bold", fontSize: 15 },
  tombolSekunder: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: warna.utama,
  },
  teksTombolSekunder: { color: warna.utama, fontWeight: "bold", fontSize: 15 },
  kartuDetail: {
    backgroundColor: warna.putih,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
  },
  barisDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  labelDetail: { color: warna.teksAbu, fontSize: 13 },
  nilaiDetail: {
    color: warna.teks,
    fontWeight: "600",
    fontSize: 14,
    flexShrink: 1,
    textAlign: "right",
    marginLeft: 12,
  },

  // ---------- Modul 2 (Sprint 01): Beranda, responsif & aksesibel ----------
  kontenTengah: { width: "100%", alignSelf: "center" },
  sapaan: { fontSize: 14, color: "#CCFBF1" },
  hero: {
    backgroundColor: warna.putih,
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 16,
    elevation: 3,
    shadowColor: "#000",
  },
  heroGambar: { width: "100%" },
  heroIsi: { padding: 16 },
  heroJudul: { fontSize: 22, fontWeight: "bold", color: warna.teks },
  heroTeks: { fontSize: 14, color: warna.teksAbu, marginTop: 6, lineHeight: 20 },
  heroAksi: { flexDirection: "row", flexWrap: "wrap", marginTop: 12, gap: 8 },
  tombolAksi: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48, // minimum touch target
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: warna.utama,
  },
  tombolAksiGaris: { backgroundColor: warna.putih, borderWidth: 1, borderColor: warna.utama },
  teksAksi: { color: warna.putih, fontWeight: "bold", fontSize: 15, marginLeft: 6 },
  teksAksiGaris: { color: warna.utama },
  ringkasanGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 16 },
  bagianBaris: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 12,
  },
  judulBagianPolos: { fontSize: 18, fontWeight: "bold", color: warna.teks },
  linkTeks: { color: warna.utama, fontWeight: "bold", fontSize: 14, padding: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  infoProfil: { fontSize: 14, color: warna.teksAbu, marginTop: 4 },
  tombolTambahBesar: { minHeight: 48, minWidth: 48 },

  // ---------- Modul 3 (Sprint 02): form login/register ----------
  inputBaris: { flexDirection: "row", alignItems: "center" },
  tombolMata: { minWidth: 48, minHeight: 48, justifyContent: "center", alignItems: "center", marginLeft: 4 },

  // ---------- Modul 5 (Sprint 04): tampilan token ----------
  kodeTeks: {
    fontFamily: "monospace",
    fontSize: 11,
    color: warna.teks,
    backgroundColor: "#F1F5F9",
    padding: 8,
    borderRadius: 8,
  },
});
