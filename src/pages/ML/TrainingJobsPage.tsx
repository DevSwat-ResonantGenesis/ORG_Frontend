import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession } from '../../utils/auth';
import { canAccess, type Role } from '../../utils/permissions';
import { fetchTrainingJobs, stopTrainingJob, type TrainingJob } from '../../api/ml';
import { Button, Card, Text } from '../../components/ui';
import { ResponsiveTable } from '@/components/shared/ResponsiveTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { useToastContext } from '../../context/ToastContext';
import { FlowDiagram } from '../../components/diagrams/FlowDiagram';
import { logger } from '../../utils/logger';
import { goToDashboard } from '../../utils/navigation';
import { ModernPageLayout } from '../../components/layout/ModernPageLayout';

const TrainingJobsPage = () => {
  const navigate = useNavigate();
  const session = getSession();
  const userRole = session.role as Role | null;
  const toast = useToastContext();
  const [jobs, setJobs] = useState<TrainingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!canAccess(userRole, 'ml_ops')) {
      goToDashboard(navigate);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const jobsData = await fetchTrainingJobs();
      setJobs(jobsData.map(j => ({
        ...j,
        metrics: j.metrics || {}
      })));
    } catch (err: unknown) {
      logger.error('Training jobs load error', err, { component: 'TrainingJobsPage' });
      
      let errorMessage = 'Failed to load training jobs';
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { status?: number; data?: { detail?: string } } }).response;
        if (response?.status === 404) {
          errorMessage = 'Training jobs endpoint is not available. The backend may not have this endpoint configured.';
        } else if (response?.status === 500) {
          errorMessage = 'Server error loading training jobs. Please try again later.';
        } else {
          errorMessage = response?.data?.detail || 'Failed to load training jobs';
        }
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = String((err as { message?: string }).message);
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userRole, navigate, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const headerActions = (
    <>
          <Button variant="secondary" size="md" onClick={() => navigate('/ml/model-versions')}>
            Model Versions
          </Button>
          <Button variant="secondary" size="md" onClick={() => navigate('/ml/worker')}>
            Worker Monitor
          </Button>
      <Button size="md" onClick={() => navigate('/ml/training-jobs/new')}>
        Create Training Job
      </Button>
    </>
  );

  return (
    <ModernPageLayout
      title="ML Training Jobs"
      subtitle="Complete MLOps lifecycle management. Create, monitor, and manage ML model training jobs with drift detection, auto-retraining, and performance tracking. 70% ready with production workflows."
      headerActions={headerActions}
      loading={loading}
      error={error}
      onRetry={load}
      maxWidth="xl"
    >
          {/* Training Pipeline Flow */}
      <Card variant="elevated" padding="md">
        <Card.Header>
          <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>
            Training Pipeline Flow
          </Text>
          <Text variant="body-sm" color="secondary">
            Data ingestion, preprocessing, model training, validation, and version creation.
          </Text>
        </Card.Header>
        <Card.Body>
              <FlowDiagram type="prediction" animated={true} />
            </Card.Body>
            </Card>

      {/* Training Jobs Table or Empty State */}
          {jobs.length === 0 ? (
        <EmptyState
          title="No Training Jobs"
          description="You haven't created any training jobs yet. Create a new training job to retrain your ML models on updated data."
          icon="🤖"
          action={{
            label: "Create Training Job",
            onClick: () => navigate('/ml/training-jobs/new'),
            variant: 'primary' as const
          }}
          secondaryAction={{
            label: "View Model Versions",
            onClick: () => navigate('/ml/model-versions'),
            variant: 'secondary' as const
          }}
            />
          ) : (
        <Card variant="elevated" padding="md">
          <Card.Header>
            <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>
              Training Jobs
            </Text>
            <Text variant="body-sm" color="secondary">
              {jobs.length} training job{jobs.length !== 1 ? 's' : ''} found
            </Text>
          </Card.Header>
          <Card.Body style={{ padding: 0 }}>
              <ResponsiveTable
          columns={[
            {
              key: 'id',
              label: 'Job ID',
              mobileLabel: 'ID',
                  render: (value) => <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '12px' }}>{String(value ?? '')}</span>
            },
            {
              key: 'status',
              label: 'Status',
              render: (value) => (
                <span
                  style={{
                    padding: '4px 10px',
                        borderRadius: 'var(--border-radius-sm)',
                    fontSize: '12px',
                    fontWeight: 500,
                    background:
                      value === 'completed'
                        ? '#dcfce7'
                        : value === 'running'
                        ? '#dbeafe'
                        : '#fee2e2',
                    color:
                      value === 'completed'
                        ? '#166534'
                        : value === 'running'
                        ? '#1e40af'
                        : value === 'failed'
                        ? '#991b1b'
                        : '#991b1b',
                  }}
                >
                  {String(value ?? '')}
                </span>
              )
            },
            {
              key: 'dataset_hash',
              label: 'Dataset',
              mobileLabel: 'Dataset Hash',
                  render: (value) => value ? <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '12px' }}>{String(value)}</span> : '—'
            },
            {
              key: 'duration',
              label: 'Duration',
              render: (value, row) => {
                if (row.started_at && row.completed_at) {
                      const minutes = Math.round((new Date(row.completed_at as string).getTime() - new Date(row.started_at as string).getTime()) / 1000 / 60);
                  return `${minutes} min`;
                }
                return row.started_at ? 'In progress...' : '—';
              }
            },
            {
              key: 'model_version',
              label: 'Output Version',
              mobileLabel: 'Version',
              render: (value) => value ? String(value) : '—'
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (value, row) => (
                    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  {row.status === 'running' && (
                    <Button
                      variant="danger"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (confirm('Stop this training job? This action cannot be undone.')) {
                          try {
                                await stopTrainingJob(row.id as string);
                            toast.success('Training job stopped');
                            window.location.reload();
                          } catch (err: unknown) {
                            const errorMessage = err && typeof err === 'object' && 'response' in err
                              ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
                              : 'Failed to stop training job';
                            logger.error('Stop training job error', err, { component: 'TrainingJobsPage', jobId: row.id });
                            toast.error(errorMessage || 'Failed to stop training job');
                          }
                        }
                      }}
                          size="sm"
                    >
                      Stop
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/ml/training-jobs/${row.id}`);
                    }}
                        size="sm"
                  >
                    View Logs
                  </Button>
                </div>
              )
            }
          ]}
          data={jobs.map(job => ({
            ...job,
            duration: job.started_at && job.completed_at
              ? Math.round((new Date(job.completed_at).getTime() - new Date(job.started_at).getTime()) / 1000 / 60)
              : null
              })) as unknown as Record<string, unknown>[]}
              onRowClick={(row) => navigate(`/ml/training-jobs/${row.id}`)}
              />
          </Card.Body>
        </Card>
          )}
    </ModernPageLayout>
  );
};

export default TrainingJobsPage;
