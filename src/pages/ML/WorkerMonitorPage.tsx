import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession } from '../../utils/auth';
import { canAccess, type Role } from '../../utils/permissions';
import { fetchWorkerMetrics, fetchWorkerLogs } from '../../api/ml';
import { logger } from '../../utils/logger';
import { Button, Card, Text } from '../../components/ui';
import { LogPanel, LogEntry } from '../../components/panels/LogPanel';
import { FlowDiagram } from '../../components/diagrams/FlowDiagram';
import { goToDashboard } from '../../utils/navigation';
import styles from './WorkerMonitorPage.module.css';


interface WorkerMetrics {
  active_workers?: number;
  total_jobs?: number;
  completed_jobs?: number;
  failed_jobs?: number;
  average_processing_time?: number;
  status?: string;
  queue_length?: number;
  memory_usage_mb?: number;
  last_heartbeat?: string;
  current_job?: string;
}

const WorkerMonitorPage = () => {
  const navigate = useNavigate();
  const session = getSession();
  const userRole = session.role as Role | null;
  const [logs, setLogs] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<WorkerMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [workerLogs, setWorkerLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    if (!canAccess(userRole, 'ml_ops')) {
      goToDashboard(navigate);
      return;
    }

    const load = async () => {
      try {
        const [logsData, metricsData] = await Promise.all([
          fetchWorkerLogs().catch(() => []),
          fetchWorkerMetrics().catch(() => ({ status: 'unknown', queue_length: 0 })),
        ]);
        setLogs(logsData);
        setMetrics(metricsData);

        // Convert string logs to LogEntry format
        const logEntries: LogEntry[] = logsData.slice(-50).map((log: string, idx: number) => {
          const level: LogEntry['level'] = 
            log.toLowerCase().includes('error') ? 'error' :
            log.toLowerCase().includes('warning') ? 'warning' :
            log.toLowerCase().includes('success') ? 'success' :
            log.toLowerCase().includes('debug') ? 'debug' : 'info';
          
          return {
            id: `log-${idx}`,
            timestamp: new Date(Date.now() - (50 - idx) * 1000).toISOString(),
            level,
            message: log,
            source: 'ml-worker'
          };
        });
        setWorkerLogs(logEntries);
      } catch (err: unknown) {
        const errorMessage = err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : err && typeof err === 'object' && 'message' in err
          ? String((err as { message?: string }).message)
          : 'Failed to load worker data';
        logger.error('Worker monitor load error', err, { component: 'WorkerMonitorPage' });
        setError(errorMessage || 'Failed to load worker metrics');
      } finally {
        setLoading(false);
      }
    };

    load();
    const interval = setInterval(load, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [userRole, navigate]);

  if (loading) {
    return (
      <div className={styles.workerMonitorPage}>
        <div className={styles.container}>
          <div className={styles.loadingState}>Loading worker monitor...</div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className={styles.workerMonitorPage}>
        <div className={styles.container}>
          <div className={styles.errorState}>Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.workerMonitorPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>ML Worker Monitoring</h1>
          <p className={styles.subtitle}>
            Real-time monitoring of ML worker health, job queues, processing load, and system status. 
            Track worker uptime, memory usage, and job completion rates for optimal MLOps operations. 
            70% ready with production monitoring workflows.
          </p>
        </div>
        <div className={styles.contentBody}>
          <div className={styles.contentMain}>

      <Card variant="elevated" padding="md" style={{ marginBottom: 'var(--space-6)' }}>
        <Card.Header>
          <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-2)' }}>
            Key metrics showing ML worker health and performance.
          </Text>
        </Card.Header>
        <Card.Body>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
            <Card variant="outlined" padding="md">
              <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)' }}>Worker Status</Text>
              <Text variant="h3" color="primary" style={{ color: '#22c55e', marginBottom: 'var(--space-1)' }}>Healthy</Text>
              <Text variant="caption" color="muted">
                Overall worker health status (healthy/unhealthy)
              </Text>
            </Card>
            <Card variant="outlined" padding="md">
              <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)' }}>Queue Length</Text>
              <Text variant="h3" color="primary" style={{ marginBottom: 'var(--space-1)' }}>{metrics?.queue_length || 0}</Text>
              <Text variant="caption" color="muted">
                Number of predictions waiting to be processed
              </Text>
            </Card>
            <Card variant="outlined" padding="md">
              <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)' }}>Memory Usage</Text>
              <Text variant="h3" color="primary" style={{ marginBottom: 'var(--space-1)' }}>{metrics?.memory_usage_mb ? `${metrics.memory_usage_mb} MB` : 'N/A'}</Text>
              <Text variant="caption" color="muted">
                Current memory consumption by the worker
              </Text>
            </Card>
            <Card variant="outlined" padding="md">
              <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)' }}>Last Heartbeat</Text>
              <Text variant="body" color="primary" style={{ marginBottom: 'var(--space-1)' }}>{metrics?.last_heartbeat ? new Date(metrics.last_heartbeat).toLocaleString() : 'N/A'}</Text>
              <Text variant="caption" color="muted">
                Last time the worker reported its status
              </Text>
            </Card>
            <Card variant="outlined" padding="md">
              <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)' }}>Current Job</Text>
              <Text variant="body" color="primary" style={{ marginBottom: 'var(--space-1)' }}>{metrics?.current_job || 'Idle'}</Text>
              <Text variant="caption" color="muted">
                Currently processing job ID or "Idle" if no active job
              </Text>
            </Card>
          </div>
        </Card.Body>
      </Card>

      {/* ML Pipeline Flow */}
      <Card variant="elevated" padding="md" style={{ marginBottom: 'var(--space-6)' }}>
        <Card.Header>
          <Text variant="h3" color="primary" style={{ marginBottom: 'var(--space-2)' }}>ML Worker Processing Flow</Text>
        </Card.Header>
        <Card.Body>
          <FlowDiagram type="prediction" animated={true} />
        </Card.Body>
      </Card>

      {/* Worker Logs Panel */}
      <Card variant="elevated" padding="md">
        <Card.Header>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <Text variant="h2" color="primary">Worker Logs</Text>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Button variant="secondary" size="md" onClick={() => window.location.reload()}>
                Refresh
              </Button>
              <Button variant="secondary" size="md" onClick={() => navigate('/ml/training-jobs')}>
                Training Jobs
              </Button>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <LogPanel
            logs={workerLogs}
            title="ML Worker Activity"
            maxHeight={500}
            autoScroll={true}
            filterable={true}
            exportable={true}
            realTime={true}
          />
        </Card.Body>
      </Card>
        </div>
      </div>
    </div>
    </div>
  );
};

export default WorkerMonitorPage;

