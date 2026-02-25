import React, { memo, useState } from 'react';
import AdvancedFactory from './AdvancedFactory';
import AgentWizard from './AgentWizard';
import { Icons } from '../../shared/Icons';
import { useUIStore } from '../../../../../stores';
import styles from './FactoryPanel.module.css';

interface FactoryPanelProps {
  className?: string;
}

type FactoryMode = 'wizard' | 'advanced';

const FactoryPanelComponent: React.FC<FactoryPanelProps> = ({ className }) => {
  const [mode, setMode] = useState<FactoryMode>('wizard');
  const setActiveSection = useUIStore(state => state.setActiveSection);

  return (
    <div className={`${styles.factoryContainer} ${className || ''}`}>
      {/* Mode Toggle */}
      <div className={styles.modeToggle}>
        <button
          className={`${styles.modeBtn} ${mode === 'wizard' ? styles.active : ''}`}
          onClick={() => setMode('wizard')}
        >
          <Icons.Zap /> Wizard
        </button>
        <button
          className={`${styles.modeBtn} ${mode === 'advanced' ? styles.active : ''}`}
          onClick={() => setMode('advanced')}
        >
          <Icons.Settings /> Advanced
        </button>
      </div>

      {/* Content */}
      {mode === 'wizard' ? (
        <AgentWizard 
          onComplete={() => setActiveSection('agents')} 
          onCancel={() => setMode('advanced')} 
        />
      ) : (
        <AdvancedFactory />
      )}
    </div>
  );
};

export const FactoryPanel = memo(FactoryPanelComponent);
export default FactoryPanel;
