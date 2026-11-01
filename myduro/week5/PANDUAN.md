# MyDuro — Week 5 (Modul 5 · Sprint 04 — Secure API (JWT))

Folder ini berisi kondisi aplikasi MyDuro **setelah tugas Modul 5 selesai**. Setiap folder week bisa dijalankan sendiri.

## Cara menjalankan

**Terminal 1 — server API:**
```
cd server
npm install
npm start
```

**Terminal 2 — aplikasi:**
```
npm install
npx expo start --go
```
Scan QR dengan Expo Go (HP & laptop satu Wi-Fi).

Jika API tidak terhubung (misalnya pakai `--tunnel`): buat file `.env` berisi `EXPO_PUBLIC_API_URL=http://IP-LAPTOP:3000`, lalu `npx expo start --go -c`.

Pertama kali buka: tekan **Belum punya akun? Daftar**.

## Tugas Modul 5 — Sprint 04: Secure API (JWT)

| Task | Di mana |
|---|---|
| **Task 01 Token authentication** | Server `server/auth.js`: `POST /auth/login` & `/auth/register` → `access_token` (JWT HS256, berlaku 2 jam). Client `services/auth.ts` menyimpan token di SecureStore |
| **Task 02 Attach token to API request** | `services/http.ts` → `apiFetch` = **interceptor**: membaca token & menambah `Authorization: Bearer <token>` di setiap request |
| **Task 03 Protect the session** | Middleware `wajibToken` (server) → `/transaksi` = protected endpoint; logout memanggil `/auth/logout` (token dicabut) + hapus di SecureStore; server balas 401 → aplikasi auto logout dengan pesan |

Lihat isi token di **Profil → Access token (JWT)** (header, payload/claims, masa berlaku). Log console saat demo:
```
[MyDuro] App started
[MyDuro] POST /auth/login → Response 200 → Token saved to SecureStore
[MyDuro] GET /transaksi (Authorization: Bearer eyJhbGciOiJIU...) → Response 200
[MyDuro] Logout → Token deleted from SecureStore
```

**Pertanyaan demo**
1. *Dari mana access token diperoleh?* Response `POST /auth/login` (atau register) setelah server memverifikasi email & password.
2. *Di mana token disimpan?* SecureStore (`auth_token`), bukan AsyncStorage.
3. *Bagaimana token dikirim?* Header `Authorization: Bearer <token>`, ditambahkan otomatis oleh `apiFetch`.
4. *Fungsi Bearer token?* Bukti bahwa pemegang token sudah login; server cukup memverifikasi signature (stateless, tidak perlu menyimpan sesi).
5. *Jika token tidak dikirim?* Server membalas **401 Unauthorized** "Token tidak ada" (uji 4).
6. *Saat logout?* Token dicabut di server (jti masuk daftar hitam) dan dihapus dari HP; token lama ditolak 401 (uji 7).
7. *Kenapa HTTPS?* Token dikirim di setiap request; tanpa HTTPS bisa disadap. Saat praktikum memakai HTTP di jaringan lokal (dev), production wajib HTTPS — `http.ts` memberi peringatan jika build produksi memakai `http://`.
8. *Apa isi JWT?* `header.payload.signature`. Payload hanya di-*encode* base64 (bisa dibaca siapa pun), jadi jangan berisi password. Keamanannya ada di signature yang dibuat dengan secret key server.

---

## Lampiran — Modul 1 (Pekan Demo awal)

### A. Di mana tiap kriteria penilaian berada

**Custom Function & Loop (10%)**
- `hitungTotal` (arrow function), `formatRupiah`, `formatTanggal`, `hitungRingkasan` → `utils/hitung.ts`
- Loop `for` di `hitungRingkasan` (menjumlah penjualan/pembelian)
- Loop `map()` di `index.tsx` untuk menampilkan setiap `TransaksiCard`, dengan `key={trx.id}`

**Type & Array of Objects (10%)**
- `type JenisTransaksi = "penjualan" | "pembelian"` → union type
- `interface Transaksi` → `readonly id`, `catatan?` opsional
- `daftarTransaksi: Transaksi[]` → array of objects

**Inline & External Styles (10%)**
- External: `StyleSheet.create` di `styles/styles.ts`, di-import ke komponen
- Inline: `style={{ ... }}` pada teks selisih (warna berubah untung/rugi), dan `style={[styles.x, { ... }]}` (gabungan) di kartu

### B. Contoh pertanyaan asisten

1. Kenapa `id` pakai `readonly`? → Supaya id tidak bisa diubah setelah objek dibuat.
2. Apa arti `?` di `catatan?` → Properti opsional; transaksi boleh tidak punya catatan.
3. Kalau saya isi `jenis: "retur"`, apa yang terjadi? → Error TypeScript, karena union type hanya menerima `"penjualan"` atau `"pembelian"`.
4. Kenapa `map()` butuh `key`? → Agar React bisa mengenali tiap item walau urutan berubah; tanpa key muncul warning.
5. Bedanya `() => ( )` dan `() => { }`? → `( )` implicit return, `{ }` harus tulis `return`.
6. Kenapa `for` tidak ditulis langsung di dalam `return ( ... )`? → JSX hanya menerima expression, bukan statement.
7. Bedanya `formatRupiah` dan `formatRupiah()`? → Tanpa `()` = merujuk fungsi; dengan `()` = menjalankan.
8. Kapan pakai inline vs external style? → Inline untuk style dinamis/cepat (warna untung/rugi); external untuk style yang rapi & dipakai ulang.
9. Arti `===`? → Perbandingan ketat: nilai DAN tipe harus sama.
10. Apa itu `?:` di `isPenjualan ? "+" : "-"`? → Ternary operator: kondisi ? kalau benar : kalau salah.

### C. Contoh modifikasi live

| Permintaan asisten | Yang diubah |
|---|---|
| Tambah 1 transaksi baru | Tambah objek di `data/transaksi.ts` (sejak Modul 4 tidak dipakai lagi, data dari API) |
| Tambah properti `metodeBayar` | Tambah di `interface Transaksi`, isi di data, tampilkan di `TransaksiCard` |
| Ganti warna tema | Ubah `warna.utama` di `styles.ts` |
| Tampilkan hanya penjualan | `daftarTransaksi.filter((t) => t.jenis === "penjualan").map(...)` |
| Ubah loop `for` jadi `while` | Lihat Modul hal. 39 (`let i = 0; while (i < data.length) {...; i++}`) |
| Ganti `map()` jadi `FlatList` | `import { FlatList }`, props `data`, `keyExtractor`, `renderItem` |
| Tampilkan nomor urut | `map((trx, index) => ...)` lalu tampilkan `index + 1` |
| Ubah format tanggal jadi nama bulan lengkap | Ubah isi array `namaBulan` di `formatTanggal` |

**Catatan:** `FlatList` di dalam `ScrollView` akan memunculkan warning. Kalau diminta pakai FlatList, pindahkan header ke prop `ListHeaderComponent` dan hapus `ScrollView`.
