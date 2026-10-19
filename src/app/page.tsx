import React, { Suspense } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroBanner } from '@/components/comic/HeroBanner';
import { ComicGrid } from '@/components/comic/ComicGrid';
import { ContinueReadingSection } from '@/components/comic/ContinueReadingSection';
import { PaginatedComicCatalog } from '@/components/comic/PaginatedComicCatalog';
import { getPopularComics, getFilteredComics } from '@/services/komikService';
import { Flame, Loader2 } from 'lucide-react';

async function HomeComicsContent() {
  const [popularComics, initialCatalog] = await Promise.all([
    getPopularComics(),
    getFilteredComics({ page: 1 }),
  ]);

  const spotlightComics =
    popularComics.length > 0
      ? popularComics.slice(0, 5)
      : initialCatalog.comics.slice(0, 5);

  return (
    <>
      {spotlightComics.length > 0 && (
        <section>
          <HeroBanner comics={spotlightComics} />
        </section>
      )}

      <ContinueReadingSection />

      {popularComics.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-zinc-950 dark:text-white tracking-tight">
                Komik Populer Hari Ini
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Daftar manga, manhwa, dan manhua paling ramai dibaca oleh komunitas.
              </p>
            </div>
          </div>
          <ComicGrid comics={popularComics.slice(0, 12)} showFilters={false} />
        </section>
      )}

      {/* Main Interactive Paginated & Filtered Catalog */}
      <section className="pt-4">
        <PaginatedComicCatalog
          initialComics={initialCatalog.comics}
          initialPage={initialCatalog.page}
          initialTotalPages={initialCatalog.totalEstimatedPages}
          initialHasNextPage={initialCatalog.hasNextPage}
        />
      </section>
    </>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
        <Suspense
          fallback={
            <div className="py-32 flex flex-col items-center justify-center text-zinc-500 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-900 dark:text-white" />
              <p className="text-xs tracking-wide">Memuat katalog komik...</p>
            </div>
          }
        >
          <HomeComicsContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
