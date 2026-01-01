import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPolicies, createPolicy, deletePolicy, updatePolicy } from '../../api/policies';
import { logger } from '../../utils/logger';
import type { Policy } from '../../types';
import { getSession } from '../../utils/auth';
import { hasPermission, isAdmin, type Role } from '../../utils/permissions';
import { goToDashboard } from '../../utils/navigation';
import layoutStyles from '../../components/layout/PageLayout-2025.module.css';
import buttonStyles from '../../components/ui/Button-2025.module.css';
import cardStyles from '../../components/ui/Card-2025.module.css';
import inputStyles from '../../components/ui/Input-2025.module.css';
import typographyStyles from '../../theme/modules/typography-2025.css';
import styles from './PoliciesPage-2025.module.css';

const PoliciesPage = () => {
  const navigate = useNavigate();
  const session = getSession();
  const userRole = session.role as Role | null;
  
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editPolicy, setEditPolicy] = useState<Policy | null>(null);
  const [createForm, setCreateForm] = useState({ name: '', rule_type: 'validity', threshold: 0.8 });

  useEffect(() => {
    if (!hasPermission(userRole, 'policies', 'read')) {
      goToDashboard(navigate);
    }
    load();
  }, [userRole, navigate]);

  const canManage = isAdmin(userRole);

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

  const filtered = (policies || []).filter((p) => (p?.name || '').toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPolicy(createForm);
      await load();
      setShowCreate(false);
      setCreateForm({ name: '', rule_type: 'validity', threshold: 0.8 });
    } catch (err: any) {
      logger.error('Policy creation error', err, { component: 'PoliciesPage' });
      alert(err?.message || 'Failed to create policy');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this policy?')) return;
    try {
      await deletePolicy(id);
      await load();
    } catch (err: any) {
      logger.error('Policy deletion error', err, { component: 'PoliciesPage' });
      alert(err?.message || 'Failed to delete policy');
    }
  };

  const handleUpdate = async (id: string, payload: Partial<Policy>) => {
    try {
      await updatePolicy(id, payload);
      await load();
      setEditPolicy(null);
    } catch (err: any) {
      logger.error('Policy update error', err, { component: 'PoliciesPage' });
      alert(err?.message || 'Failed to update policy');
    }
  };

  if (loading) {
    return (
      <div className={layoutStyles.page + ' ' + layoutStyles.dashboardPage}>
        <div className={layoutStyles.dashboardMain}>
          <div className={layoutStyles.dashboardContainer}>
            <div className={styles.loading}>Loading policies...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={layoutStyles.page + ' ' + layoutStyles.dashboardPage}>
        <div className={layoutStyles.dashboardMain}>
          <div className={layoutStyles.dashboardContainer}>
            <div className={cardStyles.card + ' ' + styles.errorCard}>
              <h2 className="typography-section-title">Error</h2>
              <p className="typography-body">{error}</p>
              <button
                className={buttonStyles.button + ' ' + buttonStyles.buttonPrimary}
                onClick={() => window.location.reload()}
                style={{ marginTop: 'var(--space-4)' }}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={layoutStyles.page + ' ' + layoutStyles.dashboardPage}>
      <div className={layoutStyles.dashboardMain}>
        <div className={layoutStyles.dashboardContainer}>
          {/* Page Header */}
          <header className={styles.header}>
            <div>
              <h1 className="typography-page-title">Policies</h1>
              <p className={'typography-body-small ' + styles.subtitle}>
                Manage AI governance policies and rules
              </p>
            </div>
            {canManage && (
              <button
                className={buttonStyles.button + ' ' + buttonStyles.buttonPrimary}
                onClick={() => setShowCreate(true)}
              >
                Create Policy
              </button>
            )}
          </header>

          {/* Search */}
          <section className={styles.searchSection}>
            <input
              type="text"
              className={inputStyles.input}
              placeholder="Search policies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </section>

          {/* Create Modal */}
          {showCreate && (
            <div className={styles.modalOverlay} onClick={() => setShowCreate(false)}>
              <div className={cardStyles.card + ' ' + styles.modal} onClick={(e) => e.stopPropagation()}>
                <h2 className="typography-section-title">Create Policy</h2>
                <form className={styles.form} onSubmit={handleCreate}>
                  <div className={styles.formGroup}>
                    <label className={inputStyles.label}>Name</label>
                    <input
                      type="text"
                      className={inputStyles.input}
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={inputStyles.label}>Rule Type</label>
                    <select
                      className={inputStyles.input + ' ' + inputStyles.select}
                      value={createForm.rule_type}
                      onChange={(e) => setCreateForm({ ...createForm, rule_type: e.target.value })}
                    >
                      <option value="validity">Validity</option>
                      <option value="risk">Risk</option>
                      <option value="compliance">Compliance</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={inputStyles.label}>Threshold</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      className={inputStyles.input}
                      value={createForm.threshold}
                      onChange={(e) => setCreateForm({ ...createForm, threshold: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={buttonStyles.button + ' ' + buttonStyles.buttonSecondary}
                      onClick={() => setShowCreate(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={buttonStyles.button + ' ' + buttonStyles.buttonPrimary}
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Policies List */}
          <section className={styles.policiesSection}>
            {filtered.length === 0 ? (
              <div className={cardStyles.card}>
                <p className="typography-body">No policies found.</p>
              </div>
            ) : (
              <div className={styles.policiesGrid}>
                {filtered.map((policy) => (
                  <div key={policy.id} className={cardStyles.card + ' ' + cardStyles.cardElevated}>
                    <div className={styles.policyHeader}>
                      <h3 className="typography-card-title">{policy.name}</h3>
                      {canManage && (
                        <div className={styles.policyActions}>
                          <button
                            className={buttonStyles.button + ' ' + buttonStyles.buttonGhost + ' ' + buttonStyles.buttonSmall}
                            onClick={() => setEditPolicy(policy)}
                          >
                            Edit
                          </button>
                          <button
                            className={buttonStyles.button + ' ' + buttonStyles.buttonGhost + ' ' + buttonStyles.buttonSmall}
                            onClick={() => handleDelete(policy.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                    <div className={styles.policyDetails}>
                      <div className={styles.policyDetail}>
                        <span className="typography-label">Type:</span>
                        <span className="typography-body-small">{policy.rule_type}</span>
                      </div>
                      <div className={styles.policyDetail}>
                        <span className="typography-label">Threshold:</span>
                        <span className="typography-body-small">{policy.threshold}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default PoliciesPage;

