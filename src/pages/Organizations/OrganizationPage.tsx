import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchOrgDetails } from '../../api/org';
import { logger } from '../../utils/logger';
import type { OrgDetails } from '../../types';
import { Button, Card, Text } from '../../components/ui';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import OrgUsersPanel from './OrgUsersPanel';
import OrgApiKeysPanel from './OrgApiKeysPanel';
import OrgUsagePanel from './OrgUsagePanel';
import { ModernPageLayout } from '../../components/layout/ModernPageLayout';

const OrganizationPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<OrgDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const loadDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetchOrgDetails();
      if (!response) {
        setError('No organization data received. Please try again or contact support.');
        return;
      }
      setData(response);
    } catch (err: any) {
      logger.error('Org details error', err, { component: 'OrganizationPage' });
      
      let errorMsg = 'Unable to load organization data.';
      
      if (err?.response?.status === 404) {
        errorMsg = 'Organization endpoint not found. The backend may not have this endpoint configured.';
      } else if (err?.response?.status === 500) {
        errorMsg = 'Server error loading organization data. Please try again later or contact support.';
      } else if (err?.response?.status === 429) {
        errorMsg = 'Too many requests. Please wait a moment and try again.';
      } else if (err?.code === 'ECONNABORTED') {
        errorMsg = 'Request timeout. The server is taking too long to respond. Please try again.';
      } else {
        errorMsg = err?.error || err?.message || 'Unable to load organization data. The backend may be rate-limiting requests or temporarily unavailable.';
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, []);

  if (loading) {
    return <LoadingState message="Loading organization data..." fullPage />;
  }

  if (error || !data) {
    return (
      <ErrorState
        title="Organization data unavailable"
        message={error || 'Unable to load organization data. This may be due to rate limiting or backend connectivity issues.'}
        onRetry={loadDetails}
        retryLabel="Try Again"
        icon="🏢"
      />
    );
  }

  const headerActions = (
    <>
          <Button variant="secondary" size="md" onClick={() => navigate('/settings')}>
            Settings
          </Button>
          <Button variant="secondary" size="md" onClick={() => navigate('/billing')}>
            Billing
          </Button>
    </>
  );

  return (
    <ModernPageLayout
      title="Organization Management"
      subtitle="Manage users, roles, API keys, and organization settings. Enterprise-grade multi-tenant architecture with role-based access control."
      headerActions={headerActions}
      loading={loading}
      error={error}
      onRetry={loadDetails}
      maxWidth="xl"
    >
      {/* User List */}
      <Card variant="elevated" padding="md">
              <Card.Header>
          <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>
            User List
          </Text>
          <Text variant="body-sm" color="secondary">
            {data.users?.length || 0} user{(data.users?.length || 0) !== 1 ? 's' : ''} in your organization
          </Text>
              </Card.Header>
              <Card.Body>
                <OrgUsersPanel users={data.users || []} onRefresh={loadDetails} />
              </Card.Body>
            </Card>

      {/* API Keys */}
      <Card variant="elevated" padding="md">
              <Card.Header>
          <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>
            API Keys
          </Text>
          <Text variant="body-sm" color="secondary">
            {data.api_keys?.length || 0} API key{(data.api_keys?.length || 0) !== 1 ? 's' : ''} configured
          </Text>
              </Card.Header>
              <Card.Body>
                <OrgApiKeysPanel keys={data.api_keys || []} onRefresh={loadDetails} />
              </Card.Body>
            </Card>

      {/* Usage */}
            <Card variant="elevated" padding="md">
              <Card.Header>
          <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>
            Usage
          </Text>
          <Text variant="body-sm" color="secondary">
            Organization usage statistics and resource consumption
          </Text>
              </Card.Header>
              <Card.Body>
                <OrgUsagePanel usage={data.usage || {}} />
              </Card.Body>
            </Card>
    </ModernPageLayout>
  );
};

export default OrganizationPage;
