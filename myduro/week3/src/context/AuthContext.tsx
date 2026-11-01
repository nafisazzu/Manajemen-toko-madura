// =============================================
// MODUL 3 (Sprint 02) - AUTHENTICATION STATE
// status: "memuat" (cek sesi tersimpan) -> "masuk" / "keluar"
// =============================================
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import * as Auth from "../services/authLocal";
import { User, HasilAuth } from "../services/authLocal";

type StatusAuth = "memuat" | "masuk" | "keluar";

interface AuthContextType {
  status: StatusAuth;
  user: User | null;
  login: (email: string, password: string) => Promise<HasilAuth>;
  register: (nama: string, email: string, password: string, konfirmasi: string) => Promise<HasilAuth>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<StatusAuth>("memuat");
  const [user, setUser] = useState<User | null>(null);

  // Saat aplikasi dibuka: baca sesi dari SecureStore.
  // Jika token ada -> pengguna tetap login tanpa mengetik ulang.
  useEffect(() => {
    Auth.bacaSesi()
      .then((sesi) => {
        setUser(sesi?.user ?? null);
        setStatus(sesi ? "masuk" : "keluar");
      })
      .catch(() => setStatus("keluar"));
  }, []);

  const terapkan = (hasil: HasilAuth) => {
    if (hasil.ok) {
      setUser(hasil.user);
      setStatus("masuk");
    }
    return hasil;
  };

  const login = async (email: string, password: string) => terapkan(await Auth.login(email, password));

  const register = async (nama: string, email: string, password: string, konfirmasi: string) =>
    terapkan(await Auth.register(nama, email, password, konfirmasi));

  const logout = async () => {
    await Auth.logout();
    setUser(null);
    setStatus("keluar"); // Stack.Protected otomatis mengarahkan ke halaman login
  };

  return (
    <AuthContext.Provider value={{ status, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}
