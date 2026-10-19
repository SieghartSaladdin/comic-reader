# AGENTS.md - Comic Reader Web Application

## Overview Proyek
Aplikasi pembaca komik modern berbasis **Next.js (App Router)**, **TypeScript**, dan **Tailwind CSS**.
Mendukung mode ganda: **Webtoon (scroll vertikal)** dan **Manga (halaman per halaman / flip)**, dengan koleksi komik lokal siap pakai (offline-friendly) dan integrasi online API MangaDex.

## Aturan Arsitektur & Rekayasa Kode (Sesuai `modular_code.md`)
1. **Single Responsibility Principle (SRP):** Setiap komponen dan modul hanya memiliki 1 tanggung jawab spesifik.
2. **Komponen & Modul Kecil:**
   - Pisahkan UI Component (`src/components/...`), Data & Services (`src/services/...`), Types (`src/types/...`), Mock Data (`src/data/...`), dan Storage Utilities (`src/utils/...`).
   - Batasi panjang file agar tetap ringkas (< 200-300 baris).
3. **Reusabilitas:** Gunakan komponen independen (seperti `ReaderControls`, `WebtoonReader`, `MangaReader`, `ComicCard`, `Navbar`) yang mudah dirawat.
4. **Clean Code & Type Safety:** Selalu definisikan interface TypeScript secara eksplisit tanpa `any`.

## Struktur Direktori
- `src/types/comic.ts`: Interface data komik, chapter, halaman, riwayat, bookmark.
- `src/types/anime.ts`: Interface AnimeListItem, AnimeDetail, AnimeEpisodeItem, AnimeStreamData.
- `src/data/mockComics.ts`: Mock komik lokal berilustrasi lengkap siap baca offline.
- `src/data/mockAnime.ts`: Mock fallback data anime ongoing dan video player.
- `src/services/mangadex.ts`: Service dan helper untuk berinteraksi dengan API MangaDex.
- `src/services/animeParser.ts`: Cheerio scraper & HTML parser otakudesu.blog.
- `src/services/animeService.ts`: Layanan data anime ongoing, search, detail, dan video stream.
- `src/app/api/mangadex/...`: Proxy API route Next.js untuk menghindari CORS & caching.
- `src/app/api/anime/...`: API endpoints untuk anime (/ongoing, /search, /detail/[slug], /episode/[slug], /stream-proxy).
- `src/utils/storage.ts`: Penyimpanan lokal untuk bookmark, history, dan pengaturan reader.
- `src/components/layout/`: Komponen Navbar, Footer, Container.
- `src/components/comic/`: Komponen ComicCard, ComicGrid, HeroCarousel, DetailHeader, ChapterList.
- `src/components/anime/`: Komponen AnimeCard, AnimeGrid, AnimeEpisodeList, EpisodePlayer.
- `src/components/reader/`: WebtoonReader, MangaReader, ReaderControls, ReaderSettingsModal.
- `src/app/`: Halaman Home (`page.tsx`), Detail (`comic/[id]`), Reader (`reader/[comicId]/[chapterId]`), Bookmarks (`bookmarks`), History (`history`).
- `src/app/anime/`: Katalog Anime (`page.tsx`), Detail Anime (`[slug]/page.tsx`), Streaming Player (`watch/[slug]/page.tsx`).

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
