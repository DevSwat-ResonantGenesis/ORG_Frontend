import React, { useState } from 'react';
import { executeWorkflow, type AgentTeam, type ExecuteWorkflowRequest } from '../../api/agentTeams';
import { Button } from '../../components/ui';
import { useToastContext } from '../../context/ToastContext';
import logger from '../../utils/logger';
import styles from './WorkflowExecutor.module.css';

interface WorkflowExecutorProps {
  team: AgentTeam;
  onExecute: (inputData: Record<string, any>, projectId?: string) => void;
  onClose: () => void;
}

export const WorkflowExecutor: React.FC<WorkflowExecutorProps> = ({
  team,
  onExecute,
  onClose,
}) => {
  const { success, error: showError } = useToastContext();
  const [message, setMessage] = useState('');
  const [projectId, setProjectId] = useState('');
  const [executing, setExecuting] = useState(false);

  const handleExecute = async () => {
    if (!message.trim()) {
      showError('Please enter a task or message');
      return;
    }

    setExecuting(true);
    try {
      const inputData = {
        message: message.trim(),
        task: message.trim(),
      };

      onExecute(inputData, projectId.trim() || undefined);
      success('Workflow execution started');
    } catch (err: unknown) {
      logger.error('Failed to execute workflow:', err);
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { status?: number; data?: { detail?: string } } }).response?.data?.detail
        : err && typeof err === 'object' && 'message' in err
        ? (err as { message: string }).message
        : 'Failed to execute workflow';
      showError(errorMessage as string);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className={styles.workflowExecutor}>
      <div className={styles.header}>
        <h2>Execute Workflow: {team.name}</h2>
        <button className={styles.closeButton} onClick={onClose}>×</button>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <label>Task or Message *</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g., Refactor this function to use async/await"
            rows={5}
            className={styles.textarea}
          />
        </div>

        <div className={styles.section}>
          <label>Project ID (Optional)</label>
          <input
            type="text"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="Project ID if working on a specific project"
            className={styles.input}
          />
        </div>

        <div className={styles.info}>
          <p><strong>Workflow Type:</strong> {team.workflow_config.type || 'sequential'}</p>
          <p><strong>Agents:</strong> {team.member_count}</p>
        </div>
      </div>

      <div className={styles.footer}>
        <Button onClick={onClose} variant="secondary">
          Cancel
        </Button>
        <Button
          onClick={handleExecute}
          variant="primary"
          disabled={executing || !message.trim()}
        >
          {executing ? 'Executing...' : 'Execute Workflow'}
        </Button>
      </div>
    </div>
  );
};

