'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  History,
  Trash2,
  Play,
  Clock,
  BookOpen,
  Search,
} from 'lucide-react';
import { ReadingProgress } from '@/types/comic';
import {
  getReadingHistory,
  removeReadingHistory,
  clearReadingHistory,
} from '@/utils/storage';

export default function HistoryPage() {
  const [history, setHistory] = useState<ReadingProgress[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHistory(getReadingHistory());
  }, []);

  const handleRemoveItem = (comicId: string) => {
    removeReadingHistory(comicId);
    setHistory(getReadingHistory());
  };

  const handleClearAll = () => {
    if (window.confirm('Hapus seluruh riwayat membaca Anda?')) {
      clearReadingHistory();
      setHistory([]);
    }
  };

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase();
    return history.filter(
      (h) =>
        h.comicTitle.toLowerCase().includes(q) ||
        h.chapterNumber.toString().includes(q)
    );
  }, [history, searchQuery]);

  // Format timestamp helper
  const formatDate = (isoString: string): string => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Baru saja';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700">
                <History className="w-5 h-5" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
                Riwayat Membaca
              </h1>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Lanjutkan membaca dari chapter dan halaman terakhir yang Anda kunjungi.
            </p>
          </div>

          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-all self-start sm:self-auto cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Semua Riwayat</span>
            </button>
          )}
        </div>

        {/* Search filter if items exist */}
        {mounted && history.length > 0 && (
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari dalam riwayat komik..."
              className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100"
            />
          </div>
        )}

        {/* History List */}
        {mounted && filteredHistory.length > 0 ? (
          <div className="space-y-3">
            {filteredHistory.map((item) => (
              <div
                key={item.comicId}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Comic Cover */}
                  <Link
                    href={`/reader/${item.comicId}/${item.chapterId}`}
                    className="relative w-16 h-22 sm:w-20 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                  >
                    <img
                      src={item.comicCover?.trim() ? item.comicCover : '/placeholder-comic.svg'}
                      alt={item.comicTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                  </Link>

                  {/* Comic Details */}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 uppercase tracking-widest">
                        {item.readingMode}
                      </span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        {formatDate(item.lastReadAt)}
                      </span>
                    </div>

                    <Link href={`/comic/${item.comicId}`}>
                      <h3 className="font-bold text-sm sm:text-base text-zinc-950 dark:text-white truncate hover:underline transition-colors">
                        {item.comicTitle}
                      </h3>
                    </Link>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                      <span>
                        Chapter {item.chapterNumber} • Halaman {item.pageNumber} dari {item.totalPages}
                      </span>
                    </p>

                    {/* Progress percentage bar */}
                    <div className="w-full max-w-md pt-1 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                        <span>Progress Baca</span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-200">{Math.round(item.percentage)}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-zinc-900 dark:bg-white rounded-full transition-all"
                          style={{ width: `${Math.min(Math.max(item.percentage, 5), 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Link
                    href={`/reader/${item.comicId}/${item.chapterId}`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Lanjut Baca</span>
                  </Link>
                  <button
                    onClick={() => handleRemoveItem(item.comicId)}
                    className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                    title="Hapus dari riwayat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          mounted && (
            <div className="py-20 text-center rounded-3xl bg-zinc-50 dark:bg-[#121214] border border-dashed border-zinc-200 dark:border-zinc-800 p-8 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                <History className="w-6 h-6" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-white">Belum Ada Riwayat Membaca</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                {searchQuery
                  ? `Tidak ditemukan komik dengan kata kunci "${searchQuery}".`
                  : 'Komik yang Anda buka dan baca akan otomatis tercatat di sini sehingga Anda dapat melanjutkan kapan saja.'}
              </p>
              <div className="pt-2">
                <Link
                  href="/"
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 text-xs font-semibold shadow-xs transition-all inline-block"
                >
                  Mulai Membaca Sekarang
                </Link>
              </div>
            </div>
          )
        )}
      </main>

      <Footer />
    </div>
  );
}
