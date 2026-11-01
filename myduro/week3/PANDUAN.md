# MyDuro — Week 3 (Modul 3 · Sprint 02 — Authentication & local data security)

Folder ini berisi kondisi aplikasi MyDuro **setelah tugas Modul 3 selesai**. Setiap folder week bisa dijalankan sendiri.

## Cara menjalankan

```
npm install
npx expo start --go
```
Scan QR dengan Expo Go (HP & laptop satu Wi-Fi).

Pertama kali buka: tekan **Belum punya akun? Daftar**.

## Tugas Modul 3 — Sprint 02: Authentication & local data security

| Task | Di mana |
|---|---|
| **Task 01 Authentication flow** register → login → home | `app/register.tsx`, `app/login.tsx`, `context/AuthContext.tsx`; halaman dilindungi dengan `Stack.Protected` di `app/_layout.tsx` |
| Validasi credential | `utils/validasi.ts` (kosong, format email, password min 6, konfirmasi) |
| **Task 02 Secure the local data** | `services/storage.ts`: **SecureStore** untuk token & sesi (sensitif), **AsyncStorage** untuk pengaturan nama toko/tampilkan catatan (data biasa, `context/PengaturanContext.tsx`) |
| **Task 03 Validate the security** | Profil → **Uji Keamanan** (`app/uji-keamanan.tsx`, `utils/ujiKeamanan.ts`) |

Catatan versi Sprint 02 (lihat commit Modul 3): akun disimpan lokal, password di-hash SHA-256 + salt. Mulai Modul 5, login dipindah ke server (JWT).

**Security test matrix** (hasil versi akhir, semua PASS di HP):

| No | Skenario | Langkah | Diharapkan |
|---|---|---|---|
| 1 | Credential benar | Login email & password valid | LOGIN_SUCCESS |
| 2 | Credential salah | Password salah | LOGIN_FAILED |
| 3 | Input kosong | Login tanpa isi | VALIDATION_ERROR |
| 4 | Request tanpa token *(Modul 5)* | GET /transaksi tanpa header | 401 |
| 5 | Token palsu *(Modul 5)* | GET /transaksi token karangan | 401 |
| 6 | Token valid *(Modul 5)* | GET /transaksi dengan Bearer | 200 |
| 7 | Logout | Logout lalu pakai token lama | SESSION_CLEARED |
| 8 | Sensitive data | Token di SecureStore, bukan AsyncStorage | PROTECTED |

> Jika dibuka di browser (`--web`), uji 8 akan FAIL karena SecureStore diganti localStorage — itu memang benar (web tidak punya secure storage). Demo di HP.

**Pertanyaan demo**
1. *Bagaimana proses login bekerja?* Input → validasi di client → cek credential → simpan token di SecureStore → `status = "masuk"` → `Stack.Protected` membuka halaman aplikasi.
2. *Data apa yang dianggap sensitif?* Token/sesi login dan credential. Nama toko & preferensi tampilan = data biasa.
3. *Di mana data sensitif disimpan?* Expo SecureStore (Keychain iOS / Keystore Android, terenkripsi).
4. *Apa yang terjadi saat logout?* Token & data sesi dihapus (`deleteItemAsync`), status jadi "keluar", otomatis kembali ke login.
5. *Kenapa validasi sebelum authentication?* Mencegah request sia-sia, memberi pesan yang jelas, dan input aneh tidak sampai ke proses cek credential.
6. *Kenapa pesan login gagal tidak menyebut email atau password yang salah?* Supaya penyerang tidak bisa menebak email mana yang terdaftar.

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
