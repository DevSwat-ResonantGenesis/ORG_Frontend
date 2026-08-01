import React from 'react';
import styles from '../HomeNew.module.css';
import { HeroSection } from './HeroSection';
import { isAuthenticated } from '@/utils/auth-cookies';

export const ScrollLanding = () => {
    const isLoggedIn = isAuthenticated();

    if (isLoggedIn) return null;

    return (
        <div className={styles.scrollLandingContainer}>
            {/* Hero Section Only */}
            <section className={styles.heroScrollSection}>
                <HeroSection />
            </section>
        </div>
    );
};
