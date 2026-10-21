import { cacheLife, cacheTag } from 'next/cache';
import { buildAnimeTabs, buildComicTabs } from '@/components/recommendation/recommendationMappers';
import { RailTab } from '@/components/recommendation/recommendationTypes';
import { getAnimeRecommendationGroups } from './animeRecommendationService';
import { getFilteredComics } from './komikService';

const COMIC_RAIL_LIMIT = 12;
const COMIC_RAIL_TYPES = [
  { key: 'manhwa', label: 'Manhwa' },
  { key: 'manga', label: 'Manga' },
  { key: 'manhua', label: 'Manhua' },
] as const;

/**
 * Tab rekomendasi dibangun di dalam fungsi ber-cache: pemetaan ke bentuk kartu memakai waktu
 * saat ini (teks "x hari lalu"), yang tidak boleh dihitung langsung saat prerender halaman.
 */

export async function getComicRailTabs(): Promise<RailTab[]> {
  'use cache';
  cacheTag('komik-feed', 'komik-rail');

  const groups = await Promise.all(
    COMIC_RAIL_TYPES.map(async ({ key, label }) => ({
      key,
      label,
      comics: (await getFilteredComics({ type: key, sort: 'popular', limit: COMIC_RAIL_LIMIT })).comics,
    }))
  );

  const tabs = buildComicTabs(groups);
  if (tabs.length > 0) cacheLife('catalog');
  else cacheLife('seconds');
  return tabs;
}

export async function getAnimeRailTabs(): Promise<RailTab[]> {
  'use cache';
  cacheTag('anime-feed', 'anime-rail');

  const tabs = buildAnimeTabs(await getAnimeRecommendationGroups());
  if (tabs.length > 0) cacheLife('catalog');
  else cacheLife('seconds');
  return tabs;
}
