import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession } from '../../utils/auth';
import { canAccess, type Role } from '../../utils/permissions';
import logger from '../../utils/logger';
import {
  listPurchases,
  type MarketplacePurchase,
} from '../../api/marketplace';
import { Button, Card } from '../../components/ui';
import { ModernPageLayout } from '../../components/layout/ModernPageLayout';
import { EmptyState } from '../../components/shared/EmptyState';
import { useToastContext } from '../../context/ToastContext';
import styles from './PurchasesPage.module.css';

const PurchasesPage: React.FC = () => {
  const navigate = useNavigate();
  const session = getSession();
  const userRole = session.role as Role | null;
  const toast = useToastContext();

  const [purchases, setPurchases] = useState<MarketplacePurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPurchases = useCallback(async () => {
    if (!canAccess(userRole, 'predictions')) {
      navigate('/dashboard');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const purchasesData = await listPurchases();
      setPurchases(purchasesData);
    } catch (err: unknown) {
      logger.error('Failed to load purchases:', err);
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { status?: number; data?: { detail?: string } } }).response?.data?.detail
        : err && typeof err === 'object' && 'message' in err
        ? (err as { message: string }).message
        : 'Failed to load purchases';
      setError(errorMessage as string);
      toast.error(errorMessage as string);
    } finally {
      setLoading(false);
    }
  }, [userRole, navigate, toast]);

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  const handleViewItem = (itemId: string) => {
    navigate(`/marketplace/items/${itemId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const headerActions = (
    <div style={{ display: 'flex', gap: '12px' }}>
      <Button variant="secondary" size="md" onClick={() => navigate('/marketplace/installations')}>
        My Installations
      </Button>
      <Button variant="primary" size="md" onClick={() => navigate('/marketplace')}>
        Browse Marketplace
      </Button>
    </div>
  );

  return (
    <ModernPageLayout
      title="My Purchases"
      subtitle="View your purchase history and receipts"
      headerActions={headerActions}
    >
      <div className={styles.purchasesContainer}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner} />
            <span>Loading purchases...</span>
          </div>
        ) : error ? (
          <Card variant="elevated" padding="lg">
            <span style={{ color: 'var(--color-error)' }}>{error}</span>
            <Button variant="primary" size="md" onClick={loadPurchases} style={{ marginTop: '1rem' }}>
              Retry
            </Button>
          </Card>
        ) : purchases.length === 0 ? (
          <EmptyState
            title="No purchases yet"
            description="You haven't made any purchases. Browse the marketplace to find agents, teams, and tools!"
            action={{
              label: 'Browse Marketplace',
              onClick: () => navigate('/marketplace'),
            }}
          />
        ) : (
          <div className={styles.purchasesList}>
            {/* Summary Stats */}
            <div className={styles.summaryStats}>
              <Card variant="elevated" padding="md" className={styles.statCard}>
                <div className={styles.statValue}>{purchases.length}</div>
                <div className={styles.statLabel}>Total Purchases</div>
              </Card>
              <Card variant="elevated" padding="md" className={styles.statCard}>
                <div className={styles.statValue}>
                  {formatPrice(purchases.reduce((sum, p) => sum + (p.price || 0), 0))}
                </div>
                <div className={styles.statLabel}>Total Spent</div>
              </Card>
              <Card variant="elevated" padding="md" className={styles.statCard}>
                <div className={styles.statValue}>
                  {purchases.filter(p => p.status === 'active').length}
                </div>
                <div className={styles.statLabel}>Active Licenses</div>
              </Card>
            </div>

            {/* Purchases Table */}
            <Card variant="elevated" padding="none" className={styles.tableCard}>
              <div className={styles.tableHeader}>
                <span style={{ fontWeight: 600 }}>Purchase History</span>
              </div>
              <table className={styles.purchasesTable}>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase) => (
                    <tr key={purchase.purchase_id}>
                      <td>
                        <div className={styles.itemInfo}>
                          <span className={styles.itemName}>{purchase.item_name}</span>
                          <span className={styles.itemId}>#{purchase.item_id.slice(0, 8)}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.typeBadge} ${styles[`type-${purchase.item_type}`]}`}>
                          {purchase.item_type}
                        </span>
                      </td>
                      <td>{formatDate(purchase.purchase_date)}</td>
                      <td className={styles.priceCell}>{formatPrice(purchase.price || 0)}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[`status-${purchase.status}`]}`}>
                          {purchase.status}
                        </span>
                      </td>
                      <td>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewItem(purchase.item_id)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}
      </div>
    </ModernPageLayout>
  );
};

export default PurchasesPage;
