// =============================================
// MODUL 3 (Sprint 02) - DI MANA DATA DISIMPAN?
//
//  NORMAL DATA    -> AsyncStorage (tidak terenkripsi)
//                    contoh: nama toko, preferensi tampilan
//  SENSITIVE DATA -> Expo SecureStore (terenkripsi: Keychain iOS / Keystore Android)
//                    contoh: token sesi, data akun & credential
// =============================================
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// SecureStore hanya ada di Android/iOS. Saat dibuka di browser (npx expo start --web)
// dipakai localStorage sebagai cadangan — TIDAK aman, hanya untuk preview.
const diWeb = Platform.OS === "web";

// Nama key dikumpulkan di satu tempat supaya tidak salah ketik
export const KEY = {
  // sensitif (SecureStore)
  token: "auth_token",
  user: "auth_user",
  akunLokal: "akun_lokal", // dipakai Sprint 02 (auth lokal, sebelum ada server)
  // biasa (AsyncStorage)
  pengaturan: "pengaturan_myduro",
} as const;

// ---------- Secure storage (data sensitif) ----------
export async function simpanAman(key: string, nilai: string): Promise<void> {
  if (diWeb) return localStorage.setItem(key, nilai);
  await SecureStore.setItemAsync(key, nilai);
}

export async function bacaAman(key: string): Promise<string | null> {
  if (diWeb) return localStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

export async function hapusAman(key: string): Promise<void> {
  if (diWeb) return localStorage.removeItem(key);
  await SecureStore.deleteItemAsync(key);
}

// ---------- Local storage biasa (data tidak sensitif) ----------
export async function simpanBiasa<T>(key: string, nilai: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(nilai));
}

export async function bacaBiasa<T>(key: string): Promise<T | null> {
  const teks = await AsyncStorage.getItem(key);
  return teks ? (JSON.parse(teks) as T) : null;
}

// Dipakai uji keamanan: memastikan TIDAK ADA data sensitif di AsyncStorage
export async function semuaIsiStorageBiasa(): Promise<string> {
  const keys = await AsyncStorage.getAllKeys();
  const pasangan = await AsyncStorage.multiGet(keys);
  return pasangan.map(([k, v]) => `${k}=${v}`).join("\n");
}
