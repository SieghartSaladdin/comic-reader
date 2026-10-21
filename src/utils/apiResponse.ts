import { NextResponse } from 'next/server';

export type ApiCacheProfile = 'feed' | 'catalog' | 'detail' | 'chapter' | 'search';

/**
 * Lama browser (`max-age`) dan CDN/proxy (`s-maxage`) menyimpan respons, serta berapa lama data lama
 * boleh disajikan sambil diperbarui di latar (`stale-while-revalidate`). Selaras dengan profil
 * `cacheLife` di next.config.ts supaya server, CDN, dan browser berumur serupa.
 */
const PROFILES: Record<ApiCacheProfile, { maxAge: number; sMaxAge: number; swr: number }> = {
  feed: { maxAge: 60, sMaxAge: 120, swr: 1800 },
  catalog: { maxAge: 120, sMaxAge: 300, swr: 6 * 60 * 60 },
  detail: { maxAge: 120, sMaxAge: 600, swr: 24 * 60 * 60 },
  chapter: { maxAge: 300, sMaxAge: 3600, swr: 7 * 24 * 60 * 60 },
  search: { maxAge: 60, sMaxAge: 300, swr: 3600 },
};

/** Respons JSON sukses yang boleh disimpan cache browser dan CDN. Respons galat jangan memakai ini. */
export function cachedJson(body: unknown, profile: ApiCacheProfile): NextResponse {
  const { maxAge, sMaxAge, swr } = PROFILES[profile];
  return NextResponse.json(body, {
    headers: {
      'Cache-Control': `public, max-age=${maxAge}, s-maxage=${sMaxAge}, stale-while-revalidate=${swr}`,
    },
  });
}
