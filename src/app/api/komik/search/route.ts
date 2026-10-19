export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { searchComics } from '@/services/komikService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || searchParams.get('query') || '';

    if (!query.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parameter pencarian (q) wajib diisi',
        },
        { status: 400 }
      );
    }

    const data = await searchComics(query);
    return NextResponse.json({
      success: true,
      query,
      data,
      count: data.length,
    });
  } catch (error) {
    console.error('API Error /api/komik/search:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal melakukan pencarian komik',
      },
      { status: 500 }
    );
  }
}
