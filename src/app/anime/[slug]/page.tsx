import React, { Suspense } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AnimeDetailView } from '@/components/anime/AnimeDetailView';
import { getAnimeDetail } from '@/services/animeService';
import { ArrowLeft, Film } from 'lucide-react';

interface AnimeDetailPageProps {
  params: Promise<{ slug: string }>;
}

/** Kerangka halaman detail: tampil seketika dari App Shell sementara data anime dimuat. */
function AnimeDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Memuat detail anime">
      <div className="flex flex-col gap-6 rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-[#121214] sm:p-8 md:flex-row">
        <div className="aspect-[3/4.2] w-full max-w-[220px] rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="flex-1 space-y-4">
          <div className="h-8 w-2/3 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            ))}
          </div>
          <div className="h-10 w-64 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
      <div className="h-24 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}

/** Membaca `params` di dalam Suspense agar kerangka halaman tetap statis dan instan. */
async function AnimeDetailLoader({ params }: AnimeDetailPageProps) {
  const { slug } = await params;
  const anime = await getAnimeDetail(slug);

  if (!anime) {
    return (
      <div className="py-16 text-center space-y-4">
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
      </div>
    );
  }

  return <AnimeDetailView anime={anime} />;
}

export default function AnimeDetailPage({ params }: AnimeDetailPageProps) {
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

        <Suspense fallback={<AnimeDetailSkeleton />}>
          <AnimeDetailLoader params={params} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
