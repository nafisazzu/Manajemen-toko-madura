// =============================================
// MODUL 7 (Sprint 06) - PROSES DATA SENSOR
// Raw data (g) -> filter/transform -> data yang siap dipakai UI & logika
// Dipisah dari komponen agar mudah diuji dan dijelaskan.
// =============================================

export const GRAVITASI = 9.81; // 1 g = 9.81 m/s²
export const AMBANG_GOYANG = 1.8; // magnitude (g). Diam ≈ 1 g, goyangan kuat > 1.8 g
export const JEDA_GOYANG_MS = 3000; // satu goyangan tidak memicu aksi berkali-kali

export interface DataSensor {
  x: number;
  y: number;
  z: number;
}

// expo-sensors memberi nilai dalam g -> ubah ke m/s² (satuan di slide)
export function keMeterPerDetik(raw: DataSensor): DataSensor {
  return { x: raw.x * GRAVITASI, y: raw.y * GRAVITASI, z: raw.z * GRAVITASI };
}

// Magnitude = panjang vektor percepatan = √(x² + y² + z²)
// Saat HP diam nilainya ≈ 1 g karena gravitasi bumi.
export function hitungMagnitude(raw: DataSensor): number {
  return Math.sqrt(raw.x * raw.x + raw.y * raw.y + raw.z * raw.z);
}

// Threshold: goyangan dianggap terjadi jika magnitude melewati ambang
// dan sudah lewat masa jeda dari goyangan sebelumnya.
export function apakahGoyang(magnitude: number, sekarang: number, terakhirGoyang: number): boolean {
  return magnitude > AMBANG_GOYANG && sekarang - terakhirGoyang > JEDA_GOYANG_MS;
}
