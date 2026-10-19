export interface AnimeListItem {
  slug: string;
  title: string;
  coverImage: string;
  latestEpisode?: string;
  releaseDay?: string;
  rating?: string;
  type?: string;
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
