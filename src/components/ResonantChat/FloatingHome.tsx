/**
 * Floating Home Component - Logo Watermark Design
 * Large faded logo centered like IDE welcome screen
 * Guest mode: shows limitations watermark + login CTA
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '@/store/themeStore';
import styles from './FloatingHome.module.css';

interface FloatingHomeProps {
  onPromptSelect: (prompt: string) => void;
  onAgentSelect?: (agentHash: string | null) => void;
  onTeamSelect?: (teamId: string | null) => void;
  onProviderSelect?: (provider: string) => void;
  selectedAgentHash?: string | null;
  selectedTeamId?: string | null;
  selectedProvider?: string;
  isLoggedIn?: boolean;
}

export const FloatingHome: React.FC<FloatingHomeProps> = ({ isLoggedIn }) => {
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const isGuest = !isLoggedIn;

  return (
    <div className={styles.floatingHome}>
      <div className={styles.watermarkContainer}>
        <img
          src={theme === 'dark' ? '/logo white.png' : '/logo black.png'}
          alt="ResonantGenesis"
          className={styles.watermarkLogo}
          draggable={false}
        />
      </div>

      {isGuest && (
        <div className={styles.guestBanner}>
          <div className={styles.guestBannerInner}>
            <div className={styles.guestTitle}>You are in Guest Mode</div>
            <p className={styles.guestSubtitle}>
              Your AI Assistant tools are limited to <strong>3 basic tools</strong> and you are using a <strong>low-reasoning LLM model</strong>.
            </p>

            <div className={styles.guestLimitations}>
              <div className={styles.guestLimitItem}>
                <span className={styles.guestLimitIcon}>✕</span>
                Cannot create Agents, Goals, Economic models, or Workflows
              </div>
              <div className={styles.guestLimitItem}>
                <span className={styles.guestLimitIcon}>✕</span>
                Session will be gone on reload — no persistent memory
              </div>
              <div className={styles.guestLimitItem}>
                <span className={styles.guestLimitIcon}>✕</span>
                Limited access to low-reasoning LLM models only
              </div>
            </div>

            <div className={styles.guestProductsLabel}>Full platform products you're missing:</div>
            <div className={styles.guestProducts}>
              <div className={styles.guestProductCard}>
                <div className={styles.guestProductName}>AI Agent Studio</div>
                <div className={styles.guestProductDesc}>Create & manage agents</div>
              </div>
              <div className={styles.guestProductCard}>
                <div className={styles.guestProductName}>Synthetic Neural Memory</div>
                <div className={styles.guestProductDesc}>Physics-Informed, 9-Layer Cognitive Infrastructure</div>
              </div>
              <div className={styles.guestProductCard}>
                <div className={styles.guestProductName}>Invariants SIM</div>
                <div className={styles.guestProductDesc}>Economic constraint modeling</div>
              </div>
              <div className={styles.guestProductCard}>
                <div className={styles.guestProductName}>SAST & Dependency Graph</div>
                <div className={styles.guestProductDesc}>Full-Stack Architecture Observability</div>
              </div>
            </div>

            <p className={styles.guestCta}>
              To get the full experience — <strong>login</strong> and enjoy free ResonantGenesis. Create your own intelligence, manage it.
            </p>
            <div className={styles.guestActions}>
              <button className={styles.guestLoginBtn} onClick={() => navigate('/login')}>
                Log In
              </button>
              <button className={styles.guestSignupBtn} onClick={() => navigate('/signup')}>
                Sign Up Free
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingHome;
