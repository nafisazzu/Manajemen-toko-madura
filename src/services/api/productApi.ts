import type { ProductDTO } from '@/types/api';
import { request } from './apiClient';

/**
 * Endpoint produk di REST API. Setiap fungsi mewakili satu HTTP method.
 * Fungsi di sini hanya mengirim/menerima DTO (data mentah server);
 * pemetaan ke model aplikasi dilakukan di utils/productMapper.ts.
 */
export const productApi = {
  /** GET /products — mengambil semua produk */
  getAll: () => request<ProductDTO[]>('GET', '/products'),

  /** GET /products/:id — mengambil satu produk */
  getById: (id: string | number) => request<ProductDTO>('GET', `/products/${id}`),

  /** POST /products — membuat produk baru */
  create: (data: Omit<ProductDTO, 'id'>) => request<ProductDTO>('POST', '/products', data),

  /** PUT /products/:id — mengganti seluruh data produk */
  replace: (id: string | number, data: ProductDTO) => request<ProductDTO>('PUT', `/products/${id}`, data),

  /** PATCH /products/:id — mengubah sebagian field, misalnya stok */
  update: (id: string | number, data: Partial<ProductDTO>) =>
    request<ProductDTO>('PATCH', `/products/${id}`, data),

  /** DELETE /products/:id — menghapus produk */
  remove: (id: string | number) => request<null>('DELETE', `/products/${id}`),
};
