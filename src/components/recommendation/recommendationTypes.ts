export type RailTag = 'NEW' | 'UP' | 'HOT';

export interface RailEntry {
  label: string;
  time: string;
  href: string;
}

export interface RailItem {
  id: string;
  href: string;
  title: string;
  cover: string;
  /** Waktu update ringkas, mis. "5h" atau "3d". */
  timeAgo: string;
  /** Kode negara ISO untuk bendera (kr, jp, cn). */
  country?: string;
  tag?: RailTag;
  rating?: number;
  /** Jenis konten, mis. "Manhwa" atau "TV". */
  kind: string;
  status?: string;
  genres?: string[];
  studio?: string;
  /** Chip kecil di bawah cover, mis. "CH.6" atau "EPS.3". */
  latestLabel?: string;
  /** Dua entri terbaru (chapter atau episode) lengkap dengan waktu rilis. */
  entries: RailEntry[];
  /** Ikon aksi pada hover: baca atau tonton. */
  action: 'read' | 'watch';
}

export interface RailTab {
  key: string;
  label: string;
  items: RailItem[];
}
