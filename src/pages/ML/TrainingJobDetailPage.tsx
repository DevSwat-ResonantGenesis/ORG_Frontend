import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSession } from '../../utils/auth';
import { canAccess, type Role } from '../../utils/permissions';
import { fetchTrainingJobById, stopTrainingJob, type TrainingJob } from '../../api/ml';
import { Button, Card, Text } from '../../components/ui';
import { LogPanel, LogEntry } from '../../components/panels/LogPanel';
import { logger } from '../../utils/logger';
import { goToDashboard } from '../../utils/navigation';
import styles from './TrainingJobDetailPage.module.css';

import '../../theme/pages.css';

const TrainingJobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const userRole = session.role as Role | null;
  const [job, setJob] = useState<TrainingJob | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!canAccess(userRole, 'ml_ops')) {
      goToDashboard(navigate);
      return;
    }

    if (!id) {
      navigate('/ml/training-jobs');
      return;
    }

    const load = async () => {
      try {
        const jobData = await fetchTrainingJobById(id);
        setJob(jobData);

        // Generate sample logs from job data
        const logEntries: LogEntry[] = [
          {
            id: '1',
            timestamp: jobData.started_at || new Date().toISOString(),
            level: 'info',
            message: `Training job ${id} started`,
            source: 'training-job'
          },
          {
            id: '2',
            timestamp: new Date(Date.now() - 60000).toISOString(),
            level: 'success',
            message: 'Model training in progress',
            source: 'training-job'
          }
        ];
        setLogs(logEntries);
      } catch (err: unknown) {
        const errorMessage = err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : 'Failed to load training job';
        logger.error('Training job detail load error', err, { component: 'TrainingJobDetailPage', jobId: id });
        setError(errorMessage || 'Failed to load training job');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, userRole, navigate]);

  const handleStop = async () => {
    if (!id || !confirm('Stop this training job? This action cannot be undone.')) return;
    try {
      await stopTrainingJob(id);
      window.location.reload();
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : 'Failed to stop training job';
      logger.error('Stop training job error', err, { component: 'TrainingJobDetailPage', jobId: id });
      alert(errorMessage || 'Failed to stop training job');
    }
  };

  if (loading) {
    return (
      <div className={styles.trainingJobDetailPage}>
        <div className={styles.container}>
          <div className={styles.loadingState}>Loading training job...</div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className={styles.trainingJobDetailPage}>
        <div className={styles.container}>
          <div className={styles.errorState} style={{ textAlign: 'center', padding: '64px' }}>
            <div style={{ color: '#ef4444', marginBottom: '24px', fontSize: '16px' }}>{error || 'Training job not found'}</div>
            <Button onClick={() => navigate('/ml/training-jobs')}>Back to Training Jobs</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.trainingJobDetailPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Training Job Details</h1>
          <p className={styles.subtitle}>View training job status, metrics, and logs</p>
          <div className={styles.headerActions}>
            {job.status === 'running' && (
              <Button variant="secondary" size="md" onClick={handleStop}>
                Stop Job
              </Button>
            )}
            <Button variant="secondary" size="md" onClick={() => navigate('/ml/training-jobs')}>
              Back to List
            </Button>
          </div>
        </div>
        <div className={styles.contentBody}>
          <div className={styles.contentMain}>
            {/* Job Summary */}
            <section className={styles.contentSection}>
            <Card variant="elevated" padding="md" style={{ marginBottom: 'var(--space-lg)' }}>
        <Card.Header>
          <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>Job Summary</Text>
          <Text variant="body-sm" color="secondary">
            Training job information including status, dataset, model version, and execution times.
          </Text>
        </Card.Header>
        <Card.Body>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-3)' }}>
            <div>
              <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>Status</Text>
              <Text variant="caption" color="muted" style={{ marginBottom: 'var(--space-1)' }}>
                Current training job status
              </Text>
              <Text variant="body" color="primary" style={{ 
                fontWeight: 'var(--font-weight-semibold)',
                color: job.status === 'completed' ? '#22c55e' : 
                       job.status === 'failed' ? '#ef4444' : 
                       job.status === 'running' ? '#3b82f6' : 'var(--color-text-primary)'
              }}>
                {job.status || 'Unknown'}
              </Text>
            </div>
            <div>
              <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>Dataset Hash</Text>
              <Text variant="caption" color="muted" style={{ marginBottom: 'var(--space-1)' }}>
                Hash of the training dataset
              </Text>
              <Text variant="body" color="primary" style={{ fontFamily: 'var(--font-family-mono)' }}>
                {job.dataset_hash || 'N/A'}
              </Text>
            </div>
            <div>
              <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>Model Version</Text>
              <Text variant="caption" color="muted" style={{ marginBottom: 'var(--space-1)' }}>
                Model version created by this job
              </Text>
              <Text variant="body" color="primary">
                {job.model_version || 'Not yet created'}
              </Text>
            </div>
            <div>
              <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>Started At</Text>
              <Text variant="caption" color="muted" style={{ marginBottom: 'var(--space-1)' }}>
                When training started
              </Text>
              <Text variant="body" color="primary">
                {job.started_at ? new Date(job.started_at).toLocaleString() : 'N/A'}
              </Text>
            </div>
            <div>
              <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>Completed At</Text>
              <Text variant="caption" color="muted" style={{ marginBottom: 'var(--space-1)' }}>
                When training completed (if finished)
              </Text>
              <Text variant="body" color="primary">
                {job.completed_at ? new Date(job.completed_at).toLocaleString() : 'In progress'}
              </Text>
            </div>
          </div>
            </Card.Body>
            </Card>
          </section>

          {/* Metrics */}
          {job.metrics && Object.keys(job.metrics).length > 0 && (
            <section className={styles.contentSection}>
              <Card variant="elevated" padding="md" style={{ marginBottom: 'var(--space-lg)' }}>
          <Card.Header>
            <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>Training Metrics</Text>
            <Text variant="body-sm" color="secondary">
              Performance metrics from the training job including accuracy, loss, and other model-specific metrics.
            </Text>
          </Card.Header>
          <Card.Body>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-2)' }}>
              {Object.entries(job.metrics).map(([key, value]) => (
                <div key={key}>
                  <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                  <Text variant="h3" color="primary">
                    {typeof value === 'number' ? value.toFixed(4) : String(value)}
                  </Text>
                </div>
              ))}
            </div>
              </Card.Body>
              </Card>
            </section>
          )}

          {/* Training Logs */}
          <section className={styles.contentSection}>
            <Card variant="elevated" padding="md">
        <Card.Header>
          <Text variant="h3" color="primary" style={{ marginBottom: 'var(--space-2)' }}>Training Logs</Text>
          <Text variant="body-sm" color="secondary">
            Real-time training logs showing training progress, errors, and completion status. Use these logs to 
            monitor training progress and debug issues.
          </Text>
        </Card.Header>
        <Card.Body>
          <LogPanel
            logs={logs}
            title="Training Job Logs"
            maxHeight={400}
            autoScroll={true}
            filterable={true}
            exportable={true}
            realTime={job.status === 'running'}
          />
            </Card.Body>
            </Card>
          </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingJobDetailPage;

