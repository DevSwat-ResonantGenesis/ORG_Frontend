import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPolicies, createPolicy, deletePolicy, updatePolicy } from '../../api/policies';
import { logger } from '../../utils/logger';
import type { Policy } from '../../types';
import { getSession } from '../../utils/auth';
import { hasPermission, isAdmin, type Role } from '../../utils/permissions';
import { Button, Card, Text, Input } from '../../components/ui';
import { exportToJSON } from '../../utils/export';
import PolicyTable from './PolicyTable';
import CreatePolicyModal from './CreatePolicyModal';
import EditPolicyModal from './EditPolicyModal';
import { goToDashboard } from '../../utils/navigation';
import { ModernPageLayout } from '../../components/layout/ModernPageLayout';
import { EmptyState } from '../../components/shared/EmptyState';

const PoliciesPage = () => {
  const navigate = useNavigate();
  const session = getSession();
  const userRole = session.role as Role | null;
  
  // Check if user can view policies
  useEffect(() => {
    if (!hasPermission(userRole, 'policies', 'read')) {
      goToDashboard(navigate);
    }
  }, [userRole, navigate]);
  
  const canManage = isAdmin(userRole);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editPolicy, setEditPolicy] = useState<Policy | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await fetchPolicies();
      setPolicies(items || []);
    } catch (err: any) {
      logger.error('Policies load error', err, { component: 'PoliciesPage' });
      setError(err?.message || 'Failed to load policies');
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = (policies || []).filter((p) => (p?.name || '').toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async (payload: { name: string; rule_type: string; threshold: number }) => {
    try {
    await createPolicy(payload);
    await load();
    setShowCreate(false);
    } catch (err: any) {
      logger.error('Policy creation error', err, { component: 'PoliciesPage' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
    await deletePolicy(id);
    await load();
    } catch (err: any) {
      logger.error('Policy deletion error', err, { component: 'PoliciesPage' });
    }
  };

  const handleUpdate = async (id: string, payload: Partial<Policy>) => {
    try {
    await updatePolicy(id, payload);
    await load();
    setEditPolicy(null);
    } catch (err: any) {
      logger.error('Policy update error', err, { component: 'PoliciesPage' });
  }
  };

  const handleExportJSON = () => {
    exportToJSON(filtered, 'policies');
  };

  const headerActions = canManage ? (
                  <>
      <Button onClick={() => setShowCreate(true)} size="md">
        Create Policy
                    </Button>
      <Button variant="secondary" onClick={handleExportJSON} size="md">
        Export
                    </Button>
                  </>
  ) : null;

  return (
    <ModernPageLayout
      title="Policy Management"
      subtitle="Create and enforce AI compliance policies automatically. Monitor violations in real-time with GDPR, HIPAA, SOC 2, and ISO 27001 templates."
      headerActions={headerActions}
      loading={loading}
      error={error}
      onRetry={load}
      maxWidth="xl"
    >
      {/* Search Section */}
      <Card variant="outlined" padding="md">
        <Input
                placeholder="Search policies by name or description…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%' }}
              />
      </Card>

      {/* Policies Table or Empty State */}
            {filtered.length === 0 && !loading && (
        <EmptyState
          title={search.trim() ? 'No policies found' : 'No policies yet'}
          description={
            search.trim()
                    ? 'No policies match your search. Try different search terms or clear the search to see all policies.'
              : 'Create your first policy to start enforcing compliance rules on all predictions. Policies can enforce risk thresholds, content restrictions, and regulatory requirements.'
          }
          icon="📋"
          action={
            canManage && !search.trim()
              ? {
                  label: 'Create Policy',
                  onClick: () => setShowCreate(true),
                  variant: 'primary' as const,
                }
              : undefined
          }
        />
            )}

            {filtered.length > 0 && (
              <Card variant="elevated" padding="none">
          <PolicyTable
            items={filtered}
            onDelete={canManage ? handleDelete : () => {}}
            onEdit={canManage ? (p) => setEditPolicy(p) : () => {}}
          />
              </Card>
            )}

      {/* Modals */}
      {showCreate && (
        <CreatePolicyModal
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
        />
      )}
            {editPolicy && (
              <EditPolicyModal
                policy={editPolicy}
                onClose={() => setEditPolicy(null)}
                onSubmit={(payload) => handleUpdate(editPolicy.id, payload)}
              />
            )}
    </ModernPageLayout>
  );
};

export default PoliciesPage;
