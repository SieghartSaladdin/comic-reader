import * as cheerio from 'cheerio';
import { ComicPage } from '@/types/comic';
import { cleanTitle, extractSlugFromUrl } from './komikParserUtils';

export interface ChapterDetailResult {
  slug: string;
  title: string;
  comicSlug?: string;
  comicTitle?: string;
  pages: ComicPage[];
  prevChapterSlug?: string;
  nextChapterSlug?: string;
}

export function parseChapterDetailHtml(
  $: cheerio.CheerioAPI,
  chapterSlug: string
): ChapterDetailResult {
  const titleRaw = $('h1, .entry-title').first().text();
  const title = cleanTitle(titleRaw);

  const pages: ComicPage[] = [];
  $('.chapter-image img, #chimg img, #readerarea img').each((_, el) => {
    const src =
      $(el).attr('src') ||
      $(el).attr('data-src') ||
      $(el).attr('data-lazy-src') ||
      '';

    if (
      src &&
      !src.toLowerCase().endsWith('.gif') &&
      !src.includes('blogger.googleusercontent.com')
    ) {
      pages.push({
        pageNumber: pages.length + 1,
        imageUrl: src,
      });
    }
  });

  const prevHref = $('.nextprev a[rel="prev"]').first().attr('href') || '';
  const nextHref = $('.nextprev a[rel="next"]').first().attr('href') || '';
  const comicHref =
    $('.nextprev a[href*="/komik/"]').first().attr('href') || '';

  return {
    slug: chapterSlug,
    title: title || chapterSlug,
    comicSlug: comicHref ? extractSlugFromUrl(comicHref) : undefined,
    pages,
    prevChapterSlug: prevHref ? extractSlugFromUrl(prevHref) : undefined,
    nextChapterSlug: nextHref ? extractSlugFromUrl(nextHref) : undefined,
  };
}
