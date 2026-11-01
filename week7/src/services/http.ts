// =============================================
// MODUL 5 (Sprint 04) - SECURE REQUEST + "INTERCEPTOR"
// Semua request ke API lewat apiFetch():
//  1. ambil access token dari SecureStore
//  2. tempel otomatis di header  Authorization: Bearer <token>
//  3. jika server membalas 401 -> sesi dianggap berakhir (auto logout)
//
// MODUL 6 (Sprint 05) - RELIABLE API
//  4. cek koneksi internet dulu (offline -> error OFFLINE)
//  5. batas waktu (timeout) -> error TIMEOUT, aplikasi tidak "hang"
//  6. periksa response.ok -> error HTTP 4xx / 5xx dengan pesan yang jelas
// =============================================
import NetInfo from "@react-native-community/netinfo";
import { API_URL } from "../config";
import { KEY, bacaAman } from "./storage";

export const BATAS_WAKTU_MS = 10_000; // 10 detik

// Production wajib HTTPS agar token tidak bisa disadap saat dikirim (data in transit)
if (!__DEV__ && API_URL.startsWith("http://")) {
  console.warn("[MyDuro] PERINGATAN: API tanpa HTTPS. Token dapat disadap!");
}

// Dipasang oleh AuthContext: apa yang dilakukan saat token ditolak server
let saatTidakSah: (() => void) | null = null;
export function aturSaatTidakSah(fn: (() => void) | null) {
  saatTidakSah = fn;
}

// Mode simulasi (dipilih di Profil) untuk mendemokan kondisi error
export type ModeSimulasi = "normal" | "lambat" | "error500" | "error503" | "error404" | "kosong" | "offline";
let modeSimulasi: ModeSimulasi = "normal";
export function aturModeSimulasi(mode: ModeSimulasi) {
  modeSimulasi = mode;
}

// ---------- Jenis kegagalan ----------
export type JenisError = "HTTP" | "TIMEOUT" | "OFFLINE" | "NETWORK";

export class ApiError extends Error {
  constructor(public jenis: JenisError, pesan: string, public status = 0) {
    super(pesan);
    this.name = "ApiError";
  }
}

// Ubah error teknis menjadi pesan yang mudah dipahami pengguna
export function pesanUntukPengguna(e: unknown): { judul: string; pesan: string; jenis: JenisError | "LAIN" } {
  if (e instanceof ApiError) {
    switch (e.jenis) {
      case "OFFLINE":
        return { jenis: e.jenis, judul: "Tidak ada koneksi internet", pesan: "Periksa koneksi Anda dan coba lagi." };
      case "TIMEOUT":
        return { jenis: e.jenis, judul: "Waktu habis", pesan: "Server terlalu lama merespons. Silakan coba lagi." };
      case "NETWORK":
        return { jenis: e.jenis, judul: "Server tidak dapat dihubungi", pesan: "Pastikan server MyDuro berjalan dan alamat API benar." };
      case "HTTP":
        if (e.status === 404) return { jenis: e.jenis, judul: "Data tidak ditemukan", pesan: `Resource yang diminta tidak tersedia (404 Not Found).` };
        if (e.status >= 500) return { jenis: e.jenis, judul: "Gagal memuat data", pesan: `Terjadi kesalahan pada server (${e.status}). Silakan coba lagi.` };
        return { jenis: e.jenis, judul: "Permintaan gagal", pesan: `${e.message} (${e.status})` };
    }
  }
  return { jenis: "LAIN", judul: "Terjadi kesalahan", pesan: e instanceof Error ? e.message : "Silakan coba lagi." };
}

interface OpsiRequest {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  pakaiToken?: boolean; // false untuk /auth/login & /auth/register
  batasWaktuMs?: number;
}

export async function apiFetch<T>(path: string, opsi: OpsiRequest = {}): Promise<T> {
  const { method = "GET", body, pakaiToken = true, batasWaktuMs = BATAS_WAKTU_MS } = opsi;

  // ---- 1. Cek koneksi (offline handling) ----
  const net = await NetInfo.fetch();
  if (net.isConnected === false || modeSimulasi === "offline") {
    console.log(`[MyDuro] ${method} ${path} dibatalkan: offline`);
    throw new ApiError("OFFLINE", "Tidak ada koneksi internet");
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (modeSimulasi !== "normal") headers["X-Simulasi"] = modeSimulasi;

  // ---- 2. Interceptor: tambahkan token ----
  if (pakaiToken) {
    const token = await bacaAman(KEY.token);
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  console.log(`[MyDuro] ${method} ${path}${headers.Authorization ? " (Authorization: Bearer " + headers.Authorization.slice(7, 20) + "...)" : ""}`);

  // ---- 3. Timeout dengan AbortController ----
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), batasWaktuMs);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (e) {
    if (controller.signal.aborted) {
      console.log(`[MyDuro] TIMEOUT ${path} (> ${batasWaktuMs / 1000} detik)`);
      throw new ApiError("TIMEOUT", "Request timed out");
    }
    // Request gagal tanpa response: cek ulang apakah penyebabnya koneksi internet
    const cek = await NetInfo.fetch();
    const tanpaNavigatorOnline = typeof navigator !== "undefined" && (navigator as { onLine?: boolean }).onLine === false;
    if (cek.isConnected === false || tanpaNavigatorOnline) {
      console.log(`[MyDuro] ${path} gagal: offline`);
      throw new ApiError("OFFLINE", "Tidak ada koneksi internet");
    }
    console.log(`[MyDuro] Network request failed ${path}`);
    throw new ApiError("NETWORK", "Network request failed");
  } finally {
    clearTimeout(timer);
  }

  const data = await response.json().catch(() => ({}));
  console.log(`[MyDuro] Response ${response.status} ${path}`);

  // ---- 4. Periksa status code ----
  if (!response.ok) {
    // Token tidak ada / salah / kedaluwarsa / sudah logout -> keluar dari aplikasi
    if (response.status === 401 && pakaiToken) saatTidakSah?.();
    throw new ApiError("HTTP", data.message ?? `HTTP ${response.status}`, response.status);
  }
  return data as T;
}
