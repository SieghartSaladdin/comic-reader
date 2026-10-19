'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = 2026;

  return (
    <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800/80 bg-[#fafafa] dark:bg-[#09090b] text-zinc-500 dark:text-zinc-400 text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 font-bold text-base tracking-tight text-zinc-900 dark:text-white group"
            >
              <div className="w-7 h-7 rounded-md bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center font-bold text-xs tracking-widest">
                CR
              </div>
              <span className="tracking-tight">
                COMIC READER
              </span>
            </Link>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm leading-relaxed">
              Platform editorial digital untuk membaca Webtoon, Manga, dan streaming serial Anime
              dengan pengalaman visual minimalis, tipografi bersih, dan kinerja responsif.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-500 pt-1">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>
                Seluruh materi komik, gambar, dan video merupakan hak cipta kreator dan penerbit aslinya.
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-200 uppercase tracking-widest">
              Navigasi
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Katalog Komik
                </Link>
              </li>
              <li>
                <Link href="/anime" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Serial Anime
                </Link>
              </li>
              <li>
                <Link href="/bookmarks" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Koleksi Bookmark
                </Link>
              </li>
              <li>
                <Link href="/history" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors">
                  Riwayat Bacaan
                </Link>
              </li>
            </ul>
          </div>

          {/* Standards & Experience */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-200 uppercase tracking-widest">
              Pengalaman Membaca
            </h4>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                <span>Webtoon Vertical Infinite Scroll</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                <span>Manga Page Flip (LTR / RTL)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                <span>Penyimpanan Lokal & Offline-ready</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                <span>Sinkronisasi Progress Baca Otomatis</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500 dark:text-zinc-500">
          <p>© {currentYear} Comic Reader. Minimalist Editorial Architecture.</p>
          <div className="flex items-center gap-4">
            <span>Dirancang dengan fokus kenyamanan membaca</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
