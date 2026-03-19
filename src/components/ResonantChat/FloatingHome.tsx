/**
 * Floating Home Component - Logo Watermark Design
 * Large faded logo centered like IDE welcome screen
 * Guest mode: shows feature cards grid
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '@/store/themeStore';
import {
  Bot,
  Brain,
  Search,
  Microscope,
  GitGraph,
  TrendingUp,
  Webhook,
  Share2,
  Image,
  Globe,
} from 'lucide-react';
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

const FEATURE_CARDS = [
  { icon: Bot, title: 'AI Agent Studio', desc: 'Create & manage autonomous agents' },
  { icon: Brain, title: 'Neural Memory', desc: '9-layer cognitive infrastructure' },
  { icon: Image, title: 'Image Generation', desc: 'Create visual content with AI' },
  { icon: Search, title: 'Web Search', desc: 'Find information in real-time' },
  { icon: Microscope, title: 'Deep Research', desc: 'In-depth analysis on any topic' },
  { icon: Globe, title: 'Any Integration', desc: 'Connect to your favorite tools' },
  { icon: GitGraph, title: 'Code Visualizer', desc: 'Full-stack architecture observability' },
  { icon: TrendingUp, title: 'Economic Modeling', desc: 'Constraint modeling & simulation' },
  { icon: Webhook, title: 'Webhooks', desc: 'Automate agent execution' },
  { icon: Share2, title: 'Sharing', desc: 'Share with colleagues or friends' },
];

export const FloatingHome: React.FC<FloatingHomeProps> = ({ isLoggedIn }) => {
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const isGuest = !isLoggedIn;

  return (
    <div className={styles.floatingHome}>

      {isGuest && (
        <div className={styles.guestSection}>
          <div className={styles.guestHeader}>
            <div className={styles.guestTitle}>You are in Guest Mode</div>
            <div className={styles.guestSubtitle}>Limited to 3 basic tools · Low-reasoning model · Session lost on reload</div>
          </div>

          <div className={styles.featureGrid}>
            {FEATURE_CARDS.map((card) => (
              <div key={card.title} className={styles.featureCard}>
                <card.icon className={styles.featureIcon} size={22} strokeWidth={1.5} />
                <div className={styles.featureTitle}>{card.title}</div>
                <div className={styles.featureDesc}>{card.desc}</div>
              </div>
            ))}
          </div>

          <div className={styles.guestCta}>
            <span className={styles.guestCtaText}>Get the full experience —</span>
            <span className={styles.guestLink} onClick={() => navigate('/login')}>Log in</span>
            <span className={styles.guestCtaText}> or </span>
            <span className={styles.guestLink} onClick={() => navigate('/signup')}>Sign up free</span>
          </div>
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
