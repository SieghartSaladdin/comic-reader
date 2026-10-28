'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Comic, ReadingProgress } from '@/types/comic';
import {
  isBookmarked,
  addBookmark,
  removeBookmark,
  getComicProgress,
} from '@/utils/storage';
import { DEFAULT_COMIC_COVER } from '@/utils/imageUtils';
import { ComicDetailHeader } from './ComicDetailHeader';
import { ChapterList } from './ChapterList';

interface ComicDetailContentProps {
  comic: Comic;
}

export const ComicDetailContent: React.FC<ComicDetailContentProps> = ({ comic }) => {
  const comicKey = comic.slug || comic.id;
  const [bookmarked, setBookmarked] = useState(false);
  const [progress, setProgress] = useState<ReadingProgress | null>(null);
  const [isExpandedDesc, setIsExpandedDesc] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setBookmarked(isBookmarked(comicKey));
    setProgress(getComicProgress(comicKey));

    const handleUpdate = () => {
      setBookmarked(isBookmarked(comicKey));
      setProgress(getComicProgress(comicKey));
    };

    window.addEventListener('comic_bookmark_updated', handleUpdate);
    return () => window.removeEventListener('comic_bookmark_updated', handleUpdate);
  }, [comicKey]);

  const chronologicalChapters = useMemo(() => {
    if (!comic.chapters || comic.chapters.length === 0) return [];
    return [...comic.chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
  }, [comic.chapters]);

  const firstChapter = chronologicalChapters.length > 0 ? chronologicalChapters[0] : null;

  const handleToggleBookmark = () => {
    if (bookmarked) {
      removeBookmark(comicKey);
      setBookmarked(false);
    } else {
      const lastChapTitle = comic.chapters && comic.chapters.length > 0
        ? comic.chapters[0].title
        : 'Chapter 1';

      addBookmark({
        comicId: comicKey,
        comicSlug: comic.slug,
        title: comic.title,
        coverImage: comic.coverImage?.trim() ? comic.coverImage : DEFAULT_COMIC_COVER,
        lastChapter: lastChapTitle,
        addedAt: new Date().toISOString(),
        rating: comic.rating,
        genres: comic.genres || [],
      });
      setBookmarked(true);
    }
    window.dispatchEvent(new Event('comic_bookmark_updated'));
  };

  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch {
      // Ignore clipboard write failure
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <ComicDetailHeader
        comic={comic}
        comicKey={comicKey}
        bookmarked={bookmarked}
        onToggleBookmark={handleToggleBookmark}
        progress={progress}
        firstChapter={firstChapter}
        onShare={handleShare}
        isCopied={isCopied}
      />

      {/* Synopsis Section */}
      <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-5 sm:p-6 space-y-3 transition-colors duration-200">
        <h3 className="text-base font-bold text-zinc-950 dark:text-white tracking-tight">
          Sinopsis
        </h3>
        <p
          className={`text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line transition-all ${
            isExpandedDesc ? '' : 'line-clamp-4'
          }`}
        >
          {comic.description}
        </p>
        {comic.description && comic.description.length > 250 && (
          <button
            onClick={() => setIsExpandedDesc(!isExpandedDesc)}
            className="flex items-center gap-1 text-xs font-semibold text-zinc-900 dark:text-white hover:underline pt-1 cursor-pointer"
          >
            <span>{isExpandedDesc ? 'Tampilkan Lebih Sedikit' : 'Lihat Selengkapnya'}</span>
            {isExpandedDesc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Chapters Section */}
      <section className="space-y-3">
        <h3 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white tracking-tight">
          Semua Chapter
        </h3>
        <ChapterList
          comicId={comicKey}
          chapters={comic.chapters || []}
          lastReadChapterId={progress?.chapterId || null}
        />
      </section>
    </div>
  );
};
