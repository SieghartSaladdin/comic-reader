export const dynamic = 'force-dynamic';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ComicDetailContent } from '@/components/comic/ComicDetailContent';
import { getComicDetail } from '@/services/komikService';
import { ArrowLeft, BookX, Loader2 } from 'lucide-react';

interface ComicDetailPageProps {
  params: Promise<{ id: string }>;
}

async function ComicDetailLoader({ idPromise }: { idPromise: Promise<{ id: string }> }) {
  const { id } = await idPromise;
  const comic = await getComicDetail(id);

  if (!comic) {
    return (
      <div className="py-20 text-center rounded-3xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 p-8 space-y-4 shadow-xs">
        <BookX className="w-10 h-10 mx-auto text-zinc-400" />
        <h2 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-white">Komik Tidak Ditemukan</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
          Komik dengan slug &quot;{id}&quot; tidak ditemukan atau sedang mengalami gangguan jaringan saat memuat dari KomikIndo.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 text-xs font-semibold shadow-xs transition-all inline-block"
          >
            Jelajahi Komik Lain
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

        <Suspense
          fallback={
            <div className="py-24 flex flex-col items-center justify-center text-zinc-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-900 dark:text-white" />
              <p className="text-xs">Memuat detail komik...</p>
            </div>
          }
        >
          <ComicDetailLoader idPromise={params} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
