import React, { useState, useEffect } from 'react';
import { getSession } from '@/utils/auth';
import { useThemeStore } from '@/store/themeStore';

interface AgentMetric {
  agent_type: string;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  success_rate: number;
  avg_execution_time_ms: number;
  avg_quality_score: number;
}

interface FeedbackStat {
  agent_type: string;
  positive_count: number;
  negative_count: number;
  satisfaction_rate: number;
  recent_trend: string;
}

interface MetricsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ isOpen, onClose }) => {
  const theme = useThemeStore(state => state.theme);
  const isLight = theme === 'light';
  const [metrics, setMetrics] = useState<Record<string, AgentMetric>>({});
  const [feedback, setFeedback] = useState<Record<string, FeedbackStat>>({});
  const [topAgents, setTopAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'performance' | 'feedback'>('performance');
  const [totalStats, setTotalStats] = useState({ executions: 0, successRate: 0, avgTime: 0 });

  useEffect(() => {
    if (isOpen) {
      fetchMetrics();
    }
  }, [isOpen]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const session = await getSession();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (session?.token) {
        headers['Authorization'] = `Bearer ${session.token}`;
      }

      const [statsRes, feedbackRes] = await Promise.all([
        fetch('/api/resonant-chat/agents/stats', { headers }),
        fetch('/api/resonant-chat/feedback/stats', { headers }),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        const metricsData = data.data?.metrics || data.metrics || {};
        setMetrics(metricsData);
        setTopAgents(data.data?.top_agents || data.top_agents || []);
        
        // Calculate totals
        const allMetrics = Object.values(metricsData) as AgentMetric[];
        if (allMetrics.length > 0) {
          const totalExec = allMetrics.reduce((sum, m) => sum + m.total_executions, 0);
          const avgSuccess = allMetrics.reduce((sum, m) => sum + m.success_rate, 0) / allMetrics.length;
          const avgTime = allMetrics.reduce((sum, m) => sum + m.avg_execution_time_ms, 0) / allMetrics.length;
          setTotalStats({ executions: totalExec, successRate: avgSuccess, avgTime });
        }
      }

      if (feedbackRes.ok) {
        const data = await feedbackRes.json();
        setFeedback(data.data?.all_stats || data.all_stats || {});
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getAgentIcon = (agentType: string): string => {
    const icons: Record<string, string> = {
      reasoning: '🧠', code: '💻', debug: '🔧', research: '🔍',
      summary: '📝', planning: '📋', math: '🔢', security: '🔒',
      architecture: '🏗️', test: '🧪', review: '👀', explain: '💡',
      optimization: '⚡', documentation: '📚', migration: '🔄',
      api: '🔌', database: '🗄️', devops: '🚀', refactor: '♻️',
      accessibility: '♿', i18n: '🌍', regex: '🔤', git: '📦', css: '🎨',
    };
    return icons[agentType] || '🤖';
  };

  const formatAgentName = (agentType: string): string => {
    return agentType.charAt(0).toUpperCase() + agentType.slice(1) + ' Agent';
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99997 }}>
      {/* Backdrop */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />
      {/* Modal */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '85vh',
        zIndex: 99998,
        background: isLight ? 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)' : 'linear-gradient(180deg, rgba(28, 28, 30, 0.98) 0%, rgba(20, 20, 22, 0.98) 100%)',
        borderRadius: '16px',
        boxShadow: isLight ? '0 25px 50px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.08)' : '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ 
          padding: '16px 20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)',
          borderBottom: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.06)',
        }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: isLight ? '#1D1D1F' : '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            Agent Metrics Dashboard
          </h3>
          <button
            onClick={onClose}
            style={{
              background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.08)',
              border: 'none',
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              fontSize: '16px',
              color: isLight ? '#6b7280' : '#888',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.15)';
              e.currentTarget.style.color = isLight ? '#1D1D1F' : '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = isLight ? '#6b7280' : '#888';
            }}
          >
            ×
          </button>
        </div>

        {/* Summary Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '12px', 
          padding: '16px 20px',
          borderBottom: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#8b5cf6' }}>{totalStats.executions}</div>
            <div style={{ fontSize: '11px', color: isLight ? '#6b7280' : '#888', textTransform: 'uppercase' }}>Total Executions</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: totalStats.successRate > 0.8 ? '#22c55e' : totalStats.successRate > 0.5 ? '#eab308' : '#ef4444' }}>
              {(totalStats.successRate * 100).toFixed(0)}%
            </div>
            <div style={{ fontSize: '11px', color: isLight ? '#6b7280' : '#888', textTransform: 'uppercase' }}>Avg Success Rate</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#0ea5e9' }}>{totalStats.avgTime.toFixed(0)}ms</div>
            <div style={{ fontSize: '11px', color: isLight ? '#6b7280' : '#888', textTransform: 'uppercase' }}>Avg Response Time</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => setActiveTab('performance')}
            style={{
              flex: 1,
              padding: '12px',
              background: activeTab === 'performance' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'performance' ? '2px solid #8b5cf6' : '2px solid transparent',
              color: activeTab === 'performance' ? '#8b5cf6' : '#888',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Performance
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            style={{
              flex: 1,
              padding: '12px',
              background: activeTab === 'feedback' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'feedback' ? '2px solid #8b5cf6' : '2px solid transparent',
              color: activeTab === 'feedback' ? '#8b5cf6' : '#888',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            User Feedback
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: isLight ? '#6b7280' : '#666' }}>
              Loading metrics...
            </div>
          ) : activeTab === 'performance' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.keys(metrics).length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: isLight ? '#6b7280' : '#666' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={isLight ? '#9ca3af' : '#555'} strokeWidth="1.5" style={{ marginBottom: '12px' }}>
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                  <div style={{ fontSize: '14px', color: isLight ? '#374151' : undefined }}>No performance data yet</div>
                  <div style={{ fontSize: '12px', marginTop: '8px', color: isLight ? '#6b7280' : '#555' }}>
                    Start chatting to generate metrics!
                  </div>
                </div>
              ) : (
                Object.entries(metrics).map(([agentType, metric]) => (
                  <div key={agentType} style={{ 
                    padding: '14px', 
                    background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)', 
                    borderRadius: '12px',
                    border: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '20px' }}>{getAgentIcon(agentType)}</span>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: isLight ? '#1D1D1F' : '#fff' }}>{formatAgentName(agentType)}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      <div style={{ textAlign: 'center', padding: '8px', background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '18px', fontWeight: 600, color: '#8b5cf6' }}>{metric.total_executions}</div>
                        <div style={{ fontSize: '10px', color: isLight ? '#6b7280' : '#888', textTransform: 'uppercase' }}>Executions</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '8px', background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '18px', fontWeight: 600, color: metric.success_rate > 0.8 ? '#22c55e' : '#eab308' }}>
                          {(metric.success_rate * 100).toFixed(0)}%
                        </div>
                        <div style={{ fontSize: '10px', color: isLight ? '#6b7280' : '#888', textTransform: 'uppercase' }}>Success</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '8px', background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '18px', fontWeight: 600, color: '#0ea5e9' }}>{metric.avg_execution_time_ms.toFixed(0)}ms</div>
                        <div style={{ fontSize: '10px', color: isLight ? '#6b7280' : '#888', textTransform: 'uppercase' }}>Avg Time</div>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div style={{ marginTop: '10px', height: '4px', background: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${metric.success_rate * 100}%`, 
                        background: metric.success_rate > 0.8 ? '#22c55e' : metric.success_rate > 0.5 ? '#eab308' : '#ef4444',
                        borderRadius: '2px',
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.keys(feedback).length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: isLight ? '#6b7280' : '#666' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={isLight ? '#9ca3af' : '#555'} strokeWidth="1.5" style={{ marginBottom: '12px' }}>
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                  </svg>
                  <div style={{ fontSize: '14px', color: isLight ? '#374151' : undefined }}>No feedback data yet</div>
                  <div style={{ fontSize: '12px', marginTop: '8px', color: isLight ? '#6b7280' : '#555' }}>
                    Rate responses to see stats!
                  </div>
                </div>
              ) : (
                Object.entries(feedback).map(([agentType, stat]) => (
                  <div key={agentType} style={{ 
                    padding: '14px', 
                    background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)', 
                    borderRadius: '12px',
                    border: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>{getAgentIcon(agentType)}</span>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: isLight ? '#1D1D1F' : '#fff' }}>{formatAgentName(agentType)}</span>
                      </div>
                      <span style={{ 
                        fontSize: '11px', 
                        padding: '4px 8px', 
                        borderRadius: '12px',
                        background: stat.recent_trend === 'improving' ? 'rgba(34, 197, 94, 0.15)' : stat.recent_trend === 'declining' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(136, 136, 136, 0.15)',
                        color: stat.recent_trend === 'improving' ? '#22c55e' : stat.recent_trend === 'declining' ? '#ef4444' : '#888',
                      }}>
                        {stat.recent_trend === 'improving' ? '↑ Improving' : stat.recent_trend === 'declining' ? '↓ Declining' : '→ Stable'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#22c55e', fontSize: '14px' }}>
                          👍 {stat.positive_count}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontSize: '14px' }}>
                          👎 {stat.negative_count}
                        </span>
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: stat.satisfaction_rate > 0.7 ? '#22c55e' : '#eab308' }}>
                        {(stat.satisfaction_rate * 100).toFixed(0)}% satisfaction
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Top Performers */}
        {topAgents.length > 0 && (
          <div style={{ 
            padding: '16px 20px', 
            borderTop: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.06)',
            background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
          }}>
            <div style={{ fontSize: '12px', color: isLight ? '#6b7280' : '#888', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🏆 Top Performers
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {topAgents.slice(0, 3).map((agent, i) => (
                <div key={agent.agent_type} style={{ 
                  flex: 1, 
                  padding: '10px', 
                  background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)', 
                  borderRadius: '8px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '16px', marginBottom: '4px' }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                  </div>
                  <div style={{ fontSize: '12px', color: isLight ? '#1D1D1F' : '#fff', fontWeight: 500 }}>{formatAgentName(agent.agent_type)}</div>
                  <div style={{ fontSize: '11px', color: isLight ? '#6b7280' : '#888' }}>{(agent.value * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricsDashboard;
