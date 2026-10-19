export const dynamic = 'force-dynamic';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AnimeGrid } from '@/components/anime/AnimeGrid';
import { getOngoingAnime } from '@/services/animeService';
import { Tv, PlayCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Nonton Anime Sub Indo Terlengkap | Comic Reader Anime Mirror',
  description:
    'Streaming anime subtitle Indonesia gratis update setiap hari dengan antarmuka minimalis elegan.',
};

export default async function AnimePage() {
  const ongoingList = await getOngoingAnime();
  const featured = ongoingList.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        {/* Editorial Architecture Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 p-6 sm:p-10 shadow-xs transition-colors duration-200">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold uppercase tracking-wider">
                <Tv className="w-3.5 h-3.5" />
                <span>Anime Mirror Subtitle Indonesia</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-zinc-950 dark:text-white tracking-tight leading-tight">
                Streaming Serial Anime Sub Indo
              </h1>

              <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-xl">
                Tonton episode anime ongoing dan tamat kualitas HD dengan server pemutar cepat,
                tata letak editorial tanpa distraksi, serta pembaruan rilis setiap minggu.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <a
                  href="#anime-grid"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Jelajahi Episode Terbaru</span>
                </a>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-medium border border-zinc-300 dark:border-zinc-700 transition-all cursor-pointer"
                >
                  <span>Baca Komik & Manga</span>
                </Link>
              </div>
            </div>

            {/* Featured Mini Cards Showcase */}
            {featured.length > 0 && (
              <div className="hidden sm:flex items-center gap-3 shrink-0">
                {featured.map((item, idx) => (
                  <Link
                    key={item.slug}
                    href={`/anime/${item.slug}`}
                    className={`group relative w-32 md:w-36 aspect-[3/4.2] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700/80 shadow-md transition-all duration-300 hover:scale-105 hover:border-zinc-400 dark:hover:border-zinc-500 ${
                      idx === 1 ? '-translate-y-2' : ''
                    }`}
                  >
                    <img
                      src={item.coverImage?.trim() ? item.coverImage : '/placeholder-anime.svg'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-white bg-black/60 px-1.5 py-0.5 rounded border border-white/20 mb-1 inline-block">
                        Ongoing
                      </span>
                      <p className="text-[11px] font-semibold text-white truncate">
                        {item.title}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Anime Grid Section */}
        <div id="anime-grid">
          <AnimeGrid
            animeList={ongoingList}
            title="Anime Ongoing Terbaru"
            description="Serial anime yang saat ini sedang aktif tayang tiap minggu di Jepang dengan takarir Bahasa Indonesia"
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
