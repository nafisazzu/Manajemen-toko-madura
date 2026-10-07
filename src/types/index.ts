export type UserRole = 'pemilik' | 'kasir';

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  pin: string; // 4-digit PIN for quick login
  phone?: string;
}

export type ProductCategory =
  | 'rokok'
  | 'minuman'
  | 'mie'
  | 'sembako'
  | 'snack'
  | 'lainnya';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  buyPrice: number;    // Harga modal/beli
  sellPrice: number;   // Harga jual kasir
  stock: number;       // Stok fisik saat ini
  barcode: string;     // Kode barcode (EAN-13, QR, dsb)
  unit: string;        // Satuan: bungkus, botol, pcs, kg, pack
  minStockWarning: number; // Ambang batas stok tipis (default 3)
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionItem {
  productId: string;
  productName: string;
  barcode: string;
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  subtotal: number;
}

export type PaymentMethod = 'tunai' | 'qris';

export interface Transaction {
  id: string;
  invoiceNumber: string; // Misal: "TRX-20260923-0001"
  createdAt: string;     // ISO timestamp
  items: TransactionItem[];
  totalItems: number;
  totalAmount: number;   // Total belanja (Rp)
  totalCost: number;     // Total modal beli (Rp)
  profit: number;        // Keuntungan kotor (totalAmount - totalCost)
  cashPaid: number;      // Uang tunai yang dibayarkan
  changeAmount: number;  // Kembalian
  cashierId: string;
  cashierName: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface RestockLog {
  id: string;
  productId: string;
  productName: string;
  quantityAdded: number;
  purchasePrice: number; // Harga beli per unit saat stok masuk
  totalCost: number;     // quantityAdded * purchasePrice
  supplier?: string;
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

export interface DailyReport {
  date: string; // YYYY-MM-DD
  totalRevenue: number;
  totalProfit: number;
  transactionCount: number;
  itemsSoldCount: number;
  transactions: Transaction[];
}

export interface MonthlyReport {
  month: string; // YYYY-MM
  totalRevenue: number;
  totalProfit: number;
  transactionCount: number;
  itemsSoldCount: number;
  dailySummaries: {
    date: string;
    revenue: number;
    profit: number;
    transactions: number;
  }[];
  categoryBreakdown: {
    category: ProductCategory;
    revenue: number;
    itemsSold: number;
  }[];
}
