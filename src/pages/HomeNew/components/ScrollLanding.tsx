import React from 'react';
import styles from '../HomeNew.module.css';
import { HeroSection } from './HeroSection';
import { HeroCards3DScene } from './HeroCards3D';
import { VideoSection } from './VideoSection';
import { isAuthenticated } from '@/utils/auth-cookies';
import { useThemeStore } from '@/store/themeStore';

export const ScrollLanding = () => {
    const isLoggedIn = isAuthenticated();

    if (isLoggedIn) return null;

    const backgroundImages = [
        '/1.svg',
        '/2.svg',
        '/3.svg',
        '/4.svg',
        '/5.svg'
    ];

    const mobileBackgroundImages = [
        '/1mobile.svg',
        '/2mobile.svg',
        '/3mobile.svg',
        '/4mobile.svg',
        '/5mobile.svg'
    ];

    return (
        <div className={styles.scrollLandingContainer}>
            {/* Section 0: Original Hero - UNCHANGED */}
            <section className={styles.heroScrollSection}>
                <HeroSection />
            </section>

            {/* Section 1: Hero duplicate with background */}
            <section 
                className={styles.heroScrollSection}
                style={{ 
                    backgroundImage: `url(${backgroundImages[0]})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                {/* Empty section - just background image */}
            </section>

            {/* NEW: Video Section between section 1 and 2 */}
            <VideoSection />

            {/* Sections 2-4: Hero duplicates WITHOUT title, CTA, and 3D cards */}
            {[2, 3, 4].map((index) => (
                <section 
                    key={index}
                    className={styles.heroScrollSection}
                    style={{ 
                        backgroundImage: `url(${backgroundImages[index - 1]})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                >
                    {/* Empty section - just background image */}
                </section>
            ))}

            {/* Section 5: Only 3D cards with background */}
            <section 
                className={styles.heroScrollSection}
                style={{ 
                    backgroundImage: `url(${backgroundImages[4]})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    position: 'relative'
                }}
            >
                <section className={styles.hero} style={{ background: 'transparent', position: 'relative', zIndex: 10 }}>
                    <HeroCards3DScene isDark={useThemeStore().theme === 'dark'} />
                </section>
            </section>
        </div>
    );
};
