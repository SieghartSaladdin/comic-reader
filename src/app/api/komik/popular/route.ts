import { NextResponse } from 'next/server';
import { unstable_rethrow } from 'next/navigation';
import { getPopularComics } from '@/services/komikService';
import { cachedJson } from '@/utils/apiResponse';

export async function GET() {
  try {
    const data = await getPopularComics();
    return cachedJson({ success: true, data, count: data.length }, 'feed');
  } catch (error) {
    // Jangan telan sinyal internal Next.js (mis. bail-out prerender)
    unstable_rethrow(error);
    console.error('API Error /api/komik/popular:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil daftar komik terpopuler',
      },
      { status: 500 }
    );
  }
}
