'use client';

import React from 'react';
import { Gauge } from 'lucide-react';

interface PlayerSpeedControlsProps {
  currentSpeed: number;
  onSelectSpeed: (speed: number) => void;
  isHoldingSpeed?: boolean;
}

const SPEED_OPTIONS = [1, 1.25, 1.5, 2];

export const PlayerSpeedControls: React.FC<PlayerSpeedControlsProps> = ({
  currentSpeed,
  onSelectSpeed,
  isHoldingSpeed = false,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 text-xs">
      {/* Speed Button Selector */}
      <div className="flex items-center gap-2">
        <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 font-medium">
          <Gauge className="w-3.5 h-3.5 text-zinc-400" />
          <span>Kecepatan:</span>
        </span>
        <div className="inline-flex items-center p-0.5 rounded-lg bg-zinc-200/70 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60">
          {SPEED_OPTIONS.map((rate) => {
            const isActive = currentSpeed === rate && !isHoldingSpeed;
            return (
              <button
                key={rate}
                type="button"
                onClick={() => onSelectSpeed(rate)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                }`}
                title={`Ubah kecepatan video ke ${rate}x`}
              >
                {rate}x
              </button>
            );
          })}
        </div>

        {isHoldingSpeed && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white text-zinc-950 dark:bg-white dark:text-zinc-950 font-bold text-[10px]">
            2x aktif
          </span>
        )}
      </div>

      {/* Hint Tooltip / Info */}
      <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">
        Tahan klik mouse pada video untuk memutar 2x lebih cepat.
      </p>
    </div>
  );
};
