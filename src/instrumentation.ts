/**
 * Dipanggil Next.js sekali saat server mulai. Di produksi, cache dipanaskan agar pengunjung pertama
 * setelah deploy/restart tidak menunggu scraping dingin. Matikan dengan DISABLE_CACHE_WARMUP=1.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (process.env.NODE_ENV !== 'production' || process.env.DISABLE_CACHE_WARMUP === '1') return;

  const { startCacheWarmup } = await import('./utils/cacheWarmup');
  startCacheWarmup();
}
