/**
 * Enterprise Page - Enterprise solutions and features
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Users, Zap, Building2, Globe, Check, ArrowRight } from 'lucide-react';
import styles from './EnterprisePage.module.css';

const enterpriseFeatures = [
  {
    icon: Shield,
    title: 'RARA Governance',
    description: 'Enterprise-grade AI governance with SLA-backed kill switches, custom invariants, and immutable audit trails.',
    features: ['Custom invariant policies', 'SLA-backed kill switch', 'Immutable blockchain audit', 'Compliance reports'],
  },
  {
    icon: Lock,
    title: 'Security & Compliance',
    description: 'SOC 2 Type II compliant infrastructure with SSO/SAML, role-based access, and air-gapped deployment options.',
    features: ['SSO/SAML integration', 'Role-based access control', 'Air-gapped deployment', 'Data residency options'],
  },
  {
    icon: Users,
    title: 'Agent Teams',
    description: 'Hierarchical agent team structures with unlimited agents, full autonomous mode, and cross-team collaboration.',
    features: ['Unlimited agents', 'Team hierarchies', 'Full autonomous mode', 'Cross-team workflows'],
  },
  {
    icon: Zap,
    title: 'Hash Sphere Memory',
    description: 'Multi-universe memory architecture with dedicated invariant engines and custom physics models.',
    features: ['Multi-universe access', 'Dedicated engines', 'Custom physics models', 'Unlimited replay'],
  },
];

const useCases = [
  {
    title: 'Financial Services',
    description: 'Autonomous trading agents with real-time risk monitoring and regulatory compliance.',
    icon: Building2,
  },
  {
    title: 'Healthcare & Life Sciences',
    description: 'AI-powered research assistants with HIPAA-compliant data handling and audit trails.',
    icon: Shield,
  },
  {
    title: 'Technology & SaaS',
    description: 'Scalable AI infrastructure for product development and customer support automation.',
    icon: Zap,
  },
  {
    title: 'Government & Defense',
    description: 'Secure, air-gapped deployments with immutable governance and compliance reporting.',
    icon: Lock,
  },
];

const EnterprisePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.enterprisePage}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Enterprise</span>
          <h1 className={styles.heroTitle}>
            AI Infrastructure for<br />
            <span className={styles.heroGradient}>Critical Operations</span>
          </h1>
          <p className={styles.heroDescription}>
            Deploy autonomous AI agents with enterprise-grade governance, security, and compliance.
          </p>
          <p className={styles.heroDescription}>
            Everything you need to deploy AI at scale with confidence.
          </p>
          <p className={styles.heroDescription}>
            Trusted by leading organizations across industries.
          </p>
          <div className={styles.heroActions}>
            <button className={styles.primaryButton} onClick={() => navigate('/contact?subject=enterprise')}>
              Contact Sales
              <ArrowRight size={18} />
            </button>
            <button className={styles.secondaryButton} onClick={() => navigate('/pricing')}>
              View Pricing
            </button>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>99.99%</span>
              <span className={styles.heroStatLabel}>Uptime SLA</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>SOC 2</span>
              <span className={styles.heroStatLabel}>Type II Certified</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>24/7</span>
              <span className={styles.heroStatLabel}>Dedicated Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Capabilities</span>
          <h2 className={styles.sectionTitle}>Enterprise-Grade Features</h2>
          <p className={styles.sectionDescription}>
            Everything you need to deploy AI at scale with confidence
          </p>
        </div>

        <div className={styles.featuresGrid}>
          {enterpriseFeatures.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <Icon size={28} />
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
                <ul className={styles.featureList}>
                  {feature.features.map((item, i) => (
                    <li key={i} className={styles.featureListItem}>
                      <Check size={16} className={styles.checkIcon} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Use Cases Section */}
      <section className={styles.useCasesSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Industries</span>
          <h2 className={styles.sectionTitle}>Built for Your Industry</h2>
          <p className={styles.sectionDescription}>
            Trusted by leading organizations across industries
          </p>
        </div>

        <div className={styles.useCasesGrid}>
          {useCases.map((useCase, idx) => {
            const Icon = useCase.icon;
            return (
              <div key={idx} className={styles.useCaseCard}>
                <div className={styles.useCaseIcon}>
                  <Icon size={24} />
                </div>
                <h3 className={styles.useCaseTitle}>{useCase.title}</h3>
                <p className={styles.useCaseDescription}>{useCase.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to Scale Your AI Operations?</h2>
          <p className={styles.ctaDescription}>
            Get a personalized demo and see how ResonantGenesis can transform your organization.
          </p>
          <div className={styles.ctaActions}>
            <button className={styles.primaryButton} onClick={() => navigate('/contact?subject=enterprise-demo')}>
              Schedule Demo
              <ArrowRight size={18} />
            </button>
            <button className={styles.secondaryButton} onClick={() => navigate('/pricing')}>
              Compare Plans
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EnterprisePage;
