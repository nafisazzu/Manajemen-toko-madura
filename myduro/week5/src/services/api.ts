// =============================================
// MODUL 4 (Sprint 03) - CONNECT MyDuro TO REST API
// Alur: fetch -> HTTP request -> server -> JSON response
//       -> response.json() -> mapping (DTO) -> state -> UI
// MODUL 5 (Sprint 04) - endpoint /transaksi sekarang PROTECTED:
//       request dikirim lewat apiFetch() yang otomatis
//       menambahkan header Authorization: Bearer <token>
// =============================================
import { apiFetch } from "./http";
import { ApiResponse, Transaksi, TransaksiDTO } from "../types/transaksi";
import { keTransaksi, keTransaksiBaruDTO } from "../utils/mapper";

// GET /transaksi
export async function ambilDaftarTransaksi(): Promise<Transaksi[]> {
  const body = await apiFetch<ApiResponse<TransaksiDTO[]>>("/transaksi");
  // Mapping: server data -> model aplikasi
  return (body.data ?? []).map(keTransaksi);
}

// POST /transaksi
export async function kirimTransaksi(data: Omit<Transaksi, "id" | "tanggal">): Promise<Transaksi> {
  const body = await apiFetch<ApiResponse<TransaksiDTO>>("/transaksi", {
    method: "POST",
    body: keTransaksiBaruDTO(data),
  });
  if (!body.data) throw new Error("Response tidak berisi data");
  return keTransaksi(body.data);
}
