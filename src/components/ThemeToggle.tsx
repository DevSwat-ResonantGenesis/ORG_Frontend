import React, { useRef } from 'react';
import { useThemeStore } from '../store/themeStore';
import './ThemeToggle.css';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();
  const lastToggleTime = useRef<number>(0);
  const TOGGLE_DEBOUNCE_MS = 300; // Prevent double-toggle within 300ms

  // Simple, reliable click handler
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const now = Date.now();
    
    // Prevent double-toggle if clicked too quickly
    if (now - lastToggleTime.current < TOGGLE_DEBOUNCE_MS) {
      return;
    }
    
    lastToggleTime.current = now;
    
    // Call toggleTheme
    toggleTheme();
  };
  
  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const now = Date.now();
    
    // Prevent double-toggle if touched too quickly
    if (now - lastToggleTime.current < TOGGLE_DEBOUNCE_MS) {
      return;
    }
    
    lastToggleTime.current = now;
    
    // Call toggleTheme
    toggleTheme();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      className="theme-toggle-icon-only"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      data-testid="theme-toggle-button"
      style={{
        color: 'var(--text-primary)',
        opacity: 1,
        visibility: 'visible'
      }}
    >
      {theme === 'dark' ? (
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={{ color: 'inherit', stroke: 'currentColor' }}
        >
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      ) : (
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={{ color: 'inherit', stroke: 'currentColor' }}
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
