'use client';

import React, { useState, useMemo } from 'react';
import { Filter, Layers, RotateCcw } from 'lucide-react';
import { Comic, ComicListItem, ComicType } from '@/types/comic';
import { ComicCard } from './ComicCard';

interface ComicGridProps {
  comics: (Comic | ComicListItem)[];
  title?: string;
  subtitle?: string;
  showFilters?: boolean;
}

export const ComicGrid: React.FC<ComicGridProps> = ({
  comics,
  title,
  subtitle,
  showFilters = true,
}) => {
  const [selectedType, setSelectedType] = useState<'All' | ComicType>('All');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  // Extract all unique genres if available
  const allGenres = useMemo(() => {
    const set = new Set<string>();
    comics.forEach((comic) => {
      const full = comic as Partial<Comic>;
      full.genres?.forEach((g) => set.add(g));
    });
    return Array.from(set).slice(0, 12);
  }, [comics]);

  // Filter comics based on selected type and genre
  const filteredComics = useMemo(() => {
    return comics.filter((comic) => {
      const matchType = selectedType === 'All' || comic.type === selectedType;
      const full = comic as Partial<Comic>;
      const matchGenre =
        selectedGenre === 'All' ||
        full.genres?.some((g) => g.toLowerCase() === selectedGenre.toLowerCase());
      return matchType && matchGenre;
    });
  }, [comics, selectedType, selectedGenre]);

  return (
    <div className="w-full space-y-5">
      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        {title && (
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-zinc-950 dark:text-white tracking-tight flex items-center">
              <span className="w-1.5 h-5 rounded-full bg-zinc-900 dark:bg-white inline-block mr-2.5" />
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {showFilters && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Type Filter Tabs */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900/90 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
              {(['All', 'Manhwa', 'Manga', 'Manhua'] as const).map((type) => {
                const isSelected = selectedType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-semibold shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                    }`}
                  >
                    {type === 'All' ? 'Semua' : type}
                  </button>
                );
              })}
            </div>

            {/* Genre Select (if genres exist) */}
            {allGenres.length > 0 && (
              <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900/90 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300">
                <Filter className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="bg-transparent text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer"
                >
                  <option value="All" className="bg-white dark:bg-[#121214] text-zinc-800 dark:text-zinc-200">
                    Semua Genre
                  </option>
                  {allGenres.map((genre) => (
                    <option key={genre} value={genre} className="bg-white dark:bg-[#121214] text-zinc-800 dark:text-zinc-200">
                      {genre}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grid container */}
      {filteredComics.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {filteredComics.map((comic) => (
            <ComicCard key={comic.slug || comic.id} comic={comic} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121214]/60">
          <Layers className="w-8 h-8 mx-auto text-zinc-400 dark:text-zinc-600 mb-2" />
          <p className="text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Tidak ada komik yang sesuai filter
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Coba pilih kategori atau genre yang berbeda.
          </p>
          <button
            onClick={() => {
              setSelectedType('All');
              setSelectedGenre('All');
            }}
            className="mt-4 px-4 py-2 text-xs font-medium text-zinc-900 dark:text-white bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filter</span>
          </button>
        </div>
      )}
    </div>
  );
};
