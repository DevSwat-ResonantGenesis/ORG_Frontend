/**
 * Floating Home Component - Logo Watermark Design
 * Large faded logo centered like IDE welcome screen
 * Guest mode: shows plain text info above the logo watermark
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

      {isGuest && (
        <div className={styles.guestText}>
          <div className={styles.guestTitle}>You are in Guest Mode</div>
          <div className={styles.guestLine}>Your AI Assistant tools are limited to 3 basic tools and you are using a low-reasoning LLM model.</div>
          <div className={styles.guestLine}>You cannot create Agents, Goals, Economic models, or Workflows. Your session will be gone on reload.</div>
          <div className={styles.guestDivider} />
          <div className={styles.guestLine}>Our products you are missing: <strong>AI Agent Studio</strong> — Create & manage agents &nbsp;·&nbsp; <strong>Synthetic Neural Memory</strong> — Physics-Informed 9-Layer Cognitive Infrastructure &nbsp;·&nbsp; <strong>Invariants SIM</strong> — Economic constraint modeling &nbsp;·&nbsp; <strong>SAST & Dependency Graph</strong> — Full-Stack Architecture Observability</div>
          <div className={styles.guestDivider} />
          <div className={styles.guestLine}>To get the full experience please <span className={styles.guestLink} onClick={() => navigate('/login')}>log in</span> or <span className={styles.guestLink} onClick={() => navigate('/signup')}>sign up free</span> and enjoy ResonantGenesis — create your own intelligence, manage it.</div>
        </div>
      )}

      <div className={styles.watermarkContainer}>
        <img
          src={theme === 'dark' ? '/logo white.png' : '/logo black.png'}
          alt="ResonantGenesis"
          className={styles.watermarkLogo}
          draggable={false}
        />
      </div>
    </div>
  );
};

export default FloatingHome;
