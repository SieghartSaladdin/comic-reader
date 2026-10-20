import { withTimeout } from '@/utils/withTimeout';

const BASE_URL = 'https://otakudesu.blog';
const REVALIDATE_SECONDS = 900;
const FETCH_TIMEOUT_MS = 8000;

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
};

/** Ambil HTML halaman otakudesu (di-cache Next.js). Null jika gagal atau timeout. */
export async function fetchHtml(path: string): Promise<string | null> {
  try {
    const res = await withTimeout(
      fetch(`${BASE_URL}${path}`, {
        headers: FETCH_HEADERS,
        next: { revalidate: REVALIDATE_SECONDS },
      }),
      FETCH_TIMEOUT_MS
    );
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
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
