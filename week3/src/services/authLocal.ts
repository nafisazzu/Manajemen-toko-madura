// =============================================
// MODUL 3 (Sprint 02) - AUTHENTICATION LOKAL
// Belum ada server, jadi akun disimpan di perangkat.
// Aturan keamanan:
//  - password TIDAK disimpan plaintext -> disimpan sebagai hash SHA-256 + salt
//  - akun & token sesi disimpan di SecureStore (terenkripsi)
//  - logout menghapus token sesi
// =============================================
import * as Crypto from "expo-crypto";
import { KEY, bacaAman, hapusAman, simpanAman } from "./storage";
import { validasiLogin, validasiRegister } from "../utils/validasi";

export interface User {
  id: string;
  nama: string;
  email: string;
}

interface AkunTersimpan extends User {
  salt: string;
  hashPassword: string;
}

export type HasilAuth =
  | { ok: true; user: User; token: string }
  | { ok: false; kode: "VALIDATION_ERROR" | "LOGIN_FAILED" | "EMAIL_TERPAKAI"; pesan: string };

async function hash(password: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, salt + password);
}

async function bacaSemuaAkun(): Promise<AkunTersimpan[]> {
  const teks = await bacaAman(KEY.akunLokal);
  return teks ? (JSON.parse(teks) as AkunTersimpan[]) : [];
}

export async function register(
  nama: string,
  email: string,
  password: string,
  konfirmasi: string
): Promise<HasilAuth> {
  // 1. Validasi input dulu
  const error = validasiRegister(nama, email, password, konfirmasi);
  if (error) return { ok: false, kode: "VALIDATION_ERROR", pesan: error };

  const akun = await bacaSemuaAkun();
  const emailBersih = email.trim().toLowerCase();
  if (akun.some((a) => a.email === emailBersih)) {
    return { ok: false, kode: "EMAIL_TERPAKAI", pesan: "Email sudah terdaftar. Silakan masuk." };
  }

  // 2. Simpan akun dengan password yang sudah di-hash
  const salt = Crypto.randomUUID();
  const baru: AkunTersimpan = {
    id: Crypto.randomUUID(),
    nama: nama.trim(),
    email: emailBersih,
    salt,
    hashPassword: await hash(password, salt),
  };
  await simpanAman(KEY.akunLokal, JSON.stringify([...akun, baru]));

  // 3. Langsung login setelah register
  return login(email, password);
}

// Hanya memeriksa credential, TIDAK menyimpan sesi (dipakai juga oleh uji keamanan)
export async function cekCredential(email: string, password: string): Promise<HasilAuth> {
  const error = validasiLogin(email, password);
  if (error) return { ok: false, kode: "VALIDATION_ERROR", pesan: error };

  const akun = (await bacaSemuaAkun()).find((a) => a.email === email.trim().toLowerCase());
  // Pesan sengaja dibuat umum: tidak memberi tahu apakah email atau password yang salah
  const gagal: HasilAuth = { ok: false, kode: "LOGIN_FAILED", pesan: "Email atau password salah." };
  if (!akun) return gagal;
  if ((await hash(password, akun.salt)) !== akun.hashPassword) return gagal;

  const user: User = { id: akun.id, nama: akun.nama, email: akun.email };
  return { ok: true, user, token: Crypto.randomUUID() };
}

export async function login(email: string, password: string): Promise<HasilAuth> {
  const hasil = await cekCredential(email, password);
  if (hasil.ok) await simpanSesi(hasil.token, hasil.user);
  return hasil;
}

// ---------- Sesi (session) ----------
export async function simpanSesi(token: string, user: User): Promise<void> {
  await simpanAman(KEY.token, token);
  await simpanAman(KEY.user, JSON.stringify(user));
}

export async function bacaSesi(): Promise<{ token: string; user: User } | null> {
  const token = await bacaAman(KEY.token);
  const user = await bacaAman(KEY.user);
  if (!token || !user) return null;
  return { token, user: JSON.parse(user) as User };
}

export async function logout(): Promise<void> {
  // Logout = hapus token & data sesi dari secure storage
  await hapusAman(KEY.token);
  await hapusAman(KEY.user);
}
