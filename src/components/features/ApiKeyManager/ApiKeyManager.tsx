/**
 * API Key Manager Component
 * Allows users to add, view, and manage their own API keys (BYOK)
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import {
  fetchUserApiKeys,
  addUserApiKey,
  deleteUserApiKey,
  validateApiKey,
  API_KEY_PROVIDERS,
  type UserApiKey,
} from '@/api/userApiKeys';
import styles from './ApiKeyManager.module.css';

interface ApiKeyManagerProps {
  onKeyAdded?: (key: UserApiKey) => void;
  onKeyDeleted?: (keyId: string) => void;
  requireAtLeastOne?: boolean;
  showTitle?: boolean;
  compact?: boolean;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({
  onKeyAdded,
  onKeyDeleted,
  requireAtLeastOne = false,
  showTitle = true,
  compact = false,
}) => {
  const [keys, setKeys] = useState<UserApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [providerSearch, setProviderSearch] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [keyName, setKeyName] = useState('');
  const [validating, setValidating] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [validationResult, setValidationResult] = useState<{ valid: boolean; error?: string } | null>(null);

  // Load keys on mount
  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    setLoading(true);
    try {
      const userKeys = await fetchUserApiKeys();
      setKeys(userKeys);
    } catch (err) {
      console.error('Failed to load API keys:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateKey = async () => {
    if (!apiKeyInput.trim()) {
      setError('Please enter an API key');
      return;
    }

    setValidating(true);
    setError('');
    setValidationResult(null);

    try {
      const result = await validateApiKey(selectedProvider, apiKeyInput.trim());
      setValidationResult(result);
      if (!result.valid) {
        setError(result.error || 'Invalid API key');
      }
    } catch (err: any) {
      setError(err?.message || 'Validation failed');
    } finally {
      setValidating(false);
    }
  };

  const handleAddKey = async () => {
    if (!apiKeyInput.trim()) {
      setError('Please enter an API key');
      return;
    }

    setAdding(true);
    setError('');

    try {
      const result = await addUserApiKey({
        provider: selectedProvider,
        apiKey: apiKeyInput.trim(),
        name: keyName.trim() || undefined,
      });

      if (result.success && result.key) {
        setKeys([...keys, result.key]);
        setApiKeyInput('');
        setKeyName('');
        setShowAddForm(false);
        setValidationResult(null);
        onKeyAdded?.(result.key);
      } else {
        setError(result.error || 'Failed to add API key');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to add API key');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (requireAtLeastOne && keys.length <= 1) {
      setError('You must have at least one API key');
      return;
    }

    if (!confirm('Are you sure you want to delete this API key?')) {
      return;
    }

    try {
      const result = await deleteUserApiKey(keyId);
      if (result.success) {
        setKeys(keys.filter(k => k.id !== keyId));
        onKeyDeleted?.(keyId);
      } else {
        setError(result.error || 'Failed to delete API key');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to delete API key');
    }
  };

  const normalizedProviderSearch = providerSearch.trim().toLowerCase();
  const filteredProviders = normalizedProviderSearch
    ? API_KEY_PROVIDERS.filter((p) => {
        const hay = `${p.id} ${p.name} ${(p.models || []).join(' ')}`.toLowerCase();
        return hay.includes(normalizedProviderSearch);
      })
    : API_KEY_PROVIDERS;

  const selectedProviderInfo = API_KEY_PROVIDERS.find(p => p.id === selectedProvider);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading API keys...</div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${compact ? styles.compact : ''}`}>
      {showTitle && <h3 className={styles.title}>Your API Keys</h3>}
      
      {requireAtLeastOne && keys.length === 0 && (
        <div className={styles.warning}>
          <strong>API Key Required</strong>
          <p>You need to add at least one API key to use the platform during your trial.</p>
        </div>
      )}

      {error && (
        <div className={styles.error}>{error}</div>
      )}

      {/* Existing Keys */}
      {keys.length > 0 && (
        <div className={styles.keysList}>
          {keys.map((key) => (
            <div key={key.id} className={styles.keyItem}>
              <div className={styles.keyInfo}>
                <div className={styles.keyProvider}>
                  {API_KEY_PROVIDERS.find(p => p.id === key.provider)?.name || key.provider}
                </div>
                <div className={styles.keyName}>{key.name}</div>
                <div className={styles.keyPrefix}>
                  <code>{key.keyPrefix}...</code>
                  {key.isValid ? (
                    <span className={styles.validBadge}>Valid</span>
                  ) : (
                    <span className={styles.invalidBadge}>Invalid</span>
                  )}
                </div>
                {key.usageTokens > 0 && (
                  <div className={styles.keyUsage}>
                    {key.usageTokens.toLocaleString()} tokens used
                  </div>
                )}
              </div>
              <button
                className={styles.deleteButton}
                onClick={() => handleDeleteKey(key.id)}
                disabled={requireAtLeastOne && keys.length <= 1}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Key Form */}
      {showAddForm ? (
        <div className={styles.addForm}>
          <div className={styles.formGroup}>
            <label>Provider</label>
            <input
              type="text"
              value={providerSearch}
              onChange={(e) => setProviderSearch(e.target.value)}
              placeholder="Search providers..."
              className={styles.providerSearch}
            />

            {filteredProviders.length === 0 && (
              <div className={styles.noProviders}>No providers found.</div>
            )}

            <div className={styles.providerGrid}>
              {filteredProviders.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  className={`${styles.providerCard} ${provider.id === selectedProvider ? styles.providerCardActive : ''}`}
                  onClick={() => {
                    setSelectedProvider(provider.id);
                    setValidationResult(null);
                    setError('');
                  }}
                >
                  <div className={styles.providerCardName}>{provider.name}</div>
                  <div className={styles.providerCardMeta}>{provider.id}</div>
                </button>
              ))}
            </div>
            <select
              value={selectedProvider}
              onChange={(e) => {
                setSelectedProvider(e.target.value);
                setValidationResult(null);
                setError('');
              }}
              disabled={filteredProviders.length === 0}
              className={styles.select}
            >
              {filteredProviders.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>API Key</label>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => {
                setApiKeyInput(e.target.value);
                setValidationResult(null);
                setError('');
              }}
              placeholder={selectedProviderInfo?.placeholder || 'Enter your API key'}
              className={styles.input}
            />
            {selectedProviderInfo?.helpUrl && (
              <a
                href={selectedProviderInfo.helpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.helpLink}
              >
                Get your {selectedProviderInfo.name} API key →
              </a>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Name (optional)</label>
            <input
              type="text"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="e.g., Production Key"
              className={styles.input}
            />
          </div>

          {validationResult && (
            <div className={validationResult.valid ? styles.validationSuccess : styles.validationError}>
              {validationResult.valid ? '✓ API key is valid' : `✗ ${validationResult.error}`}
            </div>
          )}

          <div className={styles.formActions}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setShowAddForm(false);
                setApiKeyInput('');
                setKeyName('');
                setValidationResult(null);
                setError('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleValidateKey}
              disabled={validating || !apiKeyInput.trim()}
            >
              {validating ? 'Validating...' : 'Validate'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddKey}
              disabled={adding || !apiKeyInput.trim()}
            >
              {adding ? 'Adding...' : 'Add Key'}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowAddForm(true)}
          className={styles.addButton}
        >
          + Add API Key
        </Button>
      )}
    </div>
  );
};

export default ApiKeyManager;
