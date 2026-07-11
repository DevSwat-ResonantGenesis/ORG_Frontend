/**
 * Unified Sidebar Menu - Completely Isolated Component
 * Uses its own CSS module with no global style dependencies
 * Created: 2025-12-12
 */
import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getSessionData } from '@/utils/auth-cookies';
import { clearSession } from '@/utils/auth';
import { logout as apiLogout } from '@/api/auth';
import { useResonantChatMenu } from '@/context/ResonantChatMenuContext';
import {
  goToPricing,
  goToHome,
  goToLogin,
} from '@/utils/navigation';
import styles from './UnifiedSidebarMenu.module.css';

interface UnifiedSidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UnifiedSidebarMenu: React.FC<UnifiedSidebarMenuProps> = ({
  isOpen,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = isAuthenticated();
  const sessionData = getSessionData();
  
  // Check if on Resonant Chat page
  const isResonantChatPage = location.pathname === '/' || location.pathname === '/resonant-chat' || location.pathname.startsWith('/resonant-chat');

  // Opens split view straight to a given tab (e.g. Terminal). If already on
  // /resonant-chat, dispatch directly instead of navigate()-ing with a query
  // string — navigating to the exact same URL (e.g. tapping Terminal again
  // after manually switching to another split-view tab, which never changes
  // the URL) is a no-op in react-router, so a query-param-driven effect would
  // never re-fire and the tab would silently stay wherever it was.
  const openSplitViewTab = (tab: string) => {
    if (isResonantChatPage) {
      window.dispatchEvent(new CustomEvent('rg:split-view-command', { detail: { enabled: true, pane: 'split' } }));
      window.dispatchEvent(new CustomEvent('rg:split-view-tab-change', { detail: { tab } }));
    } else {
      navigate(`/resonant-chat?splitTab=${tab}`);
    }
  };

  // Get chat menu items from context
  const { menuItems: chatMenuItems } = useResonantChatMenu();

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('usmMenuOpen');
    } else {
      document.body.classList.remove('usmMenuOpen');
    }
    return () => {
      document.body.classList.remove('usmMenuOpen');
    };
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearSession();
      // Clear all chat-related localStorage to prevent leaking data to next user
      localStorage.removeItem('resonant-chat-current-conversation');
      localStorage.removeItem('resonant-chat-live-messages');
      localStorage.removeItem('resonant-chat-selected-agent-hash');
      localStorage.removeItem('resonant-chat-user-id');
      localStorage.removeItem('resonant-chat-split-view');
      localStorage.removeItem('resonant-chat-split-width');
      localStorage.removeItem('resonant-chat-pending-message');
      localStorage.removeItem('rg-guest-chat-messages');
      onClose();
      window.location.href = '/login';
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      onClose();
    } else {
      if (location.pathname !== '/') {
        goToHome(navigate);
        setTimeout(() => {
          const homeElement = document.getElementById(id);
          if (homeElement) {
            homeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 300);
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`${styles.usmOverlay} ${isOpen ? styles.usmOpen : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Menu */}
      <div 
        ref={menuRef}
        className={`${styles.usmRoot} ${isOpen ? styles.usmOpen : ''}`}
      >
        {/* Header */}
        <div className={styles.usmHeader}>
          <h3 className={styles.usmTitle}>Resonant</h3>
          <button 
            className={styles.usmCloseBtn} 
            onClick={onClose} 
            aria-label="Close menu"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 1L13 13M13 1L1 13" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className={styles.usmContent}>
          {/* Coding Section - mobile shows only Terminal + Builder (IDE Cloud,
              IDE App download, and Code Visualizer stay desktop-only here) */}
          <div className={styles.usmSection}>
            <div className={styles.usmSectionTitle}>Coding</div>

            <button
              className={styles.usmItem}
              onClick={() => { openSplitViewTab('terminal'); onClose(); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="12" height="12" rx="1" />
                  <path d="M5 6L7 8L5 10" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 10H11" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className={styles.usmLabel}>Terminal</span>
            </button>

            <button
              className={`${styles.usmItem} ${location.pathname === '/build' ? styles.usmActive : ''}`}
              onClick={() => { navigate('/build'); onClose(); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 4H14M4 4V13C4 13.5 4.5 14 5 14H11C11.5 14 12 13.5 12 13V4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6 4V2.5C6 2 6.5 2 7 2H9C9.5 2 10 2 10 2.5V4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className={styles.usmLabel}>Builder</span>
              {location.pathname === '/build' && <span className={styles.usmActiveIndicator} />}
            </button>
          </div>

          <div className={styles.usmDivider} />

          {/* Agent OS Section */}
          <div className={styles.usmSection}>
            <div className={styles.usmSectionTitle}>Agent OS</div>

            <button
              className={`${styles.usmItem} ${location.pathname === '/agents' ? styles.usmActive : ''}`}
              onClick={() => { navigate('/agents'); onClose(); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="6" r="3" />
                  <path d="M3 14C3 11 5.5 9 8 9C10.5 9 13 11 13 14" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className={styles.usmLabel}>Agent OS</span>
              {location.pathname === '/agents' && <span className={styles.usmActiveIndicator} />}
            </button>

            <button
              className={`${styles.usmItem} ${location.pathname === '/marketplace' ? styles.usmActive : ''}`}
              onClick={() => { navigate('/marketplace'); onClose(); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 5L3 2h10l1 3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 5v8a1 1 0 001 1h10a1 1 0 001-1V5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 5h12" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6 8v3M10 8v3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className={styles.usmLabel}>Marketplace</span>
              {location.pathname === '/marketplace' && <span className={styles.usmActiveIndicator} />}
            </button>
          </div>

          <div className={styles.usmDivider} />

          {/* Memory Section */}
          <div className={styles.usmSection}>
            <button
              className={`${styles.usmItem} ${location.pathname === '/resonant-memory' ? styles.usmActive : ''}`}
              onClick={() => { navigate('/resonant-memory'); onClose(); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="8" r="5" strokeDasharray="2 2" />
                  <circle cx="5" cy="5" r="1" fill="currentColor" />
                  <circle cx="11" cy="6" r="1" fill="currentColor" />
                  <circle cx="6" cy="11" r="1" fill="currentColor" />
                  <circle cx="10" cy="10" r="1" fill="currentColor" />
                  <path d="M8 8L5 5M8 8L11 6M8 8L6 11M8 8L10 10" strokeWidth="0.5" opacity="0.5" />
                </svg>
              </span>
              <span className={styles.usmLabel}>Memory</span>
              {location.pathname === '/resonant-memory' && <span className={styles.usmActiveIndicator} />}
            </button>
          </div>

          <div className={styles.usmDivider} />

          {/* Other Section */}
          <div className={styles.usmSection}>
            {/* GitHub */}
            <a
              className={styles.usmDownloadItem}
              href="https://github.com/DevSwat-ResonantGenesis"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onClose()}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <span className={styles.usmDlIcon}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </span>
              <span className={styles.usmLabel}>GitHub</span>
            </a>

            <button
              className={`${styles.usmItem} ${location.pathname === '/dashboard' && location.search.includes('tab=integrations') ? styles.usmActive : ''}`}
              onClick={() => { navigate('/dashboard?tab=integrations'); onClose(); }}
            >
              <span className={styles.usmLabel}>Apps</span>
              {location.pathname === '/dashboard' && location.search.includes('tab=integrations') && <span className={styles.usmActiveIndicator} />}
            </button>

          </div>

          <div className={styles.usmDivider} />

          {/* Chat Tools Section - Only on Resonant Chat page */}
          {isResonantChatPage && chatMenuItems.filter(item => !item.divider).length > 0 && (
            <>
              <div className={styles.usmSection}>
                <div className={styles.usmSectionTitle}>Chat Tools</div>
                {chatMenuItems
                  .filter(item => !item.divider)
                  .map((item) => (
                    <button
                      key={item.id}
                      className={`${styles.usmItem} ${item.danger ? styles.usmDanger : ''}`}
                      onClick={() => { item.onClick(); onClose(); }}
                    >
                      <span className={styles.usmIcon}>{item.icon}</span>
                      <span className={styles.usmLabel}>{item.label}</span>
                    </button>
                  ))}
              </div>
              <div className={styles.usmDivider} />
            </>
          )}

          {/* Platform Section */}
          <div className={styles.usmSection}>
            <div className={styles.usmSectionTitle}>Platform</div>
            
            <button
              className={`${styles.usmItem} ${location.pathname === '/pricing' ? styles.usmActive : ''}`}
              onClick={() => { goToPricing(navigate, onClose); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="4" width="12" height="8" rx="1" />
                  <path d="M2 7H14" strokeLinecap="round" />
                </svg>
              </span>
              <span className={styles.usmLabel}>Pricing</span>
              {location.pathname === '/pricing' && <span className={styles.usmActiveIndicator} />}
            </button>



          </div>

          <div className={styles.usmDivider} />

          {/* Account Section */}
          <div className={styles.usmSection}>
            <div className={styles.usmSectionTitle}>Account</div>
            
            {isLoggedIn ? (
              <>
                <button
                  className={`${styles.usmItem} ${location.pathname === '/dashboard' ? styles.usmActive : ''}`}
                  onClick={() => { navigate('/dashboard'); onClose(); }}
                >
                  <span className={styles.usmIcon}>
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 13V8M8 13V5M13 13V2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className={styles.usmLabel}>Dashboard</span>
                  {location.pathname === '/dashboard' && <span className={styles.usmActiveIndicator} />}
                </button>

                <button
                  className={`${styles.usmItem} ${styles.usmDanger}`}
                  onClick={handleLogout}
                >
                  <span className={styles.usmIcon}>
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M6 14H3C2.5 14 2 13.5 2 13V3C2 2.5 2.5 2 3 2H6M11 11L14 8L11 5M6 8H14" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className={styles.usmLabel}>Logout</span>
                </button>
              </>
            ) : (
              <button
                className={styles.usmItem}
                onClick={() => { goToLogin(navigate); onClose(); }}
              >
                <span className={styles.usmIcon}>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M10 2H13C13.5 2 14 2.5 14 3V13C14 13.5 13.5 14 13 14H10M5 5L2 8L5 11M2 8H10" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className={styles.usmLabel}>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UnifiedSidebarMenu;
