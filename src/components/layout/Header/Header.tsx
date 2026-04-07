/**
 * Unified Header Component - Based on HomeNew design
 * Used across entire frontend for consistency
 * Includes global side navigation menu
 * 
 * Now using CSS Modules for scoped styling
 */

import React, { useState, useEffect, useRef } from 'react';
import { UnifiedSidebarMenu } from '../UnifiedSidebarMenu';
import { useNavigate, useLocation } from 'react-router-dom';
import { clearSession } from '@/utils/auth';
import { isAuthenticated, getSessionData } from '@/utils/auth-cookies';
import { logout as apiLogout } from '@/api/auth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui';
import { useResonantChatMenu } from '@/context/ResonantChatMenuContext';
import { useThemeStore } from '@/store/themeStore';
import styles from './Header.module.css';
import { 
  goToHome, 
  goToLogin,
  goToPricing
} from '@/utils/navigation';

type SplitViewPane = 'chat' | 'split';
type SplitViewCommandDetail = {
  enabled?: boolean;
  pane?: SplitViewPane;
  togglePane?: boolean;
};

const SplitViewGlyph = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="12" y1="3" x2="12" y2="21" />
  </svg>
);

const SplitViewToggleIcon: React.FC<{ enabled: boolean }> = ({ enabled }) => (
  <span className={styles.splitViewToggleIcon} aria-hidden="true">
    <span className={styles.splitViewToggleHalfLeft}>
      <SplitViewGlyph />
    </span>
    <span className={`${styles.splitViewToggleHalfRight} ${enabled ? styles.splitViewToggleHalfRightActive : ''}`}>
      <SplitViewGlyph />
    </span>
  </span>
);

interface HeaderProps {
  showLogout?: boolean;
  showChatWidgetButton?: boolean;
  onToggleChatWidget?: () => void;
  chatWidgetOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  showLogout = false,
  showChatWidgetButton = false,
  onToggleChatWidget,
  chatWidgetOpen = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(60);
    const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [landingChatActive, setLandingChatActive] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  
  // Use auth-cookies for reliable authentication check
  const sessionData = getSessionData();
  const isLoggedIn = isAuthenticated() && !!sessionData;
  const { theme } = useThemeStore();
  
  // Check if we're on Resonant Chat page
  const isResonantChatPage = location.pathname === '/' || location.pathname === '/resonant-chat' || location.pathname.startsWith('/resonant-chat');

  const isLandingPage = location.pathname === '/';

  const [splitViewEnabled, setSplitViewEnabled] = useState(false);
  const [splitViewPane, setSplitViewPane] = useState<SplitViewPane>('chat');

  useEffect(() => {
    if (!isLandingPage) {
      setLandingChatActive(false);
      return;
    }

    setLandingChatActive(document.body.classList.contains('landing-chat-active'));

    const handler = (e: Event) => {
      const detail = (e as CustomEvent<boolean>).detail;
      setLandingChatActive(!!detail);
    };

    window.addEventListener('rg:landing-chat-active', handler as EventListener);
    return () => window.removeEventListener('rg:landing-chat-active', handler as EventListener);
  }, [isLandingPage]);
  
  // Get Resonant Chat menu items (hook returns empty array if not in provider)
  const { menuItems: resonantChatMenuItems } = useResonantChatMenu();

  // Pages that should show Log In/Sign Up buttons
  const showAuthButtons = 
    location.pathname === '/llm-scan' ||
    location.pathname === '/public/llm-scan' ||
    location.pathname === '/validate' ||
    location.pathname === '/public/validate';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    const updateHeaderHeight = () => {
      const header = document.querySelector('header');
      if (header) {
        const height = header.offsetHeight;
        setHeaderHeight(height);
        // Set CSS variable for sidebar positioning - use immediately
        document.documentElement.style.setProperty('--header-height', `${height}px`);
      }
    };
    
    // Set initial value immediately
    updateHeaderHeight();
    
    // Also set on next frame to ensure it's applied before render
    requestAnimationFrame(() => {
      updateHeaderHeight();
    });
    
    window.addEventListener('resize', updateHeaderHeight);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, []);

  useEffect(() => {
    const update = () => setIsMobileViewport(window.innerWidth <= 1024);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (!isResonantChatPage) return;
    try {
      setSplitViewEnabled(localStorage.getItem('resonant-chat-split-view') === 'true');
    } catch {
      setSplitViewEnabled(false);
    }
  }, [isResonantChatPage]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ enabled: boolean; pane?: SplitViewPane }>).detail;
      if (!detail) return;
      setSplitViewEnabled(!!detail.enabled);
      if (detail.pane) setSplitViewPane(detail.pane);
    };
    window.addEventListener('rg:split-view-state', handler as EventListener);
    return () => window.removeEventListener('rg:split-view-state', handler as EventListener);
  }, []);

  const dispatchSplitViewCommand = (detail: SplitViewCommandDetail) => {
    window.dispatchEvent(new CustomEvent('rg:split-view-command', { detail }));
  };

  const handleSplitViewToggleClick = () => {
    if (!isResonantChatPage) return;

    if (isMobileViewport) {
      if (!splitViewEnabled) {
        setSplitViewEnabled(true);
        setSplitViewPane('split');
        dispatchSplitViewCommand({ enabled: true, pane: 'split' });
        return;
      }

      const nextPane: SplitViewPane = splitViewPane === 'chat' ? 'split' : 'chat';
      setSplitViewPane(nextPane);
      dispatchSplitViewCommand({ togglePane: true });
      return;
    }

    const nextEnabled = !splitViewEnabled;
    setSplitViewEnabled(nextEnabled);
    setSplitViewPane(nextEnabled ? 'split' : 'chat');
    dispatchSplitViewCommand({ enabled: nextEnabled, pane: nextEnabled ? 'split' : 'chat' });
  };

  // Close menus when route changes
  useEffect(() => {
    setShowAccountMenu(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  // Close account menu and nav dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setShowAccountMenu(false);
      }
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (sessionData?.email && typeof sessionData.email === 'string' && sessionData.email.length > 0) {
      return sessionData.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearSession();
      import('@/utils/auth-cookies').then(({ clearSessionData }) => {
        clearSessionData();
      }).catch(() => {});
      // Clear all chat-related localStorage to prevent leaking data to next user
      localStorage.removeItem('resonant-chat-current-conversation');
      localStorage.removeItem('resonant-chat-live-messages');
      localStorage.removeItem('resonant-chat-selected-agent-hash');
      localStorage.removeItem('resonant-chat-user-id');
      localStorage.removeItem('resonant-chat-split-view');
      localStorage.removeItem('resonant-chat-split-width');
      localStorage.removeItem('resonant-chat-pending-message');
      localStorage.removeItem('rg-guest-chat-messages');
      window.location.href = '/login';
    }
  };


  // Check if we're on a backend page (authenticated pages should show menu)
  const isBackendPage = !location.pathname.startsWith('/public') && 
                        !location.pathname.startsWith('/validate') && 
                        !location.pathname.startsWith('/llm-scan') &&
                        location.pathname !== '/' &&
                        location.pathname !== '/login' &&
                        location.pathname !== '/signup' &&
                        location.pathname !== '/api/docs' &&
                        location.pathname !== '/pricing' &&
                        location.pathname !== '/about' &&
                        location.pathname !== '/contact' &&
                        location.pathname !== '/careers';
  
  // Show menu on backend pages if logged in
  const shouldShowMenu = isBackendPage && isLoggedIn;

  
  return (
    <>
      <header className={`${styles.header} ${styles.hoverReveal} ${isScrolled ? styles.headerScrolled : ''} ${isLandingPage ? styles.landingHoverOnly : ''}`}>
        <div className={styles.content}>
          {/* Mobile Menu Button — uses Resonant logo instead of burger */}
          {isMobileViewport && (
            <button
              className={styles.burgerMenu}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <img
                  src={theme === 'dark' ? '/logo white.png' : '/logo black.png'}
                  alt="Menu"
                  className={styles.burgerLogo}
                />
              )}
            </button>
          )}

          <div 
            className={styles.logo}
            onClick={() => (isLandingPage && landingChatActive ? navigate('/resonant-chat') : goToHome(navigate))}
          >
            <img
              src={theme === 'dark' ? '/logo white.png' : '/logo black.png'}
              alt="ResonantGenesis"
              className={`${styles.logoIcon} ${isMobileViewport ? styles.logoIconHiddenMobile : ''}`}
            />
            {isLandingPage ? (landingChatActive ? 'AGI Neural Hub' : 'ResonantGenesis') : 'ResonantGenesis'}
          </div>

          {/* Main Navigation - Desktop */}
          <nav ref={navRef} className={`${styles.mainNav} ${styles.hoverOnly}`}>
            {/* Solutions Dropdown */}
            <div className={styles.navItem}>
              <button 
                className={`${styles.navButton} ${activeDropdown === 'solutions' ? styles.navButtonActive : ''}`}
                onClick={() => setActiveDropdown(activeDropdown === 'solutions' ? null : 'solutions')}
              >
                Services
                <svg className={styles.navChevron} width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6L8 10L12 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {activeDropdown === 'solutions' && (
                <div className={styles.navDropdown}>
                  <div className={styles.navDropdownGridOneRow}>
                    <button className={styles.navDropdownItem} onClick={() => { navigate('/resonant-memory'); setActiveDropdown(null); }}>
                      <span className={styles.navDropdownItemTitle}>Hash Sphere Memory</span>
                      <span className={styles.navDropdownItemDesc}>9-layer semantic memory — stores, links &amp; recalls knowledge across agents via dimensional resonance retrieval</span>
                    </button>
                    <button className={styles.navDropdownItem} onClick={() => { navigate('/state-physics'); setActiveDropdown(null); }}>
                      <span className={styles.navDropdownItemTitle}>State Physics SIM</span>
                      <span className={styles.navDropdownItemDesc}>Constraint-based simulation — models token flows, governance rules &amp; system invariants before deploying live</span>
                    </button>
                    <button className={styles.navDropdownItem} onClick={() => { navigate('/code-visualizer'); setActiveDropdown(null); }}>
                      <span className={styles.navDropdownItemTitle}>Code Visualizer</span>
                      <span className={styles.navDropdownItemDesc}>Full-stack SAST — scans your codebase, maps dependency graphs, detects vulnerabilities &amp; visualizes architecture</span>
                    </button>
                  </div>
                </div>
              )}
            </div>


            {/* Agents - Top level */}
            <div className={styles.navItem}>
              <button
                className={styles.navButton}
                onClick={() => { navigate('/agents'); setActiveDropdown(null); }}
              >
                Agents
              </button>
            </div>

            {/* Pricing Link */}
            <button 
              className={styles.navButton}
              onClick={() => goToPricing(navigate)}
            >
              Pricing
            </button>



            {/* Download Miner — PNG icon */}
            <button 
              className={styles.navDownloadIcon}
              onClick={() => navigate('/download-miner')}
              title="Download Miner"
            >
              <img
                className={styles.dlIconImg}
                src={theme === 'dark' ? '/images/Header_icons/mining-light.png' : '/images/Header_icons/mining-dark.png'}
                alt="Miner"
              />
              <span className={styles.dlLabel}>Miner</span>
            </button>

            {/* Download IDE — PNG icon */}
            <button 
              className={styles.navDownloadIcon}
              onClick={() => navigate('/download-ide')}
              title="Download IDE"
            >
              <img
                className={styles.dlIconImg}
                src={theme === 'dark' ? '/images/Header_icons/ide-light.png' : '/images/Header_icons/ide-dark.png'}
                alt="IDE"
              />
              <span className={styles.dlLabel}>IDE</span>
            </button>

            {/* OpenClaw Extension — PNG icon */}
            <button 
              className={styles.navDownloadIcon}
              onClick={() => navigate('/download-openclaw')}
              title="OpenClaw Extension"
            >
              <img
                className={styles.dlIconImg}
                src="/images/Header_icons/openclaw.png"
                alt="OpenClaw"
              />
              <span className={styles.dlLabel}>Connect</span>
            </button>

            {/* API — PNG icon */}
            <button 
              className={styles.navDownloadIcon}
              onClick={() => navigate('/api/docs')}
              title="Connect Platform API"
            >
              <img
                className={styles.dlIconImg}
                src={theme === 'dark' ? '/images/Header_icons/api-light.png' : '/images/Header_icons/api-dark.png'}
                alt="API"
              />
              <span className={styles.dlLabel}>API</span>
            </button>

          </nav>

          {/* AgentOS-specific elements when on /agents page */}
          {/* AgentOS minimal header - search moved to page */}
          
          <div className={styles.actions}>
            <div className={`${styles.actionsRow} ${styles.hoverOnly}`}>
              <a
                href="https://github.com/DevSwat-ResonantGenesis"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.chatWidgetButton}
                title="GitHub"
                aria-label="GitHub"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </a>

              {isLoggedIn && (
                <button
                  type="button"
                  className={styles.chatWidgetButton}
                  onClick={() => navigate('/connect-profiles')}
                  title="Integrations"
                  aria-label="Integrations"
                >
                  <img
                    src={document.documentElement.getAttribute('data-theme') === 'light' ? '/images/connect-icons/Integration black icon.png' : '/images/connect-icons/integration white icon.png'}
                    alt="Integrations"
                    style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                  />
                </button>
              )}

              {showChatWidgetButton && onToggleChatWidget && (
                <button
                  type="button"
                  className={styles.chatWidgetButton}
                  onClick={onToggleChatWidget}
                  aria-label="Resonant Chat"
                  title={chatWidgetOpen ? 'Close Resonant Chat' : 'Open Resonant Chat'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </button>
              )}

            </div>

            <ThemeToggle />

            {isResonantChatPage && isLoggedIn && (
              <button
                type="button"
                className={`${styles.splitViewToggleButton} ${splitViewEnabled ? styles.splitViewToggleButtonActive : ''} ${splitViewEnabled && splitViewPane === 'split' ? styles.splitViewToggleButtonPulse : ''}`}
                onClick={handleSplitViewToggleClick}
                aria-label="Split View"
                title={splitViewEnabled ? (isMobileViewport ? 'Toggle Split View pane' : 'Close Split View') : 'Open Split View'}
              >
                <SplitViewToggleIcon enabled={splitViewEnabled} />
              </button>
            )}

            {/* Logged In: Show Account Menu */}
            {isLoggedIn ? (
              <div ref={accountRef} className={styles.accountWrapper}>
                <button 
                  className={styles.accountButton}
                  onClick={() => {
                    if (isMobileViewport) {
                      navigate('/profile');
                      return;
                    }
                    setShowAccountMenu(!showAccountMenu);
                  }}
                  title={typeof sessionData?.email === 'string' ? sessionData.email : 'Account'}
                >
                  <div className={styles.accountAvatar}>
                    {getUserInitials()}
                  </div>
                  {!isMobileViewport && (
                    <svg className={styles.accountChevron} width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 6L8 10L12 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                {/* Account Dropdown Menu */}
                {showAccountMenu && !isMobileViewport && (
                  <div className={styles.accountMenu}>
                    <div className={styles.accountMenuHeader}>
                      <div className={styles.accountMenuAvatar}>{getUserInitials()}</div>
                      <div className={styles.accountMenuInfo}>
                        <span className={styles.accountMenuEmail}>{typeof sessionData?.email === 'string' ? sessionData.email : ''}</span>
                        <span className={styles.accountMenuRole}>{typeof sessionData?.role === 'string' ? sessionData.role : 'User'}</span>
                      </div>
                    </div>
                    <div className={styles.accountMenuDivider} />
                    
                    {/* Dashboard Section - Superusers see all 4 dashboards */}
                    <div className={styles.accountMenuSection}>
                      <span className={styles.accountMenuSectionTitle}>Dashboards</span>
                      
                      {/* Main Dashboard - Everyone sees this */}
                      <button className={styles.accountMenuItem} onClick={() => { navigate('/dashboard'); setShowAccountMenu(false); }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="2" y="2" width="5" height="5" rx="1" />
                          <rect x="9" y="2" width="5" height="5" rx="1" />
                          <rect x="2" y="9" width="5" height="5" rx="1" />
                          <rect x="9" y="9" width="5" height="5" rx="1" />
                        </svg>
                        Dashboard
                      </button>
                      
                      {/* 2. Plus User Dashboard - Superusers and Plus users */}
                      {((sessionData?.is_superuser || sessionData?.role === 'platform_owner') || sessionData?.plan === 'plus' || sessionData?.plan === 'enterprise') && (
                        <button className={styles.accountMenuItem} onClick={() => { navigate('/plus-dashboard'); setShowAccountMenu(false); }}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="8" cy="8" r="6" />
                            <path d="M8 5V11M5 8H11" />
                          </svg>
                          Plus Dashboard
                        </button>
                      )}
                      
                      
                      {/* 4. Owner Platform Dashboard - Superusers only */}
                      {(sessionData?.is_superuser || sessionData?.role === 'platform_owner') && (
                        <button className={styles.accountMenuItem} onClick={() => { navigate('/owner-dashboard'); setShowAccountMenu(false); }}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M8 1L10 5H14L11 8L12 13L8 10L4 13L5 8L2 5H6L8 1Z" />
                          </svg>
                          Owner Dashboard
                        </button>
                      )}
                    </div>
                    
                    <div className={styles.accountMenuDivider} />

                    {/* Wallet */}
                    <button className={styles.accountMenuItem} onClick={() => { navigate('/wallet'); setShowAccountMenu(false); }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="2" y="4" width="12" height="9" rx="1.5" />
                        <path d="M2 7H14" />
                        <circle cx="11" cy="10" r="1" fill="currentColor" />
                      </svg>
                      Wallet
                    </button>

                    <div className={styles.accountMenuDivider} />
                    
                    {/* Superuser/Platform Owner Tools */}
                    {(sessionData?.is_superuser || sessionData?.role === 'platform_owner') && (
                      <>
                        <button className={styles.accountMenuItem} onClick={() => { navigate('/owner-dashboard?tab=control'); setShowAccountMenu(false); }}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="8" cy="8" r="2" />
                            <path d="M8 2V4M8 12V14M2 8H4M12 8H14M3.5 3.5L5 5M11 11L12.5 12.5M3.5 12.5L5 11M11 5L12.5 3.5" />
                          </svg>
                          Platform Control
                        </button>
                        <div className={styles.accountMenuDivider} />
                      </>
                    )}
                    
                    <button className={styles.accountMenuItem} onClick={() => { navigate('/profile'); setShowAccountMenu(false); }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="8" cy="5" r="3" />
                        <path d="M2 14C2 11 4.5 9 8 9C11.5 9 14 11 14 14" strokeLinecap="round" />
                      </svg>
                      Profile
                    </button>
                    <div className={styles.accountMenuDivider} />
                    <button className={`${styles.accountMenuItem} ${styles.accountMenuItemDanger}`} onClick={handleLogout}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M6 2H3C2.5 2 2 2.5 2 3V13C2 13.5 2.5 14 3 14H6M11 11L14 8L11 5M6 8H14" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : !isLoggedIn ? (
              // Not Logged In: single login icon button (no text Login/Signup)
              <button
                type="button"
                className={styles.authIconButton}
                onClick={() => goToLogin(navigate)}
                aria-label="Log in"
                title="Log in"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {/* Mobile Dropdown Menu removed — UnifiedSidebarMenu handles mobile nav */}
      <UnifiedSidebarMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
};

export default Header;

