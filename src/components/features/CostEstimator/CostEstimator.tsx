/**
 * Cost Estimator Component
 * Shows estimated credit cost before performing actions
 */
import React from 'react';
import { Coins, AlertCircle, Info } from 'lucide-react';
import styles from './CostEstimator.module.css';

interface CostEstimatorProps {
  action: 'chat_message' | 'agent_run' | 'rag_query' | 'code_execution' | 'file_upload';
  estimatedCredits: number;
  currentBalance: number;
  showWarning?: boolean;
  compact?: boolean;
}

// Credit costs per action (from pricing config)
export const CREDIT_COSTS = {
  chat_message: { min: 1, max: 10, avg: 3, description: 'Per message' },
  agent_run: { min: 5, max: 50, avg: 15, description: 'Per agent execution' },
  rag_query: { min: 2, max: 8, avg: 4, description: 'Per RAG query' },
  code_execution: { min: 10, max: 100, avg: 30, description: 'Per code run' },
  file_upload: { min: 1, max: 5, avg: 2, description: 'Per file processed' },
};

export const CostEstimator: React.FC<CostEstimatorProps> = ({
  action,
  estimatedCredits,
  currentBalance,
  showWarning = true,
  compact = false,
}) => {
  const hasEnoughCredits = currentBalance >= estimatedCredits;
  const isLowBalance = currentBalance < estimatedCredits * 5;
  const costInfo = CREDIT_COSTS[action];

  return (
    <div className={`${styles.container} ${compact ? styles.compact : ''} ${!hasEnoughCredits ? styles.error : isLowBalance ? styles.warning : ''}`}>
      <div className={styles.main}>
        <Coins size={compact ? 14 : 16} className={styles.icon} />
        <div className={styles.info}>
          <span className={styles.cost}>~{estimatedCredits} credits</span>
          {!compact && <span className={styles.description}>{costInfo.description}</span>}
        </div>
      </div>
      
      {showWarning && !hasEnoughCredits && (
        <div className={styles.alert}>
          <AlertCircle size={14} />
          <span>Insufficient credits ({currentBalance} available)</span>
        </div>
      )}
      
      {showWarning && hasEnoughCredits && isLowBalance && (
        <div className={styles.lowBalance}>
          <Info size={14} />
          <span>{currentBalance} credits remaining</span>
        </div>
      )}
    </div>
  );
};

/**
 * Estimate credits for an action based on input
 */
export const estimateCredits = (
  action: keyof typeof CREDIT_COSTS,
  inputLength?: number,
  complexity?: 'low' | 'medium' | 'high'
): number => {
  const costs = CREDIT_COSTS[action];
  
  // Base estimation
  let estimate = costs.avg;
  
  // Adjust based on input length (for chat/rag)
  if (inputLength) {
    if (inputLength > 1000) estimate = costs.max;
    else if (inputLength > 500) estimate = Math.round((costs.avg + costs.max) / 2);
    else if (inputLength < 100) estimate = costs.min;
  }
  
  // Adjust based on complexity
  if (complexity === 'high') estimate = costs.max;
  else if (complexity === 'low') estimate = costs.min;
  
  return estimate;
};

export default CostEstimator;
