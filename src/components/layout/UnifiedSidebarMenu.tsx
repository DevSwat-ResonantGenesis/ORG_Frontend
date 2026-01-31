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
          {/* Navigation Section */}
          <div className={styles.usmSection}>
            <div className={styles.usmSectionTitle}>Navigation</div>
            
            <button
              className={`${styles.usmItem} ${location.pathname === '/' ? styles.usmActive : ''}`}
              onClick={() => { goToHome(navigate); onClose(); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 8L8 3L13 8M5 8V13H11V8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className={styles.usmLabel}>Home</span>
              {location.pathname === '/' && <span className={styles.usmActiveIndicator} />}
            </button>

            <button
              className={`${styles.usmItem} ${location.pathname === '/resonant-chat' ? styles.usmActive : ''}`}
              onClick={() => { goToResonantChat(navigate, onClose); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M8 2C5 2 2.5 4.5 2.5 7.5C2.5 9.5 3.5 11.2 5 12.2V14.5L7.2 12.2C7.5 12.3 7.8 12.3 8.1 12.3C11.1 12.3 13.5 9.8 13.5 7.5C13.5 4.5 11 2 8 2Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className={styles.usmLabel}>Resonant Chat</span>
              {location.pathname === '/resonant-chat' && <span className={styles.usmActiveIndicator} />}
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
              className={`${styles.usmItem} ${location.pathname === '/marketplace' ? styles.usmActive : ''}`}
              onClick={() => { navigate('/marketplace'); onClose(); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 6L8 2L13 6M6 6V12H10V6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 14H14" strokeLinecap="round" />
                </svg>
              </span>
              <span className={styles.usmLabel}>General Store</span>
              {location.pathname === '/marketplace' && <span className={styles.usmActiveIndicator} />}
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
              <span className={styles.usmLabel}>Agents</span>
              {location.pathname === '/agents' && <span className={styles.usmActiveIndicator} />}
            </button>

            <button
              className={`${styles.usmItem} ${location.pathname === '/agent-teams' ? styles.usmActive : ''}`}
              onClick={() => { navigate('/agent-teams'); onClose(); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="5" cy="5" r="2" />
                  <circle cx="11" cy="5" r="2" />
                  <path d="M2 13C2 11 3.5 10 5 10C6.5 10 8 11 8 13" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 13C8 11 9.5 10 11 10C12.5 10 14 11 14 13" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className={styles.usmLabel}>Agent Teams</span>
              {location.pathname === '/agent-teams' && <span className={styles.usmActiveIndicator} />}
            </button>
          </div>

          <div className={styles.usmDivider} />

          {/* Decentralized Network Section */}
          <div className={styles.usmSection}>
            <div className={styles.usmSectionTitle}>Decentralized Network</div>
            
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
              <span className={styles.usmLabel}>DSID Marketplace</span>
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
              <span className={styles.usmLabel}>Agent Browser</span>
              {location.pathname === '/network/agents' && <span className={styles.usmActiveIndicator} />}
            </button>

            <button
              className={`${styles.usmItem} ${location.pathname === '/network/publish' ? styles.usmActive : ''}`}
              onClick={() => { navigate('/network/publish'); onClose(); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M8 3V10M5 6L8 3L11 6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 10V12C3 12.5 3.5 13 4 13H12C12.5 13 13 12.5 13 12V10" strokeLinecap="round" />
                </svg>
              </span>
              <span className={styles.usmLabel}>Publish Agent</span>
              {location.pathname === '/network/publish' && <span className={styles.usmActiveIndicator} />}
            </button>

            <button
              className={`${styles.usmItem} ${location.pathname === '/network/workflows' ? styles.usmActive : ''}`}
              onClick={() => { navigate('/network/workflows'); onClose(); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="4" cy="4" r="2" />
                  <circle cx="12" cy="8" r="2" />
                  <circle cx="4" cy="12" r="2" />
                  <path d="M6 4H10M6 12H10L10 8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className={styles.usmLabel}>Workflow Designer</span>
              {location.pathname === '/network/workflows' && <span className={styles.usmActiveIndicator} />}
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
              className={`${styles.usmItem} ${location.pathname === '/network/templates' ? styles.usmActive : ''}`}
              onClick={() => { navigate('/network/templates'); onClose(); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="2" width="10" height="12" rx="1" />
                  <path d="M6 5H10M6 8H10M6 11H8" strokeLinecap="round" />
                </svg>
              </span>
              <span className={styles.usmLabel}>Agent Templates</span>
              {location.pathname === '/network/templates' && <span className={styles.usmActiveIndicator} />}
            </button>
          </div>

          <div className={styles.usmDivider} />

          {/* Control Plane Section - Operator Console */}
          <div className={styles.usmSection}>
            <div className={styles.usmSectionTitle}>Control Plane</div>
            
            <button
              className={`${styles.usmItem} ${location.pathname === '/control-plane' ? styles.usmActive : ''}`}
              onClick={() => { navigate('/control-plane'); onClose(); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="12" height="12" rx="2" />
                  <path d="M5 5H11M5 8H11M5 11H8" strokeLinecap="round" />
                </svg>
              </span>
              <span className={styles.usmLabel}>Overview</span>
              {location.pathname === '/control-plane' && <span className={styles.usmActiveIndicator} />}
            </button>

            <button
              className={`${styles.usmItem} ${location.pathname === '/control-plane/semantics' ? styles.usmActive : ''}`}
              onClick={() => { navigate('/control-plane/semantics'); onClose(); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="8" r="3" />
                  <circle cx="3" cy="3" r="1.5" />
                  <circle cx="13" cy="3" r="1.5" />
                  <circle cx="13" cy="13" r="1.5" />
                  <path d="M5.5 5.5L4 4M10.5 5.5L12 4M10.5 10.5L12 12" strokeLinecap="round" />
                </svg>
              </span>
              <span className={styles.usmLabel}>Semantics</span>
              {location.pathname === '/control-plane/semantics' && <span className={styles.usmActiveIndicator} />}
            </button>

            <button
              className={`${styles.usmItem} ${location.pathname === '/control-plane/trust' ? styles.usmActive : ''}`}
              onClick={() => { navigate('/control-plane/trust'); onClose(); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M8 2L3 4V7C3 10.5 5 13 8 14C11 13 13 10.5 13 7V4L8 2Z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6 8L7.5 9.5L10 6.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className={styles.usmLabel}>Trust</span>
              {location.pathname === '/control-plane/trust' && <span className={styles.usmActiveIndicator} />}
            </button>

            <button
              className={`${styles.usmItem} ${location.pathname === '/control-plane/governance' ? styles.usmActive : ''}`}
              onClick={() => { navigate('/control-plane/governance'); onClose(); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M8 2L2 5V8C2 11 4.5 13.5 8 14.5C11.5 13.5 14 11 14 8V5L8 2Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className={styles.usmLabel}>Governance</span>
              {location.pathname === '/control-plane/governance' && <span className={styles.usmActiveIndicator} />}
            </button>

            <button
              className={`${styles.usmItem} ${location.pathname === '/control-plane/compliance' ? styles.usmActive : ''}`}
              onClick={() => { navigate('/control-plane/compliance'); onClose(); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="2" width="10" height="12" rx="1" />
                  <path d="M6 5H10M6 8H10M6 11H8" strokeLinecap="round" />
                </svg>
              </span>
              <span className={styles.usmLabel}>Compliance</span>
              {location.pathname === '/control-plane/compliance' && <span className={styles.usmActiveIndicator} />}
            </button>

            <button
              className={`${styles.usmItem} ${location.pathname === '/control-plane/security' ? styles.usmActive : ''}`}
              onClick={() => { navigate('/control-plane/security'); onClose(); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="4" y="7" width="8" height="6" rx="1" />
                  <path d="M6 7V5C6 3.5 7 2.5 8 2.5C9 2.5 10 3.5 10 5V7" strokeLinecap="round" />
                  <circle cx="8" cy="10" r="1" />
                </svg>
              </span>
              <span className={styles.usmLabel}>Security</span>
              {location.pathname === '/control-plane/security' && <span className={styles.usmActiveIndicator} />}
            </button>

            <button
              className={`${styles.usmItem} ${location.pathname === '/control-plane/performance' ? styles.usmActive : ''}`}
              onClick={() => { navigate('/control-plane/performance'); onClose(); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 12L5 9L8 11L14 4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M11 4H14V7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className={styles.usmLabel}>Performance</span>
              {location.pathname === '/control-plane/performance' && <span className={styles.usmActiveIndicator} />}
            </button>

            <button
              className={`${styles.usmItem} ${location.pathname === '/control-plane/business' ? styles.usmActive : ''}`}
              onClick={() => { navigate('/control-plane/business'); onClose(); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="3" width="12" height="10" rx="1" />
                  <path d="M5 3V2M11 3V2M2 6H14" strokeLinecap="round" />
                </svg>
              </span>
              <span className={styles.usmLabel}>Business</span>
              {location.pathname === '/control-plane/business' && <span className={styles.usmActiveIndicator} />}
            </button>

            <button
              className={`${styles.usmItem} ${location.pathname === '/control-plane/live' ? styles.usmActive : ''}`}
              onClick={() => { navigate('/control-plane/live'); onClose(); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="8" r="3" />
                  <circle cx="8" cy="8" r="6" strokeDasharray="2 2" />
                  <circle cx="8" cy="8" r="1" fill="currentColor" />
                </svg>
              </span>
              <span className={styles.usmLabel}>Live Monitor</span>
              {location.pathname === '/control-plane/live' && <span className={styles.usmActiveIndicator} />}
            </button>

            <button
              className={`${styles.usmItem} ${location.pathname === '/control-plane/guided' ? styles.usmActive : ''}`}
              onClick={() => { navigate('/control-plane/guided'); onClose(); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 3H13V13H3V3Z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6 6L10 10M10 6L6 10" strokeLinecap="round" />
                </svg>
              </span>
              <span className={styles.usmLabel}>Guided Scenarios</span>
              {location.pathname === '/control-plane/guided' && <span className={styles.usmActiveIndicator} />}
            </button>
          </div>

          <div className={styles.usmDivider} />

          {/* Code Visualizer Section */}
          <div className={styles.usmSection}>
            <div className={styles.usmSectionTitle}>Code Visualizer</div>
            
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
              <span className={styles.usmLabel}>Visualizer</span>
              {location.pathname === '/code-visualizer' && <span className={styles.usmActiveIndicator} />}
            </button>

            <button
              className={`${styles.usmItem} ${location.pathname === '/hash-sphere-memory' ? styles.usmActive : ''}`}
              onClick={() => { navigate('/hash-sphere-memory'); onClose(); }}
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
              <span className={styles.usmLabel}>Hash Sphere Memory</span>
              {location.pathname === '/hash-sphere-memory' && <span className={styles.usmActiveIndicator} />}
            </button>
          </div>

          <div className={styles.usmDivider} />

          {/* State Physics Section */}
          <div className={styles.usmSection}>
            <div className={styles.usmSectionTitle}>State Physics</div>
            
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
              <span className={styles.usmLabel}>Physics Engine</span>
              {location.pathname === '/state-physics' && <span className={styles.usmActiveIndicator} />}
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
              className={`${styles.usmItem} ${location.pathname === '/api-keys' ? styles.usmActive : ''}`}
              onClick={() => { navigate('/api-keys'); onClose(); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M10 6C10 4.5 9 3 7 3C5 3 3.5 4.5 3.5 6.5C3.5 8.5 5 10 7 10H13" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="7" cy="6.5" r="1.5" />
                  <path d="M11 10V13M13 10V12" strokeLinecap="round" />
                </svg>
              </span>
              <span className={styles.usmLabel}>API Keys</span>
              {location.pathname === '/api-keys' && <span className={styles.usmActiveIndicator} />}
            </button>
          </div>

          <div className={styles.usmDivider} />

          {/* Company Section */}
          <div className={styles.usmSection}>
            <div className={styles.usmSectionTitle}>Company</div>
            
            <button
              className={styles.usmItem}
              onClick={() => { goToContact(navigate, onClose); }}
            >
              <span className={styles.usmIcon}>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="3" width="12" height="10" rx="1" />
                  <path d="M2 5L8 9L14 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className={styles.usmLabel}>Contact</span>
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
                  className={`${styles.usmItem} ${location.pathname === '/billing' ? styles.usmActive : ''}`}
                  onClick={() => { navigate('/billing'); onClose(); }}
                >
                  <span className={styles.usmIcon}>
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="4" width="12" height="8" rx="1" />
                      <path d="M2 7H14" strokeLinecap="round" />
                      <path d="M5 10H8" strokeLinecap="round" />
                    </svg>
                  </span>
                  <span className={styles.usmLabel}>Payment</span>
                  {location.pathname === '/billing' && <span className={styles.usmActiveIndicator} />}
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
