import { NextRequest, NextResponse } from 'next/server';
import { unstable_rethrow } from 'next/navigation';
import { searchAnime } from '@/services/animeService';
import { cachedJson } from '@/utils/apiResponse';

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
    return cachedJson({ success: true, count: data.length, data }, 'search');
  } catch (error) {
    // Jangan telan sinyal internal Next.js (mis. bail-out prerender)
    unstable_rethrow(error);
    console.error('API Error /api/anime/search:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mencari anime' },
      { status: 500 }
    );
  }
}
