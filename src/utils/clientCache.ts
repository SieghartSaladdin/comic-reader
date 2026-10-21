const MAX_ENTRIES = 100;
const DEFAULT_TTL_MS = 5 * 60 * 1000;

interface Entry {
  expiresAt: number;
  promise: Promise<unknown>;
}

/** Cache respons JSON di memori browser; bertahan selama pengguna berpindah halaman di tab yang sama. */
const store = new Map<string, Entry>();

/**
 * Ambil JSON dengan cache memori + penggabungan permintaan yang sama yang sedang berjalan.
 * Kegagalan tidak disimpan, sehingga percobaan berikutnya mengambil ulang.
 */
export function cachedFetchJson<T>(url: string, ttlMs: number = DEFAULT_TTL_MS): Promise<T> {
  const now = Date.now();
  const hit = store.get(url);
  if (hit && hit.expiresAt > now) return hit.promise as Promise<T>;

  const promise = fetch(url).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as Promise<T>;
  });

  if (store.size >= MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest !== undefined) store.delete(oldest);
  }
  store.set(url, { expiresAt: now + ttlMs, promise });
  promise.catch(() => {
    if (store.get(url)?.promise === promise) store.delete(url);
  });

  return promise;
}

/** Panaskan cache untuk URL yang kemungkinan besar dibuka berikutnya; kegagalan diabaikan. */
export function prefetchJson(url: string, ttlMs: number = DEFAULT_TTL_MS): void {
  cachedFetchJson(url, ttlMs).catch(() => {});
}
