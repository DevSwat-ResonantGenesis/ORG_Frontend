import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import heroTitleStyles from '@/components/ui/HeroTitle.module.css';
import styles from '../HomeNew.module.css';
import buttonStyles from './HeroButton.module.css';
import { isAuthenticated } from '@/utils/auth-cookies';
import { useThemeStore } from '@/store/themeStore';

interface Slide {
    id: string;
    title: string;
    description: string;
    ctaTitle: string;
    ctaSubtitle: string;
    ctaPrice?: string;
    ctaRoute: string;
    image: string;
    isIntegrations?: boolean;
}

const SLIDES: Slide[] = [
    {
        id: 'resonant-chat',
        title: 'Resonant Chat',
        description: 'A single-interface AI Chat ecosystem. Orchestrates multiple model providers, tools, and agents is the most advanced and trusted chat platform currently available, offering a ton of features and the ability to operate an entire platform through it.',
        ctaTitle: 'Start Free',
        ctaSubtitle: 'Bring your API key provider to unlock all features',
        ctaRoute: '/resonant-memory',
        image: '/images/showcase/resonant-ide-inquiry.png',
    },
    {
        id: 'devswat-ide',
        title: 'DevSwat IDE',
        description: 'AI-powered development environment with intelligent code completion, real-time collaboration, and seamless integration with your existing workflow.',
        ctaTitle: 'Download IDE',
        ctaSubtitle: 'The most advanced AI coding assistant',
        ctaRoute: '/download-ide',
        image: '/images/showcase/visualizer-1.png',
    },
    {
        id: 'build',
        title: 'Build Service',
        description: 'Automated build and deployment pipeline with intelligent caching, parallel execution, and instant rollback capabilities.',
        ctaTitle: 'Get Started',
        ctaSubtitle: 'Streamline your CI/CD pipeline',
        ctaRoute: '/products/ide',
        image: '/images/showcase/step2-build.png',
    },
    {
        id: 'ast',
        title: 'AST',
        description: 'Abstract Syntax Tree analysis for deep code understanding, refactoring suggestions, and security vulnerability detection.',
        ctaTitle: 'Explore',
        ctaSubtitle: 'Deep code understanding',
        ctaRoute: '/products/code-analysis',
        image: '/images/showcase/visualizer-2.png',
    },
    {
        id: 'terminal',
        title: 'Terminal Sandbox',
        description: 'Secure code execution environment with container isolation, resource limits, and comprehensive logging.',
        ctaTitle: 'Try Now',
        ctaSubtitle: 'Run code safely in isolation',
        ctaRoute: '/products/ide',
        image: '/images/showcase/step3-build.png',
    },
    {
        id: 'marketplace',
        title: 'Marketplace',
        description: 'Discover and share AI agents, tools, and integrations with the community. Find the perfect solution for your needs.',
        ctaTitle: 'Browse',
        ctaSubtitle: 'Find the perfect agent for your needs',
        ctaRoute: '/products/ai-agents',
        image: '/images/showcase/step4-ide.png',
    },
    {
        id: 'ast-analyzer',
        title: 'AST Analyzer',
        description: 'Advanced code analysis tools for pattern detection, code smell identification, and automated refactoring recommendations.',
        ctaTitle: 'Analyze',
        ctaSubtitle: 'Get insights into your codebase',
        ctaRoute: '/products/code-analysis',
        image: '/images/showcase/visualizer-3.png',
    },
    {
        id: 'agents',
        title: 'AI Agents',
        description: 'Autonomous AI assistants that can execute complex tasks, make decisions, and learn from interactions.',
        ctaTitle: 'Create Agent',
        ctaSubtitle: 'Build intelligent automation',
        ctaRoute: '/products/ai-agents',
        image: '/images/showcase/agent4.png',
    },
    {
        id: 'agent-teams',
        title: 'Agent Teams',
        description: 'Collaborative AI workflows where multiple agents work together to solve complex problems efficiently.',
        ctaTitle: 'Build Team',
        ctaSubtitle: 'Coordinate multiple agents',
        ctaRoute: '/products/ai-agents',
        image: '/images/showcase/step5-homepage.png',
    },
    {
        id: 'integrations',
        title: 'Integrations',
        description: 'Connect with your favorite tools and services. 200+ integrations available including GitHub, Slack, Notion, and more.',
        ctaTitle: 'Explore',
        ctaSubtitle: '200+ integrations available',
        ctaRoute: '/integrations',
        image: '/images/showcase/integration1.png',
        isIntegrations: true,
    },
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
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (!isPaused) {
            const interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [isPaused]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    const goToPrev = () => {
        setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    };

    const currentSlide = SLIDES[currentIndex];

    if (isLoggedIn) return null;

    return (
        <section className={styles.hero}>
            {/* ===== STANDALONE STYLES — ID selectors = highest CSS specificity possible ===== */}
            <style dangerouslySetInnerHTML={{__html: `
                #hero-title {
                    display: block !important;
                    font-family: 'Abril Fatface', serif !important;
                    font-weight: 400 !important;
                    font-size: 56px !important;
                    line-height: 0.95 !important;
                    color: ${isDark ? '#ffffff' : '#111827'} !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    background: none !important;
                    text-transform: none !important;
                    letter-spacing: normal !important;
                    animation: none !important;
                    opacity: 1 !important;
                    -webkit-text-size-adjust: none !important;
                }
                @media (min-width: 768px)  { #hero-title { font-size: 80px !important; } }
                @media (min-width: 1280px) { #hero-title { font-size: 100px !important; } }

                #hero-subtitle {
                    display: block !important;
                    font-family: 'Work Sans', sans-serif !important;
                    font-weight: 700 !important;
                    font-size: 20px !important;
                    line-height: 1.2 !important;
                    color: ${isDark ? '#ffffff' : '#111827'} !important;
                    margin: 14px 0 0 0 !important;
                    padding: 0 !important;
                    background: none !important;
                    animation: none !important;
                    opacity: 1 !important;
                }
                @media (min-width: 768px)  { #hero-subtitle { font-size: 32px !important; } }
                @media (min-width: 1280px) { #hero-subtitle { font-size: 38px !important; } }

                #hero-cta-btn {
                    display: inline-flex !important;
                    align-items: center !important;
                    gap: 12px !important;
                    margin-top: 32px !important;
                    padding: 20px 28px !important;
                    background: #FFD800 !important;
                    color: #0a0a0c !important;
                    font-family: 'Work Sans', sans-serif !important;
                    font-size: 14px !important;
                    font-weight: 700 !important;
                    letter-spacing: 0.06em !important;
                    text-transform: uppercase !important;
                    border-radius: 14px !important;
                    cursor: pointer !important;
                    border: none !important;
                    outline: none !important;
                    opacity: 1 !important;
                    animation: none !important;
                    transition: background 0.2s ease !important;
                    min-width: 320px !important;
                    max-width: 450px !important;
                }
                #hero-cta-btn * { color: #0a0a0c !important; }
                #hero-cta-btn svg { stroke: #0a0a0c !important; }
                #hero-cta-btn:hover { background: #71C23E !important; color: #ffffff !important; }
                #hero-cta-btn:hover * { color: #ffffff !important; }
                #hero-cta-btn:hover svg { stroke: #ffffff !important; }
            `}} />
            <div className={styles.heroTriangleBlock} data-hero-triangle></div>
            <div 
                className={styles.heroTextBlock} 
                data-hero-textblock
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <h1 id="hero-title">
                    {currentSlide.title}
                </h1>
                <p id="hero-subtitle">{currentSlide.description}</p>
                <button id="hero-cta-btn" onClick={() => navigate(currentSlide.ctaRoute)}>
                    <div className={styles.ctaButtonContent}>
                        <span className={styles.ctaButtonTitle}>{currentSlide.ctaTitle}</span>
                        <span className={styles.ctaButtonSubtitle}>{currentSlide.ctaSubtitle}</span>
                        {currentSlide.ctaPrice && <span className={styles.ctaButtonPrice}>{currentSlide.ctaPrice}</span>}
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
                
                <button 
                    onClick={goToPrev}
                    style={{
                        position: 'absolute',
                        left: '-60px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: isDark ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#ffffff' : '#111827'} strokeWidth="2">
                        <path d="M15 18l-6-6 6-6"/>
                    </svg>
                </button>
                
                <button 
                    onClick={goToNext}
                    style={{
                        position: 'absolute',
                        right: '-60px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: isDark ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#ffffff' : '#111827'} strokeWidth="2">
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                </button>

                <div style={{
                    position: 'absolute',
                    bottom: '-40px',
                    left: '0',
                    display: 'flex',
                    gap: '8px'
                }}>
                    {SLIDES.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: index === currentIndex ? '#FFD800' : (isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'),
                                border: 'none',
                                cursor: 'pointer',
                                transform: index === currentIndex ? 'scale(1.2)' : 'scale(1)',
                                transition: 'all 0.2s ease'
                            }}
                        />
                    ))}
                </div>
            </div>

            <div className={styles.heroBottomBar}>
                <div className={styles.heroBottomSocial}>
                    <a href="https://www.linkedin.com/company/devswat" target="_blank" rel="noopener noreferrer" title="LinkedIn" style={{ color: iconColor, transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = iconHover)} onMouseLeave={e => (e.currentTarget.style.color = iconColor)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    </a>
                    <a href="https://www.youtube.com/@DevSwat" target="_blank" rel="noopener noreferrer" title="YouTube" style={{ color: iconColor, transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = iconHover)} onMouseLeave={e => (e.currentTarget.style.color = iconColor)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    </a>
                    <a href="https://twitter.com/DevSwat" target="_blank" rel="noopener noreferrer" title="Twitter/X" style={{ color: iconColor, transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = iconHover)} onMouseLeave={e => (e.currentTarget.style.color = iconColor)}>
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
                    <span style={{ color: textColor, fontSize: '12px' }}>© 2026 DevSwat Inc. Silicon Valley, CA, USA</span>
                </div>
            </div>
        </section>
    );
};
