const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

/**
 * Format tanggal: "23 September 2026"
 */
export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    const day = d.getDate();
    const month = MONTH_NAMES[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return isoString;
  }
}

/**
 * Format tanggal lengkap dengan hari: "Rabu, 23 September 2026"
 */
export function formatDateWithDay(isoString: string): string {
  try {
    const d = new Date(isoString);
    const dayName = DAY_NAMES[d.getDay()];
    return `${dayName}, ${formatDate(isoString)}`;
  } catch {
    return isoString;
  }
}

/**
 * Format tanggal & jam: "23 Sep 2026, 17:40"
 */
export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    const day = d.getDate();
    const month = MONTH_NAMES[d.getMonth()].slice(0, 3);
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  } catch {
    return isoString;
  }
}

/**
 * Format jam saja: "17:40"
 */
export function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch {
    return isoString;
  }
}

/**
 * Mengembalikan tanggal hari ini dalam format YYYY-MM-DD
 */
export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Mengembalikan bulan saat ini dalam format YYYY-MM
 */
export function getCurrentMonthString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
}
