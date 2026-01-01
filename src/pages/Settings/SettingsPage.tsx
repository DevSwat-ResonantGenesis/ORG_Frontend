import React, { useEffect, useState } from 'react';
import {
  fetchAPIKeys,
  createAPIKey,
  deleteAPIKey,
  fetchThresholds,
  updateThresholds,
  fetchSettingsModelVersions
} from '../../api/settings';
import { logger } from '../../utils/logger';
import type { APIKey, Thresholds, ModelVersion } from '../../types';
import { Button } from '../../components/ui';
import APIKeysPanel from './APIKeysPanel';
import ThresholdsPanel from './ThresholdsPanel';
import ModelInfoPanel from './ModelInfoPanel';
import styles from '../Help/HelpCenterPage.module.css';

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
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [thresholds, setThresholds] = useState<Thresholds | null>(null);
  const [models, setModels] = useState<ModelVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [keyList, thresholdData, modelList] = await Promise.allSettled([
        fetchAPIKeys().catch(err => {
          logger.error('Failed to fetch API keys', err, { component: 'SettingsPage' });
          return [];
        }),
        fetchThresholds().catch(err => {
          logger.error('Failed to fetch thresholds', err, { component: 'SettingsPage' });
          return null;
        }),
        fetchSettingsModelVersions().catch(err => {
          logger.error('Failed to fetch model versions', err, { component: 'SettingsPage' });
          return [];
        })
      ]);
      
      const keysData = keyList.status === 'fulfilled' ? keyList.value : [];
      const thresholdDataResult = thresholdData.status === 'fulfilled' ? thresholdData.value : null;
      const modelListResult = modelList.status === 'fulfilled' ? modelList.value : [];
      
      const finalKeysData = Array.isArray(keysData) 
        ? keysData 
        : (keysData as any)?.items 
        ? (keysData as any).items 
        : (keysData as any)?.data?.items 
        ? (keysData as any).data.items 
        : [];
      setKeys(finalKeysData);
      setThresholds(thresholdDataResult);
      setModels(normalizeModels((modelListResult as any)?.items ?? modelListResult ?? []));
    } catch (err: any) {
      logger.error('Settings load error', err, { component: 'SettingsPage' });
      setError(err?.error || 'Unable to load settings. The backend may be rate-limiting requests or temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className={styles.helpCenterPage}>
        <div className={styles.container}>
          <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            Loading settings...
          </div>
        </div>
      </div>
    );
  }

  if (error || !thresholds) {
    return (
      <div className={styles.helpCenterPage}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>Settings Unavailable</h1>
            <p className={styles.subtitle}>
              {error || 'Unable to load settings. The backend may be rate-limiting requests or temporarily unavailable.'}
            </p>
          </div>
          <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <Button onClick={load} variant="primary" size="md">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.helpCenterPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Settings & Configuration</h1>
          <p className={styles.subtitle}>
            Manage API keys, validation thresholds, and model configurations.
          </p>
        </div>

        <div className={styles.contentBody}>
          <div className={styles.contentMain}>
            
            {/* API Keys Section */}
            <section className={styles.contentSection}>
              <h2>API Keys</h2>
              <div className={styles.articleCard} style={{cursor: 'default'}}>
                <APIKeysPanel
                  keys={keys}
                  onCreate={async (name) => {
                    await createAPIKey(name);
                    await load();
                  }}
                  onDelete={async (id) => {
                    await deleteAPIKey(id);
                    await load();
                  }}
                />
              </div>
            </section>

            {/* Risk Thresholds Section */}
            <section className={styles.contentSection}>
              <h2>Risk Thresholds</h2>
              <div className={styles.articleCard} style={{cursor: 'default'}}>
                <ThresholdsPanel
                  thresholds={{
                    validity: thresholds.validity ?? 0.5,
                    entropy: thresholds.entropy ?? 0.5,
                    anchor_prob: thresholds.anchor_prob ?? thresholds.anchorProb ?? 0.5
                  }}
                  onUpdate={async (payload) => {
                    await updateThresholds(payload);
                    await load();
                  }}
                />
              </div>
            </section>

            {/* Active Models Section */}
            <section className={styles.contentSection}>
              <h2>Active Models</h2>
              <div className={styles.articleCard} style={{cursor: 'default'}}>
                <ModelInfoPanel models={models} />
              </div>
            </section>

            {/* Internal Webhooks Section */}
            <section className={styles.contentSection}>
              <h2>Internal Webhooks</h2>
              <div className={styles.articleCard} style={{cursor: 'default'}}>
                <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                  Configure webhooks to receive real-time notifications when predictions are processed, violations are detected, or system events occur.
                </p>
                <div style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--text-tertiary)' }}>
                  Webhook configuration coming soon
                </div>
              </div>
            </section>

            {/* Organization Configuration Section */}
            <section className={styles.contentSection}>
              <h2>Organization Configuration</h2>
              <div className={styles.articleCard} style={{cursor: 'default'}}>
                <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                  Organization configuration is available in the Organization Management page.
                </p>
                <Button variant="secondary" size="sm" onClick={() => window.location.href = '/organization'}>
                  Go to Organization Management
                </Button>
              </div>
            </section>

            {/* System Information Section */}
            <section className={styles.contentSection}>
              <h2>System Information</h2>
              <div className={styles.articleCard} style={{cursor: 'default'}}>
                <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                  Platform version information and deployment environment.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-4)' }}>
                  <div style={{ padding: 'var(--space-3)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginBottom: '4px' }}>API Version</div>
                    <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>v1.0.0</div>
                  </div>
                  <div style={{ padding: 'var(--space-3)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginBottom: '4px' }}>Frontend Version</div>
                    <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>v1.0.0</div>
                  </div>
                  <div style={{ padding: 'var(--space-3)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginBottom: '4px' }}>Environment</div>
                    <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>Production</div>
                  </div>
                </div>
              </div>
            </section>

          </div>

          <div className={styles.contentSidebar}>
            <div className={styles.sidebarCard}>
              <h3>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <Button onClick={() => window.location.href = '/profile'} variant="secondary" size="sm" fullWidth>
                  Profile Settings
                </Button>
                <Button onClick={() => window.location.href = '/organization'} variant="secondary" size="sm" fullWidth>
                  Organization
                </Button>
                <Button onClick={() => window.location.href = '/billing'} variant="secondary" size="sm" fullWidth>
                  Billing
                </Button>
              </div>
            </div>

            <div className={styles.sidebarCard}>
              <h3>Configuration Tips</h3>
              <ul>
                <li>Keep API keys secure and rotate regularly</li>
                <li>Adjust thresholds based on your risk tolerance</li>
                <li>Monitor model performance metrics</li>
                <li>Set up webhooks for real-time alerts</li>
              </ul>
            </div>

            <div className={styles.sidebarCard}>
              <h3>Need Help?</h3>
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                Check our documentation or contact support.
              </p>
              <Button onClick={() => window.location.href = '/help'} variant="secondary" size="sm" fullWidth>
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
