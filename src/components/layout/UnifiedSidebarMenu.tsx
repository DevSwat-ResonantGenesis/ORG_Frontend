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
  goToResonantChat,
  goToContact,
  goToLogin,
  goToIDE,
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
  const isResonantChatPage = location.pathname === '/resonant-chat' || location.pathname.startsWith('/resonant-chat');
  
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
          {/* Products Section */}
          <div className={styles.usmSection}>
            <div className={styles.usmSectionTitle}>Products</div>

            <button
              className={`${styles.usmItem} ${location.pathname === '/resonant-chat' ? styles.usmActive : ''}`}
              onClick={() => { goToResonantChat(navigate, onClose); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M8 2C5 2 2.5 4.5 2.5 7.5C2.5 9.5 3.5 11.2 5 12.2V14.5L7.2 12.2C7.5 12.3 7.8 12.3 8.1 12.3C11.1 12.3 13.5 9.8 13.5 7.5C13.5 4.5 11 2 8 2Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className={styles.usmLabel}>AGI Neural Hub</span>
              {location.pathname === '/resonant-chat' && <span className={styles.usmActiveIndicator} />}
            </button>

            <button
              className={`${styles.usmItem} ${location.pathname === '/build' ? styles.usmActive : ''}`}
              onClick={() => { navigate('/build'); onClose(); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 13V3H13V13H3Z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 6H11M5 9H11" strokeLinecap="round" />
                </svg>
              </span>
              <span className={styles.usmLabel}>Resonant Builder</span>
              {location.pathname === '/build' && <span className={styles.usmActiveIndicator} />}
            </button>

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
              <span className={styles.usmLabel}>AI Agent Studio</span>
              {location.pathname === '/agents' && <span className={styles.usmActiveIndicator} />}
            </button>

            <button
              className={`${styles.usmItem} ${location.pathname === '/ide' ? styles.usmActive : ''}`}
              onClick={() => { goToIDE(navigate, onClose); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="12" height="12" rx="1" />
                  <path d="M5 5H11M5 8H11M5 11H8" strokeLinecap="round" />
                </svg>
              </span>
              <span className={styles.usmLabel}>Resonant IDE</span>
              {location.pathname === '/ide' && <span className={styles.usmActiveIndicator} />}
            </button>

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
              <span className={styles.usmLabel}>Synthetic Neural Memory</span>
              {location.pathname === '/resonant-memory' && <span className={styles.usmActiveIndicator} />}
            </button>

            <button
              className={`${styles.usmItem} ${location.pathname === '/state-physics' ? styles.usmActive : ''}`}
              onClick={() => { navigate('/state-physics'); onClose(); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="8" r="6" />
                  <circle cx="8" cy="8" r="3" />
                  <circle cx="8" cy="8" r="1" fill="currentColor" />
                  <path d="M8 2V4M8 12V14M2 8H4M12 8H14" strokeLinecap="round" />
                </svg>
              </span>
              <span className={styles.usmLabel}>Invariants SIM</span>
              {location.pathname === '/state-physics' && <span className={styles.usmActiveIndicator} />}
            </button>

            <button
              className={`${styles.usmItem} ${location.pathname === '/code-visualizer' ? styles.usmActive : ''}`}
              onClick={() => { navigate('/code-visualizer'); onClose(); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="12" height="12" rx="1" />
                  <path d="M5 5L8 8L5 11M9 11H12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className={styles.usmLabel}>SAST & Dependency Graph Analysis</span>
              {location.pathname === '/code-visualizer' && <span className={styles.usmActiveIndicator} />}
            </button>

            <button
              className={`${styles.usmItem} ${location.pathname === '/network/history' ? styles.usmActive : ''}`}
              onClick={() => { navigate('/network/history'); onClose(); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="8" r="6" />
                  <path d="M8 4V8L10.5 10.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className={styles.usmLabel}>Execution History</span>
              {location.pathname === '/network/history' && <span className={styles.usmActiveIndicator} />}
            </button>
            <button
              className={`${styles.usmItem} ${location.pathname === '/network/blockchain' ? styles.usmActive : ''}`}
              onClick={() => { navigate('/network/blockchain'); onClose(); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="5" height="5" rx="1" />
                  <rect x="9" y="9" width="5" height="5" rx="1" />
                  <path d="M7 4.5H9.5V9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className={styles.usmLabel}>Blockchain Explorer</span>
              {location.pathname === '/network/blockchain' && <span className={styles.usmActiveIndicator} />}
            </button>
          </div>

          <div className={styles.usmDivider} />

          {/* Marketplace Section */}
          <div className={styles.usmSection}>
            <div className={styles.usmSectionTitle}>Marketplace</div>
            
            <button
              className={`${styles.usmItem} ${location.pathname === '/network/marketplace' ? styles.usmActive : ''}`}
              onClick={() => { navigate('/network/marketplace'); onClose(); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="5" height="5" rx="1" />
                  <rect x="9" y="2" width="5" height="5" rx="1" />
                  <rect x="2" y="9" width="5" height="5" rx="1" />
                  <rect x="9" y="9" width="5" height="5" rx="1" />
                </svg>
              </span>
              <span className={styles.usmLabel}>Marketplace</span>
              {location.pathname === '/network/marketplace' && <span className={styles.usmActiveIndicator} />}
            </button>

            <button
              className={`${styles.usmItem} ${location.pathname === '/network/agents' ? styles.usmActive : ''}`}
              onClick={() => { navigate('/network/agents'); onClose(); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="5" r="3" />
                  <path d="M3 14C3 11 5 9 8 9C11 9 13 11 13 14" strokeLinecap="round" />
                </svg>
              </span>
              <span className={styles.usmLabel}>Discover AI Agents</span>
              {location.pathname === '/network/agents' && <span className={styles.usmActiveIndicator} />}
            </button>

            <button
              className={`${styles.usmItem} ${location.pathname === '/wallet' ? styles.usmActive : ''}`}
              onClick={() => { navigate('/wallet'); onClose(); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 8V5H3a1.5 1.5 0 010-3h10v3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 3.5V13a1 1 0 001 1h11V8" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="10" r="1" fill="currentColor" />
                </svg>
              </span>
              <span className={styles.usmLabel}>Crypto Wallet</span>
              {location.pathname === '/wallet' && <span className={styles.usmActiveIndicator} />}
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

            <button
              className={`${styles.usmItem} ${location.pathname === '/help' || location.pathname.startsWith('/help/') ? styles.usmActive : ''}`}
              onClick={() => { navigate('/help'); onClose(); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="8" r="6" />
                  <path d="M6 6C6 5 7 4 8 4C9 4 10 5 10 6C10 7 9 7.5 8 8V9" strokeLinecap="round" />
                  <circle cx="8" cy="11" r="0.5" fill="currentColor" />
                </svg>
              </span>
              <span className={styles.usmLabel}>Tutorials</span>
              {(location.pathname === '/help' || location.pathname.startsWith('/help/')) && <span className={styles.usmActiveIndicator} />}
            </button>

            <button
              className={`${styles.usmItem} ${location.pathname === '/investor-pitch-deck' ? styles.usmActive : ''}`}
              onClick={() => { navigate('/investor-pitch-deck'); onClose(); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="3" width="12" height="10" rx="1" />
                  <path d="M5 7L7 9L11 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className={styles.usmLabel}>Investor Pitch Deck</span>
              {location.pathname === '/investor-pitch-deck' && <span className={styles.usmActiveIndicator} />}
            </button>
          </div>

          <div className={styles.usmDivider} />

          {/* Rabbit - Standalone Community Section */}
          <div className={styles.usmSection}>
            <div className={styles.usmSectionTitle}>Community</div>

            <button
              className={`${styles.usmItem} ${location.pathname === '/rabbit' ? styles.usmActive : ''}`}
              onClick={() => { navigate('/rabbit'); onClose(); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="8" r="6" />
                  <path d="M5.5 9.5c1 1 4 1 5 0" strokeLinecap="round" />
                  <path d="M6 6.5h0.01M10 6.5h0.01" strokeLinecap="round" />
                </svg>
              </span>
              <span className={styles.usmLabel}>Rabbit</span>
              {location.pathname === '/rabbit' && <span className={styles.usmActiveIndicator} />}
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
