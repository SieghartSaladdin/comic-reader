'use client';

import React, { useState, useRef } from 'react';
import {
  AnimeStreamData,
  AnimeEpisodeItem,
  AnimeServerOption,
} from '@/types/anime';
import {
  Maximize2,
  RefreshCw,
  ListVideo,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { PlayerSpeedControls } from './PlayerSpeedControls';
import { PlayerServerSelector } from './PlayerServerSelector';
import { PlayerEpisodeNavigation } from './PlayerEpisodeNavigation';
import { PlayerProxyBanner } from './PlayerProxyBanner';

interface EpisodePlayerProps {
  streamData: AnimeStreamData;
  episodes?: AnimeEpisodeItem[];
  currentEpisodeSlug: string;
}

export const EpisodePlayer: React.FC<EpisodePlayerProps> = ({
  streamData,
  episodes = [],
  currentEpisodeSlug,
}) => {
  const initialUrl = streamData.streamUrl || streamData.iframeUrl || '';
  const [activeUrl, setActiveUrl] = useState<string>(initialUrl);
  const [selectedServer, setSelectedServer] = useState<string>('Default Server');
  const [isTheatreMode, setIsTheatreMode] = useState<boolean>(false);
  const [keyReload, setKeyReload] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [useProxy, setUseProxy] = useState<boolean>(true);
  const [currentSpeed, setCurrentSpeed] = useState<number>(1);
  const [isHoldingSpeed, setIsHoldingSpeed] = useState<boolean>(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastHoldEndTimeRef = useRef<number>(0);

  // Normalisasi daftar server
  const serverList: AnimeServerOption[] =
    streamData.servers && streamData.servers.length > 0
      ? streamData.servers
      : initialUrl
      ? [{ name: 'Default Server', url: initialUrl }]
      : [];

  const handleSelectServer = (server: AnimeServerOption) => {
    setSelectedServer(server.name);
    if (server.url) {
      setActiveUrl(server.url);
      setIsLoading(true);
      setKeyReload((k) => k + 1);
    }
  };

  const handleReload = () => {
    setIsLoading(true);
    setKeyReload((k) => k + 1);
  };

  const sendPostMessage = (message: { type: string; rate?: number }) => {
    try {
      iframeRef.current?.contentWindow?.postMessage(message, '*');
    } catch (e) {
      console.error('Gagal mengirim postMessage ke iframe:', e);
    }
  };

  const handleSelectSpeed = (speed: number) => {
    setCurrentSpeed(speed);
    sendPostMessage({ type: 'SET_SPEED', rate: speed });
  };

  // Wrapper hold-to-2x interaction
  const handleWrapperPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button, a')) return;

    if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    holdTimeoutRef.current = setTimeout(() => {
      setIsHoldingSpeed(true);
      sendPostMessage({ type: 'HOLD_SPEED_START' });
    }, 180);
  };

  const handleWrapperPointerUp = () => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (isHoldingSpeed) {
      setIsHoldingSpeed(false);
      lastHoldEndTimeRef.current = Date.now();
      sendPostMessage({ type: 'HOLD_SPEED_END' });
    }
  };

  const handleWrapperClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isHoldingSpeed || Date.now() - lastHoldEndTimeRef.current < 350) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const handleToggleProxy = () => {
    setUseProxy((prev) => !prev);
    setIsLoading(true);
    setKeyReload((k) => k + 1);
  };

  // URL iframe: lewat proxy internal jika useProxy & URL absolut
  const iframeSrc = activeUrl
    ? useProxy && activeUrl.startsWith('http')
      ? `/api/anime/stream-proxy?url=${encodeURIComponent(activeUrl)}`
      : activeUrl
    : '';

  return (
    <div className={`flex flex-col space-y-3 ${isTheatreMode ? 'w-full' : ''}`}>
      {/* Video Iframe Container: Matte Black */}
      <div
        className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm group select-none"
        onPointerDown={handleWrapperPointerDown}
        onPointerUp={handleWrapperPointerUp}
        onPointerLeave={handleWrapperPointerUp}
        onPointerCancel={handleWrapperPointerUp}
        onClickCapture={handleWrapperClickCapture}
      >
        {/* Loading Overlay */}
        {isLoading && activeUrl && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/85 text-zinc-300 space-y-2 pointer-events-none">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
            <p className="text-xs font-medium tracking-wide">Menghubungkan pemutar video...</p>
          </div>
        )}

        {/* Floating Hold 2x Badge */}
        {isHoldingSpeed && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-1.5 rounded-lg bg-zinc-950 text-white border border-white/20 text-xs font-semibold pointer-events-none animate-in fade-in duration-150">
            <span>2x aktif</span>
          </div>
        )}

        {iframeSrc ? (
          <iframe
            ref={iframeRef}
            key={keyReload}
            src={iframeSrc}
            title={streamData.episodeTitle}
            referrerPolicy="no-referrer"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
            onLoad={() => {
              setIsLoading(false);
              if (currentSpeed !== 1) {
                sendPostMessage({ type: 'SET_SPEED', rate: currentSpeed });
              }
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400 p-6 text-center space-y-2">
            <ListVideo className="w-10 h-10 text-zinc-500" />
            <p className="text-sm font-semibold text-white">Stream video belum tersedia.</p>
            <p className="text-xs text-zinc-500">Silakan pilih opsi server atau tab eksternal di bawah.</p>
          </div>
        )}

        {/* Video Overlaid Action Bar */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity z-20">
          {activeUrl && (
            <a
              href={activeUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Buka Langsung di Tab Baru"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-black/75 hover:bg-black text-zinc-200 hover:text-white border border-white/10 text-xs font-medium transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tab Baru</span>
            </a>
          )}
          <button
            onClick={handleReload}
            title="Segarkan Video"
            className="p-2 rounded-xl bg-black/75 hover:bg-black text-zinc-200 hover:text-white border border-white/10 transition-colors text-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsTheatreMode(!isTheatreMode)}
            title="Mode Teater"
            className={`p-2 rounded-xl border border-white/10 transition-colors text-xs cursor-pointer ${
              isTheatreMode
                ? 'bg-white text-zinc-950 font-bold'
                : 'bg-black/75 hover:bg-black text-zinc-200 hover:text-white'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Speed Controls: Minimalist Matte Bar */}
      <PlayerSpeedControls
        currentSpeed={currentSpeed}
        onSelectSpeed={handleSelectSpeed}
        isHoldingSpeed={isHoldingSpeed}
      />

      {/* Fallback & External Player Banner */}
      <PlayerProxyBanner
        useProxy={useProxy}
        onToggleProxy={handleToggleProxy}
        activeUrl={activeUrl}
      />

      {/* Navigation & Episode Selector Controls Bar */}
      <PlayerEpisodeNavigation
        prevEpisodeSlug={streamData.prevEpisodeSlug}
        nextEpisodeSlug={streamData.nextEpisodeSlug}
        episodes={episodes}
        currentEpisodeSlug={currentEpisodeSlug}
      />

      {/* Server & Mirror Options */}
      <PlayerServerSelector
        serverList={serverList}
        selectedServer={selectedServer}
        onSelectServer={handleSelectServer}
      />
    </div>
  );
};
