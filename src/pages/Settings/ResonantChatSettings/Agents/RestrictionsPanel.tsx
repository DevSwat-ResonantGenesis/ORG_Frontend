/**
 * Restrictions Panel Component
 * Manage forbidden words, restricted topics, and replacement rules
 */
import React, { useState, useEffect } from 'react';
import { settingsApi, type Restrictions } from '@/api/settings';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { logger } from '@/utils/logger';
import styles from './RestrictionsPanel.module.css';

interface RestrictionsPanelProps {
  agentId: string;
}

export const RestrictionsPanel: React.FC<RestrictionsPanelProps> = ({ agentId }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [restrictions, setRestrictions] = useState<Restrictions>({
    forbidden_words: [],
    restricted_topics: [],
    replacement_rules: {},
    filter_enabled: true,
  });

  const [newWord, setNewWord] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newReplacementKey, setNewReplacementKey] = useState('');
  const [newReplacementValue, setNewReplacementValue] = useState('');

  useEffect(() => {
    loadRestrictions();
  }, [agentId]);

  const loadRestrictions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await settingsApi.getAgentRestrictions(agentId);
      setRestrictions(data);
    } catch (err: any) {
      logger.error('Failed to load restrictions', err);
      setError(err?.message || 'Failed to load restrictions');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await settingsApi.updateAgentRestrictions(agentId, restrictions);
      alert('Restrictions saved successfully!');
    } catch (err: any) {
      logger.error('Failed to save restrictions', err);
      setError(err?.message || 'Failed to save restrictions');
    } finally {
      setSaving(false);
    }
  };

  const handleAddWord = () => {
    if (newWord.trim() && !restrictions.forbidden_words?.includes(newWord.trim())) {
      setRestrictions((prev) => ({
        ...prev,
        forbidden_words: [...(prev.forbidden_words || []), newWord.trim()],
      }));
      setNewWord('');
    }
  };

  const handleRemoveWord = (word: string) => {
    setRestrictions((prev) => ({
      ...prev,
      forbidden_words: (prev.forbidden_words || []).filter((w) => w !== word),
    }));
  };

  const handleAddTopic = () => {
    if (newTopic.trim() && !restrictions.restricted_topics?.includes(newTopic.trim())) {
      setRestrictions((prev) => ({
        ...prev,
        restricted_topics: [...(prev.restricted_topics || []), newTopic.trim()],
      }));
      setNewTopic('');
    }
  };

  const handleRemoveTopic = (topic: string) => {
    setRestrictions((prev) => ({
      ...prev,
      restricted_topics: (prev.restricted_topics || []).filter((t) => t !== topic),
    }));
  };

  const handleAddReplacement = () => {
    if (newReplacementKey.trim() && newReplacementValue.trim()) {
      setRestrictions((prev) => ({
        ...prev,
        replacement_rules: {
          ...(prev.replacement_rules || {}),
          [newReplacementKey.trim()]: newReplacementValue.trim(),
        },
      }));
      setNewReplacementKey('');
      setNewReplacementValue('');
    }
  };

  const handleRemoveReplacement = (key: string) => {
    setRestrictions((prev) => {
      const rules = { ...(prev.replacement_rules || {}) };
      delete rules[key];
      return {
        ...prev,
        replacement_rules: rules,
      };
    });
  };

  if (loading) {
    return <LoadingState message="Loading restrictions..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Content Restrictions</h2>
        <p className={styles.subtitle}>
          Control what content the agent can generate or respond to
        </p>
      </div>

      {error && <ErrorState message={error} />}

      <div className={styles.form}>
        <div className={styles.toggleSection}>
          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={restrictions.filter_enabled ?? true}
              onChange={(e) =>
                setRestrictions((prev) => ({
                  ...prev,
                  filter_enabled: e.target.checked,
                }))
              }
            />
            <span>Enable content filtering</span>
          </label>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Forbidden Words</h3>
          <p className={styles.sectionDescription}>
            Words that should not appear in agent responses
          </p>

          <div className={styles.addItem}>
            <input
              type="text"
              className={styles.input}
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddWord()}
              placeholder="Enter forbidden word"
            />
            <button className={styles.addButton} onClick={handleAddWord}>
              Add
            </button>
          </div>

          <div className={styles.itemList}>
            {restrictions.forbidden_words?.map((word) => (
              <div key={word} className={styles.item}>
                <span className={styles.itemText}>{word}</span>
                <button
                  className={styles.removeButton}
                  onClick={() => handleRemoveWord(word)}
                >
                  ×
                </button>
              </div>
            ))}
            {(!restrictions.forbidden_words || restrictions.forbidden_words.length === 0) && (
              <p className={styles.emptyText}>No forbidden words added</p>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Restricted Topics</h3>
          <p className={styles.sectionDescription}>
            Topics the agent should avoid discussing
          </p>

          <div className={styles.addItem}>
            <input
              type="text"
              className={styles.input}
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTopic()}
              placeholder="Enter restricted topic"
            />
            <button className={styles.addButton} onClick={handleAddTopic}>
              Add
            </button>
          </div>

          <div className={styles.itemList}>
            {restrictions.restricted_topics?.map((topic) => (
              <div key={topic} className={styles.item}>
                <span className={styles.itemText}>{topic}</span>
                <button
                  className={styles.removeButton}
                  onClick={() => handleRemoveTopic(topic)}
                >
                  ×
                </button>
              </div>
            ))}
            {(!restrictions.restricted_topics || restrictions.restricted_topics.length === 0) && (
              <p className={styles.emptyText}>No restricted topics added</p>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Replacement Rules</h3>
          <p className={styles.sectionDescription}>
            Automatically replace specific words or phrases
          </p>

          <div className={styles.addReplacement}>
            <input
              type="text"
              className={styles.input}
              value={newReplacementKey}
              onChange={(e) => setNewReplacementKey(e.target.value)}
              placeholder="Word/phrase to replace"
            />
            <span className={styles.arrow}>→</span>
            <input
              type="text"
              className={styles.input}
              value={newReplacementValue}
              onChange={(e) => setNewReplacementValue(e.target.value)}
              placeholder="Replacement"
            />
            <button className={styles.addButton} onClick={handleAddReplacement}>
              Add
            </button>
          </div>

          <div className={styles.itemList}>
            {Object.entries(restrictions.replacement_rules || {}).map(([key, value]) => (
              <div key={key} className={styles.item}>
                <span className={styles.itemText}>
                  <strong>{key}</strong> → {value}
                </span>
                <button
                  className={styles.removeButton}
                  onClick={() => handleRemoveReplacement(key)}
                >
                  ×
                </button>
              </div>
            ))}
            {(!restrictions.replacement_rules || Object.keys(restrictions.replacement_rules).length === 0) && (
              <p className={styles.emptyText}>No replacement rules added</p>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.saveButton}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Restrictions'}
          </button>
        </div>
      </div>
    </div>
  );
};

