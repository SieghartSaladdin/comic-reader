import { cacheLife, cacheTag } from 'next/cache';
import { Chapter, Comic } from '@/types/comic';
import { getChapterDetail, getComicDetail } from './komikService';

export interface ReaderData {
  comic: Comic;
  chapter: Chapter;
}

function parseChapterNumber(title: string): number {
  const match = title.match(/(?:chapter|ch\.?)\s*(\d+(?:\.\d+)?)/i);
  return match ? parseFloat(match[1]) : 1;
}

/**
 * Seluruh data yang dibutuhkan reader (gambar chapter + detail komik untuk navigasi) dalam satu
 * panggilan ber-cache, sehingga halaman reader terkirim lengkap tanpa menunggu fetch dari browser.
 */
export async function getReaderData(
  comicSlug: string,
  chapterSlug: string
): Promise<ReaderData | null> {
  'use cache';
  cacheTag('komik-chapter', `komik-chapter:${chapterSlug}`);

  const chapterInfo = await getChapterDetail(chapterSlug);
  if (!chapterInfo || chapterInfo.pages.length === 0) {
    cacheLife('seconds');
    return null;
  }

  const resolvedComicSlug = comicSlug || chapterInfo.comicSlug || 'komik';
  const fetchedComic = await getComicDetail(resolvedComicSlug);

  // Jika detail komik gagal dimuat, bangun komik ringan dari data chapter.
  const comic: Comic = fetchedComic ?? {
    id: resolvedComicSlug,
    slug: resolvedComicSlug,
    title: chapterInfo.title.replace(/Chapter.*/i, '').trim() || resolvedComicSlug,
    description: '',
    coverImage: chapterInfo.pages[0]?.imageUrl || '',
    author: 'Unknown',
    artist: 'Unknown',
    status: 'Ongoing',
    type: 'Manhwa',
    rating: 8.0,
    genres: [],
    chapters: [],
    source: 'komikindo',
  };

  const listed = comic.chapters.find((ch) => ch.slug === chapterSlug || ch.id === chapterSlug);

  const chapter: Chapter = {
    id: chapterSlug,
    slug: chapterSlug,
    comicId: resolvedComicSlug,
    comicSlug: resolvedComicSlug,
    chapterNumber: listed?.chapterNumber ?? parseChapterNumber(chapterInfo.title),
    title: chapterInfo.title,
    releaseDate: listed?.releaseDate ?? 'Baru saja',
    pages: chapterInfo.pages,
    prevChapterSlug: chapterInfo.prevChapterSlug,
    nextChapterSlug: chapterInfo.nextChapterSlug,
  };

  // Tanpa detail komik, navigasi daftar chapter terbatas: periksa ulang lebih cepat.
  if (fetchedComic) cacheLife('chapter');
  else cacheLife('minutes');
  return { comic, chapter };
}
