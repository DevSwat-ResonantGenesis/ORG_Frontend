import React, { Suspense, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import heroTitleStyles from '@/components/ui/HeroTitle.module.css';
import styles from '../HomeNew.module.css';
import { isAuthenticated } from '@/utils/auth-cookies';

// Lazy load Vision Pro aesthetic particle sphere
const ThreeParticleSphere = React.lazy(() => import('@/components/features/landing/ThreeParticleSphere'));

export const HeroSection = () => {
    const navigate = useNavigate();
    const isLoggedIn = isAuthenticated();
    const [query, setQuery] = useState('');
    if (isLoggedIn) return null;

    const handleChatSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = query.trim();
        navigate(trimmed ? `/chat?q=${encodeURIComponent(trimmed)}` : '/chat');
    };

    const isReactSnap = typeof navigator !== 'undefined' && navigator.userAgent === 'ReactSnap';

    return (
        <section className={styles.hero}>
            {/* Parallax Background - Behind Content */}
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
                    
                    {/* Hero CTAs - Conditional based on login state */}
                    <div className={styles.heroNavLinks}>
                        <div className={styles.heroNavRow}>
                            <button className={`${styles.heroNavItem} ${styles.heroNavItemPrimary}`} onClick={() => navigate('/signup')}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                                </svg>
                                <span>Get Started</span>
                            </button>
                        </div>
                    </div>
                    {/* Chat Input Bar */}
                    <form className={styles.heroChatBar} onSubmit={handleChatSubmit}>
                        <input
                            className={styles.heroChatInput}
                            type="text"
                            placeholder="Ask anything — try the AI assistant..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoComplete="off"
                        />
                        <button type="submit" className={styles.heroChatSend} aria-label="Send">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </button>
                    </form>
                    <div className={styles.heroChatHint}>Guest mode · 3 tools · Low-reasoning model</div>
                </div>
            </div>
        </section>
    );
};
