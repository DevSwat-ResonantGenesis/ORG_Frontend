/**
 * AcceleratorSettings - Compact settings panel for DSID-P Accelerator
 * No borders, #0a0a0a background, minimal design
 */
import React, { useState, useCallback, memo } from 'react';
import { useFeatureFlags, useCostMetrics } from '@/hooks/useDSIDPAccelerator';
import styles from './AcceleratorSettings.module.css';

interface AcceleratorSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AcceleratorSettings = memo(function AcceleratorSettings({
  isOpen,
  onClose,
}: AcceleratorSettingsProps) {
  const { flags, toggle } = useFeatureFlags();
  const costMetrics = useCostMetrics(5000);
  const [activeTab, setActiveTab] = useState<'general' | 'features' | 'metrics'>('general');

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>Accelerator Settings</span>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'general' ? styles.active : ''}`}
            onClick={() => setActiveTab('general')}
          >General</button>
          <button 
            className={`${styles.tab} ${activeTab === 'features' ? styles.active : ''}`}
            onClick={() => setActiveTab('features')}
          >Features</button>
          <button 
            className={`${styles.tab} ${activeTab === 'metrics' ? styles.active : ''}`}
            onClick={() => setActiveTab('metrics')}
          >Metrics</button>
        </div>

        <div className={styles.content}>
          {activeTab === 'general' && (
            <div className={styles.section}>
              <div className={styles.setting}>
                <span className={styles.settingLabel}>Max Iterations</span>
                <input type="number" className={styles.input} defaultValue={50} min={1} max={200} />
              </div>
              <div className={styles.setting}>
                <span className={styles.settingLabel}>Max Errors</span>
                <input type="number" className={styles.input} defaultValue={5} min={1} max={20} />
              </div>
              <div className={styles.setting}>
                <span className={styles.settingLabel}>Timeout (minutes)</span>
                <input type="number" className={styles.input} defaultValue={10} min={1} max={60} />
              </div>
              <div className={styles.setting}>
                <span className={styles.settingLabel}>Checkpoint Interval</span>
                <input type="number" className={styles.input} defaultValue={5} min={1} max={20} />
              </div>
              <div className={styles.setting}>
                <span className={styles.settingLabel}>Auto Commit</span>
                <label className={styles.toggle}>
                  <input type="checkbox" defaultChecked />
                  <span className={styles.toggleSlider} />
                </label>
              </div>
              <div className={styles.setting}>
                <span className={styles.settingLabel}>Review Before Apply</span>
                <label className={styles.toggle}>
                  <input type="checkbox" defaultChecked />
                  <span className={styles.toggleSlider} />
                </label>
              </div>
              <div className={styles.setting}>
                <span className={styles.settingLabel}>Stop on Error</span>
                <label className={styles.toggle}>
                  <input type="checkbox" />
                  <span className={styles.toggleSlider} />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className={styles.section}>
              {flags.map(flag => (
                <div key={flag.key} className={styles.setting}>
                  <div className={styles.settingInfo}>
                    <span className={styles.settingLabel}>{flag.name}</span>
                    <span className={styles.settingDesc}>{flag.description}</span>
                  </div>
                  <label className={styles.toggle}>
                    <input 
                      type="checkbox" 
                      checked={flag.enabled}
                      onChange={e => toggle(flag.key, e.target.checked)}
                    />
                    <span className={styles.toggleSlider} />
                  </label>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className={styles.section}>
              <div className={styles.metricCard}>
                <span className={styles.metricTitle}>Total Requests</span>
                <span className={styles.metricValue}>{costMetrics.totalRequests}</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricTitle}>Total Tokens</span>
                <span className={styles.metricValue}>{costMetrics.totalTokens.toLocaleString()}</span>
              </div>
              <div className={styles.metricCard}>
                <span className={styles.metricTitle}>Estimated Cost</span>
                <span className={styles.metricValue}>${costMetrics.totalCost.toFixed(4)}</span>
              </div>
              {Object.entries(costMetrics.costByModel || {}).map(([model, cost]) => (
                <div key={model} className={styles.metricCard}>
                  <span className={styles.metricTitle}>{model}</span>
                  <span className={styles.metricValue}>${(cost as number).toFixed(4)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default AcceleratorSettings;
