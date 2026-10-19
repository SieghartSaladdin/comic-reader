'use client';

import React, { useState } from 'react';
import { RefreshCw, ImageOff, Loader2 } from 'lucide-react';
import { ComicPage, ReaderZoomMode } from '@/types/comic';

interface ReaderImageProps {
  page: ComicPage;
  zoom?: ReaderZoomMode;
  alt?: string;
  onClick?: () => void;
  className?: string;
}

export const ReaderImage: React.FC<ReaderImageProps> = ({
  page,
  zoom = 'fit-width',
  alt,
  onClick,
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasError(false);
    setIsLoading(true);
    setRetryCount((prev) => prev + 1);
  };

  // Get responsive classes based on zoom mode
  const getZoomClass = (): string => {
    switch (zoom) {
      case 'fit-height':
        return 'max-h-[92vh] w-auto max-w-full object-contain mx-auto';
      case 'original':
        return 'max-w-none w-auto mx-auto object-none';
      case 'fit-width':
      default:
        return 'w-full max-w-4xl mx-auto h-auto object-cover md:object-contain';
    }
  };

  const rawSrc = page.imageUrl?.trim() || '';
  const imageSrc = retryCount > 0 ? `${rawSrc}?retry=${retryCount}` : rawSrc;
  const showError = hasError || !rawSrc;

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center min-h-[350px] md:min-h-[500px] w-full select-none ${className}`}
    >
      {/* Loading Skeleton Indicator */}
      {isLoading && !showError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/60 backdrop-blur-sm text-zinc-400 z-10 transition-opacity">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-2" />
          <span className="text-xs font-medium tracking-wider">Memuat Halaman {page.pageNumber}...</span>
        </div>
      )}

      {/* Error Fallback */}
      {showError ? (
        <div className="flex flex-col items-center justify-center p-8 bg-zinc-900/80 border border-zinc-800 rounded-xl text-zinc-300 max-w-md my-8 shadow-lg">
          <ImageOff className="w-12 h-12 text-rose-500 mb-3" />
          <p className="text-sm font-semibold mb-1">Gagal memuat Halaman {page.pageNumber}</p>
          <p className="text-xs text-zinc-400 mb-4 text-center">
            Koneksi terganggu atau gambar tidak tersedia sementara.
          </p>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-lg text-xs font-medium transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Coba Muat Ulang
          </button>
        </div>
      ) : (
        /* Image Element */
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc}
          alt={alt || `Halaman ${page.pageNumber}`}
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className={`transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          } ${getZoomClass()}`}
        />
      )}
    </div>
  );
};
