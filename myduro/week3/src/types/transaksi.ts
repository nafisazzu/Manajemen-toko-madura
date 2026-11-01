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
