'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, Play, Star } from 'lucide-react';
import { RailItem, RailTag } from './recommendationTypes';

const TAG_STYLES: Record<RailTag, string> = {
  NEW: 'bg-white text-zinc-950',
  UP: 'bg-accent-300 text-zinc-950',
  HOT: 'bg-accent-600 text-white',
};

interface RecommendationCardProps {
  item: RailItem;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ item }) => {
  const [imgError, setImgError] = useState(false);
  const [flagError, setFlagError] = useState(false);
  const ActionIcon = item.action === 'watch' ? Play : BookOpen;
  const hasCover = item.cover?.trim() && !imgError;

  return (
    <Link
      href={item.href}
      title={item.title}
      className="group relative block shrink-0 w-[140px] sm:w-[165px] lg:w-[185px] aspect-[10/17] snap-start overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-accent-500/70 focus-visible:outline-2 focus-visible:outline-accent-500"
    >
      {hasCover ? (
        <img
          src={item.cover}
          alt={item.title}
          loading="lazy"
          onError={() => setImgError(true)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-3 text-center text-xs font-semibold text-zinc-600 dark:text-zinc-300">
          {item.title}
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30 opacity-60 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Badge atas: waktu update + tag, bendera negara */}
      <div className="absolute top-1.5 left-1.5 right-1.5 flex items-start justify-between gap-1 z-10">
        <div className="flex items-center gap-1">
          {item.timeAgo && (
            <span className="inline-flex items-center gap-1 rounded-md bg-black/65 backdrop-blur-sm pl-1 pr-1.5 py-0.5 text-[10px] font-semibold text-white">
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent-600">
                <Clock className="h-2.5 w-2.5" />
              </span>
              {item.timeAgo}
            </span>
          )}
          {item.tag && (
            <span
              className={`rounded-md px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide ${TAG_STYLES[item.tag]}`}
            >
              {item.tag}
            </span>
          )}
        </div>
        {item.country && !flagError && (
          <img
            src={`https://flagcdn.com/w40/${item.country}.png`}
            alt={item.country.toUpperCase()}
            width={20}
            height={14}
            onError={() => setFlagError(true)}
            className="h-[14px] w-5 rounded-[3px] object-cover ring-1 ring-white/70 shadow-sm"
          />
        )}
      </div>

      {/* Chip chapter/episode terbaru, selalu terlihat */}
      {item.latestLabel && (
        <span className="absolute bottom-1.5 left-1.5 z-10 rounded-md bg-black/65 backdrop-blur-sm px-1.5 py-0.5 text-[10px] font-bold text-white transition-opacity duration-200 group-hover:opacity-0">
          {item.latestLabel}
        </span>
      )}

      {/* Detail saat hover / fokus */}
      <div className="absolute inset-x-0 bottom-0 z-20 translate-y-3 p-2.5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
        <h3 className="line-clamp-2 text-[13px] font-bold leading-snug text-white">{item.title}</h3>

        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] font-medium text-white/80">
          {item.rating !== undefined && (
            <span className="inline-flex items-center gap-0.5 text-amber-300">
              <Star className="h-3 w-3 fill-current" />
              {item.rating.toFixed(1)}
            </span>
          )}
          <span>{item.kind}</span>
          {item.status && <span>{item.status}</span>}
        </div>

        {item.genres && item.genres.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {item.genres.map((genre) => (
              <span
                key={genre}
                className="rounded bg-white/15 px-1.5 py-0.5 text-[9px] font-medium text-white/90"
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        {item.studio && (
          <p className="mt-1 truncate text-[10px] text-white/60">{item.studio}</p>
        )}

        {item.entries.length > 0 && (
          <ul className="mt-1.5 space-y-0.5 border-t border-white/20 pt-1.5">
            {item.entries.map((entry) => (
              <li key={entry.href} className="flex items-center justify-between gap-2 text-[10px]">
                <span className="truncate font-semibold text-white">{entry.label}</span>
                <span className="shrink-0 text-white/60">{entry.time}</span>
              </li>
            ))}
          </ul>
        )}

        <span className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-white py-1.5 text-[11px] font-semibold text-zinc-950">
          <ActionIcon className="h-3 w-3" />
          {item.action === 'watch' ? 'Tonton' : 'Baca'}
        </span>
      </div>
    </Link>
  );
};
