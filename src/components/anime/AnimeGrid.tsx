'use client';

import React, { useState, useMemo } from 'react';
import { AnimeListItem } from '@/types/anime';
import { AnimeCard } from './AnimeCard';
import { Search, Film, Calendar, X } from 'lucide-react';

interface AnimeGridProps {
  animeList: AnimeListItem[];
  title?: string;
  description?: string;
}

const DAYS = [
  'Semua',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
  'Minggu',
];

export const AnimeGrid: React.FC<AnimeGridProps> = ({
  animeList,
  title = 'Anime Ongoing Terbaru',
  description = 'Koleksi serial anime ongoing dengan subtitle Indonesia kualitas HD',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDay, setSelectedDay] = useState('Semua');

  const filteredAnime = useMemo(() => {
    return animeList.filter((item) => {
      const matchesSearch =
        searchTerm.trim() === '' ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDay =
        selectedDay === 'Semua' ||
        (item.releaseDay &&
          item.releaseDay.toLowerCase().includes(selectedDay.toLowerCase()));

      return matchesSearch && matchesDay;
    });
  }, [animeList, searchTerm, selectedDay]);

  return (
    <section className="space-y-6">
      {/* Section Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-1">
            <Film className="w-3.5 h-3.5" />
            <span>Streaming Sub Indo</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
            {description}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari judul anime..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-zinc-800 dark:focus:border-zinc-200 focus:outline-none text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              aria-label="Hapus pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Day Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
        <span className="text-zinc-500 dark:text-zinc-400 shrink-0 font-medium mr-1 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          Jadwal Rilis:
        </span>
        {DAYS.map((day) => {
          const isActive = selectedDay === day;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-semibold shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Grid Results */}
      {filteredAnime.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {filteredAnime.map((anime) => (
            <AnimeCard key={anime.slug} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl bg-zinc-50 dark:bg-[#121214]/60 border border-dashed border-zinc-200 dark:border-zinc-800 p-8 space-y-3">
          <Film className="w-8 h-8 mx-auto text-zinc-400 dark:text-zinc-600" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Tidak Ada Anime Ditemukan
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            Tidak ada anime yang sesuai dengan kata kunci &quot;{searchTerm}&quot;
            {selectedDay !== 'Semua' ? ` pada hari ${selectedDay}` : ''}.
          </p>
          {(searchTerm || selectedDay !== 'Semua') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedDay('Semua');
              }}
              className="text-xs font-semibold text-zinc-900 dark:text-white underline underline-offset-4 pt-1 cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      )}
    </section>
  );
};
