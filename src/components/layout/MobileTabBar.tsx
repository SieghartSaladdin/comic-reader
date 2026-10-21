'use client';

import React from 'react';
import Link from 'next/link';
import { NAV_ITEMS, isNavItemActive } from './navItems';

interface MobileTabBarProps {
  pathname: string | null;
  bookmarkCount: number;
}

/** Bar navigasi bawah untuk layar kecil: mudah dijangkau jempol, menggantikan menu hamburger. */
export const MobileTabBar: React.FC<MobileTabBarProps> = ({ pathname, bookmarkCount }) => (
  <nav
    aria-label="Navigasi utama"
    className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200/80 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl dark:border-white/[0.07] dark:bg-[#0b0b0d]/90 md:hidden"
  >
    <ul className="mx-auto grid max-w-md grid-cols-4">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isNavItemActive(item, pathname);
        const badge = item.showBookmarkCount && bookmarkCount > 0 ? bookmarkCount : null;

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`relative flex flex-col items-center gap-1 pb-2 pt-2.5 text-[10px] font-semibold tracking-wide transition-colors ${
                active
                  ? 'text-accent-700 dark:text-accent-300'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-200'
              }`}
            >
              {/* Penanda halaman aktif di tepi atas bar */}
              <span
                aria-hidden="true"
                className={`absolute top-0 h-[3px] rounded-b-full bg-accent-600 transition-all duration-300 ${
                  active ? 'w-9 opacity-100' : 'w-0 opacity-0'
                }`}
              />
              <span className="relative">
                <Icon className={`h-5 w-5 transition-transform ${active ? 'scale-110' : ''}`} strokeWidth={active ? 2.3 : 1.9} />
                {badge !== null && (
                  <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-600 px-1 text-[9px] font-bold leading-none text-white ring-2 ring-white dark:ring-[#0b0b0d]">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </span>
              <span>{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  </nav>
);
