'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpDown, Search, Calendar, Users, BookOpen } from 'lucide-react';
import { Chapter } from '@/types/comic';
import { prefetchJson } from '@/utils/clientCache';

const WARM_NEWEST_DELAY_MS = 800;
const WARM_TTL_MS = 10 * 60 * 1000;

/** Minta server menyiapkan (dan men-cache) data chapter lebih awal. */
function warmChapter(slug: string): void {
  prefetchJson(`/api/komik/chapter/${encodeURIComponent(slug)}`, WARM_TTL_MS);
}

interface ChapterListProps {
  comicId: string;
  chapters: Chapter[];
  lastReadChapterId?: string | null;
}

export const ChapterList: React.FC<ChapterListProps> = ({
  comicId,
  chapters,
  lastReadChapterId,
}) => {
  const [isAscending, setIsAscending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Chapter terbaru paling sering dibuka: siapkan datanya sesaat setelah halaman tampil.
  const newestSlug = chapters[0]?.slug || chapters[0]?.id;
  useEffect(() => {
    if (!newestSlug) return;
    const timer = window.setTimeout(() => warmChapter(newestSlug), WARM_NEWEST_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [newestSlug]);

  // Filter and sort chapters
  const processedChapters = useMemo(() => {
    let result = [...chapters];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (ch) =>
          ch.title.toLowerCase().includes(q) ||
          ch.chapterNumber.toString().includes(q) ||
          ch.scanlationGroup?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const numA = a.chapterNumber || 0;
      const numB = b.chapterNumber || 0;
      return isAscending ? numA - numB : numB - numA;
    });

    return result;
  }, [chapters, isAscending, searchQuery]);

  return (
    <div className="w-full space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-50 dark:bg-[#121214] p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Daftar Chapter
          </span>
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700">
            {chapters.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Chapter Search */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari chapter..."
              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-800 dark:focus:border-zinc-200"
            />
          </div>

          {/* Sort order toggle */}
          <button
            onClick={() => setIsAscending(!isAscending)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#09090b] hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors shrink-0 cursor-pointer"
            title="Ubah Urutan"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span>{isAscending ? 'Terlama' : 'Terbaru'}</span>
          </button>
        </div>
      </div>

      {/* Chapters Listing */}
      {processedChapters.length > 0 ? (
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {processedChapters.map((chapter) => {
            const isLastRead =
              lastReadChapterId === chapter.id ||
              lastReadChapterId === chapter.slug;
            const targetSlug = chapter.slug || chapter.id;

            return (
              <div
                key={chapter.id || chapter.slug}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  isLastRead
                    ? 'bg-zinc-100/90 dark:bg-zinc-800/60 border-zinc-400 dark:border-zinc-600 shadow-xs'
                    : 'bg-white dark:bg-[#121214] border-zinc-200/90 dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-[#161618]'
                }`}
              >
                <div className="min-w-0 flex-1 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {chapter.title}
                    </span>
                    {isLastRead && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 uppercase tracking-widest shrink-0">
                        Terakhir Dibaca
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-zinc-400" />
                      {chapter.releaseDate || 'Unknown'}
                    </span>
                    {chapter.scanlationGroup && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-zinc-400" />
                        {chapter.scanlationGroup}
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  href={`/reader/${comicId}/${targetSlug}`}
                  // Panaskan data chapter begitu kursor/jari mendekat, sebelum diklik.
                  onPointerEnter={() => warmChapter(targetSlug)}
                  onTouchStart={() => warmChapter(targetSlug)}
                  onFocus={() => warmChapter(targetSlug)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 text-xs font-semibold shadow-xs transition-all shrink-0 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Baca</span>
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-[#121214] rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <BookOpen className="w-8 h-8 mx-auto text-zinc-400 dark:text-zinc-600 mb-2" />
          <p className="text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Chapter tidak ditemukan
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {searchQuery
              ? `Tidak ada chapter yang cocok dengan "${searchQuery}"`
              : 'Belum ada chapter yang tersedia untuk komik ini.'}
          </p>
        </div>
      )}
    </div>
  );
};
