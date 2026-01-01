// ============== ENVIRONMENT MANAGER ==============
// Manage environment variables with multiple profiles

import React, { memo, useState, useCallback } from 'react';
import styles from './EnvironmentManager.module.css';

interface EnvVariable {
  key: string;
  value: string;
  isSecret: boolean;
  description?: string;
}

interface Environment {
  id: string;
  name: string;
  icon: string;
  variables: EnvVariable[];
  isActive: boolean;
}

interface EnvironmentManagerProps {
  environments?: Environment[];
  onSave?: (environments: Environment[]) => void;
  onActivate?: (envId: string) => void;
  className?: string;
}

const defaultEnvironments: Environment[] = [
  {
    id: 'development',
    name: 'Development',
    icon: '🛠️',
    isActive: true,
    variables: [
      { key: 'VITE_API_URL', value: 'http://localhost:8000', isSecret: false, description: 'Backend Gateway URL' },
      { key: 'VITE_IDE_URL', value: 'http://localhost:8080', isSecret: false, description: 'IDE Service URL' },
      { key: 'DEBUG', value: 'true', isSecret: false, description: 'Enable debug mode' },
      { key: 'LOG_LEVEL', value: 'debug', isSecret: false },
    ],
  },
  {
    id: 'staging',
    name: 'Staging',
    icon: '🧪',
    isActive: false,
    variables: [
      { key: 'API_URL', value: 'https://staging-api.example.com', isSecret: false },
      { key: 'DEBUG', value: 'false', isSecret: false },
    ],
  },
  {
    id: 'production',
    name: 'Production',
    icon: '🚀',
    isActive: false,
    variables: [
      { key: 'API_URL', value: 'https://api.example.com', isSecret: false },
      { key: 'DEBUG', value: 'false', isSecret: false },
      { key: 'API_KEY', value: '••••••••••••', isSecret: true },
    ],
  },
];

const EnvironmentManagerComponent: React.FC<EnvironmentManagerProps> = ({
  environments = defaultEnvironments,
  onSave,
  onActivate,
  className,
}) => {
  const [envs, setEnvs] = useState<Environment[]>(environments);
  const [selectedEnvId, setSelectedEnvId] = useState<string>(environments[0]?.id || '');
  const [editingVar, setEditingVar] = useState<{ envId: string; key: string } | null>(null);
  const [newVarKey, setNewVarKey] = useState('');
  const [newVarValue, setNewVarValue] = useState('');
  const [showSecrets, setShowSecrets] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const selectedEnv = envs.find(e => e.id === selectedEnvId);

  const activateEnvironment = useCallback((envId: string) => {
    setEnvs(prev => prev.map(env => ({
      ...env,
      isActive: env.id === envId,
    })));
    onActivate?.(envId);
  }, [onActivate]);

  const addVariable = useCallback(() => {
    if (!newVarKey.trim() || !selectedEnvId) return;

    setEnvs(prev => prev.map(env => {
      if (env.id === selectedEnvId) {
        return {
          ...env,
          variables: [
            ...env.variables,
            { key: newVarKey.trim(), value: newVarValue, isSecret: false },
          ],
        };
      }
      return env;
    }));

    setNewVarKey('');
    setNewVarValue('');
  }, [selectedEnvId, newVarKey, newVarValue]);

  const updateVariable = useCallback((envId: string, key: string, updates: Partial<EnvVariable>) => {
    setEnvs(prev => prev.map(env => {
      if (env.id === envId) {
        return {
          ...env,
          variables: env.variables.map(v =>
            v.key === key ? { ...v, ...updates } : v
          ),
        };
      }
      return env;
    }));
  }, []);

  const deleteVariable = useCallback((envId: string, key: string) => {
    setEnvs(prev => prev.map(env => {
      if (env.id === envId) {
        return {
          ...env,
          variables: env.variables.filter(v => v.key !== key),
        };
      }
      return env;
    }));
  }, []);

  const toggleSecret = useCallback((key: string) => {
    setShowSecrets(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const addEnvironment = useCallback(() => {
    const newEnv: Environment = {
      id: `env-${Date.now()}`,
      name: 'New Environment',
      icon: '🔧',
      isActive: false,
      variables: [],
    };
    setEnvs(prev => [...prev, newEnv]);
    setSelectedEnvId(newEnv.id);
  }, []);

  const deleteEnvironment = useCallback((envId: string) => {
    setEnvs(prev => prev.filter(e => e.id !== envId));
    if (selectedEnvId === envId) {
      setSelectedEnvId(envs[0]?.id || '');
    }
  }, [selectedEnvId, envs]);

  const saveAll = useCallback(() => {
    onSave?.(envs);
  }, [envs, onSave]);

  const exportEnv = useCallback(() => {
    if (!selectedEnv) return;
    
    const envContent = selectedEnv.variables
      .map(v => `${v.key}=${v.isSecret ? '***' : v.value}`)
      .join('\n');
    
    navigator.clipboard.writeText(envContent);
  }, [selectedEnv]);

  const filteredVariables = selectedEnv?.variables.filter(v =>
    v.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.value.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.icon}>🔐</span>
          <span>Environment Manager</span>
        </div>
        <div className={styles.actions}>
          <button className={styles.exportBtn} onClick={exportEnv}>📋 Export</button>
          <button className={styles.saveBtn} onClick={saveAll}>💾 Save All</button>
        </div>
      </div>

      <div className={styles.envTabs}>
        {envs.map(env => (
          <button
            key={env.id}
            className={`${styles.envTab} ${selectedEnvId === env.id ? styles.selected : ''} ${env.isActive ? styles.active : ''}`}
            onClick={() => setSelectedEnvId(env.id)}
          >
            <span className={styles.envIcon}>{env.icon}</span>
            <span className={styles.envName}>{env.name}</span>
            {env.isActive && <span className={styles.activeBadge}>Active</span>}
          </button>
        ))}
        <button className={styles.addEnvBtn} onClick={addEnvironment}>+</button>
      </div>

      {selectedEnv && (
        <div className={styles.envPanel}>
          <div className={styles.envHeader}>
            <div className={styles.envInfo}>
              <span className={styles.envTitle}>{selectedEnv.icon} {selectedEnv.name}</span>
              <span className={styles.varCount}>{selectedEnv.variables.length} variables</span>
            </div>
            <div className={styles.envActions}>
              {!selectedEnv.isActive && (
                <button
                  className={styles.activateBtn}
                  onClick={() => activateEnvironment(selectedEnv.id)}
                >
                  ✓ Activate
                </button>
              )}
              <button
                className={styles.deleteEnvBtn}
                onClick={() => deleteEnvironment(selectedEnv.id)}
              >
                🗑️
              </button>
            </div>
          </div>

          <div className={styles.search}>
            <input
              type="text"
              placeholder="Search variables..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.variablesList}>
            {filteredVariables.map(variable => (
              <div key={variable.key} className={styles.variableRow}>
                <div className={styles.varKey}>
                  <span className={styles.keyName}>{variable.key}</span>
                  {variable.description && (
                    <span className={styles.varDesc}>{variable.description}</span>
                  )}
                </div>
                <div className={styles.varValue}>
                  {editingVar?.envId === selectedEnv.id && editingVar.key === variable.key ? (
                    <input
                      type="text"
                      value={variable.value}
                      onChange={e => updateVariable(selectedEnv.id, variable.key, { value: e.target.value })}
                      onBlur={() => setEditingVar(null)}
                      autoFocus
                    />
                  ) : (
                    <span
                      className={styles.valueText}
                      onClick={() => setEditingVar({ envId: selectedEnv.id, key: variable.key })}
                    >
                      {variable.isSecret && !showSecrets.has(variable.key)
                        ? '••••••••••••'
                        : variable.value
                      }
                    </span>
                  )}
                </div>
                <div className={styles.varActions}>
                  {variable.isSecret && (
                    <button
                      className={styles.toggleSecretBtn}
                      onClick={() => toggleSecret(variable.key)}
                    >
                      {showSecrets.has(variable.key) ? '👁️' : '🔒'}
                    </button>
                  )}
                  <button
                    className={styles.secretBtn}
                    onClick={() => updateVariable(selectedEnv.id, variable.key, { isSecret: !variable.isSecret })}
                    title={variable.isSecret ? 'Make visible' : 'Mark as secret'}
                  >
                    {variable.isSecret ? '🔐' : '🔓'}
                  </button>
                  <button
                    className={styles.deleteVarBtn}
                    onClick={() => deleteVariable(selectedEnv.id, variable.key)}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}

            {filteredVariables.length === 0 && searchQuery && (
              <div className={styles.noResults}>No variables match your search</div>
            )}
          </div>

          <div className={styles.addVariable}>
            <input
              type="text"
              placeholder="KEY"
              value={newVarKey}
              onChange={e => setNewVarKey(e.target.value.toUpperCase())}
              className={styles.newKeyInput}
            />
            <input
              type="text"
              placeholder="Value"
              value={newVarValue}
              onChange={e => setNewVarValue(e.target.value)}
              className={styles.newValueInput}
            />
            <button className={styles.addVarBtn} onClick={addVariable}>
              + Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const EnvironmentManager = memo(EnvironmentManagerComponent);
export default EnvironmentManager;
