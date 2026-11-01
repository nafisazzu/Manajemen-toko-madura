# MyDuro — Week 7 (Modul 7 · Sprint 06 — Device sensor)

Folder ini berisi kondisi aplikasi MyDuro **setelah tugas Modul 7 selesai**. Setiap folder week bisa dijalankan sendiri.

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

## Tugas Modul 7 — Sprint 06: Device sensor

Tab **Sensor** (`app/(tabs)/sensor.tsx`) — tema MyDuro: **goyangkan HP untuk menyinkronkan riwayat transaksi**.

| Task | Di mana |
|---|---|
| **Task 01 Connect to sensor** | `expo-sensors` `Accelerometer`: `isAvailableAsync`, permission (layar Izinkan/Tolak, Buka Pengaturan jika ditolak), `addListener`, `setUpdateInterval(100)`; log X/Y/Z di console |
| **Task 02 Display sensor data** | Kartu X/Y/Z (m/s²) real-time + `components/GrafikSensor.tsx` (grafik perubahan nilai) |
| **Task 03 Sensor interaction** | `utils/sensor.ts`: magnitude √(x²+y²+z²) > **1.8 g** → `Vibration.vibrate`, "Goyang Terdeteksi!", `muatUlang()` (GET /transaksi); jeda 3 detik antar goyangan |

Sensor hanya aktif saat tab Sensor dibuka (`useFocusEffect` + `subscription.remove()`), dan bisa dijeda. **Harus diuji di HP**; di browser tab ini menampilkan "tidak didukung" (accelerometer web di expo-sensors SDK 57 belum berfungsi).

**Pertanyaan demo**
1. *Sensor apa yang digunakan?* Accelerometer (percepatan sumbu X, Y, Z).
2. *Fungsinya di MyDuro?* Mendeteksi goyangan untuk sinkronisasi ulang riwayat transaksi dari API, dengan getaran sebagai feedback.
3. *Dari mana data sensor diperoleh?* Hardware → sistem operasi → Sensor API `expo-sensors` → listener → state → UI.
4. *Fungsi Sensor API?* Abstraksi agar aplikasi tidak mengakses hardware langsung, cukup lewat interface yang sama di Android/iOS.
5. *Jika permission ditolak?* Tampil penjelasan + tombol Buka Pengaturan / Coba Lagi; aplikasi tetap berjalan tanpa fitur sensor.
6. *Kenapa nilai berubah real-time?* Listener menerima event setiap 100 ms; setiap data baru memanggil `setData` sehingga UI dirender ulang.
7. *Kenapa saat diam Y ≈ 9.81?* Accelerometer ikut mengukur gravitasi bumi (1 g = 9.81 m/s²). Karena itu ambang goyang dibuat 1.8 g, bukan 0.
8. *Satuan?* expo-sensors memberi nilai dalam g; dikali 9.81 menjadi m/s² (`keMeterPerDetik`).

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
