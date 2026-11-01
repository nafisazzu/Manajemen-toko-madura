// =============================================
// STATE DATA TRANSAKSI
// Modul 1-2: data statis dari src/data/transaksi.ts
// Modul 4  : data DINAMIS dari REST API (services/api.ts)
// =============================================
import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { Transaksi } from "../types/transaksi";
import { ambilDaftarTransaksi, kirimTransaksi } from "../services/api";
import { useAuth } from "./AuthContext";

interface TransaksiContextType {
  daftar: Transaksi[];
  loading: boolean;
  error: string;
  muatUlang: () => Promise<void>;
  tambahTransaksi: (data: Omit<Transaksi, "id" | "tanggal">) => Promise<void>;
}

const TransaksiContext = createContext<TransaksiContextType | null>(null);

export function TransaksiProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const [daftar, setDaftar] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const muatUlang = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setDaftar(await ambilDaftarTransaksi());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Data diambil setelah pengguna login; dikosongkan saat logout
  useEffect(() => {
    if (status === "masuk") muatUlang();
    if (status === "keluar") setDaftar([]);
  }, [status, muatUlang]);

  // Kirim ke server dulu (POST), lalu tambahkan hasil dari server ke state
  const tambahTransaksi = async (data: Omit<Transaksi, "id" | "tanggal">) => {
    const baru = await kirimTransaksi(data);
    setDaftar((prev) => [baru, ...prev]);
  };

  return (
    <TransaksiContext.Provider value={{ daftar, loading, error, muatUlang, tambahTransaksi }}>
      {children}
    </TransaksiContext.Provider>
  );
}

export function useTransaksi() {
  const ctx = useContext(TransaksiContext);
  if (!ctx) throw new Error("useTransaksi harus dipakai di dalam TransaksiProvider");
  return ctx;
}
