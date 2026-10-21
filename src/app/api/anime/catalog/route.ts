import { NextRequest, NextResponse } from 'next/server';
import { unstable_rethrow } from 'next/navigation';
import { getAnimeCatalog } from '@/services/animeCatalogService';
import { cachedJson } from '@/utils/apiResponse';
import { AnimeCatalogStatus } from '@/types/anime';

const VALID_STATUS: AnimeCatalogStatus[] = ['all', 'ongoing', 'complete'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawStatus = searchParams.get('status') as AnimeCatalogStatus | null;

    const data = await getAnimeCatalog({
      page: parseInt(searchParams.get('page') || '1', 10) || 1,
      status: rawStatus && VALID_STATUS.includes(rawStatus) ? rawStatus : 'all',
      genre: searchParams.get('genre') || undefined,
      query: searchParams.get('q') || undefined,
    });

    return cachedJson({ success: true, data }, 'catalog');
  } catch (error) {
    // Jangan telan sinyal internal Next.js (mis. bail-out prerender)
    unstable_rethrow(error);
    console.error('API Error /api/anime/catalog:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat katalog anime' },
      { status: 500 }
    );
  }
}
