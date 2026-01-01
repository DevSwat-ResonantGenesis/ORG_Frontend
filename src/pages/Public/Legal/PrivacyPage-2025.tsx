import React from 'react';
import { Button } from '../../../components/ui';
import { useNavigate } from 'react-router-dom';
import { goToContact } from '../../../utils/navigation';
import styles from '../../Help/HelpCenterPage.module.css';

const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Introduction',
      description: 'ResonantGenesis is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information.',
      tags: ['overview']
    },
    {
      title: 'Information We Collect',
      description: 'We collect account information (email, name), usage data (API requests, feature usage), and content data submitted for validation.',
      tags: ['data', 'collection']
    },
    {
      title: 'How We Use Your Information',
      description: 'We use your information to provide services, process requests, send notices, respond to questions, and comply with legal obligations.',
      tags: ['usage']
    },
    {
      title: 'Data Security',
      description: 'We implement encryption in transit and at rest, secure authentication, regular security audits, and role-based access controls.',
      tags: ['security', 'encryption']
    },
    {
      title: 'Data Sharing',
      description: 'We do not sell your personal information. We may share data with service providers, for legal requirements, or with your consent.',
      tags: ['sharing', 'third-party']
    },
    {
      title: 'Your Rights',
      description: 'You have the right to access, correct, delete, and export your data. You can also opt-out of marketing communications.',
      tags: ['rights', 'gdpr']
    },
    {
      title: 'Cookies',
      description: 'We use cookies to maintain sessions, remember preferences, and analyze usage patterns. You can control cookies in your browser.',
      tags: ['cookies', 'tracking']
    },
    {
      title: 'Data Retention',
      description: 'We retain information as long as necessary to provide services. When you delete your account, we delete or anonymize your data.',
      tags: ['retention']
    }
  ];

  return (
    <div className={styles.helpCenterPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Privacy Policy</h1>
          <p className={styles.subtitle}>
            Last updated: January 2025. This policy explains how ResonantGenesis collects, uses, and protects your information.
          </p>
        </div>

        <div className={styles.contentBody}>
          <div className={styles.contentMain}>
            <section className={styles.contentSection}>
              <h2>Privacy Overview</h2>
              <div className={styles.articleGrid}>
                {sections.map((section, idx) => (
                  <div key={idx} className={styles.articleCard} style={{ cursor: 'default' }}>
                    <h3>{section.title}</h3>
                    <p>{section.description}</p>
                    <div className={styles.articleTags}>
                      {section.tags.map(tag => (
                        <span key={tag} className={styles.articleTag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.contentSection}>
              <h2>Contact Us</h2>
              <div className={styles.articleGrid}>
                <div className={styles.articleCard} style={{ cursor: 'default' }}>
                  <h3>Privacy Questions</h3>
                  <p>
                    If you have questions about this Privacy Policy or want to exercise your rights, 
                    contact us at privacy@resonantgenesis.com
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
                <li><a href="/public/legal/terms">Terms of Service</a></li>
                <li><a href="/public/legal/compliance">Compliance</a></li>
                <li><a href="/contact">Contact Us</a></li>
              </ul>
            </div>
            <div className={styles.sidebarCard}>
              <h3>Questions?</h3>
              <p>
                Need help understanding our privacy practices?
              </p>
              <Button variant="primary" size="sm" fullWidth onClick={() => goToContact(navigate)}>
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;

