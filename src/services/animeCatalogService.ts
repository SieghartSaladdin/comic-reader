import * as cheerio from 'cheerio';
import { cacheLife, cacheTag } from 'next/cache';
import {
  AnimeCatalogParams,
  AnimeCatalogResult,
  AnimeListItem,
} from '@/types/anime';
import { ANIME_GENRES } from '@/data/animeGenres';
import { parseOngoingAnimeList } from './animeParser';
import { parseCompleteAnimeList, parseGenreAnimeList } from './animeCatalogParser';
import { enrichRecentEpisodes } from './animeEnrichService';
import { searchAnime } from './animeService';
import { fetchHtml, findLastPage, pagedPath } from './animeSource';

const ONGOING = 'ongoing-anime';
const COMPLETE = 'complete-anime';

interface SectionPage {
  animes: AnimeListItem[];
  totalPages: number;
}

const EMPTY_SECTION: SectionPage = { animes: [], totalPages: 1 };

async function loadSection(
  section: string,
  page: number,
  parse: ($: cheerio.CheerioAPI) => AnimeListItem[]
): Promise<SectionPage> {
  const html = await fetchHtml(pagedPath(section, page));
  if (!html) return EMPTY_SECTION;

  const totalPages = Math.max(findLastPage(html, section), page);
  return { animes: parse(cheerio.load(html)), totalPages };
}

const loadOngoing = async (page: number): Promise<SectionPage> => {
  const result = await loadSection(ONGOING, page, parseOngoingAnimeList);
  return { ...result, animes: await enrichRecentEpisodes(result.animes) };
};

const loadComplete = (page: number) => loadSection(COMPLETE, page, parseCompleteAnimeList);

/** Jumlah halaman sebuah section. Di-cache terpisah agar tiap halaman katalog tidak mengambilnya ulang. */
async function getSectionTotalPages(section: string): Promise<number> {
  'use cache';
  cacheTag('anime-catalog');

  const html = await fetchHtml(pagedPath(section, 1));
  if (html) cacheLife('catalog');
  else cacheLife('seconds');
  return html ? findLastPage(html, section) : 1;
}

/** Semua anime: halaman ongoing lebih dulu, disusul halaman anime tamat. */
async function loadAll(page: number): Promise<SectionPage> {
  const [ongoingPages, completePages] = await Promise.all([
    getSectionTotalPages(ONGOING),
    getSectionTotalPages(COMPLETE),
  ]);
  const totalPages = ongoingPages + completePages;

  const result =
    page <= ongoingPages ? await loadOngoing(page) : await loadComplete(page - ongoingPages);
  return { animes: result.animes, totalPages };
}

function toResult(section: SectionPage, page: number): AnimeCatalogResult {
  return {
    animes: section.animes,
    page,
    totalPages: section.totalPages,
    hasNextPage: page < section.totalPages,
  };
}

/** Katalog anime: pencarian judul, filter genre, filter status (semua/ongoing/tamat), dan pagination. */
export async function getAnimeCatalog(params: AnimeCatalogParams): Promise<AnimeCatalogResult> {
  'use cache';
  cacheTag('anime-feed', 'anime-catalog');

  const query = params.query?.trim();
  if (query) {
    const animes = await searchAnime(query);
    cacheLife('search');
    return { animes, page: 1, totalPages: 1, hasNextPage: false };
  }

  const page = Math.max(1, Math.floor(params.page || 1));
  const genre = ANIME_GENRES.find((item) => item.slug === params.genre);

  let result: AnimeCatalogResult;
  if (genre) {
    result = toResult(await loadSection(`genres/${genre.slug}`, page, parseGenreAnimeList), page);
  } else if (params.status === 'ongoing') {
    result = toResult(await loadOngoing(page), page);
  } else if (params.status === 'complete') {
    result = toResult(await loadComplete(page), page);
  } else {
    result = toResult(await loadAll(page), page);
  }

  // Halaman kosong biasanya berarti sumber gagal: jangan disimpan lama.
  if (result.animes.length > 0) cacheLife('catalog');
  else cacheLife('seconds');
  return result;
}
