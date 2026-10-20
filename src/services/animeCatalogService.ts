import * as cheerio from 'cheerio';
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

/** Semua anime: halaman ongoing lebih dulu, disusul halaman anime tamat. */
async function loadAll(page: number): Promise<SectionPage> {
  const [ongoingFirst, completeFirst] = await Promise.all([
    loadSection(ONGOING, 1, () => []),
    loadSection(COMPLETE, 1, () => []),
  ]);
  const ongoingPages = ongoingFirst.totalPages;
  const totalPages = ongoingPages + completeFirst.totalPages;

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
  const query = params.query?.trim();
  if (query) {
    const animes = await searchAnime(query);
    return { animes, page: 1, totalPages: 1, hasNextPage: false };
  }

  const page = Math.max(1, Math.floor(params.page || 1));
  const genre = ANIME_GENRES.find((item) => item.slug === params.genre);

  if (genre) {
    const section = await loadSection(`genres/${genre.slug}`, page, parseGenreAnimeList);
    return toResult(section, page);
  }

  if (params.status === 'ongoing') return toResult(await loadOngoing(page), page);
  if (params.status === 'complete') return toResult(await loadComplete(page), page);
  return toResult(await loadAll(page), page);
}
