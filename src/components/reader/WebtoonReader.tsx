'use client';

import React, { useEffect, useRef } from 'react';
import { ComicPage, ReaderZoomMode } from '@/types/comic';
import { ReaderImage } from './ReaderImage';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

/** Jumlah halaman awal yang dimuat segera (sisanya lazy). */
const PRIORITY_PAGES = 2;

interface WebtoonReaderProps {
  pages: ComicPage[];
  currentPage: number;
  onPageChange: (page: number) => void;
  zoom?: ReaderZoomMode;
  gap?: boolean;
  onToggleControls?: () => void;
  onNextChapter?: () => void;
  onPrevChapter?: () => void;
  hasNextChapter?: boolean;
  hasPrevChapter?: boolean;
}

export const WebtoonReader: React.FC<WebtoonReaderProps> = ({
  pages,
  currentPage,
  onPageChange,
  zoom = 'fit-width',
  gap = false,
  onToggleControls,
  onNextChapter,
  onPrevChapter,
  hasNextChapter = false,
  hasPrevChapter = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef<boolean>(true);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Setup IntersectionObserver to track visible page in viewport
  useEffect(() => {
    if (!pages.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!isUserScrollingRef.current) return;

        // Find the visible entry closest to the center/top
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // Sort by intersection ratio or proximity to center
          const best = visibleEntries.reduce((prev, current) =>
            current.intersectionRatio > prev.intersectionRatio ? current : prev
          );
          const pageNum = Number(best.target.getAttribute('data-page-number'));
          if (pageNum && pageNum !== currentPage) {
            onPageChange(pageNum);
          }
        }
      },
      {
        root: null,
        rootMargin: '-20% 0px -40% 0px',
        threshold: [0.1, 0.3, 0.5, 0.7],
      }
    );

    const elements = document.querySelectorAll('.webtoon-page-item');
    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [pages, currentPage, onPageChange]);

  // Programmatic scroll when page jump occurs from controls
  const prevPageRef = useRef(currentPage);
  useEffect(() => {
    if (Math.abs(prevPageRef.current - currentPage) > 1) {
      // User likely jumped via slider or chapter jump
      const targetEl = document.getElementById(`webtoon-page-${currentPage}`);
      if (targetEl) {
        isUserScrollingRef.current = false;
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
          isUserScrollingRef.current = true;
        }, 800);
      }
    }
    prevPageRef.current = currentPage;
  }, [currentPage]);

  if (!pages || pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-400">
        <p className="text-base font-medium">Tidak ada halaman yang tersedia.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full flex flex-col items-center select-none py-2"
    >
      <div
        className={`w-full flex flex-col items-center ${
          gap ? 'gap-4 md:gap-6' : 'gap-0'
        }`}
      >
        {pages.map((page) => (
          <div
            key={page.pageNumber}
            id={`webtoon-page-${page.pageNumber}`}
            data-page-number={page.pageNumber}
            className="webtoon-page-item w-full flex justify-center cursor-pointer"
            onClick={onToggleControls}
          >
            <ReaderImage
              page={page}
              priority={page.pageNumber <= PRIORITY_PAGES}
              zoom={zoom}
              alt={`Webtoon Page ${page.pageNumber}`}
            />
          </div>
        ))}
      </div>

      {/* End of Chapter Section */}
      <div className="w-full max-w-xl mx-auto my-12 px-4 py-8 bg-zinc-900/90 border border-zinc-800 rounded-2xl flex flex-col items-center text-center shadow-2xl backdrop-blur-md">
        <div className="w-12 h-12 rounded-full bg-zinc-800 text-white border border-zinc-700 flex items-center justify-center mb-3">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-zinc-100 mb-1">Akhir Chapter</h3>
        <p className="text-xs text-zinc-400 mb-6">
          Kamu telah menyelesaikan chapter ini ({pages.length} halaman dibaca).
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          {hasPrevChapter && onPrevChapter && (
            <button
              onClick={onPrevChapter}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Chapter Sebelumnya
            </button>
          )}

          {hasNextChapter && onNextChapter && (
            <button
              onClick={onNextChapter}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
            >
              Chapter Berikutnya
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
