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

  const computed = getComputedStyle(document.documentElement);

  // Slider is centered: 50 = neutral.
  // Light mode: 0 => dim/cooler white, 100 => warm pearl.
  // Dark mode: 0 => deeper black, 100 => lighter warm gray.
  const warmPearl = { r: 246, g: 238, b: 225 }; // #F6EEE1
  const dimCoolWhite = { r: 242, g: 243, b: 245 };
  const darkDeep = { r: 8, g: 8, b: 9 };
  const darkLightWarmGray = { r: 46, g: 40, b: 34 };

  const delta = (value - 50) / 50; // -1..1

  const target = (() => {
    if (theme === 'dark') return delta >= 0 ? darkLightWarmGray : darkDeep;
    return delta >= 0 ? warmPearl : dimCoolWhite;
  })();

  const strength = (() => {
    const amt = Math.abs(delta);
    if (theme === 'dark') return delta >= 0 ? amt * 0.80 : amt * 0.55;
    return delta >= 0 ? amt * 0.75 : amt * 0.60;
  })();

  const borderStrength = strength * (theme === 'dark' ? 0.65 : 0.55);

  const applyVar = (name: string, t: number) => {
    const base = parseColor(computed.getPropertyValue(name));
    if (!base) return;
    document.documentElement.style.setProperty(name, toRgbString(mix(base, target, t)));
  };

  applyVar('--bg-primary', strength);
  applyVar('--bg-secondary', strength);
  applyVar('--bg-tertiary', strength);
  applyVar('--bg', strength);
  applyVar('--color-bg-root', strength);

  applyVar('--surface', strength);
  applyVar('--surface-elevated', strength);
  applyVar('--surface-hover', strength);

  applyVar('--border', borderStrength);
  applyVar('--border-subtle', borderStrength);

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
