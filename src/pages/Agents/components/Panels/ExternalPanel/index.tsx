import React, { memo, useState } from 'react';
import { Icons } from '../../shared/Icons';
import styles from './ExternalPanel.module.css';

// ============== EXTERNAL PANEL ==============
// Contract: reads [network, agent], writes [network]

interface ExternalPanelProps {
  className?: string;
}

const ExternalPanelComponent: React.FC<ExternalPanelProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState<'protocols' | 'connections' | 'logs'>('protocols');

  const protocols = [
    { id: 'p1', name: 'Resonant Network', status: 'connected', type: 'blockchain', latency: 8 },
    { id: 'p2', name: 'OpenAI API', status: 'connected', type: 'api', latency: 120 },
    { id: 'p3', name: 'PostgreSQL', status: 'connected', type: 'database', latency: 5 },
    { id: 'p4', name: 'Redis Cache', status: 'connected', type: 'cache', latency: 2 },
    { id: 'p5', name: 'Slack Webhook', status: 'disconnected', type: 'webhook', latency: 0 },
  ];

  return (
    <div className={`${styles.panel} ${className || ''}`}>
      <div className={styles.panelHeader}>
        <h2><Icons.External /> External Protocols</h2>
        <div className={styles.tabs}>
          {(['protocols', 'connections', 'logs'] as const).map(tab => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.panelContent}>
        <div className={styles.protocolsList}>
          {protocols.map(protocol => (
            <div key={protocol.id} className={styles.protocolCard}>
              <div className={styles.protocolHeader}>
                <span className={`${styles.statusDot} ${styles[protocol.status]}`}></span>
                <span className={styles.protocolName}>{protocol.name}</span>
                <span className={styles.protocolType}>{protocol.type}</span>
              </div>
              <div className={styles.protocolMeta}>
                <span>Status: {protocol.status}</span>
                {protocol.latency > 0 && <span>Latency: {protocol.latency}ms</span>}
              </div>
              <div className={styles.protocolActions}>
                {protocol.status === 'connected' ? (
                  <button className={styles.disconnectBtn}>Disconnect</button>
                ) : (
                  <button className={styles.connectBtn}>Connect</button>
                )}
                <button className={styles.configBtn}><Icons.Settings /> Configure</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ExternalPanel = memo(ExternalPanelComponent);
export default ExternalPanel;
