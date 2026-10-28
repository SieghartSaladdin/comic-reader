'use client';

import React, { useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ComicPage, ReaderZoomMode } from '@/types/comic';
import { ReaderImage } from './ReaderImage';

/** Jumlah halaman berikutnya yang dimuat lebih awal. */
const PRELOAD_AHEAD = 2;

interface MangaReaderProps {
  pages: ComicPage[];
  currentPage: number;
  onPageChange: (page: number) => void;
  readingMode?: 'manga-ltr' | 'manga-rtl';
  zoom?: ReaderZoomMode;
  onToggleControls?: () => void;
  onNextChapter?: () => void;
  onPrevChapter?: () => void;
  hasNextChapter?: boolean;
  hasPrevChapter?: boolean;
}

export const MangaReader: React.FC<MangaReaderProps> = ({
  pages,
  currentPage,
  onPageChange,
  readingMode = 'manga-rtl',
  zoom = 'fit-height',
  onToggleControls,
  onNextChapter,
  onPrevChapter,
  hasNextChapter = false,
  hasPrevChapter = false,
}) => {
  const isRTL = readingMode === 'manga-rtl';
  const totalPages = pages.length;

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    } else if (hasNextChapter && onNextChapter) {
      onNextChapter();
    }
  }, [currentPage, totalPages, onPageChange, hasNextChapter, onNextChapter]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    } else if (hasPrevChapter && onPrevChapter) {
      onPrevChapter();
    }
  }, [currentPage, onPageChange, hasPrevChapter, onPrevChapter]);

  // Click on Left zone
  const handleLeftZoneClick = () => {
    if (isRTL) {
      handleNextPage(); // In RTL, going left means advancing to the next page
    } else {
      handlePrevPage(); // In LTR, going left means going back
    }
  };

  // Click on Right zone
  const handleRightZoneClick = () => {
    if (isRTL) {
      handlePrevPage(); // In RTL, going right means going back
    } else {
      handleNextPage(); // In LTR, going right means advancing
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (isRTL) {
          handlePrevPage();
        } else {
          handleNextPage();
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        if (isRTL) {
          handleNextPage();
        } else {
          handlePrevPage();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRTL, handleNextPage, handlePrevPage]);

  // Muat lebih awal beberapa halaman berikutnya agar pindah halaman terasa instan.
  useEffect(() => {
    pages.slice(currentPage, currentPage + PRELOAD_AHEAD).forEach((page) => {
      if (!page.imageUrl) return;
      const img = new Image();
      img.decoding = 'async';
      img.src = page.imageUrl;
    });
  }, [pages, currentPage]);

  const activePage = pages[currentPage - 1] || pages[0];

  if (!pages || pages.length === 0 || !activePage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-zinc-400">
        <p className="text-base font-medium">Tidak ada halaman yang tersedia.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-[calc(100vh-80px)] flex items-center justify-center select-none overflow-hidden py-4">
      {/* Active Page Image */}
      <div className="relative z-0 max-w-full flex items-center justify-center">
        <ReaderImage
          key={activePage.pageNumber}
          page={activePage}
          priority
          zoom={zoom}
          alt={`Manga Page ${currentPage}`}
        />
      </div>

      {/* Floating Left Button */}
      <button
        onClick={handleLeftZoneClick}
        aria-label={isRTL ? 'Halaman Berikutnya' : 'Halaman Sebelumnya'}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-black/85 text-white/80 hover:text-white border border-white/10 items-center justify-center transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Floating Right Button */}
      <button
        onClick={handleRightZoneClick}
        aria-label={isRTL ? 'Halaman Sebelumnya' : 'Halaman Berikutnya'}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-black/85 text-white/80 hover:text-white border border-white/10 items-center justify-center transition-colors cursor-pointer"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Interactive Touch/Click Zones */}
      <div className="absolute inset-0 z-10 flex">
        {/* Left Click Zone (25%) */}
        <div
          onClick={handleLeftZoneClick}
          className="w-1/4 h-full cursor-w-resize"
          title={isRTL ? 'Berikutnya (RTL)' : 'Sebelumnya (LTR)'}
        />

        {/* Center Click Zone (50%) - Toggles Controls */}
        <div
          onClick={onToggleControls}
          className="w-2/4 h-full cursor-pointer"
          title="Klik untuk tampilkan/sembunyikan menu"
        />

        {/* Right Click Zone (25%) */}
        <div
          onClick={handleRightZoneClick}
          className="w-1/4 h-full cursor-e-resize"
          title={isRTL ? 'Sebelumnya (RTL)' : 'Berikutnya (LTR)'}
        />
      </div>

      {/* Page Badge Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1.5 rounded-lg bg-black/80 text-white/90 text-xs font-medium tracking-wide border border-white/10 pointer-events-none">
        {currentPage} / {totalPages}{' '}
        <span className="text-zinc-400 text-[10px] uppercase font-mono ml-1">
          ({isRTL ? 'RTL' : 'LTR'})
        </span>
      </div>
    </div>
  );
};
