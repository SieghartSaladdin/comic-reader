'use client';

import React from 'react';
import { X } from 'lucide-react';

export interface CustomChipProps {
  label: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const CustomChip: React.FC<CustomChipProps> = ({
  label,
  active = false,
  onClick,
  onRemove,
  icon,
  badge,
  disabled = false,
  className = '',
  size = 'md',
}) => {
  const isClickable = Boolean(onClick) && !disabled;

  const sizeClasses =
    size === 'sm'
      ? 'px-2.5 py-1 text-[11px] gap-1.5 rounded-lg'
      : 'px-3 py-1.5 text-xs gap-2 rounded-xl';

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className={`inline-flex items-center font-medium transition-all select-none whitespace-nowrap border ${
        isClickable ? 'cursor-pointer' : ''
      } ${sizeClasses} ${
        active
          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-xs font-semibold'
          : 'bg-zinc-100 dark:bg-zinc-900/90 text-zinc-600 dark:text-zinc-400 border-zinc-200/80 dark:border-zinc-800 hover:text-zinc-950 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700'
      } ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
    >
      {icon && (
        <span
          className={`shrink-0 ${
            active
              ? 'text-white dark:text-zinc-950'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          {icon}
        </span>
      )}

      <span>{label}</span>

      {badge && (
        <span
          className={`text-[10px] px-1.5 py-0.2 rounded-md ${
            active
              ? 'bg-white/20 dark:bg-black/15 text-white dark:text-zinc-950'
              : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
          }`}
        >
          {badge}
        </span>
      )}

      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={`shrink-0 p-0.5 rounded-full hover:bg-black/20 dark:hover:bg-zinc-200/40 transition-colors ml-0.5 cursor-pointer ${
            active
              ? 'text-white/80 hover:text-white dark:text-zinc-950/80 dark:hover:text-zinc-950'
              : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
          }`}
          aria-label="Hapus filter"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
