# Arsitektur cache dan performa

Aplikasi memakai Cache Components (`cacheComponents` dan `partialPrefetching` di `next.config.ts`).

## Lapisan cache, dari server sampai browser

1. **Data scraping (`use cache`).** Setiap fungsi di `src/services/*` memakai `use cache` dengan `cacheLife` dari profil di `next.config.ts`: `feed` (daftar terbaru dan populer), `catalog`, `detail`, `chapter`, `search`. Yang disimpan adalah hasil parse, bukan HTML mentah. Setelah `revalidate`, data lama tetap disajikan sambil diperbarui di latar. Hasil gagal atau kosong diberi umur `seconds` supaya tidak menetap.
2. **Halaman (Partial Prerendering).** `/`, `/anime`, `/bookmarks`, dan `/history` statis. `/comic/[id]`, `/reader/...`, `/anime/[slug]`, dan `/anime/watch/[slug]` berupa shell statis dengan isi yang di-stream, jadi skeleton langsung tampil. `params` selalu dibaca di dalam `<Suspense>`.
3. **API.** Respons sukses memakai `cachedJson()` (`src/utils/apiResponse.ts`) dengan `Cache-Control` per profil (browser, CDN, dan stale-while-revalidate).
4. **Browser.** `src/utils/clientCache.ts` menyimpan JSON di memori dan menggabungkan request yang sama. Ada juga prefetch halaman katalog berikutnya, prefetch chapter berikutnya di reader (`usePrefetchNextChapter`), dan pemanasan data chapter dan episode saat kursor mendekat.
5. **Pemanasan.** `src/instrumentation.ts` dan `src/utils/cacheWarmup.ts` memanaskan halaman utama saat server start dan menyegarkannya tiap 10 menit. Matikan dengan `DISABLE_CACHE_WARMUP=1`.

## Aturan saat menambah fitur

- Fungsi yang mengambil data dari luar: tambahkan `'use cache'`, `cacheTag(...)`, dan panggil satu `cacheLife('<profil>')` (pakai `if/else`, bukan ternary). Kegagalan memakai `cacheLife('seconds')`.
- Jangan pakai `export const dynamic`, `revalidate`, `cookies()`, atau `headers()` di luar `<Suspense>`.
- Jangan menghitung waktu sekarang (`Date`, atau teks relatif seperti "x hari lalu") langsung di komponen server. Lakukan di dalam fungsi `use cache`.
- Jangan pasang CSS `filter` atau `transform` pada pembungkus yang berisi elemen `fixed`.
- Route API: panggil `unstable_rethrow(error)` di awal `catch`.

## Membersihkan cache

Ubah `cacheTag`-nya lewat `revalidateTag` atau `updateTag`, atau restart container. Cache berada di memori dan dipanaskan ulang otomatis.
