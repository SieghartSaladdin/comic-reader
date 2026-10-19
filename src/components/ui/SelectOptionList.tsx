'use client';

import React from 'react';
import { Check, Search, X } from 'lucide-react';
import { SelectOption } from './CustomSelect';

interface SelectOptionListProps {
  options: SelectOption[];
  selectedValues: string[];
  onSelect: (value: string) => void;
  multiple?: boolean;
  searchable?: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const SelectOptionList: React.FC<SelectOptionListProps> = ({
  options,
  selectedValues,
  onSelect,
  multiple = false,
  searchable = false,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="space-y-1">
      {(searchable || options.length > 7) && (
        <div className="relative px-2 py-1.5 border-b border-zinc-100 dark:border-zinc-800/80 mb-1">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari opsi..."
            className="w-full bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 pl-7 pr-7 py-1 text-xs rounded-lg border border-transparent focus:border-zinc-400 dark:focus:border-zinc-600 outline-none transition-all placeholder:text-zinc-400"
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      <div className="max-h-60 overflow-y-auto space-y-0.5 scrollbar-thin">
        {options.length === 0 ? (
          <div className="px-3 py-4 text-center text-xs text-zinc-400">
            Tidak ada opsi ditemukan
          </div>
        ) : (
          options.map((opt) => {
            const selected = selectedValues.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onSelect(opt.value)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer select-none text-left ${
                  selected
                    ? 'bg-zinc-100 dark:bg-zinc-800/70 text-zinc-950 dark:text-white font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  {multiple ? (
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                        selected
                          ? 'bg-zinc-950 dark:bg-white border-zinc-950 dark:border-white text-white dark:text-zinc-950'
                          : 'border-zinc-300 dark:border-zinc-700 bg-transparent'
                      }`}
                    >
                      {selected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  ) : (
                    selected && (
                      <Check className="w-3.5 h-3.5 shrink-0 text-zinc-900 dark:text-white" />
                    )
                  )}
                  <span className="truncate">{opt.label}</span>
                </div>

                {opt.badge && (
                  <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50">
                    {opt.badge}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
