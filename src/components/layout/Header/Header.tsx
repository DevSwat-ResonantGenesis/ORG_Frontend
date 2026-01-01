/**
 * Unified Header Component - Based on HomeNew design
 * Used across entire frontend for consistency
 * Includes global side navigation menu
 * 
 * Now using CSS Modules for scoped styling
 */

import React, { useState, useEffect, useRef } from 'react';
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

interface HeaderProps {
  showLogout?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  showLogout = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(60);
    const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  
  // Use auth-cookies for reliable authentication check
  const sessionData = getSessionData();
  const isLoggedIn = isAuthenticated() && !!sessionData;
  
  // Check if we're on Resonant Chat page
  const isResonantChatPage = location.pathname === '/resonant-chat' || location.pathname.startsWith('/resonant-chat');
  
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
    if (sessionData?.email) {
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
      navigate('/login', { replace: true });
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
      <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}>
        <div className={styles.content}>
          <div 
                  className={styles.logo}
                  onClick={() => goToHome(navigate)}
                >
                  ResonantGenesis
                </div>

          {/* Main Navigation */}
          <nav ref={navRef} className={styles.mainNav}>
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
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/ide'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Resonant IDE</span>
                        <span className={styles.navDropdownItemDesc}>AI coding environment</span>
                      </button>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/agents'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Agents</span>
                        <span className={styles.navDropdownItemDesc}>Agent Console</span>
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
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/agent-templates'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Agent Templates</span>
                        <span className={styles.navDropdownItemDesc}>Pre-built agent templates</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Control Plane Dropdown */}
            <div className={styles.navItem}>
              <button 
                className={`${styles.navButton} ${activeDropdown === 'control' ? styles.navButtonActive : ''}`}
                onClick={() => setActiveDropdown(activeDropdown === 'control' ? null : 'control')}
              >
                Control Plane
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
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/hash-sphere-memory'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Hash Sphere Memory</span>
                        <span className={styles.navDropdownItemDesc}>AI memory infrastructure</span>
                      </button>
                    </div>
                    <div className={styles.navDropdownColumn}>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/code-visualizer'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Code Visualizer</span>
                        <span className={styles.navDropdownItemDesc}>Codebase analysis</span>
                      </button>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/api-keys'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>API Keys</span>
                        <span className={styles.navDropdownItemDesc}>Manage API access</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Decentralized Network Dropdown - Visible to all, pages redirect to signup if not logged in */}
            <div className={styles.navItem}>
              <button 
                className={`${styles.navButton} ${activeDropdown === 'network' ? styles.navButtonActive : ''}`}
                onClick={() => setActiveDropdown(activeDropdown === 'network' ? null : 'network')}
              >
                Decentralized
                <svg className={styles.navChevron} width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6L8 10L12 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {activeDropdown === 'network' && (
                <div className={styles.navDropdown}>
                  <div className={styles.navDropdownGrid}>
                    <div className={styles.navDropdownColumn}>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/network/marketplace'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Marketplace</span>
                        <span className={styles.navDropdownItemDesc}>Browse & deploy agents</span>
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
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/network/workflows'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Workflow Designer</span>
                        <span className={styles.navDropdownItemDesc}>Visual workflow builder</span>
                      </button>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/network/history'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Execution History</span>
                        <span className={styles.navDropdownItemDesc}>View past runs</span>
                      </button>
                      <button className={styles.navDropdownItem} onClick={() => { navigate('/network/templates'); setActiveDropdown(null); }}>
                        <span className={styles.navDropdownItemTitle}>Agent Templates</span>
                        <span className={styles.navDropdownItemDesc}>Pre-built templates</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enterprise Link */}
            <button 
              className={styles.navButton}
              onClick={() => navigate('/enterprise')}
            >
              Enterprise
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
          {location.pathname.startsWith('/agents') && (
            <div className={styles.agentOSSection}>
              <span className={styles.agentOSLabel}>AgentOS</span>
              <div className={styles.agentOSSearch}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <input type="text" placeholder="Search agents, workflows, executions..." />
              </div>
              <div className={styles.agentOSStats}>
                <span className={styles.statDot}></span>
                <span>0 Active</span>
              </div>
              <div className={styles.agentOSTime}>
                {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <button className={styles.agentOSNotif} title="Notifications">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </button>
            </div>
          )}
          
          <div className={styles.actions}>
            {/* Theme Toggle - Always visible */}
            <ThemeToggle />

            {/* Logged In: Show Account Menu */}
            {isLoggedIn ? (
              <div ref={accountRef} className={styles.accountWrapper}>
                <button 
                  className={styles.accountButton}
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  title={sessionData?.email || 'Account'}
                >
                  <div className={styles.accountAvatar}>
                    {getUserInitials()}
                  </div>
                  <svg className={styles.accountChevron} width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 6L8 10L12 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {/* Account Dropdown Menu */}
                {showAccountMenu && (
                  <div className={styles.accountMenu}>
                    <div className={styles.accountMenuHeader}>
                      <div className={styles.accountMenuAvatar}>{getUserInitials()}</div>
                      <div className={styles.accountMenuInfo}>
                        <span className={styles.accountMenuEmail}>{sessionData?.email}</span>
                        <span className={styles.accountMenuRole}>{sessionData?.role || 'User'}</span>
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
    </>
  );
};

export default Header;

