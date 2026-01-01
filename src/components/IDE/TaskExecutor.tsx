import React, { useState, useCallback } from 'react';
import { 
  useOrchestrator, 
  useTaskProgress,
  type Task,
  type ExecutionPlan,
  type ExecutionStep,
} from '../../services';
import styles from './TaskExecutor.module.css';

interface TaskExecutorProps {
  onClose?: () => void;
}

export const TaskExecutor: React.FC<TaskExecutorProps> = ({ onClose }) => {
  const { currentTask, isExecuting, createAndExecute, executeTask, rollbackTask } = useOrchestrator();
  const [taskDescription, setTaskDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showPlan, setShowPlan] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<ExecutionPlan | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!taskDescription.trim()) return;

    try {
      const result = await createAndExecute(taskDescription, {
        files: selectedFiles.map(path => ({ path, content: '', language: 'typescript' })),
      });

      if (result && 'steps' in result && 'requiresConfirmation' in result) {
        // Got a plan that needs confirmation
        setPendingPlan(result as ExecutionPlan);
        setShowPlan(true);
      }
    } catch (error) {
      console.error('Task execution failed:', error);
    }
  }, [taskDescription, selectedFiles, createAndExecute]);

  const handleExecutePlan = useCallback(async () => {
    if (!currentTask) return;
    
    try {
      await executeTask(currentTask.id);
      setShowPlan(false);
      setPendingPlan(null);
      setTaskDescription('');
    } catch (error) {
      console.error('Execution failed:', error);
    }
  }, [currentTask, executeTask]);

  const handleRollback = useCallback(async () => {
    if (!currentTask) return;
    
    try {
      await rollbackTask(currentTask.id);
    } catch (error) {
      console.error('Rollback failed:', error);
    }
  }, [currentTask, rollbackTask]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Task Executor</h3>
        <span className={styles.badge}>
          {isExecuting ? 'Executing...' : 'Ready'}
        </span>
        {onClose && (
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        )}
      </div>

      {!showPlan ? (
        <div className={styles.inputSection}>
          <textarea
            className={styles.taskInput}
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            placeholder="Describe what you want to do...&#10;&#10;Examples:&#10;• Refactor the user authentication to use JWT&#10;• Add error handling to all API endpoints&#10;• Create unit tests for the utils folder"
            rows={6}
            disabled={isExecuting}
          />
          
          <div className={styles.actions}>
            <button 
              className={styles.primaryBtn}
              onClick={handleSubmit}
              disabled={!taskDescription.trim() || isExecuting}
            >
              {isExecuting ? 'Planning...' : 'Plan & Execute'}
            </button>
          </div>
        </div>
      ) : (
        <PlanView 
          plan={pendingPlan}
          task={currentTask}
          onExecute={handleExecutePlan}
          onCancel={() => {
            setShowPlan(false);
            setPendingPlan(null);
          }}
          isExecuting={isExecuting}
        />
      )}

      {currentTask && currentTask.status !== 'pending' && (
        <TaskProgressView 
          taskId={currentTask.id} 
          onRollback={handleRollback}
        />
      )}

      {currentTask?.proof && (
        <ProofView proof={currentTask.proof as any} />
      )}
    </div>
  );
};

interface PlanViewProps {
  plan: ExecutionPlan | null;
  task: Task | null;
  onExecute: () => void;
  onCancel: () => void;
  isExecuting: boolean;
}

const PlanView: React.FC<PlanViewProps> = ({ plan, task, onExecute, onCancel, isExecuting }) => {
  if (!plan) return null;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      default: return '#22c55e';
    }
  };

  return (
    <div className={styles.planView}>
      <div className={styles.planHeader}>
        <h4>Execution Plan</h4>
        <div className={styles.planMeta}>
          <span className={styles.riskBadge} style={{ backgroundColor: getRiskColor(plan.riskLevel) }}>
            {plan.riskLevel} risk
          </span>
          <span>{plan.steps.length} steps</span>
          <span>~{Math.round(plan.estimatedDuration / 1000)}s</span>
          <span>${plan.estimatedCost.toFixed(3)}</span>
        </div>
      </div>

      <div className={styles.stepsList}>
        {plan.steps.map((step, index) => (
          <StepPreview key={step.id} step={step} index={index} />
        ))}
      </div>

      {plan.requiresConfirmation && (
        <div className={styles.warning}>
          ⚠️ This plan includes potentially destructive operations. Please review carefully.
        </div>
      )}

      <div className={styles.planActions}>
        <button className={styles.secondaryBtn} onClick={onCancel} disabled={isExecuting}>
          Cancel
        </button>
        <button className={styles.primaryBtn} onClick={onExecute} disabled={isExecuting}>
          {isExecuting ? 'Executing...' : 'Execute Plan'}
        </button>
      </div>
    </div>
  );
};

interface StepPreviewProps {
  step: ExecutionStep;
  index: number;
}

const StepPreview: React.FC<StepPreviewProps> = ({ step, index }) => {
  const getStepIcon = (type: string) => {
    switch (type) {
      case 'file_create': return '📄';
      case 'file_modify': return '✏️';
      case 'file_delete': return '🗑️';
      case 'code_execute': return '▶️';
      case 'test_run': return '🧪';
      case 'type_check': return '🔍';
      case 'lint_check': return '📋';
      case 'git_commit': return '📝';
      default: return '⚙️';
    }
  };

  return (
    <div className={styles.stepPreview}>
      <span className={styles.stepNumber}>{index + 1}</span>
      <span className={styles.stepIcon}>{getStepIcon(step.type)}</span>
      <div className={styles.stepContent}>
        <span className={styles.stepType}>{step.type.replace('_', ' ')}</span>
        <span className={styles.stepDesc}>{step.description}</span>
        {step.action.target && (
          <span className={styles.stepTarget}>{step.action.target}</span>
        )}
      </div>
      {step.verification.type !== 'none' && (
        <span className={styles.verifyBadge}>✓ {step.verification.type}</span>
      )}
    </div>
  );
};

interface TaskProgressViewProps {
  taskId: string;
  onRollback: () => void;
}

const TaskProgressView: React.FC<TaskProgressViewProps> = ({ taskId, onRollback }) => {
  const { task, currentStep, progress } = useTaskProgress(taskId);

  if (!task) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#22c55e';
      case 'failed': return '#ef4444';
      case 'rolled_back': return '#f59e0b';
      case 'executing': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <div className={styles.progressView}>
      <div className={styles.progressHeader}>
        <h4>Execution Progress</h4>
        <span 
          className={styles.statusBadge}
          style={{ backgroundColor: getStatusColor(task.status) }}
        >
          {task.status}
        </span>
      </div>

      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill}
          style={{ width: `${progress}%` }}
        />
      </div>

      {currentStep && (
        <div className={styles.currentStep}>
          <span>Current: {(currentStep as any).description}</span>
        </div>
      )}

      {task.plan?.steps.map((step, index) => (
        <div 
          key={step.id}
          className={`${styles.stepStatus} ${styles[step.status]}`}
        >
          <span className={styles.stepStatusIcon}>
            {step.status === 'completed' ? '✓' :
             step.status === 'failed' ? '✗' :
             step.status === 'running' ? '⟳' :
             step.status === 'rolled_back' ? '↩' : '○'}
          </span>
          <span>{step.description}</span>
          {step.result?.duration && (
            <span className={styles.stepDuration}>
              {(step.result.duration / 1000).toFixed(2)}s
            </span>
          )}
        </div>
      ))}

      {(task.status === 'completed' || task.status === 'failed') && (
        <div className={styles.progressActions}>
          <button className={styles.dangerBtn} onClick={onRollback}>
            Rollback All Changes
          </button>
        </div>
      )}
    </div>
  );
};

interface ProofViewProps {
  proof: {
    success: boolean;
    summary: string;
    totalDuration: number;
    totalCost: number;
    tokensUsed: number;
    diffs: Array<{
      path: string;
      type: string;
      additions: number;
      deletions: number;
    }>;
    verificationResults: Array<{
      type: string;
      passed: boolean;
      output: string;
    }>;
  };
}

const ProofView: React.FC<ProofViewProps> = ({ proof }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.proofView}>
      <div className={styles.proofHeader} onClick={() => setExpanded(!expanded)}>
        <h4>
          {proof.success ? '✓' : '✗'} Execution Proof
        </h4>
        <span>{expanded ? '▼' : '▶'}</span>
      </div>

      <div className={styles.proofSummary}>
        <p>{proof.summary}</p>
        <div className={styles.proofStats}>
          <span>Duration: {(proof.totalDuration / 1000).toFixed(2)}s</span>
          <span>Cost: ${proof.totalCost.toFixed(4)}</span>
          <span>Tokens: {proof.tokensUsed}</span>
        </div>
      </div>

      {expanded && (
        <>
          {proof.diffs.length > 0 && (
            <div className={styles.proofSection}>
              <h5>Files Changed</h5>
              {proof.diffs.map((diff, i) => (
                <div key={i} className={styles.diffItem}>
                  <span className={styles.diffType}>{diff.type}</span>
                  <span className={styles.diffPath}>{diff.path}</span>
                  <span className={styles.diffStats}>
                    <span className={styles.additions}>+{diff.additions}</span>
                    <span className={styles.deletions}>-{diff.deletions}</span>
                  </span>
                </div>
              ))}
            </div>
          )}

          {proof.verificationResults.length > 0 && (
            <div className={styles.proofSection}>
              <h5>Verification Results</h5>
              {proof.verificationResults.map((result, i) => (
                <div key={i} className={`${styles.verifyResult} ${result.passed ? styles.passed : styles.failed}`}>
                  <span>{result.passed ? '✓' : '✗'} {result.type}</span>
                  {result.output && (
                    <pre className={styles.verifyOutput}>{result.output.slice(0, 500)}</pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TaskExecutor;
