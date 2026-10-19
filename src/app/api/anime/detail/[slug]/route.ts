import { NextRequest, NextResponse } from 'next/server';
import { getAnimeDetail } from '@/services/animeService';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug anime diperlukan' },
        { status: 400 }
      );
    }

    const data = await getAnimeDetail(slug);
    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Anime tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('API Error /api/anime/detail/[slug]:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil detail anime' },
      { status: 500 }
    );
  }
}
