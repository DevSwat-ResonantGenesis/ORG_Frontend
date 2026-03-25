/**
 * Community Page - Community hub for ResonantGenesis
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Store, Atom, Brain, MessageCircle, BookOpen, Github, ArrowRight } from 'lucide-react';
import styles from './CommunityPage.module.css';

const communityLinks = [
  {
    icon: Store,
    title: 'Agent Marketplace',
    description: 'Browse, deploy, and share AI agents built by the community. Find pre-built solutions for your use case.',
    link: '/marketplace',
    cta: 'Explore Agents',
    color: '#3b82f6',
  },
  {
    icon: Atom,
    title: 'State Physics',
    description: 'Explore invariant-governed state simulation. Real-time anomaly detection and conservation law enforcement.',
    link: '/state-physics',
    cta: 'Try State Physics',
    color: '#8b5cf6',
  },
  {
    icon: Brain,
    title: 'Hash Sphere AI Memory',
    description: 'Visualize and explore AI memory universes. See how memories cluster, evolve, and connect.',
    link: '/hash-sphere-memory',
    cta: 'Explore Memory',
    color: '#06b6d4',
  },
];

const resources = [
  {
    icon: BookOpen,
    title: 'Documentation',
    description: 'Comprehensive guides and API references',
    link: '/docs',
  },
  {
    icon: Github,
    title: 'GitHub',
    description: 'Open source projects and examples',
    link: 'https://github.com/resonantgenesis',
    external: true,
  },
  {
    icon: MessageCircle,
    title: 'Discord',
    description: 'Join our community chat',
    link: 'https://discord.gg/resonantgenesis',
    external: true,
  },
];

const CommunityPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLinkClick = (link: string, external?: boolean) => {
    if (external) {
      window.open(link, '_blank');
    } else {
      navigate(link);
    }
  };

  return (
    <div className={styles.communityPage}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>
            <Users size={14} />
            Community
          </span>
          <h1 className={styles.heroTitle}>
            Build Together with<br />
            <span className={styles.heroGradient}>ResonantGenesis</span>
          </h1>
          <p className={styles.heroDescription}>
            Join thousands of developers, researchers, and builders creating the future of autonomous AI. 
            Share agents, explore tools, and connect with the community.
          </p>
        </div>
      </section>

      {/* Main Links Section */}
      <section className={styles.linksSection}>
        <div className={styles.linksGrid}>
          {communityLinks.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx} 
                className={styles.linkCard}
                onClick={() => navigate(item.link)}
              >
                <div className={styles.linkCardIcon} style={{ background: `${item.color}20`, color: item.color }}>
                  <Icon size={32} />
                </div>
                <h3 className={styles.linkCardTitle}>{item.title}</h3>
                <p className={styles.linkCardDescription}>{item.description}</p>
                <button className={styles.linkCardCta} style={{ color: item.color }}>
                  {item.cta}
                  <ArrowRight size={16} />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Resources Section */}
      <section className={styles.resourcesSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Resources</h2>
          <p className={styles.sectionDescription}>
            Everything you need to get started and succeed
          </p>
        </div>

        <div className={styles.resourcesGrid}>
          {resources.map((resource, idx) => {
            const Icon = resource.icon;
            return (
              <button
                key={idx}
                className={styles.resourceCard}
                onClick={() => handleLinkClick(resource.link, resource.external)}
              >
                <div className={styles.resourceIcon}>
                  <Icon size={24} />
                </div>
                <div className={styles.resourceInfo}>
                  <h4 className={styles.resourceTitle}>{resource.title}</h4>
                  <p className={styles.resourceDescription}>{resource.description}</p>
                </div>
                <ArrowRight size={18} className={styles.resourceArrow} />
              </button>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>10K+</span>
            <span className={styles.statLabel}>Developers</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>500+</span>
            <span className={styles.statLabel}>Agents Published</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>1M+</span>
            <span className={styles.statLabel}>Agent Executions</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>50+</span>
            <span className={styles.statLabel}>Countries</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to Join?</h2>
          <p className={styles.ctaDescription}>
            Start building with ResonantGenesis today. Developer plan from $15/mo.
          </p>
          <div className={styles.ctaActions}>
            <button className={styles.primaryButton} onClick={() => navigate('/signup')}>
              Get Started
              <ArrowRight size={18} />
            </button>
            <button className={styles.secondaryButton} onClick={() => navigate('/contact')}>
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CommunityPage;
