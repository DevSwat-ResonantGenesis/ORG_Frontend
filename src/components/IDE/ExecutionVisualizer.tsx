// ============== EXECUTION VISUALIZER COMPONENT ==============
// Shows real-time execution plan progress

import React, { memo, useState, useEffect, useCallback } from 'react';
import {
  ExecutionPlan,
  ExecutionStep,
  StepResult,
  StepStatus,
  Suggestion,
} from '../../services/ai/types';
import styles from './ExecutionVisualizer.module.css';

interface ExecutionVisualizerProps {
  plan: ExecutionPlan | null;
  onStepClick?: (step: ExecutionStep) => void;
  onSuggestionClick?: (suggestion: Suggestion) => void;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  suggestions?: Suggestion[];
  className?: string;
}

const getStatusIcon = (status: StepStatus): string => {
  switch (status) {
    case 'completed': return '✓';
    case 'in_progress': return '●';
    case 'failed': return '✗';
    case 'skipped': return '○';
    default: return '○';
  }
};

const getStatusColor = (status: StepStatus): string => {
  switch (status) {
    case 'completed': return '#22c55e';
    case 'in_progress': return '#0ea5e9';
    case 'failed': return '#ef4444';
    case 'skipped': return '#6b7280';
    default: return '#4b5563';
  }
};

const getActionIcon = (action: string): string => {
  switch (action) {
    case 'read_file': return '📖';
    case 'write_file': return '📝';
    case 'create_file': return '➕';
    case 'delete_file': return '🗑️';
    case 'modify_file': return '✏️';
    case 'run_command': return '▶️';
    case 'search_code': return '🔍';
    case 'analyze_code': return '🔬';
    case 'verify_change': return '✅';
    case 'ask_user': return '❓';
    case 'wait': return '⏳';
    default: return '⚡';
  }
};

const ExecutionStepComponent: React.FC<{
  step: ExecutionStep;
  index: number;
  isActive: boolean;
  onClick?: () => void;
}> = memo(({ step, index, isActive, onClick }) => {
  const statusColor = getStatusColor(step.status);
  
  return (
    <div 
      className={`${styles.step} ${isActive ? styles.active : ''} ${styles[step.status]}`}
      onClick={onClick}
    >
      <div className={styles.stepConnector}>
        <div 
          className={styles.stepDot}
          style={{ backgroundColor: statusColor, borderColor: statusColor }}
        >
          {step.status === 'in_progress' ? (
            <span className={styles.spinner} />
          ) : (
            <span className={styles.statusIcon}>{getStatusIcon(step.status)}</span>
          )}
        </div>
        {index > 0 && <div className={styles.stepLine} style={{ backgroundColor: statusColor }} />}
      </div>
      
      <div className={styles.stepContent}>
        <div className={styles.stepHeader}>
          <span className={styles.actionIcon}>{getActionIcon(step.action)}</span>
          <span className={styles.stepAction}>{step.action.replace('_', ' ')}</span>
          {step.target && (
            <span className={styles.stepTarget}>{step.target}</span>
          )}
        </div>
        <p className={styles.stepPurpose}>{step.purpose}</p>
        
        {step.result && (
          <div className={styles.stepResult}>
            {step.result.success ? (
              <span className={styles.resultSuccess}>{step.result.output.slice(0, 100)}</span>
            ) : (
              <span className={styles.resultError}>{step.result.error}</span>
            )}
            <span className={styles.resultDuration}>{step.result.duration}ms</span>
          </div>
        )}
      </div>
    </div>
  );
});

ExecutionStepComponent.displayName = 'ExecutionStepComponent';

const SuggestionCard: React.FC<{
  suggestion: Suggestion;
  onClick?: () => void;
}> = memo(({ suggestion, onClick }) => {
  return (
    <button className={styles.suggestionCard} onClick={onClick}>
      <div className={styles.suggestionHeader}>
        <span className={styles.suggestionType}>{suggestion.type}</span>
        <span className={styles.suggestionConfidence}>
          {Math.round(suggestion.confidence * 100)}%
        </span>
      </div>
      <h4 className={styles.suggestionTitle}>{suggestion.title}</h4>
      <p className={styles.suggestionDesc}>{suggestion.description}</p>
    </button>
  );
});

SuggestionCard.displayName = 'SuggestionCard';

export const ExecutionVisualizer: React.FC<ExecutionVisualizerProps> = memo(({
  plan,
  onStepClick,
  onSuggestionClick,
  onPause,
  onResume,
  onCancel,
  suggestions = [],
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const handlePause = useCallback(() => {
    setIsPaused(true);
    onPause?.();
  }, [onPause]);

  const handleResume = useCallback(() => {
    setIsPaused(false);
    onResume?.();
  }, [onResume]);

  const handleCancel = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  if (!plan) {
    return null;
  }

  const completedSteps = plan.steps.filter(s => s.status === 'completed').length;
  const progress = (completedSteps / plan.steps.length) * 100;
  const isExecuting = plan.status === 'executing';

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button 
            className={styles.expandBtn}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          <h3 className={styles.title}>Execution Plan</h3>
          <span className={`${styles.status} ${styles[plan.status]}`}>
            {plan.status}
          </span>
        </div>
        
        <div className={styles.headerRight}>
          <span className={styles.progress}>
            {completedSteps}/{plan.steps.length} steps
          </span>
          
          {isExecuting && (
            <div className={styles.controls}>
              {isPaused ? (
                <button className={styles.controlBtn} onClick={handleResume}>
                  ▶ Resume
                </button>
              ) : (
                <button className={styles.controlBtn} onClick={handlePause}>
                  ⏸ Pause
                </button>
              )}
              <button className={`${styles.controlBtn} ${styles.cancelBtn}`} onClick={handleCancel}>
                ✕ Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill}
          style={{ width: `${progress}%` }}
        />
      </div>

      {isExpanded && (
        <>
          <div className={styles.intent}>
            <span className={styles.intentLabel}>Intent:</span>
            <span className={styles.intentType}>{plan.intent.type}</span>
            <span className={styles.intentDesc}>{plan.intent.description}</span>
          </div>

          <div className={styles.timeline}>
            {plan.steps.map((step, index) => (
              <ExecutionStepComponent
                key={step.id}
                step={step}
                index={index}
                isActive={index === plan.currentStepIndex}
                onClick={() => onStepClick?.(step)}
              />
            ))}
          </div>

          <div className={styles.successCriteria}>
            <h4>Success Criteria</h4>
            <ul>
              {plan.successCriteria.map((criterion, i) => (
                <li 
                  key={i} 
                  className={criterion.met ? styles.met : styles.pending}
                >
                  <span className={styles.criterionIcon}>
                    {criterion.met ? '✓' : '○'}
                  </span>
                  {criterion.description}
                </li>
              ))}
            </ul>
          </div>

          {suggestions.length > 0 && (
            <div className={styles.suggestions}>
              <h4>What's Next?</h4>
              <div className={styles.suggestionsList}>
                {suggestions.map(suggestion => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onClick={() => onSuggestionClick?.(suggestion)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
});

ExecutionVisualizer.displayName = 'ExecutionVisualizer';

export default ExecutionVisualizer;
