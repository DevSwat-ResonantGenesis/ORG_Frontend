import React, { memo, useState, useEffect, useCallback } from 'react';
import { useAgentStore } from '../../../../../stores';
import { Icons } from '../../shared/Icons';
import fastapiClient from '../../../../../api/fastapiClient';
import styles from './GoalsPanel.module.css';

// ============== GOALS PANEL ==============
// Contract: reads [agent, execution], writes [agent]
// Forbidden: [economy]

interface Goal {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'paused' | 'failed';
  progress: number;
  deadline?: Date;
  agentId: string;
  agentName: string;
  subGoals: { id: string; title: string; completed: boolean }[];
}

interface GoalsPanelProps {
  className?: string;
}

const GoalsPanelComponent: React.FC<GoalsPanelProps> = ({ className }) => {
  const agents = useAgentStore(state => state.agents);
  const selectedAgentId = useAgentStore(state => state.selectedAgentId);
  const selectedAgent = agents.find(a => a.id === selectedAgentId);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleExportGoals = () => {
    const exportData = { exported_at: new Date().toISOString(), goals };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'goals-' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  const [error, setError] = useState<string | null>(null);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [showNewGoalForm, setShowNewGoalForm] = useState(false);

  // Parse backend goal response into our Goal interface
  const parseGoal = (g: any, agentId: string, agentName: string): Goal => ({
    id: g.id,
    title: g.description?.substring(0, 50) || 'Unnamed Goal',
    description: g.description || '',
    priority: typeof g.priority === 'number' ? (g.priority <= 3 ? 'high' : g.priority <= 5 ? 'medium' : 'low') : (g.priority || 'medium'),
    status: g.status === 'completed' ? 'completed' : g.status === 'failed' ? 'failed' : g.status === 'paused' ? 'paused' : 'active',
    progress: g.completion_percentage ?? g.progress ?? 0,
    deadline: g.deadline ? new Date(g.deadline) : undefined,
    agentId,
    agentName,
    subGoals: g.sub_goals?.map((sg: any) => ({
      id: sg.id,
      title: sg.description,
      completed: sg.status === 'completed'
    })) || []
  });

  // Fetch goals — for selected agent or ALL agents
  const fetchGoals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (selectedAgent?.id) {
        // Fetch for single agent
        const response = await fastapiClient.get(`/api/v1/agents/goals/${selectedAgent.id}`);
        const backendGoals = (response.data || []).map((g: any) => parseGoal(g, selectedAgent.id, selectedAgent.name));
        setGoals(backendGoals);
      } else {
        // Fetch for ALL agents
        const allGoals: Goal[] = [];
        const persistedAgents = agents.filter((a: any) => a.persisted);
        const results = await Promise.allSettled(
          persistedAgents.map(async (agent: any) => {
            const response = await fastapiClient.get(`/api/v1/agents/goals/${agent.id}`);
            return { agent, data: response.data || [] };
          })
        );
        for (const r of results) {
          if (r.status === 'fulfilled') {
            for (const g of r.value.data) {
              allGoals.push(parseGoal(g, r.value.agent.id, r.value.agent.name));
            }
          }
        }
        setGoals(allGoals);
      }
    } catch (err: any) {
      console.error('Failed to fetch goals:', err);
      setGoals([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAgent?.id, selectedAgent?.name, agents]);

  // For creating goals, use selected agent or let user pick
  const [createAgentId, setCreateAgentId] = useState(selectedAgent?.id || '');

  // Sync createAgentId when selectedAgent changes
  useEffect(() => {
    if (selectedAgent?.id) setCreateAgentId(selectedAgent.id);
  }, [selectedAgent?.id]);

  // Create new goal
  const handleCreateGoal = useCallback(async () => {
    const targetAgentId = selectedAgent?.id || createAgentId;
    if (!targetAgentId || !newGoalTitle.trim()) return;
    
    setIsLoading(true);
    try {
      await fastapiClient.post(`/api/v1/agents/goals/${selectedAgent?.id || createAgentId}/assign`, {
        description: newGoalTitle,
        priority: 5
      });
      setNewGoalTitle('');
      setShowNewGoalForm(false);
      fetchGoals();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to create goal');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAgent?.id, createAgentId, newGoalTitle, fetchGoals]);

  // Update goal status
  const handleUpdateGoalStatus = useCallback(async (goalId: string, newStatus: string, agentId?: string) => {
    const targetAgentId = agentId || selectedAgent?.id;
    if (!targetAgentId) return;
    setIsLoading(true);
    try {
      await fastapiClient.patch(`/api/v1/agents/goals/${targetAgentId}/goals/${goalId}`, {
        status: newStatus
      });
      fetchGoals();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to update goal');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAgent?.id, fetchGoals]);

  // Delete goal
  const handleDeleteGoal = useCallback(async (goalId: string, agentId?: string) => {
    const targetAgentId = agentId || selectedAgent?.id;
    if (!targetAgentId) return;
    if (!confirm('Delete this goal?')) return;
    setIsLoading(true);
    try {
      await fastapiClient.delete(`/api/v1/agents/goals/${targetAgentId}/goals/${goalId}`);
      fetchGoals();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to delete goal');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAgent?.id, fetchGoals]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const filteredGoals = goals.filter(goal => {
    if (activeFilter === 'active') return goal.status === 'active';
    if (activeFilter === 'completed') return goal.status === 'completed';
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return styles.high;
      case 'medium': return styles.medium;
      case 'low': return styles.low;
      default: return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return styles.active;
      case 'completed': return styles.completed;
      case 'paused': return styles.paused;
      case 'failed': return styles.failed;
      default: return '';
    }
  };

  return (
    <div className={`${styles.panel} ${className || ''}`}>
      <div className={styles.panelHeader}>
        <h2><Icons.Goals /> Goals & Objectives {isLoading && '(loading...)'}</h2>
        <button onClick={handleExportGoals} style={{ padding: "4px 10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#94a3b8", fontSize: "11px", cursor: "pointer" }}><Icons.Download /> Export</button>
        <button className={styles.addBtn} onClick={() => setShowNewGoalForm(true)}>
          <Icons.Plus /> New Goal
        </button>
      </div>

      <div className={styles.panelContent}>
        {/* Agent scope indicator */}
        {!selectedAgent && agents.length > 0 && (
          <div className={styles.notice} style={{ background: 'rgba(1,166,188,0.08)', borderColor: 'rgba(1,166,188,0.2)', color: '#01A6BC' }}>
            Showing goals for all {agents.filter((a: any) => a.persisted).length} agents. Select an agent for single-agent view.
          </div>
        )}

        {/* New Goal Form */}
        {showNewGoalForm && (
          <div className={styles.newGoalForm}>
            {!selectedAgent && (
              <select
                value={createAgentId}
                onChange={(e) => setCreateAgentId(e.target.value)}
                className={styles.goalInput}
                style={{ marginBottom: 8 }}
              >
                <option value="">Select agent...</option>
                {agents.filter((a: any) => a.persisted).map((a: any) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            )}
            <input
              type="text"
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              placeholder="Enter goal description..."
              className={styles.goalInput}
            />
            <div className={styles.formActions}>
              <button onClick={handleCreateGoal} disabled={!newGoalTitle.trim() || isLoading || (!selectedAgent && !createAgentId)}>
                {isLoading ? 'Creating...' : 'Create Goal'}
              </button>
              <button onClick={() => setShowNewGoalForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        {error && <div className={styles.errorMessage}>{error}</div>}

        {/* Stats */}
        <div className={styles.statsBar}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{goals.filter(g => g.status === 'active').length}</span>
            <span className={styles.statLabel}>Active</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{goals.filter(g => g.status === 'completed').length}</span>
            <span className={styles.statLabel}>Completed</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{goals.filter(g => g.priority === 'high').length}</span>
            <span className={styles.statLabel}>High Priority</span>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filtersBar}>
          {(['all', 'active', 'completed'] as const).map(filter => (
            <button
              key={filter}
              className={`${styles.filterBtn} ${activeFilter === filter ? styles.active : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {/* Goals List */}
        <div className={styles.goalsList}>
          {filteredGoals.map(goal => (
            <div key={goal.id} className={styles.goalCard}>
              <div className={styles.goalHeader}>
                <div className={styles.goalTitleRow}>
                  <span className={`${styles.priorityBadge} ${getPriorityColor(goal.priority)}`}>
                    {goal.priority}
                  </span>
                  <h4>{goal.title}</h4>
                  {!selectedAgent && <span style={{ fontSize: 10, color: '#01A6BC', marginLeft: 6, opacity: 0.7 }}>{goal.agentName}</span>}
                </div>
                <span className={`${styles.statusBadge} ${getStatusColor(goal.status)}`}>
                  {goal.status}
                </span>
              </div>
              
              <p className={styles.goalDesc}>{goal.description}</p>
              
              <div className={styles.progressSection}>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
                <span className={styles.progressText}>{goal.progress}%</span>
              </div>

              {goal.subGoals.length > 0 && (
                <div className={styles.subGoals}>
                  <h5>Sub-goals</h5>
                  {goal.subGoals.map(sub => (
                    <div key={sub.id} className={styles.subGoal}>
                      <span className={`${styles.checkIcon} ${sub.completed ? styles.checked : ''}`}>
                        {sub.completed ? <Icons.CheckCircle /> : <Icons.XCircle />}
                      </span>
                      <span className={sub.completed ? styles.completed : ''}>{sub.title}</span>
                    </div>
                  ))}
                </div>
              )}

              {goal.deadline && (
                <div className={styles.deadline}>
                  <Icons.Clock /> Due: {goal.deadline.toLocaleDateString()}
                </div>
              )}

              <div className={styles.goalActions}>
                {goal.status === 'active' && (
                  <button className={styles.actionBtn} onClick={() => handleUpdateGoalStatus(goal.id, 'completed', goal.agentId)}>
                    <Icons.CheckCircle /> Complete
                  </button>
                )}
                {goal.status === 'active' && (
                  <button className={styles.actionBtn} onClick={() => handleUpdateGoalStatus(goal.id, 'paused', goal.agentId)}>
                    <Icons.Pause /> Pause
                  </button>
                )}
                {goal.status === 'paused' && (
                  <button className={styles.actionBtn} onClick={() => handleUpdateGoalStatus(goal.id, 'active', goal.agentId)}>
                    <Icons.Play /> Resume
                  </button>
                )}
                <button className={`${styles.actionBtn} ${styles.deleteAction}`} onClick={() => handleDeleteGoal(goal.id, goal.agentId)}>
                  <Icons.Trash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const GoalsPanel = memo(GoalsPanelComponent);
export default GoalsPanel;
