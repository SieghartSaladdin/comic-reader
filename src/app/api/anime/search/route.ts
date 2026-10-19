export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { searchAnime } from '@/services/animeService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        count: 0,
        data: [],
      });
    }

    const data = await searchAnime(query);
    return NextResponse.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error('API Error /api/anime/search:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mencari anime' },
      { status: 500 }
    );
  }
}
