import { ApiError } from '@/types/api';
import { API_BASE_URL, REQUEST_TIMEOUT_MS } from './config';
import { secureStorage } from '@/services/storage/secureStorage';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  /** Lewati penambahan header Authorization (misal untuk endpoint login publik) */
  skipAuth?: boolean;
  /** Menandai permintaan ini adalah percobaan ulang setelah refresh token (mencegah loop tak terhingga) */
  isRetry?: boolean;
  /** Header kustom tambahan jika ada */
  headers?: Record<string, string>;
}

type UnauthorizedHandler = () => void;
const unauthorizedListeners: Set<UnauthorizedHandler> = new Set();

/**
 * Mendaftarkan callback saat terjadi 401 yang tidak bisa dipulihkan.
 * Digunakan oleh AuthContext untuk mereset state user dan mengarahkan kembali ke /login.
 */
export function onUnauthorized(handler: UnauthorizedHandler): () => void {
  unauthorizedListeners.add(handler);
  return () => unauthorizedListeners.delete(handler);
}

export function notifyUnauthorized(): void {
  unauthorizedListeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.warn('[apiClient] Error pada unauthorized handler:', e);
    }
  });
}

/** Mutex untuk memastikan hanya 1 proses refresh token yang berjalan serentak */
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function executeRefreshToken(): Promise<string | null> {
  const refreshToken = await secureStorage.getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    // Coba endpoint refresh token standar (POST /refresh atau POST /auth/refresh)
    const response = await fetch(`${API_BASE_URL}/refresh`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timer));

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const newAccessToken: string | undefined =
      data.accessToken || data.access_token || data.token || data.data?.accessToken;
    const newRefreshToken: string | undefined =
      data.refreshToken || data.refresh_token || data.data?.refreshToken;

    if (!newAccessToken) {
      return null;
    }

    // Simpan token baru di SecureStore
    await secureStorage.setTokens(newAccessToken, newRefreshToken || refreshToken);
    return newAccessToken;
  } catch (err) {
    console.warn('[apiClient] Gagal merefresh token:', err);
    return null;
  }
}

/**
 * Pembungkus fetch() dengan:
 * 1. Penyisipan otomatis header `Authorization: Bearer <token>` dari SecureStore.
 * 2. Penanganan otomatis 401 Unauthorized: mencoba refresh token 1 kali.
 * 3. Jika refresh gagal: hapus token dari SecureStore dan panggil listener logout/redirect.
 */
export async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  // 1. Ambil access token dari SecureStore jika tidak dilewati
  let token: string | null = null;
  if (!options?.skipAuth) {
    token = await secureStorage.getAccessToken();
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(body !== undefined && { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers || {}),
  };

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(
      `Server tidak bisa dihubungi di ${API_BASE_URL}. Pastikan backend/json-server berjalan dan HP satu jaringan dengan laptop.`,
      null,
    );
  } finally {
    clearTimeout(timer);
  }

  // 2. Tangani 401 Unauthorized (Token kadaluarsa atau tidak valid)
  if (response.status === 401) {
    const isAuthEndpoint =
      path.includes('/login') || path.includes('/refresh') || path.includes('/logout');

    // Jika ini adalah percobaan kedua atau endpoint autentikasi itu sendiri, jangan refresh lagi
    if (options?.isRetry || isAuthEndpoint) {
      await secureStorage.clearTokens();
      notifyUnauthorized();
      throw new ApiError('Sesi tidak valid atau telah berakhir (401).', 401);
    }

    // Coba refresh token 1 kali
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = executeRefreshToken().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }

    const newAccessToken = await refreshPromise;

    if (newAccessToken) {
      // Ulangi request asli dengan token baru (isRetry: true mencegah loop)
      return request<T>(method, path, body, {
        ...options,
        isRetry: true,
      });
    } else {
      // Refresh gagal: hapus token dan kirim sinyal ke AuthContext untuk redirect ke login
      await secureStorage.clearTokens();
      notifyUnauthorized();
      throw new ApiError('Sesi login telah berakhir. Silakan masuk kembali.', 401);
    }
  }

  // 3. Tangani error HTTP selain 401
  if (!response.ok) {
    let errorDetail = `Permintaan ${method} ${path} gagal (status ${response.status}).`;
    try {
      const errJson = await response.json();
      if (errJson && (errJson.error || errJson.message)) {
        errorDetail = errJson.error || errJson.message;
      }
    } catch {
      // Abaikan jika body bukan JSON
    }
    throw new ApiError(errorDetail, response.status);
  }

  // 4. Parse response body
  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}
