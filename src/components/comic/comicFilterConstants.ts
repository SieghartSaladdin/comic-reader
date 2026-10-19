export type ComicFilterType = 'all' | 'manhwa' | 'manga' | 'manhua';
export type ComicFilterStatus = 'all' | 'ongoing' | 'completed';
export type ComicFilterSort = 'latest' | 'popular' | 'rating' | 'title';

export const ALL_GENRES = [
  'Action',
  'Adventure',
  'Fantasy',
  'Isekai',
  'Romance',
  'Sci-Fi',
  'Comedy',
  'Drama',
  'Supernatural',
  'Martial Arts',
  'Shounen',
  'Slice of Life',
  'Mystery',
  'Psychological',
  'Horror',
] as const;

export const TYPE_OPTIONS: { id: ComicFilterType; label: string; badge: string }[] = [
  { id: 'all', label: 'Semua', badge: 'All' },
  { id: 'manhwa', label: 'Manhwa', badge: 'Korea' },
  { id: 'manga', label: 'Manga', badge: 'Jepang' },
  { id: 'manhua', label: 'Manhua', badge: 'China' },
];

export const STATUS_OPTIONS: { value: ComicFilterStatus; label: string }[] = [
  { value: 'all', label: 'Semua Status' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Tamat / Completed' },
];

export const SORT_OPTIONS: { value: ComicFilterSort; label: string }[] = [
  { value: 'latest', label: 'Paling Baru' },
  { value: 'popular', label: 'Terpopuler' },
  { value: 'rating', label: 'Rating Tertinggi' },
  { value: 'title', label: 'Abjad (A-Z)' },
];
