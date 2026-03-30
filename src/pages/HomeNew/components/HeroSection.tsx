import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import heroTitleStyles from '@/components/ui/HeroTitle.module.css';
import styles from '../HomeNew.module.css';
import { isAuthenticated } from '@/utils/auth-cookies';

// Lazy load particle sphere — used as nebula trace background
const ThreeParticleSphere = React.lazy(() => import('@/components/features/landing/ThreeParticleSphere'));

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
                    From agent factory to code-execution IDE. One ecosystem with unified cross-reasoning retrieval memory. All yours.
                </p>

                <button
                    className={styles.heroCta}
                    onClick={() => navigate('/signup')}
                >
                    Get Started
                </button>
            </div>
        </section>
    );
};
