import React, { useState, useEffect, useRef } from 'react';
import styles from '../HomeNew.module.css';

export const ProductShowcaseSection = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    const steps = [
        {
            number: '01',
            title: 'Chat',
            description: 'Describe your project in natural language',
            image: '/images/showcase/step1-chat.png',
        },
        {
            number: '02',
            title: 'Build',
            description: 'Export complete project files',
            image: '/images/showcase/step2-build.png',
        },
        {
            number: '03',
            title: 'AI Agents Workflow',
            description: 'Create and orchestrate AI agent workflows',
            image: '/images/showcase/step3-agentworkflow.png',
        },
        {
            number: '04',
            title: 'AI Teams',
            description: 'Collaborate with AI agent teams',
            image: '/images/showcase/agent4.png',
        },
        {
            number: '05',
            title: 'Sale & Rent',
            description: 'Monetize your agents in the marketplace',
            image: '/images/showcase/step5-marketplace.png',
        },
        {
            number: '06',
            title: 'Own Identity',
            description: 'Give your AI its own sovereign identity',
            image: '/images/showcase/step6-identity.png',
        }
    ];

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setIsVisible(entry.isIntersecting),
            { threshold: 0.2 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % steps.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [isVisible, steps.length]);

    return (
        <section ref={sectionRef} className={styles.showcaseModern}>
            {/* Left: Step Navigation */}
            <div className={styles.showcaseNav}>
                <div className={styles.showcaseNavHeader}>
                    <span className={styles.showcaseNavBadge}>Workflow</span>
                    <h2 className={styles.showcaseNavTitle}>From Idea<br/>to Production</h2>
                </div>
                <div className={styles.showcaseNavSteps}>
                    {steps.map((step, index) => (
                        <button
                            key={index}
                            className={`${styles.showcaseNavStep} ${activeStep === index ? styles.showcaseNavStepActive : ''}`}
                            onClick={() => setActiveStep(index)}
                        >
                            <div className={styles.showcaseNavStepLine}>
                                <div 
                                    className={styles.showcaseNavStepProgress}
                                    style={{ 
                                        height: activeStep === index ? '100%' : index < activeStep ? '100%' : '0%',
                                        transition: activeStep === index ? 'height 4s linear' : 'height 0.3s ease'
                                    }}
                                />
                            </div>
                            <div className={styles.showcaseNavStepContent}>
                                <span className={styles.showcaseNavStepNumber}>{step.number}</span>
                                <span className={styles.showcaseNavStepTitle}>{step.title}</span>
                                {activeStep === index && (
                                    <p className={styles.showcaseNavStepDesc}>{step.description}</p>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Right: Screenshot Display */}
            <div className={styles.showcaseDisplay}>
                <div className={styles.showcaseScreenContent}>
                    {steps.map((step, index) => (
                        <img
                            key={index}
                            src={step.image}
                            alt={step.title}
                            className={`${styles.showcaseScreenImage} ${activeStep === index ? styles.showcaseScreenImageActive : ''}`}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml,' + encodeURIComponent(`
                                    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
                                        <rect fill="#1e293b" width="800" height="500"/>
                                        <text x="400" y="240" text-anchor="middle" fill="#475569" font-family="system-ui" font-size="16">
                                            Step ${index + 1}: ${step.title}
                                        </text>
                                        <text x="400" y="270" text-anchor="middle" fill="#64748b" font-family="system-ui" font-size="13">
                                            Add: step${index + 1}-*.png
                                        </text>
                                    </svg>
                                `);
                            }}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};
