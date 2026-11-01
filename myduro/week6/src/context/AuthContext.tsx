// =============================================
// AUTHENTICATION STATE
// Modul 3: status login dari sesi di SecureStore
// Modul 5: login lewat API (JWT); auto logout jika server membalas 401
// =============================================
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import * as Auth from "../services/auth";
import { User, HasilAuth } from "../services/auth";
import { aturSaatTidakSah } from "../services/http";

type StatusAuth = "memuat" | "masuk" | "keluar";

interface AuthContextType {
  status: StatusAuth;
  user: User | null;
  token: string | null;
  pesanSesi: string; // contoh: "Sesi berakhir, silakan login lagi"
  login: (email: string, password: string) => Promise<HasilAuth>;
  register: (nama: string, email: string, password: string, konfirmasi: string) => Promise<HasilAuth>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<StatusAuth>("memuat");
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [pesanSesi, setPesanSesi] = useState("");

  const keluarLokal = () => {
    setUser(null);
    setToken(null);
    setStatus("keluar"); // Stack.Protected otomatis membuka halaman login
  };

  useEffect(() => {
    console.log("[MyDuro] App started");
    // Saat aplikasi dibuka: pakai token tersimpan (jika masih berlaku)
    Auth.bacaSesi()
      .then((sesi) => {
        setUser(sesi?.user ?? null);
        setToken(sesi?.token ?? null);
        setStatus(sesi ? "masuk" : "keluar");
      })
      .catch(() => setStatus("keluar"));

    // Server menolak token (401) -> hapus sesi & kembali ke login
    aturSaatTidakSah(() => {
      Auth.hapusSesi();
      setPesanSesi("Sesi berakhir atau token tidak valid. Silakan login lagi.");
      keluarLokal();
    });
    return () => aturSaatTidakSah(null);
  }, []);

  const terapkan = (hasil: HasilAuth) => {
    if (hasil.ok) {
      setUser(hasil.sesi.user);
      setToken(hasil.sesi.token);
      setPesanSesi("");
      setStatus("masuk");
    }
    return hasil;
  };

  const login = async (email: string, password: string) => terapkan(await Auth.login(email, password));

  const register = async (nama: string, email: string, password: string, konfirmasi: string) =>
    terapkan(await Auth.register(nama, email, password, konfirmasi));

  const logout = async () => {
    console.log("[MyDuro] Logout");
    await Auth.logout();
    keluarLokal();
  };

  return (
    <AuthContext.Provider value={{ status, user, token, pesanSesi, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}
