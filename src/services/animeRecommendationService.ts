import * as cheerio from 'cheerio';
import { AnimeListItem } from '@/types/anime';
import { parseOngoingAnimeList } from './animeParser';
import { parseCompleteAnimeList, parseGenreAnimeList } from './animeCatalogParser';
import { enrichRecentEpisodes } from './animeEnrichService';
import { getOngoingAnime } from './animeService';
import { fetchHtml, findLastPage, pagedPath } from './animeSource';

const TOP_RATED_LIMIT = 15;
const GENRE_LIMIT = 12;
const CLASSIC_PAGES = 8;

const GENRES = [
  { slug: 'action', label: 'Action' },
  { slug: 'romance', label: 'Romance' },
  { slug: 'comedy', label: 'Comedy' },
  { slug: 'fantasy', label: 'Fantasy' },
  { slug: 'isekai', label: 'Isekai' },
];

export interface AnimeRecommendationGroup {
  key: string;
  label: string;
  /** True jika urutan daftar berarti peringkat (3 teratas diberi tag HOT). */
  ranked: boolean;
  animes: AnimeListItem[];
}

async function loadPage(path: string, parse: ($: cheerio.CheerioAPI) => AnimeListItem[]) {
  const html = await fetchHtml(path);
  return html ? parse(cheerio.load(html)) : [];
}

const completePagePath = (page: number): string => pagedPath('complete-anime', page);

function dedupeBySlug(animes: AnimeListItem[]): AnimeListItem[] {
  const seen = new Set<string>();
  return animes.filter((anime) => !seen.has(anime.slug) && seen.add(anime.slug));
}

/** Skor valid berada di 0-10; nilai lain (mis. "2025") adalah data sumber yang rusak. */
function ratingOf(anime: AnimeListItem): number {
  const value = anime.rating ? parseFloat(anime.rating) : NaN;
  return Number.isNaN(value) || value <= 0 || value > 10 ? -1 : value;
}

function sortByRating(animes: AnimeListItem[]): AnimeListItem[] {
  return [...animes].sort((a, b) => ratingOf(b) - ratingOf(a));
}

async function getLatestGroup(): Promise<AnimeRecommendationGroup> {
  const [firstPage, secondPage] = await Promise.all([
    getOngoingAnime(),
    loadPage('/ongoing-anime/page/2/', parseOngoingAnimeList).then(enrichRecentEpisodes),
  ]);
  return { key: 'terbaru', label: 'Terbaru', ranked: false, animes: dedupeBySlug([...firstPage, ...secondPage]) };
}

async function getTopRatedGroup(): Promise<AnimeRecommendationGroup> {
  const pages = await Promise.all(
    [1, 2, 3].map((page) =>
      loadPage(page > 1 ? `/complete-anime/page/${page}/` : '/complete-anime/', parseCompleteAnimeList)
    )
  );
  const animes = sortByRating(dedupeBySlug(pages.flat())).slice(0, TOP_RATED_LIMIT);
  return { key: 'rating', label: 'Rating Tertinggi', ranked: true, animes };
}

/**
 * Anime lama: halaman-halaman paling ujung daftar anime tamat berisi judul lama.
 * Tanggal di listing adalah tanggal posting situs, bukan tahun rilis, jadi tidak ditampilkan.
 */
async function getClassicGroup(): Promise<AnimeRecommendationGroup> {
  const firstPageHtml = await fetchHtml(completePagePath(1));
  const lastPage = firstPageHtml ? findLastPage(firstPageHtml, 'complete-anime') : 1;
  const pageNumbers = Array.from({ length: CLASSIC_PAGES }, (_, i) => lastPage - i).filter((p) => p > 3);

  const pages = await Promise.all(
    pageNumbers.map((page) => loadPage(completePagePath(page), parseCompleteAnimeList))
  );
  const animes = sortByRating(dedupeBySlug(pages.flat()))
    .slice(0, TOP_RATED_LIMIT)
    .map((anime) => ({ ...anime, updatedLabel: undefined }));
  return { key: 'lama', label: 'Anime Lama', ranked: false, animes };
}

async function getGenreGroup(genre: (typeof GENRES)[number]): Promise<AnimeRecommendationGroup> {
  const pages = await Promise.all(
    [1, 2].map((page) =>
      loadPage(page > 1 ? `/genres/${genre.slug}/page/${page}/` : `/genres/${genre.slug}/`, parseGenreAnimeList)
    )
  );
  const animes = sortByRating(dedupeBySlug(pages.flat())).slice(0, GENRE_LIMIT);
  return { key: genre.slug, label: genre.label, ranked: false, animes };
}

/** Kelompok rekomendasi anime: terbaru, rating tertinggi, anime lama, dan beberapa genre populer. */
export async function getAnimeRecommendationGroups(): Promise<AnimeRecommendationGroup[]> {
  const groups = await Promise.all([
    getLatestGroup(),
    getTopRatedGroup(),
    getClassicGroup(),
    ...GENRES.map(getGenreGroup),
  ]);
  return groups.filter((group) => group.animes.length > 0);
}
