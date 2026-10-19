export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AnimeEpisodeList } from '@/components/anime/AnimeEpisodeList';
import { AnimeDetailCover } from '@/components/anime/AnimeDetailCover';
import { getAnimeDetail } from '@/services/animeService';
import {
  ArrowLeft,
  Star,
  Play,
  Film,
  Info,
} from 'lucide-react';

interface AnimeDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AnimeDetailPage({
  params,
}: AnimeDetailPageProps) {
  const { slug } = await params;
  const anime = await getAnimeDetail(slug);

  if (!anime) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 text-center space-y-4">
          <Film className="w-12 h-12 mx-auto text-zinc-400" />
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white">Anime Tidak Ditemukan</h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Serial anime dengan slug &quot;{slug}&quot; tidak dapat ditemukan di server kami.
          </p>
          <div className="pt-2">
            <Link
              href="/anime"
              className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 text-xs font-semibold shadow-xs transition-all inline-block"
            >
              Kembali ke Katalog Anime
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const firstEpisode =
    anime.episodes.length > 0
      ? anime.episodes[anime.episodes.length - 1]
      : null;
  const latestEpisode = anime.episodes.length > 0 ? anime.episodes[0] : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/anime"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Katalog Anime</span>
          </Link>
        </div>

        {/* Hero Header Section */}
        <div className="relative rounded-3xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 p-5 sm:p-8 overflow-hidden shadow-xs transition-colors duration-200">
          <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            {/* Cover Poster */}
            <AnimeDetailCover coverImage={anime.coverImage} title={anime.title} />

            {/* Info and Metadata */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 uppercase tracking-widest">
                    {anime.status || 'Ongoing'}
                  </span>
                  {anime.score && anime.score !== 'N/A' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
                      <Star className="w-3 h-3 fill-zinc-900 dark:fill-zinc-100" />
                      <span>{anime.score}</span>
                    </span>
                  )}
                  {anime.studio && (
                    <span className="text-[11px] text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                      {anime.studio}
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
                  {anime.title}
                </h1>
                {anime.altTitle && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 italic font-light">
                    {anime.altTitle}
                  </p>
                )}
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-400 dark:text-zinc-500 block text-[10px] uppercase font-semibold">Episode</span>
                  <span className="text-zinc-900 dark:text-zinc-100 font-semibold">
                    {anime.totalEpisodes || `${anime.episodes.length} Eps`}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-400 dark:text-zinc-500 block text-[10px] uppercase font-semibold">Durasi</span>
                  <span className="text-zinc-900 dark:text-zinc-100 font-semibold">
                    {anime.duration || '24 min'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-400 dark:text-zinc-500 block text-[10px] uppercase font-semibold">Rilis</span>
                  <span className="text-zinc-900 dark:text-zinc-100 font-semibold truncate block">
                    {anime.releaseDate || 'Unknown'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-400 dark:text-zinc-500 block text-[10px] uppercase font-semibold">Format</span>
                  <span className="text-zinc-900 dark:text-zinc-100 font-semibold">TV Series</span>
                </div>
              </div>

              {/* Genres */}
              {anime.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {anime.genres.map((g) => (
                    <span
                      key={g}
                      className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium border border-zinc-200 dark:border-zinc-800"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {latestEpisode && (
                  <Link
                    href={`/anime/watch/${latestEpisode.slug}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Tonton Episode Terbaru ({latestEpisode.title})</span>
                  </Link>
                )}
                {firstEpisode && firstEpisode.slug !== latestEpisode?.slug && (
                  <Link
                    href={`/anime/watch/${firstEpisode.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-medium border border-zinc-300 dark:border-zinc-700 transition-all cursor-pointer"
                  >
                    <span>Mulai dari Episode 1</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Synopsis Section */}
        {anime.synopsis && (
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 space-y-2 transition-colors duration-200">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-zinc-400" />
              <span>Sinopsis</span>
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
              {anime.synopsis}
            </p>
          </div>
        )}

        {/* Episode List Section */}
        <AnimeEpisodeList
          episodes={anime.episodes}
          animeSlug={anime.slug}
        />
      </main>

      <Footer />
    </div>
  );
}
