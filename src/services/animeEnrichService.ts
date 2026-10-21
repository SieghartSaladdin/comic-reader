import * as cheerio from 'cheerio';
import { cacheLife } from 'next/cache';
import { AnimeListItem } from '@/types/anime';
import { indonesianDateToRelative } from '@/utils/relativeTime';
import { parseAnimeDetailHtml } from './animeParser';
import { fetchHtml } from './animeSource';

const CONCURRENCY = 8;

type RecentEpisodes = NonNullable<AnimeListItem['recentEpisodes']>;

/**
 * Dua episode terbaru satu anime dari halaman detail. Di-cache per slug (hasil parse, bukan HTML),
 * sehingga halaman detail yang besar tidak di-parse ulang untuk setiap daftar yang memuatnya.
 */
async function fetchRecentEpisodes(slug: string): Promise<RecentEpisodes | null> {
  'use cache';

  const html = await fetchHtml(`/anime/${slug}/`);
  if (!html) {
    cacheLife('seconds');
    return null;
  }

  const episodes = (parseAnimeDetailHtml(cheerio.load(html), slug)?.episodes ?? [])
    .slice(0, 2)
    .map((ep) => ({
      title: `Eps. ${ep.episodeNumber}`,
      slug: ep.slug,
      releaseTime: indonesianDateToRelative(ep.releaseDate),
    }));
  if (episodes.length === 0) {
    cacheLife('minutes');
    return null;
  }

  cacheLife('feed');
  return episodes;
}

/**
 * Listing otakudesu hanya memuat 1 episode per kartu. Lengkapi dengan 2 episode
 * terbaru asli dari halaman detail (di-cache).
 */
export async function enrichRecentEpisodes(
  animes: AnimeListItem[]
): Promise<AnimeListItem[]> {
  const result = [...animes];
  const pending = result
    .map((anime, index) => ({ anime, index }))
    .filter(({ anime }) => (anime.recentEpisodes?.length ?? 0) < 2);

  let cursor = 0;
  const worker = async () => {
    while (cursor < pending.length) {
      const { anime, index } = pending[cursor++];
      const episodes = await fetchRecentEpisodes(anime.slug);
      if (!episodes || episodes.length === 0) continue;

      result[index] = { ...anime, recentEpisodes: episodes };
    }
  };

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, pending.length) }, worker));
  return result;
}
