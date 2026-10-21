import * as cheerio from 'cheerio';
import { cacheLife, cacheTag } from 'next/cache';
import { Comic, ComicListItem, ComicPage } from '@/types/comic';
import {
  parseAnimePostList,
  parseComicDetailHtml,
  parseChapterDetailHtml,
  ChapterDetailResult,
} from './komikParser';
import { enrichRecentChapters } from './komikEnrichService';
import { fetchKomikHtml } from './komikSource';

/**
 * Setiap fungsi di sini memakai `use cache`: hasil parse (bukan HTML mentah) disimpan di server,
 * disajikan instan, dan diperbarui di latar setelah `revalidate`. Hasil kosong/gagal diberi umur
 * sangat pendek (`seconds`) agar kegagalan sesaat tidak tersimpan lama.
 */

/**
 * Mengambil daftar komik terpopuler dari komikindo.ch (homepage section populer/hot dengan data chapter lengkap)
 */
export async function getPopularComics(): Promise<ComicListItem[]> {
  'use cache';
  cacheTag('komik-feed');

  const { html } = await fetchKomikHtml('/');
  if (!html) {
    cacheLife('seconds');
    return [];
  }

  const $ = cheerio.load(html);
  const selector = $('.mangapopuler .animepost').length
    ? '.mangapopuler .animepost'
    : '.listupd:first-of-type .animepost';
  const comics = await enrichRecentChapters(parseAnimePostList($, selector));

  if (comics.length > 0) cacheLife('feed');
  else cacheLife('seconds');
  return comics;
}

/**
 * Mengambil komik dengan rilis chapter terbaru
 */
export async function getLatestComics(): Promise<ComicListItem[]> {
  'use cache';
  cacheTag('komik-feed');

  const { html } = await fetchKomikHtml('/komik-terbaru/');
  if (!html) {
    cacheLife('seconds');
    return [];
  }

  const comics = await enrichRecentChapters(parseAnimePostList(cheerio.load(html)));
  if (comics.length > 0) cacheLife('feed');
  else cacheLife('seconds');
  return comics;
}

/**
 * Mencari komik berdasarkan kata kunci (query)
 */
export async function searchComics(query: string): Promise<ComicListItem[]> {
  'use cache';

  const keyword = query?.trim();
  if (!keyword) {
    cacheLife('minutes');
    return [];
  }

  const { html } = await fetchKomikHtml(`/?s=${encodeURIComponent(keyword)}`);
  if (!html) {
    cacheLife('seconds');
    return [];
  }

  const comics = await enrichRecentChapters(parseAnimePostList(cheerio.load(html)));
  cacheLife('search');
  return comics;
}

/**
 * Mengambil detail lengkap komik beserta daftar chapter
 */
export async function getComicDetail(slug: string): Promise<Comic | null> {
  'use cache';
  cacheTag('komik-detail', `komik-detail:${slug}`);

  if (!slug) {
    cacheLife('minutes');
    return null;
  }

  const { html, status } = await fetchKomikHtml(slug.startsWith('http') ? slug : `/komik/${slug}/`);
  if (!html) {
    // 404 aman disimpan sebentar; kegagalan jaringan/5xx jangan sampai tersimpan lama.
    if (status === 404) cacheLife('minutes');
    else cacheLife('seconds');
    return null;
  }

  const comic = parseComicDetailHtml(cheerio.load(html), slug);
  if (comic) cacheLife('detail');
  else cacheLife('minutes');
  return comic;
}

/**
 * Mengambil daftar gambar (pages) dari sebuah chapter
 */
export async function getChapterPages(
  chapterSlug: string
): Promise<ComicPage[]> {
  const detail = await getChapterDetail(chapterSlug);
  return detail ? detail.pages : [];
}

/**
 * Mengambil detail chapter termasuk daftar gambar dan navigasi prev/next
 */
export async function getChapterDetail(
  chapterSlug: string
): Promise<ChapterDetailResult | null> {
  'use cache';
  cacheTag('komik-chapter', `komik-chapter:${chapterSlug}`);

  if (!chapterSlug) {
    cacheLife('minutes');
    return null;
  }

  const { html, status } = await fetchKomikHtml(
    chapterSlug.startsWith('http') ? chapterSlug : `/${chapterSlug}/`
  );
  if (!html) {
    if (status === 404) cacheLife('minutes');
    else cacheLife('seconds');
    return null;
  }

  const chapter = parseChapterDetailHtml(cheerio.load(html), chapterSlug);
  if (chapter && chapter.pages.length > 0) cacheLife('chapter');
  else cacheLife('minutes');
  return chapter;
}

export {
  getFilteredComics,
  type FilterComicParams,
  type FilterComicResult,
} from './komikFilterService';
