import { NextRequest, NextResponse } from 'next/server';
import { unstable_rethrow } from 'next/navigation';
import { searchComics } from '@/services/komikService';
import { cachedJson } from '@/utils/apiResponse';

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
    return cachedJson({ success: true, query, data, count: data.length }, 'search');
  } catch (error) {
    // Jangan telan sinyal internal Next.js (mis. bail-out prerender)
    unstable_rethrow(error);
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
