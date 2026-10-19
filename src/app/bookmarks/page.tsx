'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  Bookmark,
  Trash2,
  ArrowUpDown,
  Search,
  Star,
  ExternalLink,
} from 'lucide-react';
import { BookmarkItem } from '@/types/comic';
import { getBookmarks, removeBookmark } from '@/utils/storage';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'title' | 'rating'>('latest');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setBookmarks(getBookmarks());
  }, []);

  const handleRemove = (comicId: string) => {
    removeBookmark(comicId);
    setBookmarks(getBookmarks());
    window.dispatchEvent(new Event('comic_bookmark_updated'));
  };

  const handleClearAll = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus semua bookmark?')) {
      bookmarks.forEach((b) => removeBookmark(b.comicId));
      setBookmarks([]);
      window.dispatchEvent(new Event('comic_bookmark_updated'));
    }
  };

  const filteredBookmarks = useMemo(() => {
    let list = [...bookmarks];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.genres?.some((g) => g.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    });

    return list;
  }, [bookmarks, searchQuery, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700">
                <Bookmark className="w-5 h-5 fill-current" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
                Bookmarks Saya
              </h1>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Koleksi komik dan manga yang Anda simpan untuk dibaca kembali.
            </p>
          </div>

          {bookmarks.length > 0 && (
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-all self-start sm:self-auto cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Semua</span>
            </button>
          )}
        </div>

        {/* Toolbar: Search and Sort */}
        {mounted && bookmarks.length > 0 && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-50 dark:bg-[#121214] p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari dalam bookmark..."
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100"
              />
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'latest' | 'title' | 'rating')}
                className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 cursor-pointer"
              >
                <option value="latest">Terbaru Ditambahkan</option>
                <option value="title">Judul (A-Z)</option>
                <option value="rating">Rating Tertinggi</option>
              </select>
            </div>
          </div>
        )}

        {/* Bookmark Grid */}
        {mounted && filteredBookmarks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredBookmarks.map((item) => (
              <div
                key={item.comicId}
                className="group relative flex flex-col rounded-2xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-600 p-2.5 transition-all duration-300 hover:shadow-md"
              >
                <Link
                  href={`/comic/${item.comicId}`}
                  className="block relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                >
                  <img
                    src={item.coverImage?.trim() ? item.coverImage : '/placeholder-comic.svg'}
                    alt={item.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 z-10">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemove(item.comicId);
                      }}
                      className="p-1.5 rounded-lg bg-black/60 hover:bg-black text-zinc-300 hover:text-white backdrop-blur-md transition-colors cursor-pointer"
                      title="Hapus dari bookmark"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {item.rating && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[11px] font-semibold text-white bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-white/10">
                      <Star className="w-3 h-3 fill-white text-white" />
                      {item.rating.toFixed(1)}
                    </div>
                  )}
                </Link>

                <div className="mt-2.5 flex flex-col flex-1 justify-between px-1">
                  <div>
                    <Link href={`/comic/${item.comicId}`}>
                      <h3
                        className="font-semibold text-xs md:text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors"
                        title={item.title}
                      >
                        {item.title}
                      </h3>
                    </Link>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                      {item.lastChapter || 'Chapter 1'}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                    <Link
                      href={`/comic/${item.comicId}`}
                      className="w-full flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 text-xs font-semibold transition-all shadow-xs"
                    >
                      <span>Detail</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          mounted && (
            <div className="py-20 text-center rounded-3xl bg-zinc-50 dark:bg-[#121214] border border-dashed border-zinc-200 dark:border-zinc-800 p-8 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                <Bookmark className="w-6 h-6" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-white">Belum Ada Bookmark</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                {searchQuery
                  ? `Tidak ada komik bookmark yang cocok dengan "${searchQuery}".`
                  : 'Anda belum menandai komik favorit. Klik tombol bookmark pada kartu atau detail komik untuk menyimpannya di sini.'}
              </p>
              <div className="pt-2">
                <Link
                  href="/"
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 text-xs font-semibold shadow-xs transition-all inline-block"
                >
                  Jelajahi Komik Sekarang
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
