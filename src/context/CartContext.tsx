import React, { createContext, useContext, useState } from 'react';
import { Product, Transaction, TransactionItem, PaymentMethod } from '@/types';
import { transactionRepository } from '@/services/repositories';
import { useProducts } from './ProductContext';
import { useAuth } from './AuthContext';

export interface CartItem extends TransactionItem {
  availableStock: number;
  unit: string;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  cashPaid: number;
  changeAmount: number;
  paymentMethod: PaymentMethod;
  setCashPaid: (amount: number) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  addToCart: (product: Product, quantity?: number) => { success: boolean; message?: string };
  updateQuantity: (productId: string, quantity: number) => { success: boolean; message?: string };
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  setQuickCash: (nominal: number) => void;
  setExactCash: () => void;
  checkout: () => Promise<Transaction>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cashPaid, setCashPaid] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('tunai');

  const { decreaseStockAfterSale, getProductById } = useProducts();
  const { user } = useAuth();

  const totalItems = items.reduce((acc, it) => acc + it.quantity, 0);
  const totalAmount = items.reduce((acc, it) => acc + it.subtotal, 0);
  const changeAmount = Math.max(0, cashPaid - totalAmount);

  const addToCart = (product: Product, quantity = 1): { success: boolean; message?: string } => {
    // Ambil data stok terbaru
    const currentProd = getProductById(product.id) || product;

    if (currentProd.stock <= 0) {
      return { success: false, message: `Stok "${product.name}" habis!` };
    }

    const existingIndex = items.findIndex(it => it.productId === product.id);

    if (existingIndex > -1) {
      const currentQty = items[existingIndex].quantity;
      const targetQty = currentQty + quantity;

      if (targetQty > currentProd.stock) {
        return {
          success: false,
          message: `Stok tidak mencukupi! Tersisa ${currentProd.stock} ${currentProd.unit}, sudah di keranjang ${currentQty}.`,
        };
      }

      const updated = [...items];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: targetQty,
        subtotal: targetQty * product.sellPrice,
        availableStock: currentProd.stock,
      };
      setItems(updated);
      return { success: true };
    } else {
      if (quantity > currentProd.stock) {
        return {
          success: false,
          message: `Stok tidak mencukupi! Tersisa ${currentProd.stock} ${currentProd.unit}.`,
        };
      }

      const newItem: CartItem = {
        productId: product.id,
        productName: product.name,
        barcode: product.barcode,
        buyPrice: product.buyPrice,
        sellPrice: product.sellPrice,
        quantity,
        subtotal: quantity * product.sellPrice,
        availableStock: currentProd.stock,
        unit: product.unit,
      };

      setItems(prev => [newItem, ...prev]);
      return { success: true };
    }
  };

  const updateQuantity = (
    productId: string,
    quantity: number
  ): { success: boolean; message?: string } => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return { success: true };
    }

    const prod = getProductById(productId);
    const maxStock = prod ? prod.stock : 999;

    if (quantity > maxStock) {
      return {
        success: false,
        message: `Stok tidak mencukupi! Maksimal ${maxStock}.`,
      };
    }

    setItems(prev =>
      prev.map(it =>
        it.productId === productId
          ? {
              ...it,
              quantity,
              subtotal: quantity * it.sellPrice,
              availableStock: maxStock,
            }
          : it
      )
    );
    return { success: true };
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(it => it.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
    setCashPaid(0);
  };

  const setQuickCash = (nominal: number) => {
    setCashPaid(nominal);
  };

  const setExactCash = () => {
    setCashPaid(totalAmount);
  };

  const checkout = async (): Promise<Transaction> => {
    if (items.length === 0) {
      throw new Error('Keranjang belanja masih kosong!');
    }

    if (paymentMethod === 'tunai' && cashPaid < totalAmount) {
      throw new Error(
        `Uang bayar kurang! Total: Rp ${totalAmount.toLocaleString('id-ID')}, Dibayar: Rp ${cashPaid.toLocaleString('id-ID')}`
      );
    }

    // Siapkan item untuk pengurangan stok
    const stockDeductions = items.map(it => ({
      productId: it.productId,
      quantity: it.quantity,
    }));

    // 1. Kurangi stok (akan melempar error jika stok tidak cukup dan memicu notifikasi jika stok <= 3)
    await decreaseStockAfterSale(stockDeductions);

    // 2. Simpan transaksi
    const cashierName = user?.name || 'Kasir Toko Madura';
    const cashierId = user?.id || 'kasir-default';

    const transaction = await transactionRepository.create({
      items: items.map(it => ({
        productId: it.productId,
        productName: it.productName,
        barcode: it.barcode,
        buyPrice: it.buyPrice,
        sellPrice: it.sellPrice,
        quantity: it.quantity,
        subtotal: it.subtotal,
      })),
      totalItems,
      totalAmount,
      totalCost: items.reduce((acc, it) => acc + (it.buyPrice * it.quantity), 0),
      profit: 0, // dihitung otomatis oleh repository
      cashPaid: paymentMethod === 'tunai' ? cashPaid : totalAmount,
      changeAmount: paymentMethod === 'tunai' ? Math.max(0, cashPaid - totalAmount) : 0,
      cashierId,
      cashierName,
      paymentMethod,
    });

    // Reset keranjang
    clearCart();

    return transaction;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalAmount,
        cashPaid,
        changeAmount,
        paymentMethod,
        setCashPaid,
        setPaymentMethod,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        setQuickCash,
        setExactCash,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart harus digunakan di dalam CartProvider');
  }
  return context;
};
