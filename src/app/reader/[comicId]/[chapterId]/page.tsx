'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, use, useCallback, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { ReaderSettings } from '@/types/comic';
import { getReaderSettings, saveReaderSettings } from '@/utils/storage';
import { useChapterData } from '@/hooks/useChapterData';
import { useReaderProgress } from '@/hooks/useReaderProgress';
import { WebtoonReader } from '@/components/reader/WebtoonReader';
import { MangaReader } from '@/components/reader/MangaReader';
import { ReaderControls, ChapterNavItem } from '@/components/reader/ReaderControls';
import { ReaderSettingsModal } from '@/components/reader/ReaderSettingsModal';

interface ReaderPageProps {
  params: Promise<{
    comicId: string;
    chapterId: string;
  }>;
}

function ReaderLoadingFallback() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-zinc-300">
      <Loader2 className="w-8 h-8 animate-spin text-white mb-4" />
      <p className="text-xs font-semibold tracking-wide">Menyiapkan Reader...</p>
    </div>
  );
}

function ReaderContent({ params }: ReaderPageProps) {
  const router = useRouter();
  const { comicId, chapterId } = use(params);

  // Fetch comic and chapter data with custom hook
  const { comic, chapter, loading, error, reload } = useChapterData(comicId, chapterId);

  // Reader UI States
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [webtoonGap, setWebtoonGap] = useState<boolean>(false);
  const [settings, setSettings] = useState<ReaderSettings>(getReaderSettings());

  // Adapt default reading mode to comic type (Manhwa/Manhua usually vertical scroll webtoon)
  useEffect(() => {
    if (comic?.type === 'Manhwa' || comic?.type === 'Manhua') {
      if (settings.readingMode.startsWith('manga')) {
        setSettings((prev) => ({ ...prev, readingMode: 'webtoon' }));
      }
    }
  }, [comic?.type, settings.readingMode]);

  // Hook for reading progress and sync
  const { currentPage, totalPages, goToPage } = useReaderProgress({
    comicId,
    comicTitle: comic?.title || '',
    comicCover: comic?.coverImage || '',
    chapterId,
    chapterNumber: chapter?.chapterNumber || 1,
    totalPages: chapter?.pages.length || 0,
    readingMode: settings.readingMode === 'webtoon' ? 'webtoon' : 'manga',
  });

  // Settings update handler
  const handleUpdateSettings = (updated: Partial<ReaderSettings>) => {
    const next = { ...settings, ...updated };
    setSettings(next);
    saveReaderSettings(next);
  };

  // Toggle Controls visibility
  const toggleControls = useCallback(() => {
    setControlsVisible((prev) => !prev);
  }, []);

  // Keyboard shortcut for space bar (toggle controls) and F (fullscreen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        toggleControls();
      } else if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleControls]);

  // Chapter Navigation items for the dropdown
  const chapters: ChapterNavItem[] = useMemo(() => {
    if (comic?.chapters && comic.chapters.length > 0) {
      return comic.chapters.map((ch) => ({
        id: ch.id || ch.slug,
        chapterNumber: ch.chapterNumber,
        title: ch.title,
      }));
    }
    if (chapter) {
      return [
        {
          id: chapter.id,
          chapterNumber: chapter.chapterNumber,
          title: chapter.title,
        },
      ];
    }
    return [];
  }, [comic?.chapters, chapter]);

  // Find next and prev chapter navigation
  const sortedChapters = useMemo(() => {
    if (!comic?.chapters || comic.chapters.length === 0) return [];
    return [...comic.chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
  }, [comic?.chapters]);

  const currentIndex = sortedChapters.findIndex(
    (ch) => ch.id === chapterId || ch.slug === chapterId
  );
  const hasListPrev = currentIndex > 0;
  const hasListNext = currentIndex >= 0 && currentIndex < sortedChapters.length - 1;

  const hasPrevChapter = Boolean(chapter?.prevChapterSlug) || hasListPrev;
  const hasNextChapter = Boolean(chapter?.nextChapterSlug) || hasListNext;

  const handlePrevChapter = () => {
    if (chapter?.prevChapterSlug) {
      router.push(`/reader/${comicId}/${chapter.prevChapterSlug}`);
    } else if (hasListPrev) {
      router.push(`/reader/${comicId}/${sortedChapters[currentIndex - 1].id}`);
    }
  };

  const handleNextChapter = () => {
    if (chapter?.nextChapterSlug) {
      router.push(`/reader/${comicId}/${chapter.nextChapterSlug}`);
    } else if (hasListNext) {
      router.push(`/reader/${comicId}/${sortedChapters[currentIndex + 1].id}`);
    }
  };

  const handleSelectChapter = (selectedId: string) => {
    if (selectedId !== chapterId) {
      router.push(`/reader/${comicId}/${selectedId}`);
    }
  };

  const toggleReadingMode = () => {
    const nextMode = settings.readingMode === 'webtoon' ? 'manga-rtl' : 'webtoon';
    handleUpdateSettings({ readingMode: nextMode });
  };

  const getBgClass = () => {
    switch (settings.background) {
      case 'black':
        return 'bg-black text-zinc-100';
      case 'light':
        return 'bg-zinc-100 text-zinc-900';
      case 'dark':
      default:
        return 'bg-[#121212] text-zinc-100';
    }
  };

  if (loading) {
    return <ReaderLoadingFallback />;
  }

  if (error || !comic || !chapter) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="p-4 rounded-full bg-rose-500/10 text-rose-400 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-zinc-100 mb-2">Gagal Membuka Chapter</h2>
        <p className="text-xs text-zinc-400 max-w-sm mb-6">{error || 'Chapter tidak ditemukan'}</p>
        <div className="flex gap-3">
          <Link
            href={`/comic/${comicId}`}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Komik
          </Link>
          <button
            onClick={reload}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 select-none ${getBgClass()}`}
      style={{ filter: `brightness(${settings.brightness}%)` }}
    >
      {/* Top and Bottom Controls Overlay */}
      <ReaderControls
        isVisible={controlsVisible}
        comicId={comicId}
        comicTitle={comic.title}
        chapterTitle={chapter.title}
        chapterNumber={chapter.chapterNumber}
        chapters={chapters}
        currentChapterId={chapterId}
        onSelectChapter={handleSelectChapter}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        onPrevChapter={handlePrevChapter}
        onNextChapter={handleNextChapter}
        hasPrevChapter={hasPrevChapter}
        hasNextChapter={hasNextChapter}
        readingMode={settings.readingMode}
        onToggleReadingMode={toggleReadingMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center w-full pt-14 pb-14">
        {settings.readingMode === 'webtoon' ? (
          <WebtoonReader
            pages={chapter.pages}
            currentPage={currentPage}
            onPageChange={goToPage}
            zoom={settings.zoom}
            gap={webtoonGap}
            onToggleControls={toggleControls}
            onNextChapter={handleNextChapter}
            onPrevChapter={handlePrevChapter}
            hasNextChapter={hasNextChapter}
            hasPrevChapter={hasPrevChapter}
          />
        ) : (
          <MangaReader
            pages={chapter.pages}
            currentPage={currentPage}
            onPageChange={goToPage}
            readingMode={settings.readingMode}
            zoom={settings.zoom}
            onToggleControls={toggleControls}
            onNextChapter={handleNextChapter}
            onPrevChapter={handlePrevChapter}
            hasNextChapter={hasNextChapter}
            hasPrevChapter={hasPrevChapter}
          />
        )}
      </main>

      {/* Settings Modal */}
      <ReaderSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        gap={webtoonGap}
        onToggleGap={() => setWebtoonGap((prev) => !prev)}
      />
    </div>
  );
}

export default function ReaderPage(props: ReaderPageProps) {
  return (
    <Suspense fallback={<ReaderLoadingFallback />}>
      <ReaderContent {...props} />
    </Suspense>
  );
}
