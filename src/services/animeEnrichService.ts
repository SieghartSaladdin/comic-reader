import * as cheerio from 'cheerio';
import { AnimeListItem } from '@/types/anime';
import { indonesianDateToRelative } from '@/utils/relativeTime';
import { createTtlCache } from '@/utils/ttlCache';
import { withTimeout } from '@/utils/withTimeout';
import { parseAnimeDetailHtml } from './animeParser';

const BASE_URL = 'https://otakudesu.blog';
const CONCURRENCY = 8;
const FETCH_TIMEOUT_MS = 8000;
const CACHE_TTL_MS = 5 * 60 * 1000;

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
};

type RecentEpisodes = NonNullable<AnimeListItem['recentEpisodes']>;

// Simpan hasil parse (bukan HTML) agar halaman detail yang besar tidak di-parse ulang tiap request.
const recentEpisodesCache = createTtlCache<RecentEpisodes>(CACHE_TTL_MS);

async function fetchRecentEpisodes(slug: string): Promise<RecentEpisodes | null> {
  const cached = recentEpisodesCache.get(slug);
  if (cached) return cached;

  try {
    const res = await withTimeout(
      fetch(`${BASE_URL}/anime/${slug}/`, {
        headers: FETCH_HEADERS,
        next: { revalidate: 1800 },
      }),
      FETCH_TIMEOUT_MS
    );
    if (!res.ok) return null;

    const $ = cheerio.load(await res.text());
    const episodes = (parseAnimeDetailHtml($, slug)?.episodes ?? []).slice(0, 2).map((ep) => ({
      title: `Eps. ${ep.episodeNumber}`,
      slug: ep.slug,
      releaseTime: indonesianDateToRelative(ep.releaseDate),
    }));
    if (episodes.length === 0) return null;

    recentEpisodesCache.set(slug, episodes);
    return episodes;
  } catch {
    return null;
  }
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
