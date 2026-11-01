// =============================================
// MODUL 4 (Sprint 03) - ALAMAT REST API
//
// Urutan pemilihan alamat:
// 1. EXPO_PUBLIC_API_URL di file .env (kalau diisi), contoh:
//      EXPO_PUBLIC_API_URL=http://192.168.1.10:3000
// 2. Otomatis: IP laptop yang menjalankan `npx expo start`
//    (HP & laptop harus satu Wi-Fi), port 3000
// 3. http://localhost:3000 (untuk web / emulator iOS)
// =============================================
import Constants from "expo-constants";

const hostLaptop = Constants.expoConfig?.hostUri?.split(":")[0];

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? (hostLaptop ? `http://${hostLaptop}:3000` : "http://localhost:3000");
