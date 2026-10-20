'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings } from 'lucide-react';
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
  currentChapterId: string;
  onSelectChapter: (chapterId: string) => void;
  onOpenSettings: () => void;
}

/** Header reader: kembali ke detail komik, judul, pilihan chapter cepat, dan pengaturan. */
export const ReaderControls: React.FC<ReaderControlsProps> = ({
  isVisible,
  comicId,
  comicTitle,
  chapterTitle,
  chapterNumber,
  chapters,
  currentChapterId,
  onSelectChapter,
  onOpenSettings,
}) => {
  return (
    <header
      {...{ [READER_BAR_ATTR]: '' }}
      onClick={(e) => e.stopPropagation()}
      aria-hidden={!isVisible}
      className={`fixed top-0 left-0 right-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 text-zinc-100 transition-transform duration-300 shadow-xl ${
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
  );
};
