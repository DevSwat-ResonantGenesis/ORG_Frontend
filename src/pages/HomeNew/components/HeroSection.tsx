import React, { Suspense, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import heroTitleStyles from '@/components/ui/HeroTitle.module.css';
import styles from '../HomeNew.module.css';
import { isAuthenticated } from '@/utils/auth-cookies';

// Lazy load particle sphere — used as nebula trace background
const ThreeParticleSphere = React.lazy(() => import('@/components/features/landing/ThreeParticleSphere'));

const FuturisticButton = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => {
    const btnRef = useRef<HTMLButtonElement>(null);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        const btn = btnRef.current;
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        btn.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateZ(4px)`;
        btn.style.setProperty('--glow-x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
        btn.style.setProperty('--glow-y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
    }, []);

    const handleMouseLeave = useCallback(() => {
        const btn = btnRef.current;
        if (!btn) return;
        btn.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) translateZ(0px)';
    }, []);

    return (
        <button
            ref={btnRef}
            className={styles.heroCtaFuturistic}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <span className={styles.heroCtaScanline} />
            <span className={styles.heroCtaBorderGlow} />
            <span className={styles.heroCtaText}>{children}</span>
        </button>
    );
};

export const HeroSection = () => {
    const navigate = useNavigate();
    const isLoggedIn = isAuthenticated();
    if (isLoggedIn) return null;

    const isReactSnap = typeof navigator !== 'undefined' && navigator.userAgent === 'ReactSnap';

    return (
        <section className={styles.hero}>
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

                <FuturisticButton onClick={() => navigate('/signup')}>
                    Get Started
                </FuturisticButton>
            </div>
        </section>
    );
};
