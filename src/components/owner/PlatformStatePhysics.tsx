/**
 * Platform State Physics Component
 * Shows real-time platform metrics: services, agents, users, system health
 */
import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Server, Users, Cpu, Activity, Zap, Database, Globe, AlertTriangle } from 'lucide-react';
import { ENV } from '../../config/env';

const API_BASE = ENV.apiUrl;

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'offline';
  latency?: number;
  uptime?: string;
}

interface PlatformMetrics {
  services: ServiceHealth[];
  totalUsers: number;
  activeUsers: number;
  totalAgents: number;
  activeAgents: number;
  totalRequests24h: number;
  avgLatency: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
}

const PlatformStatePhysics: React.FC = () => {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch ALL data from unified system endpoints (real backend data)
      const [sysMetrics, svcHealth, raraData, analyticsData] = await Promise.all([
        fetch(API_BASE + '/owner/dashboard/system/metrics').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(API_BASE + '/owner/dashboard/system/services').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(API_BASE + '/owner/dashboard/system/rara').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(API_BASE + '/owner/dashboard/system/analytics').then(r => r.ok ? r.json() : null).catch(() => null),
      ]);

      // Map all 28 services from backend
      const services: ServiceHealth[] = (svcHealth?.services || []).map((s: any) => ({
        name: s.name,
        status: s.status as 'healthy' | 'degraded' | 'offline',
        latency: s.latency || 0,
      }));

      const cpuUsage = sysMetrics?.cpu?.usage_percent || 0;
      const memoryUsage = sysMetrics?.memory?.usage_percent || 0;
      const diskUsage = sysMetrics?.disk?.usage_percent || 0;
      const totalUsers = analyticsData?.total_users || 0;
      const activeUsers = analyticsData?.active_users_24h || 0;
      const totalAgents = raraData?.total_agents || 0;
      const activeAgents = (raraData?.agents || []).filter((a: any) => a.status === 'active').length;
      const totalRequests = analyticsData?.api_calls_30d || 0;

      const healthyServices = services.filter(s => s.latency && s.latency > 0);
      const avgLatency = healthyServices.length > 0 
        ? Math.round(healthyServices.reduce((sum, s) => sum + (s.latency || 0), 0) / healthyServices.length)
        : 0;

      setMetrics({
        services,
        totalUsers,
        activeUsers,
        totalAgents,
        activeAgents,
        totalRequests24h: totalRequests,
        avgLatency,
        errorRate: services.length > 0 ? (services.filter(s => s.status !== 'healthy').length / services.length * 100) : 0,
        cpuUsage,
        memoryUsage,
        diskUsage,
      });
      
      setLastUpdate(new Date());
    } catch (err) {
      setError('Failed to fetch platform metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#22c55e';
      case 'degraded': return '#f59e0b';
      case 'offline': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading && !metrics) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
        <p>Loading platform state...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Activity size={24} style={{ color: '#6366f1' }} />
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Platform State Physics</h2>
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
          Last update: {lastUpdate?.toLocaleTimeString() || 'Never'}
        </span>
        <button onClick={fetchMetrics} style={{ padding: '0.5rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#ef4444', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {metrics && (
        <>
          {/* System Health Overview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <MetricCard icon={<Cpu size={20} />} label="CPU Usage" value={metrics.cpuUsage.toFixed(1) + '%'} color={metrics.cpuUsage > 80 ? '#ef4444' : '#22c55e'} />
            <MetricCard icon={<Database size={20} />} label="Memory" value={metrics.memoryUsage.toFixed(1) + '%'} color={metrics.memoryUsage > 80 ? '#ef4444' : '#22c55e'} />
            <MetricCard icon={<Server size={20} />} label="Disk" value={metrics.diskUsage.toFixed(1) + '%'} color="#22c55e" />
            <MetricCard icon={<Zap size={20} />} label="Avg Latency" value={metrics.avgLatency + 'ms'} color={metrics.avgLatency > 500 ? '#f59e0b' : '#22c55e'} />
            <MetricCard icon={<Globe size={20} />} label="Requests/24h" value={metrics.totalRequests24h.toLocaleString()} color="#6366f1" />
            <MetricCard icon={<AlertTriangle size={20} />} label="Error Rate" value={metrics.errorRate.toFixed(1) + '%'} color={metrics.errorRate > 5 ? '#ef4444' : '#22c55e'} />
          </div>

          {/* Services Grid */}
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Server size={18} /> Service Health
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {metrics.services.map(svc => (
              <div key={svc.name} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: getStatusColor(svc.status), boxShadow: '0 0 8px ' + getStatusColor(svc.status) }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{svc.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {svc.status} {svc.latency ? '• ' + svc.latency + 'ms' : ''} {svc.uptime ? '• ' + svc.uptime : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Users & Agents */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <Users size={20} style={{ color: '#6366f1' }} />
                <h4 style={{ margin: 0 }}>Users</h4>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#6366f1' }}>{metrics.totalUsers}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Total Users</div>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#22c55e' }}>{metrics.activeUsers}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Active Today</div>
                </div>
              </div>
            </div>

            <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <Cpu size={20} style={{ color: '#8b5cf6' }} />
                <h4 style={{ margin: 0 }}>Agents</h4>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#8b5cf6' }}>{metrics.totalAgents}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Total Agents</div>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#22c55e' }}>{metrics.activeAgents}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Active Now</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const MetricCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string }> = ({ icon, label, value, color }) => (
  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-tertiary)' }}>
      {icon}
      <span style={{ fontSize: '0.75rem' }}>{label}</span>
    </div>
    <div style={{ fontSize: '1.5rem', fontWeight: 700, color }}>{value}</div>
  </div>
);

export default PlatformStatePhysics;
