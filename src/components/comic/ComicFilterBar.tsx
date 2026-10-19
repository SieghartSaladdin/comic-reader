'use client';

import React from 'react';
import {
  Filter,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { CustomSelect, SelectOption } from '../ui/CustomSelect';
import { CustomChip } from '../ui/CustomChips';
import {
  ComicFilterType,
  ComicFilterStatus,
  ComicFilterSort,
  ALL_GENRES,
  TYPE_OPTIONS,
  STATUS_OPTIONS,
  SORT_OPTIONS,
} from './comicFilterConstants';
import { ComicFilterActiveTags } from './ComicFilterActiveTags';

export type { ComicFilterType, ComicFilterStatus, ComicFilterSort };
export { ALL_GENRES as POPULAR_GENRES };

export interface ComicFilterBarProps {
  selectedType: ComicFilterType;
  onTypeChange: (type: ComicFilterType) => void;
  selectedGenres: string[];
  onGenresChange: (genres: string[]) => void;
  selectedStatus: ComicFilterStatus;
  onStatusChange: (status: ComicFilterStatus) => void;
  sortBy: ComicFilterSort;
  onSortChange: (sort: ComicFilterSort) => void;
  onReset: () => void;
  isLoading?: boolean;
  selectedGenre?: string;
  onGenreChange?: (genre: string) => void;
}

export const ComicFilterBar: React.FC<ComicFilterBarProps> = ({
  selectedType,
  onTypeChange,
  selectedGenres = [],
  onGenresChange,
  selectedStatus = 'all',
  onStatusChange,
  sortBy = 'latest',
  onSortChange,
  onReset,
  isLoading = false,
  selectedGenre,
  onGenreChange,
}) => {
  const currentGenres: string[] = React.useMemo(() => {
    if (selectedGenres && selectedGenres.length > 0) return selectedGenres;
    if (selectedGenre && selectedGenre !== 'all') return [selectedGenre];
    return [];
  }, [selectedGenres, selectedGenre]);

  const handleGenreToggle = (genreName: string) => {
    const slug = genreName.toLowerCase();
    const isSelected = currentGenres.some((g) => g.toLowerCase() === slug);
    const updated = isSelected
      ? currentGenres.filter((g) => g.toLowerCase() !== slug)
      : [...currentGenres, slug];

    if (onGenresChange) {
      onGenresChange(updated);
    } else if (onGenreChange) {
      onGenreChange(updated.length > 0 ? updated[0] : 'all');
    }
  };

  const handleSelectGenresChange = (val: string | string[]) => {
    const arr = Array.isArray(val) ? val : [val];
    if (onGenresChange) {
      onGenresChange(arr);
    } else if (onGenreChange) {
      onGenreChange(arr.length > 0 ? arr[0] : 'all');
    }
  };

  const genreOptions: SelectOption[] = React.useMemo(
    () => ALL_GENRES.map((g) => ({ value: g.toLowerCase(), label: g })),
    []
  );

  const statusOptions: SelectOption[] = React.useMemo(
    () => STATUS_OPTIONS.map((s) => ({ value: s.value, label: s.label })),
    []
  );

  const sortOptions: SelectOption[] = React.useMemo(
    () => SORT_OPTIONS.map((s) => ({ value: s.value, label: s.label })),
    []
  );

  const hasActiveFilters =
    selectedType !== 'all' ||
    currentGenres.length > 0 ||
    selectedStatus !== 'all' ||
    sortBy !== 'latest';

  return (
    <div className="w-full space-y-3.5 bg-white dark:bg-[#121214] p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
      {/* Top Filter Controls: Type Pills & Custom Dropdowns */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {TYPE_OPTIONS.map((item) => (
            <CustomChip
              key={item.id}
              label={item.label}
              badge={item.badge}
              active={selectedType === item.id}
              disabled={isLoading}
              onClick={() => onTypeChange(item.id)}
            />
          ))}
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <CustomSelect
            multiple
            searchable
            options={genreOptions}
            value={currentGenres}
            onChange={handleSelectGenresChange}
            placeholder="Pilih Genre"
            disabled={isLoading}
            icon={<Filter className="w-3.5 h-3.5" />}
            className="flex-1 sm:flex-initial"
          />

          <CustomSelect
            options={statusOptions}
            value={selectedStatus}
            onChange={(val) => onStatusChange(val as ComicFilterStatus)}
            placeholder="Status"
            disabled={isLoading}
            className="flex-1 sm:flex-initial"
          />

          <CustomSelect
            options={sortOptions}
            value={sortBy}
            onChange={(val) => onSortChange(val as ComicFilterSort)}
            placeholder="Urutan"
            disabled={isLoading}
            icon={<ArrowUpDown className="w-3.5 h-3.5" />}
            className="flex-1 sm:flex-initial"
          />

          {hasActiveFilters && (
            <button
              type="button"
              disabled={isLoading}
              onClick={onReset}
              title="Reset Semua Filter"
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Multi-Genre Pills Bar */}
      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 flex items-center gap-1 shrink-0 mr-1">
          <Sparkles className="w-3 h-3" />
          <span>Genre Populer:</span>
        </span>
        {ALL_GENRES.map((genre) => {
          const isSelected = currentGenres.some(
            (g) => g.toLowerCase() === genre.toLowerCase()
          );
          return (
            <CustomChip
              key={genre}
              size="sm"
              label={genre}
              active={isSelected}
              disabled={isLoading}
              onClick={() => handleGenreToggle(genre)}
            />
          );
        })}
      </div>

      {/* Active Filter Tags Bar */}
      {hasActiveFilters && (
        <ComicFilterActiveTags
          selectedType={selectedType}
          currentGenres={currentGenres}
          selectedStatus={selectedStatus}
          sortBy={sortBy}
          onTypeChange={onTypeChange}
          onGenreToggle={handleGenreToggle}
          onStatusChange={onStatusChange}
          onSortChange={onSortChange}
          onReset={onReset}
        />
      )}
    </div>
  );
};
