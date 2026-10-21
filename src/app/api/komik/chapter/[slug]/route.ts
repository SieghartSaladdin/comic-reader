import { NextRequest, NextResponse } from 'next/server';
import { unstable_rethrow } from 'next/navigation';
import { getChapterDetail } from '@/services/komikService';
import { cachedJson } from '@/utils/apiResponse';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug chapter tidak valid' },
        { status: 400 }
      );
    }

    const chapterDetail = await getChapterDetail(slug);
    if (!chapterDetail || chapterDetail.pages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Halaman chapter tidak ditemukan atau gagal dimuat' },
        { status: 404 }
      );
    }

    return cachedJson(
      {
        success: true,
        data: chapterDetail.pages,
        chapter: {
          slug: chapterDetail.slug,
          title: chapterDetail.title,
          comicSlug: chapterDetail.comicSlug,
          prevChapterSlug: chapterDetail.prevChapterSlug,
          nextChapterSlug: chapterDetail.nextChapterSlug,
          pages: chapterDetail.pages,
        },
      },
      'chapter'
    );
  } catch (error) {
    // Jangan telan sinyal internal Next.js (mis. bail-out prerender)
    unstable_rethrow(error);
    console.error('API Error /api/komik/chapter/[slug]:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat chapter komik' },
      { status: 500 }
    );
  }
}
