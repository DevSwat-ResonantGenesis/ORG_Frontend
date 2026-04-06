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
  goToContact,
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
          {/* Products Section */}
          <div className={styles.usmSection}>
            <div className={styles.usmSectionTitle}>Services</div>

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
              <span className={styles.usmLabel}>Agents</span>
              {location.pathname === '/agents' && <span className={styles.usmActiveIndicator} />}
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
              className={`${styles.usmItem} ${location.pathname === '/download-miner' ? styles.usmActive : ''}`}
              onClick={() => { navigate('/download-miner'); onClose(); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M8 2v6M8 8l-3-3M8 8l3-3M2 14h12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className={styles.usmLabel}>Download Miner</span>
              {location.pathname === '/download-miner' && <span className={styles.usmActiveIndicator} />}
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
                  className={`${styles.usmItem} ${location.pathname === '/wallet' ? styles.usmActive : ''}`}
                  onClick={() => { navigate('/wallet'); onClose(); }}
                >
                  <span className={styles.usmIcon}>
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="4" width="12" height="9" rx="1.5" />
                      <path d="M2 7H14" />
                      <circle cx="11" cy="10" r="1" fill="currentColor" />
                    </svg>
                  </span>
                  <span className={styles.usmLabel}>Wallet</span>
                  {location.pathname === '/wallet' && <span className={styles.usmActiveIndicator} />}
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
