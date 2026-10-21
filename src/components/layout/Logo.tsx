import React, { useId } from 'react';

interface LogoMarkProps {
  className?: string;
}

/**
 * Lambang "Comic and Anime": balon percakapan (komik) berwarna merah tua bergradasi, berisi huruf
 * "C" dengan segitiga play di dalamnya (anime). Gambar yang sama dipakai di `app/icon.svg`.
 */
export const LogoMark: React.FC<LogoMarkProps> = ({ className = 'h-9 w-9' }) => {
  const uid = useId();
  const body = `${uid}-body`;
  const shine = `${uid}-shine`;
  const bubble =
    'M16 4H32A12 12 0 0 1 44 16V28A12 12 0 0 1 32 40H22L11 46L16 40A12 12 0 0 1 4 28V16A12 12 0 0 1 16 4Z';

  return (
    <svg
      viewBox="0 0 48 50"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Comic and Anime"
    >
      <defs>
        <linearGradient id={body} x1="6" y1="4" x2="42" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#c9665d" />
          <stop offset="0.55" stopColor="#98403c" />
          <stop offset="1" stopColor="#5b2124" />
        </linearGradient>
        <linearGradient id={shine} x1="24" y1="4" x2="24" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <path d={bubble} fill={`url(#${body})`} />
      <path d={bubble} fill={`url(#${shine})`} />
      <path d={bubble} fill="none" stroke="#fff" strokeOpacity="0.16" strokeWidth="1" />

      {/* Huruf C */}
      <path
        d="M33.1 13.6A11 11 0 1 0 33.1 30.4"
        fill="none"
        stroke="#fff"
        strokeWidth="4.4"
        strokeLinecap="round"
      />
      {/* Tombol play di dalam C */}
      <path d="M24 16.6V27.4L32.6 22Z" fill="#fff" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
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
  <span className="inline-flex items-center gap-2.5">
    <LogoMark className={`${markClassName} shrink-0 drop-shadow-[0_4px_10px_rgba(152,64,60,0.35)]`} />
    {showWordmark && (
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Comic<span className="mx-0.5 text-accent-600 dark:text-accent-400">&amp;</span>Anime
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
