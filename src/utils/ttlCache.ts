interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Cache memori sederhana dengan masa berlaku. Dipakai untuk menyimpan hasil parse HTML
 * (bukan HTML mentah) agar halaman tidak mem-parse ulang puluhan halaman detail tiap request.
 */
export function createTtlCache<T>(ttlMs: number, maxEntries = 500) {
  const store = new Map<string, CacheEntry<T>>();

  return {
    get(key: string): T | undefined {
      const entry = store.get(key);
      if (!entry) return undefined;
      if (entry.expiresAt < Date.now()) {
        store.delete(key);
        return undefined;
      }
      return entry.value;
    },
    set(key: string, value: T): void {
      if (store.size >= maxEntries) {
        const oldest = store.keys().next().value;
        if (oldest !== undefined) store.delete(oldest);
      }
      store.set(key, { value, expiresAt: Date.now() + ttlMs });
    },
  };
}
