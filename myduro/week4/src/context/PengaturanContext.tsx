// =============================================
// MODUL 3 (Sprint 02) - NORMAL DATA
// Pengaturan aplikasi tidak rahasia -> cukup AsyncStorage.
// =============================================
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { KEY, bacaBiasa, simpanBiasa } from "../services/storage";

export interface Pengaturan {
  namaToko: string;
  tampilkanCatatan: boolean;
}

const BAWAAN: Pengaturan = {
  namaToko: "Toko Madura Berkah",
  tampilkanCatatan: true,
};

interface PengaturanContextType {
  pengaturan: Pengaturan;
  ubahPengaturan: (sebagian: Partial<Pengaturan>) => void;
}

const PengaturanContext = createContext<PengaturanContextType | null>(null);

export function PengaturanProvider({ children }: { children: ReactNode }) {
  const [pengaturan, setPengaturan] = useState<Pengaturan>(BAWAAN);

  useEffect(() => {
    bacaBiasa<Partial<Pengaturan>>(KEY.pengaturan).then((tersimpan) => {
      if (tersimpan) setPengaturan({ ...BAWAAN, ...tersimpan });
    });
  }, []);

  const ubahPengaturan = (sebagian: Partial<Pengaturan>) => {
    setPengaturan((lama) => {
      const baru = { ...lama, ...sebagian };
      simpanBiasa(KEY.pengaturan, baru);
      return baru;
    });
  };

  return (
    <PengaturanContext.Provider value={{ pengaturan, ubahPengaturan }}>
      {children}
    </PengaturanContext.Provider>
  );
}

export function usePengaturan() {
  const ctx = useContext(PengaturanContext);
  if (!ctx) throw new Error("usePengaturan harus dipakai di dalam PengaturanProvider");
  return ctx;
}
