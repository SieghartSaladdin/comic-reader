import React, { useId } from 'react';

interface LogoMarkProps {
  className?: string;
}

/**
 * Lambang "Comic and Anime" tanpa latar: huruf "C" tebal dengan ekor balon komik (komik) dan tombol
 * play di dalamnya (anime). Warna mengikuti `currentColor` (memudar halus ke arah kanan bawah),
 * sehingga otomatis hitam di mode terang dan putih di mode gelap. Gambar yang sama dipakai di
 * `app/icon.svg`.
 */
export const LogoMark: React.FC<LogoMarkProps> = ({ className = 'h-9 w-9' }) => {
  const gradientId = `${useId()}-fade`;
  const paint = `url(#${gradientId})`;

  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Comic and Anime"
    >
      <defs>
        <linearGradient id={gradientId} x1="6" y1="4" x2="42" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="currentColor" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.58" />
        </linearGradient>
      </defs>

      {/* Huruf C */}
      <path
        d="M32.6 13.4A15 15 0 1 0 32.6 34.6"
        fill="none"
        stroke={paint}
        strokeWidth="6.5"
        strokeLinecap="round"
      />
      {/* Ekor balon komik di kiri bawah */}
      <path d="M9.5 35.5L5.5 45L16.5 41Z" fill={paint} stroke={paint} strokeWidth="2" strokeLinejoin="round" />
      {/* Tombol play di dalam C */}
      <path d="M20 17.5V30.5L31.5 24Z" fill={paint} stroke={paint} strokeWidth="2.4" strokeLinejoin="round" />
    </svg>
  );
};

interface LogoProps {
  /** Tampilkan tulisan "Comic & Anime" di samping lambang. */
  showWordmark?: boolean;
  /** Tampilkan baris kecil "Baca · Tonton" di bawah nama. */
  showTagline?: boolean;
  markClassName?: string;
}

/** Lambang + nama situs, dipakai di navbar dan footer. */
export const Logo: React.FC<LogoProps> = ({
  showWordmark = true,
  showTagline = false,
  markClassName = 'h-9 w-9',
}) => (
  <span className="inline-flex items-center gap-2.5 text-zinc-950 dark:text-white">
    <LogoMark className={`${markClassName} shrink-0`} />
    {showWordmark && (
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-extrabold tracking-tight">
          Comic<span className="mx-0.5 text-zinc-400 dark:text-zinc-500">&amp;</span>Anime
        </span>
        {showTagline && (
          <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
            Baca · Tonton
          </span>
        )}
      </span>
    )}
  </span>
);
