import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { hydrateRoot } from 'react-dom/client';
import App from './App';
import { HelmetProvider } from 'react-helmet-async';
// Initialize Sentry before app renders
import { initSentry } from './utils/sentry';
// Modular CSS architecture - Import index which loads all modules in order
import './theme/modules/index.css';
import { applyWarmthToDom, getWarmthFromStorage } from './store/warmthStore';
// Scroll debugging utility (development only)
if (import.meta.env.DEV) {
  import('./utils/scrollDebug');
}

// API connection test DISABLED - only runs when explicitly called
// Test pages work offline and don't need backend connections

// Initialize Sentry error tracking
initSentry();

// Respect the theme from HTML (data-theme="light" in index.html)
// This runs BEFORE React renders to prevent flash of wrong mode
if (typeof window !== 'undefined') {
  // Get theme from localStorage or use HTML's default (light)
  const savedTheme = localStorage.getItem('rg_theme');
  const defaultTheme = savedTheme || 'light'; // Default to light to match HTML

  // Set only data-theme attribute - let CSS handle color-scheme and other styling
  document.documentElement.setAttribute('data-theme', defaultTheme);
  document.body.setAttribute('data-theme', defaultTheme);

  // Set initial header height CSS variable (will be updated by Header component)
  // Default to 60px, but Header will update with actual height
  document.documentElement.style.setProperty('--header-height', '60px');

  applyWarmthToDom(getWarmthFromStorage());
}



const rootElement = document.getElementById('root') as HTMLElement;
const app = (
  <React.Fragment>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.Fragment>
);

if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app);
} else {
  ReactDOM.createRoot(rootElement).render(app);
}
// CI trigger 1771811136
