import * as cheerio from 'cheerio';
import { AnimeListItem } from '@/types/anime';
import { cleanText, extractSlugFromUrl } from './animeParser';

const PLACEHOLDER_COVER = '/placeholder-anime.svg';

function coverOrPlaceholder(raw?: string): string {
  return raw?.trim() ? raw.trim() : PLACEHOLDER_COVER;
}

/** Halaman /complete-anime/: anime tamat dengan rating, jumlah episode, dan tanggal. */
export function parseCompleteAnimeList($: cheerio.CheerioAPI): AnimeListItem[] {
  const list: AnimeListItem[] = [];

  $('.venz ul li').each((_, el) => {
    const $el = $(el);
    const title = cleanText($el.find('.jdlflm, h2').text());
    const slug = extractSlugFromUrl($el.find('.thumb a, a').attr('href') || '');
    if (!title || !slug) return;

    const rating = cleanText($el.find('.epztipe').text()).match(/[\d.]+/)?.[0];

    list.push({
      slug,
      title,
      coverImage: coverOrPlaceholder($el.find('.thumbz img, img').attr('src')),
      rating,
      type: 'TV',
      status: 'Tamat',
      episodeCount: cleanText($el.find('.epz').text()) || undefined,
      updatedLabel: cleanText($el.find('.newnime').text()) || undefined,
    });
  });

  return list;
}

/** Halaman /genres/{slug}/: kartu `.col-anime` dengan genre, studio, dan rating (jika ada). */
export function parseGenreAnimeList($: cheerio.CheerioAPI): AnimeListItem[] {
  const list: AnimeListItem[] = [];

  $('.col-anime').each((_, el) => {
    const $el = $(el);
    const link = $el.find('.col-anime-title a');
    const title = cleanText(link.text());
    const slug = extractSlugFromUrl(link.attr('href') || '');
    if (!title || !slug) return;

    const episodes = cleanText($el.find('.col-anime-eps').text());
    const genres = $el
      .find('.col-anime-genre a')
      .map((__, a) => cleanText($(a).text()))
      .get()
      .filter(Boolean);

    list.push({
      slug,
      title,
      coverImage: coverOrPlaceholder($el.find('.col-anime-cover img').attr('src')),
      rating: cleanText($el.find('.col-anime-rating').text()) || undefined,
      type: 'TV',
      studio: cleanText($el.find('.col-anime-studio').text()) || undefined,
      genres,
      episodeCount: /\d/.test(episodes) ? episodes : undefined,
    });
  });

  return list;
}
