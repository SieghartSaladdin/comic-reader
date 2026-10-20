import * as cheerio from 'cheerio';
import {
  Comic,
  Chapter,
  ComicListItem,
} from '@/types/comic';
import {
  cleanTitle,
  parseType,
  parseStatus,
  extractSlugFromUrl,
  sanitizeRelativeTime,
} from './komikParserUtils';
import {
  ChapterDetailResult,
  parseChapterDetailHtml,
} from './komikChapterParser';

export {
  cleanTitle,
  parseType,
  parseStatus,
  extractSlugFromUrl,
  sanitizeRelativeTime,
  type ChapterDetailResult,
  parseChapterDetailHtml,
};

export function parseAnimePostList(
  $: cheerio.CheerioAPI,
  selector: string = '.animepost'
): ComicListItem[] {
  const comics: ComicListItem[] = [];

  $(selector).each((_, el) => {
    const $el = $(el);
    const link = $el.find('a').first().attr('href') || '';
    const slug = extractSlugFromUrl(link);
    if (!slug) return;

    const titleRaw =
      $el.find('.tt h3, .tt h4, .tt, h3, h4').first().text() ||
      $el.find('img').first().attr('title') ||
      '';
    const coverRaw =
      $el.find('img').first().attr('src') ||
      $el.find('img').first().attr('data-src') ||
      '';
    const cover = coverRaw.trim() ? coverRaw.trim() : '/placeholder-comic.svg';
    const typeRaw =
      $el.find('.typeflag').attr('class') ||
      $el.find('.typeflag').text() ||
      '';
    const ratingRaw = $el.find('.rating i, .rtg i, .archiveanime-rating i').text().trim();
    const latestChapLink = $el.find('.lsch a, .ch').first();
    const latestChapTitle = latestChapLink.text().trim();
    const latestChapSlug = extractSlugFromUrl(latestChapLink.attr('href') || '');

    const timeRaw = sanitizeRelativeTime($el.find('.lsch .datech, .datech, .dt').first().text().replace(/\s+/g, ' ').trim());
    const chapLinks = $el.find('.lsch a');
    const chapCount = chapLinks.length;

    const recentChapters: { title: string; slug: string; releaseTime: string }[] = [];
    $el.find('.lsch a').each((idx, a) => {
      if (idx >= 2) return;
      const chTitle = $(a).text().trim();
      const chSlug = extractSlugFromUrl($(a).attr('href') || '');
      const rawDateText = $(a).next('.datech, span').text().trim();
      const dateText = sanitizeRelativeTime(rawDateText) || (idx === 0 ? timeRaw : '');
      if (chSlug && chTitle) {
        recentChapters.push({
          title: chTitle.startsWith('Ch.') || chTitle.startsWith('Chapter') ? chTitle : `Ch. ${chTitle}`,
          slug: chSlug,
          releaseTime: dateText || 'Baru saja',
        });
      }
    });

    comics.push({
      id: slug,
      slug,
      title: cleanTitle(titleRaw),
      coverImage: cover,
      type: parseType(typeRaw),
      rating: parseFloat(ratingRaw) || 8.0,
      status: 'Ongoing',
      latestChapter: latestChapTitle || (recentChapters[0]?.title ?? undefined),
      latestChapterSlug: latestChapSlug || (recentChapters[0]?.slug ?? undefined),
      recentChapters: recentChapters.length > 0 ? recentChapters : undefined,
      updatedTime: timeRaw || (recentChapters[0]?.releaseTime ?? 'Baru saja'),
      updatedChapterCount: chapCount > 1 ? chapCount : undefined,
      source: 'komikindo',
    });
  });

  return comics;
}

export function parseComicDetailHtml($: cheerio.CheerioAPI, slug: string): Comic | null {
  const titleRaw = $('.entry-title, h1').first().text();
  const title = cleanTitle(titleRaw);
  if (!title) return null;

  const coverRaw =
    $('.thumb img').first().attr('src') ||
    $('.thumb img').first().attr('data-src') ||
    '';
  const cover = coverRaw.trim() ? coverRaw.trim() : '/placeholder-comic.svg';

  let altTitle = '';
  let author = 'Unknown';
  let artist = 'Unknown';
  let statusText = 'Ongoing';
  let typeText = 'Manhwa';

  $('.spe span').each((_, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    if (text.startsWith('Judul Alternatif:')) {
      altTitle = text.replace('Judul Alternatif:', '').trim();
    } else if (text.startsWith('Pengarang:')) {
      author = text.replace('Pengarang:', '').trim();
    } else if (text.startsWith('Ilustrator:')) {
      artist = text.replace('Ilustrator:', '').trim();
    } else if (text.startsWith('Status:')) {
      statusText = text.replace('Status:', '').trim();
    } else if (text.startsWith('Jenis Komik:')) {
      typeText = text.replace('Jenis Komik:', '').trim();
    }
  });

  const description =
    $('.entry-content, .sinopsis, .entry-content-single')
      .first()
      .text()
      .replace(/\s+/g, ' ')
      .trim() || 'Tidak ada sinopsis.';

  const ratingRaw =
    $('.rating i, .rtg i, .archiveanime-rating i, .rating-prc .num')
      .first()
      .text()
      .trim();
  const rating = parseFloat(ratingRaw) || 8.5;

  const genres: string[] = [];
  $('.genre-info a, .seriestagenre a').each((_, el) => {
    const genre = $(el).text().trim();
    if (genre && !genres.includes(genre)) genres.push(genre);
  });

  const chapters: Chapter[] = [];
  $('#chapter_list li, .clstyle li, #chapterlist li').each((index, el) => {
    const $el = $(el);
    const link = $el.find('a').first().attr('href') || '';
    const chapSlug = extractSlugFromUrl(link);
    const chapTitle =
      $el.find('.lchx a, a').first().text().trim() || `Chapter ${index + 1}`;
    const chapDate =
      sanitizeRelativeTime($el.find('.dt, .dt a').first().text().trim()) || 'Baru saja';

    const numMatch = chapTitle.match(/(?:chapter|ch\.?)\s*(\d+(?:\.\d+)?)/i);
    const chapterNumber = numMatch
      ? parseFloat(numMatch[1])
      : chapters.length + 1;

    if (chapSlug) {
      chapters.push({
        id: chapSlug,
        slug: chapSlug,
        comicId: slug,
        comicSlug: slug,
        chapterNumber,
        title: chapTitle,
        releaseDate: chapDate,
        pages: [],
      });
    }
  });

  const recentChapters = chapters.length > 0
    ? chapters.slice(0, 2).map((ch, idx) => ({
        title: ch.title.startsWith('Ch.') || ch.title.startsWith('Chapter') ? ch.title : `Ch. ${ch.title}`,
        slug: ch.slug,
        releaseTime:
          sanitizeRelativeTime(ch.releaseDate) ||
          (idx === 0 ? 'Baru saja' : sanitizeRelativeTime(chapters[0].releaseDate) || 'Baru saja'),
      }))
    : undefined;

  return {
    id: slug,
    slug,
    title,
    altTitle: altTitle || undefined,
    description,
    coverImage: cover,
    bannerImage: cover,
    author,
    artist,
    status: parseStatus(statusText),
    type: parseType(typeText),
    rating,
    genres,
    chapters,
    latestChapter: chapters[0]?.title,
    latestChapterSlug: chapters[0]?.slug,
    recentChapters,
    updatedTime: chapters[0]?.releaseDate || undefined,
    source: 'komikindo',
  };
}
