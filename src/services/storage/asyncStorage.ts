import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  PRODUCTS: '@toko_madura:products',
  TRANSACTIONS: '@toko_madura:transactions',
  RESTOCKS: '@toko_madura:restocks',
  CURRENT_USER: '@toko_madura:current_user',
  SEEDED: '@toko_madura:is_seeded_v1',
};

export async function getItem<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null || raw === undefined) {
      return defaultValue;
    }
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`[AsyncStorage] Error reading key "${key}":`, error);
    return defaultValue;
  }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    const raw = JSON.stringify(value);
    await AsyncStorage.setItem(key, raw);
  } catch (error) {
    console.error(`[AsyncStorage] Error saving key "${key}":`, error);
    throw error;
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`[AsyncStorage] Error removing key "${key}":`, error);
  }
}

export async function clearAll(): Promise<void> {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('[AsyncStorage] Error clearing storage:', error);
  }
}
