'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, Film, RefreshCw } from 'lucide-react';
import { AnimeCatalogResult, AnimeCatalogStatus } from '@/types/anime';
import { Pagination } from '../common/Pagination';
import { AnimeCard } from './AnimeCard';
import { AnimeCatalogFilters } from './AnimeCatalogFilters';

const SEARCH_DEBOUNCE_MS = 450;
const SKELETON_COUNT = 12;

interface Filters {
  query: string;
  status: AnimeCatalogStatus;
  genre: string;
  page: number;
}

const DEFAULT_FILTERS: Filters = { query: '', status: 'all', genre: '', page: 1 };

interface AnimeCatalogProps {
  initialResult: AnimeCatalogResult;
}

export const AnimeCatalog: React.FC<AnimeCatalogProps> = ({ initialResult }) => {
  const [result, setResult] = useState<AnimeCatalogResult>(initialResult);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const latestRequest = useRef(0);

  const scrollToCatalog = () => {
    const el = containerRef.current;
    if (!el) return;
    window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - 80), behavior: 'smooth' });
  };

  const load = useCallback(async (next: Filters) => {
    const requestId = ++latestRequest.current;
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ page: String(next.page), status: next.status });
      if (next.genre) params.set('genre', next.genre);
      if (next.query.trim()) params.set('q', next.query.trim());

      const res = await fetch(`/api/anime/catalog?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.success || !json.data) throw new Error(json.error || 'Gagal memuat anime');

      // Abaikan respons lama jika sudah ada permintaan yang lebih baru.
      if (requestId === latestRequest.current) setResult(json.data);
    } catch (err) {
      console.error('Error fetching anime catalog:', err);
      if (requestId === latestRequest.current) {
        setError('Gagal memuat katalog anime. Silakan coba beberapa saat lagi.');
      }
    } finally {
      if (requestId === latestRequest.current) setIsLoading(false);
    }
  }, []);

  const apply = (changes: Partial<Filters>, scroll = true) => {
    const next = { ...filters, page: 1, ...changes };
    setFilters(next);
    if (scroll) scrollToCatalog();
    load(next);
  };

  // Pencarian ditunda sampai pengguna berhenti mengetik.
  useEffect(() => {
    if (searchInput.trim() === filters.query) return;
    const timer = setTimeout(() => {
      const next = { ...filters, query: searchInput.trim(), page: 1 };
      setFilters(next);
      load(next);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput, filters, load]);

  const isSearching = Boolean(filters.query);
  const isFiltered = isSearching || Boolean(filters.genre) || filters.status !== 'all';

  const handleReset = () => {
    setSearchInput('');
    apply(DEFAULT_FILTERS);
  };

  return (
    <div ref={containerRef} className="w-full space-y-6">
      <div className="flex flex-col justify-between gap-2 border-b border-zinc-200/60 pb-4 dark:border-zinc-800/60 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-6 w-1.5 rounded-full bg-violet-600" />
            <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white md:text-2xl">
              Katalog Anime
            </h2>
          </div>
          <p className="mt-1 pl-3.5 text-xs text-zinc-500 dark:text-zinc-400 md:text-sm">
            Seluruh anime sub Indo: yang sedang tayang sampai yang sudah tamat, lengkap dengan pencarian dan filter genre.
          </p>
        </div>
        <div className="pl-3.5 text-xs font-medium text-zinc-400 dark:text-zinc-500 sm:pl-0">
          {isSearching ? (
            <>
              <span className="font-bold text-zinc-900 dark:text-white">{result.animes.length}</span> hasil untuk &quot;{filters.query}&quot;
            </>
          ) : (
            <>
              Halaman <span className="font-bold text-zinc-900 dark:text-white">{result.page}</span>
              {result.totalPages > 1 && ` dari ${result.totalPages}`}
            </>
          )}
        </div>
      </div>

      <AnimeCatalogFilters
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        status={filters.status}
        onStatusChange={(status) => apply({ status })}
        genre={filters.genre}
        onGenreChange={(genre) => apply({ genre })}
        isSearching={isSearching}
        isFiltered={isFiltered || Boolean(searchInput)}
        onReset={handleReset}
      />

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => load(filters)}
            className="flex cursor-pointer items-center gap-1 font-semibold hover:underline"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Coba Lagi
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse space-y-2.5 rounded-2xl border border-zinc-200/80 bg-white p-2 dark:border-zinc-800/80 dark:bg-[#121214]"
            >
              <div className="aspect-[3/4.2] w-full rounded-xl bg-zinc-200 dark:bg-zinc-800" />
              <div className="space-y-1.5 px-1 pb-1">
                <div className="h-3.5 w-4/5 rounded-md bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-3 w-1/2 rounded-md bg-zinc-200 dark:bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      ) : result.animes.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {result.animes.map((anime) => (
            <AnimeCard key={anime.slug} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 py-16 text-center dark:border-zinc-800 dark:bg-[#121214]/40">
          <Film className="mx-auto mb-3 h-9 w-9 text-zinc-400 dark:text-zinc-600" />
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Tidak ada anime ditemukan</h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-zinc-500 dark:text-zinc-400">
            Coba kata kunci lain atau reset filter.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-900 transition-all hover:bg-zinc-300 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset Filter
          </button>
        </div>
      )}

      {!isSearching && (
        <Pagination
          currentPage={result.page}
          totalPages={result.totalPages}
          hasNextPage={result.hasNextPage}
          isLoading={isLoading}
          onPageChange={(page) => apply({ page })}
        />
      )}
    </div>
  );
};
