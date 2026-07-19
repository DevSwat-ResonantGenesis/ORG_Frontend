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

const AgentsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" />
    <line x1="16" y1="16" x2="16" y2="16" />
  </svg>
);

const PreviewIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const MemoryIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.54" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.54" />
  </svg>
);

const VisualizerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const TerminalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M6 9l4 3-4 3" />
    <path d="M12 15h6" />
  </svg>
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
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [landingChatActive, setLandingChatActive] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const helpMenuRef = useRef<HTMLDivElement>(null);
  
  // Use auth-cookies for reliable authentication check
  const sessionData = getSessionData();
  const isLoggedIn = isAuthenticated() && !!sessionData;
  
  // Check if we're on Resonant Chat page
  const isResonantChatPage = location.pathname === '/' || location.pathname === '/resonant-chat' || location.pathname.startsWith('/resonant-chat') || location.pathname.startsWith('/chat');

  const isLandingPage = location.pathname === '/';

  // Check if we're on Agents page
  const isAgentsPage = location.pathname === '/agents' || location.pathname.startsWith('/agents');

  const [splitViewEnabled, setSplitViewEnabled] = useState(false);
  const [splitViewPane, setSplitViewPane] = useState<SplitViewPane>('chat');
  const [splitViewActiveTab, setSplitViewActiveTab] = useState<string>('agents');
  const [agentsToolbarOpen, setAgentsToolbarOpen] = useState(false);
  const [splitViewMenuOpen, setSplitViewMenuOpen] = useState(false);
  const splitViewMenuRef = useRef<HTMLDivElement>(null);

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

  // The live 'rg:split-view-state' event below is the sole source of truth
  // for splitViewEnabled — ResonantChatPage dispatches it on mount and on
  // every change, so it's always current. This used to ALSO read a stale
  // localStorage flag whenever isResonantChatPage flipped true, which could
  // clobber the correct value with an outdated one from a previous visit
  // (e.g. last time split view happened to be left open), showing the
  // three-dot split-view menu even when the current page has it closed.
  useEffect(() => {
    if (!isResonantChatPage) {
      setSplitViewEnabled(false);
      return;
    }
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ enabled: boolean; pane?: SplitViewPane; activeTab?: string }>).detail;
      if (!detail) return;
      setSplitViewEnabled(!!detail.enabled);
      if (detail.pane) setSplitViewPane(detail.pane);
      if (detail.activeTab) setSplitViewActiveTab(detail.activeTab);
    };
    window.addEventListener('rg:split-view-state', handler as EventListener);
    return () => window.removeEventListener('rg:split-view-state', handler as EventListener);
  }, [isResonantChatPage]);

  const dispatchSplitViewCommand = (detail: SplitViewCommandDetail) => {
    window.dispatchEvent(new CustomEvent('rg:split-view-command', { detail }));
  };

  const handleSplitViewTabClick = (tab: string) => {
    window.dispatchEvent(new CustomEvent('rg:split-view-tab-change', { detail: { tab } }));
    setSplitViewActiveTab(tab);
  };

  // Opens split view straight to a given tab (e.g. "Terminal" in the Coding
  // menu), always via navigate()+query-param — even when already on
  // /resonant-chat. A unique nonce is appended so the URL always actually
  // changes: navigating to an identical URL is a no-op in react-router (no
  // location update, so the effect watching it never re-fires), which is
  // exactly what happened before — clicking Terminal a second time (e.g.
  // after switching to another split-view tab, which never touches the URL)
  // silently did nothing. ResonantChatPage's own splitAutoOpenRequest effect
  // (keyed by a requestId, not a one-shot event) reliably applies this even
  // if SplitViewModule's lazy chunk hasn't finished loading yet, which a
  // same-page CustomEvent dispatch could otherwise race and miss.
  const openSplitViewTab = (tab: string) => {
    navigate(`/resonant-chat?splitTab=${tab}&_t=${Date.now()}`);
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
    setShowHelpMenu(false);
    setSplitViewMenuOpen(false);
  }, [location.pathname]);

  // Close account menu, nav dropdowns, and help menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setShowAccountMenu(false);
      }
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
      if (helpMenuRef.current && !helpMenuRef.current.contains(e.target as Node)) {
        setShowHelpMenu(false);
      }
      if (splitViewMenuRef.current && !splitViewMenuRef.current.contains(e.target as Node)) {
        setSplitViewMenuOpen(false);
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
                  src="/devswat/devswat_logo.png"
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
              src="/devswat/devswat_logo.png"
              alt="DevSwat"
              className={`${styles.logoIcon} ${isMobileViewport ? styles.logoIconHiddenMobile : ''}`}
            />
            {!splitViewEnabled && 'DevSwat'}
          </div>

          {/* Main Navigation - Desktop */}
          <nav ref={navRef} className={`${styles.mainNav} ${styles.hoverOnly}`}>
            {/* Coding Dropdown */}
            <div className={styles.navItem}>
              <button
                className={`${styles.navButton} ${activeDropdown === 'coding' ? styles.navButtonActive : ''}`}
                onClick={() => setActiveDropdown(activeDropdown === 'coding' ? null : 'coding')}
              >
                Coding
                <svg className={styles.navChevron} width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6L8 10L12 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {activeDropdown === 'coding' && (
                <div className={styles.navDropdown}>
                  <div className={styles.navDropdownGridOneRow}>
                    <button className={styles.navDropdownItem} onClick={() => { navigate('/ide'); setActiveDropdown(null); }}>
                      <span className={styles.navDropdownItemTitle}>IDE Cloud</span>
                      <span className={styles.navDropdownItemDesc}>Full in-browser Monaco editor workspace with agentic chat loop &amp; AST code analysis</span>
                    </button>
                    <button className={styles.navDropdownItem} onClick={() => { navigate('/build'); setActiveDropdown(null); }}>
                      <span className={styles.navDropdownItemTitle}>Builder</span>
                      <span className={styles.navDropdownItemDesc}>Server-side Monaco editor for quick edits &amp; scaffolding, no local install required</span>
                    </button>
                    <button className={styles.navDropdownItem} onClick={() => { navigate('/terminal'); setActiveDropdown(null); }}>
                      <span className={styles.navDropdownItemTitle}>Terminal</span>
                      <span className={styles.navDropdownItemDesc}>Real sandboxed shell with Claude Code CLI</span>
                    </button>
                    <button className={styles.navDropdownItem} onClick={() => { navigate('/download-ide'); setActiveDropdown(null); }}>
                      <span className={styles.navDropdownItemTitle}>IDE App</span>
                      <span className={styles.navDropdownItemDesc}>VS Code fork with a built-in AI extension — 71 local tools, agentic chat loop &amp; AST code analysis</span>
                    </button>
                    <button className={styles.navDropdownItem} onClick={() => { navigate('/code-visualizer'); setActiveDropdown(null); }}>
                      <span className={styles.navDropdownItemTitle}>Code Visualizer</span>
                      <span className={styles.navDropdownItemDesc}>Full-stack SAST — scans your codebase, maps dependency graphs, detects vulnerabilities &amp; visualizes architecture</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Agent OS Link */}
            <button
              className={styles.navButton}
              onClick={() => navigate('/agents')}
            >
              Agent OS
            </button>

            {/* Marketplace Link */}
            <button
              className={styles.navButton}
              onClick={() => navigate('/marketplace')}
            >
              Marketplace
            </button>

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
              <a
                href="https://github.com/DevSwat-ResonantGenesis"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.chatWidgetButton}
                title="GitHub"
                aria-label="GitHub"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015-3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </a>

              {/* Help Menu */}
              <div ref={helpMenuRef} className={styles.helpMenuWrapper}>
                <button
                  className={`${styles.chatWidgetButton} ${showHelpMenu ? styles.chatWidgetButtonActive : ''}`}
                  onClick={() => setShowHelpMenu(!showHelpMenu)}
                  title="Help"
                  aria-label="Help"
                  aria-expanded={showHelpMenu}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </button>

                {showHelpMenu && (
                  <div className={styles.helpMenuDropdown}>
                    <button
                      className={styles.helpMenuItem}
                      onClick={() => { navigate('/contact'); setShowHelpMenu(false); }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      Contact Support
                    </button>
                    <button
                      className={styles.helpMenuItem}
                      onClick={() => { navigate('/docs'); setShowHelpMenu(false); }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                      Documentation
                    </button>
                    <button
                      className={styles.helpMenuItem}
                      onClick={() => { navigate('/contact?sales=true'); setShowHelpMenu(false); }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      Contact Sales
                    </button>
                  </div>
                )}
              </div>

              <button
                className={styles.chatWidgetButton}
                onClick={() => navigate('/dashboard?tab=integrations')}
                title="Apps"
                aria-label="Apps"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </button>

            </div>

            {isMobileViewport && !isLoggedIn && isLandingPage && (
              <a
                href="https://github.com/DevSwat-ResonantGenesis"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.chatWidgetButton}
                title="GitHub"
                aria-label="GitHub"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </a>
            )}


            {/* Split View Menu - three-dot trigger only visible when split view is active */}
            {/* On mobile, splitViewEnabled can be true (persisted from a
                previous visit) while the user is actually just looking at
                the plain chat pane (splitViewPane === 'chat') — the menu
                should only show when split content is actually on screen,
                not merely "enabled" in the background. Desktop has no such
                gap: it always shows the split pane whenever enabled. */}
            {isResonantChatPage && isLoggedIn && splitViewEnabled && (!isMobileViewport || splitViewPane !== 'chat') && (
              <div ref={splitViewMenuRef} className={styles.splitViewMenuWrapper}>
                <button
                  className={`${styles.splitViewMenuButton} ${splitViewMenuOpen ? styles.splitViewMenuButtonActive : ''}`}
                  onClick={() => setSplitViewMenuOpen((v) => !v)}
                  title="Split View options"
                  aria-label="Split View options"
                  aria-expanded={splitViewMenuOpen}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="1.75" />
                    <circle cx="12" cy="12" r="1.75" />
                    <circle cx="12" cy="19" r="1.75" />
                  </svg>
                </button>

                {splitViewMenuOpen && (
                  <div className={styles.splitViewMenuDropdown}>
                    <button
                      className={`${styles.splitViewMenuItem} ${splitViewActiveTab === 'agents' ? styles.splitViewMenuItemActive : ''}`}
                      onClick={() => { handleSplitViewTabClick('agents'); setSplitViewMenuOpen(false); }}
                    >
                      <AgentsIcon />
                      Agents OS
                    </button>
                    <button
                      className={`${styles.splitViewMenuItem} ${splitViewActiveTab === 'preview' ? styles.splitViewMenuItemActive : ''}`}
                      onClick={() => { handleSplitViewTabClick('preview'); setSplitViewMenuOpen(false); }}
                    >
                      <PreviewIcon />
                      Preview Code
                    </button>
                    <button
                      className={`${styles.splitViewMenuItem} ${splitViewActiveTab === 'memory' ? styles.splitViewMenuItemActive : ''}`}
                      onClick={() => { handleSplitViewTabClick('memory'); setSplitViewMenuOpen(false); }}
                    >
                      <MemoryIcon />
                      Memory Library
                    </button>
                    <button
                      className={`${styles.splitViewMenuItem} ${splitViewActiveTab === 'visualizer' ? styles.splitViewMenuItemActive : ''}`}
                      onClick={() => { handleSplitViewTabClick('visualizer'); setSplitViewMenuOpen(false); }}
                    >
                      <VisualizerIcon />
                      Code Analyzer
                    </button>
                    <button
                      className={`${styles.splitViewMenuItem} ${splitViewActiveTab === 'terminal' ? styles.splitViewMenuItemActive : ''}`}
                      onClick={() => { handleSplitViewTabClick('terminal'); setSplitViewMenuOpen(false); }}
                    >
                      <TerminalIcon />
                      Terminal
                    </button>

                    {/* Toolbar toggle - visible on agents page or when agents tab is active in split view */}
                    {(splitViewActiveTab === 'agents' || isAgentsPage) && (
                      <>
                        <div className={styles.splitViewMenuDivider} />
                        <button
                          className={`${styles.splitViewMenuItem} ${agentsToolbarOpen ? styles.splitViewMenuItemActive : ''}`}
                          onClick={() => {
                            const newState = !agentsToolbarOpen;
                            setAgentsToolbarOpen(newState);
                            // Use postMessage for iframe communication
                            const agentsIframe = document.querySelector('iframe[src*="embed=1"]') as HTMLIFrameElement;
                            if (agentsIframe?.contentWindow) {
                              agentsIframe.contentWindow.postMessage({ type: 'agentos:agents:toggleToolbar', open: newState }, '*');
                            }
                            // Also dispatch custom event for non-iframe case
                            window.dispatchEvent(new CustomEvent('agentos:agents:toggleToolbar', { detail: { open: newState } }));
                            setSplitViewMenuOpen(false);
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                          </svg>
                          {agentsToolbarOpen ? 'Hide toolbar' : 'Show toolbar'}
                        </button>
                      </>
                    )}

                    <div className={styles.splitViewMenuDivider} />
                    <button
                      className={styles.splitViewMenuItem}
                      onClick={() => { window.open('/agents?embed=1', '_blank'); setSplitViewMenuOpen(false); }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                      </svg>
                      Open in full screen
                    </button>
                    <button
                      className={styles.splitViewMenuItem}
                      onClick={() => { handleSplitViewToggleClick(); setSplitViewMenuOpen(false); }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      Close split view
                    </button>
                  </div>
                )}
              </div>
            )}

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
                      navigate('/dashboard?tab=profile');
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

