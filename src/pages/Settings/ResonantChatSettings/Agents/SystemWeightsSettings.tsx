/**
 * System Weights Settings Component
 * Configure Hash Sphere / RAG / Memory percentages
 */
import React, { useState, useEffect } from 'react';
import { settingsApi } from '@/api/settings';
import { Tooltip } from '@/components/ui/Tooltip';
import { InfoIcon } from '@/components/Icons/SettingsIcons';
import { logger } from '@/utils/logger';
import styles from './SystemWeightsSettings.module.css';

interface SystemWeightsSettingsProps {
  agentId: string;
}

export const SystemWeightsSettings: React.FC<SystemWeightsSettingsProps> = ({ agentId }) => {
  const [loading, setLoading] = useState(false);
  const [weights, setWeights] = useState({
    hash_sphere: 40,
    rag: 30,
    memory: 30,
  });

  useEffect(() => {
    loadWeights();
  }, [agentId]);

  const loadWeights = async () => {
    try {
      setLoading(true);
      const agent = await settingsApi.getAgent(agentId);
      if (agent.memory_config?.weights) {
        setWeights({
          hash_sphere: agent.memory_config.weights.hash_sphere || 40,
          rag: agent.memory_config.weights.rag || 30,
          memory: agent.memory_config.weights.memory || 30,
        });
      }
    } catch (err: any) {
      logger.error('Failed to load weights', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWeightChange = (key: 'hash_sphere' | 'rag' | 'memory', value: number) => {
    const newWeights = { ...weights, [key]: value };
    const total = newWeights.hash_sphere + newWeights.rag + newWeights.memory;
    
    // Normalize to 100%
    if (total !== 100) {
      const scale = 100 / total;
      newWeights.hash_sphere = Math.round(newWeights.hash_sphere * scale);
      newWeights.rag = Math.round(newWeights.rag * scale);
      newWeights.memory = Math.round(newWeights.memory * scale);
    }
    
    setWeights(newWeights);
    saveWeights(newWeights);
  };

  const saveWeights = async (newWeights: typeof weights) => {
    try {
      const agent = await settingsApi.getAgent(agentId);
      await settingsApi.updateAgent(agentId, {
        memory_config: {
          ...agent.memory_config,
          weights: newWeights,
        },
      });
    } catch (err: any) {
      logger.error('Failed to save weights', err);
      alert(err?.message || 'Failed to save weights');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading weights...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>System Weights Configuration</h3>
        <Tooltip content="Configure the relative importance of Hash Sphere, RAG, and Memory in context retrieval. Total must equal 100%.">
          <InfoIcon size={18} />
        </Tooltip>
      </div>

      <p className={styles.description}>
        Adjust the percentage weights for each system component. These weights determine how much influence each system has when retrieving context for responses.
      </p>

      <div className={styles.weightsGrid}>
        <div className={styles.weightCard}>
          <div className={styles.weightHeader}>
            <label className={styles.weightLabel}>Hash Sphere</label>
            <span className={styles.weightValue}>{weights.hash_sphere}%</span>
          </div>
          <Tooltip content="Hash Sphere: Semantic resonance-based memory retrieval using 3D coordinate mapping">
            <input
              type="range"
              min="0"
              max="100"
              value={weights.hash_sphere}
              onChange={(e) => handleWeightChange('hash_sphere', parseInt(e.target.value))}
              className={styles.slider}
            />
          </Tooltip>
        </div>

        <div className={styles.weightCard}>
          <div className={styles.weightHeader}>
            <label className={styles.weightLabel}>RAG</label>
            <span className={styles.weightValue}>{weights.rag}%</span>
          </div>
          <Tooltip content="RAG: Retrieval-Augmented Generation using vector embeddings and similarity search">
            <input
              type="range"
              min="0"
              max="100"
              value={weights.rag}
              onChange={(e) => handleWeightChange('rag', parseInt(e.target.value))}
              className={styles.slider}
            />
          </Tooltip>
        </div>

        <div className={styles.weightCard}>
          <div className={styles.weightHeader}>
            <label className={styles.weightLabel}>Memory</label>
            <span className={styles.weightValue}>{weights.memory}%</span>
          </div>
          <Tooltip content="Memory: Direct memory retrieval from stored conversations and anchors">
            <input
              type="range"
              min="0"
              max="100"
              value={weights.memory}
              onChange={(e) => handleWeightChange('memory', parseInt(e.target.value))}
              className={styles.slider}
            />
          </Tooltip>
        </div>
      </div>

      <div className={styles.total}>
        <span className={styles.totalLabel}>Total:</span>
        <span className={styles.totalValue}>
          {weights.hash_sphere + weights.rag + weights.memory}%
        </span>
      </div>
    </div>
  );
};

