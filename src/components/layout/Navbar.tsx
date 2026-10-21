'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { Moon, Search, Sun } from 'lucide-react';
import { getBookmarks } from '@/utils/storage';
import { useTheme } from '@/components/theme/ThemeProvider';
import { SearchModal as SearchModalType } from './SearchModal';
import { Logo } from './Logo';
import { MobileTabBar } from './MobileTabBar';
import { NAV_ITEMS, isNavItemActive } from './navItems';

// Modal pencarian hanya dimuat saat pertama dibuka.
const SearchModal = dynamic<React.ComponentProps<typeof SearchModalType>>(() =>
  import('./SearchModal').then((mod) => mod.SearchModal)
);

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

/** Isi navbar. `pathname` null berarti belum diketahui (saat prerender): tanpa penanda halaman aktif. */
const NavbarContent: React.FC<{ pathname: string | null }> = ({ pathname }) => {
  const { theme, toggleTheme, mounted } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);

  const syncBookmarks = useCallback(() => {
    try {
      setBookmarkCount(getBookmarks().length);
    } catch {
      setBookmarkCount(0);
    }
  }, []);

  useEffect(() => {
    syncBookmarks();
    window.addEventListener('storage', syncBookmarks);
    window.addEventListener('comic_bookmark_updated', syncBookmarks);
    return () => {
      window.removeEventListener('storage', syncBookmarks);
      window.removeEventListener('comic_bookmark_updated', syncBookmarks);
    };
  }, [pathname, syncBookmarks]);

  // Pintasan: "/" atau Ctrl/Cmd+K membuka pencarian.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isShortcut =
        (e.key === '/' && !isTypingTarget(e.target)) ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k');
      if (!isShortcut) return;
      e.preventDefault();
      setIsSearchOpen(true);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const iconButton =
    'flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white/70 text-zinc-700 transition-all hover:border-zinc-300 hover:bg-white hover:text-zinc-950 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-300 dark:hover:bg-white/[0.09] dark:hover:text-white cursor-pointer';

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/70 bg-white/80 backdrop-blur-xl transition-colors duration-200 dark:border-white/[0.06] dark:bg-[#09090b]/80">
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="group shrink-0" aria-label="Comic and Anime - beranda">
            <span className="block transition-transform duration-300 group-hover:scale-[1.03]">
              <Logo showTagline />
            </span>
          </Link>

          {/* Navigasi desktop: pil di tengah */}
          <nav aria-label="Navigasi utama" className="hidden justify-center md:flex">
            <ul className="flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-100/70 p-1 dark:border-white/[0.07] dark:bg-white/[0.04]">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isNavItemActive(item, pathname);
                const badge = item.showBookmarkCount && bookmarkCount > 0 ? bookmarkCount : null;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={`relative flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-medium transition-all ${
                        active
                          ? 'bg-accent-600 text-white shadow-[0_2px_12px_rgba(152,64,60,0.4)]'
                          : 'text-zinc-600 hover:bg-white hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/[0.07] dark:hover:text-white'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{item.label}</span>
                      {badge !== null && (
                        <span
                          className={`rounded-full px-1.5 text-[10px] font-bold leading-4 ${
                            active ? 'bg-white/25 text-white' : 'bg-accent-600 text-white'
                          }`}
                        >
                          {badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Pencarian + tema */}
          <div className="col-start-3 flex items-center gap-2 md:col-start-auto">
            {/* Desktop: kolom pencarian lebar */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Cari judul"
              className="hidden h-10 w-56 cursor-pointer items-center gap-2.5 rounded-full border border-zinc-200 bg-white/70 px-4 text-[13px] text-zinc-500 transition-all hover:border-zinc-300 hover:bg-white dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-400 dark:hover:bg-white/[0.08] md:flex lg:w-64"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate text-left">Cari komik...</span>
              <kbd className="rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-400">
                /
              </kbd>
            </button>

            {/* Mobile: ikon pencarian */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Cari judul"
              className={`${iconButton} md:hidden`}
            >
              <Search className="h-[18px] w-[18px]" />
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className={iconButton}
              title={theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
              aria-label="Ganti tema"
            >
              {mounted ? (
                theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />
              ) : (
                <span className="h-[18px] w-[18px]" />
              )}
            </button>
          </div>
        </div>

        {/* Garis aksen tipis di tepi bawah */}
        <div
          aria-hidden="true"
          className="h-px bg-gradient-to-r from-transparent via-accent-600/50 to-transparent"
        />
      </header>

      <MobileTabBar pathname={pathname} bookmarkCount={bookmarkCount} />

      {isSearchOpen && <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />}
    </>
  );
};

/** Membaca pathname (data runtime) di dalam Suspense agar halaman tetap bisa diprerender. */
const NavbarWithPathname: React.FC = () => <NavbarContent pathname={usePathname()} />;

export const Navbar: React.FC = () => (
  <Suspense fallback={<NavbarContent pathname={null} />}>
    <NavbarWithPathname />
  </Suspense>
);
