import React, { useState, useEffect, useCallback } from 'react';
import { Icons } from '../../shared/Icons';
import type { Agent } from '../../../../../types';
import { getTeamWorkflows, type AgentTeam, type AgentWorkflow } from '../../../../../api/agentTeams';
import { getSessionSteps, approveStep, type AgentStep } from '../../../../../api/agentEngine';
import styles from './AgentsPanel.module.css';

// ============== TEAM SESSIONS PANEL ==============
// Per-team equivalent of the per-agent SessionsPanel: lists every workflow
// run for a team, and for the selected run, breaks down each member's real
// individual agent session — including approve/reject on any step actually
// stuck waiting for a human, right from the team's own context.

interface TeamSessionsPanelProps {
  teamId: string;
  team: AgentTeam | null;
  agents: Agent[];
  onClose: () => void;
}

interface MemberResult {
  agent_id: string;
  agent_name: string;
  session_id?: string;
  status?: string;
  output?: string;
  error?: string;
}

function extractMembers(result: any): MemberResult[] {
  if (!result) return [];
  const items = Array.isArray(result.steps) ? result.steps : Array.isArray(result.results) ? result.results : [];
  return items.map((item: any) => {
    const out = item.output;
    if (out && typeof out === 'object') {
      return {
        agent_id: item.agent_id,
        agent_name: item.agent_name,
        session_id: out.session_id,
        status: out.status,
        output: typeof out.output === 'string' ? out.output : undefined,
        error: out.error,
      };
    }
    return { agent_id: item.agent_id, agent_name: item.agent_name, error: item.error };
  });
}

function statusColor(status?: string): string {
  switch (status) {
    case 'completed': return '#0ea5e9';
    case 'running': return '#f59e0b';
    case 'waiting_approval': return '#f97316';
    case 'failed': return '#ef4444';
    case 'cancelled': return '#94a3b8';
    default: return '#94a3b8';
  }
}

const TeamSessionsPanel: React.FC<TeamSessionsPanelProps> = ({ teamId, team, agents, onClose }) => {
  const [runs, setRuns] = useState<AgentWorkflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [expandedMemberSession, setExpandedMemberSession] = useState<string | null>(null);
  const [memberSteps, setMemberSteps] = useState<Record<string, AgentStep[]>>({});
  const [approving, setApproving] = useState<string | null>(null);

  const fetchRuns = useCallback(async () => {
    try {
      const list = await getTeamWorkflows(teamId);
      const sorted = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setRuns(sorted);
      setSelectedRunId((prev) => prev || (sorted.length > 0 ? sorted[0].id : null));
    } catch {
      /* teams sessions view is best-effort */
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    setLoading(true);
    fetchRuns();
    const interval = setInterval(fetchRuns, 8000);
    return () => clearInterval(interval);
  }, [fetchRuns]);

  const selectedRun = runs.find((r) => r.id === selectedRunId) || null;
  const members = extractMembers(selectedRun?.result);

  const agentName = (id: string) => agents.find((a) => a.id === id)?.name || id.slice(0, 8);

  const toggleMemberSteps = useCallback(async (sessionId: string) => {
    setExpandedMemberSession((prev) => (prev === sessionId ? null : sessionId));
    try {
      const steps = await getSessionSteps(sessionId);
      setMemberSteps((prev) => ({ ...prev, [sessionId]: steps }));
    } catch {
      /* ignore */
    }
  }, []);

  const handleApprove = useCallback(async (sessionId: string, stepId: string, approved: boolean) => {
    setApproving(stepId);
    try {
      await approveStep(sessionId, stepId, approved);
      const steps = await getSessionSteps(sessionId);
      setMemberSteps((prev) => ({ ...prev, [sessionId]: steps }));
      fetchRuns();
    } catch {
      /* ignore */
    } finally {
      setApproving(null);
    }
  }, [fetchRuns]);

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2><Icons.Users /> {team?.name || 'Team'} — Sessions</h2>
        <button className={styles.modalCloseBtn} onClick={onClose} title="Close"><Icons.X /></button>
      </div>
      <div className={styles.panelContent} style={{ display: 'flex', gap: 12, height: '100%', overflow: 'hidden' }}>
        <div style={{ width: 220, overflowY: 'auto', flexShrink: 0 }}>
          {loading && runs.length === 0 && (
            <div className={styles.emptyState}><Icons.Refresh /><p>Loading…</p></div>
          )}
          {runs.map((run) => (
            <div
              key={run.id}
              onClick={() => setSelectedRunId(run.id)}
              style={{
                padding: '10px 12px', marginBottom: 8, borderRadius: 8, cursor: 'pointer',
                background: selectedRunId === run.id ? 'rgba(249,115,22,0.1)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${selectedRunId === run.id ? 'rgba(249,115,22,0.4)' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: statusColor(run.status), textTransform: 'uppercase' }}>
                {run.status}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                {(run.input_data as any)?.goal || '—'}
              </div>
              <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>
                {new Date(run.created_at).toLocaleString()}
              </div>
            </div>
          ))}
          {!loading && runs.length === 0 && (
            <div className={styles.emptyState}><p>No runs yet</p></div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {selectedRun ? (
            <>
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontWeight: 600, color: statusColor(selectedRun.status), textTransform: 'uppercase', fontSize: 12 }}>
                  {selectedRun.status}
                </span>
                {selectedRun.error && <div style={{ color: '#ef4444', marginTop: 6, fontSize: 12 }}>{selectedRun.error}</div>}
              </div>

              {members.map((m) => (
                <div key={m.agent_id + (m.session_id || '')} style={{ padding: 12, marginBottom: 10, background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: 13 }}>{m.agent_name || agentName(m.agent_id)}</strong>
                    {m.status && (
                      <span style={{ fontSize: 10, textTransform: 'uppercase', color: statusColor(m.status), fontWeight: 600 }}>
                        {m.status}
                      </span>
                    )}
                  </div>
                  {m.error && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 6 }}>{m.error}</div>}
                  {m.output && (
                    <div style={{ fontSize: 12, color: '#cbd5e1', marginTop: 6, whiteSpace: 'pre-wrap', maxHeight: 160, overflowY: 'auto' }}>
                      {m.output}
                    </div>
                  )}
                  {m.session_id && (
                    <button
                      onClick={() => toggleMemberSteps(m.session_id!)}
                      style={{ marginTop: 8, fontSize: 11, background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 10px', color: '#94a3b8', cursor: 'pointer' }}
                    >
                      {expandedMemberSession === m.session_id ? 'Hide steps' : 'View steps'}
                    </button>
                  )}
                  {m.session_id && expandedMemberSession === m.session_id && (
                    <div style={{ marginTop: 10 }}>
                      {(memberSteps[m.session_id] || []).map((step) => (
                        <div key={step.id} style={{ padding: 8, marginBottom: 6, background: 'rgba(255,255,255,0.02)', borderRadius: 6, fontSize: 11 }}>
                          <div style={{ color: '#64748b' }}>
                            Step {step.step_number} — {step.step_type}{step.tool_name ? ` (${step.tool_name})` : ''}
                          </div>
                          {step.reasoning && <div style={{ color: '#94a3b8', marginTop: 4 }}>{step.reasoning}</div>}
                          {step.required_approval && step.approval_status === 'pending' && (
                            <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                              <button
                                disabled={approving === step.id}
                                onClick={() => handleApprove(m.session_id!, step.id, true)}
                                style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}
                              >
                                Approve
                              </button>
                              <button
                                disabled={approving === step.id}
                                onClick={() => handleApprove(m.session_id!, step.id, false)}
                                style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {members.length === 0 && (
                <div className={styles.emptyState}><p>No member data for this run yet</p></div>
              )}
            </>
          ) : (
            <div className={styles.emptyState}><p>Select a run to see details</p></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamSessionsPanel;
