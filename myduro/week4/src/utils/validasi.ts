// =============================================
// MODUL 3 (Sprint 02) - VALIDASI CREDENTIAL
// Validasi dilakukan SEBELUM authentication:
// input kosong / format salah ditolak lebih dulu,
// sehingga pengguna dapat pesan yang jelas.
// Setiap fungsi mengembalikan "" jika valid, atau pesan error.
// =============================================

const POLA_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validasiEmail(email: string): string {
  if (email.trim() === "") return "Email wajib diisi.";
  if (!POLA_EMAIL.test(email.trim())) return "Format email tidak valid.";
  return "";
}

export function validasiPassword(password: string): string {
  if (password === "") return "Password wajib diisi.";
  if (password.length < 6) return "Password minimal 6 karakter.";
  return "";
}

export function validasiNama(nama: string): string {
  if (nama.trim() === "") return "Nama lengkap wajib diisi.";
  if (nama.trim().length < 3) return "Nama minimal 3 huruf.";
  return "";
}

export function validasiLogin(email: string, password: string): string {
  if (email.trim() === "" || password === "") return "Email dan password wajib diisi.";
  return validasiEmail(email) || validasiPassword(password);
}

export function validasiRegister(
  nama: string,
  email: string,
  password: string,
  konfirmasi: string
): string {
  const error = validasiNama(nama) || validasiEmail(email) || validasiPassword(password);
  if (error) return error;
  if (password !== konfirmasi) return "Konfirmasi password tidak sama.";
  return "";
}
