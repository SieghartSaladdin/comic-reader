'use client';

import { useEffect } from 'react';

const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End']);
const TOUCH_THRESHOLD_PX = 12;

/** Elemen reader (bar, sheet) menandai dirinya dengan atribut ini agar scroll di dalamnya diabaikan. */
export const READER_BAR_ATTR = 'data-reader-bar';

function isInsideReaderBar(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(`[${READER_BAR_ATTR}]`) !== null;
}

function isFormField(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

/**
 * Memanggil `onHide` saat PENGGUNA menggulir halaman (roda mouse, geser jari, atau tombol scroll).
 * Sengaja tidak memakai event `scroll` agar scroll otomatis (slider, lompat chapter) dan
 * pergeseran layout akibat gambar yang baru dimuat tidak ikut menyembunyikan bar.
 */
export function useHideOnUserScroll(isActive: boolean, onHide: () => void) {
  useEffect(() => {
    if (!isActive) return;

    let touchStartY: number | null = null;

    const handleWheel = (e: WheelEvent) => {
      if (!isInsideReaderBar(e.target) && e.deltaY !== 0) onHide();
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = isInsideReaderBar(e.target) ? null : (e.touches[0]?.clientY ?? null);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0]?.clientY;
      if (touchStartY === null || currentY === undefined) return;
      if (Math.abs(currentY - touchStartY) > TOUCH_THRESHOLD_PX) {
        touchStartY = null;
        onHide();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (SCROLL_KEYS.has(e.key) && !isFormField(e.target) && !isInsideReaderBar(e.target)) onHide();
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, onHide]);
}
