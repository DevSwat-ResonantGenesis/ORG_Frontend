/**
 * API Key Management Component
 * Generate, list, and manage API keys for an agent
 */
import React, { useState, useEffect } from 'react';
import { settingsApi } from '@/api/settings';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { AddIcon } from '@/components/Icons/SettingsIcons';
import { logger } from '@/utils/logger';
import styles from './APIKeyManagement.module.css';

interface APIKeyManagementProps {
  agentId: string;
}

interface APIKey {
  id: string;
  name: string;
  key_hash: string;
  rate_limit: number;
  enabled: boolean;
  created_at: string;
  last_used?: string;
  webhook_url?: string;
}

export const APIKeyManagement: React.FC<APIKeyManagementProps> = ({ agentId }) => {
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    rate_limit: 100,
    webhook_url: '',
  });

  useEffect(() => {
    loadKeys();
  }, [agentId]);

  const loadKeys = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await settingsApi.listAgentAPIKeys(agentId);
      setKeys(data);
    } catch (err: any) {
      logger.error('Failed to load API keys', err);
      setError(err?.message || 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      const result = await settingsApi.createAgentAPIKey(agentId, {
        name: formData.name,
        rate_limit: formData.rate_limit,
        webhook_url: formData.webhook_url || undefined,
      });
      
      setNewKey(result.api_key);
      setShowCreateForm(false);
      setFormData({ name: '', rate_limit: 100, webhook_url: '' });
      await loadKeys();
    } catch (err: any) {
      logger.error('Failed to create API key', err);
      setError(err?.message || 'Failed to create API key');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await settingsApi.deleteAgentAPIKey(agentId, keyId);
      await loadKeys();
    } catch (err: any) {
      logger.error('Failed to delete API key', err);
      alert(err?.message || 'Failed to delete API key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('API key copied to clipboard!');
  };

  if (loading && keys.length === 0) {
    return <LoadingState message="Loading API keys..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>API Keys</h2>
          <p className={styles.subtitle}>
            Generate API keys to connect external applications to this agent
          </p>
        </div>
        {!showCreateForm && (
          <button
            className={styles.createButton}
            onClick={() => setShowCreateForm(true)}
            disabled={loading}
          >
            <AddIcon size={16} />
            <span>Generate New Key</span>
          </button>
        )}
      </div>

      {error && <ErrorState message={error} onRetry={loadKeys} />}

      {newKey && (
        <div className={styles.newKeyAlert}>
          <div className={styles.alertHeader}>
            <strong>⚠️ Save this API key now!</strong>
            <p>This is the only time you'll see it. Copy it to a safe place.</p>
          </div>
          <div className={styles.keyDisplay}>
            <code className={styles.apiKeyValue}>{newKey}</code>
            <button
              className={styles.copyButton}
              onClick={() => copyToClipboard(newKey)}
            >
              Copy
            </button>
          </div>
          <button
            className={styles.dismissButton}
            onClick={() => setNewKey(null)}
          >
            I've saved it
          </button>
        </div>
      )}

      {showCreateForm && (
        <form onSubmit={handleCreate} className={styles.createForm}>
          <h3 className={styles.formTitle}>Generate New API Key</h3>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Key Name <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Production Key, Development Key, etc."
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Rate Limit (requests/hour)</label>
            <input
              type="number"
              className={styles.input}
              value={formData.rate_limit}
              onChange={(e) => setFormData({ ...formData, rate_limit: parseInt(e.target.value) })}
              min="1"
              max="10000"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Webhook URL (optional)</label>
            <input
              type="url"
              className={styles.input}
              value={formData.webhook_url}
              onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
              placeholder="https://your-app.com/webhook"
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
            <button type="submit" className={styles.submitButton} disabled={loading}>
              Generate Key
            </button>
          </div>
        </form>
      )}

      {keys.length === 0 && !showCreateForm ? (
        <div className={styles.emptyState}>
          <p>No API keys yet. Generate your first API key to connect external applications.</p>
        </div>
      ) : (
        <div className={styles.keysList}>
          {keys.map((key) => (
            <div key={key.id} className={styles.keyCard}>
              <div className={styles.keyHeader}>
                <div>
                  <h4 className={styles.keyName}>{key.name}</h4>
                  <code className={styles.keyHash}>{key.key_hash}</code>
                </div>
                <span className={`${styles.status} ${key.enabled ? styles.enabled : styles.disabled}`}>
                  {key.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>

              <div className={styles.keyMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Rate Limit:</span>
                  <span className={styles.metaValue}>{key.rate_limit} req/hour</span>
                </div>
                {key.webhook_url && (
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Webhook:</span>
                    <span className={styles.metaValue}>{key.webhook_url}</span>
                  </div>
                )}
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Created:</span>
                  <span className={styles.metaValue}>
                    {new Date(key.created_at).toLocaleDateString()}
                  </span>
                </div>
                {key.last_used && (
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Last Used:</span>
                    <span className={styles.metaValue}>
                      {new Date(key.last_used).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.keyActions}>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDelete(key.id)}
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

