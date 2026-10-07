import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Menentukan alamat REST API.
 *
 * HP tidak bisa memakai "localhost" karena localhost di HP adalah HP itu sendiri,
 * bukan laptop. Jadi alamat IP laptop diambil otomatis dari alamat Metro (Expo)
 * yang sedang dipakai Expo Go, lalu port diganti ke 3000 (port json-server).
 *
 * Bisa juga ditentukan manual lewat file .env:
 *   EXPO_PUBLIC_API_URL=http://192.168.43.12:3000
 */
const API_PORT = 3000;

function resolveBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `http://${window.location.hostname}:${API_PORT}`;
  }

  // Contoh hostUri: "192.168.43.12:8081"
  const hostUri = Constants.expoConfig?.hostUri ?? '';
  const host = hostUri.split(':')[0];
  return `http://${host || 'localhost'}:${API_PORT}`;
}

export const API_BASE_URL = resolveBaseUrl();
export const REQUEST_TIMEOUT_MS = 8000;
