'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ComicPage } from '@/types/comic';
import { cachedFetchJson } from '@/utils/clientCache';

const PRELOAD_IMAGE_COUNT = 3;
const START_AT_PROGRESS = 0.4;

interface ChapterApiResponse {
  success: boolean;
  chapter?: { pages?: ComicPage[] };
}

/**
 * Menyiapkan chapter berikutnya selagi pembaca masih membaca: prefetch rute (RSC), panaskan data
 * chapter di cache, dan muat beberapa gambar pertamanya, sehingga pindah chapter terasa instan.
 */
export function usePrefetchNextChapter(options: {
  comicId: string;
  nextChapterSlug?: string;
  currentPage: number;
  totalPages: number;
}) {
  const { comicId, nextChapterSlug, currentPage, totalPages } = options;
  const router = useRouter();

  const shouldPrefetch =
    Boolean(nextChapterSlug) && totalPages > 0 && currentPage / totalPages >= START_AT_PROGRESS;

  useEffect(() => {
    if (!shouldPrefetch || !nextChapterSlug) return;

    let cancelled = false;
    router.prefetch(`/reader/${comicId}/${nextChapterSlug}`);

    cachedFetchJson<ChapterApiResponse>(`/api/komik/chapter/${encodeURIComponent(nextChapterSlug)}`)
      .then((json) => {
        if (cancelled) return;
        (json.chapter?.pages ?? []).slice(0, PRELOAD_IMAGE_COUNT).forEach((page) => {
          const img = new Image();
          img.decoding = 'async';
          img.src = page.imageUrl;
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [shouldPrefetch, comicId, nextChapterSlug, router]);
}
