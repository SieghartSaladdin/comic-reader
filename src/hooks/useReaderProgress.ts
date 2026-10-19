'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ReadingProgress } from '@/types/comic';
import { getComicProgress, saveReadingHistory } from '@/utils/storage';

export interface UseReaderProgressOptions {
  comicId: string;
  comicTitle: string;
  comicCover: string;
  chapterId: string;
  chapterNumber: number;
  totalPages: number;
  readingMode: 'webtoon' | 'manga';
  initialPage?: number;
}

export interface UseReaderProgressReturn {
  currentPage: number;
  totalPages: number;
  progressPercentage: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  savedProgress: ReadingProgress | null;
  goToPage: (page: number) => void;
  nextPage: () => boolean;
  prevPage: () => boolean;
}

export function useReaderProgress({
  comicId,
  comicTitle,
  comicCover,
  chapterId,
  chapterNumber,
  totalPages,
  readingMode,
  initialPage = 1,
}: UseReaderProgressOptions): UseReaderProgressReturn {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [savedProgress, setSavedProgress] = useState<ReadingProgress | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load existing progress for this comic when initialized
  useEffect(() => {
    if (!comicId) return;
    const progress = getComicProgress(comicId);
    setSavedProgress(progress);

    // If progress matches current chapter and initialPage wasn't explicitly overridden
    if (progress && progress.chapterId === chapterId && progress.pageNumber > 0 && progress.pageNumber <= totalPages) {
      setCurrentPage(progress.pageNumber);
    }
  }, [comicId, chapterId, totalPages]);

  // Save progress with debounce to avoid excessive localStorage writes
  const persistProgress = useCallback(
    (page: number) => {
      if (!comicId || !chapterId || totalPages <= 0) return;

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        const safePage = Math.max(1, Math.min(page, totalPages));
        const percentage = Math.round((safePage / totalPages) * 100);

        const progressData: ReadingProgress = {
          comicId,
          comicTitle: comicTitle || 'Unknown Comic',
          comicCover: comicCover || '',
          chapterId,
          chapterNumber,
          pageNumber: safePage,
          totalPages,
          percentage,
          lastReadAt: new Date().toISOString(),
          readingMode,
        };

        saveReadingHistory(progressData);
        setSavedProgress(progressData);
      }, 300);
    },
    [comicId, comicTitle, comicCover, chapterId, chapterNumber, totalPages, readingMode]
  );

  const goToPage = useCallback(
    (targetPage: number) => {
      const validPage = Math.max(1, Math.min(targetPage, totalPages));
      setCurrentPage(validPage);
      persistProgress(validPage);
    },
    [totalPages, persistProgress]
  );

  const nextPage = useCallback((): boolean => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
      return true;
    }
    return false;
  }, [currentPage, totalPages, goToPage]);

  const prevPage = useCallback((): boolean => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
      return true;
    }
    return false;
  }, [currentPage, goToPage]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const progressPercentage = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return {
    currentPage,
    totalPages,
    progressPercentage,
    isFirstPage,
    isLastPage,
    savedProgress,
    goToPage,
    nextPage,
    prevPage,
  };
}
