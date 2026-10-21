import { withTimeout } from '@/utils/withTimeout';

export const KOMIK_BASE_URL = 'https://komikindo.ch';
const FETCH_TIMEOUT_MS = 8000;

const FETCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
};

export interface KomikHtmlResult {
  /** HTML halaman, atau null jika permintaan gagal. */
  html: string | null;
  /** Status HTTP; 0 berarti gagal jaringan atau timeout. */
  status: number;
}

/**
 * Ambil HTML dari komikindo.ch. Path relatif ("/komik/x/") atau URL penuh.
 * Hanya dipanggil dari fungsi `use cache`, jadi tidak memakai cache fetch bawaan.
 */
export async function fetchKomikHtml(target: string): Promise<KomikHtmlResult> {
  const url = target.startsWith('http') ? target : `${KOMIK_BASE_URL}${target}`;

  try {
    const res = await withTimeout(fetch(url, { headers: FETCH_HEADERS }), FETCH_TIMEOUT_MS);
    if (!res.ok) return { html: null, status: res.status };
    return { html: await res.text(), status: res.status };
  } catch {
    return { html: null, status: 0 };
  }
}
