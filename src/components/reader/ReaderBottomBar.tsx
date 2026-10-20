'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ListOrdered,
  ScrollText,
  Settings,
} from 'lucide-react';
import { READER_BAR_ATTR } from '@/hooks/useHideOnUserScroll';
import { ReaderReadingMode } from '@/types/comic';
import { ChapterListSheet } from './ChapterListSheet';
import { ChapterNavItem, descriptiveChapterTitle } from './ReaderControls';

interface ReaderBottomBarProps {
  isVisible: boolean;
  comicTitle: string;
  chapterTitle: string;
  chapterNumber: number;
  chapters: ChapterNavItem[];
  currentChapterId: string;
  onSelectChapter: (chapterId: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPrevChapter: () => void;
  onNextChapter: () => void;
  hasPrevChapter: boolean;
  hasNextChapter: boolean;
  readingMode: ReaderReadingMode;
  onToggleReadingMode: () => void;
  onOpenSettings: () => void;
}

const ICON_BUTTON =
  'flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-zinc-800/80 text-zinc-200 transition hover:bg-zinc-700 active:scale-95';
const NAV_BUTTON =
  'flex h-10 flex-1 cursor-pointer items-center justify-center gap-1 rounded-xl bg-zinc-800/80 px-3 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700 active:scale-95 disabled:pointer-events-none disabled:opacity-35';

export const ReaderBottomBar: React.FC<ReaderBottomBarProps> = ({
  isVisible,
  comicTitle,
  chapterTitle,
  chapterNumber,
  chapters,
  currentChapterId,
  onSelectChapter,
  currentPage,
  totalPages,
  onPageChange,
  onPrevChapter,
  onNextChapter,
  hasPrevChapter,
  hasNextChapter,
  readingMode,
  onToggleReadingMode,
  onOpenSettings,
}) => {
  const [isListOpen, setIsListOpen] = useState(false);
  const isWebtoon = readingMode === 'webtoon';
  const percent = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;

  return (
    <>
      <footer
        {...{ [READER_BAR_ATTR]: '' }}
        onClick={(e) => e.stopPropagation()}
        aria-hidden={!isVisible}
        className={`fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-800 bg-zinc-950/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-zinc-100 shadow-2xl backdrop-blur-md transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : 'pointer-events-none translate-y-full'
        }`}
      >
        <div className="mx-auto max-w-3xl space-y-3">
          {/* Info chapter */}
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[11px] text-zinc-500">{comicTitle}</p>
              <p className="truncate text-sm font-semibold">
                Chapter {chapterNumber}
                {descriptiveChapterTitle(chapterTitle) ? ` — ${descriptiveChapterTitle(chapterTitle)}` : ''}
              </p>
            </div>
            {totalPages > 0 && (
              <p className="shrink-0 font-mono text-xs text-zinc-400">
                {currentPage} / {totalPages} · {percent}%
              </p>
            )}
          </div>

          {/* Slider halaman */}
          {totalPages > 1 && (
            <input
              type="range"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => onPageChange(Number(e.target.value))}
              aria-label="Pindah halaman"
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-700 accent-violet-500"
            />
          )}

          {/* Navigasi chapter dan aksi cepat */}
          <div className="flex items-center gap-2">
            <button type="button" onClick={onPrevChapter} disabled={!hasPrevChapter} className={NAV_BUTTON}>
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Sebelumnya</span>
              <span className="sm:hidden">Prev</span>
            </button>

            <button
              type="button"
              onClick={() => setIsListOpen(true)}
              aria-label="Buka daftar chapter"
              className="flex h-10 flex-[1.4] cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-3 text-xs font-semibold text-white transition hover:bg-violet-500 active:scale-95"
            >
              <ListOrdered className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">
                <span className="hidden sm:inline">Daftar </span>Chapter
              </span>
            </button>

            <button type="button" onClick={onNextChapter} disabled={!hasNextChapter} className={NAV_BUTTON}>
              <span className="hidden sm:inline">Berikutnya</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={onToggleReadingMode}
              title={isWebtoon ? 'Ganti ke mode manga' : 'Ganti ke mode webtoon'}
              aria-label={isWebtoon ? 'Ganti ke mode manga' : 'Ganti ke mode webtoon'}
              className={ICON_BUTTON}
            >
              {isWebtoon ? <BookOpen className="h-4 w-4" /> : <ScrollText className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              title="Pengaturan"
              aria-label="Pengaturan"
              className={ICON_BUTTON}
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </footer>

      <ChapterListSheet
        isOpen={isListOpen}
        onClose={() => setIsListOpen(false)}
        chapters={chapters}
        currentChapterId={currentChapterId}
        onSelectChapter={onSelectChapter}
      />
    </>
  );
};
