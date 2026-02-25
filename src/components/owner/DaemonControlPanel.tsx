/**
 * DaemonControlPanel - Internal Platform Daemon Monitor & Control
 * Displays real-time status of all internal daemons with controls
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  getDaemonStatus, DaemonStatus, DaemonStatusResponse,
  startAutonomousDaemon, stopAutonomousDaemon,
  toggleRaraKillSwitch, sendKnowledgeDaemonChat,
  ChatResponse,
} from '../../api/daemons';

const StatusDot: React.FC<{ status: string }> = ({ status }) => {
  const color = {
    running: '#10b981',
    degraded: '#f59e0b',
    configured: '#3b82f6',
    disabled: '#6b7280',
    offline: '#ef4444',
  }[status] || '#6b7280';

  return (
    <span style={{
      display: 'inline-block',
      width: 10,
      height: 10,
      borderRadius: '50%',
      background: color,
      boxShadow: status === 'running' ? `0 0 8px ${color}` : 'none',
      marginRight: 8,
    }} />
  );
};

const DaemonIcon: React.FC<{ id: string }> = ({ id }) => {
  const icons: Record<string, string> = {
    knowledge_daemon: '🧠',
    rara_service: '🛡️',
    autonomous_daemon: '🤖',
    self_healing_daemon: '💊',
    ws_provider_status: '📡',
  };
  return <span style={{ fontSize: 28, marginRight: 12 }}>{icons[id] || '⚙️'}</span>;
};

const panelStyles = {
  container: {
    padding: '1.5rem',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  } as React.CSSProperties,
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  } as React.CSSProperties,
  subtitle: {
    fontSize: '0.875rem',
    color: '#94a3b8',
    marginTop: '0.25rem',
  } as React.CSSProperties,
  summaryBar: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  summaryCard: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '1rem 1.5rem',
    flex: '1 1 150px',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  summaryValue: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#f1f5f9',
  } as React.CSSProperties,
  summaryLabel: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginTop: '0.25rem',
  } as React.CSSProperties,
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '1rem',
  } as React.CSSProperties,
  card: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '1.25rem',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  } as React.CSSProperties,
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0.75rem',
  } as React.CSSProperties,
  cardName: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#f1f5f9',
  } as React.CSSProperties,
  cardStatus: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.8rem',
    fontWeight: 500,
    textTransform: 'capitalize' as const,
  } as React.CSSProperties,
  cardDesc: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    marginBottom: '0.75rem',
    lineHeight: 1.5,
  } as React.CSSProperties,
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.5rem',
  } as React.CSSProperties,
  metaItem: {
    background: '#0f172a',
    borderRadius: '8px',
    padding: '0.5rem 0.75rem',
  } as React.CSSProperties,
  metaLabel: {
    fontSize: '0.65rem',
    color: '#64748b',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  } as React.CSSProperties,
  metaValue: {
    fontSize: '0.85rem',
    color: '#e2e8f0',
    fontWeight: 500,
    marginTop: '0.125rem',
  } as React.CSSProperties,
  refreshBtn: {
    padding: '0.5rem 1rem',
    background: '#334155',
    border: '1px solid #475569',
    borderRadius: '8px',
    color: '#e2e8f0',
    fontSize: '0.8rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    transition: 'background 0.2s',
  } as React.CSSProperties,
  timestamp: {
    fontSize: '0.7rem',
    color: '#64748b',
    marginTop: '1rem',
    textAlign: 'right' as const,
  } as React.CSSProperties,
  errorBanner: {
    background: '#7f1d1d',
    border: '1px solid #991b1b',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    color: '#fca5a5',
    fontSize: '0.85rem',
    marginBottom: '1rem',
  } as React.CSSProperties,
};

function formatUptime(seconds: number): string {
  if (!seconds) return 'N/A';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  return `${h}h ${m}m`;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
}

const DaemonControlPanel: React.FC = () => {
  const [data, setData] = useState<DaemonStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<{ msg: string; ok: boolean } | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getDaemonStatus();
      setData(result);
      setError(null);
      setLastRefresh(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to fetch daemon status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleAction = useCallback(async (actionName: string, actionFn: () => Promise<any>) => {
    setActionLoading(actionName);
    setActionResult(null);
    try {
      const result = await actionFn();
      setActionResult({ msg: result.message || 'Action completed', ok: result.success !== false });
      setTimeout(() => fetchData(), 2000);
    } catch (err: any) {
      setActionResult({ msg: err.message || 'Action failed', ok: false });
    } finally {
      setActionLoading(null);
      setTimeout(() => setActionResult(null), 5000);
    }
  }, [fetchData]);

  const handleSendChat = useCallback(async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg: ChatMessage = { role: 'user', content: chatInput.trim(), timestamp: new Date() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);
    try {
      const result = await sendKnowledgeDaemonChat(userMsg.content);
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: result.response || 'No response',
        timestamp: new Date(),
        model: result.model,
      };
      setChatMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}`, timestamp: new Date() }]);
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatLoading]);

  const renderDaemonCard = (daemon: DaemonStatus) => {
    const statusColor = {
      running: '#10b981',
      degraded: '#f59e0b',
      configured: '#3b82f6',
      disabled: '#6b7280',
      offline: '#ef4444',
    }[daemon.status] || '#6b7280';

    return (
      <div
        key={daemon.id}
        style={{
          ...panelStyles.card,
          borderColor: daemon.online ? '#334155' : '#7f1d1d44',
          boxShadow: daemon.status === 'running' ? `0 0 20px ${statusColor}15` : 'none',
        }}
      >
        <div style={panelStyles.cardHeader}>
          <DaemonIcon id={daemon.id} />
          <div style={{ flex: 1 }}>
            <div style={panelStyles.cardName}>{daemon.name}</div>
            <div style={{ ...panelStyles.cardStatus, color: statusColor }}>
              <StatusDot status={daemon.status} />
              {daemon.status}
            </div>
          </div>
          <div style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.7rem',
            fontWeight: 600,
            background: daemon.online ? '#064e3b' : '#7f1d1d',
            color: daemon.online ? '#6ee7b7' : '#fca5a5',
            border: `1px solid ${daemon.online ? '#065f46' : '#991b1b'}`,
          }}>
            {daemon.online ? 'ONLINE' : 'OFFLINE'}
          </div>
        </div>

        <div style={panelStyles.cardDesc}>{daemon.description}</div>

        {/* Control buttons per daemon */}
        {daemon.id === 'autonomous_daemon' && daemon.online && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <button
              onClick={() => handleAction('start_autonomous', startAutonomousDaemon)}
              disabled={actionLoading !== null}
              style={{ ...actionBtnStyle, background: '#065f46', borderColor: '#10b981' }}
            >
              {actionLoading === 'start_autonomous' ? '...' : '▶ Start'}
            </button>
            <button
              onClick={() => handleAction('stop_autonomous', stopAutonomousDaemon)}
              disabled={actionLoading !== null}
              style={{ ...actionBtnStyle, background: '#7f1d1d', borderColor: '#ef4444' }}
            >
              {actionLoading === 'stop_autonomous' ? '...' : '⏹ Stop'}
            </button>
          </div>
        )}
        {daemon.id === 'rara_service' && daemon.online && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <button
              onClick={() => handleAction('rara_kill_on', () => toggleRaraKillSwitch(true))}
              disabled={actionLoading !== null}
              style={{ ...actionBtnStyle, background: '#7f1d1d', borderColor: '#ef4444' }}
            >
              {actionLoading === 'rara_kill_on' ? '...' : '🔴 Kill Switch ON'}
            </button>
            <button
              onClick={() => handleAction('rara_kill_off', () => toggleRaraKillSwitch(false))}
              disabled={actionLoading !== null}
              style={{ ...actionBtnStyle, background: '#065f46', borderColor: '#10b981' }}
            >
              {actionLoading === 'rara_kill_off' ? '...' : '🟢 Kill Switch OFF'}
            </button>
          </div>
        )}
        {daemon.id === 'knowledge_daemon' && (
          <div style={{ marginBottom: '0.75rem' }}>
            <button
              onClick={() => setShowChat(!showChat)}
              style={{ ...actionBtnStyle, background: '#1e3a5f', borderColor: '#3b82f6', width: '100%' }}
            >
              {showChat ? '✕ Close Chat' : '💬 Open Knowledge Daemon Chat'}
            </button>
          </div>
        )}

        <div style={panelStyles.metaGrid}>
          {daemon.provider && (
            <div style={panelStyles.metaItem}>
              <div style={panelStyles.metaLabel}>Provider</div>
              <div style={panelStyles.metaValue}>{daemon.provider}</div>
            </div>
          )}
          {daemon.llm_available !== undefined && (
            <div style={panelStyles.metaItem}>
              <div style={panelStyles.metaLabel}>LLM Status</div>
              <div style={{ ...panelStyles.metaValue, color: daemon.llm_available ? '#10b981' : '#ef4444' }}>
                {daemon.llm_available ? 'Available' : 'Unavailable'}
              </div>
            </div>
          )}
          {daemon.verified_agents !== undefined && (
            <div style={panelStyles.metaItem}>
              <div style={panelStyles.metaLabel}>Verified Agents</div>
              <div style={panelStyles.metaValue}>{daemon.verified_agents}</div>
            </div>
          )}
          {daemon.uptime_seconds !== undefined && daemon.uptime_seconds > 0 && (
            <div style={panelStyles.metaItem}>
              <div style={panelStyles.metaLabel}>Uptime</div>
              <div style={panelStyles.metaValue}>{formatUptime(daemon.uptime_seconds)}</div>
            </div>
          )}
          {daemon.enabled_in_env !== undefined && (
            <div style={panelStyles.metaItem}>
              <div style={panelStyles.metaLabel}>Env Config</div>
              <div style={{ ...panelStyles.metaValue, color: daemon.enabled_in_env ? '#10b981' : '#f59e0b' }}>
                {daemon.enabled_in_env ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          )}
          <div style={panelStyles.metaItem}>
            <div style={panelStyles.metaLabel}>ID</div>
            <div style={{ ...panelStyles.metaValue, fontFamily: 'monospace', fontSize: '0.75rem' }}>{daemon.id}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={panelStyles.container}>
      <div style={panelStyles.header}>
        <div>
          <div style={panelStyles.title}>
            <span>🎛️</span> Platform Daemon Control
          </div>
          <div style={panelStyles.subtitle}>
            Monitor and manage internal platform daemons
          </div>
        </div>
        <button
          style={panelStyles.refreshBtn}
          onClick={fetchData}
          disabled={loading}
          onMouseEnter={e => (e.currentTarget.style.background = '#475569')}
          onMouseLeave={e => (e.currentTarget.style.background = '#334155')}
        >
          {loading ? '⏳' : '🔄'} {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div style={panelStyles.errorBanner}>
          ⚠️ {error}
        </div>
      )}

      {data && (
        <>
          <div style={panelStyles.summaryBar}>
            <div style={panelStyles.summaryCard}>
              <div style={{ ...panelStyles.summaryValue, color: '#10b981' }}>{data.online}</div>
              <div style={panelStyles.summaryLabel}>Online</div>
            </div>
            <div style={panelStyles.summaryCard}>
              <div style={{ ...panelStyles.summaryValue, color: '#f59e0b' }}>{data.degraded}</div>
              <div style={panelStyles.summaryLabel}>Degraded</div>
            </div>
            <div style={panelStyles.summaryCard}>
              <div style={{ ...panelStyles.summaryValue, color: '#ef4444' }}>{data.offline}</div>
              <div style={panelStyles.summaryLabel}>Offline</div>
            </div>
            <div style={panelStyles.summaryCard}>
              <div style={panelStyles.summaryValue}>{data.total}</div>
              <div style={panelStyles.summaryLabel}>Total Daemons</div>
            </div>
          </div>

          <div style={panelStyles.grid}>
            {data.daemons.map(renderDaemonCard)}
          </div>

          {lastRefresh && (
            <div style={panelStyles.timestamp}>
              Last updated: {lastRefresh.toLocaleTimeString()} | Server: {data.timestamp}
            </div>
          )}
        </>
      )}

      {/* Action result toast */}
      {actionResult && (
        <div style={{
          position: 'fixed', bottom: '2rem', right: '2rem',
          background: actionResult.ok ? '#065f46' : '#7f1d1d',
          border: `1px solid ${actionResult.ok ? '#10b981' : '#ef4444'}`,
          color: actionResult.ok ? '#6ee7b7' : '#fca5a5',
          padding: '0.75rem 1.25rem', borderRadius: '10px',
          fontSize: '0.85rem', zIndex: 1000, boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}>
          {actionResult.ok ? '✅' : '❌'} {actionResult.msg}
        </div>
      )}

      {/* Knowledge Daemon Chat Panel */}
      {showChat && (
        <div style={{
          marginTop: '1.5rem', background: '#0f172a', border: '1px solid #334155',
          borderRadius: '12px', overflow: 'hidden',
        }}>
          <div style={{ padding: '0.75rem 1rem', background: '#1e293b', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: '#f1f5f9' }}>🧠 Knowledge Daemon Chat</span>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Powered by Groq LLM</span>
          </div>
          <div style={{ height: '300px', overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {chatMessages.length === 0 && (
              <div style={{ color: '#64748b', textAlign: 'center', padding: '2rem', fontSize: '0.85rem' }}>
                Ask the Knowledge Daemon about system status, daemons, or platform administration.
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                background: msg.role === 'user' ? '#1e3a5f' : '#1e293b',
                border: `1px solid ${msg.role === 'user' ? '#3b82f6' : '#334155'}`,
                borderRadius: '10px', padding: '0.6rem 0.85rem',
              }}>
                <div style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                <div style={{ fontSize: '0.6rem', color: '#64748b', marginTop: '0.25rem', textAlign: 'right' }}>
                  {msg.timestamp.toLocaleTimeString()}{msg.model ? ` | ${msg.model}` : ''}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div style={{ alignSelf: 'flex-start', color: '#94a3b8', fontSize: '0.85rem', padding: '0.5rem' }}>
                🧠 Thinking...
              </div>
            )}
          </div>
          <div style={{ padding: '0.75rem', borderTop: '1px solid #334155', display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendChat()}
              placeholder="Ask the Knowledge Daemon..."
              style={{
                flex: 1, padding: '0.6rem 0.85rem', background: '#1e293b',
                border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0',
                fontSize: '0.85rem', outline: 'none',
              }}
            />
            <button
              onClick={handleSendChat}
              disabled={chatLoading || !chatInput.trim()}
              style={{
                padding: '0.6rem 1rem', background: '#3b82f6', border: 'none',
                borderRadius: '8px', color: '#fff', fontSize: '0.85rem', cursor: 'pointer',
                opacity: chatLoading || !chatInput.trim() ? 0.5 : 1,
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {!data && !error && loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          Loading daemon status...
        </div>
      )}
    </div>
  );
};

const actionBtnStyle: React.CSSProperties = {
  padding: '0.4rem 0.85rem',
  border: '1px solid',
  borderRadius: '8px',
  color: '#e2e8f0',
  fontSize: '0.75rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'opacity 0.2s',
};

export default DaemonControlPanel;
