import React from 'react';
import { Button } from '../../../components/ui';
import { useNavigate } from 'react-router-dom';
import { goToSignup, goToContact } from '../../../utils/navigation';
import styles from '../../Help/HelpCenterPage.module.css';

const CompliancePage: React.FC = () => {
  const navigate = useNavigate();

  const standards = [
    {
      title: 'GDPR Compliance',
      description: 'Full compliance with EU data protection regulations including right to access, deletion, and data portability.',
      tags: ['gdpr', 'eu']
    },
    {
      title: 'CCPA Compliance',
      description: 'California Consumer Privacy Act compliance with rights to know, delete, and opt-out.',
      tags: ['ccpa', 'california']
    },
    {
      title: 'SOC 2 Type II',
      description: 'Certified for security, availability, processing integrity, confidentiality, and privacy.',
      tags: ['soc2', 'audit']
    },
    {
      title: 'ISO 27001',
      description: 'Information security management aligned with ISO 27001 standards.',
      tags: ['iso', 'security']
    },
    {
      title: 'HIPAA Compliance',
      description: 'HIPAA-compliant features for healthcare organizations to protect PHI.',
      tags: ['hipaa', 'healthcare']
    },
    {
      title: 'PCI DSS',
      description: 'Payment card data processed according to PCI DSS standards.',
      tags: ['pci', 'payments']
    }
  ];

  const security = [
    {
      title: 'Encryption',
      description: 'TLS 1.3 in transit, AES-256 at rest, with secure key management and rotation.',
      tags: ['encryption', 'tls']
    },
    {
      title: 'Access Controls',
      description: 'MFA support, role-based access control (RBAC), regular audits, least privilege principle.',
      tags: ['access', 'rbac']
    },
    {
      title: 'Infrastructure',
      description: 'Regular penetration testing, intrusion detection, DDoS protection, secure SDLC.',
      tags: ['infrastructure', 'monitoring']
    }
  ];

  return (
    <div className={styles.helpCenterPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Compliance & Certifications</h1>
          <p className={styles.subtitle}>
            ResonantGenesis maintains the highest standards of security, privacy, and regulatory compliance.
          </p>
        </div>

        <div className={styles.contentBody}>
          <div className={styles.contentMain}>
            <section className={styles.contentSection}>
              <h2>Compliance Standards</h2>
              <div className={styles.articleGrid}>
                {standards.map((standard, idx) => (
                  <div key={idx} className={styles.articleCard} style={{ cursor: 'default' }}>
                    <h3>{standard.title}</h3>
                    <p>{standard.description}</p>
                    <div className={styles.articleTags}>
                      {standard.tags.map(tag => (
                        <span key={tag} className={styles.articleTag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.contentSection}>
              <h2>Data Security</h2>
              <div className={styles.articleGrid}>
                {security.map((item, idx) => (
                  <div key={idx} className={styles.articleCard} style={{ cursor: 'default' }}>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <div className={styles.articleTags}>
                      {item.tags.map(tag => (
                        <span key={tag} className={styles.articleTag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.contentSection}>
              <h2>Contact Compliance Team</h2>
              <div className={styles.articleGrid}>
                <div className={styles.articleCard} style={{ cursor: 'default' }}>
                  <h3>Compliance Questions</h3>
                  <p>
                    For compliance-related questions or security reports, contact compliance@resonantgenesis.com. 
                    We respond within 48 hours.
                  </p>
                  <div className={styles.articleTags}>
                    <span className={styles.articleTag}>contact</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className={styles.contentSidebar}>
            <div className={styles.sidebarCard}>
              <h3>Legal Documents</h3>
              <ul>
                <li><a href="/public/legal/privacy">Privacy Policy</a></li>
                <li><a href="/public/legal/terms">Terms of Service</a></li>
                <li><a href="/contact">Contact Us</a></li>
              </ul>
            </div>
            <div className={styles.sidebarCard}>
              <h3>Resources</h3>
              <ul>
                <li><a href="/help">Help Center</a></li>
                <li><a href="/help/developers/api-reference">API Documentation</a></li>
                <li><a href="/about">About Us</a></li>
              </ul>
            </div>
            <div className={styles.sidebarCard}>
              <h3>Get Started</h3>
              <p>
                Ready to ensure your AI systems are compliant?
              </p>
              <Button variant="primary" size="sm" fullWidth onClick={() => goToSignup(navigate)}>
                Sign Up Free
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompliancePage;

