// =============================================
// MODUL 5 (Sprint 04) - MEMBACA ISI JWT
// JWT = header.payload.signature (dipisah titik, base64url)
// Header & payload hanya DI-ENCODE, bukan dienkripsi:
// siapa pun bisa membacanya. Keamanannya ada di SIGNATURE,
// yang hanya bisa dibuat/diverifikasi server dengan secret key.
// =============================================

function decodeBase64Url(bagian: string): string {
  const base64 = bagian.replace(/-/g, "+").replace(/_/g, "/");
  const lengkap = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  // atob tersedia global di React Native (Hermes) dan browser
  return decodeURIComponent(
    Array.from(atob(lengkap))
      .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("")
  );
}

export interface IsiJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

export function bacaJwt(token: string): IsiJwt | null {
  const bagian = token.split(".");
  if (bagian.length !== 3) return null;
  try {
    return {
      header: JSON.parse(decodeBase64Url(bagian[0])),
      payload: JSON.parse(decodeBase64Url(bagian[1])),
      signature: bagian[2],
    };
  } catch {
    return null;
  }
}
