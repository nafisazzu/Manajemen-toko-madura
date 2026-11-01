# MyDuro — Week 6 (Modul 6 · Sprint 05 — Error handling & offline)

Folder ini berisi kondisi aplikasi MyDuro **setelah tugas Modul 6 selesai**. Setiap folder week bisa dijalankan sendiri.

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

## Tugas Modul 6 — Sprint 05: Error handling & offline

| Task | Di mana |
|---|---|
| **Task 01 Handle API error** | `services/http.ts`: cek `response.ok`, `ApiError` jenis HTTP/TIMEOUT/OFFLINE/NETWORK, `pesanUntukPengguna` (400/401/404/5xx) |
| **Task 02 Loading, error & retry** | `context/TransaksiContext.tsx` (state `idle → loading → success/empty/error`), `components/StatusTampilan.tsx` (indikator loading, pesan, tombol **Coba Lagi**) |
| **Task 03 Handle offline** | NetInfo sebelum request + `components/BannerOffline.tsx`; muat ulang otomatis saat internet kembali |
| Timeout | `AbortController`, batas 10 detik (`BATAS_WAKTU_MS`) |

**Cara demo (tanpa mematikan server):** Profil → **Mode Uji API** → pilih kondisi → buka Riwayat lalu tekan Coba Lagi/tarik ke bawah.

| Mode | Hasil di aplikasi |
|---|---|
| Normal | Data tampil (2xx) |
| Server lambat | "Memuat data..." lalu setelah 10 detik **Waktu habis** + Coba Lagi |
| 500 / 503 | **Gagal memuat data** — kesalahan pada server (5xx) |
| 404 | **Data tidak ditemukan** (4xx) |
| Data kosong | **Belum ada transaksi** (empty state, bukan error) |
| Offline | Banner + **Tidak ada koneksi internet** |

Skenario 2 di slide (offline sungguhan): nyalakan mode pesawat → Riwayat → Coba Lagi (pesan offline) → matikan mode pesawat → data dimuat ulang otomatis. Matikan server (Ctrl+C) → **Server tidak dapat dihubungi**.

**Pertanyaan demo**
1. *Beda HTTP error dan network error?* HTTP error: server menjawab tapi status 4xx/5xx. Network error: tidak ada jawaban sama sekali (offline, server mati, alamat salah).
2. *Fungsi loading state?* Memberi tahu pengguna request sedang berjalan supaya aplikasi tidak terlihat "hang".
3. *Jika API membalas 404?* `response.ok` false → `ApiError("HTTP", …, 404)` → "Data tidak ditemukan".
4. *Jika server membalas 500?* "Terjadi kesalahan pada server (500)" + Coba Lagi; data tidak ditampilkan.
5. *Jika perangkat offline?* Request tidak dikirim, banner + pesan offline, dan otomatis dicoba lagi saat online.
6. *Bagaimana retry bekerja?* Tombol memanggil `muatUlang()` yang mengirim request yang sama dari awal (state kembali loading).

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
