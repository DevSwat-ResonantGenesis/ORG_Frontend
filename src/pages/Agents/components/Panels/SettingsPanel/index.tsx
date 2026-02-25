import React, { memo, useState, useEffect } from 'react';
import { useUIStore, useSessionStore, useAgentStore } from '../../../../../stores';
import { Icons } from '../../shared/Icons';
import fastapiClient from '../../../../../api/fastapiClient';
import { ModeSwitcher, type AutonomyMode } from '../../../../../components/AutonomyMode';
import * as autonomyApi from '../../../../../api/autonomy';
import styles from './SettingsPanel.module.css';

// ============== SETTINGS PANEL ==============
// Contract: reads [session, network, ui], writes [network, ui]
// Forbidden: [execution, economy]

type SettingsTab = 'general' | 'appearance' | 'autonomy' | 'api' | 'developer' | 'security' | 'notifications' | 'advanced';

interface SettingsPanelProps {
  className?: string;
}

const SettingsPanelComponent: React.FC<SettingsPanelProps> = ({ className }) => {
  const theme = useUIStore(state => state.theme);
  const setTheme = useUIStore(state => state.setTheme);
  const userId = useSessionStore(state => state.userId);
  const roles = useSessionStore(state => state.roles);
  const selectedAgentId = useAgentStore(state => state.selectedAgentId);
  const agents = useAgentStore(state => state.agents);
  const selectedAgent = agents.find(a => a.id === selectedAgentId);
  
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [autonomyMode, setAutonomyMode] = useState<AutonomyMode>('governed');
  const [autonomyStatus, setAutonomyStatus] = useState<autonomyApi.AutonomyStatus | null>(null);
  const [autonomyLoading, setAutonomyLoading] = useState(false);

  // Check if user can switch to unbounded mode (admin only)
  const canSwitchToUnbounded = roles.includes('admin') || roles.includes('superadmin');

  // Fetch autonomy status on mount
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

  // Handle autonomy mode change
  const handleAutonomyModeChange = async (newMode: AutonomyMode): Promise<void> => {
    setAutonomyLoading(true);
    try {
      if (newMode === 'unbounded') {
        await autonomyApi.startAutonomy();
      } else {
        await autonomyApi.stopAutonomy();
      }
      setAutonomyMode(newMode);
      // Refresh status
      const status = await autonomyApi.getAutonomyStatus();
      setAutonomyStatus(status);
    } finally {
      setAutonomyLoading(false);
    }
  };
  const [settings, setSettings] = useState({
    // General
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    
    // Appearance
    theme: theme,
    sidebarPosition: 'left',
    compactMode: false,
    animations: true,
    
    // API
    apiEndpoint: 'https://api.resonant.network',
    apiKey: '••••••••••••••••',
    rateLimit: 1000,
    timeout: 30000,
    
    // Security
    mfaEnabled: false,
    sessionTimeout: 60,
    ipWhitelist: '',
    
    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    slackIntegration: false,
    webhookUrl: '',
    
    // Advanced
    debugMode: false,
    telemetry: true,
    experimentalFeatures: false,
  });

  // Fetch developer API keys from backend
  useEffect(() => {
    if (activeTab === 'developer') {
      fastapiClient.get('/api/v1/developer/keys')
        .then(res => setApiKeys(res.data || []))
        .catch(() => {});
    }
  }, [activeTab]);

  const handleRegenerateKey = async () => {
    try {
      const res = await fastapiClient.post('/api/v1/developer/keys', { name: 'New API Key', permissions: ['read', 'write'] });
      if (res.data) {
        setApiKeys(prev => [...prev, res.data]);
        updateSetting('apiKey', res.data.key);
      }
    } catch (err) { console.error('Failed to create API key:', err); }
  };

  const updateSetting = (key: string, value: unknown) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    if (key === 'theme' && (value === 'dark' || value === 'light')) {
      setTheme(value);
    }
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: 'General', icon: <Icons.Settings /> },
    { id: 'appearance', label: 'Appearance', icon: <Icons.Eye /> },
    { id: 'autonomy', label: 'Autonomy Mode', icon: <Icons.Zap /> },
    { id: 'api', label: 'API & Integrations', icon: <Icons.Plug /> },
    { id: 'security', label: 'Security', icon: <Icons.Shield /> },
    { id: 'notifications', label: 'Notifications', icon: <Icons.Alert /> },
    { id: 'developer', label: 'Developer', icon: <Icons.Terminal /> },
    { id: 'advanced', label: 'Advanced', icon: <Icons.Code /> },
  ];

  return (
    <div className={`${styles.panel} ${className || ''}`}>
      <div className={styles.panelHeader}>
        <h2><Icons.Settings /> Settings</h2>
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
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className={styles.settingsSection}>
                <h3>General Settings</h3>
                
                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <label>Language</label>
                    <span>Select your preferred language</span>
                  </div>
                  <select 
                    value={settings.language}
                    onChange={e => updateSetting('language', e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="zh">Chinese</option>
                    <option value="ja">Japanese</option>
                  </select>
                </div>

                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <label>Timezone</label>
                    <span>Your local timezone for timestamps</span>
                  </div>
                  <select 
                    value={settings.timezone}
                    onChange={e => updateSetting('timezone', e.target.value)}
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                </div>

                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <label>Date Format</label>
                    <span>How dates are displayed</span>
                  </div>
                  <select 
                    value={settings.dateFormat}
                    onChange={e => updateSetting('dateFormat', e.target.value)}
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div className={styles.userInfo}>
                  <h4>Account Information</h4>
                  <div className={styles.infoRow}>
                    <span>User ID:</span>
                    <code>{userId || 'Not logged in'}</code>
                  </div>
                  <div className={styles.infoRow}>
                    <span>Roles:</span>
                    <code>{roles.join(', ') || 'None'}</code>
                  </div>
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
                
                {/* Mode Switcher Component */}
                <ModeSwitcher
                  agentId={selectedAgent?.id || 'system'}
                  currentMode={autonomyMode}
                  canSwitchToUnbounded={canSwitchToUnbounded}
                  onModeChange={handleAutonomyModeChange}
                />

                {/* Autonomy System Status */}
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

                {/* Quick Actions */}
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

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className={styles.settingsSection}>
                <h3>Appearance</h3>
                
                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <label>Theme</label>
                    <span>Choose your color theme</span>
                  </div>
                  <div className={styles.themeSelector}>
                    {(['dark', 'light', 'system'] as const).map(t => (
                      <button
                        key={t}
                        className={`${styles.themeBtn} ${settings.theme === t ? styles.active : ''}`}
                        onClick={() => updateSetting('theme', t)}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <label>Compact Mode</label>
                    <span>Reduce spacing for more content</span>
                  </div>
                  <label className={styles.toggle}>
                    <input 
                      type="checkbox"
                      checked={settings.compactMode}
                      onChange={e => updateSetting('compactMode', e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <label>Animations</label>
                    <span>Enable UI animations</span>
                  </div>
                  <label className={styles.toggle}>
                    <input 
                      type="checkbox"
                      checked={settings.animations}
                      onChange={e => updateSetting('animations', e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>
            )}

            {/* API Settings */}
            {activeTab === 'api' && (
              <div className={styles.settingsSection}>
                <h3>API & Integrations</h3>
                
                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <label>API Endpoint</label>
                    <span>Backend API URL</span>
                  </div>
                  <input 
                    type="text"
                    value={settings.apiEndpoint}
                    onChange={e => updateSetting('apiEndpoint', e.target.value)}
                  />
                </div>

                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <label>API Key</label>
                    <span>Your API authentication key</span>
                  </div>
                  <div className={styles.apiKeyField}>
                    <input 
                      type="password"
                      value={settings.apiKey}
                      onChange={e => updateSetting('apiKey', e.target.value)}
                    />
                    <button className={styles.regenerateBtn} onClick={handleRegenerateKey}>Regenerate</button>
                  </div>
                </div>

                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <label>Rate Limit</label>
                    <span>Requests per minute</span>
                  </div>
                  <input 
                    type="number"
                    value={settings.rateLimit}
                    onChange={e => updateSetting('rateLimit', parseInt(e.target.value))}
                  />
                </div>

                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <label>Request Timeout</label>
                    <span>Timeout in milliseconds</span>
                  </div>
                  <input 
                    type="number"
                    value={settings.timeout}
                    onChange={e => updateSetting('timeout', parseInt(e.target.value))}
                  />
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className={styles.settingsSection}>
                <h3>Security</h3>
                
                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <label>Two-Factor Authentication</label>
                    <span>Add an extra layer of security</span>
                  </div>
                  <label className={styles.toggle}>
                    <input 
                      type="checkbox"
                      checked={settings.mfaEnabled}
                      onChange={e => updateSetting('mfaEnabled', e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <label>Session Timeout</label>
                    <span>Auto-logout after inactivity (minutes)</span>
                  </div>
                  <input 
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={e => updateSetting('sessionTimeout', parseInt(e.target.value))}
                  />
                </div>

                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <label>IP Whitelist</label>
                    <span>Allowed IP addresses (comma separated)</span>
                  </div>
                  <input 
                    type="text"
                    value={settings.ipWhitelist}
                    onChange={e => updateSetting('ipWhitelist', e.target.value)}
                    placeholder="e.g., 192.168.1.1, 10.0.0.0/8"
                  />
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <div className={styles.settingsSection}>
                <h3>Notifications</h3>
                
                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <label>Email Notifications</label>
                    <span>Receive updates via email</span>
                  </div>
                  <label className={styles.toggle}>
                    <input 
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={e => updateSetting('emailNotifications', e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <label>Push Notifications</label>
                    <span>Browser push notifications</span>
                  </div>
                  <label className={styles.toggle}>
                    <input 
                      type="checkbox"
                      checked={settings.pushNotifications}
                      onChange={e => updateSetting('pushNotifications', e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <label>Slack Integration</label>
                    <span>Send notifications to Slack</span>
                  </div>
                  <label className={styles.toggle}>
                    <input 
                      type="checkbox"
                      checked={settings.slackIntegration}
                      onChange={e => updateSetting('slackIntegration', e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <label>Webhook URL</label>
                    <span>Custom webhook for notifications</span>
                  </div>
                  <input 
                    type="text"
                    value={settings.webhookUrl}
                    onChange={e => updateSetting('webhookUrl', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
            )}

            {/* Developer API Keys */}
            {activeTab === 'developer' && (
              <div className={styles.settingsSection}>
                <h3>Developer API Keys</h3>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>Manage API keys for programmatic access to the platform.</p>
                <button className={styles.saveBtn} onClick={handleRegenerateKey} style={{ marginBottom: '16px', padding: '8px 16px' }}>
                  <Icons.Plus /> Create New Key
                </button>
                {apiKeys.length === 0 && (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>No API keys yet. Create one to get started.</div>
                )}
                {apiKeys.map((key: any) => (
                  <div key={key.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '13px' }}>{key.name}</div>
                      <code style={{ fontSize: '11px', color: '#94a3b8' }}>{key.key?.slice(0, 20)}...</code>
                      <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                        Created: {key.created_at ? new Date(key.created_at).toLocaleDateString() : 'N/A'} | Permissions: {(key.permissions || []).join(', ')}
                      </div>
                    </div>
                    <button style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', color: '#ef4444', padding: '4px 10px', fontSize: '11px', cursor: 'pointer' }}
                      onClick={async () => {
                        if (!confirm('Revoke this key?')) return;
                        try {
                          await fastapiClient.delete('/api/v1/developer/keys/' + key.id);
                          setApiKeys((prev: any) => prev.filter((k: any) => k.id !== key.id));
                        } catch { console.error('Failed to revoke key'); }
                      }}>
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Advanced Settings */}
            {activeTab === 'advanced' && (
              <div className={styles.settingsSection}>
                <h3>Advanced</h3>
                
                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <label>Debug Mode</label>
                    <span>Enable verbose logging</span>
                  </div>
                  <label className={styles.toggle}>
                    <input 
                      type="checkbox"
                      checked={settings.debugMode}
                      onChange={e => updateSetting('debugMode', e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <label>Telemetry</label>
                    <span>Send anonymous usage data</span>
                  </div>
                  <label className={styles.toggle}>
                    <input 
                      type="checkbox"
                      checked={settings.telemetry}
                      onChange={e => updateSetting('telemetry', e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <label>Experimental Features</label>
                    <span>Enable beta features</span>
                  </div>
                  <label className={styles.toggle}>
                    <input 
                      type="checkbox"
                      checked={settings.experimentalFeatures}
                      onChange={e => updateSetting('experimentalFeatures', e.target.checked)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>

                <div className={styles.dangerZone}>
                  <h4>Danger Zone</h4>
                  <button className={styles.dangerBtn} onClick={() => {
                    if (confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
                      localStorage.clear();
                      sessionStorage.clear();
                      window.location.reload();
                    }
                  }}>
                    <Icons.Trash /> Clear All Data
                  </button>
                  <button className={styles.dangerBtn} onClick={() => {
                    if (confirm('Reset all settings to defaults?')) {
                      setSettings({
                        theme: 'dark', language: 'en', fontSize: 14, showLineNumbers: true,
                        autoSave: true, autoSaveInterval: 30, notifications: true, sounds: false,
                        animations: true, apiEndpoint: '/api/v1', apiKey: '', rateLimit: 60,
                        timeout: 30000, mfaEnabled: false, sessionTimeout: 30, ipWhitelist: '',
                        emailNotifications: true, pushNotifications: false, slackIntegration: false,
                        webhookUrl: '', debugMode: false, telemetry: true, experimentalFeatures: false,
                      } as any);
                    }
                  }}>
                    <Icons.XCircle /> Reset to Defaults
                  </button>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className={styles.saveSection}>
              <button className={styles.saveBtn} onClick={() => {
                localStorage.setItem('agentOS_settings', JSON.stringify(settings));
                const btn = document.activeElement as HTMLButtonElement;
                if (btn) { btn.textContent = '✓ Saved!'; setTimeout(() => { btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Save Changes'; }, 1500); }
              }}>
                <Icons.Check /> Save Changes
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
