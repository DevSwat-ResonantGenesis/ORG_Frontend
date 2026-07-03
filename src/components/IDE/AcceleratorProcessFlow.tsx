/**
 * AcceleratorProcessFlow - Windsurf-style minimal execution flow
 * Shows typing indicator, action steps, and file changes inline with chat
 */
import React, { useState, useEffect, useCallback, memo } from 'react';
import { useAutonomousExecution, usePerformanceMetrics } from '@/hooks/useDSIDPAccelerator';
import styles from './AcceleratorProcessFlow.module.css';

interface FileChange {
  path: string;
  action: 'created' | 'modified' | 'deleted';
  lines?: number;
}

interface ActionStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
  files?: FileChange[];
  thoughts?: string;
}

interface ProcessFlowProps {
  isActive?: boolean;
  compact?: boolean;
  onStepClick?: (step: ActionStep) => void;
}

export const AcceleratorProcessFlow = memo(function AcceleratorProcessFlow({
  isActive = false,
  compact = true,
  onStepClick,
}: ProcessFlowProps) {
  const { task, executing } = useAutonomousExecution();
  const metrics = usePerformanceMetrics(2000);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const steps: ActionStep[] = task?.steps?.map((s, i) => ({
    id: `step-${i}`,
    name: s.name,
    status: s.status,
    thoughts: s.output,
  })) || [];

  const currentStep = steps.find(s => s.status === 'running');
  const failedStep = steps.find(s => s.status === 'failed');
  const completedCount = steps.filter(s => s.status === 'completed').length;
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;
  const hasFailed = task?.status === 'failed' || !!failedStep;

  if (!isActive && !executing && steps.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Error indicator */}
      {hasFailed && failedStep && (
        <div className={styles.errorRow}>
          <span className={styles.errorIcon}>✗</span>
          <span className={styles.errorText}>{failedStep.thoughts || failedStep.name}</span>
        </div>
      )}

      {/* Minimal typing indicator when running */}
      {executing && currentStep && !hasFailed && (
        <div className={styles.typingRow}>
          <div className={styles.typingDots}>
            <span /><span /><span />
          </div>
          <span className={styles.typingText}>{currentStep.name}</span>
        </div>
      )}

      {/* Compact progress bar */}
      {steps.length > 0 && (
        <div className={styles.progressRow}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <span className={styles.progressText}>{completedCount}/{steps.length}</span>
        </div>
      )}

      {/* Steps list - compact, hoverable */}
      {steps.length > 0 && (
        <div className={styles.stepsContainer}>
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className={`${styles.stepItem} ${styles[step.status]}`}
              onMouseEnter={() => setExpandedStep(step.id)}
              onMouseLeave={() => setExpandedStep(null)}
              onClick={() => onStepClick?.(step)}
            >
              <div className={styles.stepIcon}>
                {step.status === 'completed' && '✓'}
                {step.status === 'running' && <span className={styles.spinner} />}
                {step.status === 'pending' && '○'}
                {step.status === 'failed' && '✗'}
              </div>
              <span className={styles.stepName}>{step.name}</span>
              
              {/* Hover tooltip with details */}
              {expandedStep === step.id && step.thoughts && (
                <div className={styles.stepTooltip}>
                  <div className={styles.tooltipContent}>{step.thoughts}</div>
                  {step.files && step.files.length > 0 && (
                    <div className={styles.tooltipFiles}>
                      {step.files.map((f, i) => (
                        <div key={i} className={`${styles.fileItem} ${styles[f.action]}`}>
                          <span className={styles.fileAction}>{f.action[0].toUpperCase()}</span>
                          <span className={styles.filePath}>{f.path}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Metrics row - only when executing */}
      {executing && metrics && (
        <div className={styles.metricsRow}>
          <span className={styles.metric}>
            <span className={styles.metricLabel}>Response</span>
            <span className={styles.metricValue}>{metrics.responseTime?.toFixed(0) || 0}ms</span>
          </span>
          <span className={styles.metric}>
            <span className={styles.metricLabel}>Cache</span>
            <span className={styles.metricValue}>{metrics.cacheHitRate?.toFixed(0) || 0}%</span>
          </span>
        </div>
      )}
    </div>
  );
});

/**
 * Inline message attachment showing execution details
 * Appears under assistant messages when accelerator was used
 */
export const AcceleratorMessageDetails = memo(function AcceleratorMessageDetails({
  messageId,
  filesModified = [],
  topics = [],
  actionPlan = [],
}: {
  messageId: string;
  filesModified?: string[];
  topics?: string[];
  actionPlan?: string[];
}) {
  const [isHovered, setIsHovered] = useState(false);

  if (filesModified.length === 0 && topics.length === 0 && actionPlan.length === 0) {
    return null;
  }

  return (
    <div 
      className={styles.messageDetails}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Collapsed view - just icons */}
      <div className={styles.detailsCollapsed}>
        {filesModified.length > 0 && (
          <span className={styles.detailIcon} title={`${filesModified.length} files modified`}>
            📄 {filesModified.length}
          </span>
        )}
        {topics.length > 0 && (
          <span className={styles.detailIcon} title={`${topics.length} topics`}>
            💭 {topics.length}
          </span>
        )}
        {actionPlan.length > 0 && (
          <span className={styles.detailIcon} title={`${actionPlan.length} actions`}>
            📋 {actionPlan.length}
          </span>
        )}
      </div>

      {/* Expanded view on hover */}
      {isHovered && (
        <div className={styles.detailsExpanded}>
          {filesModified.length > 0 && (
            <div className={styles.detailSection}>
              <span className={styles.detailTitle}>Files Modified</span>
              {filesModified.map((f, i) => (
                <span key={i} className={styles.detailItem}>{f}</span>
              ))}
            </div>
          )}
          {topics.length > 0 && (
            <div className={styles.detailSection}>
              <span className={styles.detailTitle}>Topics</span>
              {topics.map((t, i) => (
                <span key={i} className={styles.detailItem}>{t}</span>
              ))}
            </div>
          )}
          {actionPlan.length > 0 && (
            <div className={styles.detailSection}>
              <span className={styles.detailTitle}>Action Plan</span>
              {actionPlan.map((a, i) => (
                <span key={i} className={styles.detailItem}>{i + 1}. {a}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default AcceleratorProcessFlow;
