/**
 * Provider List Component
 * Manage custom AI providers
 */
import React, { useState, useEffect } from 'react';
import { settingsApi, type CustomProvider } from '@/api/settings';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { logger } from '@/utils/logger';
import styles from './ProviderList.module.css';

export const ProviderList: React.FC = () => {
  const [providers, setProviders] = useState<CustomProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    provider_type: 'openai',
    api_key: '',
    endpoint: '',
    enabled: true,
    priority: 0,
    weight: 1.0,
  });

  const loadProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await settingsApi.listProviders();
      setProviders(data);
    } catch (err: any) {
      logger.error('Failed to load providers', err);
      setError(err?.message || 'Failed to load providers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await settingsApi.createProvider(formData);
      setShowCreateForm(false);
      setFormData({
        name: '',
        provider_type: 'openai',
        api_key: '',
        endpoint: '',
        enabled: true,
        priority: 0,
        weight: 1.0,
      });
      await loadProviders();
    } catch (err: any) {
      logger.error('Failed to create provider', err);
      alert(err?.message || 'Failed to create provider');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (providerId: string) => {
    if (!confirm('Are you sure you want to delete this provider?')) {
      return;
    }

    try {
      await settingsApi.deleteProvider(providerId);
      await loadProviders();
    } catch (err: any) {
      logger.error('Failed to delete provider', err);
      alert(err?.message || 'Failed to delete provider');
    }
  };

  if (loading && providers.length === 0) {
    return <LoadingState message="Loading providers..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Providers</h1>
          <p className={styles.subtitle}>Manage custom AI providers</p>
        </div>
        <button
          className={styles.createButton}
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          + Add Provider
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreate} className={styles.createForm}>
          <h3 className={styles.formTitle}>Add New Provider</h3>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Name *</label>
              <input
                type="text"
                className={styles.input}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="My Custom Provider"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Type *</label>
              <select
                className={styles.input}
                value={formData.provider_type}
                onChange={(e) => setFormData({ ...formData, provider_type: e.target.value })}
                required
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="gemini">Google Gemini</option>
                <option value="groq">Groq</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>API Key *</label>
            <input
              type="password"
              className={styles.input}
              value={formData.api_key}
              onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
              required
              placeholder="sk-..."
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Endpoint (optional)</label>
            <input
              type="url"
              className={styles.input}
              value={formData.endpoint}
              onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
              placeholder="https://api.example.com/v1"
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => setShowCreateForm(false)}
            >
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              Create Provider
            </button>
          </div>
        </form>
      )}

      {error && <ErrorState message={error} onRetry={loadProviders} />}

      {providers.length === 0 && !showCreateForm ? (
        <div className={styles.emptyState}>
          <p>No custom providers yet. Add your first provider to get started.</p>
        </div>
      ) : (
        <div className={styles.providerList}>
          {providers.map((provider) => (
            <div key={provider.id} className={styles.providerCard}>
              <div className={styles.providerHeader}>
                <div>
                  <h3 className={styles.providerName}>{provider.name}</h3>
                  <span className={styles.providerType}>{provider.provider_type}</span>
                </div>
                <span className={`${styles.status} ${provider.enabled ? styles.enabled : styles.disabled}`}>
                  {provider.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              <div className={styles.providerMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Priority:</span>
                  <span className={styles.metaValue}>{provider.priority}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Weight:</span>
                  <span className={styles.metaValue}>{provider.weight}</span>
                </div>
              </div>

              <div className={styles.providerActions}>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDelete(provider.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

