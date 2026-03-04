import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Note: API key functions are in org.ts, not settings.ts
import { fetchOrgApiKeys, createOrgApiKey, revokeOrgApiKey } from '../../api/org';
import { fetchUsageMetrics, type UsageMetrics } from '../../api/usage';
// TODO: Implement fetchThresholds, updateThresholds, fetchSettingsModelVersions
// import { fetchThresholds, updateThresholds, fetchSettingsModelVersions } from '../../api/settings';
import { logger } from '../../utils/logger';
import { getPlanDetails, PLANS } from '../../utils/signupLogic';
import type { APIKey, Thresholds, ModelVersion } from '../../types';
import layoutStyles from '../../components/layout/PageLayout-2025.module.css';
import buttonStyles from '../../components/ui/Button-2025.module.css';
import cardStyles from '../../components/ui/Card-2025.module.css';
import inputStyles from '../../components/ui/Input-2025.module.css';
import typographyStyles from '../../theme/modules/typography-2025.css';
import styles from './SettingsPage-2025.module.css';
import { useWarmthStore } from '../../store/warmthStore';

const normalizeModels = (items: unknown[]): ModelVersion[] => {
  if (!Array.isArray(items)) return [];
  return items.map((model, idx) => {
    if (typeof model === 'string') {
      return {
        id: `model-${idx}`,
        name: model,
        version: '—',
        updated_at: ''
      };
    }
    const m = model as Record<string, unknown>;
    return {
      id: (m.id as string) ?? `model-${idx}`,
      name: (m.name as string) ?? `Model ${idx + 1}`,
      version: (m.version as string) ?? (m.tag as string) ?? '—',
      updated_at: (m.updated_at as string) ?? (m.loaded_at as string) ?? ''
    };
  });
};

const SettingsPage = () => {
  const navigate = useNavigate();
  const { warmth, setWarmth, resetWarmth } = useWarmthStore();
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [thresholds, setThresholds] = useState<Thresholds | null>(null);
  const [models, setModels] = useState<ModelVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [thresholdForm, setThresholdForm] = useState({ validity: 0.5, entropy: 0.5, anchor_prob: 0.5 });
  
  // Usage metrics state
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  // Format limit value for display
  const formatLimit = (value: number) => {
    if (value === -1 || value === Infinity) return 'Unlimited';
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return `${value}`;
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [keyList, thresholdData, modelList] = await Promise.allSettled([
        fetchOrgApiKeys().catch(err => {
          logger.error('Failed to fetch API keys', err, { component: 'SettingsPage' });
          return [];
        }),
        // TODO: Implement fetchThresholds
        Promise.resolve(null).catch(err => {
          logger.error('Failed to fetch thresholds', err, { component: 'SettingsPage' });
          return null;
        }),
        // TODO: Implement fetchSettingsModelVersions
        Promise.resolve([]).catch(err => {
          logger.error('Failed to fetch model versions', err, { component: 'SettingsPage' });
          return [];
        })
      ]);
      
      const keysData = keyList.status === 'fulfilled' ? keyList.value : [];
      const thresholdDataResult = thresholdData.status === 'fulfilled' ? thresholdData.value : null;
      const modelListResult = modelList.status === 'fulfilled' ? modelList.value : [];
      
      const finalKeysData = Array.isArray(keysData) 
        ? keysData 
        : keysData?.items 
        ? keysData.items 
        : keysData?.data?.items 
        ? keysData.data.items 
        : [];
      setKeys(finalKeysData);
      setThresholds(thresholdDataResult);
      setModels(normalizeModels((modelListResult as any)?.items ?? modelListResult ?? []));
      
      if (thresholdDataResult) {
        setThresholdForm({
          validity: thresholdDataResult.validity ?? 0.5,
          entropy: thresholdDataResult.entropy ?? 0.5,
          anchor_prob: thresholdDataResult.anchor_prob ?? thresholdDataResult.anchorProb ?? 0.5
        });
      }
    } catch (err: any) {
      logger.error('Settings load error', err, { component: 'SettingsPage' });
      setError(err?.error || 'Unable to load settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Load usage metrics
  useEffect(() => {
    const loadMetrics = async () => {
      setLoadingMetrics(true);
      try {
        const metrics = await fetchUsageMetrics();
        setUsageMetrics(metrics);
      } catch (err) {
        logger.error('Failed to load usage metrics', err, { component: 'SettingsPage' });
      } finally {
        setLoadingMetrics(false);
      }
    };
    loadMetrics();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createOrgApiKey(newKeyName);
      setNewKeyName('');
      await load();
    } catch (err: any) {
      alert(err?.message || 'Failed to create API key');
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;
    try {
      await revokeOrgApiKey(id);
      await load();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete API key');
    }
  };

  const handleUpdateThresholds = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implement updateThresholds API call
      console.log('Updating thresholds:', thresholdForm);
      await load();
    } catch (err: any) {
      alert(err?.message || 'Failed to update thresholds');
    }
  };

  if (loading) {
    return (
      <div className={layoutStyles.page + ' ' + layoutStyles.dashboardPage}>
        <div className={layoutStyles.dashboardMain}>
          <div className={layoutStyles.dashboardContainer}>
            <div className={styles.loading}>Loading settings...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !thresholds) {
    return (
      <div className={layoutStyles.page + ' ' + layoutStyles.dashboardPage}>
        <div className={layoutStyles.dashboardMain}>
          <div className={layoutStyles.dashboardContainer}>
            <div className={cardStyles.card + ' ' + styles.errorCard}>
              <h2 className="typography-section-title">Error</h2>
              <p className="typography-body">{error || 'Unable to load settings'}</p>
              <button
                className={buttonStyles.button + ' ' + buttonStyles.buttonPrimary}
                onClick={load}
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
              <h1 className="typography-page-title">Settings & Configuration</h1>
              <p className={`typography-body-small ${styles.subtitle}`}>
                Manage API keys, usage limits, and model configurations
              </p>
            </div>
          </header>

          {/* Usage & Plan Section */}
          <section className={styles.section}>
            <div className={cardStyles.card + ' ' + cardStyles.cardElevated}>
              <h2 className="typography-section-title">Usage & Plan</h2>
              {loadingMetrics ? (
                <p className="typography-body-small">Loading usage metrics...</p>
              ) : usageMetrics ? (
                <div>
                  {/* Plan Info */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: 'var(--space-4)',
                    padding: 'var(--space-3)',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <div>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>Current Plan</div>
                      <div style={{ fontSize: 'var(--font-lg)', fontWeight: 700 }}>{usageMetrics.billing.planName}</div>
                    </div>
                    <button
                      className={buttonStyles.button + ' ' + buttonStyles.buttonSecondary}
                      onClick={() => navigate('/pricing')}
                    >
                      Upgrade Plan
                    </button>
                  </div>

                  {/* Usage Grid */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                    gap: 'var(--space-3)'
                  }}>
                    <div style={{ padding: 'var(--space-3)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>Tokens</div>
                      <div style={{ fontSize: 'var(--font-lg)', fontWeight: 700 }}>{formatLimit(usageMetrics.tokens.used)}</div>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>of {formatLimit(usageMetrics.tokens.limit)}</div>
                    </div>
                    <div style={{ padding: 'var(--space-3)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>Agents</div>
                      <div style={{ fontSize: 'var(--font-lg)', fontWeight: 700 }}>{usageMetrics.agents.active}</div>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>of {formatLimit(usageMetrics.agents.limit)}</div>
                    </div>
                    <div style={{ padding: 'var(--space-3)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>Teams</div>
                      <div style={{ fontSize: 'var(--font-lg)', fontWeight: 700 }}>{usageMetrics.teams.created}</div>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>of {formatLimit(usageMetrics.teams.limit)}</div>
                    </div>
                    <div style={{ padding: 'var(--space-3)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>Memory</div>
                      <div style={{ fontSize: 'var(--font-lg)', fontWeight: 700 }}>{formatLimit(usageMetrics.memory.anchorsUsed)}</div>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>of {formatLimit(usageMetrics.memory.anchorsLimit)}</div>
                    </div>
                    <div style={{ padding: 'var(--space-3)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>Providers</div>
                      <div style={{ fontSize: 'var(--font-lg)', fontWeight: 700 }}>{usageMetrics.providers.available.length}</div>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>available</div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="typography-body-small">Unable to load usage metrics</p>
              )}
            </div>
          </section>

          {/* Theme Warmth Section */}
          <section className={styles.section}>
            <div className={cardStyles.card + ' ' + cardStyles.cardElevated}>
              <h2 className="typography-section-title">Theme Warmth</h2>
              <p className={`typography-body-small ${styles.subtitle}`}>
                Adjust overall warmth across the entire platform (light and dark mode).
              </p>

              <div className={styles.warmthRow}>
                <div className={styles.warmthMeta}>
                  <div className={styles.warmthValue}>Warmth: {warmth}</div>
                  <div className={styles.warmthHint}>0 = neutral, 100 = warm</div>
                </div>
                <input
                  className={styles.warmthSlider}
                  type="range"
                  min={0}
                  max={100}
                  value={warmth}
                  onChange={(e) => setWarmth(Number(e.target.value))}
                  aria-label="Theme warmth"
                />
                <button
                  className={buttonStyles.button + ' ' + buttonStyles.buttonSecondary}
                  onClick={resetWarmth}
                >
                  Reset
                </button>
              </div>
            </div>
          </section>

          {/* API Keys Section */}
          <section className={styles.section}>
            <div className={cardStyles.card + ' ' + cardStyles.cardElevated}>
              <h2 className="typography-section-title">API Keys</h2>
              <form className={styles.form} onSubmit={handleCreateKey}>
                <div className={styles.formGroup}>
                  <input
                    type="text"
                    className={inputStyles.input}
                    placeholder="Key name"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className={buttonStyles.button + ' ' + buttonStyles.buttonPrimary}
                  >
                    Create Key
                  </button>
                </div>
              </form>
              <div className={styles.keysList}>
                {keys.map((key) => (
                  <div key={key.id} className={styles.keyItem}>
                    <div>
                      <div className="typography-body-small">{key.name}</div>
                      <div className="typography-caption">{key.key?.substring(0, 20)}...</div>
                    </div>
                    <button
                      className={buttonStyles.button + ' ' + buttonStyles.buttonGhost + ' ' + buttonStyles.buttonSmall}
                      onClick={() => handleDeleteKey(key.id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
                {keys.length === 0 && (
                  <p className={`typography-body-small ${styles.emptyText}`}>
                    No API keys created yet
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Risk Thresholds Section */}
          <section className={styles.section}>
            <div className={cardStyles.card + ' ' + cardStyles.cardElevated}>
              <h2 className="typography-section-title">Risk Thresholds</h2>
              <form className={styles.form} onSubmit={handleUpdateThresholds}>
                <div className={styles.formGroup}>
                  <label className={inputStyles.label}>Validity</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    className={inputStyles.input}
                    value={thresholdForm.validity}
                    onChange={(e) => setThresholdForm({ ...thresholdForm, validity: Number(e.target.value) })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={inputStyles.label}>Entropy</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    className={inputStyles.input}
                    value={thresholdForm.entropy}
                    onChange={(e) => setThresholdForm({ ...thresholdForm, entropy: Number(e.target.value) })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={inputStyles.label}>Anchor Probability</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    className={inputStyles.input}
                    value={thresholdForm.anchor_prob}
                    onChange={(e) => setThresholdForm({ ...thresholdForm, anchor_prob: Number(e.target.value) })}
                  />
                </div>
                <button
                  type="submit"
                  className={buttonStyles.button + ' ' + buttonStyles.buttonPrimary}
                >
                  Update Thresholds
                </button>
              </form>
            </div>
          </section>

          {/* Active Models Section */}
          <section className={styles.section}>
            <div className={cardStyles.card + ' ' + cardStyles.cardElevated}>
              <h2 className="typography-section-title">Active Models</h2>
              <div className={styles.modelsList}>
                {models.map((model) => (
                  <div key={model.id} className={styles.modelItem}>
                    <div>
                      <div className="typography-body-small">{model.name}</div>
                      <div className="typography-caption">v{model.version}</div>
                    </div>
                  </div>
                ))}
                {models.length === 0 && (
                  <p className={`typography-body-small ${styles.emptyText}`}>
                    No models loaded
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

