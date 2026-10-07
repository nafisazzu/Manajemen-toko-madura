import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * LOCAL STORAGE (AsyncStorage)
 * Dipakai untuk data yang tidak rahasia dan ukurannya bisa besar:
 * produk, transaksi, barang masuk, daftar akun (password sudah di-hash),
 * dan preferensi seperti "ingat username".
 * Data disimpan sebagai teks JSON biasa (tidak terenkripsi).
 */
export const localStore = {
  async getJSON<T>(key: string, fallback: T): Promise<T> {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },

  async setJSON<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  async getString(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  },

  async setString(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  },

  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },
};
