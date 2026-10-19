import { NextRequest, NextResponse } from 'next/server';
import { getEpisodeStream } from '@/services/animeService';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug episode diperlukan' },
        { status: 400 }
      );
    }

    const data = await getEpisodeStream(slug);
    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Episode tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('API Error /api/anime/episode/[slug]:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data streaming episode' },
      { status: 500 }
    );
  }
}
