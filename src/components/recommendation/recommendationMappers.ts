import { ComicListItem } from '@/types/comic';
import { AnimeListItem } from '@/types/anime';
import {
  compactRelativeTime,
  indonesianDateToRelative,
  isUpdatedWithinDay,
} from '@/utils/relativeTime';
import { RailItem, RailTab, RailTag } from './recommendationTypes';

const COMIC_COUNTRY: Record<string, string> = {
  Manhwa: 'kr',
  Manga: 'jp',
  Manhua: 'cn',
};

function extractNumber(label?: string): number | null {
  const match = label?.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

const HOT_RANK_LIMIT = 3;

function pickTag(latestNumber: number | null, time: string): RailTag | undefined {
  if (latestNumber !== null && latestNumber <= 3) return 'NEW';
  if (isUpdatedWithinDay(time)) return 'UP';
  return undefined;
}

/** Daftar sudah berurutan populer, jadi 3 teratas yang belum bertag diberi HOT. */
function markHotByRank(items: RailItem[]): RailItem[] {
  return items.map((item, idx) =>
    !item.tag && idx < HOT_RANK_LIMIT ? { ...item, tag: 'HOT' as const } : item
  );
}

export function comicToRailItem(comic: ComicListItem): RailItem {
  const key = comic.slug || comic.id;
  const recent = comic.recentChapters ?? [];
  const latest = recent[0];
  const latestTime = latest?.releaseTime ?? comic.updatedTime ?? '';
  const latestNumber = extractNumber(latest?.title ?? comic.latestChapter);
  // Rating 8.0 adalah nilai default parser saat situs tidak menyediakan rating.
  const rating = comic.rating > 0 && comic.rating !== 8 ? comic.rating : undefined;

  return {
    id: key,
    href: `/comic/${key}`,
    title: comic.title,
    cover: comic.coverImage,
    timeAgo: compactRelativeTime(latestTime),
    country: COMIC_COUNTRY[comic.type],
    tag: pickTag(latestNumber, latestTime),
    rating,
    kind: comic.type,
    status: comic.status,
    latestLabel: latestNumber !== null ? `CH.${latestNumber}` : undefined,
    entries: recent.slice(0, 2).map((ch) => ({
      label: ch.title,
      time: ch.releaseTime,
      href: `/reader/${key}/${ch.slug}`,
    })),
    action: 'read',
  };
}

export function animeToRailItem(anime: AnimeListItem): RailItem {
  const recent = anime.recentEpisodes ?? [];
  const latest = recent[0];
  const detailHref = `/anime/${anime.slug}`;
  const updatedAgo = indonesianDateToRelative(anime.updatedLabel);
  const latestTime = latest?.releaseTime ?? anime.releaseDay ?? updatedAgo;
  const latestNumber = extractNumber(latest?.title ?? anime.latestEpisode);
  const episodeTotal = extractNumber(anime.episodeCount);
  const parsedRating = anime.rating ? parseFloat(anime.rating) : NaN;
  const rating =
    Number.isNaN(parsedRating) || parsedRating <= 0 || parsedRating > 10 ? undefined : parsedRating;

  // Anime tamat/genre tidak punya daftar episode terbaru; tampilkan jumlah episodenya.
  const entries =
    recent.length > 0
      ? recent.slice(0, 2).map((ep) => ({
          label: ep.title,
          time: ep.releaseTime,
          href: `/anime/watch/${ep.slug}`,
        }))
      : anime.episodeCount
      ? [{ label: anime.episodeCount, time: updatedAgo, href: detailHref }]
      : [];

  return {
    id: anime.slug,
    href: detailHref,
    title: anime.title,
    cover: anime.coverImage,
    timeAgo: compactRelativeTime(latestTime),
    country: 'jp',
    tag: pickTag(latestNumber, latestTime),
    rating,
    kind: anime.type || 'TV',
    status: anime.status ?? (recent.length > 0 ? 'Ongoing' : undefined),
    genres: anime.genres?.slice(0, 3),
    studio: anime.studio,
    latestLabel:
      latestNumber !== null
        ? `EPS.${latestNumber}`
        : episodeTotal !== null
        ? `${episodeTotal} EPS`
        : undefined,
    entries,
    action: 'watch',
  };
}

export function buildComicTabs(
  groups: { key: string; label: string; comics: ComicListItem[] }[]
): RailTab[] {
  return groups
    .filter((group) => group.comics.length > 0)
    .map((group) => ({
      key: group.key,
      label: group.label,
      items: markHotByRank(group.comics.map(comicToRailItem)),
    }));
}

export function buildAnimeTabs(
  groups: { key: string; label: string; ranked?: boolean; animes: AnimeListItem[] }[]
): RailTab[] {
  return groups
    .filter((group) => group.animes.length > 0)
    .map((group) => {
      const items = group.animes.map(animeToRailItem);
      return {
        key: group.key,
        label: group.label,
        items: group.ranked ? markHotByRank(items) : items,
      };
    });
}
