'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNextPage?: boolean;
  isLoading?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage = false,
  isLoading = false,
}) => {
  const effectiveTotal = Math.max(totalPages, currentPage + (hasNextPage ? 1 : 0));

  if (effectiveTotal <= 1) return null;

  // Generate page numbers with ellipses
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (effectiveTotal <= 7) {
      for (let i = 1; i <= effectiveTotal; i++) {
        pages.push(i);
      }
      return pages;
    }

    if (currentPage <= 3) {
      for (let i = 1; i <= maxVisible - 1; i++) {
        pages.push(i);
      }
      pages.push('ellipsis-right');
      pages.push(effectiveTotal);
    } else if (currentPage >= effectiveTotal - 2) {
      pages.push(1);
      pages.push('ellipsis-left');
      for (let i = effectiveTotal - 3; i <= effectiveTotal; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push('ellipsis-left');
      pages.push(currentPage - 1);
      pages.push(currentPage);
      pages.push(currentPage + 1);
      pages.push('ellipsis-right');
      pages.push(effectiveTotal);
    }

    return pages;
  };

  const pages = getPageNumbers();
  const canGoPrev = currentPage > 1 && !isLoading;
  const canGoNext = (currentPage < effectiveTotal || hasNextPage) && !isLoading;

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1.5 sm:gap-2 my-8 select-none"
    >
      {/* Prev Button */}
      <button
        type="button"
        onClick={() => canGoPrev && onPageChange(currentPage - 1)}
        disabled={!canGoPrev}
        aria-label="Halaman sebelumnya"
        className={`inline-flex items-center justify-center h-9 sm:h-10 px-3 sm:px-3.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
          canGoPrev
            ? 'border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer shadow-2xs'
            : 'border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-400 dark:text-zinc-600 opacity-40 cursor-not-allowed pointer-events-none'
        }`}
      >
        <ChevronLeft className="w-4 h-4 mr-1 shrink-0" />
        <span className="hidden sm:inline">Sebelumnya</span>
      </button>

      {/* Number Buttons */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {pages.map((p, index) => {
          if (typeof p === 'string') {
            return (
              <span
                key={`${p}-${index}`}
                className="inline-flex items-center justify-center w-8 h-9 sm:w-10 sm:h-10 text-zinc-400 dark:text-zinc-600"
              >
                <MoreHorizontal className="w-4 h-4" />
              </span>
            );
          }

          const isActive = p === currentPage;

          return (
            <button
              key={p}
              type="button"
              onClick={() => !isActive && !isLoading && onPageChange(p)}
              disabled={isLoading || isActive}
              aria-current={isActive ? 'page' : undefined}
              className={`inline-flex items-center justify-center min-w-8 sm:min-w-10 h-9 sm:h-10 px-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer ${
                isActive
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-bold shadow-xs'
                  : 'border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 font-medium'
              }`}
            >
              {p}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        type="button"
        onClick={() => canGoNext && onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        aria-label="Halaman berikutnya"
        className={`inline-flex items-center justify-center h-9 sm:h-10 px-3 sm:px-3.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
          canGoNext
            ? 'border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer shadow-2xs'
            : 'border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-400 dark:text-zinc-600 opacity-40 cursor-not-allowed pointer-events-none'
        }`}
      >
        <span className="hidden sm:inline">Berikutnya</span>
        <ChevronRight className="w-4 h-4 ml-1 shrink-0" />
      </button>
    </nav>
  );
};
