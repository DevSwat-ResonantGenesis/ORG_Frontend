/**
 * Limit Warning Banner Component
 * Shows upgrade prompts when users are approaching or have hit their plan limits
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Crown, ArrowUpRight } from 'lucide-react';
import styles from './LimitWarningBanner.module.css';

interface LimitWarningBannerProps {
  type: 'credits' | 'conversations' | 'messages' | 'agents' | 'rag_documents' | 'storage';
  used: number;
  limit: number;
  showUpgrade?: boolean;
  className?: string;
}

const LIMIT_LABELS: Record<string, { name: string; upgradeText: string }> = {
  credits: { name: 'credits', upgradeText: '50,000 credits/month' },
  conversations: { name: 'conversations', upgradeText: '1,000 conversations' },
  messages: { name: 'messages today', upgradeText: '1,000 messages/day' },
  agents: { name: 'agents', upgradeText: '20 agents' },
  rag_documents: { name: 'RAG documents', upgradeText: '100 documents' },
  storage: { name: 'MB storage', upgradeText: '5 GB storage' },
};

export const LimitWarningBanner: React.FC<LimitWarningBannerProps> = ({
  type,
  used,
  limit,
  showUpgrade = true,
  className = '',
}) => {
  const navigate = useNavigate();
  
  // Don't show for unlimited plans
  if (limit <= 0) return null;
  
  const percentUsed = (used / limit) * 100;
  const isAtLimit = used >= limit;
  const isNearLimit = percentUsed >= 80;
  
  // Don't show if not near limit
  if (!isNearLimit) return null;
  
  const labels = LIMIT_LABELS[type] || { name: type, upgradeText: 'more resources' };
  
  return (
    <div className={`${styles.banner} ${isAtLimit ? styles.error : styles.warning} ${className}`}>
      <div className={styles.content}>
        <AlertTriangle size={20} />
        <div className={styles.text}>
          {isAtLimit ? (
            <>
              <strong>Limit reached!</strong> You've used all {limit} {labels.name}.
            </>
          ) : (
            <>
              <strong>Running low!</strong> You've used {used} of {limit} {labels.name} ({Math.round(percentUsed)}%).
            </>
          )}
        </div>
      </div>
      {showUpgrade && (
        <button 
          className={styles.upgradeBtn}
          onClick={() => navigate('/pricing')}
        >
          <Crown size={16} />
          Upgrade for {labels.upgradeText}
          <ArrowUpRight size={14} />
        </button>
      )}
    </div>
  );
};

export default LimitWarningBanner;
