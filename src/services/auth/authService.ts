import * as Crypto from "expo-crypto";
import type { UserRole } from "@/types";
import { secureStorage } from "@/services/storage/secureStorage";
import { localStore } from "@/services/storage/localStore";
import { request } from "@/services/api/apiClient";

export const ROLE_PEMILIK: UserRole = "pemilik";
export const ROLE_KASIR: UserRole = "kasir";

/** Data user yang aman untuk dipakai di UI (tanpa password/salt). */
export interface SessionUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
}

/** Bentuk akun lokal yang disimpan di AsyncStorage (Password TIDAK disimpan, hanya hash-nya). */
interface StoredAccount extends SessionUser {
  passwordHash: string;
  salt: string;
  createdAt: string;
}

// Kunci AsyncStorage (local storage)
const KEY_ACCOUNTS = "tm_accounts";
const KEY_REMEMBERED_USERNAME = "tm_remembered_username";

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;
const MIN_PASSWORD = 4;

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function createSalt(): string {
  return toHex(Crypto.getRandomBytes(16));
}

function hashPassword(password: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${password}`,
  );
}

function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const binary = decodeBase64(base64);
    return JSON.parse(binary);
  } catch {
    return null;
  }
}

function decodeBase64(input: string): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let str = input.replace(/=+$/, "");
  let output = "";
  for (
    let bc = 0, bs = 0, buffer, i = 0;
    (buffer = str.charAt(i++));
    ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
      ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
      : 0
  ) {
    buffer = chars.indexOf(buffer);
  }
  return output;
}

async function createAccount(
  username: string,
  name: string,
  role: UserRole,
  password: string,
): Promise<StoredAccount> {
  const salt = createSalt();
  return {
    id: Crypto.randomUUID(),
    username: username.trim().toLowerCase(),
    name: name.trim(),
    role,
    salt,
    passwordHash: await hashPassword(password, salt),
    createdAt: new Date().toISOString(),
  };
}

function toSessionUser(account: StoredAccount): SessionUser {
  const { id, username, name, role } = account;
  return { id, username, name, role };
}

async function getAccounts(): Promise<StoredAccount[]> {
  const accounts = await localStore.getJSON<StoredAccount[]>(KEY_ACCOUNTS, []);
  if (accounts.length > 0) return accounts;

  const seed = [
    await createAccount("pemilik", "Pemilik Toko", ROLE_PEMILIK, "admin123"),
    await createAccount("kasir", "Kasir 1", ROLE_KASIR, "1234"),
  ];
  await localStore.setJSON(KEY_ACCOUNTS, seed);
  return seed;
}

function validatePassword(password: string) {
  if (password.length < MIN_PASSWORD) {
    throw new Error(`Password minimal ${MIN_PASSWORD} karakter.`);
  }
}

export const authService = {
  /**
   * Login ke REST API backend di API_BASE_URL.
   * Menerima access token & refresh token JWT dari backend, lalu menyimpannya di SecureStore.
   */
  async login(username: string, password: string): Promise<SessionUser> {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || !password) {
      throw new Error("Isi username dan password.");
    }

    // Panggil endpoint login backend
    let responseData: any;
    try {
      responseData = await request<any>(
        "POST",
        "/login",
        { username: cleanUsername, password },
        { skipAuth: true },
      );
    } catch (err: any) {
      // Coba alternatif /auth/login jika endpoint /login 404
      if (err?.status === 404) {
        responseData = await request<any>(
          "POST",
          "/auth/login",
          { username: cleanUsername, password },
          { skipAuth: true },
        );
      } else {
        throw err;
      }
    }

    // Ekstraksi token dari response server (fleksibel mendukung berbagai penamaan token)
    const accessToken: string | undefined =
      responseData?.accessToken ||
      responseData?.access_token ||
      responseData?.token ||
      responseData?.data?.accessToken ||
      responseData?.data?.token;

    const refreshToken: string | undefined =
      responseData?.refreshToken ||
      responseData?.refresh_token ||
      responseData?.data?.refreshToken;

    if (!accessToken) {
      throw new Error("Respon server tidak memuat JWT access token.");
    }

    // Ekstraksi data profil user
    let user: SessionUser | null =
      responseData?.user || responseData?.data?.user || null;

    if (!user) {
      // Decode user dari payload JWT jika server tidak mengirimkan user terpisah
      const payload = decodeJwtPayload(accessToken);
      if (payload) {
        user = {
          id: String(payload.sub || payload.id || Crypto.randomUUID()),
          username: String(payload.username || cleanUsername),
          name: String(payload.name || cleanUsername),
          role: payload.role === ROLE_PEMILIK ? ROLE_PEMILIK : ROLE_KASIR,
        };
      } else {
        user = {
          id: Crypto.randomUUID(),
          username: cleanUsername,
          name: cleanUsername === "pemilik" ? "Pemilik Toko" : "Kasir 1",
          role: cleanUsername === "pemilik" ? ROLE_PEMILIK : ROLE_KASIR,
        };
      }
    }

    // SIMPAN TOKEN DI SECURESTORE (bukan AsyncStorage/localStore)
    await secureStorage.setTokens(accessToken, refreshToken);
    await secureStorage.setUser(user);

    return user;
  },

  /**
   * Pulihkan sesi saat aplikasi dibuka: cek apakah access token masih tersimpan di SecureStore.
   */
  async restoreSession(): Promise<SessionUser | null> {
    const token = await secureStorage.getAccessToken();
    if (!token) return null;

    const user = await secureStorage.getUser<SessionUser>();
    if (!user) return null;

    return user;
  },

  /**
   * Logout:
   * 1. Panggil endpoint logout/revoke backend dengan token agar token lama di-revoke.
   * 2. Hapus token dari SecureStore.
   */
  async logout(): Promise<void> {
    const refreshToken = await secureStorage.getRefreshToken();
    try {
      await request("POST", "/logout", { refreshToken });
    } catch {
      try {
        await request("POST", "/auth/logout", { refreshToken });
      } catch {
        // Abaikan jika backend tidak dapat dihubungi saat logout; pembersihan lokal tetap dilakukan
      }
    }

    // Hapus seluruh kredensial dari SecureStore
    await secureStorage.clearTokens();
  },

  async listAccounts(): Promise<SessionUser[]> {
    const accounts = await getAccounts();
    return accounts.map(toSessionUser);
  },

  async addCashier(
    currentUser: SessionUser,
    data: { username: string; name: string; password: string },
  ): Promise<SessionUser> {
    if (currentUser.role !== ROLE_PEMILIK) {
      throw new Error("Hanya pemilik yang bisa menambah akun kasir.");
    }
    const username = data.username.trim().toLowerCase();
    if (!USERNAME_PATTERN.test(username)) {
      throw new Error(
        "Username 3–20 karakter, hanya huruf kecil, angka, dan garis bawah.",
      );
    }
    if (!data.name.trim()) throw new Error("Isi nama kasir.");
    validatePassword(data.password);

    const accounts = await getAccounts();
    if (accounts.some((a) => a.username === username)) {
      throw new Error(`Username "${username}" sudah dipakai.`);
    }

    const account = await createAccount(
      username,
      data.name,
      ROLE_KASIR,
      data.password,
    );
    await localStore.setJSON(KEY_ACCOUNTS, [...accounts, account]);
    return toSessionUser(account);
  },

  async removeCashier(
    currentUser: SessionUser,
    cashierId: string,
  ): Promise<void> {
    if (currentUser.role !== ROLE_PEMILIK) {
      throw new Error("Hanya pemilik yang bisa menghapus akun kasir.");
    }
    const accounts = await getAccounts();
    const target = accounts.find((a) => a.id === cashierId);
    if (!target || target.role !== ROLE_KASIR) {
      throw new Error("Akun kasir tidak ditemukan.");
    }
    await localStore.setJSON(
      KEY_ACCOUNTS,
      accounts.filter((a) => a.id !== cashierId),
    );
  },

  async changePassword(
    currentUser: SessionUser,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const accounts = await getAccounts();
    const account = accounts.find((a) => a.id === currentUser.id);
    if (!account) throw new Error("Akun tidak ditemukan.");

    const oldHash = await hashPassword(oldPassword, account.salt);
    if (oldHash !== account.passwordHash) {
      throw new Error("Password lama salah.");
    }
    validatePassword(newPassword);
    if (oldPassword === newPassword) {
      throw new Error("Password baru harus berbeda dari password lama.");
    }

    const salt = createSalt();
    const updated: StoredAccount = {
      ...account,
      salt,
      passwordHash: await hashPassword(newPassword, salt),
    };
    await localStore.setJSON(
      KEY_ACCOUNTS,
      accounts.map((a) => (a.id === account.id ? updated : a)),
    );
  },

  // Preferensi "ingat username" tidak rahasia, jadi disimpan di AsyncStorage.
  getRememberedUsername(): Promise<string | null> {
    return localStore.getString(KEY_REMEMBERED_USERNAME);
  },

  async setRememberedUsername(username: string | null): Promise<void> {
    if (username)
      await localStore.setString(
        KEY_REMEMBERED_USERNAME,
        username.trim().toLowerCase(),
      );
    else await localStore.remove(KEY_REMEMBERED_USERNAME);
  },
};
