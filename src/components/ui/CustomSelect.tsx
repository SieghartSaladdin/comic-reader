'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { SelectOptionList } from './SelectOptionList';

export interface SelectOption {
  value: string;
  label: string;
  badge?: string;
}

export interface CustomSelectProps {
  options: SelectOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
  maxDisplayLabels?: number;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  multiple = false,
  placeholder = 'Pilih...',
  searchable = false,
  disabled = false,
  icon,
  className = '',
  maxDisplayLabels = 2,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) setSearchQuery('');
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase().trim();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        opt.value.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  const selectedValues = useMemo(() => {
    if (Array.isArray(value)) return value;
    return value ? [value] : [];
  }, [value]);

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const isSelected = selectedValues.includes(optionValue);
      const nextValues = isSelected
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange(nextValues);
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const renderTriggerContent = () => {
    if (selectedValues.length === 0) {
      return (
        <span className="text-zinc-400 dark:text-zinc-500 text-xs truncate">
          {placeholder}
        </span>
      );
    }

    if (multiple) {
      const selectedLabels = selectedValues
        .map((val) => options.find((o) => o.value === val)?.label || val)
        .filter(Boolean);

      const displayed = selectedLabels.slice(0, maxDisplayLabels);
      const remainingCount = selectedLabels.length - displayed.length;

      return (
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {displayed.join(', ')}
          </span>
          {remainingCount > 0 && (
            <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              +{remainingCount}
            </span>
          )}
        </div>
      );
    }

    const currentLabel =
      options.find((o) => o.value === selectedValues[0])?.label ||
      selectedValues[0];
    return (
      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
        {currentLabel}
      </span>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left ${className}`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-150 cursor-pointer select-none ${
          isOpen
            ? 'border-zinc-900 dark:border-zinc-100 ring-1 ring-zinc-900 dark:ring-zinc-100 bg-white dark:bg-[#121214]'
            : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {icon && (
            <span className="text-zinc-500 dark:text-zinc-400 shrink-0">
              {icon}
            </span>
          )}
          {renderTriggerContent()}
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 text-zinc-500 dark:text-zinc-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 sm:right-auto sm:min-w-[220px] max-w-xs mt-1.5 z-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-[#121214]/95 backdrop-blur-md shadow-xl p-1.5 animate-in fade-in zoom-in-95 duration-100">
          <SelectOptionList
            options={filteredOptions}
            selectedValues={selectedValues}
            onSelect={handleSelect}
            multiple={multiple}
            searchable={searchable}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>
      )}
    </div>
  );
};
