/**
 * Floating Home Component - Logo Watermark Design
 * Large faded logo centered like IDE welcome screen
 * Guest mode: shows feature cards grid
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Brain,
  Bot,
  Cpu,
  TrendingUp,
  Laptop,
  ShieldCheck,
  Plug,
  Database,
  Network,
  Zap,
  Boxes,
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
  { icon: MessageSquare, title: 'Resonant Chat', desc: 'Intelligent chat with fast tool calls — search, scrape & more, no agents needed' },
  { icon: Brain, title: 'Neural Memory', desc: 'Ecosystem control plane — unify 130+ tools, agents, LLMs, providers & memory' },
  { icon: Bot, title: 'AI Agent Studio', desc: 'Create & manage autonomous agents with AI assistance' },
  { icon: Cpu, title: 'ML Workers', desc: 'Training jobs, model pipelines & system monitoring' },
  { icon: TrendingUp, title: 'Invariants SIM', desc: 'Economic constraint modeling & simulation' },
  { icon: Laptop, title: 'Resonant IDE', desc: 'Desktop coding app powered by Resonant AI — built-in AST & 80+ smart tools' },
  { icon: ShieldCheck, title: 'AST Code Analyser', desc: 'SAST & full-stack architecture observability' },
  { icon: Plug, title: 'Webhooks & Providers', desc: 'Connect almost anything to your workflow' },
  { icon: Database, title: 'Neural Retrieval Memory', desc: '9-layer cognitive memory retrieval & storage' },
  { icon: Network, title: 'DSID', desc: 'Decentralized internal network for logging & SOC compliance' },
  { icon: Zap, title: 'RARA', desc: 'Resonant Autonomous Runtime Agent — self-executing agent framework' },
  { icon: Boxes, title: 'Open Source', desc: 'Self-hosted agentic platform — sits between LLM providers & your hardware' },
];

export const FloatingHome: React.FC<FloatingHomeProps> = ({ isLoggedIn }) => {
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


      <footer className={styles.siteFooter}>
        <div className={styles.footerInfo}>
          DevSwat Inc. San Francisco, California, USA &middot; info@dev-swat.com
        </div>
        <div className={styles.footerSocials}>
          <a href="https://www.linkedin.com/company/resonantgenesis/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
          <a href="https://www.youtube.com/@ResonantGenesis" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          </a>
          <a href="https://x.com/resonantgenesis" target="_blank" rel="noopener noreferrer" aria-label="X">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="https://www.reddit.com/u/ResonantGenesis/" target="_blank" rel="noopener noreferrer" aria-label="Reddit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
          </a>
          <a href="mailto:info@dev-swat.com" aria-label="Email">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          </a>
        </div>
      </footer>
    </div>
  );
};

export default FloatingHome;
