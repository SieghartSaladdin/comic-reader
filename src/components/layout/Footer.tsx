import React from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { NAV_ITEMS } from './navItems';

export const Footer: React.FC = () => (
  <footer className="mt-auto border-t border-zinc-200 bg-[#fafafa] text-zinc-600 dark:border-zinc-800/80 dark:bg-[#09090b] dark:text-zinc-400">
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between lg:px-8">
      <div className="max-w-md space-y-3">
        <Link href="/" className="inline-flex" aria-label="Comic and Anime - beranda">
          <Logo showTagline markClassName="h-8 w-8" />
        </Link>
        <p className="text-sm leading-relaxed">
          Baca komik dan tonton anime dari sumber pihak ketiga. Bookmark dan riwayat bacaan
          tersimpan di browser ini saja, bukan di server.
        </p>
        <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          Semua komik, gambar, dan video adalah hak cipta kreator dan penerbit aslinya. Situs ini
          tidak menyimpan file mereka.
        </p>
      </div>

      <nav aria-label="Tautan footer">
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm md:flex-col">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-zinc-700 underline-offset-4 transition-colors hover:text-zinc-950 hover:underline dark:text-zinc-300 dark:hover:text-white"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>

    {/* Ruang untuk bar tab navigasi bawah di layar kecil agar konten tidak tertutup */}
    <div aria-hidden="true" className="h-[calc(4rem+env(safe-area-inset-bottom))] md:hidden" />
  </footer>
);
