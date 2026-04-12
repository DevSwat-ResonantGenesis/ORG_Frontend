import React, { Suspense } from 'react';
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
    const { theme } = useThemeStore();
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
                    color: #ffffff !important;
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
                    color: #ffffff !important;
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
                    gap: 8px !important;
                    margin-top: 32px !important;
                    padding: 14px 36px !important;
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
                }
                #hero-cta-btn * { color: #0a0a0c !important; }
                #hero-cta-btn svg { stroke: #0a0a0c !important; }
                #hero-cta-btn:hover { background: #71C23E !important; color: #ffffff !important; }
                #hero-cta-btn:hover * { color: #ffffff !important; }
                #hero-cta-btn:hover svg { stroke: #ffffff !important; }
            `}} />
            <div className={styles.heroTextBlock}>
                <h1 id="hero-title">
                    Digitalize<br />Your Vision
                </h1>
                <p id="hero-subtitle">Simpler Than Ever</p>
                <button id="hero-cta-btn" onClick={() => navigate('/signup')}>
                    <span>Get Started</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
            </div>

            <Suspense fallback={null}>
                <HeroCards3DScene />
            </Suspense>

            <div className={styles.heroBottomBar}>
                <div className={styles.heroBottomSocial}>
                    <a href="https://www.linkedin.com/company/devswat" target="_blank" rel="noopener noreferrer" title="LinkedIn" style={{ color: iconColor, transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = iconHover)} onMouseLeave={e => (e.currentTarget.style.color = iconColor)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    </a>
                    <a href="https://www.youtube.com/@ResonantGenesis" target="_blank" rel="noopener noreferrer" title="YouTube" style={{ color: iconColor, transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = iconHover)} onMouseLeave={e => (e.currentTarget.style.color = iconColor)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    </a>
                    <a href="https://twitter.com/ResonantGenesis" target="_blank" rel="noopener noreferrer" title="Twitter/X" style={{ color: iconColor, transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = iconHover)} onMouseLeave={e => (e.currentTarget.style.color = iconColor)}>
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
                    <span style={{ color: textColor, fontSize: '12px' }}>© 2026 DevSwat Inc.</span>
                </div>
            </div>
        </section>
    );
};
