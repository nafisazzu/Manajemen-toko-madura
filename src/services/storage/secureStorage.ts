import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

/**
 * SECURE STORAGE
 * Dipakai untuk data sensitif: token sesi login dan data user yang sedang login.
 * Di Android data dienkripsi dengan Android Keystore, di iOS dengan Keychain,
 * sehingga tidak bisa dibaca aplikasi lain atau dari file backup biasa.
 *
 * SecureStore tidak tersedia di web, jadi di web memakai AsyncStorage sebagai cadangan.
 */
const isWeb = Platform.OS === "web";

export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    if (isWeb) return AsyncStorage.setItem(key, value);
    await SecureStore.setItemAsync(key, value);
  },

  async getItem(key: string): Promise<string | null> {
    if (isWeb) return AsyncStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },

  async removeItem(key: string): Promise<void> {
    if (isWeb) return AsyncStorage.removeItem(key);
    await SecureStore.deleteItemAsync(key);
  },
};
