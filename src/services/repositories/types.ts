import {
  Product,
  Transaction,
  RestockLog,
  User,
  DailyReport,
  MonthlyReport,
} from '@/types';

export interface IProductRepository {
  getAll(): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  getByBarcode(barcode: string): Promise<Product | null>;
  create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>;
  update(id: string, updates: Partial<Product>): Promise<Product>;
  delete(id: string): Promise<boolean>;
  decreaseStock(
    items: { productId: string; quantity: number }[]
  ): Promise<{ updatedProducts: Product[]; lowStockProducts: Product[] }>;
  increaseStock(
    productId: string,
    quantity: number,
    purchasePrice?: number
  ): Promise<Product>;
  resetToSeed(): Promise<Product[]>;
}

export interface ITransactionRepository {
  getAll(): Promise<Transaction[]>;
  getById(id: string): Promise<Transaction | null>;
  create(
    data: Omit<Transaction, 'id' | 'createdAt' | 'invoiceNumber'>
  ): Promise<Transaction>;
  getByDate(dateString: string): Promise<Transaction[]>;
  getByMonth(monthString: string): Promise<Transaction[]>;
  getDailyReport(dateString: string): Promise<DailyReport>;
  getMonthlyReport(monthString: string): Promise<MonthlyReport>;
}

export interface IRestockRepository {
  getAll(): Promise<RestockLog[]>;
  getById(id: string): Promise<RestockLog | null>;
  getByProductId(productId: string): Promise<RestockLog[]>;
  create(data: Omit<RestockLog, 'id' | 'createdAt'>): Promise<RestockLog>;
}

export interface IAuthRepository {
  getUsers(): Promise<User[]>;
  getCurrentUser(): Promise<User | null>;
  setCurrentUser(user: User | null): Promise<void>;
  login(roleOrUsername: string, pin: string): Promise<User | null>;
}
