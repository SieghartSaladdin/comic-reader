import * as cheerio from 'cheerio';
import { cacheLife, cacheTag } from 'next/cache';
import { AnimeListItem, AnimeDetail, AnimeStreamData } from '@/types/anime';
import {
  parseOngoingAnimeList,
  parseSearchAnimeList,
  parseAnimeDetailHtml,
  parseEpisodeStreamHtml,
} from './animeParser';
import { enrichRecentEpisodes } from './animeEnrichService';
import { fetchHtml, fetchHtmlResult } from './animeSource';
import {
  mockOngoingAnime,
  mockAnimeDetailMap,
  mockDefaultStream,
} from '@/data/mockAnime';

/**
 * Setiap fungsi di sini memakai `use cache`: hasil parse disimpan di server, disajikan instan,
 * dan diperbarui di latar setelah `revalidate`. Saat sumber gagal dan data mock dipakai sebagai
 * cadangan, umur cache dibuat sangat pendek (`seconds`) agar data mock tidak menetap.
 */

/**
 * Mengambil daftar anime ongoing terbaru dari otakudesu.blog
 */
export async function getOngoingAnime(): Promise<AnimeListItem[]> {
  'use cache';
  cacheTag('anime-feed');

  // /ongoing-anime/ lebih dulu; halaman depan sebagai cadangan jika strukturnya berbeda.
  for (const path of ['/ongoing-anime/', '/']) {
    const html = await fetchHtml(path);
    const list = html ? parseOngoingAnimeList(cheerio.load(html)) : [];
    if (list.length > 0) {
      const enriched = await enrichRecentEpisodes(list);
      cacheLife('feed');
      return enriched;
    }
  }

  cacheLife('seconds');
  return mockOngoingAnime;
}

/**
 * Mencari anime berdasarkan kata kunci
 */
export async function searchAnime(query: string): Promise<AnimeListItem[]> {
  'use cache';

  const keyword = query?.trim();
  if (!keyword) {
    cacheLife('minutes');
    return [];
  }

  const html = await fetchHtml(`/?s=${encodeURIComponent(keyword)}&post_type=anime`);
  const list = html ? parseSearchAnimeList(cheerio.load(html)) : [];
  if (list.length > 0) {
    const enriched = await enrichRecentEpisodes(list);
    cacheLife('search');
    return enriched;
  }

  // Sumber kosong/gagal: saring dari data mock, tetapi jangan disimpan lama.
  cacheLife('seconds');
  const lower = keyword.toLowerCase();
  return mockOngoingAnime.filter(
    (a) => a.title.toLowerCase().includes(lower) || a.slug.toLowerCase().includes(lower)
  );
}

/**
 * Mengambil detail lengkap anime beserta daftar episodenya
 */
export async function getAnimeDetail(slug: string): Promise<AnimeDetail | null> {
  'use cache';
  cacheTag('anime-detail', `anime-detail:${slug}`);

  if (!slug) {
    cacheLife('minutes');
    return null;
  }

  const { html } = await fetchHtmlResult(slug.startsWith('http') ? slug : `/anime/${slug}/`);
  const detail = html ? parseAnimeDetailHtml(cheerio.load(html), slug) : null;
  if (detail && detail.title) {
    cacheLife('detail');
    return detail;
  }

  // Cadangan dari data mock (sumber gagal/tidak ditemukan): umur cache pendek.
  cacheLife('seconds');

  if (mockAnimeDetailMap[slug]) return mockAnimeDetailMap[slug];

  const mockItem = mockOngoingAnime.find((m) => m.slug === slug);
  if (mockItem) {
    return {
      slug: mockItem.slug,
      title: mockItem.title,
      altTitle: mockItem.title,
      coverImage: mockItem.coverImage,
      score: mockItem.rating || '8.5',
      status: 'Ongoing',
      totalEpisodes: '12',
      duration: '24 min',
      releaseDate: '2026',
      studio: 'Production',
      genres: ['Action', 'Adventure', 'Animation'],
      synopsis: `${mockItem.title} menceritakan petualangan seru penuh aksi yang siap menemani waktu luang Anda.`,
      episodes: [
        {
          slug: `${mockItem.slug}-episode-1`,
          title: `${mockItem.title} Episode 1 Subtitle Indonesia`,
          episodeNumber: 1,
          releaseDate: 'Terbaru',
        },
      ],
    };
  }

  return null;
}

/**
 * Mengambil data stream video dan embed player untuk episode tertentu
 */
export async function getEpisodeStream(
  episodeSlug: string
): Promise<AnimeStreamData | null> {
  'use cache';
  cacheTag('anime-episode', `anime-episode:${episodeSlug}`);

  if (!episodeSlug) {
    cacheLife('minutes');
    return null;
  }

  const { html } = await fetchHtmlResult(
    episodeSlug.startsWith('http') ? episodeSlug : `/episode/${episodeSlug}/`
  );
  const streamData = html ? parseEpisodeStreamHtml(cheerio.load(html), episodeSlug) : null;
  if (streamData && streamData.streamUrl) {
    cacheLife('chapter');
    return streamData;
  }

  // Cadangan (sumber gagal): umur cache pendek.
  cacheLife('seconds');
  const fallbackTitle = episodeSlug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    ...mockDefaultStream,
    episodeTitle: fallbackTitle,
    iframeUrl:
      mockDefaultStream.iframeUrl ||
      `/api/anime/stream-proxy?url=${encodeURIComponent(mockDefaultStream.streamUrl)}`,
  };
}
