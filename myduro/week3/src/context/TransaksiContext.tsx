import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Transaksi } from "../types/transaksi";
import { daftarTransaksi } from "../data/transaksi";

interface TransaksiContextType {
  daftar: Transaksi[];
  loading: boolean;
  tambahTransaksi: (data: Omit<Transaksi, "id">) => void;
}

const TransaksiContext = createContext<TransaksiContextType | null>(null);

export function TransaksiProvider({ children }: { children: ReactNode }) {
  const [daftar, setDaftar] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Dijalankan sekali saat render pertama: memuat data awal
  useEffect(() => {
    const timer = setTimeout(() => {
      setDaftar(daftarTransaksi);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const tambahTransaksi = (data: Omit<Transaksi, "id">) => {
    setDaftar((prev) => {
      const id = "TRX-" + String(prev.length + 1).padStart(3, "0");
      return [{ ...data, id }, ...prev];
    });
  };

  return (
    <TransaksiContext.Provider value={{ daftar, loading, tambahTransaksi }}>
      {children}
    </TransaksiContext.Provider>
  );
}

export function useTransaksi() {
  const ctx = useContext(TransaksiContext);
  if (!ctx) throw new Error("useTransaksi harus dipakai di dalam TransaksiProvider");
  return ctx;
}