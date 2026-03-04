import { create } from 'zustand';
import logger from '../utils/logger';
import { applyWarmthToDom, getWarmthFromStorage } from './warmthStore';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

// Default to light theme - prioritize light mode
// IMPORTANT: Website starts with light mode by default
const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';
  try {
    // Check for saved preference, default to light
    const saved = localStorage.getItem('rg_theme');
    return (saved as Theme) || 'dark'; // Default to light mode
  } catch {
    // localStorage may be blocked in iframes or private browsing
    return 'dark';
  }
};

export const useThemeStore = create<ThemeState>((set) => {
  // Start with light mode as default
  const initialTheme = getInitialTheme();
  
  // Initialize on store creation - Set light mode as default
  if (typeof window !== 'undefined') {
    // Set theme on HTML and body
    document.documentElement.setAttribute('data-theme', initialTheme);
    document.body.setAttribute('data-theme', initialTheme);
    
    // Only set attributes - let global.css handle all styling
    document.documentElement.style.colorScheme = initialTheme;
    
    logger.info('✅ Theme initialized', { theme: initialTheme });
  }

  return {
    theme: initialTheme,

    setTheme: (t) => {
      if (typeof window !== 'undefined') {
        // Save theme preference
        try {
          localStorage.setItem('rg_theme', t);
        } catch { /* ignore in iframes */ }
        
        // Set theme attributes - let global.css handle all styling
        document.documentElement.setAttribute('data-theme', t);
        document.documentElement.setAttribute('theme', t);
        document.body.setAttribute('data-theme', t);
        document.documentElement.style.colorScheme = t;

        applyWarmthToDom(getWarmthFromStorage());
      }
      set({ theme: t });
    },

    toggleTheme: () =>
      set((state) => {
        const next = state.theme === 'dark' ? 'light' : 'dark';
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('rg_theme', next);
          } catch { /* ignore in iframes */ }
          
          // Set theme attributes - let global.css handle all styling
          document.documentElement.setAttribute('data-theme', next);
          document.documentElement.setAttribute('theme', next);
          document.body.setAttribute('data-theme', next);
          document.documentElement.style.colorScheme = next;

          applyWarmthToDom(getWarmthFromStorage());
          
          // Force CSS recalculation
          void document.documentElement.offsetWidth;
          logger.info('✅ Theme store updated', { theme: next, domTheme: document.documentElement.getAttribute('data-theme') });
        }
        return { theme: next };
      }),
  };
});
