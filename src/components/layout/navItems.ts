import { Bookmark, BookOpen, History, Tv } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Awalan path tambahan yang juga menandai item ini aktif (mis. halaman detail komik). */
  matchPrefixes?: string[];
  /** Tampilkan jumlah bookmark sebagai lencana. */
  showBookmarkCount?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Comic', href: '/', icon: BookOpen, matchPrefixes: ['/comic', '/reader'] },
  { label: 'Anime', href: '/anime', icon: Tv, matchPrefixes: ['/anime'] },
  { label: 'Bookmarks', href: '/bookmarks', icon: Bookmark, showBookmarkCount: true },
  { label: 'Riwayat', href: '/history', icon: History },
];

/** Apakah item menu aktif untuk path saat ini. `pathname` null berarti belum diketahui (prerender). */
export function isNavItemActive(item: NavItem, pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname === item.href) return true;
  return (item.matchPrefixes ?? []).some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
