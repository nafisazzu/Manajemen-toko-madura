// =============================================
// MODUL 4 (Sprint 03) - MAPPING API DATA -> MODEL APLIKASI
// API response tidak langsung dilempar ke UI.
// Hanya field yang dibutuhkan yang diambil, lalu
// nama & formatnya disesuaikan dengan kebutuhan aplikasi.
//
//   TransaksiDTO (server)        ->  Transaksi (aplikasi)
//   kode: "TRX-001"              ->  id
//   tanggal_transaksi (ISO)      ->  tanggal "YYYY-MM-DD"
//   nama_barang                  ->  namaBarang
//   qty                          ->  jumlah
//   harga_satuan                 ->  hargaSatuan
//   jenis "JUAL" / "BELI"        ->  "penjualan" / "pembelian"
//   catatan null                 ->  undefined (opsional)
//   kasir_id, created_at, ...    ->  (dibuang, tidak dipakai)
// =============================================
import { Transaksi, TransaksiDTO, TransaksiBaruDTO } from "../types/transaksi";

function keTanggalLokal(iso: string): string {
  const d = new Date(iso);
  const bulan = String(d.getMonth() + 1).padStart(2, "0");
  const hari = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${bulan}-${hari}`;
}

// Server -> aplikasi
export function keTransaksi(dto: TransaksiDTO): Transaksi {
  return {
    id: dto.kode,
    tanggal: keTanggalLokal(dto.tanggal_transaksi),
    namaBarang: dto.nama_barang,
    jumlah: dto.qty,
    satuan: dto.satuan,
    hargaSatuan: dto.harga_satuan,
    jenis: dto.jenis === "JUAL" ? "penjualan" : "pembelian",
    catatan: dto.catatan ?? undefined,
  };
}

// Aplikasi -> server (untuk POST)
export function keTransaksiBaruDTO(data: Omit<Transaksi, "id" | "tanggal">): TransaksiBaruDTO {
  return {
    nama_barang: data.namaBarang,
    qty: data.jumlah,
    satuan: data.satuan,
    harga_satuan: data.hargaSatuan,
    jenis: data.jenis === "penjualan" ? "JUAL" : "BELI",
    catatan: data.catatan,
  };
}
