import React from 'react';
import { Button } from '../../../components/ui';
import { useNavigate } from 'react-router-dom';
import { goToContact } from '../../../utils/navigation';
import styles from '../../Help/HelpCenterPage.module.css';

const TermsPage: React.FC = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Agreement to Terms',
      description: 'By accessing ResonantGenesis, you agree to be bound by these Terms of Service. If you disagree, you may not use our services.',
      tags: ['agreement']
    },
    {
      title: 'Description of Service',
      description: 'ResonantGenesis provides AI validation, compliance checking, evidence graph visualization, audit trails, and API access.',
      tags: ['service', 'features']
    },
    {
      title: 'Account Registration',
      description: 'You must be 18+ to use our services. You are responsible for maintaining account security and all activities under your account.',
      tags: ['account', 'eligibility']
    },
    {
      title: 'Acceptable Use',
      description: 'Do not use the service for illegal purposes, interfere with servers, attempt unauthorized access, or violate intellectual property.',
      tags: ['usage', 'restrictions']
    },
    {
      title: 'Content and Data',
      description: 'You retain ownership of your content. We process it to provide services but do not use it to train models without consent.',
      tags: ['content', 'ownership']
    },
    {
      title: 'Intellectual Property',
      description: 'The Platform and its content are owned by ResonantGenesis and protected by copyright and trademark laws.',
      tags: ['ip', 'copyright']
    },
    {
      title: 'Pricing and Payment',
      description: 'Some features require payment. You agree to pay fees, provide accurate billing info, and accept non-refundable terms.',
      tags: ['billing', 'payment']
    },
    {
      title: 'Limitation of Liability',
      description: 'ResonantGenesis is not liable for indirect, incidental, or consequential damages arising from use of the service.',
      tags: ['liability', 'legal']
    }
  ];

  return (
    <div className={styles.helpCenterPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Terms of Service</h1>
          <p className={styles.subtitle}>
            Last updated: January 2025. These terms govern your use of the ResonantGenesis platform.
          </p>
        </div>

        <div className={styles.contentBody}>
          <div className={styles.contentMain}>
            <section className={styles.contentSection}>
              <h2>Terms Overview</h2>
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
                  <h3>Legal Questions</h3>
                  <p>
                    If you have questions about these Terms of Service, contact us at legal@resonantgenesis.com
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
                <li><a href="/public/legal/compliance">Compliance</a></li>
                <li><a href="/contact">Contact Us</a></li>
              </ul>
            </div>
            <div className={styles.sidebarCard}>
              <h3>Questions?</h3>
              <p>
                Need clarification on our terms?
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

export default TermsPage;

