// =============================================
// MODUL 3 (Sprint 02) - TASK 03: VALIDATE THE SECURITY
// "Test, don't assume": setiap skenario dijalankan dan
// hasil aktual dibandingkan dengan hasil yang diharapkan.
// =============================================
import * as Auth from "../services/authLocal";
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

export async function jalankanUjiKeamanan(): Promise<HasilUji[]> {
  const hasil: HasilUji[] = [];
  const catat = (h: Omit<HasilUji, "lulus">) => {
    const baris = { ...h, lulus: h.aktual === h.diharapkan };
    hasil.push(baris);
    console.log(`[UJI ${baris.no}] ${baris.skenario}: ${baris.aktual} (${baris.lulus ? "PASS" : "FAIL"})`);
  };

  // Siapkan akun uji (jika belum ada). Pakai register tanpa menyimpan sesi:
  // cekCredential dipakai agar sesi pengguna yang sedang login tidak tertimpa.
  const sudahAda = await Auth.cekCredential(AKUN_UJI.email, AKUN_UJI.password);
  if (!sudahAda.ok) {
    const sesiAsli = await Auth.bacaSesi();
    await Auth.register(AKUN_UJI.nama, AKUN_UJI.email, AKUN_UJI.password, AKUN_UJI.password);
    if (sesiAsli) await Auth.simpanSesi(sesiAsli.token, sesiAsli.user); // kembalikan sesi asli
  }

  // 1. Credential benar
  const r1 = await Auth.cekCredential(AKUN_UJI.email, AKUN_UJI.password);
  catat({
    no: 1,
    skenario: "Credential benar",
    langkah: "Login dengan email & password valid",
    diharapkan: "LOGIN_SUCCESS",
    aktual: r1.ok ? "LOGIN_SUCCESS" : r1.kode,
  });

  // 2. Credential salah
  const r2 = await Auth.cekCredential(AKUN_UJI.email, "passwordsalah");
  catat({
    no: 2,
    skenario: "Credential salah",
    langkah: "Login dengan password salah",
    diharapkan: "LOGIN_FAILED",
    aktual: r2.ok ? "LOGIN_SUCCESS" : r2.kode,
  });

  // 3. Input kosong
  const r3 = await Auth.cekCredential("", "");
  catat({
    no: 3,
    skenario: "Input kosong",
    langkah: "Login tanpa email & password",
    diharapkan: "VALIDATION_ERROR",
    aktual: r3.ok ? "LOGIN_SUCCESS" : r3.kode,
  });

  // 4. Logout menghapus session (diuji lalu sesi asli dikembalikan)
  const sesiAsli = await Auth.bacaSesi();
  await Auth.simpanSesi("token-uji", { id: "uji", nama: AKUN_UJI.nama, email: AKUN_UJI.email });
  await Auth.logout();
  const tokenSetelahLogout = await bacaAman(KEY.token);
  if (sesiAsli) await Auth.simpanSesi(sesiAsli.token, sesiAsli.user);
  catat({
    no: 4,
    skenario: "Logout",
    langkah: "Simpan sesi uji lalu logout",
    diharapkan: "SESSION_CLEARED",
    aktual: tokenSetelahLogout === null ? "SESSION_CLEARED" : "TOKEN_MASIH_ADA",
  });

  // 5. Data sensitif tidak bocor ke storage biasa & password tidak plaintext
  const isiBiasa = await semuaIsiStorageBiasa();
  const akunTersimpan = (await bacaAman(KEY.akunLokal)) ?? "";
  const bocor =
    isiBiasa.includes(KEY.token) ||
    isiBiasa.includes(AKUN_UJI.password) ||
    akunTersimpan.includes(AKUN_UJI.password);
  catat({
    no: 5,
    skenario: "Sensitive data",
    langkah: "Cek AsyncStorage & isi akun di SecureStore",
    diharapkan: "PROTECTED",
    aktual: bocor ? "BOCOR" : "PROTECTED",
  });

  return hasil;
}
