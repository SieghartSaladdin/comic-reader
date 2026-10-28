'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, Star, BookOpen } from 'lucide-react';
import { Comic, ComicListItem } from '@/types/comic';
import { isBookmarked, addBookmark, removeBookmark } from '@/utils/storage';
import { DEFAULT_COMIC_COVER } from '@/utils/imageUtils';

interface ComicCardProps {
  comic: Comic | ComicListItem;
}

export const ComicCard: React.FC<ComicCardProps> = ({ comic }) => {
  const comicKey = comic.slug || comic.id;
  const [bookmarked, setBookmarked] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setBookmarked(isBookmarked(comicKey));

    const handleUpdate = () => {
      setBookmarked(isBookmarked(comicKey));
    };

    window.addEventListener('comic_bookmark_updated', handleUpdate);
    return () => window.removeEventListener('comic_bookmark_updated', handleUpdate);
  }, [comicKey]);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (bookmarked) {
      removeBookmark(comicKey);
      setBookmarked(false);
    } else {
      const fullComic = comic as Comic;
      const lastChapter =
        comic.latestChapter ||
        (fullComic.chapters && fullComic.chapters.length > 0
          ? fullComic.chapters[0].title
          : 'Chapter 1');

      addBookmark({
        comicId: comicKey,
        comicSlug: comic.slug,
        title: comic.title,
        coverImage: comic.coverImage?.trim() ? comic.coverImage : DEFAULT_COMIC_COVER,
        lastChapter,
        addedAt: new Date().toISOString(),
        rating: comic.rating,
        genres: fullComic.genres || [],
      });
      setBookmarked(true);
    }

    window.dispatchEvent(new Event('comic_bookmark_updated'));
  };

  const fullComic = comic as Partial<Comic>;
  const displaySubtitle = fullComic.author || `${comic.type} Sub Indo`;

  // Format 2 baris chapter terbaru lengkap dengan waktu rilis
  const chaptersToDisplay = (() => {
    const list: { title: string; slug: string; releaseTime: string }[] = [];

    if (comic.recentChapters && comic.recentChapters.length > 0) {
      list.push(...comic.recentChapters.slice(0, 2));
    } else {
      const latestTitle =
        comic.latestChapter ||
        (fullComic.chapters && fullComic.chapters.length > 0
          ? fullComic.chapters[0].title
          : null);
      const latestSlug =
        comic.latestChapterSlug ||
        (fullComic.chapters && fullComic.chapters.length > 0
          ? fullComic.chapters[0].slug
          : null);

      if (latestTitle && latestSlug && latestTitle !== 'Ch. -') {
        const match = latestTitle.match(/(?:chapter|ch\.?)\s*(\d+(?:\.\d+)?)/i);
        const title = match
          ? `Ch. ${match[1]}`
          : latestTitle.startsWith('Ch.') || latestTitle.startsWith('Chapter')
          ? latestTitle.replace(/^Chapter\s*/i, 'Ch. ')
          : `Ch. ${latestTitle}`;
        list.push({
          title,
          slug: latestSlug,
          releaseTime: comic.updatedTime || 'Baru saja',
        });
      }
    }

    if (list.length === 0) {
      list.push({
        title: 'Ch. Terbaru',
        slug: '',
        releaseTime: comic.updatedTime || 'Baru saja',
      });
    }

    return list.slice(0, 2);
  })();

  return (
    <div className="group relative flex flex-col rounded-2xl bg-white dark:bg-[#121214] border border-zinc-200/90 dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-600 p-2.5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
      {/* Cover Image Container */}
      <Link
        href={`/comic/${comicKey}`}
        className="block relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60"
      >
        {comic.coverImage?.trim() && !imgError ? (
          <img
            src={comic.coverImage}
            alt={comic.title}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-900 text-zinc-400 p-4 text-center select-none group-hover:scale-105 transition-transform duration-500">
            <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mb-2 shadow-xs text-zinc-700 dark:text-zinc-200">
              <BookOpen className="w-5 h-5 stroke-[1.75]" />
            </div>
            <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 line-clamp-2 px-1">
              {comic.title}
            </span>
          </div>
        )}

        {/* Subtle Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 opacity-70 group-hover:opacity-50 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-10 pointer-events-none">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider text-white bg-black/55 border border-white/20">
            {comic.type}
          </span>
          {comic.updatedChapterCount && comic.updatedChapterCount > 1 && (
            <span className="border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/90 text-[10px] font-semibold text-zinc-800 dark:text-zinc-200 px-1.5 py-0.5 rounded-md shadow-xs">
              Update {comic.updatedChapterCount} Ch
            </span>
          )}
        </div>

        {/* Bookmark Quick Toggle Button */}
        <button
          onClick={toggleBookmark}
          aria-label={bookmarked ? 'Hapus bookmark' : 'Tambah bookmark'}
          className={`absolute top-2 right-2 z-20 p-2 rounded-xl transition-all cursor-pointer ${
            bookmarked
              ? 'bg-white text-zinc-950 hover:bg-zinc-200 shadow-sm'
              : 'bg-black/50 text-white/80 hover:bg-black/80 hover:text-white'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
        </button>

        {/* Bottom Cover Info */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs z-10">
          <span className="flex items-center gap-1 font-semibold text-white bg-black/60 px-1.5 py-0.5 rounded-md text-[11px] border border-white/10">
            <Star className="w-3 h-3 fill-white text-white" />
            {(comic.rating || 8.0).toFixed(1)}
          </span>
          {comic.status && (
            <span className="text-[10px] bg-black/60 text-white/90 px-1.5 py-0.5 rounded-md font-medium border border-white/10">
              {comic.status}
            </span>
          )}
        </div>
      </Link>

      {/* Info Section */}
      <div className="mt-2.5 flex flex-col flex-1 justify-between px-1">
        <div>
          <Link href={`/comic/${comicKey}`}>
            <h3
              className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors"
              title={comic.title}
            >
              {comic.title}
            </h3>
          </Link>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
            {displaySubtitle}
          </p>
        </div>

        {/* Chapter and Update Time Footer */}
        <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-2 mt-2 space-y-1">
          {chaptersToDisplay.map((ch, idx) => (
            <div
              key={`${ch.slug}-${idx}`}
              className="flex items-center justify-between text-[11px] gap-2"
            >
              <Link
                href={ch.slug ? `/reader/${comicKey}/${ch.slug}` : `/comic/${comicKey}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:underline transition-colors truncate"
                title={ch.title}
              >
                {ch.title}
              </Link>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 shrink-0 font-normal">
                {ch.releaseTime}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
