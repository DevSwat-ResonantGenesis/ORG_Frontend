import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { ROUTE_META } from '@/config/routeMeta.mjs';
import { ArrowRight, Twitter, Linkedin, Github, Youtube } from 'lucide-react';
import styles from './AboutPage.module.css';

const meta = ROUTE_META['/about'];

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href="https://dev-swat.com/about" />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content="https://dev-swat.com/about" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://dev-swat.com/devswat/DevSwat.png" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "About DevSwat",
          "description": "AI-native infrastructure platform for building autonomous software agents.",
          "url": "https://dev-swat.com/about",
          "mainEntity": {
            "@type": "Organization",
            "name": "DevSwat",
            "url": "https://dev-swat.com",
            "founder": { "@type": "Person", "name": "Louie Nemesh", "jobTitle": "Founder & AI System Architect" },
            "description": "Agentic AI infrastructure for building, running, and scheduling server and local agents."
          }
        })}</script>
      </Helmet>

      {/* Section 0 - Full Screen YouTube Video */}
      <section className={styles.videoSection}>
        <div className={styles.videoContainer}>
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/0cyzNC5fzJU?autoplay=0&mute=0&controls=1&rel=0&modestbranding=1"
            title="DevSwat Introduction"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            frameBorder="0"
          />
        </div>
      </section>

      {/* Section 1 - Hero */}
      <section className={styles.heroSection}>
        <div className={styles.heroBadge}>About DevSwat</div>
        <h1 className={styles.heroTitle}>
          While others believe in a bright future, we're developing it now.
        </h1>
        <h2 className={styles.heroSubtitle}>Problem It Solves</h2>
        <p className={styles.heroDescription}>
          Modern teams and founders often have strong ideas but spend too much time dealing with fragmented tools, 
          context switching, manual coordination, and complex technical setup. DevSwat solves this by giving users 
          a unified environment where they can turn ideas into working systems faster, with less engineering overhead 
          and more control over how agents and workflows behave.
        </p>
      </section>

      {/* Section 2 - AI Infrastructure */}
      <section className={styles.aiSection}>
        <h2>AI is no longer just about powerful LLMs—it's about the infrastructure they are connected to.</h2>
      </section>

      {/* Section 3 - Main Focus */}
      <section className={styles.focusSection}>
        <h2>Main Focus</h2>
        <div className={styles.focusGrid}>
          <div className={styles.focusCard}>
            <h3>Support Services</h3>
            <p>Comprehensive support infrastructure for deploying and managing AI agents at scale.</p>
          </div>
          <div className={styles.focusCard}>
            <h3>Governmental Services</h3>
            <p>Compliance-ready solutions for public sector organizations with strict governance requirements.</p>
          </div>
          <div className={styles.focusCard}>
            <h3>Healthcare Services</h3>
            <p>Secure, HIPAA-compliant AI workflows for medical applications and patient data processing.</p>
          </div>
          <div className={styles.focusCard}>
            <h3>Education Services</h3>
            <p>AI-powered tools for educational institutions, from personalized learning to administrative automation.</p>
          </div>
        </div>
      </section>

      {/* Section 4 - Summary */}
      <section className={styles.summarySection}>
        <h2>Summary Of What We Do</h2>
        <p className={styles.summaryIntro}>
          DevSwat is an AI-native infrastructure platform for building, orchestrating, and deploying autonomous 
          software agents and digital products. Our system combines multi-agent orchestration, governed execution, 
          memory-aware workflows, and developer tooling so users can move from idea to working product faster.
        </p>
        
        <h2>Key Digital Solutions We Provide As Agentic AI Infrastructure</h2>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <h3>Resonant Chat</h3>
            <p>Is the command center for interacting with the platform, coordinating agents, triggering workflows, and accessing tools from one interface.</p>
          </div>
          <div className={styles.summaryCard}>
            <h3>AI Agents Factory</h3>
            <p>Lets users create, configure, govern, and deploy AI agents or agent teams for specific tasks and workflows.</p>
          </div>
          <div className={styles.summaryCard}>
            <h3>IDE And Code Tools</h3>
            <p>Support manual development, assisted coding, code analysis, and visualization for teams that want more control.</p>
          </div>
          <div className={styles.summaryCard}>
            <h3>Memory And Governance</h3>
            <p>Layers help preserve context, reduce drift, and keep agent actions traceable and policy-aware.</p>
          </div>
          <div className={styles.summaryCard}>
            <h3>Product Strategy Analysis</h3>
            <p>Analyzing product efficiency on the market, user behavior model, and existing product strategy, and providing a strict list of solutions for growth or/and repositioning.</p>
          </div>
          <div className={styles.summaryCard}>
            <h3>Digital Aid Kit</h3>
            <p>The Digital First Aid Kit technology aims to provide preliminary support for people facing the most common types of digital threats or misleading visual information.</p>
          </div>
        </div>

        <div style={{ marginTop: '64px', textAlign: 'center' }}>
          <div className={styles.statHighlight}>35%</div>
          <div className={styles.statLabel}>less vision stress daily</div>
        </div>
      </section>

      {/* Section 5 - Competitive Advantages */}
      <section className={styles.advantagesSection}>
        <h2>Competitive Advantages</h2>
        
        <div className={styles.founderCard}>
          <div className={styles.founderImage}>
            <img src="/image.svg" alt="Louie Nemesh" />
          </div>
          <div className={styles.founderInfo}>
            <h3>Louie Nemesh</h3>
            <div className={styles.founderRole}>X/@Louie.Nemesh — Founder / AI System Architect</div>
            <p className={styles.founderBio}>
              DevSwat is led by Louie Nemesh, founder and technical operator, with a background in product and 
              engineering focused on AI-driven software systems, platform architecture, and startup tooling. Before 
              founding DevSwat in the United States, Louie spent eight years helping digitalize local companies in 
              Qatar, UAE and delivering solutions for top-tier enterprise clients across the MENA region.
            </p>
            <div className={styles.socialLinks}>
              <a href="https://x.com/Louie.Nemesh" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <Twitter size={16} /> X
              </a>
              <a href="https://www.linkedin.com/company/devswat/" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <Linkedin size={16} /> LinkedIn
              </a>
              <a href="https://www.youtube.com/@DevSwat" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <Youtube size={16} /> YouTube
              </a>
              <a href="https://github.com/DevSwat-ResonantGenesis" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <Github size={16} /> GitHub
              </a>
            </div>
          </div>
        </div>

        <div className={styles.platformCard}>
          <div className={styles.badge}>Development Stage</div>
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

      {/* Section 6 - CTA */}
      <section className={styles.ctaSection}>
        <h2>Start Building Better Future With Us</h2>
        <button className={styles.ctaButton} onClick={() => navigate('/signup')}>
          Get Started Free <ArrowRight size={20} />
        </button>
      </section>
    </div>
  );
};

export default AboutPage;
