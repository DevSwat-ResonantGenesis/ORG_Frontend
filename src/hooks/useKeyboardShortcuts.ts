import { useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description?: string;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if event.key is undefined (can happen with autofill events)
      if (!event.key) {
        return;
      }
      
      shortcuts.forEach((shortcut) => {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        
        // Check modifiers - if shortcut requires it, it must be pressed; if not required, it must not be pressed
        const ctrlMatch = shortcut.ctrl === undefined ? true : (shortcut.ctrl === event.ctrlKey);
        const shiftMatch = shortcut.shift === undefined ? true : (shortcut.shift === event.shiftKey);
        const altMatch = shortcut.alt === undefined ? true : (shortcut.alt === event.altKey);
        const metaMatch = shortcut.meta === undefined ? true : (shortcut.meta === event.metaKey);

        // Check if we're in an input field (don't trigger shortcuts)
        const isInputField = 
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLSelectElement ||
          (event.target as HTMLElement)?.isContentEditable;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch && !isInputField) {
          event.preventDefault();
          shortcut.action();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// Global keyboard shortcuts for the app
export const useGlobalKeyboardShortcuts = () => {
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrl: true,
      action: () => {
        // Open command palette or search
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
      description: 'Focus search',
    },
    {
      key: '/',
      action: () => {
        // Open search
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput && document.activeElement !== searchInput) {
          searchInput.focus();
        }
      },
      description: 'Focus search',
    },
    {
      key: 'Escape',
      action: () => {
        // Close modals
        const modals = document.querySelectorAll('.modal-overlay, .mobile-menu-overlay');
        modals.forEach((modal) => {
          if ((modal as HTMLElement).style.display !== 'none') {
            (modal as HTMLElement).click();
          }
        });
      },
      description: 'Close modals',
    },
  ]);
};

