'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Search, X } from 'lucide-react';
import { READER_BAR_ATTR } from '@/hooks/useHideOnUserScroll';
import { ChapterNavItem, descriptiveChapterTitle } from './ReaderControls';

interface ChapterListSheetProps {
  isOpen: boolean;
  onClose: () => void;
  chapters: ChapterNavItem[];
  currentChapterId: string;
  onSelectChapter: (chapterId: string) => void;
}

export const ChapterListSheet: React.FC<ChapterListSheetProps> = ({
  isOpen,
  onClose,
  chapters,
  currentChapterId,
  onSelectChapter,
}) => {
  const [query, setQuery] = useState('');
  const [newestFirst, setNewestFirst] = useState(true);
  const listRef = useRef<HTMLUListElement>(null);

  const visibleChapters = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const filtered = keyword
      ? chapters.filter(
          (ch) =>
            String(ch.chapterNumber).includes(keyword) ||
            ch.title.toLowerCase().includes(keyword)
        )
      : chapters;
    return [...filtered].sort((a, b) =>
      newestFirst ? b.chapterNumber - a.chapterNumber : a.chapterNumber - b.chapterNumber
    );
  }, [chapters, query, newestFirst]);

  // Saat dibuka, gulirkan daftar ke chapter yang sedang dibaca. Hanya menggeser daftar itu sendiri
  // (scrollIntoView ikut menggeser halaman di belakangnya).
  useEffect(() => {
    if (!isOpen) return;
    const list = listRef.current;
    const current = list?.querySelector<HTMLElement>('[data-current="true"]');
    if (!list || !current) return;
    list.scrollTop = current.offsetTop - list.clientHeight / 2 + current.offsetHeight / 2;
  }, [isOpen, newestFirst]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (id: string) => {
    onClose();
    onSelectChapter(id);
  };

  return (
    <div
      {...{ [READER_BAR_ATTR]: '' }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Daftar chapter"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[80dvh] w-full max-w-2xl flex-col rounded-t-3xl border border-zinc-800 bg-zinc-950 text-zinc-100 sm:rounded-3xl"
      >
        <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
          <div>
            <h2 className="text-sm font-bold">Daftar Chapter</h2>
            <p className="text-[11px] text-zinc-500">{chapters.length} chapter</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup daftar chapter"
            className="cursor-pointer rounded-xl p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-5 pb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nomor atau judul chapter..."
              aria-label="Cari chapter"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-3 text-xs text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
            />
          </div>
          {/* Urutan: satu kontrol dengan dua pilihan yang jelas, bukan tombol yang berganti label */}
          <div
            role="radiogroup"
            aria-label="Urutan chapter"
            className="flex shrink-0 items-center rounded-xl border border-zinc-800 bg-zinc-900 p-0.5 text-xs font-semibold"
          >
            {[
              { value: true, label: 'Terbaru' },
              { value: false, label: 'Terlama' },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                role="radio"
                aria-checked={newestFirst === option.value}
                onClick={() => setNewestFirst(option.value)}
                className={`cursor-pointer rounded-[10px] px-3 py-1.5 transition ${
                  newestFirst === option.value
                    ? 'bg-white text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <ul
          ref={listRef}
          className="relative flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          {visibleChapters.length === 0 && (
            <li className="py-10 text-center text-xs text-zinc-500">Chapter tidak ditemukan.</li>
          )}
          {visibleChapters.map((ch) => {
            const isCurrent = ch.id === currentChapterId;
            return (
              <li key={ch.id}>
                <button
                  type="button"
                  data-current={isCurrent}
                  onClick={() => handleSelect(ch.id)}
                  className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                    isCurrent ? 'bg-white/10 ring-1 ring-white/30' : 'hover:bg-zinc-900'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">Chapter {ch.chapterNumber}</p>
                    {(descriptiveChapterTitle(ch.title) || ch.releaseDate) && (
                      <p className="truncate text-[11px] text-zinc-500">
                        {[descriptiveChapterTitle(ch.title), ch.releaseDate].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                  {isCurrent && <Check className="h-4 w-4 shrink-0 text-white" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
