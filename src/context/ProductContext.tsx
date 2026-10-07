import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '@/types';
import { productRepository, restockRepository } from '@/services/repositories';
import { notificationService } from '@/services/notificationService';

interface ProductContextType {
  products: Product[];
  isLoading: boolean;
  lowStockCount: number;
  lowStockProducts: Product[];
  refreshProducts: () => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  getProductByBarcode: (barcode: string) => Product | undefined;
  addProduct: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<boolean>;
  restockProduct: (
    productId: string,
    quantity: number,
    purchasePrice?: number,
    supplier?: string,
    notes?: string,
    recordedBy?: string
  ) => Promise<Product>;
  decreaseStockAfterSale: (
    items: { productId: string; quantity: number }[]
  ) => Promise<void>;
  resetSeedData: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await productRepository.getAll();
      setProducts(data);
    } catch (e) {
      console.error('[ProductContext] Gagal mengambil data produk:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  const lowStockProducts = products.filter(p => p.stock <= p.minStockWarning);
  const lowStockCount = lowStockProducts.length;

  const getProductById = (id: string): Product | undefined => {
    return products.find(p => p.id === id);
  };

  const getProductByBarcode = (barcode: string): Product | undefined => {
    const clean = barcode.trim();
    return products.find(p => p.barcode.trim() === clean);
  };

  const addProduct = async (
    data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Product> => {
    const created = await productRepository.create(data);
    await refreshProducts();
    // Cek jika produk baru langsung berstok tipis
    if (created.stock <= created.minStockWarning) {
      notificationService.notifyLowStock(created.name, created.stock, created.unit, created.id);
    }
    return created;
  };

  const updateProduct = async (
    id: string,
    updates: Partial<Product>
  ): Promise<Product> => {
    const updated = await productRepository.update(id, updates);
    await refreshProducts();
    return updated;
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    const success = await productRepository.delete(id);
    if (success) {
      await refreshProducts();
    }
    return success;
  };

  const restockProduct = async (
    productId: string,
    quantity: number,
    purchasePrice?: number,
    supplier?: string,
    notes?: string,
    recordedBy = 'Pemilik'
  ): Promise<Product> => {
    const updated = await productRepository.increaseStock(productId, quantity, purchasePrice);
    
    // Simpan riwayat barang masuk / restok
    await restockRepository.create({
      productId,
      productName: updated.name,
      quantityAdded: quantity,
      purchasePrice: purchasePrice || updated.buyPrice,
      totalCost: quantity * (purchasePrice || updated.buyPrice),
      supplier: supplier || 'Supplier Kelontong',
      notes: notes || 'Barang masuk restok',
      recordedBy,
    });

    await refreshProducts();
    return updated;
  };

  const decreaseStockAfterSale = async (
    items: { productId: string; quantity: number }[]
  ): Promise<void> => {
    const result = await productRepository.decreaseStock(items);
    setProducts(result.updatedProducts);

    // Memicu notifikasi lokal jika ada produk yang stoknya tersisa <= 3
    if (result.lowStockProducts.length > 0) {
      for (const lowItem of result.lowStockProducts) {
        notificationService.notifyLowStock(
          lowItem.name,
          lowItem.stock,
          lowItem.unit,
          lowItem.id
        );
      }
    }
  };

  const resetSeedData = async (): Promise<void> => {
    await productRepository.resetToSeed();
    await refreshProducts();
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        isLoading,
        lowStockCount,
        lowStockProducts,
        refreshProducts,
        getProductById,
        getProductByBarcode,
        addProduct,
        updateProduct,
        deleteProduct,
        restockProduct,
        decreaseStockAfterSale,
        resetSeedData,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts harus digunakan di dalam ProductProvider');
  }
  return context;
};
