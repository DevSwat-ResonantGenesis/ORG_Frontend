import colors from './colors';
import typography from './typography';
import spacing from './spacing';
import shadows from './shadows';

const theme = { colors, typography, spacing, shadows };

export type Theme = typeof theme;

export const setTheme = (next: 'light' | 'dark') => {
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('rg_theme', next);
};

export const initTheme = () => {
  const saved = localStorage.getItem('rg_theme');
  if (saved === 'light' || saved === 'dark') {
    document.documentElement.setAttribute('data-theme', saved);
    return;
  }
  // Default to light mode (main theme)
  document.documentElement.setAttribute('data-theme', 'dark');
};

export default theme;
