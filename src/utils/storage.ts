import { BookmarkItem, ReadingProgress, ReaderSettings } from '@/types/comic';

const STORAGE_KEYS = {
  BOOKMARKS: 'comic_reader_bookmarks',
  HISTORY: 'comic_reader_history',
  SETTINGS: 'comic_reader_settings',
} as const;

export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  readingMode: 'webtoon',
  zoom: 'fit-width',
  background: 'dark',
  brightness: 100,
};

const isClient = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const safeGetItem = <T>(key: string, fallback: T): T => {
  if (!isClient()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const safeSetItem = (key: string, value: unknown): void => {
  if (!isClient()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Gracefully ignore storage quota errors or restricted environments
  }
};

// ================= BOOKMARKS ================= //

export const getBookmarks = (): BookmarkItem[] => {
  return safeGetItem<BookmarkItem[]>(STORAGE_KEYS.BOOKMARKS, []);
};

export const addBookmark = (item: BookmarkItem): void => {
  const current = getBookmarks();
  const filtered = current.filter((b) => b.comicId !== item.comicId);
  const updated = [item, ...filtered];
  safeSetItem(STORAGE_KEYS.BOOKMARKS, updated);
};

export const removeBookmark = (comicId: string): void => {
  const current = getBookmarks();
  const updated = current.filter((b) => b.comicId !== comicId);
  safeSetItem(STORAGE_KEYS.BOOKMARKS, updated);
};

export const isBookmarked = (comicId: string): boolean => {
  const current = getBookmarks();
  return current.some((b) => b.comicId === comicId);
};

// ================= READING HISTORY ================= //

export const getReadingHistory = (): ReadingProgress[] => {
  return safeGetItem<ReadingProgress[]>(STORAGE_KEYS.HISTORY, []);
};

export const saveReadingHistory = (progress: ReadingProgress): void => {
  const current = getReadingHistory();
  const filtered = current.filter((h) => h.comicId !== progress.comicId);
  const updated = [progress, ...filtered].slice(0, 50); // limit to latest 50
  safeSetItem(STORAGE_KEYS.HISTORY, updated);
};

export const getComicProgress = (comicId: string): ReadingProgress | null => {
  const current = getReadingHistory();
  return current.find((h) => h.comicId === comicId) || null;
};

export const removeReadingHistory = (comicId: string): void => {
  const current = getReadingHistory();
  const updated = current.filter((h) => h.comicId !== comicId);
  safeSetItem(STORAGE_KEYS.HISTORY, updated);
};

export const clearReadingHistory = (): void => {
  safeSetItem(STORAGE_KEYS.HISTORY, []);
};

// ================= READER SETTINGS ================= //

export const getReaderSettings = (): ReaderSettings => {
  const saved = safeGetItem<Partial<ReaderSettings>>(STORAGE_KEYS.SETTINGS, {});
  return {
    ...DEFAULT_READER_SETTINGS,
    ...saved,
  };
};

export const saveReaderSettings = (settings: Partial<ReaderSettings>): void => {
  const current = getReaderSettings();
  const updated = {
    ...current,
    ...settings,
  };
  safeSetItem(STORAGE_KEYS.SETTINGS, updated);
};
