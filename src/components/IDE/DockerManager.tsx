// ============== DOCKER MANAGER ==============
// Container management with real-time status and logs

import React, { memo, useState, useCallback, useEffect } from 'react';
import styles from './DockerManager.module.css';

interface Container {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'stopped' | 'paused' | 'restarting';
  ports: string[];
  created: Date;
  cpu: number;
  memory: number;
  memoryLimit: number;
}

interface Image {
  id: string;
  repository: string;
  tag: string;
  size: number;
  created: Date;
}

interface DockerManagerProps {
  onContainerAction?: (containerId: string, action: 'start' | 'stop' | 'restart' | 'remove') => void;
  onViewLogs?: (containerId: string) => void;
  className?: string;
}

const mockContainers: Container[] = [
  { id: 'abc123', name: 'gateway', image: 'resonantgenesis_backend-gateway', status: 'running', ports: ['8000:8000'], created: new Date(Date.now() - 86400000), cpu: 2.5, memory: 128, memoryLimit: 512 },
  { id: 'def456', name: 'ide_service', image: 'resonantgenesis_backend-ide_service', status: 'running', ports: ['8080:8080'], created: new Date(Date.now() - 86400000), cpu: 4.2, memory: 256, memoryLimit: 1024 },
  { id: 'ghi789', name: 'workflow_service', image: 'resonantgenesis_backend-workflow_service', status: 'running', ports: ['8081:8081'], created: new Date(Date.now() - 86400000), cpu: 1.8, memory: 192, memoryLimit: 512 },
  { id: 'jkl012', name: 'redis', image: 'redis:alpine', status: 'running', ports: ['6379:6379'], created: new Date(Date.now() - 172800000), cpu: 0.5, memory: 64, memoryLimit: 256 },
  { id: 'mno345', name: 'postgres', image: 'postgres:15', status: 'running', ports: ['5432:5432'], created: new Date(Date.now() - 172800000), cpu: 1.2, memory: 384, memoryLimit: 1024 },
  { id: 'pqr678', name: 'test_runner', image: 'node:20-alpine', status: 'stopped', ports: [], created: new Date(Date.now() - 259200000), cpu: 0, memory: 0, memoryLimit: 512 },
];

const DockerManagerComponent: React.FC<DockerManagerProps> = ({
  onContainerAction,
  onViewLogs,
  className,
}) => {
  const [containers, setContainers] = useState<Container[]>(mockContainers);
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);
  const [activeTab, setActiveTab] = useState<'containers' | 'images' | 'compose'>('containers');
  const [filter, setFilter] = useState<'all' | 'running' | 'stopped'>('all');
  const [logs, setLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  useEffect(() => {
    // Simulate container stats updates
    const interval = setInterval(() => {
      setContainers(prev => prev.map(c => {
        if (c.status !== 'running') return c;
        return {
          ...c,
          cpu: Math.max(0, c.cpu + (Math.random() - 0.5) * 2),
          memory: Math.min(c.memoryLimit, Math.max(0, c.memory + (Math.random() - 0.5) * 20)),
        };
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleAction = useCallback(async (containerId: string, action: 'start' | 'stop' | 'restart' | 'remove') => {
    setIsLoading(containerId);
    
    // Simulate action
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

    setContainers(prev => {
      if (action === 'remove') {
        return prev.filter(c => c.id !== containerId);
      }
      return prev.map(c => {
        if (c.id !== containerId) return c;
        let newStatus: Container['status'] = c.status;
        switch (action) {
          case 'start': newStatus = 'running'; break;
          case 'stop': newStatus = 'stopped'; break;
          case 'restart': newStatus = 'restarting'; break;
        }
        return { ...c, status: newStatus };
      });
    });

    if (action === 'restart') {
      setTimeout(() => {
        setContainers(prev => prev.map(c =>
          c.id === containerId ? { ...c, status: 'running' } : c
        ));
      }, 1000);
    }

    setIsLoading(null);
    onContainerAction?.(containerId, action);
  }, [onContainerAction]);

  const viewContainerLogs = useCallback((container: Container) => {
    setSelectedContainer(container);
    setShowLogs(true);
    setLogs([
      `[${new Date().toISOString()}] Container ${container.name} logs:`,
      '-------------------------------------------',
      `Starting ${container.image}...`,
      'Initializing services...',
      'Loading configuration...',
      'Service started successfully',
      `Listening on port ${container.ports[0]?.split(':')[0] || 'N/A'}`,
      'Ready to accept connections',
    ]);
    onViewLogs?.(container.id);
  }, [onViewLogs]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return styles.running;
      case 'stopped': return styles.stopped;
      case 'paused': return styles.paused;
      case 'restarting': return styles.restarting;
      default: return '';
    }
  };

  const formatSize = (mb: number) => {
    if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
    return `${mb.toFixed(0)} MB`;
  };

  const formatUptime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const filteredContainers = containers.filter(c => {
    if (filter === 'running') return c.status === 'running';
    if (filter === 'stopped') return c.status === 'stopped';
    return true;
  });

  const runningCount = containers.filter(c => c.status === 'running').length;

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.icon}>🐳</span>
          <span>Docker Manager</span>
          <span className={styles.runningBadge}>{runningCount} running</span>
        </div>
        <div className={styles.actions}>
          <button className={styles.refreshBtn}>🔄 Refresh</button>
          <button className={styles.composeBtn}>📦 Compose Up</button>
        </div>
      </div>

      <div className={styles.tabs}>
        {(['containers', 'images', 'compose'] as const).map(tab => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'containers' && `📦 Containers (${containers.length})`}
            {tab === 'images' && '🖼️ Images'}
            {tab === 'compose' && '📋 Compose'}
          </button>
        ))}
      </div>

      {activeTab === 'containers' && (
        <>
          <div className={styles.filters}>
            {(['all', 'running', 'stopped'] as const).map(f => (
              <button
                key={f}
                className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' && 'All'}
                {f === 'running' && `🟢 Running (${runningCount})`}
                {f === 'stopped' && `⚫ Stopped (${containers.length - runningCount})`}
              </button>
            ))}
          </div>

          <div className={styles.containerList}>
            {filteredContainers.map(container => (
              <div
                key={container.id}
                className={`${styles.containerItem} ${selectedContainer?.id === container.id ? styles.selected : ''}`}
                onClick={() => setSelectedContainer(container)}
              >
                <div className={styles.containerHeader}>
                  <span className={`${styles.statusDot} ${getStatusColor(container.status)}`} />
                  <div className={styles.containerInfo}>
                    <span className={styles.containerName}>{container.name}</span>
                    <span className={styles.containerImage}>{container.image}</span>
                  </div>
                  <div className={styles.containerActions}>
                    {container.status === 'running' ? (
                      <>
                        <button
                          className={styles.actionBtn}
                          onClick={e => { e.stopPropagation(); handleAction(container.id, 'stop'); }}
                          disabled={isLoading === container.id}
                        >
                          ⏹
                        </button>
                        <button
                          className={styles.actionBtn}
                          onClick={e => { e.stopPropagation(); handleAction(container.id, 'restart'); }}
                          disabled={isLoading === container.id}
                        >
                          🔄
                        </button>
                      </>
                    ) : (
                      <button
                        className={styles.startBtn}
                        onClick={e => { e.stopPropagation(); handleAction(container.id, 'start'); }}
                        disabled={isLoading === container.id}
                      >
                        ▶
                      </button>
                    )}
                    <button
                      className={styles.logsBtn}
                      onClick={e => { e.stopPropagation(); viewContainerLogs(container); }}
                    >
                      📜
                    </button>
                  </div>
                </div>

                {container.status === 'running' && (
                  <div className={styles.containerStats}>
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>CPU</span>
                      <div className={styles.statBar}>
                        <div style={{ width: `${Math.min(100, container.cpu * 10)}%` }} />
                      </div>
                      <span className={styles.statValue}>{container.cpu.toFixed(1)}%</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>MEM</span>
                      <div className={styles.statBar}>
                        <div style={{ width: `${(container.memory / container.memoryLimit) * 100}%` }} />
                      </div>
                      <span className={styles.statValue}>{formatSize(container.memory)}</span>
                    </div>
                  </div>
                )}

                <div className={styles.containerMeta}>
                  {container.ports.length > 0 && (
                    <span className={styles.ports}>🔌 {container.ports.join(', ')}</span>
                  )}
                  <span className={styles.uptime}>⏱️ {formatUptime(container.created)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'compose' && (
        <div className={styles.composePanel}>
          <pre className={styles.composeYaml}>
{`version: '3.8'
services:
  gateway:
    build: ./gateway
    ports:
      - "8000:8000"
    depends_on:
      - redis
      
  ide_service:
    build: ./ide_service
    ports:
      - "8080:8080"
      
  workflow_service:
    build: ./workflow_service
    ports:
      - "8081:8081"
      
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"`}
          </pre>
        </div>
      )}

      {showLogs && selectedContainer && (
        <div className={styles.logsModal} onClick={() => setShowLogs(false)}>
          <div className={styles.logsContent} onClick={e => e.stopPropagation()}>
            <div className={styles.logsHeader}>
              <span>📜 Logs: {selectedContainer.name}</span>
              <button className={styles.closeBtn} onClick={() => setShowLogs(false)}>×</button>
            </div>
            <div className={styles.logsBody}>
              {logs.map((log, i) => (
                <div key={i} className={styles.logLine}>{log}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const DockerManager = memo(DockerManagerComponent);
export default DockerManager;
