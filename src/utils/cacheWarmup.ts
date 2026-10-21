const STARTUP_DELAY_MS = 3000;
const REFRESH_INTERVAL_MS = 10 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 60_000;

/**
 * Halaman dan API yang paling sering dibuka. Mengaksesnya mengisi cache `use cache` di server dan
 * (karena Next menyajikan data lama sambil memperbarui di latar) menjaganya tetap segar.
 */
const WARMUP_PATHS = [
  '/',
  '/anime',
  '/api/komik/popular',
  '/api/komik/latest',
  '/api/anime/ongoing',
  '/api/komik/filter?page=1',
  '/api/anime/catalog?page=1',
];

async function warmOnce(baseUrl: string): Promise<void> {
  for (const path of WARMUP_PATHS) {
    try {
      const res = await fetch(`${baseUrl}${path}`, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        headers: { 'x-cache-warmup': '1' },
      });
      await res.arrayBuffer();
    } catch {
      // Pemanasan bersifat best-effort: kegagalan sesaat tidak boleh mengganggu server.
    }
  }
}

/** Panaskan cache setelah server siap, lalu segarkan berkala di latar. */
export function startCacheWarmup(): void {
  const baseUrl = `http://127.0.0.1:${process.env.PORT || 3000}`;

  setTimeout(() => {
    void warmOnce(baseUrl);
    const timer = setInterval(() => void warmOnce(baseUrl), REFRESH_INTERVAL_MS);
    // Jangan menahan proses agar tetap bisa berhenti dengan bersih.
    timer.unref();
  }, STARTUP_DELAY_MS).unref();
}
