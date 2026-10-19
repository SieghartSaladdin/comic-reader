'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Settings,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ScrollText,
} from 'lucide-react';
import { ReaderReadingMode } from '@/types/comic';

export interface ChapterNavItem {
  id: string;
  chapterNumber: number;
  title: string;
}

interface ReaderControlsProps {
  isVisible: boolean;
  comicId: string;
  comicTitle: string;
  chapterTitle: string;
  chapterNumber: number;
  chapters: ChapterNavItem[];
  currentChapterId: string;
  onSelectChapter: (chapterId: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPrevChapter?: () => void;
  onNextChapter?: () => void;
  hasPrevChapter: boolean;
  hasNextChapter: boolean;
  readingMode: ReaderReadingMode;
  onToggleReadingMode: () => void;
  onOpenSettings: () => void;
}

export const ReaderControls: React.FC<ReaderControlsProps> = ({
  isVisible,
  comicId,
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
  const isWebtoon = readingMode === 'webtoon';

  return (
    <>
      {/* Top Header Bar */}
      <header
        onClick={(e) => e.stopPropagation()}
        className={`fixed top-0 left-0 right-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 text-zinc-100 transition-transform duration-300 shadow-xl ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between gap-4">
          {/* Left: Back Button & Comic Title */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/comic/${comicId}`}
              className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition"
              title="Kembali ke Detail Komik"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="min-w-0">
              <h1 className="text-sm md:text-base font-semibold truncate leading-tight">
                {comicTitle}
              </h1>
              <p className="text-xs text-zinc-400 truncate">
                Ch. {chapterNumber} {chapterTitle ? `— ${chapterTitle}` : ''}
              </p>
            </div>
          </div>

          {/* Right: Chapter Dropdown Selector & Settings Button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {chapters.length > 0 && (
              <select
                value={currentChapterId}
                onChange={(e) => onSelectChapter(e.target.value)}
                className="bg-zinc-900 border border-zinc-700/80 hover:border-zinc-500 text-zinc-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-white cursor-pointer max-w-[140px] md:max-w-[200px] truncate"
              >
                {chapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    Ch. {ch.chapterNumber} {ch.title ? `- ${ch.title}` : ''}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition cursor-pointer"
              title="Buka Pengaturan"
              aria-label="Pengaturan"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Footer Bar */}
      <footer
        onClick={(e) => e.stopPropagation()}
        className={`fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800 text-zinc-100 transition-transform duration-300 shadow-2xl py-3 px-4 ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6">
          {/* Chapter Prev / Next Navigation */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
            <button
              onClick={onPrevChapter}
              disabled={!hasPrevChapter}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 disabled:opacity-35 disabled:pointer-events-none text-xs font-medium text-zinc-200 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev Ch.</span>
            </button>

            {/* Quick Mode Toggle */}
            <button
              onClick={onToggleReadingMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium transition cursor-pointer"
              title="Ganti Mode Baca"
            >
              {isWebtoon ? (
                <>
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Mode Manga</span>
                </>
              ) : (
                <>
                  <ScrollText className="w-3.5 h-3.5" />
                  <span>Mode Webtoon</span>
                </>
              )}
            </button>

            <button
              onClick={onNextChapter}
              disabled={!hasNextChapter}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 disabled:opacity-35 disabled:pointer-events-none text-xs font-medium text-zinc-200 transition cursor-pointer"
            >
              <span>Next Ch.</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Page Slider / Jump Selector */}
          {totalPages > 0 && (
            <div className="flex items-center gap-3 w-full md:flex-1 justify-center">
              <span className="text-xs font-medium text-zinc-400 min-w-[70px] text-right font-mono">
                {currentPage} / {totalPages}
              </span>

              <input
                type="range"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => onPageChange(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white"
              />

              <span className="text-[11px] text-zinc-500 font-mono">
                {Math.round((currentPage / totalPages) * 100)}%
              </span>
            </div>
          )}
        </div>
      </footer>
    </>
  );
};
