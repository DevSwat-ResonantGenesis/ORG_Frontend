/**
 * Plan Comparison Widget
 * Shows what features the user would unlock by upgrading
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Crown, ArrowRight } from 'lucide-react';
import styles from './PlanComparisonWidget.module.css';

interface PlanComparisonWidgetProps {
  currentPlan: 'developer' | 'plus' | 'enterprise';
  compact?: boolean;
}

const PLAN_FEATURES = {
  developer: {
    credits: '1,000/month',
    agents: 'Unlimited',
    conversations: 'Unlimited',
    messages: 'Unlimited',
    ragDocs: '5 documents',
    storage: '100 MB',
    computeHours: '10 hrs/month',
    autonomousAgents: false,
    teams: false,
    evidenceGraph: false,
    hashSphere: false,
    codeVisualizer: false,
  },
  plus: {
    credits: '50,000/month',
    agents: '20 agents',
    conversations: 'Unlimited',
    messages: 'Unlimited',
    ragDocs: '100 documents',
    storage: '5 GB',
    computeHours: '100 hrs/month',
    autonomousAgents: true,
    teams: true,
    evidenceGraph: true,
    hashSphere: true,
    codeVisualizer: true,
  },
  enterprise: {
    credits: 'Unlimited',
    agents: 'Unlimited',
    conversations: 'Unlimited',
    messages: 'Unlimited',
    ragDocs: 'Unlimited',
    storage: '100+ GB',
    computeHours: 'Unlimited',
    autonomousAgents: true,
    teams: true,
    evidenceGraph: true,
    hashSphere: true,
    codeVisualizer: true,
  },
};

const FEATURE_LABELS: Record<string, string> = {
  credits: 'Monthly Credits',
  agents: 'AI Agents',
  conversations: 'Conversations',
  messages: 'Messages/Day',
  ragDocs: 'RAG Documents',
  storage: 'Storage',
  computeHours: 'Compute Hours',
  autonomousAgents: 'Autonomous Agents',
  teams: 'Agent Teams',
  evidenceGraph: 'Evidence Graph',
  hashSphere: 'Hash Sphere Memory',
  codeVisualizer: 'Code Visualizer',
};

export const PlanComparisonWidget: React.FC<PlanComparisonWidgetProps> = ({
  currentPlan,
  compact = false,
}) => {
  const navigate = useNavigate();
  
  // Don't show for enterprise users
  if (currentPlan === 'enterprise') return null;
  
  const currentFeatures = PLAN_FEATURES[currentPlan];
  const nextPlan = currentPlan === 'developer' ? 'plus' : 'enterprise';
  const nextFeatures = PLAN_FEATURES[nextPlan];
  
  const upgrades = Object.entries(nextFeatures)
    .filter(([key, value]) => {
      const current = currentFeatures[key as keyof typeof currentFeatures];
      return value !== current;
    })
    .slice(0, compact ? 4 : 8);

  return (
    <div className={`${styles.widget} ${compact ? styles.compact : ''}`}>
      <div className={styles.header}>
        <Crown size={20} className={styles.icon} />
        <div className={styles.headerText}>
          <h3>Unlock More with {nextPlan === 'plus' ? 'Plus' : 'Enterprise'}</h3>
          {!compact && (
            <p>Upgrade to get these features</p>
          )}
        </div>
      </div>
      
      <div className={styles.features}>
        {upgrades.map(([key, value]) => (
          <div key={key} className={styles.feature}>
            <div className={styles.featureIcon}>
              {typeof value === 'boolean' ? (
                value ? <Check size={14} className={styles.checkIcon} /> : <X size={14} />
              ) : (
                <ArrowRight size={14} className={styles.arrowIcon} />
              )}
            </div>
            <div className={styles.featureText}>
              <span className={styles.featureLabel}>{FEATURE_LABELS[key]}</span>
              {typeof value !== 'boolean' && (
                <span className={styles.featureValue}>{value}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <button 
        className={styles.upgradeBtn}
        onClick={() => nextPlan === 'plus' 
          ? (window.location.href = 'https://buy.stripe.com/7sYaEW7owgbHclrb7f33W0b')
          : navigate('/pricing')
        }
      >
        <Crown size={16} />
        {nextPlan === 'plus' ? 'Upgrade to Plus - $499/mo' : 'Contact Sales'}
      </button>
    </div>
  );
};

export default PlanComparisonWidget;
