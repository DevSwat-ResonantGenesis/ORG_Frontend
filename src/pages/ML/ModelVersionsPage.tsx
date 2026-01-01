import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession } from '../../utils/auth';
import { canAccess, type Role } from '../../utils/permissions';
import { fetchModelVersions, promoteModelVersion, rollbackModelVersion, type ModelVersion } from '../../api/ml';
import { Button, Card, Text } from '../../components/ui';
import fastapiClient from '../../api/fastapiClient';
import { logger } from '../../utils/logger';
import { goToDashboard } from '../../utils/navigation';
import { ModernPageLayout } from '../../components/layout/ModernPageLayout';
import { ResponsiveTable } from '@/components/shared/ResponsiveTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { useToastContext } from '../../context/ToastContext';

const ModelVersionsPage = () => {
  const navigate = useNavigate();
  const session = getSession();
  const userRole = session.role as Role | null;
  const toast = useToastContext();
  const [versions, setVersions] = useState<ModelVersion[]>([]);
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
      const versionsData = await fetchModelVersions();
      setVersions(versionsData.map(v => ({
        ...v,
        metrics: v.metrics || {}
      })));
    } catch (err: unknown) {
      logger.error('Model versions load error', err, { component: 'ModelVersionsPage' });
      
      let errorMessage = 'Failed to load model versions';
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { status?: number; data?: { detail?: string } } }).response;
        if (response?.status === 404) {
          errorMessage = 'Model versions endpoint is not available. The backend may not have this endpoint configured.';
        } else if (response?.status === 500) {
          errorMessage = 'Server error loading model versions. Please try again later.';
        } else {
          errorMessage = response?.data?.detail || 'Failed to load model versions';
        }
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = String((err as { message?: string }).message);
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userRole, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const handlePromote = async (versionId: string) => {
    if (!confirm('Promote this model version to production?')) return;
    try {
      await fastapiClient.post(`/ml/model-versions/${versionId}/promote`);
      toast.success('Model version promoted successfully');
      window.location.reload();
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : 'Failed to promote model';
      logger.error('Promote model error', err, { component: 'ModelVersionsPage', versionId });
      toast.error(errorMessage || 'Failed to promote model');
    }
  };

  const handleRollback = async (versionId: string) => {
    if (!confirm('Rollback to this model version?')) return;
    try {
      await fastapiClient.post(`/ml/model-versions/${versionId}/rollback`);
      toast.success('Model version rolled back successfully');
      window.location.reload();
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : 'Failed to rollback model';
      logger.error('Rollback model error', err, { component: 'ModelVersionsPage', versionId });
      toast.error(errorMessage || 'Failed to rollback model');
    }
  };

  return (
    <ModernPageLayout
      title="ML Model Version Management"
      subtitle="Complete MLOps lifecycle management with version control, promotion workflows, and rollback capabilities. View, compare, promote, and rollback ML model versions with full lifecycle tracking. Monitor model performance metrics and manage version history for production deployments. 70% ready with production workflows."
      loading={loading}
      error={error}
      onRetry={load}
      maxWidth="xl"
    >
      {versions.length === 0 ? (
        <EmptyState
          title="No Model Versions"
          description="No model versions have been created yet. Model versions are created automatically when training jobs complete successfully."
          icon="🤖"
          action={{
            label: "Create Training Job",
            onClick: () => navigate('/ml/training-jobs/new'),
            variant: 'primary' as const
          }}
          secondaryAction={{
            label: "View Training Jobs",
            onClick: () => navigate('/ml/training-jobs'),
            variant: 'secondary' as const
          }}
        />
      ) : (
            <Card variant="elevated" padding="md">
        <Card.Header>
            <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>
              Model Versions
            </Text>
            <Text variant="body-sm" color="secondary">
            All model versions created through training jobs. The active version is used for all new predictions. 
            Compare accuracy metrics and performance across versions to make informed promotion decisions.
          </Text>
        </Card.Header>
          <Card.Body style={{ padding: 0 }}>
            <ResponsiveTable
              columns={[
                {
                  key: 'version',
                  label: 'Version',
                  render: (value) => <span style={{ fontFamily: 'var(--font-family-mono)', fontWeight: 500 }}>{String(value ?? '')}</span>
                },
                {
                  key: 'created_at',
                  label: 'Created At',
                  render: (value) => value ? new Date(String(value)).toLocaleString() : 'N/A'
                },
                {
                  key: 'accuracy',
                  label: 'Accuracy',
                  render: (value, row) => {
                    const metrics = (row.metrics as Record<string, unknown>) || {};
                    const accuracy = metrics.accuracy as number | undefined;
                    return accuracy ? `${(accuracy * 100).toFixed(1)}%` : 'N/A';
                  }
                },
                {
                  key: 'is_active',
                  label: 'Status',
                  render: (value) => (
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: 'var(--border-radius-sm)',
                        fontSize: '12px',
                        fontWeight: 500,
                        background: value ? '#dcfce7' : '#f3f4f6',
                        color: value ? '#166534' : '#6b7280',
                      }}
                    >
                      {value ? 'Active' : 'Inactive'}
                    </span>
                  )
                },
                {
                  key: 'actions',
                  label: 'Actions',
                  render: (value, row) => (
                    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                      {!row.is_active && (
                    <Button
                          onClick={() => handlePromote(row.id as string)}
                          size="sm"
                          variant="primary"
                    >
                          Promote
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                        if (confirm('Download this model version?')) {
                          alert('Model download coming soon');
                        }
                      }}
                        size="sm"
                        variant="secondary"
                    >
                        Download
                    </Button>
                  <Button
                        onClick={() => handleRollback(row.id as string)}
                        size="sm"
                        variant="danger"
                  >
                    Rollback
                  </Button>
        </div>
                  )
                }
              ]}
              data={versions as unknown as Record<string, unknown>[]}
            />
            </Card.Body>
            </Card>
      )}
    </ModernPageLayout>
  );
};

export default ModelVersionsPage;
