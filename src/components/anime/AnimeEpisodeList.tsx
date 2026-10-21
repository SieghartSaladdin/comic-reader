'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AnimeEpisodeItem } from '@/types/anime';
import { Play, Search, ArrowUpDown, Calendar } from 'lucide-react';
import { prefetchJson } from '@/utils/clientCache';

const WARM_TTL_MS = 10 * 60 * 1000;

/** Minta server menyiapkan (dan men-cache) data stream episode lebih awal. */
function warmEpisode(slug: string): void {
  prefetchJson(`/api/anime/episode/${encodeURIComponent(slug)}`, WARM_TTL_MS);
}

interface AnimeEpisodeListProps {
  episodes: AnimeEpisodeItem[];
  animeSlug: string;
}

export const AnimeEpisodeList: React.FC<AnimeEpisodeListProps> = ({
  episodes,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAscending, setIsAscending] = useState(false);

  const sortedAndFiltered = useMemo(() => {
    let list = [...episodes];
    if (isAscending) {
      list.sort((a, b) => a.episodeNumber - b.episodeNumber);
    } else {
      list.sort((a, b) => b.episodeNumber - a.episodeNumber);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (ep) =>
          ep.title.toLowerCase().includes(q) ||
          ep.episodeNumber.toString().includes(q)
      );
    }
    return list;
  }, [episodes, searchTerm, isAscending]);

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-white flex items-center gap-2">
            <span>Daftar Episode</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 font-semibold">
              {episodes.length} Episode
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Episode */}
          <div className="relative flex-1 sm:w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari episode..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100"
            />
          </div>

          {/* Sort Order Toggle */}
          <button
            onClick={() => setIsAscending(!isAscending)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#09090b] hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 transition-all shrink-0 cursor-pointer"
            title="Ubah Urutan"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">
              {isAscending ? 'Terlama' : 'Terbaru'}
            </span>
          </button>
        </div>
      </div>

      {/* Episode Items */}
      {sortedAndFiltered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5 max-h-[500px] overflow-y-auto pr-1">
          {sortedAndFiltered.map((ep) => (
            <Link
              key={ep.slug}
              href={`/anime/watch/${ep.slug}`}
              // Panaskan data stream episode begitu kursor/jari mendekat, sebelum diklik.
              onPointerEnter={() => warmEpisode(ep.slug)}
              onTouchStart={() => warmEpisode(ep.slug)}
              onFocus={() => warmEpisode(ep.slug)}
              className="group flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#121214] hover:bg-zinc-50 dark:hover:bg-[#18181b] border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-200"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-zinc-950 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700 transition-all">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-950 dark:group-hover:text-white truncate">
                    {ep.title}
                  </p>
                  {ep.releaseDate && (
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-2.5 h-2.5" />
                      {ep.releaseDate}
                    </p>
                  )}
                </div>
              </div>

              <span className="text-[11px] font-medium text-zinc-500 group-hover:text-zinc-950 dark:group-hover:text-white shrink-0 ml-2">
                Nonton &rarr;
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-xs text-zinc-500 bg-zinc-50 dark:bg-[#121214] rounded-xl border border-zinc-200 dark:border-zinc-800">
          Tidak ada episode yang sesuai dengan pencarian &quot;{searchTerm}&quot;.
        </div>
      )}
    </div>
  );
};
