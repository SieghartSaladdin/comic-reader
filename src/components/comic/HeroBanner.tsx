'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Info, Star, ChevronLeft, ChevronRight, Eye, BookOpen } from 'lucide-react';
import { Comic, ComicListItem } from '@/types/comic';

interface HeroBannerProps {
  comics: (Comic | ComicListItem)[];
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ comics }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [bgError, setBgError] = useState(false);
  const [coverError, setCoverError] = useState(false);

  useEffect(() => {
    setBgError(false);
    setCoverError(false);
  }, [currentIndex]);

  // Auto slide every 6 seconds unless hovered
  useEffect(() => {
    if (comics.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % comics.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [comics.length, isHovered]);

  if (!comics || comics.length === 0) return null;

  const current = comics[currentIndex];
  const comicKey = current.slug || current.id;
  const fullComic = current as Partial<Comic>;

  const displayBanner = fullComic.bannerImage || current.coverImage;
  const displayDesc =
    fullComic.description ||
    `Nikmati bab terbaru dari ${current.title} dengan terjemahan bahasa Indonesia jernih dan tata letak berkualitas tinggi di Comic Reader.`;
  const displayGenres =
    fullComic.genres && fullComic.genres.length > 0
      ? fullComic.genres
      : [current.type, 'Sub Indo', 'Populer'];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + comics.length) % comics.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % comics.length);
  };

  const readTargetUrl = current.latestChapterSlug
    ? `/reader/${comicKey}/${current.latestChapterSlug}`
    : `/comic/${comicKey}`;

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800/80 shadow-sm bg-white dark:bg-[#121214] transition-colors duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Banner with Architectural Fade */}
      <div className="absolute inset-0 z-0">
        {displayBanner?.trim() && !bgError && (
          <img
            src={displayBanner}
            alt={current.title}
            onError={() => setBgError(true)}
            className="w-full h-full object-cover object-center filter blur-[2px] scale-105 opacity-25 dark:opacity-30 dark:brightness-50 transition-all duration-700"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-[#121214] dark:via-[#121214]/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-transparent dark:from-[#121214] dark:via-[#121214]/75" />
      </div>

      {/* Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-10 sm:py-16 md:py-20 flex flex-col md:flex-row items-center gap-8 justify-between">
        <div className="max-w-2xl space-y-4 text-left">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest border border-zinc-300 dark:border-zinc-700 bg-zinc-100/90 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100">
              {current.type}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-100/90 dark:bg-zinc-800/90 text-zinc-800 dark:text-zinc-200">
              <Star className="w-3 h-3 fill-zinc-800 dark:fill-zinc-200 text-zinc-800 dark:text-zinc-200" />
              {(current.rating || 8.0).toFixed(1)}
            </span>
            <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 font-medium">
              <Eye className="w-3 h-3" />
              {fullComic.views || 'Populer'}
            </span>
          </div>

          {/* Title & Alt Title */}
          <div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-zinc-950 dark:text-white tracking-tight leading-tight">
              {current.title}
            </h1>
            {fullComic.altTitle && (
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-light italic">
                {fullComic.altTitle}
              </p>
            )}
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-1.5">
            {displayGenres.map((genre) => (
              <span
                key={genre}
                className="text-[11px] px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 font-medium"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Synopsis */}
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 line-clamp-3 leading-relaxed max-w-xl">
            {displayDesc}
          </p>

          {/* Actions: High Contrast Black / White */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={readTargetUrl}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 font-semibold text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{current.latestChapter ? `Baca ${current.latestChapter}` : 'Mulai Membaca'}</span>
            </Link>

            <Link
              href={`/comic/${comicKey}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium text-xs sm:text-sm transition-all cursor-pointer"
            >
              <Info className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <span>Detail Komik</span>
            </Link>
          </div>
        </div>

        {/* Featured Cover Card (Desktop) */}
        <div className="hidden md:block relative w-48 lg:w-56 aspect-[3/4] shrink-0 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700/80 shadow-lg bg-zinc-100 dark:bg-zinc-900">
          {current.coverImage?.trim() && !coverError ? (
            <img
              src={current.coverImage}
              alt={current.title}
              onError={() => setCoverError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none bg-zinc-100 dark:bg-zinc-900 text-zinc-400">
              <div className="w-12 h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mb-2 shadow-xs text-zinc-700 dark:text-zinc-200">
                <BookOpen className="w-6 h-6 stroke-[1.75]" />
              </div>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 line-clamp-3">
                {current.title}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Arrows & Dots */}
      {comics.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/70 hover:bg-white dark:bg-black/40 dark:hover:bg-black/70 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 backdrop-blur-md transition-all cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/70 hover:bg-white dark:bg-black/40 dark:hover:bg-black/70 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 backdrop-blur-md transition-all cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
            {comics.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex
                    ? 'w-6 bg-zinc-900 dark:bg-white'
                    : 'w-2 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-500'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
