export type ComicStatus = 'Ongoing' | 'Completed';
export type ComicType = 'Manhwa' | 'Manga' | 'Manhua' | 'Comic';
export type ComicSource = 'komikindo';

export type ReaderReadingMode = 'webtoon' | 'manga-ltr' | 'manga-rtl';
export type ReaderZoomMode = 'fit-width' | 'fit-height' | 'original';
export type ReaderBackgroundColor = 'dark' | 'black' | 'light';

export interface ComicPage {
  pageNumber: number;
  imageUrl: string;
  width?: number;
  height?: number;
}

export interface Chapter {
  id: string;
  slug: string;
  comicId: string;
  comicSlug?: string;
  chapterNumber: number;
  title: string;
  releaseDate: string;
  pages: ComicPage[];
  scanlationGroup?: string;
  prevChapterSlug?: string;
  nextChapterSlug?: string;
}

export interface Comic {
  id: string;
  slug: string;
  title: string;
  altTitle?: string;
  description: string;
  coverImage: string;
  bannerImage?: string;
  author: string;
  artist: string;
  status: ComicStatus;
  type: ComicType;
  rating: number;
  genres: string[];
  releaseYear?: number;
  chapters: Chapter[];
  latestChapter?: string;
  latestChapterSlug?: string;
  recentChapters?: {
    title: string;
    slug: string;
    releaseTime: string;
  }[];
  updatedTime?: string;
  updatedChapterCount?: number;
  views?: string;
  source: ComicSource;
}

export interface ComicListItem {
  id: string;
  slug: string;
  title: string;
  coverImage: string;
  type: ComicType;
  rating: number;
  status?: ComicStatus;
  latestChapter?: string;
  latestChapterSlug?: string;
  recentChapters?: {
    title: string;
    slug: string;
    releaseTime: string;
  }[];
  updatedTime?: string;
  updatedChapterCount?: number;
  source: ComicSource;
}

export interface ReadingProgress {
  comicId: string;
  comicSlug?: string;
  comicTitle: string;
  comicCover: string;
  chapterId: string;
  chapterSlug?: string;
  chapterNumber: number;
  chapterTitle?: string;
  pageNumber: number;
  totalPages: number;
  percentage: number;
  lastReadAt: string;
  readingMode: 'webtoon' | 'manga';
}

export interface BookmarkItem {
  comicId: string;
  comicSlug?: string;
  title: string;
  coverImage: string;
  lastChapter: string;
  addedAt: string;
  rating: number;
  genres: string[];
}

export interface ReaderSettings {
  readingMode: ReaderReadingMode;
  zoom: ReaderZoomMode;
  background: ReaderBackgroundColor;
  brightness: number; // 50 to 100
}
