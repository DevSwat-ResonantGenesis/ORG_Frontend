import React, { memo, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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

  // Load session steps when session changes + auto-poll when running/waiting
  useEffect(() => {
    if (selectedSession?.id) {
      loadSessionSteps(selectedSession.id);
    } else {
      setSessionSteps([]);
    }

    // Auto-poll every 2s while session is active
    const isActive = selectedSession?.status === 'running' || selectedSession?.status === 'waiting_approval' || selectedSession?.status === 'initializing';
    if (!isActive || !selectedSession?.id) return;

    const interval = setInterval(async () => {
      try {
        const fresh = await agentEngine.getSession(selectedSession.id);
        setSelectedSession(fresh);
        setSessions(prev => prev.map(s => s.id === fresh.id ? fresh : s));
        const steps = await agentEngine.getSessionSteps(selectedSession.id);
        setSessionSteps(steps);
      } catch { /* ignore poll errors */ }
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedSession?.id, selectedSession?.status]);

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
        <div className={styles.headerActions}>
          <button onClick={handleExportSessions} className={styles.iconBtn} title="Export sessions"><Icons.Download /></button>
          <button onClick={() => setShowNewSession(true)} className={styles.iconBtn} title="New session"><Icons.Plus /></button>
        </div>
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
                <div style={{ display: 'flex', gap: 8, padding: '2px 0 0', fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>
                  {session.created_at && <span><Icons.Clock /> {new Date(session.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>}
                  {session.completed_at && <span>→ {new Date(session.completed_at).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>}
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

                {/* Session timestamps */}
                <div style={{ display: 'flex', gap: 12, padding: '4px 8px', fontSize: 10, color: 'rgba(255,255,255,0.4)', flexWrap: 'wrap' }}>
                  {selectedSession.created_at && <span>Started: {new Date(selectedSession.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>}
                  {selectedSession.completed_at && <span>Completed: {new Date(selectedSession.completed_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>}
                </div>

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
                    <div className={styles.finalOutputBody}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => <h1 className={styles.foH1}>{children}</h1>,
                          h2: ({ children }) => <h2 className={styles.foH2}>{children}</h2>,
                          h3: ({ children }) => <h3 className={styles.foH3}>{children}</h3>,
                          h4: ({ children }) => <h4 className={styles.foH4}>{children}</h4>,
                          p: ({ children }) => <p className={styles.foParagraph}>{children}</p>,
                          strong: ({ children }) => <strong className={styles.foStrong}>{children}</strong>,
                          em: ({ children }) => <em className={styles.foEm}>{children}</em>,
                          ul: ({ children }) => <ul className={styles.foList}>{children}</ul>,
                          ol: ({ children }) => <ol className={styles.foListOrdered}>{children}</ol>,
                          li: ({ children }) => <li className={styles.foListItem}>{children}</li>,
                          blockquote: ({ children }) => <blockquote className={styles.foBlockquote}>{children}</blockquote>,
                          code: ({ children, className: codeClassName }) => {
                            const isBlock = codeClassName?.includes('language-');
                            return isBlock
                              ? <pre className={styles.foCodeBlock}><code>{children}</code></pre>
                              : <code className={styles.foInlineCode}>{children}</code>;
                          },
                          hr: () => <hr className={styles.foDivider} />,
                          a: ({ href, children }) => <a href={href} className={styles.foLink} target="_blank" rel="noopener noreferrer">{children}</a>,
                          table: ({ children }) => <div className={styles.foTableWrap}><table className={styles.foTable}>{children}</table></div>,
                          thead: ({ children }) => <thead className={styles.foThead}>{children}</thead>,
                          th: ({ children }) => <th className={styles.foTh}>{children}</th>,
                          td: ({ children }) => <td className={styles.foTd}>{children}</td>,
                        }}
                      >
                        {selectedSession.final_output}
                      </ReactMarkdown>
                    </div>
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
