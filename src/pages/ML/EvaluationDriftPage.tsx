import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Text, Input } from '../../components/ui';
import fastapiClient from '../../api/fastapiClient';
import { getSession } from '../../utils/auth';
import { canAccess, type Role } from '../../utils/permissions';
import { logger } from '../../utils/logger';
import { goToDashboard } from '../../utils/navigation';
import { ModernPageLayout } from '../../components/layout/ModernPageLayout';

const EvaluationDriftPage = () => {
  const navigate = useNavigate();
  const session = getSession();
  const userRole = session.role as Role | null;
  const [datasetHash, setDatasetHash] = useState('');
  const [evaluationConfig, setEvaluationConfig] = useState('');
  const [driftConfig, setDriftConfig] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [results, setResults] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (!canAccess(userRole, 'ml_ops')) {
      goToDashboard(navigate);
    }
  }, [userRole, navigate]);

  if (!canAccess(userRole, 'ml_ops')) {
    return null;
  }

  const handleOfflineEvaluation = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const config = evaluationConfig ? JSON.parse(evaluationConfig) : {};
      const res = await fastapiClient.post('/ml/evaluation/offline', {
        dataset_hash: datasetHash,
        config: config,
      });
      setResults(res.data);
      setSuccess('Evaluation completed successfully');
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : 'Failed to run evaluation';
      logger.error('Evaluation error', err, { component: 'EvaluationDriftPage' });
      setError(errorMessage || 'Failed to run evaluation');
    } finally {
      setLoading(false);
    }
  };

  const handleDriftDetection = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const config = driftConfig ? JSON.parse(driftConfig) : {};
      const res = await fastapiClient.post('/ml/drift-detection', config);
      setResults(res.data);
      setSuccess('Drift detection completed successfully');
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : 'Failed to detect drift';
      logger.error('Drift detection error', err, { component: 'EvaluationDriftPage' });
      setError(errorMessage || 'Failed to detect drift');
    } finally {
      setLoading(false);
    }
  };

  const handleImportDataset = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const res = await fastapiClient.post('/ml/datasets/import', {
        dataset_hash: datasetHash,
      });
      setResults(res.data);
      setSuccess('Dataset imported successfully');
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : 'Failed to import dataset';
      logger.error('Dataset import error', err, { component: 'EvaluationDriftPage' });
      setError(errorMessage || 'Failed to import dataset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModernPageLayout
      title="Model Evaluation & Drift Detection"
      subtitle="Complete MLOps lifecycle management with offline evaluations, data drift detection, and performance monitoring. Run offline model evaluations, detect data drift, and monitor model performance degradation. Import datasets, configure evaluation metrics, and track model quality over time. 70% ready with production workflows."
      loading={loading}
      error={error}
      maxWidth="xl"
    >
      {success && (
        <Card variant="outlined" padding="md" style={{ 
          background: 'var(--color-bg-success)', 
          borderColor: 'var(--color-success)',
          marginBottom: 'var(--space-4)'
        }}>
          <Text variant="body-sm" color="primary">{success}</Text>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-6)' }}>
        <Card variant="elevated" padding="md">
          <Card.Header>
            <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>
              Offline Evaluation
            </Text>
          </Card.Header>
          <Card.Body>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <Input
                label="Dataset Hash"
                placeholder="Dataset Hash"
                value={datasetHash}
                onChange={(e) => setDatasetHash(e.target.value)}
              />
              <div>
                <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>
                  Evaluation Config (JSON)
                </Text>
                <textarea
                  placeholder="Evaluation Config (JSON)"
                  value={evaluationConfig}
                  onChange={(e) => setEvaluationConfig(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--border-radius-md)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-bg-surface)',
                    color: 'var(--color-text-primary)',
                    minHeight: '100px',
                    fontFamily: 'var(--font-family-mono)',
                    fontSize: '12px'
                  }}
                />
              </div>
              <Button size="md" onClick={handleOfflineEvaluation} disabled={loading}>
                {loading ? 'Running...' : 'Run Evaluation'}
              </Button>
            </div>
          </Card.Body>
        </Card>

        <Card variant="elevated" padding="md">
          <Card.Header>
            <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>
              Drift Detection
            </Text>
          </Card.Header>
          <Card.Body>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div>
                <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>
                  Drift Detection Config (JSON)
                </Text>
                <textarea
                  placeholder="Drift Detection Config (JSON)"
                  value={driftConfig}
                  onChange={(e) => setDriftConfig(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--border-radius-md)',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-bg-surface)',
                    color: 'var(--color-text-primary)',
                    minHeight: '150px',
                    fontFamily: 'var(--font-family-mono)',
                    fontSize: '12px'
                  }}
                />
              </div>
              <Button size="md" onClick={handleDriftDetection} disabled={loading}>
                {loading ? 'Detecting...' : 'Detect Drift'}
              </Button>
            </div>
          </Card.Body>
        </Card>

        <Card variant="elevated" padding="md">
          <Card.Header>
            <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>
              Import Dataset
            </Text>
          </Card.Header>
          <Card.Body>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <Input
                label="Dataset Hash"
                placeholder="Dataset Hash"
                value={datasetHash}
                onChange={(e) => setDatasetHash(e.target.value)}
              />
              <Button size="md" onClick={handleImportDataset} disabled={loading}>
                {loading ? 'Importing...' : 'Import Dataset'}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>

      {results && (
        <Card variant="elevated" padding="md" style={{ marginTop: 'var(--space-6)' }}>
          <Card.Header>
            <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>
              Results
            </Text>
          </Card.Header>
          <Card.Body>
            <pre style={{
              padding: 'var(--space-4)',
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--border-radius-md)',
              overflow: 'auto',
              fontSize: '12px',
              fontFamily: 'var(--font-family-mono)'
            }}>
              {JSON.stringify(results, null, 2)}
            </pre>
          </Card.Body>
        </Card>
      )}
    </ModernPageLayout>
  );
};

export default EvaluationDriftPage;
