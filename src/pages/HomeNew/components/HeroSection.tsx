import React, { Suspense, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import heroTitleStyles from '@/components/ui/HeroTitle.module.css';
import styles from '../HomeNew.module.css';
import { isAuthenticated } from '@/utils/auth-cookies';

// Lazy load particle sphere — used as nebula trace background
const ThreeParticleSphere = React.lazy(() => import('@/components/features/landing/ThreeParticleSphere'));

export const HeroSection = () => {
    const navigate = useNavigate();
    const isLoggedIn = isAuthenticated();
    const btnRef = useRef<HTMLButtonElement>(null);
    const heroRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (isLoggedIn) return;
        const hero = heroRef.current;
        const btn = btnRef.current;
        if (!hero || !btn) return;

        const onMove = (e: MouseEvent) => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const x = (e.clientX / w - 0.5) * 2;
            const y = (e.clientY / h - 0.5) * 2;
            btn.style.transform = `perspective(600px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateZ(6px)`;

            const rect = btn.getBoundingClientRect();
            const glowX = ((e.clientX - rect.left) / rect.width) * 100;
            const glowY = ((e.clientY - rect.top) / rect.height) * 100;
            btn.style.setProperty('--glow-x', `${glowX}%`);
            btn.style.setProperty('--glow-y', `${glowY}%`);
        };

        const onLeave = () => {
            btn.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) translateZ(0px)';
        };

        hero.addEventListener('mousemove', onMove);
        hero.addEventListener('mouseleave', onLeave);
        return () => {
            hero.removeEventListener('mousemove', onMove);
            hero.removeEventListener('mouseleave', onLeave);
        };
    }, [isLoggedIn]);

    if (isLoggedIn) return null;

    const isReactSnap = typeof navigator !== 'undefined' && navigator.userAgent === 'ReactSnap';

    return (
        <section ref={heroRef} className={styles.hero}>
            {/* Nebula trace — particle sphere behind content */}
            <div className={styles.heroParallax} aria-hidden="true">
                <Suspense fallback={<div className={styles.parallaxPlaceholder} />}>
                    <div className={styles.heroParallaxInner}>
                        {isReactSnap ? <div className={styles.parallaxPlaceholder} /> : <ThreeParticleSphere />}
                    </div>
                </Suspense>
            </div>

            {/* Centered content */}
            <div className={styles.heroContent}>
                <h1 className={heroTitleStyles.heroTitle}>
                    Own Your Intelligence.
                    <span className={heroTitleStyles.heroTitleTagline}>
                        Simple as never before
                    </span>
                </h1>

                <p className={heroTitleStyles.heroSubtitle}>
                    code, create, connect, deploy, govern &amp; monetize
                </p>

                <p className={heroTitleStyles.heroSubtitleSecondary}>
                    Build AI agents and projects with blockchain identity, enforced governance on every action, and a full economic layer built in.
                    From agent factory to code-execution IDE. One ecosystem with unified cross-reasoning retrieval memory. All yours.
                </p>

                <button
                    ref={btnRef}
                    className={styles.heroCtaFuturistic}
                    onClick={() => navigate('/signup')}
                >
                    <span className={styles.heroCtaScanline} />
                    <span className={styles.heroCtaBorderGlow} />
                    <span className={styles.heroCtaText}>Get Started</span>
                </button>
            </div>
        </section>
    );
};
