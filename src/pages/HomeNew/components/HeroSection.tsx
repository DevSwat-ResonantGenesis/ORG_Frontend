import React, { Suspense, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import heroTitleStyles from '@/components/ui/HeroTitle.module.css';
import styles from '../HomeNew.module.css';
import { isAuthenticated } from '@/utils/auth-cookies';
import ChatInputBar from '@/components/ResonantChat/ChatInputBar/ChatInputBar';

// Lazy load Vision Pro aesthetic particle sphere
const ThreeParticleSphere = React.lazy(() => import('@/components/features/landing/ThreeParticleSphere'));

export const HeroSection = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [chatInput, setChatInput] = useState('');
    
    useEffect(() => {
        setIsLoggedIn(isAuthenticated());
    }, []);

    return (
        <section className={styles.hero}>
            {/* Parallax Background - Behind Content */}
            <div className={styles.heroParallax} aria-hidden="true">
                <Suspense fallback={<div className={styles.parallaxPlaceholder} />}>
                    <ThreeParticleSphere />
                </Suspense>
            </div>

            <div className={styles.heroContent}>
                <button
                    type="button"
                    className={styles.byokHeroAlert}
                    onClick={() => navigate(isLoggedIn ? '/profile?tab=api-keys' : '/signup')}
                >
                    <span className={styles.byokHeroText}>Bring Your Own Keys to unlock functions</span>
                    <span className={styles.byokHeroArrow}>→</span>
                </button>
                <h1 className={heroTitleStyles.heroTitle}>
                    Own Your Intelligence.
                </h1>
                <p className={heroTitleStyles.heroSubtitle}>
                    The first sovereign AI ecosystem with somatic-magnetic memory. Encrypted, autonomous, and fully self-hosted. No black boxes—just pure control.
                </p>
                
                {/* Hero CTAs - Conditional based on login state */}
                <div className={styles.heroNavLinks}>
                    {!isLoggedIn && (
                        /* Non-logged-in users: Get Started Free */
                        <div className={styles.heroNavRow}>
                            <button className={`${styles.heroNavItem} ${styles.heroNavItemPrimary}`} onClick={() => navigate('/signup')}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                                </svg>
                                <span>Get Started Free</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Resonant Chat Input Bar */}
                <div className={styles.heroChatWrapper}>
                    <ChatInputBar
                        value={chatInput}
                        onChange={setChatInput}
                        onSend={() => {
                            if (chatInput.trim()) {
                                // Store pending message in localStorage for ResonantChatPage to pick up
                                localStorage.setItem('resonant-chat-pending-message', chatInput.trim());
                                // Set flag to use existing chat instead of creating new one
                                localStorage.setItem('resonant-chat-use-existing', 'true');
                                navigate('/resonant-chat');
                            }
                        }}
                        hideProviderSelector={true}
                        voiceInInput={true}
                        voiceIconSize={22}
                        placeholder="Start typing..."
                        isLoading={false}
                        disabled={false}
                    />
                </div>

            </div>
        </section>
    );
};
