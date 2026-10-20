import * as cheerio from 'cheerio';
import { ComicListItem } from '@/types/comic';
import { parseAnimePostList } from './komikParser';
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

export interface FilterComicParams {
  page?: number;
  genre?: string;
  genres?: string[] | string;
  type?: 'all' | 'manga' | 'manhwa' | 'manhua';
  status?: 'all' | 'Ongoing' | 'Completed' | 'ongoing' | 'completed';
  sort?: 'latest' | 'popular' | 'rating' | 'title' | string;
  /** Batasi jumlah hasil sebelum data chapter dilengkapi (hemat request). */
  limit?: number;
}

export interface FilterComicResult {
  comics: ComicListItem[];
  page: number;
  hasNextPage: boolean;
  totalEstimatedPages: number;
}

function normalizeGenres(genre?: string, genres?: string[] | string): string[] {
  const result: string[] = [];
  if (Array.isArray(genres)) {
    result.push(...genres);
  } else if (typeof genres === 'string' && genres.trim()) {
    result.push(...genres.split(',').map((g) => g.trim()));
  }

  if (genre && genre !== 'all' && genre.trim() && !result.includes(genre.trim())) {
    result.push(genre.trim());
  }

  return result
    .map((g) => g.toLowerCase().replace(/\s+/g, '-'))
    .filter((g) => g && g !== 'all');
}

export function buildFilterUrl(params: FilterComicParams): string {
  const page = Math.max(1, params.page || 1);
  const normalizedGenres = normalizeGenres(params.genre, params.genres);
  const rawType = params.type?.toLowerCase();
  const rawStatus = params.status?.toLowerCase();
  const sort = params.sort || 'latest';

  const isDefaultStatus = !rawStatus || rawStatus === 'all';
  const isDefaultSort = !sort || sort === 'latest';

  // Utamakan URL dengan .lsch jika filter tidak kompleks
  if (isDefaultStatus && isDefaultSort) {
    if (normalizedGenres.length === 0) {
      if (rawType === 'manhwa') {
        const path = page > 1 ? `/manhwa/page/${page}/` : '/manhwa/';
        return new URL(path, BASE_URL).toString();
      }
      if (rawType === 'manga') {
        const path = page > 1 ? `/manga/page/${page}/` : '/manga/';
        return new URL(path, BASE_URL).toString();
      }
      if (rawType === 'manhua') {
        const path = page > 1 ? `/manhua/page/${page}/` : '/manhua/';
        return new URL(path, BASE_URL).toString();
      }
      const path = page > 1 ? `/komik-terbaru/page/${page}/` : '/komik-terbaru/';
      return new URL(path, BASE_URL).toString();
    }

    if (normalizedGenres.length === 1 && (!rawType || rawType === 'all')) {
      const g = normalizedGenres[0];
      const path = page > 1 ? `/genres/${g}/page/${page}/` : `/genres/${g}/`;
      return new URL(path, BASE_URL).toString();
    }
  }

  // Katalog statis /daftar-manga/ untuk filter kustom (multi-genre, status, sort kustom)
  const basePath = page > 1 ? `/daftar-manga/page/${page}/` : '/daftar-manga/';
  const url = new URL(basePath, BASE_URL);

  // Append genre query params
  for (const g of normalizedGenres) {
    url.searchParams.append('genre[]', g);
  }

  // Append type query param
  if (rawType === 'manhwa') url.searchParams.set('type', 'Manhwa');
  else if (rawType === 'manhua') url.searchParams.set('type', 'Manhua');
  else if (rawType === 'manga') url.searchParams.set('type', 'Manga');

  // Append status query param
  if (rawStatus === 'ongoing') url.searchParams.set('status', 'Ongoing');
  else if (rawStatus === 'completed') url.searchParams.set('status', 'Completed');

  // Append order query param
  if (sort === 'popular') url.searchParams.set('order', 'popular');
  else if (sort === 'title') url.searchParams.set('order', 'title');
  else if (sort === 'rating') url.searchParams.set('order', 'popular');
  else url.searchParams.set('order', 'update');

  return url.toString();
}

export async function getFilteredComics(
  params: FilterComicParams
): Promise<FilterComicResult> {
  const page = Math.max(1, params.page || 1);
  const targetUrl = buildFilterUrl(params);

  try {
    const res = await fetch(targetUrl, {
      headers: FETCH_HEADERS,
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return { comics: [], page, hasNextPage: false, totalEstimatedPages: page };
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    let comics = parseAnimePostList($);

    // Local refinement for type if Komikindo didn't filter strictly
    const reqType = params.type?.toLowerCase();
    if (reqType && reqType !== 'all') {
      comics = comics.filter((c) => c.type.toLowerCase() === reqType);
    }

    // Local refinement for rating sort
    if (params.sort === 'rating') {
      comics = [...comics].sort((a, b) => b.rating - a.rating);
    }

    if (params.limit && params.limit > 0) {
      comics = comics.slice(0, params.limit);
    }

    comics = await enrichRecentChapters(comics);

    const hasNextPage =
      $('.pagination .next, .page-numbers.next, a.next, a[rel="next"]').length > 0;

    let totalEstimatedPages = page;
    $('.pagination .page-numbers, .page-numbers, .pagination a, .pagination span').each(
      (_, el) => {
        const txt = $(el).text().trim().replace(/,/g, '');
        const num = parseInt(txt, 10);
        if (!isNaN(num) && num > totalEstimatedPages) {
          totalEstimatedPages = num;
        }
        const href = $(el).attr('href') || '';
        const match = href.match(/\/page\/(\d+)\/?/);
        if (match) {
          const p = parseInt(match[1], 10);
          if (!isNaN(p) && p > totalEstimatedPages) {
            totalEstimatedPages = p;
          }
        }
      }
    );

    if (hasNextPage && totalEstimatedPages <= page) {
      totalEstimatedPages = page + 1;
    }

    return { comics, page, hasNextPage, totalEstimatedPages };
  } catch (error) {
    console.error('getFilteredComics error:', error);
    return { comics: [], page, hasNextPage: false, totalEstimatedPages: 1 };
  }
}
