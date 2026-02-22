import React, { useState } from 'react';
import { Settings, Globe, Shield, Database, Mail, Bell, Palette, Code, Save, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

type SettingCategory = 'general' | 'security' | 'notifications' | 'api' | 'appearance' | 'advanced';

interface SettingItem {
  id: string;
  label: string;
  description?: string;
  type: 'toggle' | 'text' | 'number' | 'select' | 'textarea';
  value: string | number | boolean;
  options?: { value: string; label: string }[];
  category: SettingCategory;
}

interface SystemSettingsProps {
  settings: SettingItem[];
  onSave: (settings: SettingItem[]) => void;
  onReset?: () => void;
  loading?: boolean;
  className?: string;
}

interface SettingRowProps {
  setting: SettingItem;
  onChange: (value: string | number | boolean) => void;
}

const CATEGORY_CONFIG: Record<SettingCategory, {
  label: string;
  icon: React.ReactNode;
  color: string;
}> = {
  general: { label: 'General', icon: <Globe size={18} />, color: '#3b82f6' },
  security: { label: 'Security', icon: <Shield size={18} />, color: '#ef4444' },
  notifications: { label: 'Notifications', icon: <Bell size={18} />, color: '#f59e0b' },
  api: { label: 'API', icon: <Code size={18} />, color: '#10b981' },
  appearance: { label: 'Appearance', icon: <Palette size={18} />, color: '#8b5cf6' },
  advanced: { label: 'Advanced', icon: <Database size={18} />, color: '#888' },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    gap: '1.5rem',
  },
  sidebar: {
    width: '220px',
    flexShrink: 0,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: '#888',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
    textAlign: 'left',
    marginBottom: '0.25rem',
  },
  navItemActive: {
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#818cf8',
  },
  content: {
    flex: 1,
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  title: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#fff',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#888',
    fontSize: '0.8125rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  buttonPrimary: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    color: '#fff',
  },
  settingsList: {
    padding: '1rem',
  },
  settingRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
  },
  settingInfo: {
    flex: 1,
    marginRight: '1.5rem',
  },
  settingLabel: {
    fontSize: '0.9375rem',
    fontWeight: '500',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  settingDescription: {
    fontSize: '0.8125rem',
    color: '#888',
    lineHeight: 1.4,
  },
  settingControl: {
    flexShrink: 0,
  },
  toggle: {
    position: 'relative',
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  toggleEnabled: {
    background: '#10b981',
  },
  toggleDisabled: {
    background: 'rgba(255, 255, 255, 0.1)',
  },
  toggleKnob: {
    position: 'absolute',
    top: '2px',
    width: '20px',
    height: '20px',
    background: '#fff',
    borderRadius: '50%',
    transition: 'left 0.2s',
  },
  input: {
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.875rem',
    outline: 'none',
    minWidth: '200px',
  },
  select: {
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.875rem',
    outline: 'none',
    minWidth: '200px',
    cursor: 'pointer',
  },
  textarea: {
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.875rem',
    outline: 'none',
    minWidth: '300px',
    minHeight: '80px',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  saveStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontSize: '0.8125rem',
    fontWeight: '500',
  },
  saveStatusSuccess: {
    background: 'rgba(16, 185, 129, 0.15)',
    color: '#10b981',
  },
  saveStatusError: {
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#ef4444',
  },
};

const SettingRow: React.FC<SettingRowProps> = ({ setting, onChange }) => {
  const renderControl = () => {
    switch (setting.type) {
      case 'toggle':
        return (
          <div
            style={{
              ...styles.toggle,
              ...(setting.value ? styles.toggleEnabled : styles.toggleDisabled),
            }}
            onClick={() => onChange(!setting.value)}
            role="switch"
            aria-checked={Boolean(setting.value)}
          >
            <div
              style={{
                ...styles.toggleKnob,
                left: setting.value ? '22px' : '2px',
              }}
            />
          </div>
        );
      case 'text':
        return (
          <input
            type="text"
            style={styles.input}
            value={String(setting.value)}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            style={{ ...styles.input, width: '120px' }}
            value={Number(setting.value)}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        );
      case 'select':
        return (
          <select
            style={styles.select}
            value={String(setting.value)}
            onChange={(e) => onChange(e.target.value)}
          >
            {setting.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case 'textarea':
        return (
          <textarea
            style={styles.textarea}
            value={String(setting.value)}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={styles.settingRow}>
      <div style={styles.settingInfo}>
        <div style={styles.settingLabel}>{setting.label}</div>
        {setting.description && (
          <div style={styles.settingDescription}>{setting.description}</div>
        )}
      </div>
      <div style={styles.settingControl}>{renderControl()}</div>
    </div>
  );
};

export const SystemSettings: React.FC<SystemSettingsProps> = ({
  settings,
  onSave,
  onReset,
  loading = false,
  className,
}) => {
  const [activeCategory, setActiveCategory] = useState<SettingCategory>('general');
  const [localSettings, setLocalSettings] = useState<SettingItem[]>(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const categories = Object.keys(CATEGORY_CONFIG) as SettingCategory[];
  const categorySettings = localSettings.filter((s) => s.category === activeCategory);
  const categoryConfig = CATEGORY_CONFIG[activeCategory];

  const handleChange = (settingId: string, value: string | number | boolean) => {
    setLocalSettings((prev) =>
      prev.map((s) => (s.id === settingId ? { ...s, value } : s))
    );
    setHasChanges(true);
    setSaveStatus('idle');
  };

  const handleSave = () => {
    onSave(localSettings);
    setHasChanges(false);
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
      setLocalSettings(settings);
      setHasChanges(false);
      setSaveStatus('idle');
    }
  };

  return (
    <div style={styles.container} className={className}>
      <div style={styles.sidebar}>
        {categories.map((cat) => {
          const config = CATEGORY_CONFIG[cat];
          const isActive = cat === activeCategory;
          return (
            <button
              key={cat}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              }}
              onClick={() => setActiveCategory(cat)}
            >
              <span style={{ color: isActive ? config.color : '#888' }}>
                {config.icon}
              </span>
              {config.label}
            </button>
          );
        })}
      </div>

      <div style={styles.content}>
        <div style={styles.header}>
          <div style={styles.headerTitle}>
            <span style={{ color: categoryConfig.color }}>{categoryConfig.icon}</span>
            <span style={styles.title}>{categoryConfig.label} Settings</span>
          </div>
          <div style={styles.headerActions}>
            {saveStatus === 'success' && (
              <div style={{ ...styles.saveStatus, ...styles.saveStatusSuccess }}>
                <CheckCircle size={14} />
                Saved
              </div>
            )}
            {onReset && (
              <button style={styles.button} onClick={handleReset}>
                <RefreshCw size={14} />
                Reset
              </button>
            )}
            <button
              style={{
                ...styles.button,
                ...styles.buttonPrimary,
                opacity: hasChanges ? 1 : 0.5,
              }}
              onClick={handleSave}
              disabled={!hasChanges || loading}
            >
              <Save size={14} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div style={styles.settingsList}>
          {categorySettings.map((setting) => (
            <SettingRow
              key={setting.id}
              setting={setting}
              onChange={(value) => handleChange(setting.id, value)}
            />
          ))}
          {categorySettings.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
              No settings in this category
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
