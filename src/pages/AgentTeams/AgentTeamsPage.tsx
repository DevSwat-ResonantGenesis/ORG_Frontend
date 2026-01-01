import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession } from '../../utils/auth';
import { canAccess, type Role } from '../../utils/permissions';
import logger from '../../utils/logger';
import {
  listAgentTeams,
  getAgentTeam,
  getTeamMembers,
  getTeamWorkflows,
  executeWorkflow,
  getWorkflowStatus,
  deleteAgentTeam,
  archiveAgentTeam,
  unarchiveAgentTeam,
  cancelWorkflow,
  type AgentTeam,
  type TeamMember,
  type AgentWorkflow,
} from '../../api/agentTeams';
import { listAgents, type AgentResponse } from '../../api/agents';
import { Button } from '../../components/ui';
import { useToastContext } from '../../context/ToastContext';
import Modal from '../../components/shared/Modal';
import { WorkflowExecutor } from './WorkflowExecutor';
import { ConversationView } from './ConversationView';
import styles from '../Help/HelpCenterPage.module.css';

const AgentTeamsPage: React.FC = () => {
  const navigate = useNavigate();
  const session = getSession();
  const userRole = session.role as Role | null;
  const toast = useToastContext();

  const [teams, setTeams] = useState<AgentTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<AgentTeam | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [availableAgents, setAvailableAgents] = useState<AgentResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modal states
  const [showExecuteModal, setShowExecuteModal] = useState(false);
  const [showConversationModal, setShowConversationModal] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState<AgentWorkflow | null>(null);
  
  // Team workflows state (to show active workflows)
  const [teamWorkflows, setTeamWorkflows] = useState<Record<string, AgentWorkflow[]>>({});

  const loadTeams = useCallback(async () => {
    if (!canAccess(userRole, 'predictions')) {
      navigate('/dashboard');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const teamsData = await listAgentTeams();
      setTeams(teamsData);
    } catch (err: unknown) {
      logger.error('Failed to load agent teams:', err);
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { status?: number; data?: { detail?: string } } }).response?.data?.detail
        : err && typeof err === 'object' && 'message' in err
        ? (err as { message: string }).message
        : 'Failed to load agent teams';
      setError(errorMessage as string);
      toast.error(errorMessage as string);
    } finally {
      setLoading(false);
    }
  }, [userRole, navigate, toast]);

  const loadAvailableAgents = useCallback(async () => {
    try {
      const agents = await listAgents();
      setAvailableAgents(agents);
    } catch (err: unknown) {
      logger.error('Failed to load agents:', err);
    }
  }, []);

  const loadTeamWorkflows = useCallback(async (teamId: string) => {
    try {
      // Get all workflows and filter for active ones (pending or running)
      const allWorkflows = await getTeamWorkflows(teamId);
      const activeWorkflows = allWorkflows.filter(wf => 
        wf.status === 'pending' || wf.status === 'running'
      );
      setTeamWorkflows(prev => ({
        ...prev,
        [teamId]: activeWorkflows
      }));
    } catch (err: unknown) {
      logger.error(`Failed to load workflows for team ${teamId}:`, err);
    }
  }, []);

  // Load active workflows for all teams
  useEffect(() => {
    if (teams.length > 0) {
      teams.forEach(team => {
        loadTeamWorkflows(team.id);
      });
    }
  }, [teams, loadTeamWorkflows]);

  // Auto-refresh active workflows every 10 seconds
  useEffect(() => {
    if (teams.length === 0) return;
    
    const interval = setInterval(() => {
      teams.forEach(team => {
        loadTeamWorkflows(team.id);
      });
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [teams, loadTeamWorkflows]);

  useEffect(() => {
    loadTeams();
    loadAvailableAgents();
  }, [loadTeams, loadAvailableAgents]);

  const handleTeamClick = async (teamId: string) => {
    try {
      const team = await getAgentTeam(teamId);
      const members = await getTeamMembers(teamId);
      setSelectedTeam(team);
      setTeamMembers(members);
    } catch (err: unknown) {
      logger.error(`Failed to load team ${teamId}:`, err);
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { status?: number; data?: { detail?: string } } }).response?.data?.detail
        : 'Failed to load team details';
      setError(errorMessage as string);
      toast.error(errorMessage as string);
    }
  };

  const handleExecuteWorkflow = async (inputData: Record<string, any>, projectId?: string) => {
    if (!selectedTeam) return;

    try {
      const workflow = await executeWorkflow(selectedTeam.id, {
        input_data: inputData,
        project_id: projectId,
      });
      setActiveWorkflow(workflow);
      setShowExecuteModal(false);
      setShowConversationModal(true);
      
      // Poll for workflow status
      pollWorkflowStatus(workflow.id);
    } catch (err: unknown) {
      logger.error('Failed to execute workflow:', err);
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { status?: number; data?: { detail?: string } } }).response?.data?.detail
        : 'Failed to execute workflow';
      setError(errorMessage as string);
      toast.error(errorMessage as string);
    }
  };

  const pollWorkflowStatus = async (workflowId: string) => {
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;
    
    const poll = async () => {
      try {
        const status = await getWorkflowStatus(workflowId);
        
        if (status.status === 'completed' || status.status === 'failed') {
          // Workflow finished
          return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000); // Poll every 5 seconds
        }
      } catch (err: unknown) {
        logger.error('Failed to poll workflow status:', err);
      }
    };
    
    poll();
  };

  const handleArchiveTeam = async (teamId: string, teamName: string) => {
    if (!window.confirm(`Are you sure you want to archive "${teamName}"? Archived teams can be restored later.`)) {
      return;
    }

    try {
      await archiveAgentTeam(teamId);
      toast.success('Team archived successfully');
      loadTeams(); // Reload the list
    } catch (err: unknown) {
      logger.error('Failed to archive team:', err);
      let errorMessage = 'Failed to archive team';
      
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { status?: number; data?: { detail?: string; message?: string } } }).response;
        if (response?.status === 404) {
          errorMessage = 'Team not found. It may have already been deleted.';
        } else if (response?.status === 403) {
          errorMessage = 'You do not have permission to archive this team.';
        } else {
          errorMessage = response?.data?.detail || response?.data?.message || errorMessage;
        }
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = (err as { message: string }).message;
      }
      
      toast.error(errorMessage);
    }
  };

  const handleUnarchiveTeam = async (teamId: string, teamName: string) => {
    if (!window.confirm(`Are you sure you want to restore "${teamName}"?`)) {
      return;
    }

    try {
      await unarchiveAgentTeam(teamId);
      toast.success('Team restored successfully');
      loadTeams(); // Reload the list
    } catch (err: unknown) {
      logger.error('Failed to unarchive team:', err);
      let errorMessage = 'Failed to restore team';
      
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { status?: number; data?: { detail?: string; message?: string } } }).response;
        if (response?.status === 404) {
          errorMessage = 'Team not found.';
        } else if (response?.status === 400) {
          errorMessage = response?.data?.detail || 'Team is not archived.';
        } else if (response?.status === 403) {
          errorMessage = 'You do not have permission to restore this team.';
        } else {
          errorMessage = response?.data?.detail || response?.data?.message || errorMessage;
        }
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = (err as { message: string }).message;
      }
      
      toast.error(errorMessage);
    }
  };

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    const confirmMessage = `⚠️ WARNING: Are you sure you want to PERMANENTLY DELETE "${teamName}"?\n\nThis action cannot be undone. All team data will be lost.\n\nConsider archiving instead if you might need this team later.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await deleteAgentTeam(teamId, false);
      toast.success('Team deleted successfully');
      loadTeams(); // Reload the list
    } catch (err: unknown) {
      logger.error('Failed to delete team:', err);
      let errorMessage = 'Failed to delete team';
      let hasActiveWorkflows = false;
      
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { status?: number; data?: { detail?: string; message?: string } } }).response;
        if (response?.status === 404) {
          errorMessage = 'Team not found. It may have already been deleted.';
        } else if (response?.status === 405) {
          errorMessage = 'Delete operation not supported. The backend may not have a delete endpoint yet.';
        } else if (response?.status === 400) {
          const detail = response?.data?.detail || '';
          hasActiveWorkflows = detail.includes('active workflow');
          errorMessage = detail || 'Cannot delete team with active workflows.';
          
          // If there are active workflows, offer to cancel them
          if (hasActiveWorkflows && window.confirm(
            `${errorMessage}\n\nWould you like to cancel all active workflows and delete the team?`
          )) {
            try {
              await deleteAgentTeam(teamId, true); // Cancel workflows and delete
              toast.success('Active workflows cancelled and team deleted successfully');
              loadTeams();
              return;
            } catch (cancelErr) {
              const cancelErrorMsg = cancelErr && typeof cancelErr === 'object' && 'response' in cancelErr
                ? (cancelErr as { response?: { data?: { detail?: string } } }).response?.data?.detail
                : 'Failed to cancel workflows and delete team';
              toast.error(cancelErrorMsg || 'Failed to cancel workflows and delete team');
              return;
            }
          }
        } else if (response?.status === 403) {
          errorMessage = 'You do not have permission to delete this team.';
        } else {
          errorMessage = response?.data?.detail || response?.data?.message || errorMessage;
        }
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = (err as { message: string }).message;
      }
      
      if (!hasActiveWorkflows) {
        toast.error(errorMessage);
      }
    }
  };

  const filteredTeams = teams.filter(team => {
    const matchesStatus = statusFilter === 'all' || team.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading && teams.length === 0) {
    return (
      <div className={styles.helpCenterPage}>
        <div className={styles.container}>
          <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            Loading agent teams...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.helpCenterPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Agent Teams</h1>
          <p className={styles.subtitle}>
            Create and manage teams of AI agents to work together on complex tasks.
          </p>
        </div>

        <div className={styles.contentBody}>
          <div className={styles.contentMain}>
            
            {/* Overview Stats */}
            <section className={styles.contentSection}>
              <h2>Overview</h2>
              <div className={styles.articleGrid}>
                <div className={styles.articleCard} style={{cursor: 'default'}}>
                  <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: 'var(--color-primary-500)' }}>
                    {teams.length}
                  </div>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>Total Teams</div>
                </div>
                <div className={styles.articleCard} style={{cursor: 'default'}}>
                  <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: 'var(--color-success-500)' }}>
                    {teams.filter(t => t.status === 'active').length}
                  </div>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>Active Teams</div>
                </div>
                <div className={styles.articleCard} style={{cursor: 'default'}}>
                  <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: 'var(--color-primary-500)' }}>
                    {teams.reduce((sum, team) => sum + team.member_count, 0)}
                  </div>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>Total Agents</div>
                </div>
              </div>
            </section>

            {/* Filters */}
            <section className={styles.contentSection}>
              <h2>Search & Filter</h2>
              <div className={styles.articleCard} style={{cursor: 'default'}}>
                <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginBottom: '4px' }}>Search</div>
                    <input
                      type="text"
                      placeholder="Search teams..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: 'var(--space-2) var(--space-3)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        fontSize: 'var(--font-sm)'
                      }}
                    />
                  </div>
                  <div style={{ flex: '0 0 200px' }}>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginBottom: '4px' }}>Status</div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={{
                        width: '100%',
                        padding: 'var(--space-2) var(--space-3)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        fontSize: 'var(--font-sm)'
                      }}
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* Teams List */}
            <section className={styles.contentSection}>
              <h2>All Teams</h2>
              {filteredTeams.length === 0 ? (
                <div className={styles.articleCard} style={{cursor: 'default', textAlign: 'center', padding: 'var(--space-8)' }}>
                  <p>No teams found matching your criteria.</p>
                  {teams.length === 0 && (
                    <Button variant="primary" size="md" onClick={() => navigate('/agent-teams/create')} style={{ marginTop: 'var(--space-4)' }}>
                      Create Your First Team
                    </Button>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {filteredTeams.map((team) => (
                    <div 
                      key={team.id} 
                      className={styles.articleCard}
                      style={{ 
                        cursor: 'pointer',
                        borderLeft: `4px solid ${team.status === 'active' ? 'var(--color-success-500)' : 'var(--border-color)'}`
                      }}
                      onClick={() => handleTeamClick(team.id)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                        <div>
                          <div style={{ fontSize: 'var(--font-md)', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {team.name}
                          </div>
                          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {team.status} • {team.member_count} agents • {team.workflow_config?.type || 'sequential'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/agent-teams/${team.id}/dashboard`);
                            }}
                            variant="primary"
                            size="sm"
                          >
                            Dashboard
                          </Button>
                          {selectedTeam?.id === team.id && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowExecuteModal(true);
                              }}
                              variant="secondary"
                              size="sm"
                            >
                              Execute
                            </Button>
                          )}
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/agent-teams/${team.id}/edit`);
                            }}
                            variant="secondary"
                            size="sm"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              team.status === 'archived' 
                                ? handleUnarchiveTeam(team.id, team.name)
                                : handleArchiveTeam(team.id, team.name);
                            }}
                            variant="secondary"
                            size="sm"
                          >
                            {team.status === 'archived' ? 'Restore' : 'Archive'}
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTeam(team.id, team.name);
                            }}
                            variant="danger"
                            size="sm"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                      
                      {team.description && (
                        <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                          {team.description}
                        </div>
                      )}

                      {teamWorkflows[team.id] && teamWorkflows[team.id].length > 0 && (
                        <div style={{ 
                          marginTop: 'var(--space-2)',
                          padding: 'var(--space-2)',
                          background: 'var(--color-warning-100)',
                          borderRadius: 'var(--radius-sm)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-warning-700)', fontWeight: 600 }}>
                            ⚠️ {teamWorkflows[team.id].length} active workflow(s)
                          </div>
                          <Button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const workflowList = teamWorkflows[team.id]
                                .map(wf => `  • Workflow ${wf.id.slice(0, 8)}... (${wf.status})`)
                                .join('\n');
                              if (window.confirm(
                                `Cancel ${teamWorkflows[team.id].length} active workflow(s) for "${team.name}"?\n\n${workflowList}\n\nThis will stop all running workflows.`
                              )) {
                                try {
                                  await Promise.all(
                                    teamWorkflows[team.id].map(wf => cancelWorkflow(wf.id))
                                  );
                                  toast.success(`Cancelled ${teamWorkflows[team.id].length} workflow(s)`);
                                  loadTeamWorkflows(team.id);
                                  loadTeams();
                                } catch (err) {
                                  logger.error('Failed to cancel workflows:', err);
                                  toast.error('Failed to cancel some workflows');
                                }
                              }
                            }}
                            variant="secondary"
                            size="sm"
                            style={{ padding: '2px 8px', height: 'auto', fontSize: '11px' }}
                          >
                            Cancel All
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>

          <div className={styles.contentSidebar}>
            <div className={styles.sidebarCard}>
              <h3>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <Button onClick={() => navigate('/agent-teams/create')} variant="primary" size="sm" fullWidth>
                  Create Team
                </Button>
                <Button onClick={() => navigate('/agents')} variant="secondary" size="sm" fullWidth>
                  View Agents
                </Button>
              </div>
            </div>

            <div className={styles.sidebarCard}>
              <h3>Help</h3>
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                Agent teams allow you to chain multiple agents together to solve complex tasks.
              </p>
              <ul style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', paddingLeft: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
                <li>Sequential: Output of one agent becomes input for the next</li>
                <li>Parallel: Agents run simultaneously on the same input</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {showExecuteModal && selectedTeam && (
        <Modal
          open={showExecuteModal}
          onClose={() => setShowExecuteModal(false)}
          size="large"
        >
          <WorkflowExecutor
            team={selectedTeam}
            onExecute={handleExecuteWorkflow}
            onClose={() => setShowExecuteModal(false)}
          />
        </Modal>
      )}

      {showConversationModal && activeWorkflow && (
        <Modal
          open={showConversationModal}
          onClose={() => setShowConversationModal(false)}
          size="large"
        >
          <ConversationView
            workflowId={activeWorkflow.id}
            onClose={() => setShowConversationModal(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default AgentTeamsPage;

