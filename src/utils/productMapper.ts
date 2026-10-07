import type { ProductDTO, ProdukModel, StatusStok } from '@/types/api';

export const BATAS_STOK_MENIPIS = 3;

export function hitungStatusStok(stok: number): StatusStok {
  if (stok <= 0) return 'habis';
  if (stok <= BATAS_STOK_MENIPIS) return 'menipis';
  return 'aman';
}

/**
 * MAPPING: ProductDTO (data server) -> ProdukModel (data aplikasi)
 * - Mengganti nama field: product_name -> nama, stock_qty -> stok
 * - Meratakan objek bersarang: category.name -> kategori, price.sell -> hargaJual
 * - Membuang field yang tidak dipakai UI: supplier, is_active, created_at, updated_at
 * - Menambah field turunan: statusStok (dihitung dari stok)
 */
export function toProdukModel(dto: ProductDTO): ProdukModel {
  return {
    id: String(dto.id),
    barcode: dto.barcode,
    nama: dto.product_name,
    kategori: dto.category?.name ?? 'Lainnya',
    hargaBeli: dto.price?.buy ?? 0,
    hargaJual: dto.price?.sell ?? 0,
    stok: dto.stock_qty,
    satuan: dto.unit,
    statusStok: hitungStatusStok(dto.stock_qty),
  };
}

/** Produk nonaktif tidak ditampilkan ke kasir. */
export function toProdukList(dtos: ProductDTO[]): ProdukModel[] {
  return dtos.filter((d) => d.is_active).map(toProdukModel);
}

export function formatRupiah(n: number): string {
  return 'Rp' + n.toLocaleString('id-ID');
}
