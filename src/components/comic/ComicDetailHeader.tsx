'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Play,
  RotateCcw,
  Bookmark,
  Star,
  Eye,
  Calendar,
  User,
  Palette,
  Share2,
  Check,
  BookOpen,
} from 'lucide-react';
import { Comic, Chapter, ReadingProgress } from '@/types/comic';

interface ComicDetailHeaderProps {
  comic: Comic;
  comicKey: string;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  progress: ReadingProgress | null;
  firstChapter: Chapter | null;
  onShare: () => void;
  isCopied: boolean;
}

export const ComicDetailHeader: React.FC<ComicDetailHeaderProps> = ({
  comic,
  comicKey,
  bookmarked,
  onToggleBookmark,
  progress,
  firstChapter,
  onShare,
  isCopied,
}) => {
  const [bannerError, setBannerError] = useState(false);
  const [coverError, setCoverError] = useState(false);

  const bannerSrc = (comic.bannerImage?.trim() || comic.coverImage?.trim()) || '';
  const coverSrc = comic.coverImage?.trim() || '';

  return (
    <div className="relative rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#121214] shadow-xs transition-colors duration-200">
      {/* Background Banner */}
      <div className="absolute inset-0 z-0">
        {bannerSrc && !bannerError && (
          <img
            src={bannerSrc}
            alt={comic.title}
            onError={() => setBannerError(true)}
            className="w-full h-full object-cover filter blur-[3px] scale-105 opacity-15 dark:opacity-20 dark:brightness-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-[#121214] dark:via-[#121214]/85" />
      </div>

      <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
        {/* Cover Poster with Error Fallback */}
        <div className="relative w-40 sm:w-48 md:w-56 aspect-[3/4] shrink-0 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700/80 shadow-md mx-auto md:mx-0 bg-zinc-100 dark:bg-zinc-900">
          {coverSrc && !coverError ? (
            <img
              src={coverSrc}
              alt={comic.title}
              onError={() => setCoverError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center select-none bg-zinc-100 dark:bg-zinc-900 text-zinc-400">
              <div className="w-12 h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mb-2 shadow-xs text-zinc-700 dark:text-zinc-200">
                <BookOpen className="w-6 h-6 stroke-[1.75]" />
              </div>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 line-clamp-3">
                {comic.title}
              </span>
            </div>
          )}
          <div className="absolute top-2 left-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 uppercase tracking-widest shadow-xs">
              {comic.type}
            </span>
          </div>
        </div>

        {/* Content Details */}
        <div className="flex-1 space-y-4 text-left">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-100/90 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100">
                <Star className="w-3.5 h-3.5 fill-zinc-900 dark:fill-zinc-100 text-zinc-900 dark:text-zinc-100" />
                {comic.rating.toFixed(1)}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-300 font-medium">
                {comic.status}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-300 font-medium">
                Sub Indo
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
              {comic.title}
            </h1>
            {comic.altTitle && (
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 italic font-light">{comic.altTitle}</p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 text-xs text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              <span className="truncate">Penulis: <strong className="text-zinc-900 dark:text-zinc-200">{comic.author}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              <span className="truncate">Artis: <strong className="text-zinc-900 dark:text-zinc-200">{comic.artist}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              <span>Rilis: <strong className="text-zinc-900 dark:text-zinc-200">{comic.releaseYear || 'Terbaru'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              <span>Views: <strong className="text-zinc-900 dark:text-zinc-200">{comic.views || '1.2M'}</strong></span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {comic.genres?.map((genre) => (
              <span
                key={genre}
                className="text-xs px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 font-medium"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {progress ? (
              <Link
                href={`/reader/${comicKey}/${progress.chapterId}`}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 font-bold text-xs sm:text-sm shadow-sm transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Lanjut Ch. {progress.chapterNumber} ({Math.round(progress.percentage)}%)</span>
              </Link>
            ) : null}

            {firstChapter && (
              <Link
                href={`/reader/${comicKey}/${firstChapter.id || firstChapter.slug}`}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  progress
                    ? 'border border-zinc-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
                    : 'bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 shadow-sm'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{progress ? 'Mulai Dari Awal' : 'Mulai Membaca'}</span>
              </Link>
            )}

            <button
              onClick={onToggleBookmark}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition-all cursor-pointer ${
                bookmarked
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-transparent font-semibold shadow-xs'
                  : 'bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
              <span>{bookmarked ? 'Tersimpan' : 'Bookmark'}</span>
            </button>

            <button
              onClick={onShare}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm transition-colors cursor-pointer"
              title="Bagikan tautan"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-zinc-900 dark:text-white" />
                  <span className="text-xs font-semibold text-zinc-900 dark:text-white">Tersalin!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span className="text-xs">Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
