'use client';

import React, { useState } from 'react';
import { Play } from 'lucide-react';

interface AnimeDetailCoverProps {
  coverImage?: string;
  title: string;
}

export const AnimeDetailCover: React.FC<AnimeDetailCoverProps> = ({
  coverImage,
  title,
}) => {
  const [imgError, setImgError] = useState(false);
  const src = coverImage?.trim();

  return (
    <div className="w-44 sm:w-56 aspect-[3/4.2] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-md shrink-0 mx-auto md:mx-0">
      {src && !imgError ? (
        <img
          src={src}
          alt={title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center select-none bg-zinc-100 dark:bg-zinc-900 text-zinc-400">
          <div className="w-12 h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mb-2 shadow-xs text-zinc-700 dark:text-zinc-200">
            <Play className="w-6 h-6 fill-current" />
          </div>
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 line-clamp-3">
            {title}
          </span>
        </div>
      )}
    </div>
  );
};
