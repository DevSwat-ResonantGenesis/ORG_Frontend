import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import heroTitleStyles from '@/components/ui/HeroTitle.module.css';
import styles from '../HomeNew.module.css';
import buttonStyles from './HeroButton.module.css';
import { isAuthenticated } from '@/utils/auth-cookies';
import { useThemeStore } from '@/store/themeStore';
import { HeroCards3DScene } from './HeroCards3D';

export const HeroSection = () => {
    const navigate = useNavigate();
    const isLoggedIn = isAuthenticated();
    const { theme, toggleTheme } = useThemeStore();
    const isDark = theme === 'dark';
    const iconColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)';
    const iconHover = isDark ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)';
    const textColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)';
    const textDim = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)';

    if (isLoggedIn) return null;

    return (
        <section className={styles.hero}>
            {/* ===== STANDALONE STYLES — ID selectors = highest CSS specificity possible ===== */}
            <style dangerouslySetInnerHTML={{__html: `
                #hero-title {
                    display: block !important;
                    font-family: 'Abril Fatface', serif !important;
                    font-weight: 400 !important;
                    font-size: 56px !important;
                    line-height: 0.95 !important;
                    color: ${isDark ? '#ffffff' : '#111827'} !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    background: none !important;
                    text-transform: none !important;
                    letter-spacing: normal !important;
                    animation: none !important;
                    opacity: 1 !important;
                    -webkit-text-size-adjust: none !important;
                }
                @media (min-width: 768px)  { #hero-title { font-size: 80px !important; } }
                @media (min-width: 1280px) { #hero-title { font-size: 100px !important; } }

                #hero-subtitle {
                    display: block !important;
                    font-family: 'Work Sans', sans-serif !important;
                    font-weight: 700 !important;
                    font-size: 20px !important;
                    line-height: 1.2 !important;
                    color: ${isDark ? '#ffffff' : '#111827'} !important;
                    margin: 14px 0 0 0 !important;
                    padding: 0 !important;
                    background: none !important;
                    animation: none !important;
                    opacity: 1 !important;
                }
                @media (min-width: 768px)  { #hero-subtitle { font-size: 32px !important; } }
                @media (min-width: 1280px) { #hero-subtitle { font-size: 38px !important; } }

                #hero-cta-btn {
                    display: inline-flex !important;
                    align-items: center !important;
                    gap: 12px !important;
                    margin-top: 32px !important;
                    padding: 20px 28px !important;
                    background: #FFD800 !important;
                    color: #0a0a0c !important;
                    font-family: 'Work Sans', sans-serif !important;
                    font-size: 14px !important;
                    font-weight: 700 !important;
                    letter-spacing: 0.06em !important;
                    text-transform: uppercase !important;
                    border-radius: 14px !important;
                    cursor: pointer !important;
                    border: none !important;
                    outline: none !important;
                    opacity: 1 !important;
                    animation: none !important;
                    transition: background 0.2s ease !important;
                    min-width: 320px !important;
                    max-width: 450px !important;
                }
                #hero-cta-btn * { color: #0a0a0c !important; }
                #hero-cta-btn svg { stroke: #0a0a0c !important; }
                #hero-cta-btn:hover { background: #71C23E !important; color: #ffffff !important; }
                #hero-cta-btn:hover * { color: #ffffff !important; }
                #hero-cta-btn:hover svg { stroke: #ffffff !important; }
            `}} />
            <div className={styles.heroTriangleBlock} data-hero-triangle></div>
            <div className={styles.heroTextBlock} data-hero-textblock>
                <h1 id="hero-title">
                    Digitalize<br />Your Vision
                </h1>
                <p id="hero-subtitle">Simpler Than Ever</p>
                <button id="hero-cta-btn" onClick={() => navigate('/consulting-workshop/intake')}>
                    <div className={styles.ctaButtonContent}>
                        <span className={styles.ctaButtonTitle}>Product & Architecture Discovery Consulting Workshop</span>
                        <span className={styles.ctaButtonSubtitle}>1st Week: Technical Pre-Research & Analysis → 2nd Week: High-Intensity Sprint Workshop with Your Team → Next 30 Days: Dedicated Engineering Advisory Support.</span>
                        <span className={styles.ctaButtonPrice}>Price: $24,500</span>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
            </div>

            <HeroCards3DScene isDark={isDark} />

            <div className={styles.heroBottomBar}>
                <div className={styles.heroBottomSocial}>
                    <a href="https://github.com/DevSwat-ResonantGenesis" target="_blank" rel="noopener noreferrer" title="GitHub" style={{ color: iconColor, transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = iconHover)} onMouseLeave={e => (e.currentTarget.style.color = iconColor)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                    </a>
                    <button onClick={toggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} style={{ color: iconColor, transition: 'color 0.2s', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onMouseEnter={e => (e.currentTarget.style.color = iconHover)} onMouseLeave={e => (e.currentTarget.style.color = iconColor)}>
                        {theme === 'dark' ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="5" />
                                <line x1="12" y1="1" x2="12" y2="3" />
                                <line x1="12" y1="21" x2="12" y2="23" />
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                <line x1="1" y1="12" x2="3" y2="12" />
                                <line x1="21" y1="12" x2="23" y2="12" />
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                            </svg>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                            </svg>
                        )}
                    </button>
                    <a href="/help" title="Help" style={{ color: iconColor, transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = iconHover)} onMouseLeave={e => (e.currentTarget.style.color = iconColor)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    </a>
                    <a href="https://www.linkedin.com/company/devswat" target="_blank" rel="noopener noreferrer" title="LinkedIn" style={{ color: iconColor, transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = iconHover)} onMouseLeave={e => (e.currentTarget.style.color = iconColor)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    </a>
                    <a href="https://www.youtube.com/@DevSwat" target="_blank" rel="noopener noreferrer" title="YouTube" style={{ color: iconColor, transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = iconHover)} onMouseLeave={e => (e.currentTarget.style.color = iconColor)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    </a>
                    <a href="https://twitter.com/DevSwat" target="_blank" rel="noopener noreferrer" title="Twitter/X" style={{ color: iconColor, transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = iconHover)} onMouseLeave={e => (e.currentTarget.style.color = iconColor)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                    <a href="mailto:info@dev-swat.com" title="Email" style={{ color: iconColor, transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = iconHover)} onMouseLeave={e => (e.currentTarget.style.color = iconColor)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    </a>
                </div>
                <div className={styles.heroBottomLinks}>
                    <Link to="/privacy-policy" style={{ color: textColor, textDecoration: 'none', fontSize: '12px', transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = iconHover)} onMouseLeave={e => (e.currentTarget.style.color = textColor)}>Privacy</Link>
                    <Link to="/terms-of-service" style={{ color: textColor, textDecoration: 'none', fontSize: '12px', transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = iconHover)} onMouseLeave={e => (e.currentTarget.style.color = textColor)}>Terms</Link>
                    <span style={{ color: textDim, fontSize: '12px' }}>·</span>
                    <span style={{ color: textColor, fontSize: '12px' }}>© 2026 DevSwat Inc. Silicon Valley, CA, USA</span>
                </div>
            </div>
        </section>
    );
};
