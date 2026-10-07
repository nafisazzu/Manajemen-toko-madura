import { useCallback, useEffect, useState } from "react";
import { productApi } from "@/services/api/productApi";
import { toProdukList } from "@/utils/productMapper";
import { ApiError, ProductDTO, ProdukModel } from "@/types/api";

/**
 * Hook untuk mengambil produk dari REST API dan menyimpannya di state.
 * Bisa dipakai ulang di halaman lain (misalnya halaman transaksi).
 */
export function useApiProducts() {
  const [produk, setProduk] = useState<ProdukModel[]>([]);
  const [rawSample, setRawSample] = useState<ProductDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const dtos = await productApi.getAll(); // 1. request + response JSON
      setRawSample(dtos[0] ?? null); //          (disimpan untuk demo DTO vs model)
      setProduk(toProdukList(dtos)); //          2. mapping DTO -> model
      setLastFetched(new Date());
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal memuat data produk.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    produk,
    rawSample,
    loading,
    refreshing,
    error,
    lastFetched,
    reload: () => load(true),
  };
}
