export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EpisodePlayer } from '@/components/anime/EpisodePlayer';
import { AnimeCard } from '@/components/anime/AnimeCard';
import {
  getEpisodeStream,
  getAnimeDetail,
  getOngoingAnime,
} from '@/services/animeService';
import { ArrowLeft, Film, ListVideo } from 'lucide-react';

interface WatchAnimePageProps {
  params: Promise<{ slug: string }>;
}

export default async function WatchAnimePage({ params }: WatchAnimePageProps) {
  const { slug } = await params;
  const streamData = await getEpisodeStream(slug);

  if (!streamData) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 text-center space-y-4">
          <Film className="w-12 h-12 mx-auto text-zinc-400" />
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white">
            Episode Tidak Ditemukan
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Stream video untuk episode &quot;{slug}&quot; tidak dapat dimuat saat ini.
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

  // Ambil detail anime untuk daftar episode lengkap jika ada animeSlug
  const animeDetail = streamData.animeSlug
    ? await getAnimeDetail(streamData.animeSlug)
    : null;

  // Rekomendasi anime lainnya
  const allOngoing = await getOngoingAnime();
  const recommendations = allOngoing
    .filter((a) => a.slug !== streamData.animeSlug)
    .slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <Link
              href="/anime"
              className="hover:text-zinc-950 dark:hover:text-white transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Anime</span>
            </Link>
            <span>/</span>
            {animeDetail ? (
              <Link
                href={`/anime/${animeDetail.slug}`}
                className="hover:text-zinc-950 dark:hover:text-white text-zinc-700 dark:text-zinc-300 transition-colors truncate max-w-xs font-medium"
              >
                {animeDetail.title}
              </Link>
            ) : (
              <span className="text-zinc-700 dark:text-zinc-300 truncate max-w-xs font-medium">
                {streamData.animeTitle}
              </span>
            )}
            <span>/</span>
            <span className="text-zinc-900 dark:text-white font-semibold">Nonton</span>
          </div>

          {animeDetail && (
            <Link
              href={`/anime/${animeDetail.slug}`}
              className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white font-medium transition-colors"
            >
              Lihat Semua Episode &rarr;
            </Link>
          )}
        </div>

        {/* Video Player Section */}
        <div className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-lg sm:text-2xl font-bold text-zinc-950 dark:text-white tracking-tight">
              {streamData.episodeTitle}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Subtitle Indonesia • Kualitas Video HD Stream
            </p>
          </div>

          <EpisodePlayer
            streamData={streamData}
            episodes={animeDetail?.episodes || []}
            currentEpisodeSlug={slug}
          />
        </div>

        {/* Episode Quick Switcher Chips */}
        {animeDetail && animeDetail.episodes.length > 1 && (
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 space-y-3 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-widest flex items-center gap-2">
                <ListVideo className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                <span>Pilih Episode Lain ({animeDetail.title})</span>
              </h3>
              <span className="text-[11px] text-zinc-500">
                {animeDetail.episodes.length} Total Episode
              </span>
            </div>

            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
              {animeDetail.episodes.map((ep) => {
                const isCurrent = ep.slug === slug;
                return (
                  <Link
                    key={ep.slug}
                    href={`/anime/watch/${ep.slug}`}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      isCurrent
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-semibold shadow-xs'
                        : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    Eps {ep.episodeNumber}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Recommended Anime Section */}
        {recommendations.length > 0 && (
          <div className="pt-6 space-y-4 border-t border-zinc-200 dark:border-zinc-800/80">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white tracking-tight">
                  Rekomendasi Anime Lainnya
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Serial anime seru lainnya yang siap kamu tonton
                </p>
              </div>
              <Link
                href="/anime"
                className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
              >
                Lihat Semua &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {recommendations.map((anime) => (
                <AnimeCard key={anime.slug} anime={anime} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
