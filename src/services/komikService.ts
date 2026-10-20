import * as cheerio from 'cheerio';
import { Comic, ComicListItem, ComicPage } from '@/types/comic';
import {
  parseAnimePostList,
  parseComicDetailHtml,
  parseChapterDetailHtml,
  ChapterDetailResult,
} from './komikParser';
import { enrichRecentChapters } from './komikEnrichService';

const BASE_URL = 'https://komikindo.ch';
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const FETCH_HEADERS = {
  'User-Agent': USER_AGENT,
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
};

/**
 * Mengambil daftar komik terpopuler dari komikindo.ch (homepage section populer/hot dengan data chapter lengkap)
 */
export async function getPopularComics(): Promise<ComicListItem[]> {
  try {
    const res = await fetch(`${BASE_URL}/`, {
      headers: FETCH_HEADERS,
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);
    const selector = $('.mangapopuler .animepost').length
      ? '.mangapopuler .animepost'
      : '.listupd:first-of-type .animepost';
    return await enrichRecentChapters(parseAnimePostList($, selector));
  } catch (error) {
    console.error('getPopularComics error:', error);
    return [];
  }
}

/**
 * Mengambil komik dengan rilis chapter terbaru
 */
export async function getLatestComics(): Promise<ComicListItem[]> {
  try {
    const res = await fetch(`${BASE_URL}/komik-terbaru/`, {
      headers: FETCH_HEADERS,
      next: { revalidate: 600 },
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);
    return await enrichRecentChapters(parseAnimePostList($));
  } catch (error) {
    console.error('getLatestComics error:', error);
    return [];
  }
}

/**
 * Mencari komik berdasarkan kata kunci (query)
 */
export async function searchComics(query: string): Promise<ComicListItem[]> {
  if (!query || !query.trim()) return [];

  try {
    const encoded = encodeURIComponent(query.trim());
    const res = await fetch(`${BASE_URL}/?s=${encoded}`, {
      headers: FETCH_HEADERS,
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);
    return await enrichRecentChapters(parseAnimePostList($));
  } catch (error) {
    console.error('searchComics error:', error);
    return [];
  }
}

/**
 * Mengambil detail lengkap komik beserta daftar chapter
 */
export async function getComicDetail(slug: string): Promise<Comic | null> {
  if (!slug) return null;

  try {
    const targetUrl = slug.startsWith('http')
      ? slug
      : `${BASE_URL}/komik/${slug}/`;
    const res = await fetch(targetUrl, {
      headers: FETCH_HEADERS,
      next: { revalidate: 1800 },
    });
    if (!res.ok) return null;

    const html = await res.text();
    const $ = cheerio.load(html);
    return parseComicDetailHtml($, slug);
  } catch (error) {
    console.error(`getComicDetail error for slug "${slug}":`, error);
    return null;
  }
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
  if (!chapterSlug) return null;

  try {
    const targetUrl = chapterSlug.startsWith('http')
      ? chapterSlug
      : `${BASE_URL}/${chapterSlug}/`;
    const res = await fetch(targetUrl, {
      headers: FETCH_HEADERS,
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;

    const html = await res.text();
    const $ = cheerio.load(html);
    return parseChapterDetailHtml($, chapterSlug);
  } catch (error) {
    console.error(`getChapterDetail error for "${chapterSlug}":`, error);
    return null;
  }
}

export {
  getFilteredComics,
  type FilterComicParams,
  type FilterComicResult,
} from './komikFilterService';


