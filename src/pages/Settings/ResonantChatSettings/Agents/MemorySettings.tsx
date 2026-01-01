/**
 * Memory Settings Component
 * Configure memory retention, thresholds, and search settings for an agent
 */
import React, { useState, useEffect } from 'react';
import { settingsApi, type MemoryConfig } from '@/api/settings';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { logger } from '@/utils/logger';
import styles from './MemorySettings.module.css';

interface MemorySettingsProps {
  agentId: string;
}

export const MemorySettings: React.FC<MemorySettingsProps> = ({ agentId }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [config, setConfig] = useState<MemoryConfig>({
    retention_days: 30,
    importance_threshold: 0.5,
    memory_types: ['episodic', 'semantic'],
    search_settings: {
      top_k: 10,
      resonance_threshold: 0.3,
    },
    max_memories: 1000,
    decay_rate: 0.1,
  });

  useEffect(() => {
    loadConfig();
  }, [agentId]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await settingsApi.getAgentMemoryConfig(agentId);
      setConfig(data);
    } catch (err: any) {
      logger.error('Failed to load memory config', err);
      setError(err?.message || 'Failed to load memory configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await settingsApi.updateAgentMemoryConfig(agentId, config);
      alert('Memory settings saved successfully!');
    } catch (err: any) {
      logger.error('Failed to save memory config', err);
      setError(err?.message || 'Failed to save memory configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof MemoryConfig, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearchSettingChange = (field: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      search_settings: {
        ...prev.search_settings,
        [field]: value,
      },
    }));
  };

  if (loading) {
    return <LoadingState message="Loading memory settings..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Memory Settings</h2>
        <p className={styles.subtitle}>Configure how this agent manages and retrieves memories</p>
      </div>

      {error && <ErrorState message={error} />}

      <div className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Retention Period (days)
          </label>
          <input
            type="number"
            className={styles.input}
            value={config.retention_days || 30}
            onChange={(e) => handleChange('retention_days', parseInt(e.target.value))}
            min="1"
            max="365"
          />
          <p className={styles.helpText}>
            How long to keep memories before they decay (1-365 days)
          </p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Importance Threshold
          </label>
          <input
            type="number"
            className={styles.input}
            value={config.importance_threshold || 0.5}
            onChange={(e) => handleChange('importance_threshold', parseFloat(e.target.value))}
            min="0"
            max="1"
            step="0.1"
          />
          <p className={styles.helpText}>
            Minimum importance score (0.0-1.0) for memories to be retrieved
          </p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Memory Types
          </label>
          <div className={styles.checkboxGroup}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={config.memory_types?.includes('episodic') || false}
                onChange={(e) => {
                  const types = config.memory_types || [];
                  if (e.target.checked) {
                    handleChange('memory_types', [...types, 'episodic']);
                  } else {
                    handleChange('memory_types', types.filter(t => t !== 'episodic'));
                  }
                }}
              />
              <span>Episodic (short-term, decaying)</span>
            </label>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={config.memory_types?.includes('semantic') || false}
                onChange={(e) => {
                  const types = config.memory_types || [];
                  if (e.target.checked) {
                    handleChange('memory_types', [...types, 'semantic']);
                  } else {
                    handleChange('memory_types', types.filter(t => t !== 'semantic'));
                  }
                }}
              />
              <span>Semantic (long-term, stable)</span>
            </label>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Search Settings</h3>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Top K Results
            </label>
            <input
              type="number"
              className={styles.input}
              value={config.search_settings?.top_k || 10}
              onChange={(e) => handleSearchSettingChange('top_k', parseInt(e.target.value))}
              min="1"
              max="50"
            />
            <p className={styles.helpText}>
              Maximum number of memories to retrieve per query
            </p>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Resonance Threshold
            </label>
            <input
              type="number"
              className={styles.input}
              value={config.search_settings?.resonance_threshold || 0.3}
              onChange={(e) => handleSearchSettingChange('resonance_threshold', parseFloat(e.target.value))}
              min="0"
              max="1"
              step="0.1"
            />
            <p className={styles.helpText}>
              Minimum resonance score (0.0-1.0) for memory retrieval
            </p>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Max Memories
          </label>
          <input
            type="number"
            className={styles.input}
            value={config.max_memories || 1000}
            onChange={(e) => handleChange('max_memories', parseInt(e.target.value))}
            min="100"
            max="10000"
            step="100"
          />
          <p className={styles.helpText}>
            Maximum number of memories to store for this agent
          </p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Decay Rate
          </label>
          <input
            type="number"
            className={styles.input}
            value={config.decay_rate || 0.1}
            onChange={(e) => handleChange('decay_rate', parseFloat(e.target.value))}
            min="0"
            max="1"
            step="0.01"
          />
          <p className={styles.helpText}>
            Rate at which episodic memories decay over time (0.0-1.0)
          </p>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.saveButton}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Memory Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

