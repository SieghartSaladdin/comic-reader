import { AnimeListItem, AnimeDetail, AnimeStreamData } from '@/types/anime';

export const mockOngoingAnime: AnimeListItem[] = [
  {
    slug: 'solo-leveling-season-2-sub-indo',
    title: 'Solo Leveling Season 2: Arise from the Shadow',
    coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    latestEpisode: 'Episode 12',
    releaseDay: 'Minggu',
    rating: '8.85',
    type: 'TV',
    recentEpisodes: [
      {
        title: 'Eps. 12',
        slug: 'sl-s2-episode-12-sub-indo',
        releaseTime: 'Minggu',
      },
      {
        title: 'Eps. 11',
        slug: 'sl-s2-episode-11-sub-indo',
        releaseTime: '1 minggu lalu',
      },
    ],
  },
  {
    slug: 'dandadan-sub-indo',
    title: 'Dandadan',
    coverImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    latestEpisode: 'Episode 12',
    releaseDay: 'Kamis',
    rating: '8.62',
    type: 'TV',
    recentEpisodes: [
      {
        title: 'Eps. 12',
        slug: 'dandadan-episode-12-sub-indo',
        releaseTime: 'Kamis',
      },
      {
        title: 'Eps. 11',
        slug: 'dandadan-episode-11-sub-indo',
        releaseTime: '1 minggu lalu',
      },
    ],
  },
  {
    slug: 'bleach-sennen-kessen-hen-sub-indo',
    title: 'Bleach: Sennen Kessen-hen - Soukoku-tan',
    coverImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    latestEpisode: 'Episode 13',
    releaseDay: 'Sabtu',
    rating: '8.90',
    type: 'TV',
    recentEpisodes: [
      {
        title: 'Eps. 13',
        slug: 'bleach-sennen-kessen-hen-episode-13-sub-indo',
        releaseTime: 'Sabtu',
      },
      {
        title: 'Eps. 12',
        slug: 'bleach-sennen-kessen-hen-episode-12-sub-indo',
        releaseTime: '1 minggu lalu',
      },
    ],
  },
  {
    slug: 'blue-lock-vs-u-20-japan-sub-indo',
    title: 'Blue Lock vs. U-20 Japan',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    latestEpisode: 'Episode 14',
    releaseDay: 'Sabtu',
    rating: '8.45',
    type: 'TV',
    recentEpisodes: [
      {
        title: 'Eps. 14',
        slug: 'blue-lock-vs-u-20-japan-episode-14-sub-indo',
        releaseTime: 'Sabtu',
      },
      {
        title: 'Eps. 13',
        slug: 'blue-lock-vs-u-20-japan-episode-13-sub-indo',
        releaseTime: '1 minggu lalu',
      },
    ],
  },
  {
    slug: 'shangri-la-frontier-season-2-sub-indo',
    title: 'Shangri-La Frontier Season 2',
    coverImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
    latestEpisode: 'Episode 15',
    releaseDay: 'Minggu',
    rating: '8.21',
    type: 'TV',
    recentEpisodes: [
      {
        title: 'Eps. 15',
        slug: 'shangri-la-frontier-season-2-episode-15-sub-indo',
        releaseTime: 'Minggu',
      },
      {
        title: 'Eps. 14',
        slug: 'shangri-la-frontier-season-2-episode-14-sub-indo',
        releaseTime: '1 minggu lalu',
      },
    ],
  },
  {
    slug: 're-zero-season-3-sub-indo',
    title: 'Re:Zero kara Hajimeru Isekai Seikatsu 3rd Season',
    coverImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
    latestEpisode: 'Episode 8',
    releaseDay: 'Rabu',
    rating: '8.76',
    type: 'TV',
    recentEpisodes: [
      {
        title: 'Eps. 8',
        slug: 're-zero-season-3-episode-8-sub-indo',
        releaseTime: 'Rabu',
      },
      {
        title: 'Eps. 7',
        slug: 're-zero-season-3-episode-7-sub-indo',
        releaseTime: '1 minggu lalu',
      },
    ],
  },
];

export const mockAnimeDetailMap: Record<string, AnimeDetail> = {
  'solo-leveling-season-2-sub-indo': {
    slug: 'solo-leveling-season-2-sub-indo',
    title: 'Solo Leveling Season 2: Arise from the Shadow',
    altTitle: 'Ore dake Level Up na Ken Season 2',
    coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    score: '8.85',
    status: 'Ongoing',
    totalEpisodes: '12',
    duration: '24 min',
    releaseDate: 'Januari 2025',
    studio: 'A-1 Pictures',
    genres: ['Action', 'Adventure', 'Fantasy'],
    synopsis:
      'Sung Jin-woo kembali bertarung demi melindungi dunia dan mengungkap rahasia terdalam tentang sistem Monarch and Shadow Army.',
    episodes: [
      {
        slug: 'sl-s2-episode-12-sub-indo',
        title: 'Solo Leveling S2 Episode 12 Subtitle Indonesia',
        episodeNumber: 12,
        releaseDate: '19 Okt 2026',
      },
      {
        slug: 'sl-s2-episode-11-sub-indo',
        title: 'Solo Leveling S2 Episode 11 Subtitle Indonesia',
        episodeNumber: 11,
        releaseDate: '12 Okt 2026',
      },
      {
        slug: 'sl-s2-episode-1-sub-indo',
        title: 'Solo Leveling S2 Episode 1 Subtitle Indonesia',
        episodeNumber: 1,
        releaseDate: '5 Jan 2025',
      },
    ],
  },
};

export const mockDefaultStream: AnimeStreamData = {
  episodeTitle: 'Solo Leveling S2 Episode 12 Sub Indo',
  animeTitle: 'Solo Leveling Season 2: Arise from the Shadow',
  animeSlug: 'solo-leveling-season-2-sub-indo',
  streamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  iframeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  servers: [
    { name: 'DesuStream HD', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { name: 'Vidhide 720p', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  ],
  prevEpisodeSlug: 'sl-s2-episode-11-sub-indo',
};
