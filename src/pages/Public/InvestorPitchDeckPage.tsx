import React, { Suspense, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import heroTitleStyles from '@/components/ui/HeroTitle.module.css';
import styles from '@/pages/HomeNew/HomeNew.module.css';

const ThreeParticleSphere = React.lazy(() => import('@/components/features/landing/ThreeParticleSphere'));

const InvestorPitchDeckPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const isReactSnap = typeof navigator !== 'undefined' && navigator.userAgent === 'ReactSnap';

  return (
    <div className={styles.page}>
      <Helmet>
        <title>Investor Pitch Deck – ResonantGenesis</title>
        <meta
          name="description"
          content="Investor Pitch Deck for ResonantGenesis."
        />
        <link rel="canonical" href="https://resonantgenesis.xyz/investor-pitch-deck" />
      </Helmet>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroParallax} aria-hidden="true">
            <Suspense fallback={<div className={styles.parallaxPlaceholder} />}>
              <div className={styles.heroParallaxInner}>
                {isReactSnap ? <div className={styles.parallaxPlaceholder} /> : <ThreeParticleSphere />}
              </div>
            </Suspense>
          </div>

          <div className={styles.heroContent}>
            <div className={styles.heroIntro}>
              <button
                type="button"
                className={styles.byokHeroAlert}
                onClick={() => navigate('/signup')}
              >
                <span className={styles.byokHeroText}>Bring Your Own Keys to unlock functions</span>
                <span className={styles.byokHeroArrow}>→ Create or Bring your AI Agents</span>
              </button>

              <h1 className={heroTitleStyles.heroTitle}>
                Own Your Intelligence.
                <span className={heroTitleStyles.heroTitleTagline}>
                  Your AI that you can trust now !
                </span>
              </h1>
              <p className={heroTitleStyles.heroSubtitle}>
                The first sovereign AI ecosystem with Resonant memory. Encrypted, autonomous, and fully self-hosted. No black boxes—just pure governed enforced control with decentralized logging.
              </p>

              <div className={styles.heroNavLinks}>
                <div className={styles.heroNavRow}>
                  <button
                    className={`${styles.heroNavItem} ${styles.heroNavItemPrimary}`}
                    onClick={() => navigate('/signup')}
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
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                    <span>Get Started Free</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default InvestorPitchDeckPage;
