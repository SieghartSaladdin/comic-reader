import { NextResponse } from 'next/server';
import { getLatestComics } from '@/services/komikService';

export async function GET() {
  try {
    const data = await getLatestComics();
    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error) {
    console.error('API Error /api/komik/latest:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil komik rilis terbaru',
      },
      { status: 500 }
    );
  }
}
