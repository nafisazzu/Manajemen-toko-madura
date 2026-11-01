# MyDuro — Week 2 (Modul 2 · Sprint 01 — UI mobile responsif & inklusif)

Folder ini berisi kondisi aplikasi MyDuro **setelah tugas Modul 2 selesai**. Setiap folder week bisa dijalankan sendiri.

## Cara menjalankan

```
npm install
npx expo start --go
```
Scan QR dengan Expo Go (HP & laptop satu Wi-Fi).

## Tugas Modul 2 — Sprint 01: UI responsif & inklusif

| Task | Di mana |
|---|---|
| **Task 01 Build the Mobile UI** — header, judul, informasi utama, image, button, content section | `app/(tabs)/index.tsx` (Beranda), navigasi bawah `app/(tabs)/_layout.tsx` |
| **Task 02 Responsive** — layar kecil/normal/lebar, portrait/landscape | `hooks/useResponsive.ts` (`useWindowDimensions`), grid 2 kolom & hero di samping saat lebar, `maxWidth` konten, safe area; `app.json` `orientation: "default"` |
| **Task 03 Accessibility** | `accessibilityLabel/Role/Hint/State` di semua tombol & kartu, `accessibilityRole="header"`, touch target ≥ 48 dp, warna teks abu dipergelap (kontras), status tidak hanya lewat warna ("Masuk/Keluar", tanda +/−) |

**Cara uji responsif:** putar HP (landscape), atau buka di tablet/`npx expo start --web` lalu ubah lebar jendela. Ukuran layar terlihat di bawah halaman Profil. **Uji aksesibilitas:** nyalakan TalkBack (Android) / VoiceOver (iOS), sentuh kartu transaksi → terbaca kalimat lengkap.

**Pertanyaan demo & jawaban singkat**
1. *Component apa yang dipakai?* View, Text, Image, Pressable, ScrollView, StyleSheet, Tabs (Expo Router).
2. *Bagaimana layout menyesuaikan layar?* `useWindowDimensions` membaca lebar → breakpoint 360/600 dp menentukan jumlah kolom & posisi hero; Flexbox `flexWrap` + persentase lebar.
3. *Apa yang membuat interface inklusif?* Label screen reader, ukuran sentuh minimal 48 dp, kontras teks, informasi tidak hanya lewat warna, teks bisa membesar mengikuti setting font HP.

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
