import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header/Header';
import FloatingChatWidget from '@/components/ResonantChat/FloatingChatWidget';
import { useGlobalKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { deviceIsMobile } from '@/utils/deviceCheck';
// Local LLM tunnel removed — service killed
const localLLMTunnel = { isConnected: false, connect: (_ep: string) => {} };
import { fetchUserApiKeys } from '@/api/userApiKeys';
import { isAuthenticated as checkAuthStatus } from '@/utils/auth-cookies';
import { useThemeStore } from '@/store/themeStore';
import './MainLayout.css';
import './clickability-fix.css';

type Props = {
  children: React.ReactNode;
};

const MainLayout = ({ children }: Props) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLandingScrollLockViewport, setIsLandingScrollLockViewport] = useState(false);
  const [chatWidgetOpen, setChatWidgetOpen] = useState(false);
  const location = useLocation();
  const { theme } = useThemeStore();
  const isEmbedded = new URLSearchParams(location.search).get('embed') === '1';

  // Hide header on auth pages (login/signup)
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  const isLandingPage = location.pathname === '/';
  const isResonantChatPage = location.pathname.startsWith('/resonant-chat');

  // Dynamic theme-color meta tag — matches theme + page-specific bg
  useEffect(() => {
    let color: string;
    color = theme === 'dark' ? '#0a0a0c' : '#ffffff';
    // Update all theme-color meta tags
    document.querySelectorAll('meta[name="theme-color"]').forEach(el => {
      (el as HTMLMetaElement).content = color;
    });
    // Also set body bg to match for safe-area bleed
    document.body.style.backgroundColor = color;
  }, [theme, location.pathname, isResonantChatPage, isLandingPage]);

  // Enable global keyboard shortcuts
  useGlobalKeyboardShortcuts();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      setIsLandingScrollLockViewport(deviceIsMobile() || window.matchMedia('(max-width: 768px)').matches);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Global Local LLM tunnel auto-start — keeps tunnel alive across page navigation
  useEffect(() => {
    if (localLLMTunnel.isConnected) return; // already running
    // Skip for guests (no auth cookies) to avoid unnecessary 401s
    if (!checkAuthStatus()) return;
    let cancelled = false;
    fetchUserApiKeys().then(keys => {
      if (cancelled) return;
      const llmKey = keys.find(k => k.provider === 'local-llm');
      if (llmKey) {
        const ep = llmKey.keyPrefix?.startsWith('http') ? llmKey.keyPrefix : 'http://localhost:11434';
        localLLMTunnel.connect(ep);
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const className = 'landingPageNoScroll';
    const el = document.documentElement;
    const body = document.body;

    if (!isLandingPage || !isLandingScrollLockViewport) {
      const previousScrollY = body.style.top ? Math.abs(parseInt(body.style.top, 10)) : 0;
      el.classList.remove(className);
      body.classList.remove(className);
      body.style.top = '';
      if (previousScrollY) window.scrollTo(0, previousScrollY);
      return;
    }

    const scrollY = window.scrollY || 0;
    el.classList.add(className);
    body.classList.add(className);
    body.style.top = `-${scrollY}px`;

    return () => {
      const restoreScrollY = Math.abs(parseInt(document.body.style.top || '0', 10)) || 0;
      el.classList.remove(className);
      body.classList.remove(className);
      document.body.style.top = '';
      if (restoreScrollY) window.scrollTo(0, restoreScrollY);
    };
  }, [isLandingPage, isLandingScrollLockViewport]);

  return (
    <div className="main-layout-wrapper">
      {/* Main Content Area */}
      <div className={`main-content-area content-full${isAuthPage ? ' auth-page' : ''}${isLandingPage ? ' landing-page' : ''}`}>
        {!isEmbedded && (
          <Header
            showLogout={true}
            showChatWidgetButton={!isMobile}
            onToggleChatWidget={() => setChatWidgetOpen((o) => !o)}
            chatWidgetOpen={chatWidgetOpen}
          />
        )}
        <main className={`main-content${isAuthPage ? ' auth-page-content' : ''}${isLandingPage ? ' landing-page-content' : ''}`}>
          {isLandingPage ? children : <div className="page-wrapper">{children}</div>}
        </main>
        {/* Footer removed for cleaner UI */}
      </div>

      {/* Resonant Chat floating widget — only on landing/hero page */}
      {isLandingPage && !isEmbedded && (
        <FloatingChatWidget isOpen={chatWidgetOpen} onOpenChange={setChatWidgetOpen} hideLauncher={true} />
      )}
    </div>
  );
};

export default MainLayout;
