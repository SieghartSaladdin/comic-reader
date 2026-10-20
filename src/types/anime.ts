export interface AnimeListItem {
  slug: string;
  title: string;
  coverImage: string;
  latestEpisode?: string;
  releaseDay?: string;
  rating?: string;
  type?: string;
  status?: string;
  genres?: string[];
  studio?: string;
  /** Jumlah episode, mis. "12 Episode" (anime tamat). */
  episodeCount?: string;
  /** Tanggal rilis/update dari listing, mis. "14 Okt". */
  updatedLabel?: string;
  recentEpisodes?: {
    title: string;
    slug: string;
    releaseTime: string;
  }[];
}

export interface AnimeEpisodeItem {
  slug: string;
  title: string;
  episodeNumber: number;
  releaseDate?: string;
}

export interface AnimeDetail {
  slug: string;
  title: string;
  altTitle: string;
  coverImage: string;
  score: string;
  status: string;
  totalEpisodes: string;
  duration: string;
  releaseDate: string;
  studio: string;
  genres: string[];
  synopsis: string;
  episodes: AnimeEpisodeItem[];
}

export interface AnimeServerOption {
  name: string;
  url: string;
}

export interface AnimeStreamData {
  episodeTitle: string;
  animeTitle: string;
  animeSlug: string;
  streamUrl: string;
  iframeUrl?: string;
  servers?: AnimeServerOption[];
  prevEpisodeSlug?: string;
  nextEpisodeSlug?: string;
}

export type AnimeCatalogStatus = 'all' | 'ongoing' | 'complete';

export interface AnimeCatalogParams {
  page?: number;
  status?: AnimeCatalogStatus;
  /** Slug genre otakudesu, mis. "action". Mengabaikan filter status. */
  genre?: string;
  /** Kata kunci judul. Mengabaikan filter status, genre, dan halaman. */
  query?: string;
}

export interface AnimeCatalogResult {
  animes: AnimeListItem[];
  page: number;
  totalPages: number;
  hasNextPage: boolean;
}
