const UNITS: [RegExp, string][] = [
  [/detik/i, 's'],
  [/menit/i, 'm'],
  [/jam/i, 'h'],
  [/hari/i, 'd'],
  [/minggu/i, 'w'],
  [/bulan/i, 'mo'],
  [/tahun/i, 'y'],
];

/** "5 jam yang lalu" -> "5h", "3 hari yang lalu" -> "3d". */
export function compactRelativeTime(text?: string): string {
  if (!text) return '';
  if (/baru saja|hari ini/i.test(text)) return 'Baru';

  const amount = text.match(/(\d+)/)?.[1];
  const unit = UNITS.find(([pattern]) => pattern.test(text))?.[1];
  if (amount && unit) return `${amount}${unit}`;

  return text.trim().slice(0, 3);
}

const MONTH_PREFIXES = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des'];

/**
 * "19 Oktober,2026" atau "14 Okt" (tanpa tahun) -> "3 hari yang lalu".
 * Format tak dikenal dikembalikan apa adanya.
 */
export function indonesianDateToRelative(dateText?: string): string {
  if (!dateText) return '';
  const match = dateText.match(/(\d{1,2})\s+([A-Za-z]+)\s*,?\s*(\d{4})?/);
  const monthIdx = match ? MONTH_PREFIXES.indexOf(match[2].toLowerCase().slice(0, 3)) : -1;
  if (!match || monthIdx < 0) return dateText;

  const now = new Date();
  const date = new Date(match[3] ? Number(match[3]) : now.getFullYear(), monthIdx, Number(match[1]));
  if (!match[3] && date.getTime() > now.getTime()) date.setFullYear(date.getFullYear() - 1);

  const days = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
  if (days <= 0) return 'Hari ini';
  if (days < 7) return `${days} hari yang lalu`;
  if (days < 30) return `${Math.floor(days / 7)} minggu yang lalu`;
  if (days < 365) return `${Math.floor(days / 30)} bulan yang lalu`;
  return `${Math.floor(days / 365)} tahun yang lalu`;
}

/** True jika waktu rilis masih dalam hitungan detik/menit/jam (kurang dari 24 jam). */
export function isUpdatedWithinDay(text?: string): boolean {
  if (!text) return false;
  return /baru saja|hari ini|detik|menit|jam/i.test(text);
}
