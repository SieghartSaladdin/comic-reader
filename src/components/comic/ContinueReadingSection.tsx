'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { History, Play, ArrowRight, BookOpen } from 'lucide-react';
import { ReadingProgress } from '@/types/comic';
import { getReadingHistory } from '@/utils/storage';

const ContinueReadingCard: React.FC<{ item: ReadingProgress }> = ({ item }) => {
  const [imgError, setImgError] = useState(false);
  const coverSrc = item.comicCover?.trim();

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all group">
      <Link
        href={`/reader/${item.comicId}/${item.chapterId}`}
        className="relative w-14 h-20 rounded-xl overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center"
      >
        {coverSrc && !imgError ? (
          <img
            src={coverSrc}
            alt={item.comicTitle}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center bg-zinc-100 dark:bg-zinc-900 text-zinc-400">
            <BookOpen className="w-5 h-5 text-zinc-500 mb-1" />
            <span className="text-[9px] font-semibold text-zinc-600 dark:text-zinc-400 line-clamp-1">
              Ch. {item.chapterNumber}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="w-4 h-4 text-white fill-white" />
        </div>
      </Link>

      <div className="min-w-0 flex-1 flex flex-col justify-between h-full py-0.5">
        <div>
          <Link href={`/comic/${item.comicId}`}>
            <h4 className="text-xs md:text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
              {item.comicTitle}
            </h4>
          </Link>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
            Chapter {item.chapterNumber} • Halaman {item.pageNumber}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
            <span>Progress</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-200">{Math.round(item.percentage)}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-zinc-900 dark:bg-white rounded-full transition-all duration-300"
              style={{ width: `${Math.min(Math.max(item.percentage, 5), 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContinueReadingSection: React.FC = () => {
  const [history, setHistory] = useState<ReadingProgress[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHistory(getReadingHistory().slice(0, 4));
  }, []);

  if (!mounted || history.length === 0) return null;

  return (
    <section className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
            <History className="w-4 h-4" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white tracking-tight">
            Lanjutkan Membaca
          </h2>
        </div>
        <Link
          href="/history"
          className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1 transition-colors"
        >
          <span>Semua Riwayat</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {history.map((item) => (
          <ContinueReadingCard key={item.comicId} item={item} />
        ))}
      </div>
    </section>
  );
};
