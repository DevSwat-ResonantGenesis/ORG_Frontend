import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../HomeNew.module.css';
import { isAuthenticated } from '@/utils/auth-cookies';

export const CTASection = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    useEffect(() => {
        setIsLoggedIn(isAuthenticated());
    }, []);

    return (
        <section className={styles.ctaSection}>
            <div className={styles.ctaSectionContent}>
                <h2 className={styles.ctaTitle}>
                    {isLoggedIn ? 'Continue Building with AI' : 'Join the Future of Governed AI'}
                </h2>
                <p className={styles.ctaDescription}>
                    {isLoggedIn 
                        ? 'Your AI workspace is ready. Start chatting, create agents, and build powerful automations.'
                        : 'Be among the first builders on the only AI platform with cryptographic verification, real-time governance, and enterprise-grade compliance.'
                    }
                </p>
                <div className={styles.ctaButtons}>
                    {isLoggedIn ? (
                        <button
                            className={styles.ctaPrimaryButton}
                            onClick={() => navigate('/dashboard')}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                            </svg>
                            Go to Dashboard
                        </button>
                    ) : (
                        <button
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '16px 32px',
                                background: 'transparent',
                                color: '#0ea5e9',
                                border: '2px solid #0ea5e9',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onClick={() => navigate('/signup')}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                            </svg>
                            Start Building Free
                        </button>
                    )}
                    <button
                        className={styles.ctaSecondaryButton}
                        onClick={() => navigate('/contact')}
                    >
                        Schedule Demo
                    </button>
                </div>
                {!isLoggedIn && (
                    <p className={styles.ctaNote}>
                        ✓ Free tier forever  ✓ No credit card required  ✓ Instant access
                    </p>
                )}
            </div>
        </section>
    );
};
