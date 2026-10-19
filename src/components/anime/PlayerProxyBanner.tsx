import React from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';

interface PlayerProxyBannerProps {
  useProxy: boolean;
  onToggleProxy: () => void;
  activeUrl: string;
}

export const PlayerProxyBanner: React.FC<PlayerProxyBannerProps> = ({
  useProxy,
  onToggleProxy,
  activeUrl,
}) => {
  if (!activeUrl) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 text-xs">
      <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
        <ShieldCheck className="w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0" />
        <span>Mode Stream Proxy Aktif (Bypass X-Frame-Options &amp; 2x Hold Support)</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleProxy}
          className="text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white underline underline-offset-2 cursor-pointer"
        >
          {useProxy ? 'Direct Iframe' : 'Gunakan Proxy'}
        </button>
        <a
          href={activeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 font-medium shadow-xs transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Buka Player Eksternal</span>
        </a>
      </div>
    </div>
  );
};
