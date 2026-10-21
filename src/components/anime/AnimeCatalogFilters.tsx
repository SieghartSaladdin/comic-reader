'use client';

import React from 'react';
import { Search, X, Tag, RotateCcw } from 'lucide-react';
import { ANIME_GENRES } from '@/data/animeGenres';
import { AnimeCatalogStatus } from '@/types/anime';

const STATUS_OPTIONS: { value: AnimeCatalogStatus; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'ongoing', label: 'Sedang Tayang' },
  { value: 'complete', label: 'Tamat' },
];

interface AnimeCatalogFiltersProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  status: AnimeCatalogStatus;
  onStatusChange: (status: AnimeCatalogStatus) => void;
  genre: string;
  onGenreChange: (genre: string) => void;
  /** Pencarian aktif: status dan genre diabaikan oleh sumber data. */
  isSearching: boolean;
  isFiltered: boolean;
  onReset: () => void;
}

export const AnimeCatalogFilters: React.FC<AnimeCatalogFiltersProps> = ({
  searchInput,
  onSearchChange,
  status,
  onStatusChange,
  genre,
  onGenreChange,
  isSearching,
  isFiltered,
  onReset,
}) => {
  // Genre dan pencarian memakai listing sumber sendiri, sehingga filter status tidak berlaku.
  const statusDisabled = isSearching || Boolean(genre);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari judul anime..."
            aria-label="Cari judul anime"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-100 py-2.5 pl-10 pr-9 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-accent-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Hapus pencarian"
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="relative md:w-56">
          <Tag className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <select
            value={genre}
            onChange={(e) => onGenreChange(e.target.value)}
            disabled={isSearching}
            aria-label="Filter genre"
            className="w-full cursor-pointer appearance-none rounded-xl border border-zinc-200 bg-zinc-100 py-2.5 pl-10 pr-4 text-sm text-zinc-900 focus:border-accent-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
          >
            <option value="">Semua Genre</option>
            {ANIME_GENRES.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {STATUS_OPTIONS.map((option) => {
          const active = !statusDisabled && status === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onStatusChange(option.value)}
              disabled={statusDisabled}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                active
                  ? 'bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-950'
                  : 'cursor-pointer bg-zinc-200/70 text-zinc-700 hover:bg-zinc-300/70 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              {option.label}
            </button>
          );
        })}

        {statusDisabled && (
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {isSearching
              ? 'Pencarian mencari di semua anime, filter diabaikan.'
              : 'Filter genre menampilkan semua status.'}
          </span>
        )}

        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="ml-auto inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-300"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
};
