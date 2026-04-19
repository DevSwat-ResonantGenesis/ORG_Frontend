// ============== SERVICES INITIALIZATION ==============
// Initialize all services on app startup

import { initializePerformanceOptimizations } from '../utils/performanceOptimizer';
import { themeService } from './theme';
import { settingsService } from './settings';
import { keyboardService } from './keyboard';
import { notificationsService } from './notifications';

// Track initialization state
let initialized = false;

/**
 * Initialize all IDE services
 * Should be called once at app startup
 */
export async function initializeServices(): Promise<void> {
  if (initialized) {
    console.warn('Services already initialized');
    return;
  }

  console.log('🚀 Initializing IDE services...');

  try {
    // Initialize performance optimizations first
    initializePerformanceOptimizations();

    // Theme is auto-initialized on import, just ensure it's applied
    const theme = themeService.getActiveTheme();
    console.log(`📎 Theme: ${theme.name} (${theme.type})`);

    // Settings are auto-loaded from localStorage
    const settings = settingsService.getAll();
    console.log(`⚙️ Settings loaded`);

    // Register global keyboard shortcuts
    registerGlobalShortcuts();
    console.log(`⌨️ Keyboard shortcuts registered`);

    // Show welcome notification (optional)
    if (settings.workbench.startupEditor === 'welcomePage') {
      notificationsService.info('Welcome to DevSwat IDE', {
        message: 'Press Ctrl+Shift+P (Cmd+Shift+P on Mac) to open command palette',
        duration: 5000,
      });
    }

    initialized = true;
    console.log('✅ IDE services initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    throw error;
  }
}

/**
 * Register global keyboard shortcuts
 */
function registerGlobalShortcuts(): void {
  // Command palette
  keyboardService.registerCommand('view.commandPalette', () => {
    document.dispatchEvent(new CustomEvent('ide:commandPalette'));
  });

  // Quick open
  keyboardService.registerCommand('view.quickOpen', () => {
    document.dispatchEvent(new CustomEvent('ide:quickOpen'));
  });

  // Toggle sidebar
  keyboardService.registerCommand('view.sidebar', () => {
    document.dispatchEvent(new CustomEvent('ide:toggleSidebar'));
  });

  // Toggle terminal
  keyboardService.registerCommand('view.terminal', () => {
    document.dispatchEvent(new CustomEvent('ide:toggleTerminal'));
  });

  // Save file
  keyboardService.registerCommand('file.save', () => {
    document.dispatchEvent(new CustomEvent('ide:saveFile'));
  });

  // Save all
  keyboardService.registerCommand('file.saveAll', () => {
    document.dispatchEvent(new CustomEvent('ide:saveAll'));
  });

  // Find
  keyboardService.registerCommand('edit.find', () => {
    document.dispatchEvent(new CustomEvent('ide:find'));
  });

  // Find in files
  keyboardService.registerCommand('edit.findInFiles', () => {
    document.dispatchEvent(new CustomEvent('ide:findInFiles'));
  });

  // AI Chat
  keyboardService.registerCommand('ai.chat', () => {
    document.dispatchEvent(new CustomEvent('ide:aiChat'));
  });

  // Debug start
  keyboardService.registerCommand('debug.start', () => {
    document.dispatchEvent(new CustomEvent('ide:debugStart'));
  });

  // Format document
  keyboardService.registerCommand('editor.format', () => {
    document.dispatchEvent(new CustomEvent('ide:formatDocument'));
  });
}

/**
 * Check if services are initialized
 */
export function isInitialized(): boolean {
  return initialized;
}

/**
 * Reset services (for testing or logout)
 */
export function resetServices(): void {
  initialized = false;
  console.log('🔄 Services reset');
}

export default initializeServices;
