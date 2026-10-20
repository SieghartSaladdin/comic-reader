'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Bookmark,
  History,
  Search,
  Menu,
  X,
  Tv,
  Sun,
  Moon,
} from 'lucide-react';
import { SearchModal } from './SearchModal';
import { getBookmarks } from '@/utils/storage';
import { useTheme } from '@/components/theme/ThemeProvider';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { theme, toggleTheme, mounted } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);

  // Sync bookmark count
  const syncBookmarks = () => {
    try {
      const b = getBookmarks();
      setBookmarkCount(b.length);
    } catch {
      setBookmarkCount(0);
    }
  };

  useEffect(() => {
    syncBookmarks();

    const handleStorageChange = () => syncBookmarks();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('comic_bookmark_updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('comic_bookmark_updated', handleStorageChange);
    };
  }, [pathname]);

  const navLinks = [
    { label: 'Comic', href: '/', icon: BookOpen },
    { label: 'Anime', href: '/anime', icon: Tv },
    {
      label: 'Bookmarks',
      href: '/bookmarks',
      icon: Bookmark,
      badge: bookmarkCount > 0 ? bookmarkCount : null,
    },
    { label: 'Riwayat', href: '/history', icon: History },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/85 dark:bg-[#09090b]/85 backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo Brand: Editorial Monogram */}
          <Link
            href="/"
            className="flex items-center gap-3 font-semibold tracking-tight text-zinc-900 dark:text-white group shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center font-bold text-xs tracking-widest transition-transform group-hover:scale-105 shadow-xs">
              CA
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-bold tracking-tight leading-none text-zinc-900 dark:text-white">
                COMIC AND ANIME
              </span>
              <span className="text-[10px] tracking-widest uppercase text-zinc-500 dark:text-zinc-400 font-medium">
                Baca & Tonton
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-950 dark:text-white font-semibold border border-zinc-300/80 dark:border-zinc-700/60'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                  {link.badge !== null && (
                    <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-bold bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 rounded-full leading-tight">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Search trigger, Theme Switcher & Mobile Menu Toggle */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100/90 dark:bg-zinc-900/80 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 text-xs transition-all cursor-pointer"
              aria-label="Cari judul..."
            >
              <Search className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              <span className="hidden sm:inline text-xs">Cari...</span>
              <kbd className="hidden sm:inline-block text-[10px] bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                /
              </kbd>
            </button>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-950 dark:hover:text-white transition-all cursor-pointer"
              title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
              aria-label="Toggle theme"
            >
              {mounted ? (
                theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-zinc-200 transition-transform hover:rotate-45" />
                ) : (
                  <Moon className="w-4 h-4 text-zinc-800 transition-transform hover:-rotate-12" />
                )
              ) : (
                <div className="w-4 h-4" />
              )}
            </button>

            {/* Mobile Hamburger button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e] px-4 pt-3 pb-4 space-y-1 animate-in slide-in-from-top-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge !== null && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Pop-up Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
