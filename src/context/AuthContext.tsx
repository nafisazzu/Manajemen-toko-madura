import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { UserRole } from "@/types";
import {
  authService,
  ROLE_PEMILIK,
  SessionUser,
} from "@/services/auth/authService";
import { onUnauthorized } from "@/services/api/apiClient";

interface AuthContextValue {
  user: SessionUser | null;
  isLoading: boolean;
  isOwner: boolean;
  role: UserRole | null;
  login: (
    username: string,
    password: string,
    rememberUsername?: boolean,
  ) => Promise<void>;
  logout: () => Promise<void>;
  addCashier: (data: {
    username: string;
    name: string;
    password: string;
  }) => Promise<void>;
  removeCashier: (cashierId: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  /** Ganti akun = keluar, lalu masuk lagi dengan akun lain (tidak bisa pindah peran tanpa password). */
  switchUser: (...args: unknown[]) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Saat aplikasi dibuka, pulihkan sesi dari SecureStore jika masih berlaku.
  useEffect(() => {
    authService
      .restoreSession()
      .then(setUser)
      .finally(() => setIsLoading(false));
  }, []);

  // Pasang listener 401: jika refresh token gagal, reset user state agar auto redirect ke login
  useEffect(() => {
    const unsubscribe = onUnauthorized(() => {
      setUser(null);
    });
    return unsubscribe;
  }, []);

  const login = useCallback(
    async (username: string, password: string, rememberUsername = false) => {
      const loggedIn = await authService.login(username, password);
      await authService.setRememberedUsername(
        rememberUsername ? username : null,
      );
      setUser(loggedIn);
    },
    [],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const requireUser = useCallback(() => {
    if (!user) throw new Error("Sesi berakhir. Silakan masuk lagi.");
    return user;
  }, [user]);

  const addCashier = useCallback(
    async (data: { username: string; name: string; password: string }) => {
      await authService.addCashier(requireUser(), data);
    },
    [requireUser],
  );

  const removeCashier = useCallback(
    async (cashierId: string) => {
      await authService.removeCashier(requireUser(), cashierId);
    },
    [requireUser],
  );

  const changePassword = useCallback(
    async (oldPassword: string, newPassword: string) => {
      await authService.changePassword(requireUser(), oldPassword, newPassword);
    },
    [requireUser],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isOwner: user?.role === ROLE_PEMILIK,
      role: user?.role ?? null,
      login,
      logout,
      addCashier,
      removeCashier,
      changePassword,
      switchUser: logout,
    }),
    [user, isLoading, login, logout, addCashier, removeCashier, changePassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth harus dipakai di dalam AuthProvider.");
  return context;
}
