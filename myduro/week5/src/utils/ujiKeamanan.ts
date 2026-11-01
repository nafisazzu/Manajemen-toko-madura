// =============================================
// UJI KEAMANAN ("Test, don't assume")
// Modul 3: skenario login, input kosong, logout, data sensitif
// Modul 5: + request tanpa token, token palsu, token setelah logout
// Setiap skenario dijalankan, lalu hasil aktual dibandingkan
// dengan hasil yang diharapkan.
// =============================================
import { API_URL } from "../config";
import * as Auth from "../services/auth";
import { KEY, bacaAman, semuaIsiStorageBiasa } from "../services/storage";

export interface HasilUji {
  no: number;
  skenario: string;
  langkah: string;
  diharapkan: string;
  aktual: string;
  lulus: boolean;
}

const AKUN_UJI = { nama: "Akun Uji", email: "uji@myduro.test", password: "rahasia123" };

// fetch langsung (tanpa apiFetch) agar uji 401 tidak memicu auto-logout aplikasi
async function statusRequest(path: string, token?: string, method = "GET"): Promise<number> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const r = await fetch(`${API_URL}${path}`, { method, headers });
  return r.status;
}

export async function jalankanUjiKeamanan(): Promise<HasilUji[]> {
  const hasil: HasilUji[] = [];
  const catat = (h: Omit<HasilUji, "lulus">) => {
    const baris = { ...h, lulus: h.aktual === h.diharapkan };
    hasil.push(baris);
    console.log(`[UJI ${baris.no}] ${baris.skenario}: ${baris.aktual} (${baris.lulus ? "PASS" : "FAIL"})`);
  };

  // Siapkan akun uji di server (jika sudah ada, server membalas 409 -> diabaikan)
  await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(AKUN_UJI),
  });

  // 1. Credential benar
  const r1 = await Auth.mintaToken(AKUN_UJI.email, AKUN_UJI.password);
  catat({ no: 1, skenario: "Credential benar", langkah: "POST /auth/login dengan data valid", diharapkan: "LOGIN_SUCCESS", aktual: r1.ok ? "LOGIN_SUCCESS" : r1.kode });

  // 2. Credential salah
  const r2 = await Auth.mintaToken(AKUN_UJI.email, "passwordsalah");
  catat({ no: 2, skenario: "Credential salah", langkah: "POST /auth/login password salah", diharapkan: "LOGIN_FAILED", aktual: r2.ok ? "LOGIN_SUCCESS" : r2.kode });

  // 3. Input kosong
  const r3 = await Auth.mintaToken("", "");
  catat({ no: 3, skenario: "Input kosong", langkah: "Login tanpa email & password", diharapkan: "VALIDATION_ERROR", aktual: r3.ok ? "LOGIN_SUCCESS" : r3.kode });

  // 4. Request tanpa token
  const s4 = await statusRequest("/transaksi");
  catat({ no: 4, skenario: "Request tanpa token", langkah: "GET /transaksi tanpa Authorization", diharapkan: "401", aktual: String(s4) });

  // 5. Token palsu
  const s5 = await statusRequest("/transaksi", "token.palsu.sekali");
  catat({ no: 5, skenario: "Token palsu", langkah: "GET /transaksi dengan token karangan", diharapkan: "401", aktual: String(s5) });

  // 6. Token valid
  const tokenUji = r1.ok ? r1.sesi.token : "";
  const s6 = await statusRequest("/transaksi", tokenUji);
  catat({ no: 6, skenario: "Token valid", langkah: "GET /transaksi dengan Bearer token", diharapkan: "200", aktual: String(s6) });

  // 7. Logout: token lama harus ditolak
  await statusRequest("/auth/logout", tokenUji, "POST");
  const s7 = await statusRequest("/transaksi", tokenUji);
  catat({ no: 7, skenario: "Logout", langkah: "Logout lalu pakai token lama", diharapkan: "SESSION_CLEARED", aktual: s7 === 401 ? "SESSION_CLEARED" : `TOKEN_MASIH_BERLAKU (${s7})` });

  // 8. Data sensitif: token hanya di SecureStore, tidak ada di AsyncStorage
  const isiBiasa = await semuaIsiStorageBiasa();
  const tokenAman = await bacaAman(KEY.token);
  const bocor = isiBiasa.includes(KEY.token) || (tokenAman !== null && isiBiasa.includes(tokenAman));
  catat({ no: 8, skenario: "Sensitive data", langkah: "Token ada di SecureStore, bukan AsyncStorage", diharapkan: "PROTECTED", aktual: bocor ? "BOCOR" : tokenAman ? "PROTECTED" : "TOKEN_TIDAK_ADA" });

  return hasil;
}
