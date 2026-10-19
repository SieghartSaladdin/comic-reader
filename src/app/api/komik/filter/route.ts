import { NextRequest, NextResponse } from 'next/server';
import { getFilteredComics, FilterComicParams } from '@/services/komikService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10) || 1;

    // Collect genres from 'genres' (comma-separated or multiple) and 'genre'
    const genresList: string[] = [];
    const genresParam = searchParams.get('genres');
    if (genresParam) {
      genresList.push(
        ...genresParam
          .split(',')
          .map((g) => g.trim())
          .filter(Boolean)
      );
    }
    const singleGenre = searchParams.get('genre');
    if (singleGenre && !genresList.includes(singleGenre.trim())) {
      genresList.push(singleGenre.trim());
    }

    // Type validation
    const rawType = searchParams.get('type') || undefined;
    let validType: FilterComicParams['type'] = undefined;
    if (rawType && ['all', 'manga', 'manhwa', 'manhua'].includes(rawType.toLowerCase())) {
      validType = rawType.toLowerCase() as FilterComicParams['type'];
    }

    // Status validation
    const rawStatus = searchParams.get('status') || undefined;
    let validStatus: FilterComicParams['status'] = undefined;
    if (rawStatus && ['all', 'ongoing', 'completed'].includes(rawStatus.toLowerCase())) {
      validStatus = rawStatus.toLowerCase() as FilterComicParams['status'];
    }

    // Sort validation
    const rawSort = searchParams.get('sort') || searchParams.get('sortBy') || undefined;

    const data = await getFilteredComics({
      page,
      genres: genresList.length > 0 ? genresList : undefined,
      type: validType,
      status: validStatus,
      sort: rawSort,
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('API Error /api/komik/filter:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil data komik terfilter',
      },
      { status: 500 }
    );
  }
}
