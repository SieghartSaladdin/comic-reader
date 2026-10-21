import React from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { HeroComic } from './heroTypes';

const VISIBLE_POSTERS = 3;
/** Geser horizontal (px) dan skala tiap poster di belakang poster aktif. */
const STACK_OFFSET_PX = 78;
const STACK_SCALE_STEP = 0.09;

interface HeroPosterStackProps {
  comics: HeroComic[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

function PosterImage({ comic, priority }: { comic: HeroComic; priority: boolean }) {
  return comic.coverImage?.trim() ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={comic.coverImage}
      alt={comic.title}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      className="h-full w-full object-cover"
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-zinc-500">
      <BookOpen className="h-8 w-8" />
    </div>
  );
}

/** Tumpukan poster di sisi kanan hero: poster aktif di depan, berikutnya mengintip di belakang. */
export const HeroPosterStack: React.FC<HeroPosterStackProps> = ({ comics, activeIndex, onSelect }) => {
  const count = comics.length;
  const shown = Math.min(VISIBLE_POSTERS, count);

  // Dirender dari yang paling belakang agar urutan tumpukan benar.
  const depths = Array.from({ length: shown }, (_, depth) => shown - 1 - depth);

  return (
    <div className="relative hidden h-[24rem] w-[26rem] shrink-0 md:block lg:h-[27rem] lg:w-[30rem]">
      {depths.map((depth) => {
        const index = (activeIndex + depth) % count;
        const comic = comics[index];
        const isActive = depth === 0;

        return (
          <div
            key={comic.slug || comic.id}
            className="absolute left-0 top-1/2 aspect-[3/4] w-52 overflow-hidden rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.55)] ring-1 ring-white/15 transition-all duration-700 ease-out lg:w-60"
            style={{
              transform: `translate(${depth * STACK_OFFSET_PX}px, -50%) scale(${1 - depth * STACK_SCALE_STEP})`,
              zIndex: 10 - depth,
              opacity: isActive ? 1 : 0.85 - depth * 0.2,
              filter: isActive ? 'none' : `brightness(${0.75 - depth * 0.15})`,
            }}
          >
            {isActive ? (
              <Link href={`/comic/${comic.slug || comic.id}`} aria-label={`Buka ${comic.title}`}>
                <PosterImage comic={comic} priority />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => onSelect(index)}
                aria-label={`Tampilkan ${comic.title}`}
                className="block h-full w-full cursor-pointer"
              >
                <PosterImage comic={comic} priority={false} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
