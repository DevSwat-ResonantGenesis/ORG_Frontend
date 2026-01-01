import { useThemeStore } from '@/store/themeStore';
import React, { useEffect, useState } from 'react';
import { IdentitySettings } from './IdentitySettings';
import styles from './IDESettingsPanel.module.css';

interface IDESettingsPanelProps {
  onClose?: () => void;
}

interface EditorSettings {
  fontSize: number;
  tabSize: number;
  wordWrap: 'on' | 'off' | 'wordWrapColumn' | 'bounded';
  minimapEnabled: boolean;
  lineNumbers: 'on' | 'off' | 'relative' | 'interval';
  renderWhitespace: 'none' | 'boundary' | 'selection' | 'all';
  cursorBlinking: 'blink' | 'smooth' | 'phase' | 'expand' | 'solid';
  formatOnSave: boolean;
  formatOnPaste: boolean;
  formatOnType: boolean;
}

const defaultSettings: EditorSettings = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: 'on',
  minimapEnabled: true,
  lineNumbers: 'on',
  renderWhitespace: 'selection',
  cursorBlinking: 'smooth',
  formatOnSave: true,
  formatOnPaste: true,
  formatOnType: true,
};

export const IDESettingsPanel: React.FC<IDESettingsPanelProps> = ({ onClose }) => {
  const { theme, setTheme } = useThemeStore();
  const [settings, setSettings] = useState<EditorSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'identity'>('editor');

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('ide-editor-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (e) {
        console.error('Failed to load IDE settings', e);
      }
    }
  }, []);

  const handleSettingChange = <K extends keyof EditorSettings>(
    key: K,
    value: EditorSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    localStorage.setItem('ide-editor-settings', JSON.stringify(settings));
    setHasChanges(false);
    // Dispatch custom event to notify editor to reload settings
    window.dispatchEvent(new CustomEvent('ide-settings-changed', { detail: settings }));
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  return (
    <div className={styles.settingsPanel}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.headerIcon}>
            <path d="M10 12C11.1 12 12 11.1 12 10C12 8.9 11.1 8 10 8C8.9 8 8 8.9 8 10C8 11.1 8.9 12 10 12Z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15.5 10C15.5 10.5 15.6 11 15.7 11.4L17.5 12.2C17.8 12.3 17.9 12.7 17.7 13L16.3 14.4C16.1 14.6 16.1 15 16.3 15.2L16.4 15.3C16.6 15.5 16.6 15.9 16.4 16.1L15 17.5C14.8 17.7 14.4 17.6 14.2 17.4L13.4 15.6C13 15.7 12.5 15.8 12 15.8C11.5 15.8 11 15.7 10.6 15.6L9.8 17.4C9.6 17.6 9.2 17.7 9 17.5L7.6 16.1C7.4 15.9 7 15.9 6.8 16.1L6.7 16.2C6.5 16.4 6.5 16.8 6.7 17L8.1 18.4C8.3 18.6 8.2 19 8 19.2L6.2 20C5.9 20.1 5.5 19.9 5.4 19.6L4.6 17.8C4.3 17.7 3.9 17.6 3.5 17.4L1.7 18.2C1.4 18.3 1 18.1 0.9 17.8L0.1 16C0 15.7 0.2 15.3 0.5 15.2L2.3 14.4C2.7 14.3 3 14 3.2 13.6L2.4 11.8C2.3 11.5 2.5 11.1 2.8 11L4.6 10.2C4.7 9.8 4.8 9.3 4.8 8.8C4.8 8.3 4.7 7.8 4.6 7.4L2.8 6.6C2.5 6.5 2.3 6.1 2.4 5.8L3.2 4C3.3 3.7 3.7 3.5 4 3.6L5.8 4.4C6.2 4.3 6.7 4.2 7.2 4.2C7.7 4.2 8.2 4.3 8.6 4.4L10.4 3.6C10.7 3.5 11.1 3.7 11.2 4L12 5.8C12.3 5.9 12.7 6.1 12.8 6.4L14.6 7.2C15 7.3 15.3 7.6 15.5 8L16.3 9.8C16.4 10.1 16.2 10.5 15.9 10.6L15.5 10.8C15.4 10.9 15.4 11.1 15.5 11.2Z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h3 className={styles.title}>IDE Settings</h3>
        </div>
        {onClose && (
          <button className={styles.closeButton} onClick={onClose} title="Close settings">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 4L4 12M4 4L12 12" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'editor' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('editor')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 4H14M2 8H14M2 12H10" strokeLinecap="round" />
          </svg>
          Editor
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'identity' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('identity')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 8C9.66 8 11 6.66 11 5C11 3.34 9.66 2 8 2C6.34 2 5 3.34 5 5C5 6.66 6.34 8 8 8ZM8 9.5C5.67 9.5 1 10.67 1 13V14H15V13C15 10.67 10.33 9.5 8 9.5Z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Identity
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'editor' ? (
          <>
            {/* Theme Section */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.sectionIcon}>
                  <circle cx="8" cy="8" r="3" />
                  <path d="M8 2V4M8 12V14M2 8H4M12 8H14M3.5 3.5L4.9 4.9M11.1 11.1L12.5 12.5M3.5 12.5L4.9 11.1M11.1 4.9L12.5 3.5" strokeLinecap="round" />
                </svg>
                <h4 className={styles.sectionTitle}>Appearance</h4>
              </div>
              <div className={styles.settingGroup}>
                <div className={styles.setting}>
                  <div className={styles.settingLabelRow}>
                    <label className={styles.label}>Theme</label>
                    <span className={styles.settingValue}>{theme === 'dark' ? 'Dark' : 'Light'}</span>
                  </div>
                  <div className={styles.themeToggle}>
                    <button
                      className={`${styles.themeButton} ${theme === 'light' ? styles.active : ''}`}
                      onClick={() => setTheme('light')}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="7" cy="7" r="3" />
                        <path d="M7 1V2M7 12V13M1 7H2M12 7H13M2.5 2.5L3.5 3.5M10.5 10.5L11.5 11.5M2.5 11.5L3.5 10.5M10.5 3.5L11.5 2.5" strokeLinecap="round" />
                      </svg>
                      Light
                    </button>
                    <button
                      className={`${styles.themeButton} ${theme === 'dark' ? styles.active : ''}`}
                      onClick={() => setTheme('dark')}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M7 2C4.2 2 2 4.2 2 7C2 9.8 4.2 12 7 12C9.8 12 12 9.8 12 7C12 4.2 9.8 2 7 2Z" />
                        <path d="M7 1V2M7 12V13M1 7H2M12 7H13" strokeLinecap="round" />
                      </svg>
                      Dark
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Editor Section */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.sectionIcon}>
                  <path d="M2 4H14M2 8H14M2 12H10" strokeLinecap="round" />
                </svg>
                <h4 className={styles.sectionTitle}>Editor</h4>
              </div>
              <div className={styles.settingGroup}>
                <div className={styles.setting}>
                  <div className={styles.settingLabelRow}>
                    <label className={styles.label}>Font Size</label>
                    <span className={styles.settingValue}>{settings.fontSize}px</span>
                  </div>
                  <div className={styles.sliderContainer}>
                    <input
                      type="range"
                      min="10"
                      max="24"
                      value={settings.fontSize}
                      onChange={(e) => handleSettingChange('fontSize', parseInt(e.target.value, 10))}
                      className={styles.slider}
                    />
                    <div className={styles.sliderLabels}>
                      <span>10</span>
                      <span>24</span>
                    </div>
                  </div>
                </div>

                <div className={styles.setting}>
                  <div className={styles.settingLabelRow}>
                    <label className={styles.label}>Tab Size</label>
                    <span className={styles.settingValue}>{settings.tabSize} spaces</span>
                  </div>
                  <div className={styles.sliderContainer}>
                    <input
                      type="range"
                      min="1"
                      max="8"
                      value={settings.tabSize}
                      onChange={(e) => handleSettingChange('tabSize', parseInt(e.target.value, 10))}
                      className={styles.slider}
                    />
                    <div className={styles.sliderLabels}>
                      <span>1</span>
                      <span>8</span>
                    </div>
                  </div>
                </div>

                <div className={styles.setting}>
                  <div className={styles.settingLabelRow}>
                    <label className={styles.label}>Word Wrap</label>
                    <span className={styles.settingValue}>
                      {settings.wordWrap === 'on' ? 'On' :
                        settings.wordWrap === 'off' ? 'Off' :
                          settings.wordWrap === 'wordWrapColumn' ? 'Column' : 'Bounded'}
                    </span>
                  </div>
                  <select
                    value={settings.wordWrap}
                    onChange={(e) => handleSettingChange('wordWrap', e.target.value as EditorSettings['wordWrap'])}
                    className={styles.select}
                  >
                    <option value="on">On</option>
                    <option value="off">Off</option>
                    <option value="wordWrapColumn">Word Wrap Column</option>
                    <option value="bounded">Bounded</option>
                  </select>
                </div>

                <div className={styles.setting}>
                  <div className={styles.settingLabelRow}>
                    <label className={styles.label}>Line Numbers</label>
                    <span className={styles.settingValue}>
                      {settings.lineNumbers === 'on' ? 'On' :
                        settings.lineNumbers === 'off' ? 'Off' :
                          settings.lineNumbers === 'relative' ? 'Relative' : 'Interval'}
                    </span>
                  </div>
                  <select
                    value={settings.lineNumbers}
                    onChange={(e) => handleSettingChange('lineNumbers', e.target.value as EditorSettings['lineNumbers'])}
                    className={styles.select}
                  >
                    <option value="on">On</option>
                    <option value="off">Off</option>
                    <option value="relative">Relative</option>
                    <option value="interval">Interval</option>
                  </select>
                </div>

                <div className={styles.setting}>
                  <div className={styles.settingLabelRow}>
                    <label className={styles.label}>Cursor Blinking</label>
                    <span className={styles.settingValue}>{settings.cursorBlinking}</span>
                  </div>
                  <select
                    value={settings.cursorBlinking}
                    onChange={(e) => handleSettingChange('cursorBlinking', e.target.value as EditorSettings['cursorBlinking'])}
                    className={styles.select}
                  >
                    <option value="blink">Blink</option>
                    <option value="smooth">Smooth</option>
                    <option value="phase">Phase</option>
                    <option value="expand">Expand</option>
                    <option value="solid">Solid</option>
                  </select>
                </div>

                <div className={styles.setting}>
                  <div className={styles.settingLabelRow}>
                    <label className={styles.label}>Render Whitespace</label>
                    <span className={styles.settingValue}>
                      {settings.renderWhitespace === 'none' ? 'None' :
                        settings.renderWhitespace === 'boundary' ? 'Boundary' :
                          settings.renderWhitespace === 'selection' ? 'Selection' : 'All'}
                    </span>
                  </div>
                  <select
                    value={settings.renderWhitespace}
                    onChange={(e) => handleSettingChange('renderWhitespace', e.target.value as EditorSettings['renderWhitespace'])}
                    className={styles.select}
                  >
                    <option value="none">None</option>
                    <option value="boundary">Boundary</option>
                    <option value="selection">Selection</option>
                    <option value="all">All</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.sectionIcon}>
                  <path d="M8 1L10 5L14 6L10 7L8 11L6 7L2 6L6 5L8 1Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h4 className={styles.sectionTitle}>Features</h4>
              </div>
              <div className={styles.settingGroup}>
                <div className={styles.toggleSetting}>
                  <div className={styles.toggleLabel}>
                    <span className={styles.toggleTitle}>Minimap</span>
                    <span className={styles.toggleDescription}>Show code overview on the right</span>
                  </div>
                  <label className={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={settings.minimapEnabled}
                      onChange={(e) => handleSettingChange('minimapEnabled', e.target.checked)}
                      className={styles.toggleInput}
                    />
                    <span className={styles.toggleSlider}></span>
                  </label>
                </div>

                <div className={styles.toggleSetting}>
                  <div className={styles.toggleLabel}>
                    <span className={styles.toggleTitle}>Format on Save</span>
                    <span className={styles.toggleDescription}>Automatically format when saving</span>
                  </div>
                  <label className={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={settings.formatOnSave}
                      onChange={(e) => handleSettingChange('formatOnSave', e.target.checked)}
                      className={styles.toggleInput}
                    />
                    <span className={styles.toggleSlider}></span>
                  </label>
                </div>

                <div className={styles.toggleSetting}>
                  <div className={styles.toggleLabel}>
                    <span className={styles.toggleTitle}>Format on Paste</span>
                    <span className={styles.toggleDescription}>Automatically format pasted code</span>
                  </div>
                  <label className={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={settings.formatOnPaste}
                      onChange={(e) => handleSettingChange('formatOnPaste', e.target.checked)}
                      className={styles.toggleInput}
                    />
                    <span className={styles.toggleSlider}></span>
                  </label>
                </div>

                <div className={styles.toggleSetting}>
                  <div className={styles.toggleLabel}>
                    <span className={styles.toggleTitle}>Format on Type</span>
                    <span className={styles.toggleDescription}>Automatically format as you type</span>
                  </div>
                  <label className={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={settings.formatOnType}
                      onChange={(e) => handleSettingChange('formatOnType', e.target.checked)}
                      className={styles.toggleInput}
                    />
                    <span className={styles.toggleSlider}></span>
                  </label>
                </div>
              </div>
            </section>
          </>
        ) : (
          <IdentitySettings />
        )}
      </div>

      <div className={styles.footer}>
        <button onClick={handleReset} className={styles.resetButton}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 7H13M7 1L1 7L7 13" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Reset
        </button>
        <button
          onClick={handleSave}
          className={styles.saveButton}
          disabled={!hasChanges}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 9V12C12 12.6 11.6 13 11 13H3C2.4 13 2 12.6 2 12V9M4 5L7 2L10 5M7 2V9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {hasChanges ? 'Save Changes' : 'Saved'}
        </button>
      </div>
    </div >
  );
};
