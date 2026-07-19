import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProductSlideshow.module.css';

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

export const ProductSlideshow = ({ isDark }: { isDark: boolean }) => {
    const navigate = useNavigate();
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

    return (
        <div 
            className={styles.slideshow}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className={styles.slideContainer}>
                <div className={styles.slideImage}>
                    <img src={currentSlide.image} alt={currentSlide.title} />
                    {currentSlide.isIntegrations && (
                        <div className={styles.integrationsMarquee}>
                            <div className={styles.marqueeContent}>
                                <img src="/images/connect-icons/github.png" alt="GitHub" />
                                <img src="/images/connect-icons/openai.png" alt="OpenAI" />
                                <img src="/images/connect-icons/anthropic.png" alt="Anthropic" />
                                <img src="/images/connect-icons/claude.png" alt="Claude" />
                                <img src="/images/connect-icons/copilot.jpeg" alt="Copilot" />
                                <img src="/images/connect-icons/figma.png" alt="Figma" />
                                <img src="/images/connect-icons/firebase.png" alt="Firebase" />
                                <img src="/images/connect-icons/gitlab.png" alt="GitLab" />
                                <img src="/images/connect-icons/notion.png" alt="Notion" />
                                <img src="/images/connect-icons/slack.png" alt="Slack" />
                                <img src="/images/connect-icons/stripe.png" alt="Stripe" />
                                <img src="/images/connect-icons/supabase.png" alt="Supabase" />
                                <img src="/images/connect-icons/vercel.svg" alt="Vercel" />
                                <img src="/images/connect-icons/zapier.png" alt="Zapier" />
                                <img src="/images/connect-icons/github.png" alt="GitHub" />
                                <img src="/images/connect-icons/openai.png" alt="OpenAI" />
                                <img src="/images/connect-icons/anthropic.png" alt="Anthropic" />
                                <img src="/images/connect-icons/claude.png" alt="Claude" />
                                <img src="/images/connect-icons/copilot.jpeg" alt="Copilot" />
                                <img src="/images/connect-icons/figma.png" alt="Figma" />
                                <img src="/images/connect-icons/firebase.png" alt="Firebase" />
                                <img src="/images/connect-icons/gitlab.png" alt="GitLab" />
                                <img src="/images/connect-icons/notion.png" alt="Notion" />
                                <img src="/images/connect-icons/slack.png" alt="Slack" />
                                <img src="/images/connect-icons/stripe.png" alt="Stripe" />
                                <img src="/images/connect-icons/supabase.png" alt="Supabase" />
                                <img src="/images/connect-icons/vercel.svg" alt="Vercel" />
                                <img src="/images/connect-icons/zapier.png" alt="Zapier" />
                            </div>
                        </div>
                    )}
                </div>
                <div className={styles.slideContent}>
                    <h2 className={styles.slideTitle}>{currentSlide.title}</h2>
                    <p className={styles.slideDescription}>{currentSlide.description}</p>
                    <button 
                        className={styles.ctaButton}
                        onClick={() => navigate(currentSlide.ctaRoute)}
                    >
                        <div className={styles.ctaContent}>
                            <span className={styles.ctaTitle}>{currentSlide.ctaTitle}</span>
                            <span className={styles.ctaSubtitle}>{currentSlide.ctaSubtitle}</span>
                            {currentSlide.ctaPrice && (
                                <span className={styles.ctaPrice}>{currentSlide.ctaPrice}</span>
                            )}
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14"/>
                            <path d="m12 5 7 7-7 7"/>
                        </svg>
                    </button>
                </div>
            </div>
            
            <button className={styles.navButton} style={{ left: '10px' }} onClick={goToPrev}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6"/>
                </svg>
            </button>
            <button className={styles.navButton} style={{ right: '10px' }} onClick={goToNext}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6"/>
                </svg>
            </button>

            <div className={styles.dots}>
                {SLIDES.map((_, index) => (
                    <button
                        key={index}
                        className={`${styles.dot} ${index === currentIndex ? styles.active : ''}`}
                        onClick={() => goToSlide(index)}
                    />
                ))}
            </div>
        </div>
    );
};
