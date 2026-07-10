import React, { memo, useState, useEffect, useCallback } from 'react';
import { useAgentStore } from '../../../../../stores';
import { Icons } from '../../shared/Icons';
import fastapiClient from '../../../../../api/fastapiClient';
import styles from './TeamsPanel.module.css';

// ============== TEAMS PANEL ==============
// Real "Agent Team" UI: create a team of agents, run it, see results.
// Backend: /agent-teams/* (RG_Agent_Engine routers_teams.py, proxied by
// the gateway without an /api/v1 prefix — see main.py's agent_teams_proxy).

interface Team {
  id: string;
  name: string;
  description?: string;
  status: string;
  memberCount: number;
  workflowType: string;
  createdAt: string;
}

interface WorkflowRun {
  id: string;
  status: string;
  input_data?: any;
  result?: any;
  error?: string;
  created_at: string;
}

interface TeamsPanelProps {
  className?: string;
}

const TeamsPanelComponent: React.FC<TeamsPanelProps> = ({ className }) => {
  const agents = useAgentStore((state) => state.agents);
  const persistedAgents = agents.filter((a: any) => a.persisted);

  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showNewTeamForm, setShowNewTeamForm] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [newTeamType, setNewTeamType] = useState<'parallel' | 'sequential'>('parallel');
  const [newTeamMemberIds, setNewTeamMemberIds] = useState<string[]>([]);

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<{ agentId: string }[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowRun[]>([]);
  const [goalInput, setGoalInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || null;

  const agentName = useCallback(
    (agentId: string) => agents.find((a: any) => a.id === agentId)?.name || agentId.slice(0, 8),
    [agents]
  );

  const parseTeam = (t: any): Team => ({
    id: t.id,
    name: t.name,
    description: t.description,
    status: t.status || 'active',
    memberCount: t.member_count ?? 0,
    workflowType: t.workflow_config?.type || 'sequential',
    createdAt: t.created_at,
  });

  const fetchTeams = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fastapiClient.get('/agent-teams');
      setTeams((res.data || []).map(parseTeam));
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load teams');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const fetchTeamDetail = useCallback(async (teamId: string) => {
    try {
      const [membersRes, workflowsRes] = await Promise.allSettled([
        fastapiClient.get(`/agent-teams/${teamId}/members`),
        fastapiClient.get(`/agent-teams/${teamId}/workflows`),
      ]);
      if (membersRes.status === 'fulfilled') {
        setSelectedTeamMembers((membersRes.value.data || []).map((m: any) => ({ agentId: m.agent_id })));
      }
      if (workflowsRes.status === 'fulfilled') {
        const runs = (workflowsRes.value.data || []).sort(
          (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setWorkflows(runs);
      }
    } catch {
      /* silent — detail is best-effort */
    }
  }, []);

  const handleSelectTeam = useCallback(
    (teamId: string) => {
      setSelectedTeamId(teamId);
      setGoalInput('');
      setSelectedTeamMembers([]);
      setWorkflows([]);
      fetchTeamDetail(teamId);
    },
    [fetchTeamDetail]
  );

  const toggleMember = (agentId: string) => {
    setNewTeamMemberIds((prev) =>
      prev.includes(agentId) ? prev.filter((id) => id !== agentId) : [...prev, agentId]
    );
  };

  const handleCreateTeam = useCallback(async () => {
    if (!newTeamName.trim() || newTeamMemberIds.length < 2) return;
    setIsLoading(true);
    setError(null);
    try {
      await fastapiClient.post('/agent-teams', {
        name: newTeamName,
        description: newTeamDescription || undefined,
        agent_ids: newTeamMemberIds,
        workflow_config: { type: newTeamType },
      });
      setNewTeamName('');
      setNewTeamDescription('');
      setNewTeamMemberIds([]);
      setShowNewTeamForm(false);
      fetchTeams();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to create team');
    } finally {
      setIsLoading(false);
    }
  }, [newTeamName, newTeamDescription, newTeamMemberIds, newTeamType, fetchTeams]);

  const handleDeleteTeam = useCallback(
    async (teamId: string) => {
      if (!confirm('Delete this team?')) return;
      try {
        await fastapiClient.delete(`/agent-teams/${teamId}`);
        if (selectedTeamId === teamId) setSelectedTeamId(null);
        fetchTeams();
      } catch (err: any) {
        setError(err.response?.data?.detail || err.message || 'Failed to delete team');
      }
    },
    [selectedTeamId, fetchTeams]
  );

  // Poll a running workflow until it settles
  const pollWorkflow = useCallback((workflowId: string, teamId: string) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts += 1;
      try {
        const res = await fastapiClient.get(`/agent-teams/workflows/${workflowId}`);
        const wf = res.data;
        if (wf.status === 'completed' || wf.status === 'failed' || wf.status === 'cancelled' || attempts > 60) {
          clearInterval(interval);
          setIsRunning(false);
          fetchTeamDetail(teamId);
        }
      } catch {
        if (attempts > 60) {
          clearInterval(interval);
          setIsRunning(false);
        }
      }
    }, 5000);
  }, [fetchTeamDetail]);

  const handleRunTeam = useCallback(async () => {
    if (!selectedTeamId || !goalInput.trim()) return;
    setIsRunning(true);
    setError(null);
    try {
      const res = await fastapiClient.post(`/agent-teams/${selectedTeamId}/execute`, {
        goal: goalInput,
      });
      const workflowId = res.data?.id;
      fetchTeamDetail(selectedTeamId);
      if (workflowId) pollWorkflow(workflowId, selectedTeamId);
      else setIsRunning(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to run team');
      setIsRunning(false);
    }
  }, [selectedTeamId, goalInput, fetchTeamDetail, pollWorkflow]);

  const getStatusClass = (status: string) => (styles as any)[status] || '';

  return (
    <div className={`${styles.panel} ${className || ''}`}>
      <div className={styles.panelHeader}>
        <h2><Icons.Users /> Agent Teams {isLoading && '(loading...)'}</h2>
        <button className={styles.addBtn} onClick={() => setShowNewTeamForm((v) => !v)}>
          <Icons.Plus /> New Team
        </button>
      </div>

      <div className={styles.panelContent}>
        <div className={styles.notice}>
          A team runs 2+ agents together on one goal — <strong>parallel</strong> runs every member
          concurrently on the same input and combines their outputs (e.g. two writers drafting
          competing versions); <strong>sequential</strong> feeds each member's output into the next.
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        {showNewTeamForm && (
          <div className={styles.newTeamForm}>
            <input
              type="text"
              className={styles.formInput}
              placeholder="Team name..."
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
            />
            <textarea
              className={styles.formTextarea}
              placeholder="Description (optional)..."
              value={newTeamDescription}
              onChange={(e) => setNewTeamDescription(e.target.value)}
            />
            <select
              className={styles.formSelect}
              value={newTeamType}
              onChange={(e) => setNewTeamType(e.target.value as 'parallel' | 'sequential')}
            >
              <option value="parallel">Parallel — all members run concurrently on the same goal</option>
              <option value="sequential">Sequential — each member's output feeds the next</option>
            </select>
            <div>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 6, textTransform: 'uppercase' }}>
                Members (pick 2+)
              </div>
              <div className={styles.memberPicker}>
                {persistedAgents.map((a: any) => (
                  <div
                    key={a.id}
                    className={`${styles.memberChip} ${newTeamMemberIds.includes(a.id) ? styles.selected : ''}`}
                    onClick={() => toggleMember(a.id)}
                  >
                    {a.name}
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.formActions}>
              <button
                onClick={handleCreateTeam}
                disabled={!newTeamName.trim() || newTeamMemberIds.length < 2 || isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Team'}
              </button>
              <button onClick={() => setShowNewTeamForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        {selectedTeam && (
          <div className={styles.detailPanel}>
            <div className={styles.detailHeader}>
              <h3>{selectedTeam.name}</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className={`${styles.statusBadge} ${getStatusClass(selectedTeam.status)}`}>
                  {selectedTeam.status}
                </span>
                <button className={`${styles.actionBtn} ${styles.deleteAction}`} onClick={() => handleDeleteTeam(selectedTeam.id)}>
                  <Icons.Trash /> Delete
                </button>
              </div>
            </div>
            {selectedTeam.description && <p className={styles.teamDesc}>{selectedTeam.description}</p>}

            <div className={styles.membersRow}>
              {selectedTeamMembers.map((m) => (
                <span key={m.agentId} className={styles.memberBadge}>{agentName(m.agentId)}</span>
              ))}
            </div>

            <div className={styles.runSection}>
              <h5>Run this team</h5>
              <textarea
                className={styles.formTextarea}
                placeholder="What should this team do?"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
              />
              <button className={styles.runBtn} onClick={handleRunTeam} disabled={!goalInput.trim() || isRunning}>
                {isRunning ? 'Running...' : <><Icons.Play /> Run Team</>}
              </button>

              {workflows.length > 0 && (
                <div className={styles.workflowsList}>
                  {workflows.map((wf) => (
                    <div key={wf.id} className={styles.workflowCard}>
                      <div className={styles.workflowCardHeader}>
                        <span className={`${styles.statusBadge} ${getStatusClass(wf.status)}`}>{wf.status}</span>
                        <span style={{ color: '#64748b' }}>{new Date(wf.created_at).toLocaleString()}</span>
                      </div>
                      {wf.input_data?.goal && <div className={styles.workflowGoal}>Goal: {wf.input_data.goal}</div>}
                      {wf.error && <div className={styles.workflowError}>{wf.error}</div>}
                      {wf.result && (
                        <div className={styles.workflowResult}>
                          {wf.result.combined_output || wf.result.final_output || JSON.stringify(wf.result, null, 2)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className={styles.teamsList}>
          {teams.filter((t) => t.status !== 'archived').map((team) => (
            <div
              key={team.id}
              className={`${styles.teamCard} ${selectedTeamId === team.id ? styles.selected : ''}`}
              onClick={() => handleSelectTeam(team.id)}
            >
              <div className={styles.teamCardHeader}>
                <h4>{team.name}</h4>
                <span className={`${styles.statusBadge} ${getStatusClass(team.status)}`}>{team.status}</span>
              </div>
              {team.description && <p className={styles.teamDesc}>{team.description}</p>}
              <div className={styles.teamMeta}>
                <span>{team.memberCount} member{team.memberCount === 1 ? '' : 's'}</span>
                <span>{team.workflowType}</span>
              </div>
            </div>
          ))}
          {teams.length === 0 && !isLoading && (
            <div className={styles.notice}>No teams yet — create one to run agents together.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export const TeamsPanel = memo(TeamsPanelComponent);
export default TeamsPanel;
