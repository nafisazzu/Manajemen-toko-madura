// =============================================
// MODUL 4 (Sprint 03) - CONNECT MyDuro TO REST API
// Alur: fetch -> HTTP request -> server -> JSON response
//       -> response.json() -> mapping (DTO) -> state -> UI
// =============================================
import { API_URL } from "../config";
import { ApiResponse, Transaksi, TransaksiDTO } from "../types/transaksi";
import { keTransaksi, keTransaksiBaruDTO } from "../utils/mapper";

// GET /transaksi
export async function ambilDaftarTransaksi(): Promise<Transaksi[]> {
  const response = await fetch(`${API_URL}/transaksi`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  const body: ApiResponse<TransaksiDTO[]> = await response.json();
  console.log(`GET /transaksi -> ${response.status}, ${body.data?.length ?? 0} data`);

  if (!response.ok || !body.data) throw new Error(body.message ?? `HTTP ${response.status}`);

  // Mapping: server data -> model aplikasi
  return body.data.map(keTransaksi);
}

// POST /transaksi
export async function kirimTransaksi(data: Omit<Transaksi, "id" | "tanggal">): Promise<Transaksi> {
  const response = await fetch(`${API_URL}/transaksi`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(keTransaksiBaruDTO(data)),
  });
  const body: ApiResponse<TransaksiDTO> = await response.json();
  console.log(`POST /transaksi -> ${response.status}`);

  if (!response.ok || !body.data) throw new Error(body.message ?? `HTTP ${response.status}`);
  return keTransaksi(body.data);
}
