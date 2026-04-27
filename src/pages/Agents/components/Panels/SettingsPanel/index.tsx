import React, { memo, useState, useEffect, useCallback } from 'react';
import { useUIStore, useSessionStore, useAgentStore } from '../../../../../stores';
import { Icons } from '../../shared/Icons';
import fastapiClient from '../../../../../api/fastapiClient';
import { ModeSwitcher, type AutonomyMode } from '../../../../../components/AutonomyMode';
import * as autonomyApi from '../../../../../api/autonomy';
import styles from './SettingsPanel.module.css';

// ============== SETTINGS PANEL ==============
// Per-agent configuration editor + autonomy controls
// Connects to PATCH /api/v1/agents/:agentId for saving

type SettingsTab = 'config' | 'tools' | 'autonomy' | 'advanced';

interface SettingsPanelProps {
  className?: string;
}

const PROVIDER_OPTIONS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic (Claude)' },
  { value: 'google', label: 'Google' },
  { value: 'mistral', label: 'Mistral' },
  { value: 'groq', label: 'Groq' },
  { value: 'together', label: 'Together AI' },
  { value: 'openrouter', label: 'OpenRouter' },
];

const MODEL_OPTIONS: Record<string, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo', 'o1-preview', 'o1-mini'],
  anthropic: ['claude-opus-4-6-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
  google: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'],
  mistral: ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest'],
  groq: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
  together: ['meta-llama/Llama-3.1-70B-Instruct', 'meta-llama/Llama-3.1-8B-Instruct'],
  openrouter: ['openai/gpt-4o', 'anthropic/claude-3.5-sonnet', 'google/gemini-pro-1.5'],
};

const TOOL_CATALOG = [
  'web_search', 'code_execution', 'file_access', 'vision', 'image_generation',
  'memory_read', 'memory_write', 'api_call', 'email_send', 'slack_send',
  'discord_send', 'github_access', 'database_query', 'browser_automation',
  'pdf_parse', 'spreadsheet', 'calendar', 'webhook_trigger',
];

const SettingsPanelComponent: React.FC<SettingsPanelProps> = ({ className }) => {
  const roles = useSessionStore(state => state.roles);
  const selectedAgentId = useAgentStore(state => state.selectedAgentId);
  const agents = useAgentStore(state => state.agents);
  const updateAgentInStore = useAgentStore(state => state.updateAgent);
  const updateAgentConfigInStore = useAgentStore(state => state.updateAgentConfig);
  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  const [activeTab, setActiveTab] = useState<SettingsTab>('config');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [autonomyMode, setAutonomyMode] = useState<AutonomyMode>('governed');
  const [autonomyStatus, setAutonomyStatus] = useState<autonomyApi.AutonomyStatus | null>(null);
  const [autonomyLoading, setAutonomyLoading] = useState(false);

  // Editable agent fields
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSystemPrompt, setEditSystemPrompt] = useState('');
  const [editProvider, setEditProvider] = useState('openai');
  const [editModel, setEditModel] = useState('gpt-4o');
  const [editTemperature, setEditTemperature] = useState(0.7);
  const [editMaxTokens, setEditMaxTokens] = useState(4096);
  const [editTools, setEditTools] = useState<string[]>([]);

  // Load agent config when selected agent changes
  useEffect(() => {
    if (selectedAgent) {
      setEditName(selectedAgent.name || '');
      setEditDescription(selectedAgent.description || '');
      setEditSystemPrompt(selectedAgent.config?.systemPrompt || '');
      setEditProvider(selectedAgent.config?.provider || selectedAgent.provider || 'openai');
      setEditModel(selectedAgent.config?.model || selectedAgent.model || 'gpt-4o');
      setEditTemperature(selectedAgent.config?.temperature ?? 0.7);
      setEditMaxTokens(selectedAgent.config?.maxTokens ?? 4096);
      setEditTools(selectedAgent.capabilities || selectedAgent.tools || []);
      setSaveStatus('idle');
    }
  }, [selectedAgent?.id]);

  const canSwitchToUnbounded = roles.includes('admin') || roles.includes('superadmin');

  useEffect(() => {
    const fetchAutonomyStatus = async () => {
      try {
        const status = await autonomyApi.getAutonomyStatus();
        setAutonomyStatus(status);
      } catch (error) {
        console.error('Failed to fetch autonomy status:', error);
      }
    };
    fetchAutonomyStatus();
  }, []);

  const handleAutonomyModeChange = async (newMode: AutonomyMode): Promise<void> => {
    setAutonomyLoading(true);
    try {
      if (newMode === 'unbounded') {
        await autonomyApi.startAutonomy();
      } else {
        await autonomyApi.stopAutonomy();
      }
      setAutonomyMode(newMode);
      const status = await autonomyApi.getAutonomyStatus();
      setAutonomyStatus(status);
    } finally {
      setAutonomyLoading(false);
    }
  };

  // Save agent config to backend
  const handleSave = useCallback(async () => {
    if (!selectedAgent) return;
    setSaving(true);
    setSaveStatus('idle');
    try {
      await fastapiClient.patch(`/api/v1/agents/${selectedAgent.id}`, {
        name: editName,
        description: editDescription,
        system_prompt: editSystemPrompt,
        model: editModel,
        temperature: editTemperature,
        max_tokens: editMaxTokens,
        tools: editTools,
      });
      // Update local store
      updateAgentInStore(selectedAgent.id, {
        name: editName,
        description: editDescription,
        capabilities: editTools,
        provider: editProvider,
        model: editModel,
      });
      updateAgentConfigInStore(selectedAgent.id, {
        provider: editProvider,
        model: editModel,
        systemPrompt: editSystemPrompt,
        temperature: editTemperature,
        maxTokens: editMaxTokens,
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error('Failed to save agent config:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setSaving(false);
    }
  }, [selectedAgent, editName, editDescription, editSystemPrompt, editProvider, editModel, editTemperature, editMaxTokens, editTools, updateAgentInStore, updateAgentConfigInStore]);

  const toggleTool = useCallback((tool: string) => {
    setEditTools(prev => prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]);
  }, []);

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'config', label: 'Agent Config', icon: <Icons.Settings /> },
    { id: 'tools', label: 'Tools', icon: <Icons.Plug /> },
    { id: 'autonomy', label: 'Autonomy', icon: <Icons.Zap /> },
    { id: 'advanced', label: 'Advanced', icon: <Icons.Code /> },
  ];

  // No agent selected
  if (!selectedAgent) {
    return (
      <div className={`${styles.panel} ${className || ''}`}>
        <div className={styles.panelHeader}>
          <h2><Icons.Settings /> Agent Settings</h2>
        </div>
        <div className={styles.panelContent}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
            <Icons.Settings />
            <p style={{ marginTop: 12, fontSize: 13 }}>Select an agent from the list to configure its settings.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.panel} ${className || ''}`}>
      <div className={styles.panelHeader}>
        <h2><Icons.Settings /> {selectedAgent.name} Settings</h2>
      </div>

      <div className={styles.panelContent}>
        <div className={styles.settingsLayout}>
          {/* Sidebar */}
          <div className={styles.settingsSidebar}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className={styles.settingsContent}>
            {/* Agent Config */}
            {activeTab === 'config' && (
              <div className={styles.settingsSection}>
                <h3>Agent Configuration</h3>
                <p className={styles.sectionDesc}>Edit your agent's core settings. Changes are saved to the server.</p>

                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <label>Name</label>
                    <span>Display name for this agent</span>
                  </div>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="Agent name"
                  />
                </div>

                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <label>Description</label>
                    <span>What this agent does</span>
                  </div>
                  <input
                    type="text"
                    value={editDescription}
                    onChange={e => setEditDescription(e.target.value)}
                    placeholder="Brief description of the agent"
                  />
                </div>

                <div className={styles.settingItem} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <div className={styles.settingInfo}>
                    <label>System Prompt</label>
                    <span>Instructions that define the agent's behavior</span>
                  </div>
                  <textarea
                    value={editSystemPrompt}
                    onChange={e => setEditSystemPrompt(e.target.value)}
                    placeholder="You are a helpful assistant that..."
                    rows={6}
                    style={{ width: '100%', marginTop: 8, padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e2e8f0', fontSize: 12, fontFamily: 'monospace', resize: 'vertical', minHeight: 100 }}
                  />
                </div>

                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <label>Provider</label>
                    <span>AI model provider</span>
                  </div>
                  <select
                    value={editProvider}
                    onChange={e => { setEditProvider(e.target.value); const models = MODEL_OPTIONS[e.target.value]; if (models && models.length > 0) setEditModel(models[0]); }}
                  >
                    {PROVIDER_OPTIONS.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <label>Model</label>
                    <span>Specific model to use</span>
                  </div>
                  <select
                    value={editModel}
                    onChange={e => setEditModel(e.target.value)}
                  >
                    {(MODEL_OPTIONS[editProvider] || []).map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <label>Temperature: {editTemperature.toFixed(2)}</label>
                    <span>Creativity (0 = precise, 1 = creative)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 200 }}>
                    <span style={{ fontSize: 10, color: '#64748b' }}>0</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={editTemperature}
                      onChange={e => setEditTemperature(parseFloat(e.target.value))}
                      style={{ flex: 1 }}
                    />
                    <span style={{ fontSize: 10, color: '#64748b' }}>1</span>
                  </div>
                </div>

                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <label>Max Tokens</label>
                    <span>Maximum response length</span>
                  </div>
                  <input
                    type="number"
                    value={editMaxTokens}
                    onChange={e => setEditMaxTokens(parseInt(e.target.value) || 4096)}
                    min={256}
                    max={128000}
                  />
                </div>
              </div>
            )}

            {/* Tools */}
            {activeTab === 'tools' && (
              <div className={styles.settingsSection}>
                <h3>Tools & Capabilities</h3>
                <p className={styles.sectionDesc}>Enable or disable tools that this agent can use.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {TOOL_CATALOG.map(tool => {
                    const active = editTools.includes(tool);
                    return (
                      <button
                        key={tool}
                        onClick={() => toggleTool(tool)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '6px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                          background: active ? 'rgba(14,165,233,0.15)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${active ? 'rgba(14,165,233,0.4)' : 'rgba(255,255,255,0.08)'}`,
                          color: active ? '#38bdf8' : '#94a3b8',
                          fontWeight: active ? 600 : 400,
                        }}
                      >
                        <span style={{ width: 14, height: 14, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? 'rgba(14,165,233,0.3)' : 'rgba(255,255,255,0.06)', fontSize: 10 }}>
                          {active ? '\u2713' : ''}
                        </span>
                        {tool.replace(/_/g, ' ')}
                      </button>
                    );
                  })}
                </div>
                <div style={{ marginTop: 16, fontSize: 11, color: '#64748b' }}>
                  {editTools.length} tool{editTools.length !== 1 ? 's' : ''} enabled
                </div>
              </div>
            )}

            {/* Autonomy Mode Settings */}
            {activeTab === 'autonomy' && (
              <div className={styles.settingsSection}>
                <h3>Autonomy Mode</h3>
                <p className={styles.sectionDesc}>
                  Control how agents operate in your organization. GOVERNED mode is recommended for production use.
                </p>

                <ModeSwitcher
                  agentId={selectedAgent?.id || 'system'}
                  currentMode={autonomyMode}
                  canSwitchToUnbounded={canSwitchToUnbounded}
                  onModeChange={handleAutonomyModeChange}
                />

                <div className={styles.autonomyStatus}>
                  <h4>System Status</h4>
                  {autonomyStatus ? (
                    <div className={styles.statusGrid}>
                      <div className={styles.statusItem}>
                        <span className={styles.statusLabel}>Running</span>
                        <span className={`${styles.statusValue} ${autonomyStatus.running ? styles.active : styles.inactive}`}>
                          {autonomyStatus.running ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className={styles.statusItem}>
                        <span className={styles.statusLabel}>Startup Complete</span>
                        <span className={`${styles.statusValue} ${autonomyStatus.startup_complete ? styles.active : styles.inactive}`}>
                          {autonomyStatus.startup_complete ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className={styles.statusItem}>
                        <span className={styles.statusLabel}>Healthy Subsystems</span>
                        <span className={styles.statusValue}>
                          {autonomyStatus.healthy_subsystems} / {autonomyStatus.total_subsystems}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className={styles.loadingText}>Loading status...</p>
                  )}
                </div>

                <div className={styles.quickActions}>
                  <h4>Quick Actions</h4>
                  <div className={styles.actionButtons}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => autonomyApi.startAutonomy()}
                      disabled={autonomyLoading || autonomyStatus?.running}
                    >
                      <Icons.Play /> Start Autonomy
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.stopBtn}`}
                      onClick={() => autonomyApi.stopAutonomy()}
                      disabled={autonomyLoading || !autonomyStatus?.running}
                    >
                      <Icons.Pause /> Stop Autonomy
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Advanced */}
            {activeTab === 'advanced' && (
              <div className={styles.settingsSection}>
                <h3>Advanced</h3>

                <div className={styles.userInfo}>
                  <h4>Agent Info</h4>
                  <div className={styles.infoRow}>
                    <span>Agent ID:</span>
                    <code>{selectedAgent.id}</code>
                  </div>
                  <div className={styles.infoRow}>
                    <span>Hash:</span>
                    <code>{selectedAgent.hash || '—'}</code>
                  </div>
                  <div className={styles.infoRow}>
                    <span>Status:</span>
                    <code>{selectedAgent.status}</code>
                  </div>
                  <div className={styles.infoRow}>
                    <span>Type:</span>
                    <code>{selectedAgent.type}</code>
                  </div>
                  <div className={styles.infoRow}>
                    <span>Created:</span>
                    <code>{selectedAgent.createdAt ? new Date(selectedAgent.createdAt).toLocaleString() : '—'}</code>
                  </div>
                </div>

                <div className={styles.dangerZone}>
                  <h4>Danger Zone</h4>
                  <button className={styles.dangerBtn} onClick={async () => {
                    if (!confirm(`Archive agent "${selectedAgent.name}"? It will be hidden but preserved.`)) return;
                    try {
                      await fastapiClient.delete(`/api/v1/agents/${selectedAgent.id}`);
                      const { removeAgent } = useAgentStore.getState();
                      removeAgent(selectedAgent.id);
                    } catch (err) {
                      console.error('Failed to archive agent:', err);
                    }
                  }}>
                    <Icons.Trash /> Archive Agent
                  </button>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className={styles.saveSection}>
              <button
                className={styles.saveBtn}
                onClick={handleSave}
                disabled={saving}
                style={saveStatus === 'saved' ? { background: 'rgba(34,197,94,0.2)', borderColor: 'rgba(34,197,94,0.4)', color: '#22c55e' } : saveStatus === 'error' ? { background: 'rgba(239,68,68,0.2)', borderColor: 'rgba(239,68,68,0.4)', color: '#ef4444' } : undefined}
              >
                {saving ? 'Saving...' : saveStatus === 'saved' ? '\u2713 Saved!' : saveStatus === 'error' ? '\u2717 Error — try again' : <><Icons.Check /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SettingsPanel = memo(SettingsPanelComponent);
export default SettingsPanel;
