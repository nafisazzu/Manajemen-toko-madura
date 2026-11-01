// =============================================
// MODUL 5 (Sprint 04) - LOGIN MELALUI API + ACCESS TOKEN
// (menggantikan auth lokal Modul 3: sekarang server yang
//  memeriksa credential dan menerbitkan JWT)
//
// Alur: login -> POST /auth/login -> access_token (JWT)
//       -> simpan di SecureStore -> dipakai di setiap request
// =============================================
import { apiFetch, ApiError, pesanUntukPengguna } from "./http";
import { KEY, bacaAman, hapusAman, simpanAman } from "./storage";
import { validasiLogin, validasiRegister } from "../utils/validasi";

export interface User {
  id: number;
  nama: string;
  email: string;
}

export interface Sesi {
  token: string;
  user: User;
  expiresAt: string;
}

export type HasilAuth =
  | { ok: true; sesi: Sesi }
  | { ok: false; kode: "VALIDATION_ERROR" | "LOGIN_FAILED" | "EMAIL_TERPAKAI" | "SERVER_ERROR"; pesan: string };

interface ResponsLogin {
  access_token: string;
  token_type: "Bearer";
  expires_at: string;
  user: User;
}

function keHasilGagal(e: unknown): HasilAuth {
  if (e instanceof ApiError && e.jenis === "HTTP") {
    if (e.status === 401) return { ok: false, kode: "LOGIN_FAILED", pesan: e.message };
    if (e.status === 409) return { ok: false, kode: "EMAIL_TERPAKAI", pesan: e.message };
    if (e.status === 400) return { ok: false, kode: "VALIDATION_ERROR", pesan: e.message };
  }
  // Modul 6: offline / timeout / server error -> pesan yang jelas
  const { judul, pesan } = pesanUntukPengguna(e);
  return { ok: false, kode: "SERVER_ERROR", pesan: `${judul}. ${pesan}` };
}

function keSesi(r: ResponsLogin): Sesi {
  return { token: r.access_token, user: r.user, expiresAt: r.expires_at };
}

// Hanya meminta token ke server, TIDAK menyimpan (dipakai juga oleh uji keamanan)
export async function mintaToken(email: string, password: string): Promise<HasilAuth> {
  // Validasi di client dulu -> tidak perlu request ke server kalau input kosong
  const error = validasiLogin(email, password);
  if (error) return { ok: false, kode: "VALIDATION_ERROR", pesan: error };
  try {
    const r = await apiFetch<ResponsLogin>("/auth/login", {
      method: "POST",
      body: { email: email.trim(), password },
      pakaiToken: false,
    });
    return { ok: true, sesi: keSesi(r) };
  } catch (e) {
    return keHasilGagal(e);
  }
}

export async function login(email: string, password: string): Promise<HasilAuth> {
  const hasil = await mintaToken(email, password);
  if (hasil.ok) await simpanSesi(hasil.sesi);
  return hasil;
}

export async function register(nama: string, email: string, password: string, konfirmasi: string): Promise<HasilAuth> {
  const error = validasiRegister(nama, email, password, konfirmasi);
  if (error) return { ok: false, kode: "VALIDATION_ERROR", pesan: error };
  try {
    const r = await apiFetch<ResponsLogin>("/auth/register", {
      method: "POST",
      body: { nama: nama.trim(), email: email.trim(), password },
      pakaiToken: false,
    });
    const sesi = keSesi(r);
    await simpanSesi(sesi);
    return { ok: true, sesi };
  } catch (e) {
    return keHasilGagal(e);
  }
}

// ---------- Token storage (SecureStore) ----------
export async function simpanSesi(sesi: Sesi): Promise<void> {
  await simpanAman(KEY.token, sesi.token);
  await simpanAman(KEY.user, JSON.stringify({ user: sesi.user, expiresAt: sesi.expiresAt }));
  console.log("[MyDuro] Token saved to SecureStore");
}

export async function bacaSesi(): Promise<Sesi | null> {
  const token = await bacaAman(KEY.token);
  const info = await bacaAman(KEY.user);
  if (!token || !info) return null;
  const { user, expiresAt } = JSON.parse(info) as { user: User; expiresAt: string };
  // Token kedaluwarsa -> anggap belum login
  if (new Date(expiresAt).getTime() <= Date.now()) {
    await hapusSesi();
    return null;
  }
  return { token, user, expiresAt };
}

export async function hapusSesi(): Promise<void> {
  await hapusAman(KEY.token);
  await hapusAman(KEY.user);
  console.log("[MyDuro] Token deleted from SecureStore");
}

export async function logout(): Promise<void> {
  // Beri tahu server agar token dicabut (kalau gagal, tetap hapus di perangkat)
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } catch {
    // abaikan: misalnya offline / token sudah tidak berlaku
  }
  await hapusSesi();
}
