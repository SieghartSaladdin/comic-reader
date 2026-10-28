'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HeroComic } from './heroTypes';
import { HeroSlideContent } from './HeroSlideContent';
import { HeroPosterStack } from './HeroPosterStack';

const SLIDE_DURATION_MS = 7000;
const SWIPE_THRESHOLD_PX = 50;

interface HeroBannerProps {
  comics: HeroComic[];
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ comics }) => {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const count = comics.length;

  // Hormati preferensi "kurangi gerakan": tanpa autoplay dan animasi progres.
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(query.matches);
    const handleChange = () => setReducedMotion(query.matches);
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  const goTo = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count]
  );

  if (!comics || count === 0) return null;

  const autoplay = count > 1 && !reducedMotion;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const startX = touchStartX.current;
    touchStartX.current = null;
    const endX = e.changedTouches[0]?.clientX;
    if (startX === null || endX === undefined) return;
    const delta = endX - startX;
    if (Math.abs(delta) >= SWIPE_THRESHOLD_PX) goTo(index + (delta < 0 ? 1 : -1));
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Komik populer"
      className="relative isolate w-full overflow-hidden rounded-2xl bg-[#0d0a0a] text-white ring-1 ring-black/5 dark:ring-white/10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Latar: sampul buram tiap slide saling memudar */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        {comics.map((comic, i) =>
          comic.coverImage?.trim() ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={comic.slug || comic.id}
              src={comic.coverImage}
              alt=""
              fetchPriority={i === 0 ? 'high' : 'low'}
              decoding="async"
              className={`absolute inset-0 h-full w-full scale-110 object-cover object-top blur-xl grayscale transition-opacity duration-1000 ${
                i === index ? 'opacity-60' : 'opacity-0'
              }`}
            />
          ) : null
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0a0a] via-[#0d0a0a]/85 to-[#0d0a0a]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0a0a] via-transparent to-[#0d0a0a]/40" />
      </div>

      {/* Layar kecil: poster mini miring di pojok kanan atas */}
      {comics[index].coverImage?.trim() && (
        <div className="absolute right-5 top-9 z-10 aspect-[3/4] w-24 overflow-hidden rounded-lg ring-1 ring-white/20 sm:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={comics[index].slug || comics[index].id}
            src={comics[index].coverImage}
            alt={comics[index].title}
            decoding="async"
            className="hero-enter h-full w-full object-cover"
          />
        </div>
      )}

      {/* Isi: teks di kiri, tumpukan poster di kanan */}
      <div className="flex items-center justify-between gap-6 px-6 pb-24 pt-10 sm:px-10 md:py-14 lg:px-14 lg:py-16">
        <HeroSlideContent
          key={comics[index].slug || comics[index].id}
          comic={comics[index]}
          position={index}
          total={count}
        />
        <HeroPosterStack comics={comics} activeIndex={index} onSelect={goTo} />
      </div>

      {/* Kontrol: progres slide (juga menggerakkan autoplay) di kiri bawah, panah di kanan bawah */}
      {count > 1 && (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 px-6 pb-6 sm:px-10 lg:px-14">
          <div className="flex flex-1 items-center gap-2 md:max-w-md" role="tablist" aria-label="Pilih slide">
            {comics.map((comic, i) => {
              const isActive = i === index;
              const isPast = i < index;
              return (
                <button
                  key={comic.slug || comic.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Slide ${i + 1}: ${comic.title}`}
                  onClick={() => goTo(i)}
                  className="group relative h-6 flex-1 cursor-pointer"
                >
                  <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-white/20 transition-all group-hover:h-1.5">
                    <span
                      className="absolute inset-0 origin-left rounded-full bg-accent-300"
                      style={{
                        transform: isPast || (isActive && !autoplay) ? 'scaleX(1)' : 'scaleX(0)',
                        animation:
                          isActive && autoplay
                            ? `hero-progress ${SLIDE_DURATION_MS}ms linear forwards`
                            : undefined,
                        animationPlayState: isPaused ? 'paused' : 'running',
                      }}
                      onAnimationEnd={isActive && autoplay ? () => goTo(index + 1) : undefined}
                    />
                  </span>
                </button>
              );
            })}
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Slide sebelumnya"
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20 transition-colors hover:bg-white/25"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Slide berikutnya"
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20 transition-colors hover:bg-white/25"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
