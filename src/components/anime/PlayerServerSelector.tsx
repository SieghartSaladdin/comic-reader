'use client';

import React from 'react';
import { AnimeServerOption } from '@/types/anime';
import { Server, ExternalLink } from 'lucide-react';

interface PlayerServerSelectorProps {
  serverList: AnimeServerOption[];
  selectedServer: string;
  onSelectServer: (server: AnimeServerOption) => void;
}

export const PlayerServerSelector: React.FC<PlayerServerSelectorProps> = ({
  serverList,
  selectedServer,
  onSelectServer,
}) => {
  if (serverList.length === 0) return null;

  return (
    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center gap-2 text-xs">
      <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 font-medium mr-1">
        <Server className="w-3.5 h-3.5 text-zinc-400" />
        Pilih Server:
      </span>
      {serverList.map((srv, idx) => {
        const isSelected = selectedServer === srv.name || (!selectedServer && idx === 0);
        return (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectServer(srv)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              isSelected
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-semibold shadow-xs'
                : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700'
            }`}
          >
            <span>{srv.name}</span>
            {srv.url && srv.url.startsWith('http') && <ExternalLink className="w-2.5 h-2.5 opacity-60" />}
          </button>
        );
      })}
    </div>
  );
};
