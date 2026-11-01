// =============================================
// MODUL 5 (Sprint 04) - SECURE REQUEST + "INTERCEPTOR"
// Semua request ke API lewat apiFetch():
//  1. ambil access token dari SecureStore
//  2. tempel otomatis di header  Authorization: Bearer <token>
//  3. jika server membalas 401 -> sesi dianggap berakhir (auto logout)
// Jadi kita tidak perlu menulis header token di setiap pemanggilan API.
// =============================================
import { API_URL } from "../config";
import { KEY, bacaAman } from "./storage";

// Production wajib HTTPS agar token tidak bisa disadap saat dikirim (data in transit)
if (!__DEV__ && API_URL.startsWith("http://")) {
  console.warn("[MyDuro] PERINGATAN: API tanpa HTTPS. Token dapat disadap!");
}

// Dipasang oleh AuthContext: apa yang dilakukan saat token ditolak server
let saatTidakSah: (() => void) | null = null;
export function aturSaatTidakSah(fn: (() => void) | null) {
  saatTidakSah = fn;
}

// Error yang membawa status HTTP (dipakai untuk menampilkan pesan yang tepat)
export class ApiError extends Error {
  constructor(public status: number, pesan: string) {
    super(pesan);
    this.name = "ApiError";
  }
}

interface OpsiRequest {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  pakaiToken?: boolean; // false untuk /auth/login & /auth/register
}

export async function apiFetch<T>(path: string, opsi: OpsiRequest = {}): Promise<T> {
  const { method = "GET", body, pakaiToken = true } = opsi;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  // ---- Interceptor: tambahkan token ----
  if (pakaiToken) {
    const token = await bacaAman(KEY.token);
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  console.log(`[MyDuro] ${method} ${path}${headers.Authorization ? " (Authorization: Bearer " + headers.Authorization.slice(7, 20) + "...)" : ""}`);

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  console.log(`[MyDuro] Response ${response.status} ${path}`);

  if (!response.ok) {
    // Token tidak ada / salah / kedaluwarsa / sudah logout -> keluar dari aplikasi
    if (response.status === 401 && pakaiToken) saatTidakSah?.();
    throw new ApiError(response.status, data.message ?? `HTTP ${response.status}`);
  }
  return data as T;
}
