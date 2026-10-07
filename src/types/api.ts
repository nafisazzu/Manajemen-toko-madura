/**
 * ============ SERVER DATA (DTO) ============
 * Bentuk data PERSIS seperti yang dikirim REST API (GET /products).
 * Nama field mengikuti server (snake_case, bersarang), dan berisi field
 * yang tidak dibutuhkan aplikasi (supplier, created_at, updated_at, ...).
 */
export interface ProductDTO {
  id: number;
  barcode: string;
  product_name: string;
  category: { id: number; name: string };
  price: { buy: number; sell: number; currency: string };
  stock_qty: number;
  unit: string;
  supplier: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * ============ APPLICATION DATA (MODEL) ============
 * Bentuk data yang dipakai komponen UI Toko Madura.
 * Hanya field yang dibutuhkan, nama field sesuai aplikasi (camelCase, datar).
 */
export type StatusStok = 'aman' | 'menipis' | 'habis';

export interface ProdukModel {
  id: string;
  barcode: string;
  nama: string;
  kategori: string;
  hargaBeli: number;
  hargaJual: number;
  stok: number;
  satuan: string;
  statusStok: StatusStok;
}

/** Error dari pemanggilan API, menyimpan status code HTTP untuk ditampilkan saat demo. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number | null,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
