'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, Play, Calendar } from 'lucide-react';
import { AnimeListItem } from '@/types/anime';

interface AnimeCardProps {
  anime: AnimeListItem;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime }) => {
  const [imgError, setImgError] = useState(false);

  // Format konsisten 2 baris episode update
  const episodesToDisplay = (() => {
    if (anime.recentEpisodes && anime.recentEpisodes.length > 0) {
      const list = [...anime.recentEpisodes.slice(0, 2)];
      if (list.length === 1) {
        list.push({
          title: 'Eps. Sebelumnya',
          slug: anime.slug,
          releaseTime: '7 hari yang lalu',
        });
      }
      return list;
    }
    return [
      {
        title: anime.latestEpisode || 'Eps. Terbaru',
        slug: anime.slug,
        releaseTime: anime.releaseDay || 'Baru saja',
      },
      {
        title: 'Eps. Sebelumnya',
        slug: anime.slug,
        releaseTime: '7 hari yang lalu',
      },
    ];
  })();

  return (
    <div className="group relative flex flex-col rounded-2xl bg-white dark:bg-[#121214] border border-zinc-200/90 dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-600 p-2.5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
      {/* Cover Image Container */}
      <Link
        href={`/anime/${anime.slug}`}
        className="block relative aspect-[3/4.2] w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60"
      >
        {anime.coverImage?.trim() && !imgError ? (
          <img
            src={anime.coverImage}
            alt={anime.title}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-900 text-zinc-400 p-4 text-center select-none group-hover:scale-105 transition-transform duration-500">
            <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mb-2 shadow-xs text-zinc-700 dark:text-zinc-200">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 line-clamp-2 px-1">
              {anime.title}
            </span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25 opacity-70 group-hover:opacity-50 transition-opacity" />

        {/* Top Badges: Type & Day */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs backdrop-blur-md uppercase tracking-wider text-white bg-black/60 border border-white/20">
            {anime.type || 'ANIME'}
          </span>
          {anime.releaseDay && (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-black/60 text-zinc-200 border border-white/15 backdrop-blur-sm shadow flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5 text-zinc-300" />
              {anime.releaseDay}
            </span>
          )}
        </div>

        {/* Top-Right Badge: Rating if present */}
        {anime.rating && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/20">
            <Star className="w-3 h-3 fill-white text-white" />
            <span>{anime.rating}</span>
          </div>
        )}

        {/* Bottom Badge: Latest Episode */}
        {anime.latestEpisode && (
          <div className="absolute bottom-2 left-2 z-10">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 text-white text-[11px] font-semibold shadow-xs backdrop-blur-md border border-white/20">
              <Play className="w-2.5 h-2.5 fill-white" />
              {anime.latestEpisode}
            </span>
          </div>
        )}

        {/* Hover Watch Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
            <Play className="w-4 h-4 fill-zinc-950 ml-0.5" />
          </div>
        </div>
      </Link>

      {/* Meta Content */}
      <div className="flex flex-col flex-1 pt-2.5 px-0.5 justify-between">
        <Link href={`/anime/${anime.slug}`}>
          <h3
            className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors line-clamp-2 leading-snug"
            title={anime.title}
          >
            {anime.title}
          </h3>
        </Link>

        <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-2 mt-2 space-y-1">
          {episodesToDisplay.map((ep, idx) => {
            const isWatchLink = ep.slug && ep.slug.toLowerCase().includes('episode');
            const href = isWatchLink ? `/anime/watch/${ep.slug}` : `/anime/${anime.slug}`;

            return (
              <div
                key={`${ep.slug}-${idx}`}
                className="flex items-center justify-between text-[11px] gap-2"
              >
                <Link
                  href={href}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:underline transition-colors truncate"
                  title={ep.title}
                >
                  <Play className="w-2.5 h-2.5 fill-current shrink-0 text-zinc-500 dark:text-zinc-400" />
                  <span className="truncate">{ep.title}</span>
                </Link>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 shrink-0 font-normal">
                  {ep.releaseTime}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
