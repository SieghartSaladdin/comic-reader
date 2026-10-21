import React, { Suspense } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AnimeCatalog } from '@/components/anime/AnimeCatalog';
import { getOngoingAnime } from '@/services/animeService';
import { getAnimeCatalog } from '@/services/animeCatalogService';
import { getAnimeRailTabs } from '@/services/railService';
import { RecommendationRail } from '@/components/recommendation/RecommendationRail';
import { Tv, PlayCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Nonton Anime Sub Indo Terlengkap | Comic and Anime',
  description:
    'Streaming anime subtitle Indonesia gratis update setiap hari dengan antarmuka minimalis elegan.',
};

/** Tiga kartu anime ongoing di sisi hero. Data dari cache server. */
async function FeaturedAnime() {
  const featured = (await getOngoingAnime()).slice(0, 3);
  if (featured.length === 0) return null;

  return (
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
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="absolute bottom-2 left-2 right-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-white bg-black/60 px-1.5 py-0.5 rounded border border-white/20 mb-1 inline-block">
              Ongoing
            </span>
            <p className="text-[11px] font-semibold text-white truncate">{item.title}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

/** Rail rekomendasi dan katalog anime. Seluruh data dari cache server. */
async function AnimeRailAndCatalog() {
  const [railTabs, initialCatalog] = await Promise.all([
    getAnimeRailTabs(),
    getAnimeCatalog({ page: 1 }),
  ]);

  return (
    <>
      <RecommendationRail
        description="Update terbaru, anime tamat berating tinggi, dan pilihan per genre."
        tabs={railTabs}
      />

      {/* Katalog seluruh anime: pencarian, filter, dan pagination */}
      <div id="anime-grid">
        <AnimeCatalog initialResult={initialCatalog} />
      </div>
    </>
  );
}

function AnimeSectionsSkeleton() {
  return (
    <div className="space-y-10 animate-pulse" aria-hidden="true">
      <div className="space-y-4">
        <div className="h-7 w-48 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-9 w-72 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[314px] w-[185px] shrink-0 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-[3/4.2] rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        ))}
      </div>
    </div>
  );
}

export default function AnimePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        {/* Hero: kartu sinematik bernada merah tua, selaras dengan hero halaman komik */}
        <div className="relative isolate overflow-hidden rounded-3xl bg-[#0d0a0a] text-white shadow-xl ring-1 ring-black/5 dark:ring-white/10">
          <div className="absolute inset-0 -z-10" aria-hidden="true">
            <div className="absolute -left-24 -top-28 h-80 w-80 rounded-full bg-accent-700/35 blur-3xl" />
            <div className="absolute -bottom-32 right-0 h-80 w-96 rounded-full bg-accent-900/40 blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-br from-accent-950/60 via-transparent to-transparent" />
          </div>

          <div className="flex flex-col items-center justify-between gap-8 px-6 py-10 sm:px-10 lg:flex-row lg:px-14 lg:py-14">
            <div className="max-w-2xl space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-accent-200 ring-1 ring-white/10 backdrop-blur">
                <Tv className="h-3.5 w-3.5" />
                <span>Anime Sub Indo</span>
              </div>

              <h1 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Streaming Serial <span className="text-accent-300">Anime</span>
              </h1>

              <p className="mx-auto max-w-xl text-sm leading-relaxed text-white/70 lg:mx-0">
                Tonton episode anime ongoing dan tamat dengan server pemutar cepat, tata letak tanpa
                distraksi, serta pembaruan rilis setiap minggu.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-1 lg:justify-start">
                <a
                  href="#anime-grid"
                  className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-zinc-950 shadow-[0_8px_28px_rgba(255,255,255,0.12)] transition hover:-translate-y-0.5 hover:bg-zinc-200"
                >
                  <PlayCircle className="h-4 w-4" />
                  <span>Jelajahi Katalog</span>
                </a>
                <Link
                  href="/"
                  className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-white/20"
                >
                  <span>Baca Komik &amp; Manga</span>
                </Link>
              </div>
            </div>

            <Suspense fallback={null}>
              <FeaturedAnime />
            </Suspense>
          </div>
        </div>

        <Suspense fallback={<AnimeSectionsSkeleton />}>
          <AnimeRailAndCatalog />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
