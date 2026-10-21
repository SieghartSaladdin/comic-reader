'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { ComicListItem } from '@/types/comic';
import { ComicCard } from './ComicCard';
import {
  ComicFilterBar,
  ComicFilterType,
  ComicFilterStatus,
  ComicFilterSort,
} from './ComicFilterBar';
import { Pagination } from '../common/Pagination';
import { cachedFetchJson, prefetchJson } from '@/utils/clientCache';

const CATALOG_TTL_MS = 5 * 60 * 1000;
const PREFETCH_DELAY_MS = 1000;

interface FilterResponse {
  success: boolean;
  error?: string;
  data?: {
    comics?: ComicListItem[];
    page?: number;
    totalEstimatedPages?: number;
    hasNextPage?: boolean;
  };
}

interface PaginatedComicCatalogProps {
  initialComics?: ComicListItem[];
  initialPage?: number;
  initialTotalPages?: number;
  initialHasNextPage?: boolean;
  title?: string;
  subtitle?: string;
}

export const PaginatedComicCatalog: React.FC<PaginatedComicCatalogProps> = ({
  initialComics = [],
  initialPage = 1,
  initialTotalPages = 10,
  initialHasNextPage = true,
  title = 'Katalog Komik Lengkap',
  subtitle = 'Jelajahi ribuan manga, manhwa, dan manhua dengan multi-filter genre, tipe, status, dan urutan terjemahan Indonesia',
}) => {
  const [comics, setComics] = useState<ComicListItem[]>(initialComics);
  const [page, setPage] = useState<number>(initialPage);
  const [selectedType, setSelectedType] = useState<ComicFilterType>('all');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<ComicFilterStatus>('all');
  const [sortBy, setSortBy] = useState<ComicFilterSort>('latest');
  const [totalPages, setTotalPages] = useState<number>(initialTotalPages);
  const [hasNextPage, setHasNextPage] = useState<boolean>(initialHasNextPage);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Halaman pertama sudah dikirim server; siapkan halaman kedua di latar sebelum pengguna menekannya.
  useEffect(() => {
    if (!initialHasNextPage) return;
    const timer = window.setTimeout(
      () => prefetchJson(`/api/komik/filter?page=${initialPage + 1}`, CATALOG_TTL_MS),
      PREFETCH_DELAY_MS
    );
    return () => window.clearTimeout(timer);
  }, [initialHasNextPage, initialPage]);

  const scrollToCatalog = () => {
    if (containerRef.current) {
      const topOffset =
        containerRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: Math.max(0, topOffset), behavior: 'smooth' });
    }
  };

  const loadData = useCallback(
    async (
      targetPage: number,
      targetType: ComicFilterType,
      targetGenres: string[],
      targetStatus: ComicFilterStatus,
      targetSort: ComicFilterSort
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const buildUrl = (pageNumber: number) => {
          const queryParams = new URLSearchParams();
          queryParams.set('page', pageNumber.toString());
          if (targetType !== 'all') queryParams.set('type', targetType);
          if (targetGenres.length > 0)
            queryParams.set('genres', targetGenres.join(','));
          if (targetStatus !== 'all') queryParams.set('status', targetStatus);
          if (targetSort !== 'latest') queryParams.set('sort', targetSort);
          return `/api/komik/filter?${queryParams.toString()}`;
        };

        // Cache klien: halaman/filter yang pernah dibuka tampil instan tanpa permintaan ulang.
        const json = await cachedFetchJson<FilterResponse>(buildUrl(targetPage), CATALOG_TTL_MS);
        if (json.success && json.data) {
          setComics(json.data.comics || []);
          setPage(json.data.page || targetPage);
          setTotalPages(json.data.totalEstimatedPages || 1);
          setHasNextPage(Boolean(json.data.hasNextPage));

          // Siapkan halaman berikutnya selagi pengguna melihat halaman ini.
          if (json.data.hasNextPage) prefetchJson(buildUrl(targetPage + 1), CATALOG_TTL_MS);
        } else {
          throw new Error(json.error || 'Gagal memuat komik');
        }
      } catch (err: unknown) {
        console.error('Error fetching filtered comics:', err);
        setError('Gagal memuat daftar komik. Silakan coba beberapa saat lagi.');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handlePageChange = (newPage: number) => {
    scrollToCatalog();
    loadData(newPage, selectedType, selectedGenres, selectedStatus, sortBy);
  };

  const handleTypeChange = (newType: ComicFilterType) => {
    setSelectedType(newType);
    setPage(1);
    scrollToCatalog();
    loadData(1, newType, selectedGenres, selectedStatus, sortBy);
  };

  const handleGenresChange = (newGenres: string[]) => {
    setSelectedGenres(newGenres);
    setPage(1);
    scrollToCatalog();
    loadData(1, selectedType, newGenres, selectedStatus, sortBy);
  };

  const handleStatusChange = (newStatus: ComicFilterStatus) => {
    setSelectedStatus(newStatus);
    setPage(1);
    scrollToCatalog();
    loadData(1, selectedType, selectedGenres, newStatus, sortBy);
  };

  const handleSortChange = (newSort: ComicFilterSort) => {
    setSortBy(newSort);
    setPage(1);
    scrollToCatalog();
    loadData(1, selectedType, selectedGenres, selectedStatus, newSort);
  };

  const handleReset = () => {
    setSelectedType('all');
    setSelectedGenres([]);
    setSelectedStatus('all');
    setSortBy('latest');
    setPage(1);
    scrollToCatalog();
    loadData(1, 'all', [], 'all', 'latest');
  };

  return (
    <div ref={containerRef} className="w-full space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-6 rounded-full bg-zinc-950 dark:bg-white inline-block" />
            <h2 className="text-xl md:text-2xl font-bold text-zinc-950 dark:text-white tracking-tight">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 mt-1 pl-3.5">
              {subtitle}
            </p>
          )}
        </div>
        <div className="text-xs text-zinc-400 dark:text-zinc-500 font-medium pl-3.5 sm:pl-0">
          Halaman <span className="font-bold text-zinc-900 dark:text-white">{page}</span>
          {totalPages > 1 && ` dari ${totalPages}`}
        </div>
      </div>

      {/* Filter Bar with Multi-Genre, Type, Status, and Sort */}
      <ComicFilterBar
        selectedType={selectedType}
        onTypeChange={handleTypeChange}
        selectedGenres={selectedGenres}
        onGenresChange={handleGenresChange}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        onReset={handleReset}
        isLoading={isLoading}
      />

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 flex items-center justify-between text-xs text-red-700 dark:text-red-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() =>
              loadData(page, selectedType, selectedGenres, selectedStatus, sortBy)
            }
            className="flex items-center gap-1 font-semibold hover:underline cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Coba Lagi</span>
          </button>
        </div>
      )}

      {/* Loading Skeleton Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#121214] p-2 space-y-2.5 animate-pulse"
            >
              <div className="aspect-[3/4] w-full bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
              <div className="space-y-1.5 px-1 pb-1">
                <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded-md w-4/5" />
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-md w-1/2" />
                <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-full mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : comics.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {comics.map((comic) => (
            <ComicCard key={comic.slug || comic.id} comic={comic} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#121214]/40">
          <BookOpen className="w-10 h-10 mx-auto text-zinc-400 dark:text-zinc-600 mb-3" />
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            Tidak ada komik yang ditemukan
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            Kombinasi jenis, genre, atau status komik tidak memiliki hasil. Coba pilih kombinasi filter lain atau reset filter.
          </p>
          <button
            onClick={handleReset}
            className="mt-4 px-4 py-2 text-xs font-semibold text-zinc-900 dark:text-white bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Semua Filter</span>
          </button>
        </div>
      )}

      {/* Pagination Component */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        hasNextPage={hasNextPage}
        isLoading={isLoading}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
