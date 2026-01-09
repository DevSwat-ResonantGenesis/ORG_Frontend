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
  const [error, setError] = useState<string | null>(null);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [showNewGoalForm, setShowNewGoalForm] = useState(false);

  // Fetch goals from backend
  const fetchGoals = useCallback(async () => {
    if (!selectedAgent?.id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fastapiClient.get(`/agents/goals/${selectedAgent.id}`);
      const backendGoals = (response.data || []).map((g: any) => ({
        id: g.id,
        title: g.description?.substring(0, 50) || 'Unnamed Goal',
        description: g.description || '',
        priority: g.priority || 'medium',
        status: g.status || 'active',
        progress: g.progress || 0,
        deadline: g.deadline ? new Date(g.deadline) : undefined,
        agentId: selectedAgent.id,
        subGoals: g.sub_goals?.map((sg: any) => ({
          id: sg.id,
          title: sg.description,
          completed: sg.status === 'completed'
        })) || []
      }));
      setGoals(backendGoals);
    } catch (err: any) {
      console.error('Failed to fetch goals:', err);
      // Fall back to empty array - goals will be created as needed
      setGoals([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAgent?.id]);

  // Create new goal
  const handleCreateGoal = useCallback(async () => {
    if (!selectedAgent?.id || !newGoalTitle.trim()) return;
    
    setIsLoading(true);
    try {
      await fastapiClient.post(`/agents/goals/${selectedAgent.id}/assign`, {
        description: newGoalTitle,
        priority: 'medium',
        status: 'active'
      });
      setNewGoalTitle('');
      setShowNewGoalForm(false);
      fetchGoals();
    } catch (err: any) {
      setError(err.message || 'Failed to create goal');
    } finally {
      setIsLoading(false);
    }
  }, [selectedAgent?.id, newGoalTitle, fetchGoals]);

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
        <button className={styles.addBtn} onClick={() => setShowNewGoalForm(true)} disabled={!selectedAgent}>
          <Icons.Plus /> New Goal
        </button>
      </div>

      <div className={styles.panelContent}>
        {/* Agent Selection Notice */}
        {!selectedAgent && (
          <div className={styles.notice}>Select an agent to view and manage goals</div>
        )}

        {/* New Goal Form */}
        {showNewGoalForm && selectedAgent && (
          <div className={styles.newGoalForm}>
            <input
              type="text"
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              placeholder="Enter goal description..."
              className={styles.goalInput}
            />
            <div className={styles.formActions}>
              <button onClick={handleCreateGoal} disabled={!newGoalTitle.trim() || isLoading}>
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
                <button className={styles.actionBtn}><Icons.Edit /> Edit</button>
                {goal.status === 'active' && (
                  <button className={styles.actionBtn}><Icons.Pause /> Pause</button>
                )}
                {goal.status === 'paused' && (
                  <button className={styles.actionBtn}><Icons.Play /> Resume</button>
                )}
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
