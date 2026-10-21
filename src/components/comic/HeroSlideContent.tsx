import React from 'react';
import Link from 'next/link';
import { Clock, Flame, Info, Play, Star } from 'lucide-react';
import { Comic } from '@/types/comic';
import { HeroComic } from './heroTypes';

interface HeroSlideContentProps {
  comic: HeroComic;
  /** Posisi slide (mulai 0) dan jumlah seluruh slide. */
  position: number;
  total: number;
}

/** Teks, lencana, dan tombol aksi untuk satu slide hero. */
export const HeroSlideContent: React.FC<HeroSlideContentProps> = ({ comic, position, total }) => {
  const key = comic.slug || comic.id;
  const full = comic as Partial<Comic>;
  const description = full.description?.trim();
  const recent = (comic.recentChapters ?? []).slice(0, 2);
  // Rating 8.0 adalah nilai bawaan parser saat situs tidak menyediakan rating.
  const rating = comic.rating > 0 && comic.rating !== 8 ? comic.rating : null;
  const readUrl = comic.latestChapterSlug ? `/reader/${key}/${comic.latestChapterSlug}` : `/comic/${key}`;

  return (
    <div className="hero-enter max-w-2xl space-y-5">
      {/* Di layar kecil, ruang di kanan disisakan untuk poster mini milik HeroBanner */}
      <div className="space-y-5 pr-28 sm:pr-0">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-accent-300">
          <Flame className="h-3.5 w-3.5" />
          <span>Populer · #{position + 1}</span>
          <span className="text-white/30">/ {total}</span>
        </div>

        <h1 className="line-clamp-3 text-3xl font-black leading-[1.05] tracking-tight text-white drop-shadow-sm sm:line-clamp-2 sm:text-5xl lg:text-6xl">
          {comic.title}
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className="rounded-full bg-accent-600 px-3 py-1 uppercase tracking-widest text-white">
          {comic.type}
        </span>
        {rating !== null && (
          <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-amber-300 ring-1 ring-white/10 backdrop-blur">
            <Star className="h-3 w-3 fill-current" />
            {rating.toFixed(1)}
          </span>
        )}
        {comic.status && (
          <span className="rounded-full bg-white/10 px-3 py-1 text-white/80 ring-1 ring-white/10 backdrop-blur">
            {comic.status}
          </span>
        )}
        {comic.updatedTime && (
          <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-white/80 ring-1 ring-white/10 backdrop-blur">
            <Clock className="h-3 w-3" />
            {comic.updatedTime}
          </span>
        )}
      </div>

      {description ? (
        <p className="line-clamp-3 max-w-xl text-sm leading-relaxed text-white/75">{description}</p>
      ) : (
        recent.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {recent.map((chapter) => (
              <li key={chapter.slug}>
                <Link
                  href={`/reader/${key}/${chapter.slug}`}
                  className="flex items-center gap-2 rounded-xl bg-black/30 px-3 py-2 text-xs ring-1 ring-white/10 backdrop-blur transition hover:bg-black/50"
                >
                  <span className="font-bold text-white">{chapter.title}</span>
                  <span className="text-white/55">{chapter.releaseTime}</span>
                </Link>
              </li>
            ))}
          </ul>
        )
      )}

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Link
          href={readUrl}
          className="flex items-center gap-2 rounded-xl bg-accent-600 px-6 py-3 text-sm font-bold text-white shadow-[0_8px_28px_rgba(152,64,60,0.45)] transition hover:-translate-y-0.5 hover:bg-accent-500 active:translate-y-0"
        >
          <Play className="h-4 w-4 fill-current" />
          {comic.latestChapter ? `Baca ${comic.latestChapter}` : 'Mulai Membaca'}
        </Link>
        <Link
          href={`/comic/${key}`}
          className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-white/20"
        >
          <Info className="h-4 w-4" />
          Detail Komik
        </Link>
      </div>
    </div>
  );
};
