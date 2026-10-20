import * as cheerio from 'cheerio';
import { ComicListItem } from '@/types/comic';
import { createTtlCache } from '@/utils/ttlCache';
import { withTimeout } from '@/utils/withTimeout';
import { parseComicDetailHtml } from './komikParser';

const BASE_URL = 'https://komikindo.ch';
const CONCURRENCY = 8;
const FETCH_TIMEOUT_MS = 8000;
const CACHE_TTL_MS = 5 * 60 * 1000;

const FETCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
};

type RecentChapters = NonNullable<ComicListItem['recentChapters']>;

// Simpan hasil parse (bukan HTML) agar halaman detail yang besar tidak di-parse ulang tiap request.
const recentChaptersCache = createTtlCache<RecentChapters>(CACHE_TTL_MS);

async function fetchRecentChapters(slug: string): Promise<RecentChapters | null> {
  const cached = recentChaptersCache.get(slug);
  if (cached) return cached;

  try {
    const res = await withTimeout(
      fetch(`${BASE_URL}/komik/${slug}/`, {
        headers: FETCH_HEADERS,
        next: { revalidate: 1800 },
      }),
      FETCH_TIMEOUT_MS
    );
    if (!res.ok) return null;

    const $ = cheerio.load(await res.text());
    const recent = parseComicDetailHtml($, slug)?.recentChapters?.map((ch) => ({
      ...ch,
      title: ch.title.replace(/^Chapter\s*/i, 'Ch. '),
    }));
    if (!recent || recent.length === 0) return null;

    recentChaptersCache.set(slug, recent);
    return recent;
  } catch {
    return null;
  }
}

/**
 * Listing komikindo hanya memuat 1 chapter per kartu. Lengkapi dengan 2 chapter
 * terbaru asli dari halaman detail (di-cache) untuk kartu yang belum punya 2 chapter.
 */
export async function enrichRecentChapters(
  comics: ComicListItem[]
): Promise<ComicListItem[]> {
  const result = [...comics];
  const pending = result
    .map((comic, index) => ({ comic, index }))
    .filter(({ comic }) => (comic.recentChapters?.length ?? 0) < 2);

  let cursor = 0;
  const worker = async () => {
    while (cursor < pending.length) {
      const { comic, index } = pending[cursor++];
      const chapters = await fetchRecentChapters(comic.slug);
      if (!chapters || chapters.length === 0) continue;

      result[index] = {
        ...comic,
        recentChapters: chapters.slice(0, 2),
        latestChapter: chapters[0].title,
        latestChapterSlug: chapters[0].slug,
      };
    }
  };

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, pending.length) }, worker));
  return result;
}
