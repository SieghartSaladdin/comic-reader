import { NextRequest, NextResponse } from 'next/server';
import { unstable_rethrow } from 'next/navigation';
import { injectPlayerScript } from '@/utils/streamProxyScript';

/**
 * Reverse proxy untuk iframe stream anime (Otakudesu / DesuStream / Mirror).
 * Menghilangkan header proteksi iframe (X-Frame-Options & frame-ancestors CSP)
 * dan menyesuaikan referer serta URL relatif agar video dapat diputar tanpa kendala CORS/XFO.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (
      !targetUrl ||
      (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://'))
    ) {
      return new NextResponse('URL stream tidak valid atau tidak ditemukan.', {
        status: 400,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    const parsedTarget = new URL(targetUrl);
    const origin = parsedTarget.origin;

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://otakudesu.blog/',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    if (!response.ok) {
      return new NextResponse(
        `Gagal memuat stream video dari provider (${response.status}: ${response.statusText}).`,
        { status: response.status }
      );
    }

    const contentType =
      response.headers.get('content-type') || 'text/html; charset=utf-8';

    // Jika response bukan HTML (misal direct stream video mp4/m3u8)
    if (!contentType.includes('text/html')) {
      const buffer = await response.arrayBuffer();
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }

    let html = await response.text();

    // Injeksi tag <base> untuk me-resolve link & asset relatif ke upstream provider
    if (html.includes('<head>')) {
      html = html.replace(
        '<head>',
        `<head><base href="${origin}/" target="_blank" />`
      );
    } else if (html.includes('<HEAD>')) {
      html = html.replace(
        '<HEAD>',
        `<HEAD><base href="${origin}/" target="_blank" />`
      );
    } else {
      html = `<base href="${origin}/" target="_blank" />` + html;
    }

    // Rewrite link relatif src, href, action yang dimulai dengan '/'
    html = html.replace(
      /(src|href|action)=(["'])\/(?!\/)/gi,
      `$1=$2${origin}/`
    );

    // Injeksi script interaksi player (Hold-to-2x speed & postMessage listener)
    html = injectPlayerScript(html);

    // Return HTML dengan header X-Frame-Options dan frame-ancestors CSP dihapus
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    // Jangan telan sinyal internal Next.js (mis. bail-out prerender)
    unstable_rethrow(error);
    console.error('Error in /api/anime/stream-proxy:', error);
    return new NextResponse(
      'Terjadi kesalahan saat memproses stream video. Silakan coba buka player eksternal.',
      {
        status: 500,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      }
    );
  }
}
