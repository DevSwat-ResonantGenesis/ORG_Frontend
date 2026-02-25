import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { Icons } from '../../shared/Icons';
import fastapiClient from '../../../../../api/fastapiClient';
import styles from './ExternalPanel.module.css';

// ============== EXTERNAL PANEL ==============
// Contract: reads [network, agent], writes [network]
// Real data from /owner/dashboard/system/services + /owner/dashboard/system/database

interface ServiceInfo {
  key: string;
  name: string;
  status: string;
  latency: number;
  online: boolean;
}

interface ConnectionLog {
  id: string;
  timestamp: Date;
  service: string;
  event: string;
  level: 'info' | 'warn' | 'error';
  details?: string;
}

interface ExternalPanelProps {
  className?: string;
}

const SERVICE_TYPE_MAP: Record<string, string> = {
  agent_engine: 'core',
  auth_service: 'auth',
  billing_service: 'billing',
  blockchain_service: 'blockchain',
  chat_service: 'api',
  cognitive: 'ai',
  llm_service: 'ai',
  ml_service: 'ai',
  marketplace: 'marketplace',
  memory_service: 'database',
  notification: 'webhook',
  rara_service: 'governance',
  storage: 'storage',
  workflow: 'orchestration',
  gateway: 'core',
  sandbox: 'execution',
  state_physics: 'physics',
  user_memory: 'database',
  v8_api: 'ai',
};

const ExternalPanelComponent: React.FC<ExternalPanelProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState<'protocols' | 'connections' | 'logs'>('protocols');
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [connectionLogs, setConnectionLogs] = useState<ConnectionLog[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchServices = useCallback(async () => {
    try {
      const [servicesRes, dbRes] = await Promise.allSettled([
        fastapiClient.get('/owner/dashboard/system/services'),
        fastapiClient.get('/owner/dashboard/system/database'),
      ]);

      if (servicesRes.status === 'fulfilled') {
        const svcData = servicesRes.value.data?.services || [];
        setServices(svcData);
        setLastUpdated(new Date());
        setError(null);

        // Generate connection logs from status changes
        const newLogs: ConnectionLog[] = svcData.map((svc: ServiceInfo) => ({
          id: `${svc.key}-${Date.now()}`,
          timestamp: new Date(),
          service: svc.name,
          event: svc.online ? 'Health check passed' : 'Service unreachable',
          level: svc.online ? 'info' as const : 'error' as const,
          details: `Latency: ${svc.latency}ms | Status: ${svc.status}`,
        }));
        setConnectionLogs(prev => [...newLogs.filter(l => l.level !== 'info'), ...prev].slice(0, 100));
      }

      if (dbRes.status === 'fulfilled') {
        setDbStatus(dbRes.value.data);
      }

      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch service status');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
    pollRef.current = setInterval(fetchServices, 15000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchServices]);

  const onlineCount = services.filter(s => s.online).length;
  const offlineCount = services.filter(s => !s.online).length;
  const avgLatency = services.length > 0
    ? Math.round(services.filter(s => s.online).reduce((sum, s) => sum + s.latency, 0) / Math.max(onlineCount, 1))
    : 0;

  const filteredServices = services.filter(svc => {
    const typeMatch = filterType === 'all' || SERVICE_TYPE_MAP[svc.key] === filterType;
    const statusMatch = filterStatus === 'all' || (filterStatus === 'online' ? svc.online : !svc.online);
    return typeMatch && statusMatch;
  });

  const uniqueTypes = [...new Set(Object.values(SERVICE_TYPE_MAP))].sort();

  return (
    <div className={`${styles.panel} ${className || ''}`}>
      <div className={styles.panelHeader}>
        <h2><Icons.External /> External Protocols</h2>
        <div className={styles.headerRight}>
          {lastUpdated && (
            <span className={styles.lastUpdated}>
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
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
      </div>

      <div className={styles.panelContent}>
        {isLoading && services.length === 0 ? (
          <div className={styles.loadingState}>Loading service status...</div>
        ) : error && services.length === 0 ? (
          <div className={styles.errorState}>
            <Icons.AlertTriangle />
            <span>{error}</span>
            <button onClick={fetchServices} className={styles.retryBtn}>Retry</button>
          </div>
        ) : (
          <>
            {/* Protocols Tab */}
            {activeTab === 'protocols' && (
              <>
                {/* Summary Stats */}
                <div className={styles.summaryRow}>
                  <div className={styles.summaryCard}>
                    <span className={styles.summaryValue}>{services.length}</span>
                    <span className={styles.summaryLabel}>Total Services</span>
                  </div>
                  <div className={styles.summaryCard}>
                    <span className={`${styles.summaryValue} ${styles.online}`}>{onlineCount}</span>
                    <span className={styles.summaryLabel}>Online</span>
                  </div>
                  <div className={styles.summaryCard}>
                    <span className={`${styles.summaryValue} ${offlineCount > 0 ? styles.offline : ''}`}>{offlineCount}</span>
                    <span className={styles.summaryLabel}>Offline</span>
                  </div>
                  <div className={styles.summaryCard}>
                    <span className={styles.summaryValue}>{avgLatency}ms</span>
                    <span className={styles.summaryLabel}>Avg Latency</span>
                  </div>
                </div>

                {/* Filters */}
                <div className={styles.filtersRow}>
                  <select
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                    className={styles.filterSelect}
                  >
                    <option value="all">All Types</option>
                    {uniqueTypes.map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className={styles.filterSelect}
                  >
                    <option value="all">All Status</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                  <button onClick={fetchServices} className={styles.refreshBtn}>
                    Refresh
                  </button>
                </div>

                {/* Service Cards */}
                <div className={styles.protocolsList}>
                  {filteredServices.map(svc => (
                    <div key={svc.key} className={`${styles.protocolCard} ${!svc.online ? styles.offlineCard : ''}`}>
                      <div className={styles.protocolHeader}>
                        <span className={`${styles.statusDot} ${svc.online ? styles.connected : styles.disconnected}`}></span>
                        <span className={styles.protocolName}>{svc.name}</span>
                        <span className={styles.protocolType}>{SERVICE_TYPE_MAP[svc.key] || 'service'}</span>
                      </div>
                      <div className={styles.protocolMeta}>
                        <span>Status: {svc.status}</span>
                        <span>Latency: {svc.latency}ms</span>
                        <span className={styles.serviceKey}>{svc.key}</span>
                      </div>
                      <div className={styles.latencyBar}>
                        <div
                          className={`${styles.latencyFill} ${svc.latency > 200 ? styles.latencyHigh : svc.latency > 100 ? styles.latencyMed : styles.latencyLow}`}
                          style={{ width: `${Math.min((svc.latency / 300) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Connections Tab */}
            {activeTab === 'connections' && (
              <div className={styles.connectionsView}>
                <h3>Database Connections</h3>
                {dbStatus ? (
                  <div className={styles.dbGrid}>
                    <div className={styles.dbCard}>
                      <div className={styles.dbHeader}>
                        <span className={`${styles.statusDot} ${dbStatus.postgres?.connected ? styles.connected : styles.disconnected}`}></span>
                        <span>PostgreSQL</span>
                      </div>
                      <div className={styles.dbMeta}>
                        <span>Status: {dbStatus.postgres?.connected ? 'Connected' : 'Disconnected'}</span>
                        {dbStatus.postgres?.latency_ms && <span>Latency: {dbStatus.postgres.latency_ms}ms</span>}
                        {dbStatus.postgres?.version && <span>Version: {dbStatus.postgres.version}</span>}
                      </div>
                    </div>
                    <div className={styles.dbCard}>
                      <div className={styles.dbHeader}>
                        <span className={`${styles.statusDot} ${dbStatus.redis?.connected ? styles.connected : styles.disconnected}`}></span>
                        <span>Redis</span>
                      </div>
                      <div className={styles.dbMeta}>
                        <span>Status: {dbStatus.redis?.connected ? 'Connected' : 'Disconnected'}</span>
                        {dbStatus.redis?.latency_ms && <span>Latency: {dbStatus.redis.latency_ms}ms</span>}
                        {dbStatus.redis?.version && <span>Version: {dbStatus.redis.version}</span>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.emptyState}>Database status unavailable</div>
                )}

                <h3>Service Topology</h3>
                <div className={styles.topologyGrid}>
                  {services.map(svc => (
                    <div key={svc.key} className={`${styles.topoNode} ${svc.online ? styles.topoOnline : styles.topoOffline}`}>
                      <span className={`${styles.statusDot} ${svc.online ? styles.connected : styles.disconnected}`}></span>
                      <span className={styles.topoName}>{svc.name}</span>
                      <span className={styles.topoLatency}>{svc.latency}ms</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Logs Tab */}
            {activeTab === 'logs' && (
              <div className={styles.logsView}>
                <div className={styles.logsHeader}>
                  <h3>Connection Logs</h3>
                  <span className={styles.logCount}>{connectionLogs.length} entries</span>
                </div>
                {connectionLogs.length > 0 ? (
                  <div className={styles.logsList}>
                    {connectionLogs.map(log => (
                      <div key={log.id} className={`${styles.logItem} ${styles[log.level]}`}>
                        <span className={styles.logTime}>{log.timestamp.toLocaleTimeString()}</span>
                        <span className={`${styles.logLevel} ${styles[`level_${log.level}`]}`}>{log.level.toUpperCase()}</span>
                        <span className={styles.logService}>{log.service}</span>
                        <span className={styles.logEvent}>{log.event}</span>
                        {log.details && <span className={styles.logDetails}>{log.details}</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyState}>No connection logs yet. Logs will appear after the first health check cycle.</div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export const ExternalPanel = memo(ExternalPanelComponent);
export default ExternalPanel;
