// =============================================
// STATE DATA TRANSAKSI
// Modul 1-2: data statis dari src/data/transaksi.ts
// Modul 4  : data DINAMIS dari REST API (services/api.ts)
// Modul 6  : setiap request punya STATE:
//            idle -> loading -> success / empty / error
//            + retry, dan muat ulang otomatis saat internet kembali
// =============================================
import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import NetInfo from "@react-native-community/netinfo";
import { Transaksi } from "../types/transaksi";
import { ambilDaftarTransaksi, kirimTransaksi } from "../services/api";
import { pesanUntukPengguna } from "../services/http";
import { useAuth } from "./AuthContext";

export type StatusMuat = "idle" | "loading" | "success" | "empty" | "error";

export interface InfoError {
  jenis: string; // HTTP | TIMEOUT | OFFLINE | NETWORK | LAIN
  judul: string;
  pesan: string;
}

interface TransaksiContextType {
  daftar: Transaksi[];
  status: StatusMuat;
  loading: boolean;
  error: InfoError | null;
  jumlahPercobaan: number;
  muatUlang: () => Promise<void>;
  tambahTransaksi: (data: Omit<Transaksi, "id" | "tanggal">) => Promise<void>;
}

const TransaksiContext = createContext<TransaksiContextType | null>(null);

export function TransaksiProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [daftar, setDaftar] = useState<Transaksi[]>([]);
  const [status, setStatus] = useState<StatusMuat>("idle");
  const [error, setError] = useState<InfoError | null>(null);
  const [jumlahPercobaan, setJumlahPercobaan] = useState(0);
  const errorRef = useRef<InfoError | null>(null);

  const muatUlang = useCallback(async () => {
    setStatus("loading");
    setError(null);
    errorRef.current = null;
    setJumlahPercobaan((n) => n + 1);
    try {
      const data = await ambilDaftarTransaksi();
      setDaftar(data);
      // Request berhasil tapi tidak ada data -> EMPTY (bukan error)
      setStatus(data.length === 0 ? "empty" : "success");
      setJumlahPercobaan(0);
    } catch (e) {
      const info = pesanUntukPengguna(e);
      console.log(`[MyDuro] API Error: ${info.jenis} - ${info.judul}`);
      setError(info);
      errorRef.current = info;
      setStatus("error");
    }
  }, []);

  // Data diambil setelah pengguna login; dikosongkan saat logout
  useEffect(() => {
    if (auth.status === "masuk") muatUlang();
    if (auth.status === "keluar") {
      setDaftar([]);
      setStatus("idle");
    }
  }, [auth.status, muatUlang]);

  // Internet kembali tersambung setelah gagal karena offline -> coba lagi otomatis
  useEffect(() => {
    const berhenti = NetInfo.addEventListener((net) => {
      if (net.isConnected && errorRef.current?.jenis === "OFFLINE") {
        console.log("[MyDuro] Koneksi kembali, memuat ulang data");
        muatUlang();
      }
    });
    return berhenti;
  }, [muatUlang]);

  // Kirim ke server dulu (POST), lalu tambahkan hasil dari server ke state.
  // Jika gagal, error dilempar dengan pesan yang ramah pengguna.
  const tambahTransaksi = async (data: Omit<Transaksi, "id" | "tanggal">) => {
    try {
      const baru = await kirimTransaksi(data);
      setDaftar((prev) => [baru, ...prev]);
      setStatus("success");
    } catch (e) {
      const { judul, pesan } = pesanUntukPengguna(e);
      throw new Error(`${judul}. ${pesan}`);
    }
  };

  return (
    <TransaksiContext.Provider
      value={{ daftar, status, loading: status === "loading", error, jumlahPercobaan, muatUlang, tambahTransaksi }}
    >
      {children}
    </TransaksiContext.Provider>
  );
}

export function useTransaksi() {
  const ctx = useContext(TransaksiContext);
  if (!ctx) throw new Error("useTransaksi harus dipakai di dalam TransaksiProvider");
  return ctx;
}
