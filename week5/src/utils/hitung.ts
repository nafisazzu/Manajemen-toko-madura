// =============================================
// CUSTOM FUNCTION & LOOP 
// =============================================
import { Transaksi, Ringkasan } from "../types/transaksi";

// Arrow function: total harga satu transaksi
export const hitungTotal = (trx: Transaksi): number => {
  return trx.jumlah * trx.hargaSatuan;
};

// Function biasa: ubah angka jadi format Rupiah, contoh 78000 -> "Rp78.000"
export function formatRupiah(angka: number): string {
  return "Rp" + angka.toLocaleString("id-ID");
}

// Function dengan array + index: "2026-10-09" -> "9 Okt 2026"
export function formatTanggal(tanggal: string): string {
  const namaBulan: string[] = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  const bagian = tanggal.split("-"); // ["2026", "10", "09"]
  const tahun = bagian[0];
  const bulan = namaBulan[Number(bagian[1]) - 1]; // bulan 10 -> index 9 -> "Okt"
  const hari = Number(bagian[2]); // "09" -> 9
  return `${hari} ${bulan} ${tahun}`; // template literal
}

// PRIMITIVE LOOP (for): menjumlahkan semua penjualan & pembelian
export function hitungRingkasan(data: Transaksi[]): Ringkasan {
  let totalPenjualan = 0;
  let totalPembelian = 0;

  for (let i = 0; i < data.length; i++) {
    const total = hitungTotal(data[i]);

    // CONDITION (if/else)
    if (data[i].jenis === "penjualan") {
      totalPenjualan = totalPenjualan + total;
    } else {
      totalPembelian = totalPembelian + total;
    }
  }

  return {
    totalPenjualan: totalPenjualan,
    totalPembelian: totalPembelian,
    selisih: totalPenjualan - totalPembelian,
    jumlahTransaksi: data.length,
  };
}
