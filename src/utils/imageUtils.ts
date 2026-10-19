export const DEFAULT_COMIC_COVER = '/placeholder-comic.svg';
export const DEFAULT_ANIME_COVER = '/placeholder-anime.svg';

/**
 * Returns a safe image URL or fallback placeholder.
 * Ensures an empty string is never returned to an <img src> attribute.
 */
export function getSafeImageUrl(
  url: string | null | undefined,
  fallback: string = DEFAULT_COMIC_COVER
): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return fallback;
  }
  return url.trim();
}
