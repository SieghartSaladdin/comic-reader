import * as cheerio from 'cheerio';
import { AnimeListItem, AnimeDetail, AnimeStreamData } from '@/types/anime';
import {
  parseOngoingAnimeList,
  parseSearchAnimeList,
  parseAnimeDetailHtml,
  parseEpisodeStreamHtml,
} from './animeParser';
import {
  mockOngoingAnime,
  mockAnimeDetailMap,
  mockDefaultStream,
} from '@/data/mockAnime';

const BASE_URL = 'https://otakudesu.blog';
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

const FETCH_HEADERS = {
  'User-Agent': USER_AGENT,
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
};

/**
 * Mengambil daftar anime ongoing terbaru dari otakudesu.blog
 */
export async function getOngoingAnime(): Promise<AnimeListItem[]> {
  try {
    const res = await fetch(`${BASE_URL}/ongoing-anime/`, {
      headers: FETCH_HEADERS,
      next: { revalidate: 600 },
    });

    if (res.ok) {
      const html = await res.text();
      const $ = cheerio.load(html);
      const list = parseOngoingAnimeList($);
      if (list.length > 0) return list;
    }

    // Fallback ke halaman depan jika /ongoing-anime/ berbeda
    const homeRes = await fetch(BASE_URL, {
      headers: FETCH_HEADERS,
      next: { revalidate: 600 },
    });
    if (homeRes.ok) {
      const html = await homeRes.text();
      const $ = cheerio.load(html);
      const list = parseOngoingAnimeList($);
      if (list.length > 0) return list;
    }

    return mockOngoingAnime;
  } catch (error) {
    console.error('getOngoingAnime error:', error);
    return mockOngoingAnime;
  }
}

/**
 * Mencari anime berdasarkan kata kunci
 */
export async function searchAnime(query: string): Promise<AnimeListItem[]> {
  if (!query || !query.trim()) return [];

  try {
    const encoded = encodeURIComponent(query.trim());
    const res = await fetch(`${BASE_URL}/?s=${encoded}&post_type=anime`, {
      headers: FETCH_HEADERS,
      next: { revalidate: 300 },
    });

    if (res.ok) {
      const html = await res.text();
      const $ = cheerio.load(html);
      const list = parseSearchAnimeList($);
      if (list.length > 0) return list;
    }

    // Filter dari mock jika live search kosong/gagal
    const qLower = query.toLowerCase();
    return mockOngoingAnime.filter(
      (a) =>
        a.title.toLowerCase().includes(qLower) ||
        a.slug.toLowerCase().includes(qLower)
    );
  } catch (error) {
    console.error('searchAnime error:', error);
    return [];
  }
}

/**
 * Mengambil detail lengkap anime beserta daftar episodenya
 */
export async function getAnimeDetail(slug: string): Promise<AnimeDetail | null> {
  if (!slug) return null;

  try {
    const targetUrl = slug.startsWith('http')
      ? slug
      : `${BASE_URL}/anime/${slug}/`;

    const res = await fetch(targetUrl, {
      headers: FETCH_HEADERS,
      next: { revalidate: 1800 },
    });

    if (res.ok) {
      const html = await res.text();
      const $ = cheerio.load(html);
      const detail = parseAnimeDetailHtml($, slug);
      if (detail && detail.title) return detail;
    }

    if (mockAnimeDetailMap[slug]) {
      return mockAnimeDetailMap[slug];
    }

    // Generic fallback detail jika slug tidak cocok
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
  } catch (error) {
    console.error('getAnimeDetail error:', error);
    return mockAnimeDetailMap[slug] || null;
  }
}

/**
 * Mengambil data stream video dan embed player untuk episode tertentu
 */
export async function getEpisodeStream(
  episodeSlug: string
): Promise<AnimeStreamData | null> {
  if (!episodeSlug) return null;

  try {
    const targetUrl = episodeSlug.startsWith('http')
      ? episodeSlug
      : `${BASE_URL}/episode/${episodeSlug}/`;

    const res = await fetch(targetUrl, {
      headers: FETCH_HEADERS,
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const html = await res.text();
      const $ = cheerio.load(html);
      const streamData = parseEpisodeStreamHtml($, episodeSlug);
      if (streamData && streamData.streamUrl) return streamData;
    }

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
  } catch (error) {
    console.error('getEpisodeStream error:', error);
    return mockDefaultStream;
  }
}
