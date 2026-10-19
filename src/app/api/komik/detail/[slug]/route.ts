import { NextRequest, NextResponse } from 'next/server';
import { getComicDetail } from '@/services/komikService';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug komik tidak valid' },
        { status: 400 }
      );
    }

    const data = await getComicDetail(slug);
    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Komik tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('API Error /api/komik/detail/[slug]:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat detail komik' },
      { status: 500 }
    );
  }
}
