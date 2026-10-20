'use client';

import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { RailTab } from './recommendationTypes';
import { RecommendationCard } from './RecommendationCard';

interface RecommendationRailProps {
  title?: string;
  description?: string;
  tabs: RailTab[];
}

export const RecommendationRail: React.FC<RecommendationRailProps> = ({
  title = 'Rekomendasi',
  description,
  tabs,
}) => {
  const [activeKey, setActiveKey] = useState(tabs[0]?.key ?? '');
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (tabs.length === 0) return null;

  const activeTab = tabs.find((tab) => tab.key === activeKey) ?? tabs[0];

  const selectTab = (key: string) => {
    setActiveKey(key);
    scrollerRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  };

  const scrollBy = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <section className="space-y-4" aria-label={title}>
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-violet-600/10 p-1.5 text-violet-600 dark:text-violet-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white md:text-2xl">
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
            )}
          </div>
        </div>

        <div className="hidden gap-1.5 sm:flex">
          {(['prev', 'next'] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => scrollBy(dir === 'next' ? 1 : -1)}
              aria-label={dir === 'next' ? 'Geser ke kanan' : 'Geser ke kiri'}
              className="rounded-lg border border-zinc-200 bg-white p-1.5 text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
            >
              {dir === 'next' ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist">
        {tabs.map((tab) => {
          const active = tab.key === activeTab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => selectTab(tab.key)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                active
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-zinc-200/70 text-zinc-700 hover:bg-zinc-300/70 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-xs font-medium ${active ? 'text-white/70' : 'text-zinc-500'}`}>
                {tab.items.length}
              </span>
            </button>
          );
        })}
      </div>

      <div
        ref={scrollerRef}
        className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0"
      >
        {activeTab.items.map((item) => (
          <RecommendationCard key={`${activeTab.key}-${item.id}`} item={item} />
        ))}
      </div>
    </section>
  );
};
