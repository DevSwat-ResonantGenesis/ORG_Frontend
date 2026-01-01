import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer';
import FloatingChatWidget from '@/components/ResonantChat/FloatingChatWidget';
import { useGlobalKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import './MainLayout.css';
import './clickability-fix.css';

type Props = {
  children: React.ReactNode;
};

const MainLayout = ({ children }: Props) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Check if we're on a backend page (not landing/public pages)
  const isBackendPage = !location.pathname.startsWith('/public') && 
                        !location.pathname.startsWith('/validate') && 
                        !location.pathname.startsWith('/llm-scan') &&
                        location.pathname !== '/' &&
                        location.pathname !== '/login' &&
                        location.pathname !== '/signup';

  // Hide header on auth pages (login/signup)
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

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
      <div className={`main-content-area content-full${isAuthPage ? ' auth-page' : ''}`}>
        <Header showLogout={true} />
        <main className={`main-content${isAuthPage ? ' auth-page-content' : ''}`}>
          <div className="page-wrapper">
          {children}
          </div>
        </main>
        {/* Footer removed for cleaner UI */}
      </div>

      {/* Floating Chat Widget - Available on all pages */}
      <FloatingChatWidget />
    </div>
  );
};

export default MainLayout;
