import React, { useRef, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import heroTitleStyles from '@/components/ui/HeroTitle.module.css';
import styles from '../HomeNew.module.css';
import { isAuthenticated } from '@/utils/auth-cookies';
import { useThemeStore } from '@/store/themeStore';

interface CardDef {
    label: string;
    desc: string;
    tint: string;
    glow: string;
    text: string;
    /* position & size in 3D scene (px) */
    x: number; y: number; w: number; h: number; z: number;
    /* chaos offsets for fall animation */
    cx: number; crx: number; cry: number; crz: number;
}

const CARDS: CardDef[] = [
    { label: 'Code',       desc: 'AI-powered development', tint: 'rgba(18,18,20,0.75)',    glow: 'rgba(255,255,255,0.05)', text: '#fff',    x: 0,   y: 0,   w: 295, h: 155, z: -30,  cx: -80,  crx: 30,  cry: -20, crz: 12 },
    { label: '',           desc: '',                        tint: 'rgba(255,216,0,0.65)',    glow: 'rgba(255,216,0,0.18)',   text: '#121214', x: 303, y: 0,   w: 195, h: 155, z: 45,   cx: 100,  crx: -25, cry: 28,  crz: -10 },
    { label: '',           desc: '',                        tint: 'rgba(250,165,37,0.65)',   glow: 'rgba(250,165,37,0.15)', text: '#121214', x: 0,   y: 163, w: 145, h: 305, z: 20,   cx: -50,  crx: 38,  cry: -16, crz: 8 },
    { label: 'Governance', desc: 'On-chain compliance',     tint: 'rgba(1,166,188,0.65)',    glow: 'rgba(1,166,188,0.16)', text: '#fff',    x: 153, y: 163, w: 240, h: 147, z: -55,  cx: 75,   crx: -20, cry: 22,  crz: -15 },
    { label: 'Agents',     desc: 'Autonomous workflows',    tint: 'rgba(250,84,124,0.60)',   glow: 'rgba(250,84,124,0.14)', text: '#fff',    x: 153, y: 318, w: 145, h: 150, z: 35,   cx: -65,  crx: 28,  cry: -25, crz: 18 },
    { label: 'Memory',     desc: 'Persistent knowledge',    tint: 'rgba(255,255,255,0.55)',  glow: 'rgba(255,255,255,0.08)', text: '#121214', x: 401, y: 163, w: 97,  h: 305, z: -65,  cx: 90,   crx: -32, cry: 18,  crz: -12 },
    { label: '',           desc: '',                        tint: 'rgba(113,194,62,0.60)',   glow: 'rgba(113,194,62,0.14)', text: '#121214', x: 306, y: 318, w: 87,  h: 150, z: 55,   cx: -35,  crx: 22,  cry: -30, crz: 20 },
];

export const HeroSection = () => {
    const navigate = useNavigate();
    const isLoggedIn = isAuthenticated();
    const { theme } = useThemeStore();
    const isDark = theme === 'dark';
    const iconColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)';
    const iconHover = isDark ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)';
    const textColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)';
    const textDim = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)';

    const mosaicRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number>(0);
    const mouseTarget = useRef({ x: 0, y: 0 });
    const mouseLerp = useRef({ x: 0, y: 0 });
    const readyRef = useRef(false);

    useEffect(() => {
        const t = setTimeout(() => { readyRef.current = true; }, 2200);
        return () => clearTimeout(t);
    }, []);

    const tick = useCallback(() => {
        if (mosaicRef.current && readyRef.current) {
            mouseLerp.current.x += (mouseTarget.current.x - mouseLerp.current.x) * 0.04;
            mouseLerp.current.y += (mouseTarget.current.y - mouseLerp.current.y) * 0.04;
            const { x, y } = mouseLerp.current;
            /* Rotate entire scene — perspective does the rest */
            mosaicRef.current.style.transform =
                `translateY(-50%) perspective(900px) rotateX(${-y * 8}deg) rotateY(${x * 10}deg)`;
        }
        rafRef.current = requestAnimationFrame(tick);
    }, []);

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            mouseTarget.current = {
                x: (e.clientX / window.innerWidth - 0.5) * 2,
                y: (e.clientY / window.innerHeight - 0.5) * 2,
            };
        };
        window.addEventListener('mousemove', onMove, { passive: true });
        rafRef.current = requestAnimationFrame(tick);
        return () => {
            window.removeEventListener('mousemove', onMove);
            cancelAnimationFrame(rafRef.current);
        };
    }, [tick]);

    if (isLoggedIn) return null;

    return (
        <section className={styles.hero}>
            <div className={styles.heroTextBlock}>
                <h1 className={heroTitleStyles.heroTitle}>
                    Digitalize<br />Your Vision
                </h1>
                <p className={heroTitleStyles.heroTitleTagline}>Simpler Than Ever</p>
                <button className={styles.heroCtaFuturistic} onClick={() => navigate('/signup')}>
                    <span className={styles.heroCtaText}>Get Started</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
            </div>

            <div className={styles.heroMosaic} ref={mosaicRef}>
                <div className={styles.mosaicGlow} />
                {CARDS.map((c, i) => (
                    <div
                        key={i}
                        className={styles.mCard}
                        style={{
                            '--card-x': `${c.x}px`,
                            '--card-y': `${c.y}px`,
                            '--card-w': `${c.w}px`,
                            '--card-h': `${c.h}px`,
                            '--card-z': `${c.z}px`,
                            '--mc-tint': c.tint,
                            '--mc-glow': c.glow,
                            '--mc-text': c.text,
                            '--cx': `${c.cx}px`,
                            '--crx': `${c.crx}deg`,
                            '--cry': `${c.cry}deg`,
                            '--crz': `${c.crz}deg`,
                            '--fall-delay': `${i * 0.18 + 0.15}s`,
                        } as React.CSSProperties}
                    >
                        <div className={styles.mCardShine} />
                        {c.label && (
                            <div className={styles.mCardBody}>
                                <span className={styles.mCardLabel}>{c.label}</span>
                                {c.desc && <span className={styles.mCardDesc}>{c.desc}</span>}
                            </div>
                        )}
                    </div>
                ))}
            </div>

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
