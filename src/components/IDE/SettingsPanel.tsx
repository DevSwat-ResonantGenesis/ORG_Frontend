// ============== SETTINGS PANEL ==============
// IDE settings with categories and search

import React, { memo, useState, useCallback, useEffect } from 'react';
import styles from './SettingsPanel.module.css';

interface Setting {
  id: string;
  label: string;
  description?: string;
  type: 'toggle' | 'select' | 'input' | 'number' | 'color';
  category: string;
  value: any;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
}

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings?: Setting[];
  onSettingChange?: (id: string, value: any) => void;
}

const defaultSettings: Setting[] = [
  // Editor
  { id: 'fontSize', label: 'Font Size', description: 'Controls the font size in pixels', type: 'number', category: 'Editor', value: 14, min: 8, max: 32 },
  { id: 'fontFamily', label: 'Font Family', type: 'select', category: 'Editor', value: 'JetBrains Mono', options: [
    { value: 'JetBrains Mono', label: 'JetBrains Mono' },
    { value: 'Fira Code', label: 'Fira Code' },
    { value: 'SF Mono', label: 'SF Mono' },
    { value: 'Monaco', label: 'Monaco' },
  ]},
  { id: 'tabSize', label: 'Tab Size', type: 'number', category: 'Editor', value: 2, min: 1, max: 8 },
  { id: 'wordWrap', label: 'Word Wrap', description: 'Controls how lines should wrap', type: 'toggle', category: 'Editor', value: false },
  { id: 'lineNumbers', label: 'Line Numbers', type: 'toggle', category: 'Editor', value: true },
  { id: 'minimap', label: 'Show Minimap', type: 'toggle', category: 'Editor', value: true },
  { id: 'bracketPairs', label: 'Bracket Pair Colorization', type: 'toggle', category: 'Editor', value: true },
  
  // Theme
  { id: 'theme', label: 'Color Theme', type: 'select', category: 'Appearance', value: 'dark', options: [
    { value: 'dark', label: 'Dark (Default)' },
    { value: 'light', label: 'Light' },
    { value: 'high-contrast', label: 'High Contrast' },
  ]},
  { id: 'accentColor', label: 'Accent Color', type: 'color', category: 'Appearance', value: '#0ea5e9' },
  { id: 'sidebarPosition', label: 'Sidebar Position', type: 'select', category: 'Appearance', value: 'left', options: [
    { value: 'left', label: 'Left' },
    { value: 'right', label: 'Right' },
  ]},
  
  // AI
  { id: 'aiEnabled', label: 'Enable AI Features', type: 'toggle', category: 'AI Assistant', value: true },
  { id: 'aiAutoComplete', label: 'AI Auto-Complete', description: 'Show AI suggestions while typing', type: 'toggle', category: 'AI Assistant', value: true },
  { id: 'aiModel', label: 'AI Model', type: 'select', category: 'AI Assistant', value: 'gpt-4', options: [
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { value: 'claude-3', label: 'Claude 3' },
  ]},
  
  // Terminal
  { id: 'terminalFontSize', label: 'Terminal Font Size', type: 'number', category: 'Terminal', value: 13, min: 8, max: 24 },
  { id: 'terminalCursor', label: 'Cursor Style', type: 'select', category: 'Terminal', value: 'block', options: [
    { value: 'block', label: 'Block' },
    { value: 'line', label: 'Line' },
    { value: 'underline', label: 'Underline' },
  ]},
  
  // Files
  { id: 'autoSave', label: 'Auto Save', type: 'select', category: 'Files', value: 'afterDelay', options: [
    { value: 'off', label: 'Off' },
    { value: 'afterDelay', label: 'After Delay' },
    { value: 'onFocusChange', label: 'On Focus Change' },
  ]},
  { id: 'autoSaveDelay', label: 'Auto Save Delay', description: 'Delay in milliseconds', type: 'number', category: 'Files', value: 1000, min: 100, max: 10000 },
  { id: 'formatOnSave', label: 'Format On Save', type: 'toggle', category: 'Files', value: true },
];

const SettingsPanelComponent: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  settings = defaultSettings,
  onSettingChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const initial = settings.reduce((acc, s) => ({ ...acc, [s.id]: s.value }), {});
      setLocalSettings(initial);
    }
  }, [isOpen, settings]);

  const handleChange = useCallback((id: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [id]: value }));
    onSettingChange?.(id, value);
  }, [onSettingChange]);

  const filteredSettings = settings.filter(s =>
    s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [...new Set(settings.map(s => s.category))];
  
  const displaySettings = activeCategory 
    ? filteredSettings.filter(s => s.category === activeCategory)
    : filteredSettings;

  const groupedSettings = displaySettings.reduce<Record<string, Setting[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  const renderSettingControl = (setting: Setting) => {
    const value = localSettings[setting.id] ?? setting.value;

    switch (setting.type) {
      case 'toggle':
        return (
          <button
            className={`${styles.toggle} ${value ? styles.active : ''}`}
            onClick={() => handleChange(setting.id, !value)}
          >
            <span className={styles.toggleThumb} />
          </button>
        );
      
      case 'select':
        return (
          <select
            className={styles.select}
            value={value}
            onChange={e => handleChange(setting.id, e.target.value)}
          >
            {setting.options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      
      case 'number':
        return (
          <input
            type="number"
            className={styles.numberInput}
            value={value}
            min={setting.min}
            max={setting.max}
            onChange={e => handleChange(setting.id, parseInt(e.target.value))}
          />
        );
      
      case 'color':
        return (
          <input
            type="color"
            className={styles.colorInput}
            value={value}
            onChange={e => handleChange(setting.id, e.target.value)}
          />
        );
      
      case 'input':
        return (
          <input
            type="text"
            className={styles.textInput}
            value={value}
            onChange={e => handleChange(setting.id, e.target.value)}
          />
        );
      
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>⚙️ Settings</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.search}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search settings..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className={styles.body}>
          <div className={styles.sidebar}>
            <button
              className={`${styles.categoryBtn} ${!activeCategory ? styles.active : ''}`}
              onClick={() => setActiveCategory(null)}
            >
              All Settings
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                className={`${styles.categoryBtn} ${activeCategory === cat ? styles.active : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className={styles.content}>
            {Object.entries(groupedSettings).map(([category, catSettings]) => (
              <div key={category} className={styles.categorySection}>
                <h3 className={styles.categoryTitle}>{category}</h3>
                <div className={styles.settingsList}>
                  {catSettings.map(setting => (
                    <div key={setting.id} className={styles.settingItem}>
                      <div className={styles.settingInfo}>
                        <span className={styles.settingLabel}>{setting.label}</span>
                        {setting.description && (
                          <span className={styles.settingDesc}>{setting.description}</span>
                        )}
                      </div>
                      <div className={styles.settingControl}>
                        {renderSettingControl(setting)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {displaySettings.length === 0 && (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>🔍</span>
                <p>No settings found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const SettingsPanel = memo(SettingsPanelComponent);
export default SettingsPanel;
