// =============================================
// ARRAY OF OBJECTS (Modul 1 - 5.5 A)
// Data riwayat transaksi MyDuro (data dummy/statis)
// =============================================
import { Transaksi } from "../types/transaksi";

export const daftarTransaksi: Transaksi[] = [
  {
    id: "TRX-001",
    tanggal: "2026-10-09",
    namaBarang: "Beras Premium 5kg",
    jumlah: 2,
    satuan: "karung",
    hargaSatuan: 78000,
    jenis: "penjualan",
  },
  {
    id: "TRX-002",
    tanggal: "2026-10-09",
    namaBarang: "Minyak Goreng 2L",
    jumlah: 3,
    satuan: "pcs",
    hargaSatuan: 36000,
    jenis: "penjualan",
  },
  {
    id: "TRX-003",
    tanggal: "2026-10-08",
    namaBarang: "Gula Pasir",
    jumlah: 20,
    satuan: "kg",
    hargaSatuan: 15500,
    jenis: "pembelian",
    catatan: "Stok dari agen Pak Slamet",
  },
  {
    id: "TRX-004",
    tanggal: "2026-10-08",
    namaBarang: "Rokok Kretek",
    jumlah: 5,
    satuan: "bks",
    hargaSatuan: 27000,
    jenis: "penjualan",
  },
  {
    id: "TRX-005",
    tanggal: "2026-10-07",
    namaBarang: "Air Mineral 600ml",
    jumlah: 4,
    satuan: "dus",
    hargaSatuan: 42000,
    jenis: "pembelian",
    catatan: "Restock mingguan",
  },
  {
    id: "TRX-006",
    tanggal: "2026-10-07",
    namaBarang: "Mie Instan Goreng",
    jumlah: 10,
    satuan: "pcs",
    hargaSatuan: 3500,
    jenis: "penjualan",
  },
  {
    id: "TRX-007",
    tanggal: "2026-10-06",
    namaBarang: "Telur Ayam",
    jumlah: 2,
    satuan: "kg",
    hargaSatuan: 29000,
    jenis: "penjualan",
  },
];
