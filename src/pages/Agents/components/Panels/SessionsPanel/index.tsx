import React, { memo, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgentStore, selectSelectedAgent } from '../../../../../stores';
import { Icons } from '../../shared/Icons';
import * as agentEngine from '../../../../../api/agentEngine';
import type { AgentSession, AgentStep } from '../../../../../api/agentEngine';
import styles from './SessionsPanel.module.css';

// ============== SESSIONS PANEL ==============
// Manages agent sessions - start, view, stop sessions

interface SessionsPanelProps {
  className?: string;
}

const SessionsPanelComponent: React.FC<SessionsPanelProps> = ({ className }) => {
  const selectedAgent = useAgentStore(selectSelectedAgent);
  
  const [sessions, setSessions] = useState<AgentSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<AgentSession | null>(null);
  const [sessionSteps, setSessionSteps] = useState<AgentStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // New session form
  const [showNewSession, setShowNewSession] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [startingSession, setStartingSession] = useState(false);
  const [creditActionUrl, setCreditActionUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleExportSessions = () => {
    const exportData = { exported_at: new Date().toISOString(), sessions };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sessions-' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Load sessions when agent changes
  useEffect(() => {
    if (selectedAgent?.id) {
      loadSessions(selectedAgent.id);
    } else {
      setSessions([]);
      setSelectedSession(null);
    }
  }, [selectedAgent?.id]);

  // Load session steps when session changes
  useEffect(() => {
    if (selectedSession?.id) {
      loadSessionSteps(selectedSession.id);
    } else {
      setSessionSteps([]);
    }
  }, [selectedSession?.id]);

  const loadSessions = async (agentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await agentEngine.listSessions(agentId);
      setSessions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load sessions');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionSteps = async (sessionId: string) => {
    try {
      const steps = await agentEngine.getSessionSteps(sessionId);
      setSessionSteps(steps);
    } catch (err) {
      setSessionSteps([]);
    }
  };

  const handleStartSession = async () => {
    if (!selectedAgent?.id || !newGoal.trim()) return;

    if (selectedAgent.persisted === false) {
      setError('This agent is not persisted on the server, so it cannot run sessions. Create the agent on the server first.');
      return;
    }
    
    setStartingSession(true);
    setError(null);
    try {
      const session = await agentEngine.startSession(selectedAgent.id, newGoal.trim());
      setSessions(prev => [session, ...prev]);
      setSelectedSession(session);
      setNewGoal('');
      setShowNewSession(false);
    } catch (err: any) {
      const is402 = err?.response?.status === 402 || err?.status === 402;
      if (is402) {
        const data = err?.response?.data || err;
        const actionUrl = data?.action_url || '/pricing';
        setError(`${data?.message || 'Credits exhausted.'} Go to ${actionUrl === '/pricing' ? 'Pricing' : 'Billing'} to get more credits.`);
        setCreditActionUrl(actionUrl);
      } else {
        setError(err.message || 'Failed to start session');
        setCreditActionUrl(null);
      }
    } finally {
      setStartingSession(false);
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    try {
      await agentEngine.cancelSession(sessionId);
      setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, status: 'cancelled' as const } : s
      ));
      if (selectedSession?.id === sessionId) {
        setSelectedSession(prev => prev ? { ...prev, status: 'cancelled' as const } : null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to cancel session');
    }
  };

  const handleApproveStep = async (stepId: string, approved: boolean) => {
    if (!selectedSession?.id) return;
    try {
      await agentEngine.approveStep(selectedSession.id, stepId, approved);
      // Refresh steps
      loadSessionSteps(selectedSession.id);
    } catch (err: any) {
      setError(err.message || 'Failed to approve step');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'var(--color-success)';
      case 'completed': return 'var(--color-info)';
      case 'failed': return 'var(--color-error)';
      case 'paused': case 'waiting_approval': return 'var(--color-warning)';
      default: return 'var(--color-text-secondary)';
    }
  };

  const getStepIcon = (stepType: string) => {
    switch (stepType) {
      case 'think': return <Icons.Brain />;
      case 'tool_call': return <Icons.Tool />;
      case 'respond': return <Icons.MessageSquare />;
      default: return <Icons.Circle />;
    }
  };

  if (!selectedAgent) {
    return (
      <div className={`${styles.panel} ${className || ''}`}>
        <div className={styles.emptyState}>
          <Icons.User />
          <p>Select an agent to manage sessions</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.panel} ${className || ''}`}>
      <div className={styles.panelHeader}>
        <h2><Icons.Play /> Sessions - {selectedAgent.name}</h2>
        <button onClick={handleExportSessions} style={{ padding: "4px 10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#94a3b8", fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}><Icons.Download /> Export</button>
        <button 
          className={styles.newSessionBtn}
          onClick={() => setShowNewSession(true)}
        >
          <Icons.Plus /> New Session
        </button>
      </div>

      <div className={styles.statsBar}>
        <span><strong>{sessions.length}</strong> Total</span>
        <span><strong>{sessions.filter(s => s.status === 'running').length}</strong> Running</span>
        <span><strong>{sessions.filter(s => s.status === 'completed').length}</strong> Completed</span>
        <span><strong>{sessions.reduce((sum, s) => sum + (s.total_tokens_used || 0), 0).toLocaleString()}</strong> Tokens</span>
      </div>

      {error && (
        <div className={styles.errorBanner} style={creditActionUrl ? { cursor: 'pointer' } : undefined} onClick={creditActionUrl ? () => navigate(creditActionUrl) : undefined}>
          <Icons.AlertTriangle /> {error}
          {creditActionUrl && <span style={{ textDecoration: 'underline', marginLeft: 8 }}>Go to {creditActionUrl === '/pricing' ? 'Pricing' : 'Billing'} →</span>}
          <button onClick={(e) => { e.stopPropagation(); setError(null); setCreditActionUrl(null); }}>×</button>
        </div>
      )}

      {/* New Session Form */}
      {showNewSession && (
        <div className={styles.newSessionForm}>
          <h3>Start New Session</h3>
          <div className={styles.formGroup}>
            <label>Goal / Task</label>
            <textarea
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="Describe what you want the agent to accomplish..."
              rows={3}
            />
          </div>
          <div className={styles.formActions}>
            <button 
              className={styles.cancelBtn}
              onClick={() => setShowNewSession(false)}
            >
              Cancel
            </button>
            <button 
              className={styles.startBtn}
              onClick={handleStartSession}
              disabled={!newGoal.trim() || startingSession}
            >
              {startingSession ? 'Starting...' : 'Start Session'}
            </button>
          </div>
        </div>
      )}

      <div className={styles.panelContent}>
        <div className={styles.splitView}>
          {/* Sessions List */}
          <div className={styles.sessionsList}>
            <h3>Sessions ({sessions.length})</h3>
            {loading && <div className={styles.loading}>Loading...</div>}
            {!loading && sessions.length === 0 && (
              <div className={styles.noSessions}>
                <p>No sessions yet</p>
                <p className={styles.hint}>Start a new session to run this agent</p>
              </div>
            )}
            {sessions.map(session => (
              <div 
                key={session.id}
                className={`${styles.sessionCard} ${selectedSession?.id === session.id ? styles.selected : ''}`}
                onClick={() => setSelectedSession(session)}
              >
                <div className={styles.sessionHeader}>
                  <span 
                    className={styles.statusIndicator}
                    style={{ background: getStatusColor(session.status) }}
                  />
                  <span className={styles.sessionStatus}>{session.status}</span>
                  {session.status === 'running' && (
                    <button 
                      className={styles.cancelSessionBtn}
                      onClick={(e) => { e.stopPropagation(); handleCancelSession(session.id); }}
                    >
                      <Icons.X />
                    </button>
                  )}
                </div>
                <p className={styles.sessionGoal}>{session.current_goal || 'No goal set'}</p>
                <div className={styles.sessionMeta}>
                  <span><Icons.Repeat /> {session.loop_count} loops</span>
                  <span><Icons.Zap /> {session.total_tokens_used} tokens</span>
                </div>
              </div>
            ))}
          </div>

          {/* Session Detail / Steps */}
          <div className={styles.sessionDetail}>
            {selectedSession ? (
              <>
                <div className={styles.detailHeader}>
                  <h3>Session Steps</h3>
                  <span 
                    className={styles.statusBadge}
                    style={{ background: getStatusColor(selectedSession.status) }}
                  >
                    {selectedSession.status}
                  </span>
                </div>
                
                {selectedSession.current_goal && (
                  <div className={styles.goalDisplay}>
                    <strong>Goal:</strong> {selectedSession.current_goal}
                  </div>
                )}

                <div className={styles.stepsList}>
                  {sessionSteps.length === 0 && (
                    <div className={styles.noSteps}>
                      <p>No steps executed yet</p>
                    </div>
                  )}
                  {sessionSteps.map(step => (
                    <div 
                      key={step.id}
                      className={`${styles.stepCard} ${step.required_approval ? styles.needsApproval : ''}`}
                    >
                      <div className={styles.stepHeader}>
                        <span className={styles.stepIcon}>{getStepIcon(step.step_type)}</span>
                        <span className={styles.stepNumber}>Step {step.step_number}</span>
                        <span className={styles.stepType}>{step.step_type}</span>
                        {step.duration_ms && (
                          <span className={styles.stepDuration}>{step.duration_ms}ms</span>
                        )}
                      </div>
                      
                      {step.reasoning && (
                        <div className={styles.stepReasoning}>
                          <strong>Reasoning:</strong> {step.reasoning}
                        </div>
                      )}
                      
                      {step.tool_name && (
                        <div className={styles.stepTool}>
                          <strong>Tool:</strong> {step.tool_name}
                          {step.tool_input && (
                            <pre>{JSON.stringify(step.tool_input, null, 2)}</pre>
                          )}
                        </div>
                      )}

                      {step.step_type === 'respond' && step.output_data?.response && (
                        <div className={styles.stepReasoning} style={{ marginTop: '8px', borderLeft: '3px solid var(--color-success)', paddingLeft: '12px' }}>
                          <strong>Response:</strong> {String(step.output_data.response)}
                        </div>
                      )}

                      {!step.safety_check_passed && step.safety_violations && (
                        <div className={styles.safetyWarning}>
                          <Icons.AlertTriangle />
                          <span>Safety violations: {step.safety_violations.join(', ')}</span>
                        </div>
                      )}

                      {step.required_approval && step.approval_status === 'pending' && (
                        <div className={styles.approvalActions}>
                          <span>Approval required:</span>
                          <button 
                            className={styles.approveBtn}
                            onClick={() => handleApproveStep(step.id, true)}
                          >
                            <Icons.Check /> Approve
                          </button>
                          <button 
                            className={styles.rejectBtn}
                            onClick={() => handleApproveStep(step.id, false)}
                          >
                            <Icons.X /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {selectedSession.final_output && (
                  <div className={styles.finalOutput}>
                    <h4>Final Output</h4>
                    <p>{selectedSession.final_output}</p>
                  </div>
                )}

                {selectedSession.error_message && (
                  <div className={styles.errorOutput}>
                    <h4>Error</h4>
                    <p>{selectedSession.error_message}</p>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.noSelection}>
                <Icons.MousePointer />
                <p>Select a session to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const SessionsPanel = memo(SessionsPanelComponent);
export default SessionsPanel;
