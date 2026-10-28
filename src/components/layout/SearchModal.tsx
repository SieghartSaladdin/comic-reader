'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X, Loader2, Star, BookOpen } from 'lucide-react';
import { ComicListItem } from '@/types/comic';
import { cachedFetchJson } from '@/utils/clientCache';

const SEARCH_TTL_MS = 5 * 60 * 1000;

interface SearchResponse {
  success: boolean;
  data?: ComicListItem[];
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ComicListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setResults([]);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search to /api/komik/search?q=...
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        // Cache klien: kata kunci yang pernah dicari tampil instan tanpa permintaan ulang.
        const json = await cachedFetchJson<SearchResponse>(
          `/api/komik/search?q=${encodeURIComponent(trimmed)}`,
          SEARCH_TTL_MS
        );
        if (!cancelled) setResults(json.success && Array.isArray(json.data) ? json.data : []);
      } catch (err) {
        console.error('Search error:', err);
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/60 animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden flex flex-col max-h-[80vh] transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b]">
          <Search className="w-4 h-4 text-zinc-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari judul komik (cth: Solo Leveling, One Piece, Magic)..."
            className="w-full bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm md:text-base outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 mr-1 transition-colors cursor-pointer"
              aria-label="Hapus teks"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 bg-zinc-200 dark:bg-zinc-800 rounded-md transition-colors cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          {query.trim() === '' && (
            <div className="py-12 text-center text-zinc-400 dark:text-zinc-500">
              <Search className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700 mb-2" />
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Cari komik sub Indo</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                Ketik nama judul atau karakter untuk mencari katalog komik.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="py-8 flex flex-col items-center justify-center text-zinc-500 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-900 dark:text-white" />
              <p className="text-xs">Mencari dalam katalog...</p>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <span>Hasil Pencarian ({results.length})</span>
                <span className="text-zinc-400 lowercase font-normal">KomikIndo Sub Indo</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {results.map((comic) => (
                  <Link
                    key={comic.slug || comic.id}
                    href={`/comic/${comic.slug || comic.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/60 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 transition-all group"
                  >
                    <img
                      src={comic.coverImage?.trim() ? comic.coverImage : '/placeholder-comic.svg'}
                      alt={comic.title}
                      className="w-12 h-16 object-cover rounded-lg shrink-0 group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                        {comic.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium">
                          {comic.type}
                        </span>
                        <span className="text-[10px] text-zinc-700 dark:text-zinc-300 flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-current inline" />
                          {(comic.rating || 8.0).toFixed(1)}
                        </span>
                      </div>
                      {comic.latestChapter && (
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-1 flex items-center gap-1">
                          <BookOpen className="w-3 h-3 shrink-0" />
                          <span>{comic.latestChapter}</span>
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {query.trim() !== '' && !isLoading && results.length === 0 && (
            <div className="py-10 text-center text-zinc-500">
              <p className="text-xs sm:text-sm">Tidak ada komik yang cocok dengan &quot;{query}&quot;</p>
              <p className="text-xs text-zinc-400 mt-1">Coba gunakan kata kunci lain.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
