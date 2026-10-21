import * as cheerio from 'cheerio';
import {
  AnimeListItem,
  AnimeDetail,
  AnimeEpisodeItem,
} from '@/types/anime';

export function extractSlugFromUrl(url: string): string {
  if (!url) return '';
  return url.replace(/^https?:\/\/[^\/]+\/(anime|episode)\//, '').replace(/\/+$/, '').trim();
}

export const cleanText = (text: string): string => text.replace(/\s+/g, ' ').trim();

export function sanitizeRelativeTime(timeStr?: string): string {
  if (!timeStr) return '';
  return timeStr
    .replace(/(?:1\s*minggu(?:\s*yang)?\s*lalu|seminggu(?:\s*yang)?\s*lalu)/gi, '7 hari yang lalu')
    .replace(/(\d+)\s*minggu(?:\s*yang)?\s*lalu/gi, (_, n) => `${parseInt(n, 10) * 7} hari yang lalu`)
    .trim();
}

export function parseOngoingAnimeList($: cheerio.CheerioAPI): AnimeListItem[] {
  const list: AnimeListItem[] = [];

  $('.venz ul li').each((_, el) => {
    const $el = $(el);
    const title = cleanText($el.find('.jdlflm, h2').text());
    const link = $el.find('.thumb a, a').attr('href') || '';
    const slug = extractSlugFromUrl(link);
    const coverRaw =
      $el.find('.thumbz img, img').attr('src') ||
      $el.find('img').attr('data-src') ||
      '';
    const cover = coverRaw.trim() ? coverRaw.trim() : '/placeholder-anime.svg';
    const ep = cleanText($el.find('.epz').text());
    const dayRaw = cleanText($el.find('.epztipe').text());
    const day = sanitizeRelativeTime(dayRaw);

    if (title && slug) {
      // Listing hanya memuat episode terbaru; tidak ada data episode sebelumnya
      const match = ep.match(/(\d+)/);
      const baseSlug = slug.replace(/-sub-indo$/, '').replace(/-episode-\d+.*$/, '');
      const epLink = $el.find('a[href*="/episode/"]').attr('href');
      const epSlug = epLink
        ? extractSlugFromUrl(epLink)
        : match
        ? `${baseSlug}-episode-${parseInt(match[1], 10)}-sub-indo`
        : slug;
      const recentEpisodes = [
        {
          title: match ? `Eps. ${parseInt(match[1], 10)}` : ep || 'Eps. Terbaru',
          slug: epSlug,
          releaseTime: day || 'Baru saja',
        },
      ];

      list.push({
        slug,
        title,
        coverImage: cover,
        latestEpisode: ep || undefined,
        releaseDay: day || undefined,
        type: 'TV',
        recentEpisodes,
      });
    }
  });

  return list;
}

export function parseSearchAnimeList($: cheerio.CheerioAPI): AnimeListItem[] {
  const list: AnimeListItem[] = [];

  $('ul.chivsrc li').each((_, el) => {
    const $el = $(el);
    const a = $el.find('h2 a');
    // Hasil pencarian memuat embel-embel "(Episode 1 – 12) Subtitle Indonesia" pada judul.
    const title = cleanText(a.text())
      .replace(/\s*\((?:episode|eps)[^)]*\)/i, '')
      .replace(/\s*(?:subtitle indonesia|sub indo)\s*$/i, '')
      .trim();
    const link = a.attr('href') || '';
    const slug = extractSlugFromUrl(link);
    const coverRaw =
      $el.find('img').attr('src') || $el.find('img').attr('data-src') || '';
    const cover = coverRaw.trim() ? coverRaw.trim() : '/placeholder-anime.svg';
    const setInfo = $el.find('.set').text();

    const scoreMatch = setInfo.match(/Rating\s*:\s*([\d.]+)/i);
    const rating = scoreMatch ? scoreMatch[1] : undefined;

    if (title && slug) {
      list.push({
        slug,
        title,
        coverImage: cover,
        rating,
        type: 'TV',
      });
    }
  });

  return list;
}

export function parseAnimeDetailHtml(
  $: cheerio.CheerioAPI,
  slug: string
): AnimeDetail | null {
  const infoMap: Record<string, string> = {};
  $('.infozin .infozingle p').each((_, el) => {
    const full = cleanText($(el).text());
    const colonIdx = full.indexOf(':');
    if (colonIdx > -1) {
      const key = full.slice(0, colonIdx).trim().toLowerCase();
      const val = full.slice(colonIdx + 1).trim();
      infoMap[key] = val;
    }
  });

  const title =
    infoMap['judul'] ||
    cleanText($('h1.entry-title').text() || $('h1').text()) ||
    slug;
  const altTitle = infoMap['japanese'] || '';
  const score = infoMap['skor'] || 'N/A';
  const status = infoMap['status'] || 'Ongoing';
  const totalEpisodes = infoMap['total episode'] || 'Unknown';
  const duration = infoMap['durasi'] || 'Unknown';
  const releaseDate = infoMap['tanggal rilis'] || '';
  const studio = infoMap['studio'] || 'Unknown';
  const rawGenre = infoMap['genre'] || '';
  const genres = rawGenre
    ? rawGenre.split(',').map((g) => g.trim()).filter(Boolean)
    : [];
  const synopsis = cleanText($('.sinopc').text());
  const coverRaw =
    $('.fotoanime img').attr('src') ||
    $('.thumb img').attr('src') ||
    $('img').first().attr('src') ||
    '';
  const coverImage = coverRaw.trim() ? coverRaw.trim() : '/placeholder-anime.svg';

  const episodes: AnimeEpisodeItem[] = [];
  $('.episodelist ul li').each((i, el) => {
    const $el = $(el);
    const a = $el.find('a');
    const epUrl = a.attr('href') || '';
    const epSlug = extractSlugFromUrl(epUrl);
    const epTitle = cleanText(a.text());
    const date = sanitizeRelativeTime(cleanText($el.find('.zeebr, .episodedate').text()));

    // Entri "[BATCH]" / "Episode 001-025" bertautan URL absolut (/batch/, /lengkap/), bukan episode
    // yang bisa ditonton di aplikasi ini; lewati agar tidak jadi tautan rusak.
    if (epSlug && epTitle && !epSlug.startsWith('http')) {
      const numMatch = epTitle.match(/Episode\s*(\d+)/i);
      const epNum = numMatch ? parseInt(numMatch[1], 10) : i + 1;
      episodes.push({
        slug: epSlug,
        title: epTitle,
        episodeNumber: epNum,
        releaseDate: date || undefined,
      });
    }
  });

  return {
    slug,
    title,
    altTitle,
    coverImage,
    score,
    status,
    totalEpisodes,
    duration,
    releaseDate,
    studio,
    genres,
    synopsis,
    episodes,
  };
}

export { parseEpisodeStreamHtml } from './animeStreamParser';

