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
  
  // Check if we're on Resonant Chat page
  const isResonantChatPage = location.pathname === '/resonant-chat' || location.pathname.startsWith('/resonant-chat');

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
          {/* Mobile Burger Menu Button */}
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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          )}

          <div 
            className={styles.logo}
            onClick={() => (isLandingPage && landingChatActive ? navigate('/resonant-chat') : goToHome(navigate))}
          >
            {isLandingPage ? (landingChatActive ? 'Resonant Chat' : 'ResonantGenesis') : 'ResonantGenesis'}
          </div>

          {/* Main Navigation - Desktop */}
          <nav ref={navRef} className={`${styles.mainNav} ${styles.hoverOnly}`}>
            {/* Solutions Dropdown */}
            <div className={styles.navItem}>
              <button 
                className={`${styles.navButton} ${activeDropdown === 'solutions' ? styles.navButtonActive : ''}`}
                onClick={() => setActiveDropdown(activeDropdown === 'solutions' ? null : 'solutions')}
              >
                Solutions
                <svg className={styles.navChevron} width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6L8 10L12 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {activeDropdown === 'solutions' && (
                <div className={styles.navDropdown}>
                  <div className={styles.navDropdownGrid}>
                    <div className={styles.navDropdownColumn}>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/resonant-chat'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Resonant Chat</span>
                        <span className={styles.navDropdownItemDesc}>AI-powered conversations</span>
                      </button>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/build'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Project Builder</span>
                        <span className={styles.navDropdownItemDesc}>AI project generation</span>
                      </button>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/agents'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Agent Studio</span>
                        <span className={styles.navDropdownItemDesc}>Create & manage agents</span>
                      </button>
                    </div>
                    <div className={styles.navDropdownColumn}>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/agent-teams'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Agent Teams</span>
                        <span className={styles.navDropdownItemDesc}>Collaborative AI workflows</span>
                      </button>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/workflow-designer'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Workflow Designer</span>
                        <span className={styles.navDropdownItemDesc}>Visual workflow builder</span>
                      </button>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/marketplace'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>General Store</span>
                        <span className={styles.navDropdownItemDesc}>Templates & UI Skins</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Control Center Dropdown */}
            <div className={styles.navItem}>
              <button 
                className={`${styles.navButton} ${activeDropdown === 'control' ? styles.navButtonActive : ''}`}
                onClick={() => setActiveDropdown(activeDropdown === 'control' ? null : 'control')}
              >
                Control Center
                <svg className={styles.navChevron} width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6L8 10L12 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {activeDropdown === 'control' && (
                <div className={styles.navDropdown}>
                  <div className={styles.navDropdownGridWide}>
                    <div className={styles.navDropdownColumn}>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/control-plane'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Overview</span>
                        <span className={styles.navDropdownItemDesc}>System dashboard</span>
                      </button>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/control-plane/live'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Live Monitor</span>
                        <span className={styles.navDropdownItemDesc}>Real-time execution</span>
                      </button>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/control-plane/performance'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Performance</span>
                        <span className={styles.navDropdownItemDesc}>Metrics & analytics</span>
                      </button>
                    </div>
                    <div className={styles.navDropdownColumn}>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/control-plane/semantics'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Semantics</span>
                        <span className={styles.navDropdownItemDesc}>Semantic analysis</span>
                      </button>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/control-plane/trust'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Trust</span>
                        <span className={styles.navDropdownItemDesc}>Trust verification</span>
                      </button>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/control-plane/governance'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Governance</span>
                        <span className={styles.navDropdownItemDesc}>Policy management</span>
                      </button>
                    </div>
                    <div className={styles.navDropdownColumn}>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/control-plane/security'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Security</span>
                        <span className={styles.navDropdownItemDesc}>Access & protection</span>
                      </button>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/control-plane/compliance'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Compliance</span>
                        <span className={styles.navDropdownItemDesc}>Regulatory reports</span>
                      </button>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/control-plane/business'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Business</span>
                        <span className={styles.navDropdownItemDesc}>Business metrics</span>
                      </button>
                    </div>
                    <div className={styles.navDropdownColumn}>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/control-plane/guided'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Guided Scenarios</span>
                        <span className={styles.navDropdownItemDesc}>Interactive guides</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Developer Tools Dropdown */}
            <div className={styles.navItem}>
              <button 
                className={`${styles.navButton} ${activeDropdown === 'devtools' ? styles.navButtonActive : ''}`}
                onClick={() => setActiveDropdown(activeDropdown === 'devtools' ? null : 'devtools')}
              >
                Developer
                <svg className={styles.navChevron} width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6L8 10L12 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {activeDropdown === 'devtools' && (
                <div className={styles.navDropdown}>
                  <div className={styles.navDropdownGrid}>
                    <div className={styles.navDropdownColumn}>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/state-physics'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>State Physics</span>
                        <span className={styles.navDropdownItemDesc}>Invariant enforcement API</span>
                      </button>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/resonant-memory'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Resonant Memory</span>
                        <span className={styles.navDropdownItemDesc}>AI memory infrastructure</span>
                      </button>
                    </div>
                    <div className={styles.navDropdownColumn}>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/code-visualizer'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Code Visualizer</span>
                        <span className={styles.navDropdownItemDesc}>Codebase analysis</span>
                      </button>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/ide'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Resonant IDE</span>
                        <span className={styles.navDropdownItemDesc}>Open the in-browser IDE</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Network Dropdown - Visible to all, pages redirect to signup if not logged in */}
            <div className={styles.navItem}>
              <button 
                className={`${styles.navButton} ${activeDropdown === 'network' ? styles.navButtonActive : ''}`}
                onClick={() => setActiveDropdown(activeDropdown === 'network' ? null : 'network')}
              >
                Network
                <svg className={styles.navChevron} width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6L8 10L12 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {activeDropdown === 'network' && (
                <div className={styles.navDropdown}>
                  <div className={styles.navDropdownGrid}>
                    <div className={styles.navDropdownColumn}>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/network/marketplace'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>DSID Marketplace</span>
                        <span className={styles.navDropdownItemDesc}>T3 verified agents only</span>
                      </button>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/network/agents'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Agent Browser</span>
                        <span className={styles.navDropdownItemDesc}>Discover agents</span>
                      </button>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/network/publish'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Publish Agent</span>
                        <span className={styles.navDropdownItemDesc}>Share your agents</span>
                      </button>
                    </div>
                    <div className={styles.navDropdownColumn}>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/network/history'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Execution History</span>
                        <span className={styles.navDropdownItemDesc}>View past runs</span>
                      </button>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/network/node'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Node Status</span>
                        <span className={styles.navDropdownItemDesc}>Network node info</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Help Center Dropdown */}
            <div className={styles.navItem}>
              <button 
                className={`${styles.navButton} ${false ? styles.navButtonActive : ''}`}
                onClick={() => setActiveDropdown(false ? null : 'resources')}
              >
                Help Center
                <svg className={styles.navChevron} width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6L8 10L12 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {false && (
                <div className={styles.navDropdown}>
                  <div className={styles.navDropdownGridWide}>
                    <div className={styles.navDropdownColumn}>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/help'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Help Center</span>
                        <span className={styles.navDropdownItemDesc}>Documentation & guides</span>
                      </button>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/help/developers/api-reference'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>API Reference</span>
                        <span className={styles.navDropdownItemDesc}>Technical documentation</span>
                      </button>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/help/getting-started/first-prediction'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Tutorials</span>
                        <span className={styles.navDropdownItemDesc}>Step-by-step guides</span>
                      </button>
                    </div>
                    <div className={styles.navDropdownColumn}>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/help/agents/creating-agents'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Agent Guide</span>
                        <span className={styles.navDropdownItemDesc}>Build AI agents</span>
                      </button>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/help/security/best-practices'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Security Guide</span>
                        <span className={styles.navDropdownItemDesc}>Best practices</span>
                      </button>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/contact'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Contact Support</span>
                        <span className={styles.navDropdownItemDesc}>Get help from our team</span>
                      </button>
                    </div>
                    <div className={styles.navDropdownColumn}>
                      <button className={styles.navDropdownItem} onClick={() => { window.open('https://github.com/louienemesh/ResonantGenesis', '_blank'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>GitHub</span>
                        <span className={styles.navDropdownItemDesc}>Open source & community</span>
                      </button>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/about'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>About Us</span>
                        <span className={styles.navDropdownItemDesc}>Our mission & team</span>
                      </button>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/careers'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Careers</span>
                        <span className={styles.navDropdownItemDesc}>Join our team</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing Link */}
            <button 
              className={styles.navButton}
              onClick={() => goToPricing(navigate)}
            >
              Pricing
            </button>
          </nav>

          {/* AgentOS-specific elements when on /agents page */}
          {/* AgentOS minimal header - search moved to page */}
          
          <div className={styles.actions}>
            <div className={`${styles.actionsRow} ${styles.hoverOnly}`}>
              {isLoggedIn && (
                <button
                  type="button"
                  className={styles.byokCta}
                  onClick={() => navigate('/profile?tab=api-keys')}
                >
                  Add API key
                  <span className={styles.byokArrow} aria-hidden="true">→</span>
                </button>
              )}

              {showChatWidgetButton && onToggleChatWidget && !isResonantChatPage && (
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

              <ThemeToggle />
            </div>

            {isResonantChatPage && (
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
                    <button className={styles.accountMenuItem} onClick={() => { navigate('/dashboard'); setShowAccountMenu(false); }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="2" y="2" width="5" height="5" rx="1" />
                        <rect x="9" y="2" width="5" height="5" rx="1" />
                        <rect x="2" y="9" width="5" height="5" rx="1" />
                        <rect x="9" y="9" width="5" height="5" rx="1" />
                      </svg>
                      Dashboard
                    </button>
                    <button className={styles.accountMenuItem} onClick={() => { navigate('/profile'); setShowAccountMenu(false); }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="8" cy="5" r="3" />
                        <path d="M2 14C2 11 4.5 9 8 9C11.5 9 14 11 14 14" strokeLinecap="round" />
                      </svg>
                      Profile
                    </button>
                    {/* Owner-Only: ML Training Console - Only visible to admin role */}
                    {sessionData?.role === 'admin' && (
                      <button className={`${styles.accountMenuItem} ${styles.accountMenuItemOwner}`} onClick={() => { navigate('/owner/ml-training'); setShowAccountMenu(false); }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M8 2L2 5L8 8L14 5L8 2Z" />
                          <path d="M2 8L8 11L14 8" />
                          <path d="M2 11L8 14L14 11" />
                        </svg>
                        🔒 ML Training
                      </button>
                    )}
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
            ) : (
              // Not Logged In: single login icon button (no text Login/Signup)
              <button
                type="button"
                className={styles.authIconButton}
                onClick={() => goToLogin(navigate)}
                aria-label="Log in"
                title="Log in"
              >
                <svg
                  width="18"
                  height="18"
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
            )}
          </div>
        </div>
      </header>

      {/* Mobile Dropdown Menu - Same navigation as desktop */}
      {false && isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileMenuContent}>
            {/* Solutions */}
            <div className={styles.mobileMenuSection}>
              <div className={styles.mobileMenuSectionTitle}>Solutions</div>
              <button className={styles.mobileMenuItem} onClick={() => { navigate('/resonant-chat'); setIsMobileMenuOpen(false); }}>
                Resonant Chat
              </button>
              <button className={styles.mobileMenuItem} onClick={() => { navigate('/build'); setIsMobileMenuOpen(false); }}>
                Project Builder
              </button>
              <button className={styles.mobileMenuItem} onClick={() => { navigate('/agents'); setIsMobileMenuOpen(false); }}>
                Agent Studio
              </button>
              <button className={styles.mobileMenuItem} onClick={() => { navigate('/agent-teams'); setIsMobileMenuOpen(false); }}>
                Agent Teams
              </button>
              <button className={styles.mobileMenuItem} onClick={() => { navigate('/workflow-designer'); setIsMobileMenuOpen(false); }}>
                Workflow Designer
              </button>
              <button className={styles.mobileMenuItem} onClick={() => { navigate('/marketplace'); setIsMobileMenuOpen(false); }}>
                General Store
              </button>
            </div>

            {/* Control Center */}
            <div className={styles.mobileMenuSection}>
              <div className={styles.mobileMenuSectionTitle}>Control Center</div>
              <button className={styles.mobileMenuItem} onClick={() => { navigate('/control-plane'); setIsMobileMenuOpen(false); }}>
                Overview
              </button>
              <button className={styles.mobileMenuItem} onClick={() => { navigate('/control-plane/live'); setIsMobileMenuOpen(false); }}>
                Live Monitor
              </button>
              <button className={styles.mobileMenuItem} onClick={() => { navigate('/control-plane/performance'); setIsMobileMenuOpen(false); }}>
                Performance
              </button>
              <button className={styles.mobileMenuItem} onClick={() => { navigate('/control-plane/semantics'); setIsMobileMenuOpen(false); }}>
                Semantics
              </button>
              <button className={styles.mobileMenuItem} onClick={() => { navigate('/control-plane/trust'); setIsMobileMenuOpen(false); }}>
                Trust
              </button>
              <button className={styles.mobileMenuItem} onClick={() => { navigate('/control-plane/governance'); setIsMobileMenuOpen(false); }}>
                Governance
              </button>
              <button className={styles.mobileMenuItem} onClick={() => { navigate('/control-plane/security'); setIsMobileMenuOpen(false); }}>
                Security
              </button>
              <button className={styles.mobileMenuItem} onClick={() => { navigate('/control-plane/compliance'); setIsMobileMenuOpen(false); }}>
                Compliance
              </button>
            </div>

            {/* Developer */}
            <div className={styles.mobileMenuSection}>
              <div className={styles.mobileMenuSectionTitle}>Developer</div>
              <button className={styles.mobileMenuItem} onClick={() => { navigate('/state-physics'); setIsMobileMenuOpen(false); }}>
                State Physics
              </button>
              <button className={styles.mobileMenuItem} onClick={() => { navigate('/resonant-memory'); setIsMobileMenuOpen(false); }}>
                Resonant Memory
              </button>
              <button className={styles.mobileMenuItem} onClick={() => { navigate('/code-visualizer'); setIsMobileMenuOpen(false); }}>
                Code Visualizer
              </button>
              <button className={styles.mobileMenuItem} onClick={() => { navigate('/ide'); setIsMobileMenuOpen(false); }}>
                Resonant IDE
              </button>
            </div>

            {/* Network */}
            <div className={styles.mobileMenuSection}>
              <div className={styles.mobileMenuSectionTitle}>Network</div>
              <button className={styles.mobileMenuItem} onClick={() => { navigate('/network/marketplace'); setIsMobileMenuOpen(false); }}>
                DSID Marketplace
              </button>
              <button className={styles.mobileMenuItem} onClick={() => { navigate('/network/agents'); setIsMobileMenuOpen(false); }}>
                Agent Browser
              </button>
              <button className={styles.mobileMenuItem} onClick={() => { navigate('/network/publish'); setIsMobileMenuOpen(false); }}>
                Publish Agent
              </button>
            </div>

            {/* Other Links */}
            <div className={styles.mobileMenuSection}>
              <button className={styles.mobileMenuItem} onClick={() => { navigate('/pricing'); setIsMobileMenuOpen(false); }}>
                Pricing
              </button>
            </div>

            {/* Auth Section */}
            {!isLoggedIn && (
              <div className={styles.mobileMenuAuth}>
                <button className={styles.mobileMenuAuthButton} onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}>
                  Log In
                </button>
                <button className={styles.mobileMenuAuthButtonPrimary} onClick={() => { navigate('/signup'); setIsMobileMenuOpen(false); }}>
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <UnifiedSidebarMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
};

export default Header;

