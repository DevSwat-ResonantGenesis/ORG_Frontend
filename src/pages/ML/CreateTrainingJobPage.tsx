import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession } from '../../utils/auth';
import { canAccess, type Role } from '../../utils/permissions';
import { createTrainingJob } from '../../api/ml';
import { Button, Card, Text, Input } from '../../components/ui';
import { goToDashboard } from '../../utils/navigation';
import { ModernPageLayout } from '../../components/layout/ModernPageLayout';
import { logger } from '../../utils/logger';
import { useToastContext } from '../../context/ToastContext';

const CreateTrainingJobPage = () => {
  const navigate = useNavigate();
  const session = getSession();
  const userRole = session.role as Role | null;
  const toast = useToastContext();
  const [formData, setFormData] = useState({
    dataset_hash: '',
    config: {} as Record<string, any>,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (!canAccess(userRole, 'ml_ops')) {
      goToDashboard(navigate);
    }
  }, [userRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await createTrainingJob({
        dataset_hash: formData.dataset_hash || undefined,
        config: Object.keys(formData.config).length > 0 ? formData.config : undefined,
      });
      toast.success('Training job created successfully');
      navigate('/ml/training-jobs');
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || err?.message || 'Failed to create training job';
      setError(errorMsg);
      logger.error('Create training job error', err, { component: 'CreateTrainingJobPage' });
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const headerActions = (
          <Button variant="secondary" size="md" onClick={() => navigate('/ml/training-jobs')}>
            Back to Training Jobs
          </Button>
  );

  return (
    <ModernPageLayout
      title="Create Training Job"
      subtitle="Start a new ML model training job with custom configuration and dataset selection."
      headerActions={headerActions}
      maxWidth="lg"
    >
      <Card variant="elevated" padding="md">
        <Card.Header>
          <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>
            Training Job Configuration
          </Text>
        </Card.Header>
        <Card.Body>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {error && (
              <div style={{ 
                padding: 'var(--space-3)', 
                background: 'var(--color-bg-error)', 
                color: 'var(--color-text-error)', 
                borderRadius: 'var(--border-radius-md)', 
                fontSize: '14px' 
              }}>
                {error}
              </div>
            )}

            <Input
              label="Dataset Hash (Optional)"
              type="text"
              value={formData.dataset_hash}
              onChange={(e) => setFormData({ ...formData, dataset_hash: e.target.value })}
              placeholder="e.g., sha256:abc123..."
              helperText="Dataset hash (optional). Leave empty to use default dataset."
            />

            <div>
              <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>
                Training Configuration (Optional)
              </Text>
              <Text variant="caption" color="muted" style={{ marginBottom: 'var(--space-2)' }}>
                JSON configuration for training parameters
              </Text>
              <textarea
                value={JSON.stringify(formData.config, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setFormData({ ...formData, config: parsed });
                  } catch {
                    // Invalid JSON, keep as is
                  }
                }}
                placeholder='{"epochs": 10, "batch_size": 32, "learning_rate": 0.001}'
                rows={8}
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--border-radius-md)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg-surface)',
                  color: 'var(--color-text-primary)',
                  fontSize: '14px',
                  fontFamily: 'var(--font-family-mono)',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
              <Button variant="secondary" size="md" type="button" onClick={() => navigate('/ml/training-jobs')}>
                Cancel
              </Button>
              <Button size="md" type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Training Job'}
              </Button>
            </div>
          </form>
        </Card.Body>
            </Card>
    </ModernPageLayout>
  );
};

export default CreateTrainingJobPage;
