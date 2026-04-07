/**
 * Footer Component - 2025 Redesign
 * Flush footer positioned at bottom using flexbox
 * 
 * Now using CSS Modules for scoped styling
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { goToPricing, goToHelp, goToContact, goToPrivacy, goToTerms } from '../utils/navigation';
import styles from './Footer.module.css';

interface FooterProps {
  variant?: 'default' | 'minimal';
}

export const Footer: React.FC<FooterProps> = ({ variant = 'default' }) => {
  const navigate = useNavigate();

  if (variant === 'minimal') {
    return (
      <footer className={`${styles.footer} ${styles.minimal}`}>
        <div className={styles.container}>
          <p className={styles.copyright}>
            © 2025 ResonantGenesis. All rights reserved.
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.section}>
            <h4 className={styles.title}>Product</h4>
            <div className={styles.links}>
              <a
                href="/help"
                onClick={(e) => {
                  e.preventDefault();
                  goToHelp(navigate);
                }}
              >
                Documentation
              </a>
              <a
                href="/#pricing"
                onClick={(e) => {
                  e.preventDefault();
                  goToPricing(navigate);
                }}
              >
                Pricing
              </a>
              <a
                href="/help"
                onClick={(e) => {
                  e.preventDefault();
                  goToHelp(navigate);
                }}
              >
                API Reference
              </a>
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.title}>Company</h4>
            <div className={styles.links}>
              <a
                href="/contact"
                onClick={(e) => {
                  e.preventDefault();
                  goToContact(navigate);
                }}
              >
                Contact
              </a>
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.title}>Legal</h4>
            <div className={styles.links}>
              <a
                href="/privacy-policy"
                onClick={(e) => {
                  e.preventDefault();
                  goToPrivacy(navigate);
                }}
              >
                Privacy
              </a>
              <a
                href="/terms-of-service"
                onClick={(e) => {
                  e.preventDefault();
                  goToTerms(navigate);
                }}
              >
                Terms
              </a>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © 2025 ResonantGenesis. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

