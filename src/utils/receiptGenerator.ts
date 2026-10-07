import { Transaction } from '@/types';
import { formatRupiah } from './currency';
import { formatDateTime } from './date';

/**
 * Generate formatted text receipt for sharing via WhatsApp or copying to clipboard
 */
export function generateTextReceipt(transaction: Transaction, storeName = 'TOKO MADURA'): string {
  const line = '--------------------------------';
  const doubleLine = '================================';

  let receipt = `${storeName}\n`;
  receipt += `Jl. Raya Toko Madura 24 Jam\n`;
  receipt += `${doubleLine}\n`;
  receipt += `No. Struk : ${transaction.invoiceNumber}\n`;
  receipt += `Waktu     : ${formatDateTime(transaction.createdAt)}\n`;
  receipt += `Kasir     : ${transaction.cashierName}\n`;
  receipt += `${line}\n`;

  for (const item of transaction.items) {
    receipt += `${item.productName}\n`;
    const qtyPrice = `  ${item.quantity} x ${formatRupiah(item.sellPrice)}`;
    const subtotal = formatRupiah(item.subtotal);
    const spaceCount = Math.max(1, 32 - qtyPrice.length - subtotal.length);
    receipt += `${qtyPrice}${' '.repeat(spaceCount)}${subtotal}\n`;
  }

  receipt += `${line}\n`;
  
  const totalLabel = `TOTAL (${transaction.totalItems} item):`;
  const totalVal = formatRupiah(transaction.totalAmount);
  const totalSpaces = Math.max(1, 32 - totalLabel.length - totalVal.length);
  receipt += `${totalLabel}${' '.repeat(totalSpaces)}${totalVal}\n`;

  const cashLabel = `BAYAR (${transaction.paymentMethod.toUpperCase()}):`;
  const cashVal = formatRupiah(transaction.cashPaid);
  const cashSpaces = Math.max(1, 32 - cashLabel.length - cashVal.length);
  receipt += `${cashLabel}${' '.repeat(cashSpaces)}${cashVal}\n`;

  const changeLabel = 'KEMBALI:';
  const changeVal = formatRupiah(transaction.changeAmount);
  const changeSpaces = Math.max(1, 32 - changeLabel.length - changeVal.length);
  receipt += `${changeLabel}${' '.repeat(changeSpaces)}${changeVal}\n`;

  receipt += `${doubleLine}\n`;
  receipt += `    MATOR SAKALANGKONG\n`;
  receipt += ` Terima Kasih Atas Kunjungan Anda!\n`;
  receipt += `    Buka 24 Jam Non-Stop\n`;

  return receipt;
}
