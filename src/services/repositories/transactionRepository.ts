import { Transaction, DailyReport, MonthlyReport, ProductCategory } from '@/types';
import { ITransactionRepository } from './types';
import { getItem, setItem, STORAGE_KEYS } from '../storage/asyncStorage';

export class AsyncTransactionRepository implements ITransactionRepository {
  async getAll(): Promise<Transaction[]> {
    return getItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
  }

  async getById(id: string): Promise<Transaction | null> {
    const list = await this.getAll();
    return list.find(t => t.id === id) || null;
  }

  async create(
    data: Omit<Transaction, 'id' | 'createdAt' | 'invoiceNumber'>
  ): Promise<Transaction> {
    const list = await this.getAll();
    const now = new Date();
    const isoString = now.toISOString();

    const datePrefix = now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0');

    // Cari urutan transaksi pada hari ini
    const todayCount = list.filter(t => t.createdAt.startsWith(isoString.slice(0, 10))).length;
    const seq = (todayCount + 1).toString().padStart(4, '0');
    const invoiceNumber = `TRX-${datePrefix}-${seq}`;

    // Hitung profit jika belum dihitung
    const totalCost = data.items.reduce((acc, item) => acc + (item.buyPrice * item.quantity), 0);
    const profit = data.totalAmount - totalCost;

    const newTransaction: Transaction = {
      ...data,
      id: `trx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      invoiceNumber,
      createdAt: isoString,
      totalCost,
      profit,
    };

    const updated = [newTransaction, ...list];
    await setItem(STORAGE_KEYS.TRANSACTIONS, updated);
    return newTransaction;
  }

  async getByDate(dateString: string): Promise<Transaction[]> {
    const list = await this.getAll();
    // dateString format YYYY-MM-DD
    return list.filter(t => t.createdAt.startsWith(dateString));
  }

  async getByMonth(monthString: string): Promise<Transaction[]> {
    const list = await this.getAll();
    // monthString format YYYY-MM
    return list.filter(t => t.createdAt.startsWith(monthString));
  }

  async getDailyReport(dateString: string): Promise<DailyReport> {
    const transactions = await this.getByDate(dateString);
    const totalRevenue = transactions.reduce((acc, t) => acc + t.totalAmount, 0);
    const totalProfit = transactions.reduce((acc, t) => acc + t.profit, 0);
    const itemsSoldCount = transactions.reduce((acc, t) => acc + t.totalItems, 0);

    return {
      date: dateString,
      totalRevenue,
      totalProfit,
      transactionCount: transactions.length,
      itemsSoldCount,
      transactions,
    };
  }

  async getMonthlyReport(monthString: string): Promise<MonthlyReport> {
    const transactions = await this.getByMonth(monthString);
    const totalRevenue = transactions.reduce((acc, t) => acc + t.totalAmount, 0);
    const totalProfit = transactions.reduce((acc, t) => acc + t.profit, 0);
    const itemsSoldCount = transactions.reduce((acc, t) => acc + t.totalItems, 0);

    // Grouping by date
    const dayMap = new Map<string, { revenue: number; profit: number; transactions: number }>();
    for (const t of transactions) {
      const day = t.createdAt.slice(0, 10);
      const current = dayMap.get(day) || { revenue: 0, profit: 0, transactions: 0 };
      current.revenue += t.totalAmount;
      current.profit += t.profit;
      current.transactions += 1;
      dayMap.set(day, current);
    }

    const dailySummaries = Array.from(dayMap.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => b.date.localeCompare(a.date));

    // Category breakdown
    // Perlu mengetahui category untuk tiap produk jika tersedia
    const categoryMap = new Map<ProductCategory, { revenue: number; itemsSold: number }>();
    for (const t of transactions) {
      for (const item of t.items) {
        // Tentukan kategori dari item jika disimpan atau fallback 'lainnya'
        const cat: ProductCategory = 'lainnya'; 
        const current = categoryMap.get(cat) || { revenue: 0, itemsSold: 0 };
        current.revenue += item.subtotal;
        current.itemsSold += item.quantity;
        categoryMap.set(cat, current);
      }
    }

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category,
      ...stats,
    }));

    return {
      month: monthString,
      totalRevenue,
      totalProfit,
      transactionCount: transactions.length,
      itemsSoldCount,
      dailySummaries,
      categoryBreakdown,
    };
  }
}

export const transactionRepository = new AsyncTransactionRepository();
