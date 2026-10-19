'use client';

import React, { useEffect } from 'react';
import { X, SunMedium, Monitor, BookOpen, ScrollText, Check } from 'lucide-react';
import {
  ReaderSettings,
  ReaderReadingMode,
  ReaderBackgroundColor,
  ReaderZoomMode,
} from '@/types/comic';

interface ReaderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReaderSettings;
  onUpdateSettings: (updated: Partial<ReaderSettings>) => void;
  gap?: boolean;
  onToggleGap?: () => void;
}

export const ReaderSettingsModal: React.FC<ReaderSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  gap,
  onToggleGap,
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const readingModes: { id: ReaderReadingMode; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'webtoon',
      label: 'Webtoon',
      icon: <ScrollText className="w-4 h-4" />,
      desc: 'Scroll vertikal terus-menerus',
    },
    {
      id: 'manga-rtl',
      label: 'Manga RTL',
      icon: <BookOpen className="w-4 h-4" />,
      desc: 'Kanan ke kiri (Standar Jepang)',
    },
    {
      id: 'manga-ltr',
      label: 'Manga LTR',
      icon: <BookOpen className="w-4 h-4 transform -scale-x-100" />,
      desc: 'Kiri ke kanan (Komik Barat)',
    },
  ];

  const zoomModes: { id: ReaderZoomMode; label: string }[] = [
    { id: 'fit-width', label: 'Fit Width' },
    { id: 'fit-height', label: 'Fit Height' },
    { id: 'original', label: 'Original' },
  ];

  const bgColors: { id: ReaderBackgroundColor; label: string; hex: string; border: string }[] = [
    { id: 'dark', label: 'Dark (#121212)', hex: '#121212', border: 'border-zinc-700' },
    { id: 'black', label: 'Amoled (#000000)', hex: '#000000', border: 'border-zinc-800' },
    { id: 'light', label: 'Light (#F5F5F5)', hex: '#f5f5f5', border: 'border-zinc-300' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-100 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-zinc-400" />
            <h2 className="text-sm font-semibold tracking-wide">Pengaturan Pembaca</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition cursor-pointer"
            aria-label="Tutup Pengaturan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Reading Mode */}
        <div className="space-y-2.5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Mode Membaca
          </label>
          <div className="grid grid-cols-1 gap-2">
            {readingModes.map((mode) => {
              const active = settings.readingMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => onUpdateSettings({ readingMode: mode.id })}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition cursor-pointer ${
                    active
                      ? 'bg-zinc-800 border-white text-white font-medium'
                      : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={active ? 'text-white' : 'text-zinc-400'}>
                      {mode.icon}
                    </span>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold leading-none mb-1">{mode.label}</p>
                      <p className="text-[11px] text-zinc-400">{mode.desc}</p>
                    </div>
                  </div>
                  {active && <Check className="w-4 h-4 text-white" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Zoom Scaling */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Ukuran Gambar
          </label>
          <div className="grid grid-cols-3 gap-2">
            {zoomModes.map((zoom) => {
              const active = settings.zoom === zoom.id;
              return (
                <button
                  key={zoom.id}
                  onClick={() => onUpdateSettings({ zoom: zoom.id })}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition cursor-pointer ${
                    active
                      ? 'bg-white border-white text-zinc-950 font-bold'
                      : 'bg-zinc-800/80 border-zinc-700/80 hover:bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {zoom.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Background Color */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Warna Latar
          </label>
          <div className="grid grid-cols-3 gap-2">
            {bgColors.map((color) => {
              const active = settings.background === color.id;
              return (
                <button
                  key={color.id}
                  onClick={() => onUpdateSettings({ background: color.id })}
                  className={`flex items-center justify-center gap-2 py-2 px-2.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                    active
                      ? 'border-white bg-zinc-800 text-white font-semibold'
                      : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full border ${color.border}`}
                    style={{ backgroundColor: color.hex }}
                  />
                  <span>{color.id.toUpperCase()}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Brightness Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
            <span className="uppercase tracking-wider">Kecerahan Layar</span>
            <span className="text-zinc-200 font-mono">{settings.brightness}%</span>
          </div>
          <div className="flex items-center gap-3">
            <SunMedium className="w-4 h-4 text-zinc-400" />
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={settings.brightness}
              onChange={(e) => onUpdateSettings({ brightness: Number(e.target.value) })}
              className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white"
            />
            <SunMedium className="w-5 h-5 text-zinc-200" />
          </div>
        </div>

        {/* 5. Webtoon Gap Toggle (Only visible in webtoon mode) */}
        {settings.readingMode === 'webtoon' && onToggleGap && (
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
            <div className="text-xs">
              <p className="font-medium text-zinc-200">Jeda Antar Gambar (Gap)</p>
              <p className="text-zinc-500 text-[11px]">Beri jarak tipis antar halaman komik</p>
            </div>
            <button
              onClick={onToggleGap}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                gap ? 'bg-white' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`absolute top-1 left-1 bg-zinc-950 w-4 h-4 rounded-full transition-transform ${
                  gap ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
