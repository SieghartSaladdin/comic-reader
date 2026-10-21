import React, { Suspense } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { getReaderData } from '@/services/readerService';
import { ReaderClient } from '@/components/reader/ReaderClient';

interface ReaderPageProps {
  params: Promise<{
    comicId: string;
    chapterId: string;
  }>;
}

/** Kerangka reader: tampil seketika dari App Shell sementara halaman chapter dimuat. */
function ReaderLoadingFallback() {
  return (
    <div
      className="min-h-screen bg-[#121212] flex flex-col items-center justify-center text-zinc-300"
      aria-busy="true"
    >
      <div className="w-8 h-8 mb-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      <p className="text-xs font-semibold tracking-wide">Menyiapkan Reader...</p>
    </div>
  );
}

/** Membaca `params` di dalam Suspense, lalu mengambil data chapter dan komik dari cache server. */
async function ReaderLoader({ params }: ReaderPageProps) {
  const { comicId, chapterId } = await params;
  const data = await getReaderData(comicId, chapterId);

  if (!data) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="p-4 rounded-full bg-rose-500/10 text-rose-400 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-zinc-100 mb-2">Gagal Membuka Chapter</h2>
        <p className="text-xs text-zinc-400 max-w-sm mb-6">
          Chapter tidak ditemukan atau sedang gagal dimuat dari sumber.
        </p>
        <div className="flex gap-3">
          <Link
            href={`/comic/${comicId}`}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Komik
          </Link>
          {/* Tautan biasa (bukan navigasi klien) agar memuat ulang dari server */}
          <a
            href={`/reader/${comicId}/${chapterId}`}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold rounded-xl transition"
          >
            Coba Lagi
          </a>
        </div>
      </div>
    );
  }

  return (
    <ReaderClient comicId={comicId} chapterId={chapterId} comic={data.comic} chapter={data.chapter} />
  );
}

export default function ReaderPage({ params }: ReaderPageProps) {
  return (
    <Suspense fallback={<ReaderLoadingFallback />}>
      <ReaderLoader params={params} />
    </Suspense>
  );
}
