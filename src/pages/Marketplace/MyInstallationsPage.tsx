import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession } from '../../utils/auth';
import { canAccess, type Role } from '../../utils/permissions';
import logger from '../../utils/logger';
import {
  listInstallations,
  type MarketplaceInstallation,
} from '../../api/marketplace';
import { Button, Card, Text } from '../../components/ui';
import { ModernPageLayout } from '../../components/layout/ModernPageLayout';
import { EmptyState } from '../../components/shared/EmptyState';
import { useToastContext } from '../../context/ToastContext';
import styles from './MyInstallationsPage.module.css';

const MyInstallationsPage: React.FC = () => {
  const navigate = useNavigate();
  const session = getSession();
  const userRole = session.role as Role | null;
  const toast = useToastContext();

  const [installations, setInstallations] = useState<MarketplaceInstallation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInstallations = useCallback(async () => {
    if (!canAccess(userRole, 'predictions')) {
      navigate('/dashboard');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const installationsData = await listInstallations();
      setInstallations(installationsData);
    } catch (err: unknown) {
      logger.error('Failed to load installations:', err);
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { status?: number; data?: { detail?: string } } }).response?.data?.detail
        : err && typeof err === 'object' && 'message' in err
        ? (err as { message: string }).message
        : 'Failed to load installations';
      setError(errorMessage as string);
      toast.error(errorMessage as string);
    } finally {
      setLoading(false);
    }
  }, [userRole, navigate, toast]);

  useEffect(() => {
    loadInstallations();
  }, [loadInstallations]);

  const handleViewItem = (itemId: string) => {
    navigate(`/marketplace/items/${itemId}`);
  };

  const headerActions = (
    <Button variant="secondary" size="md" onClick={() => navigate('/marketplace')}>
      Browse Marketplace
    </Button>
  );

  return (
    <ModernPageLayout
      title="My Installations"
      description="Manage your installed marketplace items"
      headerActions={headerActions}
    >
      <div className={styles.installationsContainer}>
        {loading ? (
          <div className={styles.loadingState}>
            <Text>Loading installations...</Text>
          </div>
        ) : error ? (
          <Card variant="elevated" padding="lg">
            <Text color="error">{error}</Text>
            <Button variant="primary" size="md" onClick={loadInstallations} style={{ marginTop: '1rem' }}>
              Retry
            </Button>
          </Card>
        ) : installations.length === 0 ? (
          <EmptyState
            title="No installations"
            description="You haven't installed any items yet. Browse the marketplace to get started!"
            action={{
              label: 'Browse Marketplace',
              onClick: () => navigate('/marketplace'),
              variant: 'primary'
            }}
          />
        ) : (
          <div className={styles.installationsGrid}>
            {installations.map((installation) => (
              <Card
                key={installation.installation_id}
                variant="elevated"
                padding="md"
                className={styles.installationCard}
              >
                <div className={styles.installationHeader}>
                  <div className={styles.installationInfo}>
                    <Text variant="h3" className={styles.installationName}>
                      {installation.item_name}
                    </Text>
                    <Text variant="body-sm" color="secondary">
                      {installation.item_type}
                    </Text>
                  </div>
                  <div className={styles.installationStatus}>
                    <Text
                      variant="body-sm"
                      color={installation.status === 'active' ? 'success' : 'secondary'}
                    >
                      {installation.status}
                    </Text>
                  </div>
                </div>

                {installation.installed_at && (
                  <Text variant="body-sm" color="secondary" style={{ marginTop: '0.5rem' }}>
                    Installed: {new Date(installation.installed_at).toLocaleDateString()}
                  </Text>
                )}

                <div className={styles.installationActions}>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => handleViewItem(installation.item_id)}
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ModernPageLayout>
  );
};

export default MyInstallationsPage;

