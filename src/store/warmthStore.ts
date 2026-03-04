import { create } from 'zustand';

type ThemeMode = 'light' | 'dark';

interface WarmthState {
  warmth: number;
  setWarmth: (value: number) => void;
  resetWarmth: () => void;
  applyWarmthNow: () => void;
}

const STORAGE_KEY = 'rg_warmth';
const DEFAULT_WARMTH = 50;

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const parseColor = (input: string): { r: number; g: number; b: number } | null => {
  const raw = input.trim();
  if (!raw) return null;

  if (raw.startsWith('#')) {
    const hex = raw.slice(1);
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return { r, g, b };
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return { r, g, b };
    }
    return null;
  }

  const rgbMatch = raw.match(/rgba?\(([^)]+)\)/i);
  if (rgbMatch) {
    const parts = rgbMatch[1].split(',').map(p => p.trim());
    const r = Number(parts[0]);
    const g = Number(parts[1]);
    const b = Number(parts[2]);
    if ([r, g, b].every(v => Number.isFinite(v))) return { r, g, b };
  }

  return null;
};

const toRgbString = (c: { r: number; g: number; b: number }) => `rgb(${c.r} ${c.g} ${c.b})`;

const mix = (a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }, t: number) => {
  const tt = clamp(t, 0, 1);
  return {
    r: Math.round(a.r + (b.r - a.r) * tt),
    g: Math.round(a.g + (b.g - a.g) * tt),
    b: Math.round(a.b + (b.b - a.b) * tt),
  };
};

export const getWarmthFromStorage = (): number => {
  if (typeof window === 'undefined') return DEFAULT_WARMTH;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? Number(saved) : NaN;
    return Number.isFinite(parsed) ? clamp(parsed, 0, 100) : DEFAULT_WARMTH;
  } catch {
    return DEFAULT_WARMTH;
  }
};

export const applyWarmthToDom = (warmth: number) => {
  if (typeof window === 'undefined') return;

  const value = clamp(warmth, 0, 100);
  const theme = (document.documentElement.getAttribute('data-theme') as ThemeMode) || 'dark';

  const varsToTint = [
    '--bg-primary',
    '--bg-secondary',
    '--bg-tertiary',
    '--bg',
    '--color-bg-root',
    '--surface',
    '--surface-elevated',
    '--surface-hover',
    '--border',
    '--border-subtle',
  ];

  for (const v of varsToTint) document.documentElement.style.removeProperty(v);

  // Requested mapping:
  // Light mode: 0 => warm pearl (#F6EEE1 feel), 100 => gray
  // Dark mode: 0 => deeper black, 100 => lighter warm gray
  const t = value / 100;

  const clampRgb = (c: { r: number; g: number; b: number }) => ({
    r: clamp(c.r, 0, 255),
    g: clamp(c.g, 0, 255),
    b: clamp(c.b, 0, 255),
  });

  const offset = (c: { r: number; g: number; b: number }, amount: number) =>
    clampRgb({ r: c.r + amount, g: c.g + amount, b: c.b + amount });

  const setVar = (name: string, c: { r: number; g: number; b: number }) => {
    document.documentElement.style.setProperty(name, toRgbString(c));
  };

  if (theme === 'light') {
    const pearl = { r: 246, g: 238, b: 225 }; // #F6EEE1
    const grayPrimary = { r: 228, g: 228, b: 228 };
    const graySecondary = { r: 220, g: 220, b: 220 };
    const grayTertiary = { r: 212, g: 212, b: 212 };

    const bgPrimary = mix(pearl, grayPrimary, t);
    const bgSecondary = mix(offset(pearl, 6), graySecondary, t);
    const bgTertiary = mix(offset(pearl, 12), grayTertiary, t);

    setVar('--bg-primary', bgPrimary);
    setVar('--bg-secondary', bgSecondary);
    setVar('--bg-tertiary', bgTertiary);

    setVar('--bg', bgPrimary);
    setVar('--color-bg-root', bgPrimary);

    setVar('--surface', bgPrimary);
    setVar('--surface-elevated', mix(offset(pearl, 2), offset(grayPrimary, 6), t));
    setVar('--surface-hover', mix(offset(pearl, 10), offset(graySecondary, 6), t));

    setVar('--border', mix({ r: 229, g: 222, b: 210 }, { r: 196, g: 196, b: 196 }, t));
    setVar('--border-subtle', mix({ r: 240, g: 232, b: 221 }, { r: 210, g: 210, b: 210 }, t));
  } else {
    const deep = { r: 8, g: 8, b: 9 };
    const warmGray = { r: 46, g: 40, b: 34 };

    const bgPrimary = mix(deep, warmGray, t);
    const bgSecondary = mix(offset(deep, 0), offset(warmGray, 2), t);
    const bgTertiary = mix(offset(deep, 8), offset(warmGray, 10), t);

    setVar('--bg-primary', bgPrimary);
    setVar('--bg-secondary', bgSecondary);
    setVar('--bg-tertiary', bgTertiary);

    setVar('--bg', bgPrimary);
    setVar('--color-bg-root', bgPrimary);

    setVar('--surface', bgPrimary);
    setVar('--surface-elevated', mix(offset(deep, 10), offset(warmGray, 14), t));
    setVar('--surface-hover', mix(offset(deep, 16), offset(warmGray, 18), t));

    setVar('--border', mix({ r: 24, g: 24, b: 26 }, { r: 96, g: 88, b: 80 }, t));
    setVar('--border-subtle', mix({ r: 18, g: 18, b: 20 }, { r: 72, g: 66, b: 60 }, t));
  }

  document.documentElement.style.setProperty('--rg-warmth', String(value));
};

export const useWarmthStore = create<WarmthState>((set, get) => {
  const initialWarmth = getWarmthFromStorage();

  if (typeof window !== 'undefined') {
    applyWarmthToDom(initialWarmth);
  }

  return {
    warmth: initialWarmth,

    setWarmth: (v) => {
      const next = clamp(v, 0, 100);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, String(next));
        } catch {
          // ignore
        }
        applyWarmthToDom(next);
      }
      set({ warmth: next });
    },

    resetWarmth: () => {
      const next = DEFAULT_WARMTH;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, String(next));
        } catch {
          // ignore
        }
        applyWarmthToDom(next);
      }
      set({ warmth: next });
    },

    applyWarmthNow: () => {
      applyWarmthToDom(get().warmth);
    },
  };
});
