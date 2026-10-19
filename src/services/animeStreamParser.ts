import * as cheerio from 'cheerio';
import { AnimeStreamData, AnimeServerOption } from '@/types/anime';
import { extractSlugFromUrl, cleanText } from './animeParser';

export function parseEpisodeStreamHtml(
  $: cheerio.CheerioAPI,
  episodeSlug: string
): AnimeStreamData | null {
  const episodeTitle = cleanText(
    $('h1.posttl').text() || $('h1').text() || episodeSlug
  );

  let streamUrl =
    $('#embed_holder iframe, .responsive-embed-stream iframe, .responsive-embed iframe, .player-embed iframe, iframe')
      .first()
      .attr('src') || '';

  if (streamUrl.startsWith('//')) {
    streamUrl = 'https:' + streamUrl;
  }

  const servers: AnimeServerOption[] = [];
  if (streamUrl) {
    servers.push({ name: 'DesuStream (Default)', url: streamUrl });
  }

  // Ekstraksi server dari mirrorstream
  $('.mirrorstream ul li a, ul.mserver li a').each((_, el) => {
    const $a = $(el);
    const name = cleanText($a.text());
    const dataContent = $a.attr('data-content') || $a.attr('href') || '';
    if (name && dataContent && dataContent.startsWith('http')) {
      if (!servers.some((s) => s.url === dataContent)) {
        servers.push({ name, url: dataContent });
      }
    }
  });

  // Ekstraksi mirror dan server alternatif dari daftar download (.download li a)
  $('.download li, .download ul li').each((_, el) => {
    const $el = $(el);
    const quality = cleanText($el.find('strong').text());
    $el.find('a').each((_, aEl) => {
      const $a = $(aEl);
      const serverName = cleanText($a.text());
      const linkHref = $a.attr('href') || '';
      if (linkHref && linkHref.startsWith('http')) {
        const label = quality ? `${serverName} (${quality})` : serverName;
        if (!servers.some((s) => s.url === linkHref)) {
          servers.push({ name: label, url: linkHref });
        }
      }
    });
  });

  if (!streamUrl && servers.length > 0) {
    streamUrl = servers[0].url;
  }

  let animeSlug = '';
  let animeTitle = '';
  let prevEpisodeSlug: string | undefined;
  let nextEpisodeSlug: string | undefined;

  $('.flir a, .prevnext a').each((_, el) => {
    const $a = $(el);
    const txt = cleanText($a.text()).toLowerCase();
    const href = $a.attr('href') || '';
    const itemSlug = extractSlugFromUrl(href);

    if (txt.includes('previous') || txt.includes('prev')) {
      prevEpisodeSlug = itemSlug;
    } else if (txt.includes('next')) {
      nextEpisodeSlug = itemSlug;
    } else if (txt.includes('all episode') || href.includes('/anime/')) {
      animeSlug = itemSlug;
      animeTitle = cleanText($a.text());
    }
  });

  if (!animeTitle) {
    animeTitle = episodeTitle.replace(/Episode\s*\d+.*$/i, '').trim();
  }

  const originalUrl = streamUrl;
  const proxiedUrl = originalUrl
    ? `/api/anime/stream-proxy?url=${encodeURIComponent(originalUrl)}`
    : '';

  return {
    episodeTitle,
    animeTitle,
    animeSlug,
    streamUrl: originalUrl,
    iframeUrl: proxiedUrl,
    servers: servers.length > 0 ? servers : undefined,
    prevEpisodeSlug,
    nextEpisodeSlug,
  };
}
