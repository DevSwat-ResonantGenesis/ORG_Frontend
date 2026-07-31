import { create } from 'zustand';
import logger from '../utils/logger';
import { applyWarmthToDom, getWarmthFromStorage } from './warmthStore';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

// Default theme: dark mode
const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    try {
      // Check for saved theme preference
      const saved = localStorage.getItem('rg_theme');
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch { /* ignore in iframes */ }
  }
  return 'dark';
};

export const useThemeStore = create<ThemeState>((set) => {
  // Start with dark mode as default
  const initialTheme = getInitialTheme();
  
  // Initialize on store creation - Set dark mode as default
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

        // Update mobile safe area color
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) metaTheme.setAttribute('content', t === 'dark' ? '#0a0a0c' : '#ffffff');
        // Also update any media-specific ones
        document.querySelectorAll('meta[name="theme-color"]').forEach(m => m.setAttribute('content', t === 'dark' ? '#0a0a0c' : '#ffffff'));

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

          // Update mobile safe area color
          document.querySelectorAll('meta[name="theme-color"]').forEach(m => m.setAttribute('content', next === 'dark' ? '#0a0a0c' : '#ffffff'));

          applyWarmthToDom(getWarmthFromStorage());
          
          // Force CSS recalculation
          void document.documentElement.offsetWidth;
          logger.info('✅ Theme store updated', { theme: next, domTheme: document.documentElement.getAttribute('data-theme') });
        }
        return { theme: next };
      }),
  };
});
