import { NextResponse } from 'next/server';
import { getPopularComics } from '@/services/komikService';

export async function GET() {
  try {
    const data = await getPopularComics();
    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error) {
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
