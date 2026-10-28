'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, Settings } from 'lucide-react';
import { READER_BAR_ATTR } from '@/hooks/useHideOnUserScroll';

export interface ChapterNavItem {
  id: string;
  chapterNumber: number;
  title: string;
  releaseDate?: string;
}

/** Judul chapter yang bermakna; judul generik seperti "Komik X Chapter 24" dibuang agar tidak berulang. */
export function descriptiveChapterTitle(title?: string): string {
  if (!title || /chapter\s*\d+|^ch\.?\s*\d+/i.test(title)) return '';
  return title.trim();
}

interface ReaderControlsProps {
  isVisible: boolean;
  comicId: string;
  comicTitle: string;
  chapterTitle: string;
  chapterNumber: number;
  chapters: ChapterNavItem[];
  onOpenChapterList: () => void;
  onOpenSettings: () => void;
}

/** Header reader: kembali ke detail komik, judul, tombol daftar chapter, dan pengaturan. */
export const ReaderControls: React.FC<ReaderControlsProps> = ({
  isVisible,
  comicId,
  comicTitle,
  chapterTitle,
  chapterNumber,
  chapters,
  onOpenChapterList,
  onOpenSettings,
}) => {
  return (
    <header
      {...{ [READER_BAR_ATTR]: '' }}
      onClick={(e) => e.stopPropagation()}
      aria-hidden={!isVisible}
      className={`fixed top-0 left-0 right-0 z-40 bg-zinc-950 border-b border-zinc-800 text-zinc-100 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'pointer-events-none -translate-y-full'
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
              Ch. {chapterNumber} {chapterTitle ? `· ${chapterTitle}` : ''}
            </p>
          </div>
        </div>

        {/* Right: Chapter Dropdown Selector & Settings Button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Satu-satunya pemilih chapter: membuka daftar yang sama dengan tombol di bar bawah */}
          {chapters.length > 1 && (
            <button
              type="button"
              onClick={onOpenChapterList}
              aria-label="Buka daftar chapter"
              className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-zinc-700/80 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition hover:border-zinc-500"
            >
              <span>Ch. {chapterNumber}</span>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
            </button>
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
  );
};
