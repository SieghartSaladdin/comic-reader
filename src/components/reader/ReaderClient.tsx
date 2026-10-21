'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Chapter, Comic, ReaderSettings } from '@/types/comic';
import { DEFAULT_READER_SETTINGS, getReaderSettings, saveReaderSettings } from '@/utils/storage';
import { useReaderProgress } from '@/hooks/useReaderProgress';
import { useHideOnUserScroll } from '@/hooks/useHideOnUserScroll';
import { usePrefetchNextChapter } from '@/hooks/usePrefetchNextChapter';
import { WebtoonReader } from './WebtoonReader';
import { MangaReader } from './MangaReader';
import { ReaderControls, ChapterNavItem } from './ReaderControls';
import { ReaderBottomBar } from './ReaderBottomBar';

// Daftar chapter dan panel pengaturan hanya dimuat saat pertama dibuka, bukan bersama JavaScript awal.
const ChapterListSheet = dynamic(() =>
  import('./ChapterListSheet').then((mod) => mod.ChapterListSheet)
);
const ReaderSettingsModal = dynamic(() =>
  import('./ReaderSettingsModal').then((mod) => mod.ReaderSettingsModal)
);

interface ReaderClientProps {
  comicId: string;
  chapterId: string;
  comic: Comic;
  chapter: Chapter;
}

const BG_CLASS: Record<ReaderSettings['background'], string> = {
  black: 'bg-black text-zinc-100',
  light: 'bg-zinc-100 text-zinc-900',
  dark: 'bg-[#121212] text-zinc-100',
};

/**
 * Bagian interaktif reader. Data komik dan chapter datang dari server (ber-cache) lewat props,
 * jadi halaman langsung tampil tanpa menunggu fetch dari browser.
 */
export const ReaderClient: React.FC<ReaderClientProps> = ({ comicId, chapterId, comic, chapter }) => {
  const router = useRouter();

  // Reader UI States
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isChapterListOpen, setIsChapterListOpen] = useState<boolean>(false);
  const [webtoonGap, setWebtoonGap] = useState<boolean>(false);
  // Mulai dari bawaan agar HTML server dan klien identik; pengaturan tersimpan dimuat setelah mount.
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_READER_SETTINGS);

  useEffect(() => {
    setSettings(getReaderSettings());
  }, []);

  // Adapt default reading mode to comic type (Manhwa/Manhua usually vertical scroll webtoon)
  useEffect(() => {
    if (comic.type === 'Manhwa' || comic.type === 'Manhua') {
      if (settings.readingMode.startsWith('manga')) {
        setSettings((prev) => ({ ...prev, readingMode: 'webtoon' }));
      }
    }
  }, [comic.type, settings.readingMode]);

  // Hook for reading progress and sync
  const { currentPage, totalPages, goToPage } = useReaderProgress({
    comicId,
    comicTitle: comic.title,
    comicCover: comic.coverImage,
    chapterId,
    chapterNumber: chapter.chapterNumber || 1,
    totalPages: chapter.pages.length,
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

  // Sembunyikan bar saat pengguna scroll lagi
  const hideControls = useCallback(() => setControlsVisible(false), []);
  useHideOnUserScroll(controlsVisible, hideControls);

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
    if (comic.chapters.length > 0) {
      return comic.chapters.map((ch) => ({
        id: ch.id || ch.slug,
        chapterNumber: ch.chapterNumber,
        title: ch.title,
        releaseDate: ch.releaseDate,
      }));
    }
    return [{ id: chapter.id, chapterNumber: chapter.chapterNumber, title: chapter.title }];
  }, [comic.chapters, chapter]);

  // Find next and prev chapter navigation
  const sortedChapters = useMemo(
    () => [...comic.chapters].sort((a, b) => a.chapterNumber - b.chapterNumber),
    [comic.chapters]
  );

  const currentIndex = sortedChapters.findIndex((ch) => ch.id === chapterId || ch.slug === chapterId);
  const hasListPrev = currentIndex > 0;
  const hasListNext = currentIndex >= 0 && currentIndex < sortedChapters.length - 1;

  const prevSlug = chapter.prevChapterSlug ?? (hasListPrev ? sortedChapters[currentIndex - 1].id : undefined);
  const nextSlug = chapter.nextChapterSlug ?? (hasListNext ? sortedChapters[currentIndex + 1].id : undefined);
  const hasPrevChapter = Boolean(prevSlug);
  const hasNextChapter = Boolean(nextSlug);

  // Siapkan chapter berikutnya (rute, data, gambar pertama) saat pembaca sudah separuh jalan.
  usePrefetchNextChapter({ comicId, nextChapterSlug: nextSlug, currentPage, totalPages });

  const handlePrevChapter = () => {
    if (prevSlug) router.push(`/reader/${comicId}/${prevSlug}`);
  };

  const handleNextChapter = () => {
    if (nextSlug) router.push(`/reader/${comicId}/${nextSlug}`);
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

  return (
    // Jangan pasang `filter` di wrapper ini: filter membuat elemen `fixed` (bar, modal)
    // menempel ke dokumen, bukan ke layar.
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 select-none ${
        BG_CLASS[settings.background] ?? BG_CLASS.dark
      }`}
    >
      {/* Top and Bottom Controls Overlay */}
      <ReaderControls
        isVisible={controlsVisible}
        comicId={comicId}
        comicTitle={comic.title}
        chapterTitle={chapter.title}
        chapterNumber={chapter.chapterNumber}
        chapters={chapters}
        onOpenChapterList={() => setIsChapterListOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Bottom bar: muncul saat layar di-tap, hilang saat pengguna scroll */}
      <ReaderBottomBar
        isVisible={controlsVisible}
        comicTitle={comic.title}
        chapterTitle={chapter.title}
        chapterNumber={chapter.chapterNumber}
        onOpenChapterList={() => setIsChapterListOpen(true)}
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
      <main
        className="flex-1 flex flex-col items-center justify-center w-full pt-14 pb-14"
        style={{ filter: `brightness(${settings.brightness}%)` }}
      >
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

      {/* Daftar chapter: satu-satunya pemilih chapter (dibuka dari header maupun bar bawah) */}
      {isChapterListOpen && (
        <ChapterListSheet
          isOpen={isChapterListOpen}
          onClose={() => setIsChapterListOpen(false)}
          chapters={chapters}
          currentChapterId={chapterId}
          onSelectChapter={handleSelectChapter}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <ReaderSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          gap={webtoonGap}
          onToggleGap={() => setWebtoonGap((prev) => !prev)}
        />
      )}
    </div>
  );
};
