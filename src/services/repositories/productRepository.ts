import { Product } from '@/types';
import { IProductRepository } from './types';
import { getItem, setItem, STORAGE_KEYS } from '../storage/asyncStorage';
import { SEED_PRODUCTS } from '@/constants/SeedData';

export class AsyncProductRepository implements IProductRepository {
  private async ensureInitialized(): Promise<Product[]> {
    const isSeeded = await getItem<boolean>(STORAGE_KEYS.SEEDED, false);
    if (!isSeeded) {
      await setItem(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS);
      await setItem(STORAGE_KEYS.SEEDED, true);
      return SEED_PRODUCTS;
    }
    return getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []);
  }

  async getAll(): Promise<Product[]> {
    return this.ensureInitialized();
  }

  async getById(id: string): Promise<Product | null> {
    const products = await this.ensureInitialized();
    return products.find(p => p.id === id) || null;
  }

  async getByBarcode(barcode: string): Promise<Product | null> {
    const products = await this.ensureInitialized();
    const cleanBarcode = barcode.trim();
    return products.find(p => p.barcode.trim() === cleanBarcode) || null;
  }

  async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const products = await this.ensureInitialized();
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...data,
      id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [newProduct, ...products];
    await setItem(STORAGE_KEYS.PRODUCTS, updated);
    return newProduct;
  }

  async update(id: string, updates: Partial<Product>): Promise<Product> {
    const products = await this.ensureInitialized();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Produk dengan ID "${id}" tidak ditemukan.`);
    }

    const updatedProduct: Product = {
      ...products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    products[index] = updatedProduct;
    await setItem(STORAGE_KEYS.PRODUCTS, products);
    return updatedProduct;
  }

  async delete(id: string): Promise<boolean> {
    const products = await this.ensureInitialized();
    const filtered = products.filter(p => p.id !== id);
    if (filtered.length === products.length) {
      return false;
    }
    await setItem(STORAGE_KEYS.PRODUCTS, filtered);
    return true;
  }

  async decreaseStock(
    items: { productId: string; quantity: number }[]
  ): Promise<{ updatedProducts: Product[]; lowStockProducts: Product[] }> {
    const products = await this.ensureInitialized();
    const productMap = new Map<string, Product>();
    products.forEach(p => productMap.set(p.id, { ...p }));

    // 1. Validasi atomik stok untuk SEMUA item terlebih dahulu
    for (const item of items) {
      const prod = productMap.get(item.productId);
      if (!prod) {
        throw new Error(`Produk dengan ID "${item.productId}" tidak ditemukan.`);
      }
      if (prod.stock < item.quantity) {
        throw new Error(
          `Stok "${prod.name}" tidak mencukupi! Tersedia: ${prod.stock} ${prod.unit}, diminta: ${item.quantity} ${prod.unit}.`
        );
      }
    }

    // 2. Eksekusi pengurangan stok setelah seluruh validasi lolos
    const lowStockProducts: Product[] = [];
    const now = new Date().toISOString();

    for (const item of items) {
      const prod = productMap.get(item.productId)!;
      const newStock = prod.stock - item.quantity;
      prod.stock = newStock;
      prod.updatedAt = now;

      // Peringatan stok menipis jika stok <= minStockWarning (default 3)
      if (newStock <= prod.minStockWarning) {
        lowStockProducts.push(prod);
      }
    }

    const updatedList = Array.from(productMap.values());
    await setItem(STORAGE_KEYS.PRODUCTS, updatedList);

    return {
      updatedProducts: updatedList,
      lowStockProducts,
    };
  }

  async increaseStock(
    productId: string,
    quantity: number,
    purchasePrice?: number
  ): Promise<Product> {
    if (quantity <= 0) {
      throw new Error('Jumlah stok masuk harus lebih dari 0.');
    }

    const products = await this.ensureInitialized();
    const index = products.findIndex(p => p.id === productId);
    if (index === -1) {
      throw new Error(`Produk dengan ID "${productId}" tidak ditemukan.`);
    }

    const current = products[index];
    const updated: Product = {
      ...current,
      stock: current.stock + quantity,
      buyPrice: purchasePrice !== undefined && purchasePrice > 0 ? purchasePrice : current.buyPrice,
      updatedAt: new Date().toISOString(),
    };

    products[index] = updated;
    await setItem(STORAGE_KEYS.PRODUCTS, products);
    return updated;
  }

  async resetToSeed(): Promise<Product[]> {
    await setItem(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS);
    await setItem(STORAGE_KEYS.SEEDED, true);
    return SEED_PRODUCTS;
  }
}

export const productRepository = new AsyncProductRepository();
