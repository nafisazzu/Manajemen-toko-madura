# MyDuro

Aplikasi mobile riwayat transaksi Toko Madura (penjualan & pembelian) — tugas praktikum Pemrograman Mobile, UMM.

**Stack:** React Native + Expo SDK 57 (Expo Router, TypeScript) · server REST API Express + JWT.

## Fitur
- Beranda, Riwayat, Sensor, Profil (navigasi bawah), responsif & aksesibel
- Register/Login dengan JWT, token di SecureStore, endpoint terlindungi
- Data transaksi dari REST API (DTO + mapping), tambah transaksi
- Loading/error/empty/offline/timeout + retry, mode uji API
- Accelerometer: goyang HP untuk sinkronisasi riwayat transaksi

## Menjalankan
```bash
# terminal 1 — server API
cd server && npm install && npm start

# terminal 2 — aplikasi (scan QR dengan Expo Go, satu Wi-Fi dengan laptop)
npm install
npx expo start --go
```

Penjelasan lengkap per modul, pertanyaan demo, dan cara uji: **[PANDUAN.md](PANDUAN.md)**.
