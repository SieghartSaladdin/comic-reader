This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Arsitektur Cache & Performa

Aplikasi memakai **Cache Components** (`cacheComponents` + `partialPrefetching` di `next.config.ts`).

**Lapisan cache (dari server sampai browser)**

1. **Data scraping (`use cache`)** — setiap fungsi di `src/services/*` ber-`use cache` dengan `cacheLife` dari profil di `next.config.ts`: `feed` (daftar terbaru/populer), `catalog`, `detail`, `chapter`, `search`. Yang disimpan adalah hasil parse, bukan HTML mentah. Setelah `revalidate`, data lama tetap disajikan sambil diperbarui di latar. Hasil gagal/kosong diberi umur `seconds` supaya tidak menetap.
2. **Halaman (Partial Prerendering)** — `/`, `/anime`, `/bookmarks`, `/history` statis; `/comic/[id]`, `/reader/...`, `/anime/[slug]`, `/anime/watch/[slug]` berupa shell statis + isi di-stream (skeleton langsung tampil). `params` selalu dibaca di dalam `<Suspense>`.
3. **API** — respons sukses memakai `cachedJson()` (`src/utils/apiResponse.ts`) dengan `Cache-Control` per profil (browser + CDN + stale-while-revalidate).
4. **Browser** — `src/utils/clientCache.ts` (cache JSON di memori + penggabungan request), prefetch halaman katalog berikutnya, prefetch chapter berikutnya di reader (`usePrefetchNextChapter`), dan pemanasan data chapter/episode saat kursor mendekat.
5. **Pemanasan** — `src/instrumentation.ts` + `src/utils/cacheWarmup.ts` memanaskan halaman utama saat server start dan menyegarkannya tiap 10 menit (matikan dengan `DISABLE_CACHE_WARMUP=1`).

**Aturan saat menambah fitur**

- Fungsi yang mengambil data dari luar: tambahkan `'use cache'`, `cacheTag(...)`, dan panggil **satu** `cacheLife('<profil>')` (pakai `if/else`, bukan ternary). Kegagalan → `cacheLife('seconds')`.
- Jangan pakai `export const dynamic`/`revalidate`, `cookies()`, atau `headers()` di luar `<Suspense>`.
- Jangan menghitung waktu sekarang (`Date`, relatif "x hari lalu") langsung di komponen server; lakukan di dalam fungsi `use cache`.
- Jangan pasang CSS `filter`/`transform` pada pembungkus yang berisi elemen `fixed`.
- Route API: panggil `unstable_rethrow(error)` di awal `catch`.

**Membersihkan cache**: ubah `cacheTag`-nya lewat `revalidateTag`/`updateTag`, atau cukup restart container (cache berada di memori dan dipanaskan ulang otomatis).
