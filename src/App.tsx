import React, { Suspense, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import { useThemeStore } from './store/themeStore';
import { OrgProvider } from './context/OrgContext';
import { ToastProvider } from './context/ToastContext';
import { ToolbarProvider } from './context/ToolbarContext';
import { ResonantChatMenuProvider } from './context/ResonantChatMenuContext';
import { ChatProvider } from './context/ChatContext';
import { PricingProvider } from './context/PricingContext';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { AuthProvider } from './security/auth/AuthProvider';

// Import button diagnostics in development
// Temporarily disabled to reduce console spam and potential re-renders
// if (import.meta.env.DEV) {
//   import('./utils/buttonDiagnostics');
// }

const App = () => {
  // Remove theme subscription - theme store handles initialization
  // const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    // Theme is already initialized by themeStore on creation
    // Just ensure DOM attributes are set (redundant but safe)
    const savedTheme = localStorage.getItem('rg_theme');
    const defaultTheme = savedTheme || 'dark';
    
    // Only update if different to avoid unnecessary re-renders
    const currentTheme = useThemeStore.getState().theme;
    if (currentTheme !== defaultTheme) {
      useThemeStore.getState().setTheme(defaultTheme as 'light' | 'dark');
    } else {
      // Just ensure DOM attributes are set without triggering store update
      document.documentElement.setAttribute('data-theme', defaultTheme);
      document.body.setAttribute('data-theme', defaultTheme);
    }
    
    // Prevent zoom on double tap (iOS) - but allow scrolling
    let lastTouchEnd = 0;
    const preventZoom = (e: TouchEvent) => {
      const now = Date.now();
      // Only prevent if it's a double tap (within 300ms) and not a scroll gesture
      if (now - lastTouchEnd <= 300 && e.touches.length === 0) {
        // Check if this is likely a scroll gesture (multiple touches or movement)
        const target = e.target as HTMLElement;
        const isScrollable = target && (
          target.scrollHeight > target.clientHeight ||
          target.closest('[style*="overflow"], [class*="scroll"], [class*="overflow"]')
        );
        if (!isScrollable) {
          e.preventDefault();
        }
      }
      lastTouchEnd = now;
    };
    
    document.addEventListener('touchend', preventZoom, { passive: false });
    
    return () => {
      document.removeEventListener('touchend', preventZoom);
    };
  }, []); // Run once on mount, not when theme changes

  return (
    <ErrorBoundary>
      <AuthProvider>
        <PricingProvider>
          <OrgProvider>
            <ToastProvider>
              <ToolbarProvider>
                <ResonantChatMenuProvider>
                  <ChatProvider>
                    <Suspense fallback={
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '100vh',
                      fontSize: '16px',
                      color: 'var(--text-secondary)'
                    }}>
                      <div className="loading-spinner" style={{ marginRight: '12px' }}></div>
                      Loading…
                    </div>
                  }>
                      <RouterProvider router={router} />
                    </Suspense>
                  </ChatProvider>
                </ResonantChatMenuProvider>
              </ToolbarProvider>
            </ToastProvider>
          </OrgProvider>
        </PricingProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
