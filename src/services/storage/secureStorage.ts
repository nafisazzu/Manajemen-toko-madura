import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * ============================================================================
 * SECURE STORAGE (expo-secure-store)
 * ============================================================================
 * ALASAN PEMILIHAN PENYIMPANAN:
 * - JWT Access Token & Refresh Token disimpan di SecureStore karena merupakan
 *   kredensial sensitif. Di Android, data dienkripsi dengan Android Keystore;
 *   di iOS dengan Keychain sistem operasi, sehingga terlindung dari akses
 *   aplikasi lain dan pembacaan backup tidak terenkripsi.
 * - Data non-sensitif (katalog produk, riwayat transaksi, preferensi "ingat
 *   username") disimpan di AsyncStorage karena berukuran lebih besar dan
 *   tidak mengandung rahasia autentikasi.
 *
 * CATATAN PLATFORM:
 * - SecureStore tidak tersedia di web, sehingga pada platform web secara
 *   otomatis menggunakan AsyncStorage sebagai fallback.
 */

const isWeb = Platform.OS === 'web';

const KEY_ACCESS_TOKEN = 'tm_access_token';
const KEY_REFRESH_TOKEN = 'tm_refresh_token';
const KEY_SESSION_USER = 'tm_session_user';

export const secureStorage = {
  /** Menyimpan string mentah berdasarkan key */
  async setItem(key: string, value: string): Promise<void> {
    if (isWeb) return AsyncStorage.setItem(key, value);
    await SecureStore.setItemAsync(key, value);
  },

  /** Mengambil string mentah berdasarkan key */
  async getItem(key: string): Promise<string | null> {
    if (isWeb) return AsyncStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },

  /** Menghapus key dari secure storage */
  async removeItem(key: string): Promise<void> {
    if (isWeb) return AsyncStorage.removeItem(key);
    await SecureStore.deleteItemAsync(key);
  },

  // =================== JWT TOKEN HELPERS ===================

  /** Mengambil JWT access token yang sedang aktif */
  async getAccessToken(): Promise<string | null> {
    return this.getItem(KEY_ACCESS_TOKEN);
  },

  /** Mengambil JWT refresh token */
  async getRefreshToken(): Promise<string | null> {
    return this.getItem(KEY_REFRESH_TOKEN);
  },

  /**
   * Menyimpan JWT access token (dan refresh token jika ada)
   * Disimpan secara eksklusif di SecureStore (bukan AsyncStorage).
   */
  async setTokens(accessToken: string, refreshToken?: string | null): Promise<void> {
    await this.setItem(KEY_ACCESS_TOKEN, accessToken);
    if (refreshToken) {
      await this.setItem(KEY_REFRESH_TOKEN, refreshToken);
    }
  },

  /** Menghapus seluruh token autentikasi (dipanggil saat logout / session expired) */
  async clearTokens(): Promise<void> {
    await this.removeItem(KEY_ACCESS_TOKEN);
    await this.removeItem(KEY_REFRESH_TOKEN);
    await this.removeItem(KEY_SESSION_USER);
  },

  /** Mengambil data user yang sedang login dari secure storage */
  async getUser<T>(): Promise<T | null> {
    const raw = await this.getItem(KEY_SESSION_USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  /** Menyimpan data user yang sedang login di secure storage */
  async setUser<T>(user: T | null): Promise<void> {
    if (!user) {
      await this.removeItem(KEY_SESSION_USER);
      return;
    }
    await this.setItem(KEY_SESSION_USER, JSON.stringify(user));
  },
};
