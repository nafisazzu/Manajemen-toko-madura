import * as Crypto from "expo-crypto";
import type { UserRole } from "@/types";
import { secureStorage } from "@/services/storage/secureStorage";
import { localStore } from "@/services/storage/localStore";

/**
 * SESUAIKAN dua nilai ini dengan isi `UserRole` di src/types/index.ts.
 * Contoh: jika UserRole = 'owner' | 'cashier', ganti menjadi 'owner' dan 'cashier'.
 * Jika tidak cocok, `npx tsc --noEmit` akan menampilkan error di dua baris ini.
 */
export const ROLE_PEMILIK: UserRole = "pemilik";
export const ROLE_KASIR: UserRole = "kasir";

/** Data user yang aman untuk dipakai di UI (tanpa password/salt). */
export interface SessionUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
}

/** Bentuk akun yang disimpan di AsyncStorage. Password TIDAK disimpan, hanya hash-nya. */
interface StoredAccount extends SessionUser {
  passwordHash: string;
  salt: string;
  createdAt: string;
}

/** Disimpan di SecureStore. */
interface Session {
  token: string;
  user: SessionUser;
  expiresAt: number;
}

// Kunci AsyncStorage (local storage)
const KEY_ACCOUNTS = "tm_accounts";
const KEY_REMEMBERED_USERNAME = "tm_remembered_username";
// Kunci SecureStore (secure storage). Hanya boleh huruf, angka, ".", "-", "_".
const KEY_SESSION = "tm_session";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // sesi berlaku 7 hari
const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;
const MIN_PASSWORD = 4;

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function createSalt(): string {
  return toHex(Crypto.getRandomBytes(16));
}

/** Password di-hash SHA-256 bersama salt acak, sehingga password asli tidak pernah disimpan. */
function hashPassword(password: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${password}`,
  );
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

/** Ambil semua akun. Saat pertama kali dijalankan, buat akun bawaan. */
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
  async login(username: string, password: string): Promise<SessionUser> {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || !password) {
      throw new Error("Isi username dan password.");
    }

    const accounts = await getAccounts();
    const account = accounts.find((a) => a.username === cleanUsername);
    const hash = account ? await hashPassword(password, account.salt) : "";
    if (!account || hash !== account.passwordHash) {
      throw new Error("Username atau password salah.");
    }

    const session: Session = {
      token: Crypto.randomUUID(),
      user: toSessionUser(account),
      expiresAt: Date.now() + SESSION_DURATION_MS,
    };
    await secureStorage.setItem(KEY_SESSION, JSON.stringify(session));
    return session.user;
  },

  /** Dipanggil saat aplikasi dibuka: pulihkan sesi dari SecureStore jika masih berlaku. */
  async restoreSession(): Promise<SessionUser | null> {
    const raw = await secureStorage.getItem(KEY_SESSION);
    if (!raw) return null;

    try {
      const session = JSON.parse(raw) as Session;
      const accounts = await getAccounts();
      const account = accounts.find((a) => a.id === session.user.id);
      if (!account || !session.token || Date.now() > session.expiresAt) {
        await secureStorage.removeItem(KEY_SESSION);
        return null;
      }
      return toSessionUser(account);
    } catch {
      await secureStorage.removeItem(KEY_SESSION);
      return null;
    }
  },

  async logout(): Promise<void> {
    await secureStorage.removeItem(KEY_SESSION);
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

  // Preferensi "ingat username" tidak rahasia, jadi cukup di AsyncStorage.
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
