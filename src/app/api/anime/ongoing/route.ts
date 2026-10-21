import { NextResponse } from 'next/server';
import { unstable_rethrow } from 'next/navigation';
import { getOngoingAnime } from '@/services/animeService';
import { cachedJson } from '@/utils/apiResponse';

export async function GET() {
  try {
    const data = await getOngoingAnime();
    return cachedJson({ success: true, count: data.length, data }, 'feed');
  } catch (error) {
    // Jangan telan sinyal internal Next.js (mis. bail-out prerender)
    unstable_rethrow(error);
    console.error('API Error /api/anime/ongoing:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil anime ongoing' },
      { status: 500 }
    );
  }
}
