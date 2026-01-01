import React, { memo, useState, useEffect, useCallback } from 'react';
import { useAgentStore } from '../../../../../stores';
import { Icons } from '../../shared/Icons';
import * as executionsApi from '../../../../../api/executions';
import styles from './UtilityPanel.module.css';

// ============== UTILITY PANEL ==============
// Contract: reads [agent, execution], writes [agent]

interface UtilityPanelProps {
  className?: string;
}

const UtilityPanelComponent: React.FC<UtilityPanelProps> = ({ className }) => {
  const agents = useAgentStore(state => state.agents);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [executions, setExecutions] = useState<executionsApi.Execution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExecutions = useCallback(async () => {
    if (!selectedAgentId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await executionsApi.getExecutions(selectedAgentId);
      setExecutions((data as any).executions || data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load executions');
    } finally {
      setIsLoading(false);
    }
  }, [selectedAgentId]);

  useEffect(() => {
    fetchExecutions();
  }, [fetchExecutions]);

  const calculateUtilityMetrics = () => {
    if (executions.length === 0) {
      return [
        { id: 'u1', name: 'Task Completion Rate', value: 0, target: 95, unit: '%' },
        { id: 'u2', name: 'Success Rate', value: 0, target: 90, unit: '%' },
        { id: 'u3', name: 'Avg Duration', value: 0, target: 30, unit: 's' },
        { id: 'u4', name: 'Total Executions', value: 0, target: 100, unit: '' },
      ];
    }

    const completed = executions.filter(e => e.status === 'completed').length;
    const failed = executions.filter(e => e.status === 'failed').length;
    const total = executions.length;
    const successRate = total > 0 ? (completed / total) * 100 : 0;
    const avgDuration = executions.reduce((sum, e) => {
      if (e.completed_at && e.started_at) {
        const duration = new Date(e.completed_at).getTime() - new Date(e.started_at).getTime();
        return sum + duration / 1000;
      }
      return sum;
    }, 0) / (executions.length || 1);

    return [
      { id: 'u1', name: 'Task Completion Rate', value: successRate, target: 95, unit: '%' },
      { id: 'u2', name: 'Success Rate', value: successRate, target: 90, unit: '%' },
      { id: 'u3', name: 'Avg Duration', value: avgDuration, target: 30, unit: 's' },
      { id: 'u4', name: 'Total Executions', value: total, target: 100, unit: '' },
      { id: 'u5', name: 'Failed Tasks', value: failed, target: 5, unit: '' },
      { id: 'u6', name: 'Completed Tasks', value: completed, target: 95, unit: '' },
    ];
  };

  const utilityMetrics = calculateUtilityMetrics();
  const overallScore = utilityMetrics.length > 0 
    ? Math.round(utilityMetrics.reduce((sum, m) => sum + (m.value / m.target * 100), 0) / utilityMetrics.length)
    : 0;

  return (
    <div className={`${styles.panel} ${className || ''}`}>
      <div className={styles.panelHeader}>
        <h2><Icons.TrendingUp /> Utility Metrics</h2>
        <div className={styles.agentSelector}>
          <select 
            value={selectedAgentId || ''} 
            onChange={e => setSelectedAgentId(e.target.value)}
          >
            <option value="">All Agents</option>
            {agents.map(agent => (
              <option key={agent.id} value={agent.id}>{agent.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.panelContent}>
        {error && (
          <div className={styles.errorBanner}>
            <Icons.XCircle />
            <span>{error}</span>
          </div>
        )}
        {isLoading && (
          <div className={styles.loadingBanner}>
            <span>Loading utility metrics...</span>
          </div>
        )}
        <div className={styles.overallScore}>
          <div className={styles.scoreCircle}>
            <span className={styles.scoreValue}>{overallScore}</span>
            <span className={styles.scoreLabel}>Overall Utility</span>
          </div>
        </div>

        <div className={styles.metricsGrid}>
          {utilityMetrics.map(metric => (
            <div key={metric.id} className={styles.metricCard}>
              <h4>{metric.name}</h4>
              <div className={styles.metricValue}>
                {metric.value}{metric.unit}
              </div>
              <div className={styles.metricTarget}>
                Target: {metric.target}{metric.unit}
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const UtilityPanel = memo(UtilityPanelComponent);
export default UtilityPanel;
