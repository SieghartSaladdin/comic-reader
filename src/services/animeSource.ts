import { withTimeout } from '@/utils/withTimeout';

export const ANIME_BASE_URL = 'https://otakudesu.blog';
const FETCH_TIMEOUT_MS = 8000;

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
};

export interface AnimeHtmlResult {
  /** HTML halaman, atau null jika permintaan gagal. */
  html: string | null;
  /** Status HTTP; 0 berarti gagal jaringan atau timeout. */
  status: number;
}

/**
 * Ambil HTML dari otakudesu.blog. Path relatif ("/anime/x/") atau URL penuh.
 * Hanya dipanggil dari fungsi `use cache`, jadi tidak memakai cache fetch bawaan.
 */
export async function fetchHtmlResult(target: string): Promise<AnimeHtmlResult> {
  const url = target.startsWith('http') ? target : `${ANIME_BASE_URL}${target}`;

  try {
    const res = await withTimeout(fetch(url, { headers: FETCH_HEADERS }), FETCH_TIMEOUT_MS);
    if (!res.ok) return { html: null, status: res.status };
    return { html: await res.text(), status: res.status };
  } catch {
    return { html: null, status: 0 };
  }
}

/** Seperti fetchHtmlResult, tetapi hanya mengembalikan HTML (null jika gagal). */
export async function fetchHtml(path: string): Promise<string | null> {
  return (await fetchHtmlResult(path)).html;
}

/** Path listing berhalaman, mis. pagedPath('ongoing-anime', 2) -> /ongoing-anime/page/2/. */
export function pagedPath(section: string, page: number): string {
  return page > 1 ? `/${section}/page/${page}/` : `/${section}/`;
}

/** Nomor halaman terbesar yang tertaut di pagination sebuah section. */
export function findLastPage(html: string, section: string): number {
  const pattern = new RegExp(`${section}/page/(\\d+)/`, 'g');
  const pages = [...html.matchAll(pattern)].map((match) => Number(match[1]));
  return pages.length > 0 ? Math.max(...pages) : 1;
}
