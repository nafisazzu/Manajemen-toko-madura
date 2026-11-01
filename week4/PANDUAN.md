# MyDuro — Week 4 (Modul 4 · Sprint 03 — Data modeling + RESTful API)

Folder ini berisi kondisi aplikasi MyDuro **setelah tugas Modul 4 selesai**. Setiap folder week bisa dijalankan sendiri.

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

## Tugas Modul 4 — Sprint 03: Data modeling + RESTful API

| Task | Di mana |
|---|---|
| **Task 01 Model the data** | `types/transaksi.ts`: `TransaksiDTO` (bentuk data server) vs `Transaksi` (model aplikasi), `ApiResponse<T>` |
| **Task 02 Connect to REST API** | `server/index.js` (GET/POST `/transaksi`), `services/api.ts` (fetch → `response.json()`), `config.ts` |
| **Task 03 Display API data** | `utils/mapper.ts` (`keTransaksi`), `context/TransaksiContext.tsx` → Beranda & Riwayat (tarik ke bawah untuk refresh); Tambah transaksi = POST |

Mapping yang terjadi (sengaja dibuat berbeda supaya DTO terlihat gunanya):

| Server (JSON) | Aplikasi |
|---|---|
| `kode: "TRX-001"` | `id` |
| `tanggal_transaksi: "2026-10-09T08:15:00+07:00"` | `tanggal: "2026-10-09"` |
| `nama_barang`, `qty`, `harga_satuan` | `namaBarang`, `jumlah`, `hargaSatuan` |
| `jenis: "JUAL" / "BELI"` | `"penjualan" / "pembelian"` |
| `catatan: null` | `catatan?: undefined` |
| `kasir_id`, `created_at`, `updated_at` | dibuang (tidak dibutuhkan UI) |

**Pertanyaan demo**
1. *Dari mana data berasal?* REST API `GET /transaksi` di server, bukan array statis lagi (`data/transaksi.ts` hanya pembanding).
2. *Endpoint & method?* `GET /transaksi` (ambil), `POST /transaksi` (tambah), `GET /transaksi/:id`.
3. *Bentuk response?* `{ "success": true, "data": [ {...}, ... ] }` (array of objects JSON).
4. *Bagaimana JSON diubah jadi data UI?* `response.json()` → objek JS → `data.map(keTransaksi)` → `setDaftar` → render.
5. *Kenapa perlu DTO/data model?* Nama field server bisa berbeda/berubah; aplikasi hanya bergantung pada model sendiri, field yang tidak perlu dibuang, format (tanggal, jenis) disesuaikan di satu tempat.

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
