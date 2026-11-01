// =============================================
// TYPE & INTERFACE (Modul 1 - 5.5 B)
// =============================================

// Union type: jenis transaksi HANYA boleh salah satu dari dua nilai ini
export type JenisTransaksi = "penjualan" | "pembelian";

// Interface: bentuk/struktur satu data transaksi
export interface Transaksi {
  readonly id: string; // readonly -> tidak bisa diubah setelah dibuat
  tanggal: string; // format "YYYY-MM-DD", contoh "2026-10-09"
  namaBarang: string;
  jumlah: number;
  satuan: string; // contoh: "pcs", "kg", "dus"
  hargaSatuan: number;
  jenis: JenisTransaksi;
  catatan?: string; // tanda "?" -> opsional, boleh ada boleh tidak
}

// Interface untuk hasil perhitungan ringkasan
export interface Ringkasan {
  totalPenjualan: number;
  totalPembelian: number;
  selisih: number;
  jumlahTransaksi: number;
}

// =============================================
// MODUL 4 (Sprint 03) - DATA MODELING / DTO
// Bentuk data DARI SERVER (lihat server/data/seed.json).
// Nama field & format berbeda dari model aplikasi di atas,
// jadi perlu di-mapping (lihat utils/mapper.ts).
// =============================================
export interface TransaksiDTO {
  id: number;
  kode: string; // "TRX-001"
  tanggal_transaksi: string; // ISO datetime, "2026-10-09T08:15:00+07:00"
  nama_barang: string;
  qty: number;
  satuan: string;
  harga_satuan: number;
  jenis: "JUAL" | "BELI";
  catatan: string | null;
  kasir_id: number; // tidak dipakai aplikasi
  created_at: string; // tidak dipakai aplikasi
  updated_at: string; // tidak dipakai aplikasi
}

// Data yang dikirim saat membuat transaksi baru (POST)
export type TransaksiBaruDTO = Pick<TransaksiDTO, "nama_barang" | "qty" | "satuan" | "harga_satuan" | "jenis"> & {
  catatan?: string;
};

// Bungkus response dari API: { success, data } atau { success, message }
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
