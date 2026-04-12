import React, { useRef, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import heroTitleStyles from '@/components/ui/HeroTitle.module.css';
import styles from '../HomeNew.module.css';
import { isAuthenticated } from '@/utils/auth-cookies';
import { useThemeStore } from '@/store/themeStore';

interface FloatingCard {
    label: string;
    desc: string;
    bg: string;
    text: string;
    w: number;
    h: number;
    x: number;
    y: number;
    z: number;
    rot: number;
}

const CARDS: FloatingCard[] = [
    { label: 'Code',       desc: 'AI-powered development',  bg: '#121214', text: '#fff', w: 220, h: 150, x: 55, y: 12, z: 80,  rot: -3 },
    { label: '',           desc: '',                         bg: '#FFD800', text: '#121214', w: 130, h: 130, x: 78, y: 8,  z: 140, rot: 4 },
    { label: '',           desc: '',                         bg: '#FAA525', text: '#121214', w: 110, h: 220, x: 55, y: 38, z: 60,  rot: 2 },
    { label: 'Governance', desc: 'On-chain compliance',      bg: '#01A6BC', text: '#fff', w: 240, h: 150, x: 66, y: 42, z: 100, rot: -2 },
    { label: 'Agents',     desc: 'Autonomous workflows',     bg: '#FA547C', text: '#fff', w: 150, h: 150, x: 53, y: 72, z: 120, rot: 3 },
    { label: 'Memory',     desc: 'Persistent knowledge',     bg: '#FFFFFF', text: '#121214', w: 140, h: 130, x: 70, y: 75, z: 50,  rot: -4 },
    { label: '',           desc: '',                         bg: '#71C23E', text: '#121214', w: 110, h: 110, x: 87, y: 70, z: 160, rot: 5 },
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

    const sceneRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number>(0);
    const mouseRef = useRef({ x: 0, y: 0 });

    const animate = useCallback(() => {
        if (!sceneRef.current) return;
        const { x, y } = mouseRef.current;
        const cards = sceneRef.current.querySelectorAll<HTMLElement>('[data-depth]');
        cards.forEach(card => {
            const depth = parseFloat(card.dataset.depth || '1');
            const moveX = x * depth * 40;
            const moveY = y * depth * 25;
            const rotY = x * depth * 6;
            const rotX = -y * depth * 4;
            card.style.transform =
                `translate3d(${moveX}px, ${moveY}px, ${depth * 40}px) rotateY(${rotY}deg) rotateX(${rotX}deg)`;
        });
        rafRef.current = requestAnimationFrame(animate);
    }, []);

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            mouseRef.current = {
                x: (e.clientX / window.innerWidth - 0.5) * 2,
                y: (e.clientY / window.innerHeight - 0.5) * 2,
            };
        };
        window.addEventListener('mousemove', onMove, { passive: true });
        rafRef.current = requestAnimationFrame(animate);
        return () => {
            window.removeEventListener('mousemove', onMove);
            cancelAnimationFrame(rafRef.current);
        };
    }, [animate]);

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

            <div className={styles.heroScene} ref={sceneRef}>
                {CARDS.map((c, i) => (
                    <div
                        key={i}
                        data-depth={((c.z / 160) * 0.8 + 0.2).toFixed(2)}
                        className={styles.fCard}
                        style={{
                            '--fc-bg': c.bg,
                            '--fc-text': c.text,
                            '--fc-w': `${c.w}px`,
                            '--fc-h': `${c.h}px`,
                            '--fc-x': `${c.x}%`,
                            '--fc-y': `${c.y}%`,
                            '--fc-rot': `${c.rot}deg`,
                            '--fc-delay': `${i * 0.12 + 0.15}s`,
                        } as React.CSSProperties}
                    >
                        <div className={styles.fCardShine} />
                        {c.label && (
                            <div className={styles.fCardContent}>
                                <span className={styles.fCardLabel}>{c.label}</span>
                                {c.desc && <span className={styles.fCardDesc}>{c.desc}</span>}
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
