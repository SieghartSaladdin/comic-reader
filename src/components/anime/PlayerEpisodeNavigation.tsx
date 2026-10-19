'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimeEpisodeItem } from '@/types/anime';
import { ChevronLeft, ChevronRight, ListVideo } from 'lucide-react';

interface PlayerEpisodeNavigationProps {
  prevEpisodeSlug?: string;
  nextEpisodeSlug?: string;
  episodes?: AnimeEpisodeItem[];
  currentEpisodeSlug: string;
}

export const PlayerEpisodeNavigation: React.FC<PlayerEpisodeNavigationProps> = ({
  prevEpisodeSlug,
  nextEpisodeSlug,
  episodes = [],
  currentEpisodeSlug,
}) => {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-2">
        {prevEpisodeSlug ? (
          <Link
            href={`/anime/watch/${prevEpisodeSlug}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-medium border border-zinc-200 dark:border-zinc-700 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            <span>Eps Sebelumnya</span>
          </Link>
        ) : (
          <button disabled className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900/50 text-zinc-400 dark:text-zinc-600 text-xs font-medium border border-zinc-200 dark:border-zinc-800/80 cursor-not-allowed">
            <ChevronLeft className="w-4 h-4" />
            <span>Eps Sebelumnya</span>
          </button>
        )}

        {nextEpisodeSlug ? (
          <Link
            href={`/anime/watch/${nextEpisodeSlug}`}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <span>Eps Selanjutnya</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <button disabled className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900/50 text-zinc-400 dark:text-zinc-600 text-xs font-medium border border-zinc-200 dark:border-zinc-800/80 cursor-not-allowed">
            <span>Eps Selanjutnya</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {episodes.length > 0 && (
        <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
          <ListVideo className="w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0" />
          <select
            value={currentEpisodeSlug}
            onChange={(e) => e.target.value && router.push(`/anime/watch/${e.target.value}`)}
            className="w-full py-2 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 cursor-pointer"
          >
            {episodes.map((ep) => (
              <option key={ep.slug} value={ep.slug}>{ep.title}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
