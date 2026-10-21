import type { NextConfig } from "next";

const ONE_DAY = 60 * 60 * 24;
const ONE_WEEK = ONE_DAY * 7;

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,

  // Cache Components: `use cache` + Partial Prerendering + prefetching App Shell.
  cacheComponents: true,
  partialPrefetching: true,

  // Profil cache khusus proyek ini. `stale` = lama klien memakai data tanpa bertanya,
  // `revalidate` = setelah ini data lama tetap disajikan sambil diperbarui di latar,
  // `expire` = batas maksimum data lama boleh disajikan.
  cacheLife: {
    // Daftar yang cepat berubah (terbaru/populer). Teks "x menit lalu" ikut tersimpan,
    // jadi `expire` dibuat pendek agar tidak menampilkan waktu yang terlalu usang.
    feed: { stale: 60, revalidate: 120, expire: 1800 },
    // Katalog, filter, dan rekomendasi.
    catalog: { stale: 300, revalidate: 900, expire: 6 * 60 * 60 },
    // Detail komik/anime (daftar chapter/episode).
    detail: { stale: 300, revalidate: 600, expire: ONE_DAY },
    // Halaman chapter dan stream episode: hampir tidak pernah berubah.
    chapter: { stale: 600, revalidate: 3600, expire: ONE_WEEK },
    // Hasil pencarian.
    search: { stale: 60, revalidate: 600, expire: 3600 },
  },

  // Memori cache server (halaman prerender + `use cache`). Bawaan 50 MB mudah penuh karena tiap
  // chapter/detail punya entri sendiri; entri lama yang tergusur berarti scraping ulang.
  cacheMaxMemorySize: 200 * 1024 * 1024,

  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },

  async headers() {
    return [
      {
        // Aset statis di /public (ikon, placeholder) jarang berubah.
        source: "/:file(.*\\.(?:svg|png|jpg|jpeg|webp|avif|ico|woff2))",
        headers: [
          {
            key: "Cache-Control",
            value: `public, max-age=${ONE_DAY}, stale-while-revalidate=${ONE_WEEK}`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
