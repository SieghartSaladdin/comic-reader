'use client';

import { useState, useEffect, useCallback } from 'react';
import { Comic, Chapter, ComicPage } from '@/types/comic';

interface UseChapterDataReturn {
  comic: Comic | null;
  chapter: Chapter | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

function parseChapterNumber(title: string): number {
  const match = title.match(/(?:chapter|ch\.?)\s*(\d+(?:\.\d+)?)/i);
  return match ? parseFloat(match[1]) : 1;
}

export function useChapterData(
  comicSlug: string,
  chapterSlug: string
): UseChapterDataReturn {
  const [comic, setComic] = useState<Comic | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!chapterSlug) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Fetch chapter detail & pages from KomikIndo API
      const chapterRes = await fetch(`/api/komik/chapter/${encodeURIComponent(chapterSlug)}`);
      if (!chapterRes.ok) {
        throw new Error(`Gagal memuat chapter (${chapterRes.status})`);
      }

      const chapterJson = await chapterRes.json();
      if (!chapterJson.success || !chapterJson.chapter) {
        throw new Error(chapterJson.error || 'Chapter tidak ditemukan');
      }

      const chapterInfo = chapterJson.chapter;
      const pages: ComicPage[] = chapterInfo.pages || chapterJson.data || [];
      const resolvedComicSlug = comicSlug || chapterInfo.comicSlug || 'komik';

      // 2. Fetch full comic detail for navigation & metadata
      let fetchedComic: Comic | null = null;
      try {
        const comicRes = await fetch(`/api/komik/detail/${encodeURIComponent(resolvedComicSlug)}`);
        if (comicRes.ok) {
          const comicJson = await comicRes.json();
          if (comicJson.success && comicJson.data) {
            fetchedComic = comicJson.data;
          }
        }
      } catch (comicErr) {
        console.warn('Could not load full comic detail:', comicErr);
      }

      // If comic detail fetch didn't return, build a lightweight comic object
      const fallbackComic: Comic = fetchedComic || {
        id: resolvedComicSlug,
        slug: resolvedComicSlug,
        title: chapterInfo.title.replace(/Chapter.*/i, '').trim() || resolvedComicSlug,
        description: '',
        coverImage: pages[0]?.imageUrl || '',
        author: 'Unknown',
        artist: 'Unknown',
        status: 'Ongoing',
        type: 'Manhwa',
        rating: 8.0,
        genres: [],
        chapters: [],
        source: 'komikindo',
      };

      const activeChapter: Chapter = {
        id: chapterSlug,
        slug: chapterSlug,
        comicId: resolvedComicSlug,
        comicSlug: resolvedComicSlug,
        chapterNumber: parseChapterNumber(chapterInfo.title),
        title: chapterInfo.title,
        releaseDate: 'Baru saja',
        pages,
        prevChapterSlug: chapterInfo.prevChapterSlug,
        nextChapterSlug: chapterInfo.nextChapterSlug,
      };

      setComic(fallbackComic);
      setChapter(activeChapter);
    } catch (err) {
      console.error('useChapterData error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan saat memuat halaman komik'
      );
    } finally {
      setLoading(false);
    }
  }, [comicSlug, chapterSlug]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { comic, chapter, loading, error, reload: loadData };
}
