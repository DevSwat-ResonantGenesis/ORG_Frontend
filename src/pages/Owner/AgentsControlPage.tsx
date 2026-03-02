/**
 * Owner-Only Internal Agents Control Page
 * Dedicated page showing ALL internal platform agents, teams, RARA types, and autonomous infrastructure.
 * Route: /owner/agents-control
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSessionData } from '../../utils/auth-cookies';
import fastapiClient from '../../api/fastapiClient';

interface AgentData {
  id: string;
  name: string;
  category: string;
  autonomous: boolean;
  specializations: Record<string, number>;
  success_rate?: number;
  avg_response_time?: number;
  strengths?: string[];
  weaknesses?: string[];
}

interface TeamData {
  id: string;
  name: string;
  agents: string[];
  workflow: string;
  description: string;
  trigger_keywords: string[];
}

interface InfraData {
  name: string;
  description: string;
  source: string;
}

interface RaraData {
  id: string;
  name: string;
  description?: string;
}

interface CatalogData {
  agents: AgentData[];
  teams: TeamData[];
  skills: any[];
  rara_types: RaraData[];
  infrastructure: InfraData[];
  counts: Record<string, number>;
}

const categoryColors: Record<string, string> = {
  Core: '#8b5cf6', Development: '#3b82f6', Security: '#ef4444', Architecture: '#f59e0b',
  Performance: '#10b981', Quality: '#06b6d4', Infrastructure: '#ec4899', Utility: '#64748b',
};

const AgentsControlPage: React.FC = () => {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = getSessionData();
    if (!session?.is_superuser) {
      navigate('/dashboard');
      return;
    }
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fastapiClient.get('/owner/internal-catalog');
      setCatalog(res.data);
    } catch (err: any) {
      setError(err?.message || err?.error || 'Failed to load internal catalog');
    } finally {
      setLoading(false);
    }
  };

  const agents = catalog?.agents || [];
  const teams = catalog?.teams || [];
  const raraTypes = catalog?.rara_types || [];
  const infra = catalog?.infrastructure || [];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e17', color: '#e2e8f0', padding: '24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#f1f5f9' }}>
              🤖 Internal Agents Control Center
            </h1>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0' }}>
              {loading ? 'Loading catalog from backend...' : `${agents.length} agents · ${teams.length} teams · ${raraTypes.length} RARA types · ${infra.length} infrastructure components`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={fetchCatalog}
              disabled={loading}
              style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(14,165,233,0.4)', background: 'rgba(14,165,233,0.14)', color: '#7dd3fc', fontSize: '13px', cursor: 'pointer' }}
            >
              {loading ? 'Loading...' : '↻ Refresh'}
            </button>
            <button
              onClick={() => navigate('/owner-dashboard')}
              style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.3)', background: 'rgba(148,163,184,0.1)', color: '#94a3b8', fontSize: '13px', cursor: 'pointer' }}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {error && <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '13px', padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>{error}</div>}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
          <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#93c5fd' }}>{agents.length}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Individual Agents</div>
          </div>
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#6ee7b7' }}>{teams.length}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Multi-Agent Teams</div>
          </div>
          <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#fbbf24' }}>{raraTypes.length}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>RARA Agent Types</div>
          </div>
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#fca5a5' }}>{agents.filter(a => a.autonomous).length}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Autonomous-Capable</div>
          </div>
        </div>

        {/* Section 1: Individual Agent Types Table */}
        <div style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', color: '#f1f5f9', margin: '0 0 16px', fontWeight: 700 }}>
            🧠 Individual Agent Types ({agents.length})
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 400, marginLeft: '8px' }}>Source: agent_engine.py _get_agent_prompts</span>
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(148,163,184,0.2)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 8px', color: '#94a3b8', fontWeight: 600 }}>Agent Type</th>
                  <th style={{ textAlign: 'left', padding: '10px 8px', color: '#94a3b8', fontWeight: 600 }}>Category</th>
                  <th style={{ textAlign: 'left', padding: '10px 8px', color: '#94a3b8', fontWeight: 600 }}>Description</th>
                  <th style={{ textAlign: 'center', padding: '10px 8px', color: '#94a3b8', fontWeight: 600 }}>Autonomous</th>
                  <th style={{ textAlign: 'left', padding: '10px 8px', color: '#94a3b8', fontWeight: 600 }}>Specializations</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent, idx) => (
                  <tr key={agent.id} style={{ borderBottom: '1px solid rgba(148,163,184,0.08)', background: idx % 2 === 0 ? 'transparent' : 'rgba(148,163,184,0.03)' }}>
                    <td style={{ padding: '10px 8px', color: '#e2e8f0', fontWeight: 600, whiteSpace: 'nowrap' }}>{agent.name}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '4px', background: `${categoryColors[agent.category] || '#64748b'}22`, color: categoryColors[agent.category] || '#94a3b8', fontSize: '10px', fontWeight: 600 }}>{agent.category}</span>
                    </td>
                    <td style={{ padding: '10px 8px', color: '#94a3b8', maxWidth: '320px' }}>
                      {agent.strengths && agent.strengths.length > 0 ? agent.strengths.join(', ') : agent.id}
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      <span style={{ color: agent.autonomous ? '#10b981' : '#475569', fontSize: '14px' }}>{agent.autonomous ? '✅' : '—'}</span>
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {Object.entries(agent.specializations || {}).slice(0, 3).map(([k, v]) => (
                          <span key={k} style={{ padding: '2px 6px', borderRadius: '3px', background: 'rgba(139,92,246,0.12)', color: '#a78bfa', fontSize: '9px' }}>
                            {k.replace(/_/g, ' ')} {(Number(v) * 100).toFixed(0)}%
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Multi-Agent Teams */}
        <div style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', color: '#f1f5f9', margin: '0 0 16px', fontWeight: 700 }}>
            👥 Multi-Agent Teams ({teams.length})
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 400, marginLeft: '8px' }}>Source: team_engine.py INTERNAL_TEAMS</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
            {teams.map(team => (
              <div key={team.id} style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.12)', borderRadius: '10px', padding: '18px' }}>
                <h3 style={{ margin: '0 0 8px', fontSize: '14px', color: '#f1f5f9', fontWeight: 700 }}>{team.name}</h3>
                <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 12px', lineHeight: 1.5 }}>{team.description}</p>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '10px' }}>
                  {team.agents.map((a: string, i: number) => (
                    <React.Fragment key={a}>
                      <span style={{ padding: '3px 8px', borderRadius: '5px', background: 'rgba(59,130,246,0.18)', color: '#93c5fd', fontSize: '11px', fontWeight: 600 }}>{a}</span>
                      {i < team.agents.length - 1 && <span style={{ color: '#475569', fontSize: '12px' }}>→</span>}
                    </React.Fragment>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ padding: '3px 8px', borderRadius: '5px', background: team.workflow === 'parallel_merge' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)', color: team.workflow === 'parallel_merge' ? '#fbbf24' : '#6ee7b7', fontSize: '10px', fontWeight: 600 }}>
                    {team.workflow === 'parallel_merge' ? '⚡ Parallel Merge' : '📋 Sequential'}
                  </span>
                </div>
                <div style={{ marginTop: '8px', fontSize: '10px', color: '#475569' }}>Triggers: <span style={{ color: '#64748b' }}>{(team.trigger_keywords || []).join(', ')}</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: RARA Agent Types */}
        <div style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', color: '#f1f5f9', margin: '0 0 16px', fontWeight: 700 }}>
            🔷 RARA Agent Types ({raraTypes.length})
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 400, marginLeft: '8px' }}>Source: agent_factory_invariants.py AgentType</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
            {raraTypes.map(rt => (
              <div key={rt.id} style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.12)', borderRadius: '10px', padding: '18px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9', marginBottom: '6px' }}>{rt.name}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>{rt.description || rt.id}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Autonomous Infrastructure */}
        <div style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '16px', color: '#f1f5f9', margin: '0 0 16px', fontWeight: 700 }}>
            ⚡ Autonomous Infrastructure ({infra.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {infra.map(comp => (
              <div key={comp.name} style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.12)', borderRadius: '10px', padding: '18px' }}>
                <h3 style={{ margin: '0 0 8px', fontSize: '14px', color: '#f1f5f9', fontWeight: 700 }}>{comp.name}</h3>
                <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 10px', lineHeight: 1.5 }}>{comp.description}</p>
                <div style={{ fontSize: '10px', color: '#475569' }}>File: <code style={{ color: '#64748b' }}>{comp.source}</code></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentsControlPage;
