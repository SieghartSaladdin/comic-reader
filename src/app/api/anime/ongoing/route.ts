import { NextResponse } from 'next/server';
import { getOngoingAnime } from '@/services/animeService';

export async function GET() {
  try {
    const data = await getOngoingAnime();
    return NextResponse.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error('API Error /api/anime/ongoing:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil anime ongoing' },
      { status: 500 }
    );
  }
}
