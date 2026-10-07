/**
 * Format angka ke format mata uang Rupiah Indonesia
 * Contoh: 15000 -> "Rp 15.000"
 */
export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp 0';
  }
  return 'Rp ' + Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Parsing string input rupiah ke number
 * Contoh: "15.000" -> 15000
 */
export function parseRupiah(value: string): number {
  const clean = value.replace(/[^0-9]/g, '');
  return clean ? parseInt(clean, 10) : 0;
}
