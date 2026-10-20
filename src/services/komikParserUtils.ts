import { ComicType, ComicStatus } from '@/types/comic';

export function cleanTitle(title: string): string {
  return title.replace(/^Komik\s+/i, '').replace(/\s+/g, ' ').trim();
}

export function parseType(text: string): ComicType {
  const lower = text.toLowerCase();
  if (lower.includes('manhwa')) return 'Manhwa';
  if (lower.includes('manhua')) return 'Manhua';
  if (lower.includes('comic') || lower.includes('komik')) return 'Comic';
  return 'Manga';
}

export function parseStatus(text: string): ComicStatus {
  const lower = text.toLowerCase();
  if (lower.includes('tamat') || lower.includes('completed')) return 'Completed';
  return 'Ongoing';
}

export function extractSlugFromUrl(url: string): string {
  if (!url) return '';
  return url
    .replace(/^https?:\/\/[^\/]+\/(komik\/)?/, '')
    .replace(/\/+$/, '')
    .trim();
}

export function sanitizeRelativeTime(timeStr?: string): string {
  if (!timeStr) return '';
  return timeStr
    .replace(/(?:1\s*minggu(?:\s*yang)?\s*lalu|seminggu(?:\s*yang)?\s*lalu)/gi, '7 hari yang lalu')
    .replace(/(\d+)\s*minggu(?:\s*yang)?\s*lalu/gi, (_, n) => `${parseInt(n, 10) * 7} hari yang lalu`)
    .trim();
}
