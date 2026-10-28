import React, { Suspense } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ComicDetailContent } from '@/components/comic/ComicDetailContent';
import { getComicDetail } from '@/services/komikService';
import { ArrowLeft, BookX } from 'lucide-react';

interface ComicDetailPageProps {
  params: Promise<{ id: string }>;
}

/** Kerangka halaman detail: tampil seketika dari App Shell sementara data komik dimuat. */
function ComicDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Memuat detail komik">
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="aspect-[3/4] w-full max-w-[240px] rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="flex-1 space-y-4">
          <div className="h-8 w-2/3 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-24 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        ))}
      </div>
    </div>
  );
}

async function ComicDetailLoader({ idPromise }: { idPromise: Promise<{ id: string }> }) {
  const { id } = await idPromise;
  const comic = await getComicDetail(id);

  if (!comic) {
    return (
      <div className="py-16 text-center rounded-2xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 p-8 space-y-3">
        <BookX className="w-10 h-10 mx-auto text-zinc-500" />
        <h2 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-white">Komik tidak ditemukan</h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
          Komik &quot;{id}&quot; tidak ada di sumber, atau sumbernya sedang tidak bisa dihubungi.
          Muat ulang halaman ini nanti, atau pilih komik lain dari katalog.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 text-xs font-semibold transition-colors inline-block"
          >
            Kembali ke katalog komik
          </Link>
        </div>
      </div>
    );
  }

  return <ComicDetailContent comic={comic} />;
}

export default function ComicDetailPage({ params }: ComicDetailPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Comic</span>
          </Link>
        </div>

        <Suspense fallback={<ComicDetailSkeleton />}>
          <ComicDetailLoader idPromise={params} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
