import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession } from '../../utils/auth';
import { isPlatformDev, type Role } from '../../utils/permissions';
import fastapiClient from '../../api/fastapiClient';
import { Button, Card, Text } from '../../components/ui';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { useToastContext } from '../../context/ToastContext';
import { logger } from '../../utils/logger';
import { goToDashboard } from '../../utils/navigation';
import { ModernPageLayout } from '../../components/layout/ModernPageLayout';
import { ResponsiveTable } from '@/components/shared/ResponsiveTable';

interface FeatureFlag {
  name: string;
  enabled: boolean;
  description?: string;
}

const FeatureFlagsPage = () => {
  const navigate = useNavigate();
  const session = getSession();
  const userRole = session.role as Role | null;
  const toast = useToastContext();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [previousFlags, setPreviousFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isPlatformDev(userRole)) {
      goToDashboard(navigate);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fastapiClient.get('/admin/feature-flags');
        const loadedFlags = res.data?.flags || [];
        setFlags(loadedFlags);
        setPreviousFlags(JSON.parse(JSON.stringify(loadedFlags)));
      } catch (err: any) {
        logger.error('Feature flags load error', err, { component: 'FeatureFlagsPage' });
        setError(err?.response?.data?.detail || 'Failed to load feature flags');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userRole, navigate]);

  const handleToggle = async (flagName: string, enabled: boolean) => {
    try {
      await fastapiClient.put(`/admin/feature-flags/${flagName}`, {
        enabled: !enabled,
      });
      const updatedFlags = flags.map((f) => (f.name === flagName ? { ...f, enabled: !enabled } : f));
      setFlags(updatedFlags);
      setPreviousFlags(JSON.parse(JSON.stringify(updatedFlags)));
      toast.success(`Feature flag "${flagName}" ${!enabled ? 'enabled' : 'disabled'}`);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || 'Failed to update feature flag';
      toast.error(errorMsg);
      logger.error('Toggle feature flag error', err, { component: 'FeatureFlagsPage', flagName });
    }
  };

  if (loading) {
    return <LoadingState message="Loading feature flags..." fullPage />;
  }

  if (error && flags.length === 0) {
    return (
      <ErrorState
        title="Unable to load feature flags"
        message={error || 'Failed to load feature flags. Please try again.'}
        onRetry={() => window.location.reload()}
        retryLabel="Retry"
        icon="🚩"
      />
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const savePromises = flags.map((flag) => {
        const previousFlag = previousFlags.find((f) => f.name === flag.name);
        if (previousFlag && previousFlag.enabled !== flag.enabled) {
          return fastapiClient.put(`/admin/feature-flags/${flag.name}`, {
            enabled: flag.enabled,
          });
        }
        return Promise.resolve();
      });

      await Promise.all(savePromises);
      setPreviousFlags(JSON.parse(JSON.stringify(flags)));
      toast.success('All feature flags saved successfully');
    } catch (err: any) {
      logger.error('Save feature flags error', err, { component: 'FeatureFlagsPage' });
      const errorMsg = err?.response?.data?.detail || 'Failed to save feature flags. Please try again.';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleRollback = async (flagName: string) => {
    if (!confirm(`Rollback ${flagName} to previous state?`)) {
      return;
    }

    try {
      const previousFlag = previousFlags.find((f) => f.name === flagName);
      if (!previousFlag) {
        toast.error('Previous state not found for this flag');
        return;
      }

      await fastapiClient.put(`/admin/feature-flags/${flagName}`, {
        enabled: previousFlag.enabled,
      });

      const updatedFlags = flags.map((f) =>
        f.name === flagName ? { ...f, enabled: previousFlag.enabled } : f
      );
      setFlags(updatedFlags);
      toast.success(`Feature flag "${flagName}" rolled back successfully`);
    } catch (err: any) {
      logger.error('Rollback feature flag error', err, { component: 'FeatureFlagsPage', flagName });
      const errorMsg = err?.response?.data?.detail || 'Failed to rollback feature flag. Please try again.';
      toast.error(errorMsg);
    }
  };

  const headerActions = (
          <Button size="md" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save All'}
          </Button>
  );

  return (
    <ModernPageLayout
      title="Platform Feature Flags"
      subtitle="Manage platform-wide feature flags for controlled rollouts and A/B testing. Enable, disable, and rollback features safely in production with full audit trails. All flag changes are logged with immutable audit records for compliance tracking."
      headerActions={headerActions}
      loading={loading}
      error={error}
      onRetry={() => window.location.reload()}
      maxWidth="xl"
    >
      {flags.length === 0 ? (
        <EmptyState
          title="No feature flags"
          description="No feature flags are currently configured. Feature flags will appear here once they are created in the backend."
          icon="🚩"
        />
      ) : (
            <Card variant="elevated" padding="none">
          <ResponsiveTable
            columns={[
              {
                key: 'name',
                label: 'Flag Name',
                render: (value) => <span style={{ fontWeight: 500 }}>{String(value ?? '')}</span>
              },
              {
                key: 'description',
                label: 'Description',
                render: (value) => <span style={{ color: 'var(--color-text-secondary)' }}>{String(value || '—')}</span>
              },
              {
                key: 'enabled',
                label: 'Status',
                render: (value) => (
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: 'var(--border-radius-sm)',
                      fontSize: '12px',
                      fontWeight: 500,
                      background: value ? '#dcfce7' : '#f3f4f6',
                      color: value ? '#166534' : '#6b7280',
                    }}
                  >
                    {value ? 'Enabled' : 'Disabled'}
                  </span>
                )
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (value, row) => (
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  <Button
                      onClick={() => handleToggle(row.name as string, row.enabled as boolean)}
                      size="sm"
                      variant={row.enabled ? 'secondary' : 'primary'}
                  >
                      {row.enabled ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                      onClick={() => handleRollback(row.name as string)}
                      size="sm"
                      variant="danger"
                  >
                    Rollback
                  </Button>
                  </div>
                )
              }
            ]}
            data={flags as unknown as Record<string, unknown>[]}
                  />
        </Card>
            )}
    </ModernPageLayout>
  );
};

export default FeatureFlagsPage;
