/**
 * Floating Home Component - Logo Watermark Design
 * Large faded logo centered like IDE welcome screen
 */

import React from 'react';
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

export const FloatingHome: React.FC<FloatingHomeProps> = () => {
  const { theme } = useThemeStore();

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
    </div>
  );
};

export default FloatingHome;
