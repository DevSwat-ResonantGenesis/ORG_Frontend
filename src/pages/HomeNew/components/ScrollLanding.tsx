import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../HomeNew.module.css';
import aboutStyles from '../../Public/AboutPage.module.css';
import { HeroSection } from './HeroSection';
import { isAuthenticated } from '@/utils/auth-cookies';
import { ArrowRight, Twitter, Linkedin, Github, Youtube } from 'lucide-react';

export const ScrollLanding = () => {
    const isLoggedIn = isAuthenticated();
    const navigate = useNavigate();

    if (isLoggedIn) return null;

    return (
        <div className={styles.scrollLandingContainer}>
            {/* Hero Section */}
            <section className={styles.heroScrollSection}>
                <HeroSection />
                <div style={{ height: '100px' }}></div>
            </section>

            {/* Section 1 - AI Infrastructure */}
            <section className={aboutStyles.aiSection}>
                <h2>AI is no longer just about powerful LLMs—it's about the infrastructure they are connected to.</h2>
            </section>

            {/* Section 2 - Main Focus */}
            <section className={aboutStyles.focusSection}>
                <h2>Main Focus</h2>
                <div className={aboutStyles.focusGrid}>
                    <div className={aboutStyles.focusCard}>
                        <h3>Support Services</h3>
                        <p>Comprehensive support infrastructure for deploying and managing AI agents at scale.</p>
                    </div>
                    <div className={aboutStyles.focusCard}>
                        <h3>Governmental Services</h3>
                        <p>Compliance-ready solutions for public sector organizations with strict governance requirements.</p>
                    </div>
                    <div className={aboutStyles.focusCard}>
                        <h3>Healthcare Services</h3>
                        <p>Secure, HIPAA-compliant AI workflows for medical applications and patient data processing.</p>
                    </div>
                    <div className={aboutStyles.focusCard}>
                        <h3>Education Services</h3>
                        <p>AI-powered tools for educational institutions, from personalized learning to administrative automation.</p>
                    </div>
                </div>
            </section>

            {/* Section 3 - Summary */}
            <section className={aboutStyles.summarySection}>
                <h2>Summary Of What We Do</h2>
                <p className={aboutStyles.summaryIntro}>
                    DevSwat is an AI-native infrastructure platform for building, orchestrating, and deploying autonomous 
                    software agents and digital products. Our system combines multi-agent orchestration, governed execution, 
                    memory-aware workflows, and developer tooling so users can move from idea to working product faster.
                </p>
                
                <h2>Key Digital Solutions We Provide As Agentic AI Infrastructure</h2>
                <div className={aboutStyles.summaryGrid}>
                    <div className={aboutStyles.summaryCard}>
                        <h3>Resonant Chat</h3>
                        <p>Is the command center for interacting with the platform, coordinating agents, triggering workflows, and accessing tools from one interface.</p>
                    </div>
                    <div className={aboutStyles.summaryCard}>
                        <h3>AI Agents Factory</h3>
                        <p>Lets users create, configure, govern, and deploy AI agents or agent teams for specific tasks and workflows.</p>
                    </div>
                    <div className={aboutStyles.summaryCard}>
                        <h3>IDE And Code Tools</h3>
                        <p>Support manual development, assisted coding, code analysis, and visualization for teams that want more control.</p>
                    </div>
                    <div className={aboutStyles.summaryCard}>
                        <h3>Memory And Governance</h3>
                        <p>Layers help preserve context, reduce drift, and keep agent actions traceable and policy-aware.</p>
                    </div>
                    <div className={aboutStyles.summaryCard}>
                        <h3>Product Strategy Analysis</h3>
                        <p>Analyzing product efficiency on the market, user behavior model, and existing product strategy, and providing a strict list of solutions for growth or/and repositioning.</p>
                    </div>
                    <div className={aboutStyles.summaryCard}>
                        <h3>Digital Aid Kit</h3>
                        <p>The Digital First Aid Kit technology aims to provide preliminary support for people facing the most common types of digital threats or misleading visual information.</p>
                    </div>
                </div>

                <div style={{ marginTop: '64px', textAlign: 'center' }}>
                    <div className={aboutStyles.statHighlight}>35%</div>
                    <div className={aboutStyles.statLabel}>less vision stress daily</div>
                </div>
            </section>

            {/* Section 4 - Competitive Advantages */}
            <section className={aboutStyles.advantagesSection}>
                <h2>Competitive Advantages</h2>
                
                <div className={aboutStyles.founderCard}>
                    <div className={aboutStyles.founderImage}>
                        <img src="/image.svg" alt="Louie Nemesh" />
                    </div>
                    <div className={aboutStyles.founderInfo}>
                        <h3>Louie Nemesh</h3>
                        <div className={aboutStyles.founderRole}>X/@Louie.Nemesh — Founder / AI System Architect</div>
                        <p className={aboutStyles.founderBio}>
                            DevSwat is led by Louie Nemesh, founder and technical operator, with a background in product and 
                            engineering focused on AI-driven software systems, platform architecture, and startup tooling. Before 
                            founding DevSwat in the United States, Louie spent eight years helping digitalize local companies in 
                            Qatar, UAE and delivering solutions for top-tier enterprise clients across the MENA region.
                        </p>
                        <div className={aboutStyles.socialLinks}>
                            <a href="https://x.com/Louie.Nemesh" target="_blank" rel="noopener noreferrer" className={aboutStyles.socialLink}>
                                <Twitter size={16} /> X
                            </a>
                            <a href="https://www.linkedin.com/company/devswat/" target="_blank" rel="noopener noreferrer" className={aboutStyles.socialLink}>
                                <Linkedin size={16} /> LinkedIn
                            </a>
                            <a href="https://www.youtube.com/@DevSwat" target="_blank" rel="noopener noreferrer" className={aboutStyles.socialLink}>
                                <Youtube size={16} /> YouTube
                            </a>
                            <a href="https://github.com/DevSwat-ResonantGenesis" target="_blank" rel="noopener noreferrer" className={aboutStyles.socialLink}>
                                <Github size={16} /> GitHub
                            </a>
                        </div>
                    </div>
                </div>

                <div className={aboutStyles.platformCard}>
                    <div className={aboutStyles.badge}>Development Stage</div>
                    <h3>Platform Architecture</h3>
                    <p>
                        DevSwat is currently in active development and iteration, with the platform evolving from core infrastructure 
                        into productized tools and user-facing workflows. The system is best described as an MVP or early 
                        production-stage platform, depending on what is already live on the website.
                    </p>
                    <p>
                        At a high level, DevSwat is built on a multi-service architecture with a central protocol layer that governs 
                        how agents, users, memory, and workflows interact. The platform includes autonomous agent runtime, 
                        orchestration, identity and trust controls, memory-aware execution, and a control plane that lets users 
                        manage actions from one interface.
                    </p>
                </div>
            </section>

            {/* Section 5 - CTA */}
            <section className={aboutStyles.ctaSection}>
                <h2>Start Building Better Future With Us</h2>
                <button className={aboutStyles.ctaButton} onClick={() => navigate('/signup')}>
                    Get Started Free <ArrowRight size={20} />
                </button>
            </section>
        </div>
    );
};
