import { ApiError } from '@/types/api';
import { API_BASE_URL, REQUEST_TIMEOUT_MS } from './config';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Pembungkus fetch() bawaan JavaScript.
 * Alur: kirim HTTP request -> server memproses -> terima HTTP response
 * -> cek status code -> response.json() mengubah teks JSON menjadi objek JavaScript.
 */
export async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(
      `Server tidak bisa dihubungi di ${API_BASE_URL}. Pastikan json-server berjalan dan HP satu jaringan dengan laptop.`,
      null,
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw new ApiError(`Permintaan ${method} ${path} gagal (status ${response.status}).`, response.status);
  }

  // DELETE di json-server bisa mengembalikan body kosong.
  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}
