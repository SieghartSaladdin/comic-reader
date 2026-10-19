'use client';

import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
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

interface ComicFilterActiveTagsProps {
  selectedType: ComicFilterType;
  currentGenres: string[];
  selectedStatus: ComicFilterStatus;
  sortBy: ComicFilterSort;
  onTypeChange: (type: ComicFilterType) => void;
  onGenreToggle: (genre: string) => void;
  onStatusChange: (status: ComicFilterStatus) => void;
  onSortChange: (sort: ComicFilterSort) => void;
  onReset: () => void;
}

export const ComicFilterActiveTags: React.FC<ComicFilterActiveTagsProps> = ({
  selectedType,
  currentGenres,
  selectedStatus,
  sortBy,
  onTypeChange,
  onGenreToggle,
  onStatusChange,
  onSortChange,
  onReset,
}) => {
  return (
    <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center gap-1.5 text-xs">
      <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 flex items-center gap-1 shrink-0 mr-1">
        <SlidersHorizontal className="w-3 h-3" />
        <span>Filter Aktif:</span>
      </span>

      {selectedType !== 'all' && (
        <CustomChip
          size="sm"
          label={`Tipe: ${
            TYPE_OPTIONS.find((t) => t.id === selectedType)?.label || selectedType
          }`}
          onRemove={() => onTypeChange('all')}
        />
      )}

      {currentGenres.map((g) => {
        const label =
          ALL_GENRES.find((gen) => gen.toLowerCase() === g.toLowerCase()) || g;
        return (
          <CustomChip
            key={g}
            size="sm"
            label={label}
            onRemove={() => onGenreToggle(g)}
          />
        );
      })}

      {selectedStatus !== 'all' && (
        <CustomChip
          size="sm"
          label={`Status: ${
            STATUS_OPTIONS.find((s) => s.value === selectedStatus)?.label ||
            selectedStatus
          }`}
          onRemove={() => onStatusChange('all')}
        />
      )}

      {sortBy !== 'latest' && (
        <CustomChip
          size="sm"
          label={`Urut: ${
            SORT_OPTIONS.find((s) => s.value === sortBy)?.label || sortBy
          }`}
          onRemove={() => onSortChange('latest')}
        />
      )}

      <button
        type="button"
        onClick={onReset}
        className="text-[11px] font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 underline ml-1 cursor-pointer"
      >
        Hapus Semua
      </button>
    </div>
  );
};
