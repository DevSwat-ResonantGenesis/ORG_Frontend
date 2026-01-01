/**
 * Patch Control Panel
 * Control all 23 patches for an agent
 */
import React, { useState, useEffect } from 'react';
import { settingsApi, type AgentPatchConfig, type PatchCatalogItem, type Agent } from '@/api/settings';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { logger } from '@/utils/logger';
import styles from './PatchControlPanel.module.css';

interface PatchControlPanelProps {
  agentId?: string;
  onSelectAgent?: (agentId: string) => void;
}

export const PatchControlPanel: React.FC<PatchControlPanelProps> = ({
  agentId,
  onSelectAgent,
}) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>(agentId);
  const [patches, setPatches] = useState<AgentPatchConfig[]>([]);
  const [catalog, setCatalog] = useState<PatchCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAgents();
    loadCatalog();
  }, []);

  useEffect(() => {
    if (selectedAgentId) {
      loadPatches();
    }
  }, [selectedAgentId]);

  const loadAgents = async () => {
    try {
      const data = await settingsApi.listAgents();
      setAgents(data);
      if (!selectedAgentId && data.length > 0) {
        setSelectedAgentId(data[0].id);
        if (onSelectAgent) {
          onSelectAgent(data[0].id);
        }
      }
    } catch (err: any) {
      logger.error('Failed to load agents', err);
    }
  };

  const loadCatalog = async () => {
    try {
      const data = await settingsApi.getPatchesCatalog();
      setCatalog(data);
    } catch (err: any) {
      logger.error('Failed to load patch catalog', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPatches = async () => {
    if (!selectedAgentId) return;

    try {
      setLoading(true);
      const data = await settingsApi.listAgentPatches(selectedAgentId);
      setPatches(data);
    } catch (err: any) {
      logger.error('Failed to load patches', err);
      setError(err?.message || 'Failed to load patches');
    } finally {
      setLoading(false);
    }
  };

  const handlePatchToggle = async (
    patchNumber: number,
    enabled: boolean,
    executionMode?: 'live' | 'background' | 'hybrid'
  ) => {
    if (!selectedAgentId) return;

    try {
      await settingsApi.updatePatchConfig(selectedAgentId, patchNumber, {
        enabled,
        execution_mode: executionMode,
      });
      await loadPatches();
    } catch (err: any) {
      logger.error('Failed to update patch', err);
      alert(err?.message || 'Failed to update patch');
    }
  };

  const getPatchConfig = (patchNumber: number): AgentPatchConfig | undefined => {
    return patches.find((p) => p.patch_number === patchNumber);
  };

  const groupedPatches = catalog.reduce((acc, patch) => {
    if (!acc[patch.group]) {
      acc[patch.group] = [];
    }
    acc[patch.group].push(patch);
    return acc;
  }, {} as Record<string, PatchCatalogItem[]>);

  if (loading && catalog.length === 0) {
    return <LoadingState message="Loading patches..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Patch Control</h1>
          <p className={styles.subtitle}>Control all 23 patches for your agents</p>
        </div>
      </div>

      {agents.length > 0 && (
        <div className={styles.agentSelector}>
          <label className={styles.selectorLabel}>Select Agent:</label>
          <select
            className={styles.select}
            value={selectedAgentId || ''}
            onChange={(e) => {
              setSelectedAgentId(e.target.value);
              if (onSelectAgent) {
                onSelectAgent(e.target.value);
              }
            }}
          >
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {!selectedAgentId && agents.length === 0 && (
        <div className={styles.emptyState}>
          <p>No agents found. Create an agent first to configure patches.</p>
        </div>
      )}

      {error && <ErrorState message={error} onRetry={loadPatches} />}

      {selectedAgentId && (
        <div className={styles.patchesContainer}>
          {Object.entries(groupedPatches).map(([group, groupPatches]) => (
            <div key={group} className={styles.patchGroup}>
              <h3 className={styles.groupTitle}>{group}</h3>
              <div className={styles.patchesGrid}>
                {groupPatches.map((patch) => {
                  const config = getPatchConfig(patch.number);
                  const enabled = config?.enabled ?? false;
                  const executionMode = config?.execution_mode ?? 'background';

                  return (
                    <div key={patch.number} className={styles.patchCard}>
                      <div className={styles.patchHeader}>
                        <div>
                          <h4 className={styles.patchName}>
                            Patch #{patch.number}: {patch.name}
                          </h4>
                        </div>
                        <label className={styles.toggle}>
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) =>
                              handlePatchToggle(patch.number, e.target.checked)
                            }
                          />
                          <span className={styles.toggleSlider}></span>
                        </label>
                      </div>

                      {enabled && (
                        <div className={styles.executionMode}>
                          <label className={styles.modeLabel}>Execution Mode:</label>
                          <select
                            className={styles.modeSelect}
                            value={executionMode}
                            onChange={(e) =>
                              handlePatchToggle(
                                patch.number,
                                true,
                                e.target.value as 'live' | 'background' | 'hybrid'
                              )
                            }
                          >
                            <option value="background">Background</option>
                            <option value="live">Live</option>
                            <option value="hybrid">Hybrid</option>
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

