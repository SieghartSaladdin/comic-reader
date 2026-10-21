import * as cheerio from 'cheerio';
import { cacheLife } from 'next/cache';
import { ComicListItem } from '@/types/comic';
import { parseComicDetailHtml } from './komikParser';
import { fetchKomikHtml } from './komikSource';

const CONCURRENCY = 8;

type RecentChapters = NonNullable<ComicListItem['recentChapters']>;

/**
 * Dua chapter terbaru satu komik dari halaman detail. Di-cache per slug (hasil parse, bukan HTML),
 * sehingga halaman detail yang besar tidak di-parse ulang untuk setiap daftar yang memuatnya.
 */
async function fetchRecentChapters(slug: string): Promise<RecentChapters | null> {
  'use cache';

  const { html } = await fetchKomikHtml(`/komik/${slug}/`);
  if (!html) {
    cacheLife('seconds');
    return null;
  }

  const recent = parseComicDetailHtml(cheerio.load(html), slug)?.recentChapters?.map((ch) => ({
    ...ch,
    title: ch.title.replace(/^Chapter\s*/i, 'Ch. '),
  }));
  if (!recent || recent.length === 0) {
    cacheLife('minutes');
    return null;
  }

  cacheLife('feed');
  return recent;
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
