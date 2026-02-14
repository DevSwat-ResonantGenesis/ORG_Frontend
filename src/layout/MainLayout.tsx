import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header/Header';
import FloatingChatWidget from '@/components/ResonantChat/FloatingChatWidget';
import { useGlobalKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import './MainLayout.css';
import './clickability-fix.css';

type Props = {
  children: React.ReactNode;
};

const MainLayout = ({ children }: Props) => {
  const [isMobile, setIsMobile] = useState(false);
  const [chatWidgetOpen, setChatWidgetOpen] = useState(false);
  const location = useLocation();

  // Hide header on auth pages (login/signup)
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  const isLandingPage = location.pathname === '/';

  // Enable global keyboard shortcuts
  useGlobalKeyboardShortcuts();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="main-layout-wrapper">
      {/* Main Content Area */}
      <div className={`main-content-area content-full${isAuthPage ? ' auth-page' : ''}${isLandingPage ? ' landing-page' : ''}`}>
        <Header
          showLogout={true}
          showChatWidgetButton={!isMobile}
          onToggleChatWidget={() => setChatWidgetOpen((o) => !o)}
          chatWidgetOpen={chatWidgetOpen}
        />
        <main className={`main-content${isAuthPage ? ' auth-page-content' : ''}${isLandingPage ? ' landing-page-content' : ''}`}>
          {isLandingPage ? children : <div className="page-wrapper">{children}</div>}
        </main>
        {/* Footer removed for cleaner UI */}
      </div>

      {/* Resonant Chat floating widget */}
      {!isAuthPage &&
        (isMobile ? (
          <FloatingChatWidget />
        ) : (
          <FloatingChatWidget isOpen={chatWidgetOpen} onOpenChange={setChatWidgetOpen} hideLauncher={true} />
        ))}
    </div>
  );
};

export default MainLayout;
