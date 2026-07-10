import React, { memo, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAgentStore, selectSelectedAgent } from '../../../../../stores';
import { Icons } from '../../shared/Icons';
import * as agentEngine from '../../../../../api/agentEngine';
import type { AgentSession, AgentStep } from '../../../../../api/agentEngine';
import { extractAgentAudioUrls as extractAudioUrls } from '../../../../../utils/agentAudioUrl';
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

  // Follow-up chat state
  const [followUpInput, setFollowUpInput] = useState('');
  const [followUpMessages, setFollowUpMessages] = useState<Array<{ role: 'user' | 'agent'; content: string; timestamp: Date }>>([]);
  const [isSendingFollowUp, setIsSendingFollowUp] = useState(false);

  // Follow-up: send a new message as a continuation session
  const handleSendFollowUp = useCallback(async () => {
    // Follow-up continues the CURRENTLY VIEWED session (with full prior
    // context/tool results) — it previously called startSession() with the
    // follow-up text as a brand-new unrelated goal, which discarded
    // everything the agent already did and made it start over from scratch.
    if (!selectedSession?.id || !followUpInput.trim() || isSendingFollowUp) return;
    const content = followUpInput.trim();
    setFollowUpMessages(prev => [...prev, { role: 'user', content, timestamp: new Date() }]);
    setFollowUpInput('');
    setIsSendingFollowUp(true);
    try {
      const newSession = await agentEngine.continueSession(selectedSession.id, content);
      const maxWait = 90_000;
      const pollInterval = 2000;
      const start = Date.now();
      let finalSession = newSession;
      while (Date.now() - start < maxWait) {
        await new Promise(r => setTimeout(r, pollInterval));
        try {
          finalSession = await agentEngine.getSession(newSession.id);
          if (finalSession.status === 'completed' || finalSession.status === 'failed') break;
        } catch { /* keep polling */ }
      }
      const outputText = finalSession.status === 'completed'
        ? (finalSession.final_output || 'Task completed.')
        : finalSession.status === 'failed'
        ? (finalSession.error_message || 'Task failed.')
        : `Task is still ${finalSession.status}.`;
      setFollowUpMessages(prev => [...prev, { role: 'agent', content: outputText, timestamp: new Date() }]);
      // The follow-up ran as a new (context-carrying) session — select it so
      // its steps/audio render in the main panel too, not just this chat log.
      setSelectedSession(finalSession);
      loadSessionSteps(finalSession.id);
      if (selectedAgent) {
        const updated = await agentEngine.listSessions(selectedAgent.id);
        setSessions(updated);
      }
    } catch (err: any) {
      setFollowUpMessages(prev => [...prev, { role: 'agent', content: `Error: ${err.message || 'Failed'}`, timestamp: new Date() }]);
    } finally {
      setIsSendingFollowUp(false);
    }
  }, [selectedSession, selectedAgent, followUpInput, isSendingFollowUp]);

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

  const [continuingSession, setContinuingSession] = useState(false);

  const handleContinueSession = async (sessionId: string) => {
    setContinuingSession(true);
    try {
      const newSession = await agentEngine.continueSession(sessionId);
      if (selectedAgent?.id) await loadSessions(selectedAgent.id);
      setSelectedSession(newSession);
      loadSessionSteps(newSession.id);
    } catch (err: any) {
      setError(err.message || 'Failed to continue session');
    } finally {
      setContinuingSession(false);
    }
  };

  const handleApproveStep = async (stepId: string, approved: boolean, sessionIdOverride?: string) => {
    const sessionId = sessionIdOverride || selectedSession?.id;
    if (!sessionId) return;
    try {
      // If no stepId, fetch fresh steps to find the pending one
      let resolvedStepId = stepId;
      if (!resolvedStepId) {
        const freshSteps = await agentEngine.getSessionSteps(sessionId);
        const pending = freshSteps.find((s: any) => s.approval_status === 'pending');
        if (pending) resolvedStepId = pending.id;
      }
      if (!resolvedStepId) {
        setError('No pending step found to approve');
        return;
      }
      await agentEngine.approveStep(sessionId, resolvedStepId, approved);
      // Refresh steps + sessions
      loadSessionSteps(sessionId);
      if (selectedAgent?.id) loadSessions(selectedAgent.id);
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
                onClick={() => { setSelectedSession(session); setFollowUpMessages([]); setFollowUpInput(''); }}
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
                  {session.status === 'waiting_approval' && (
                    <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
                      <button
                        style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSession(session as any);
                          handleApproveStep('', true, session.id);
                        }}
                      >
                        Approve
                      </button>
                      <button
                        style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSession(session as any);
                          handleApproveStep('', false, session.id);
                        }}
                      >
                        Reject
                      </button>
                    </div>
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

                {/* Session-level approval banner */}
                {selectedSession.status === 'waiting_approval' && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', margin: '8px 0',
                    background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8,
                    fontSize: 13, color: '#f59e0b',
                  }}>
                    <Icons.AlertTriangle />
                    <span style={{ flex: 1, fontWeight: 600 }}>This session requires your approval to continue</span>
                    <button
                      style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                      onClick={() => {
                        const pendingStep = sessionSteps.find(s => s.approval_status === 'pending');
                        if (pendingStep) handleApproveStep(pendingStep.id, true);
                        else {
                          // Fetch fresh steps to find the pending one
                          agentEngine.getSessionSteps(selectedSession.id).then(steps => {
                            const ps = steps.find((s: any) => s.approval_status === 'pending');
                            if (ps) handleApproveStep(ps.id, true);
                          });
                        }
                      }}
                    >
                      ✓ Approve
                    </button>
                    <button
                      style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                      onClick={() => {
                        const pendingStep = sessionSteps.find(s => s.approval_status === 'pending');
                        if (pendingStep) handleApproveStep(pendingStep.id, false);
                        else {
                          agentEngine.getSessionSteps(selectedSession.id).then(steps => {
                            const ps = steps.find((s: any) => s.approval_status === 'pending');
                            if (ps) handleApproveStep(ps.id, false);
                          });
                        }
                      }}
                    >
                      ✕ Reject
                    </button>
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
                          <strong>Response:</strong>{' '}
                          {typeof step.output_data.response === 'object'
                            ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{JSON.stringify(step.output_data.response, null, 2)}</ReactMarkdown>
                            : <ReactMarkdown remarkPlugins={[remarkGfm]}>{String(step.output_data.response)}</ReactMarkdown>
                          }
                        </div>
                      )}

                      {step.output_data?.output && (
                        <div style={{ marginTop: '8px', borderLeft: '3px solid #01A6BC', paddingLeft: '12px', fontSize: '13px', lineHeight: '1.6' }}>
                          {step.output_data.federated && (
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                              {(step.output_data.tools_used as string[] || []).map((t: string) => (
                                <span key={t} style={{ background: 'rgba(1,166,188,0.12)', color: '#01A6BC', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{t}</span>
                              ))}
                              {step.output_data.duration_ms && (
                                <span style={{ background: 'rgba(250,165,37,0.12)', color: '#FAA525', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{String(step.output_data.duration_ms)}ms</span>
                              )}
                            </div>
                          )}
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {String(step.output_data.output)}
                          </ReactMarkdown>
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
                      {extractAudioUrls(selectedSession.final_output).map((url) => (
                        <div key={url} className={styles.audioResult}>
                          <audio controls src={url} className={styles.audioPlayer}>
                            Your browser does not support inline audio playback.
                          </audio>
                          <a href={url} download className={styles.audioDownloadBtn}>
                            <Icons.Download /> Download MP3
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSession.error_message && (
                  <div className={styles.errorOutput}>
                    <h4>Error</h4>
                    <p>{selectedSession.error_message}</p>
                  </div>
                )}

                {/* Continue — resumes as a NEW session seeded with this one's full
                    step history, instead of starting over from scratch. Shown for
                    any finished session, whether it hit a loop/token/time limit,
                    failed, or was cancelled. */}
                {['completed', 'failed', 'cancelled'].includes(selectedSession.status) && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, padding: '10px 14px',
                    background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 8,
                  }}>
                    <span style={{ flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
                      Ran out of loops or stopped early? Continue picks up with the full context of everything this session already did.
                    </span>
                    <button
                      disabled={continuingSession}
                      onClick={() => handleContinueSession(selectedSession.id)}
                      style={{
                        background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6,
                        padding: '7px 16px', fontSize: 13, fontWeight: 700,
                        cursor: continuingSession ? 'wait' : 'pointer', whiteSpace: 'nowrap',
                      }}
                    >
                      {continuingSession ? 'Continuing…' : '↻ Continue'}
                    </button>
                  </div>
                )}

                {/* Follow-up conversation */}
                {(selectedSession.status === 'completed' || selectedSession.status === 'failed') && (
                  <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12 }}>
                    {followUpMessages.length > 0 && (
                      <div style={{ marginBottom: 12, maxHeight: 300, overflowY: 'auto' }}>
                        {followUpMessages.map((msg, i) => (
                          <div key={i} style={{
                            padding: '8px 12px',
                            marginBottom: 6,
                            borderRadius: 8,
                            fontSize: 13,
                            lineHeight: 1.6,
                            background: msg.role === 'user' ? 'rgba(250,165,37,0.08)' : 'rgba(1,166,188,0.08)',
                            borderLeft: `3px solid ${msg.role === 'user' ? '#FAA525' : '#01A6BC'}`,
                          }}>
                            <div style={{ fontSize: 11, color: '#888', marginBottom: 4, fontWeight: 600 }}>
                              {msg.role === 'user' ? 'You' : selectedAgent?.name || 'Agent'} &middot; {msg.timestamp.toLocaleTimeString()}
                            </div>
                            {msg.role === 'agent' ? (
                              <>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                                {extractAudioUrls(msg.content).map((url) => (
                                  <div key={url} className={styles.audioResult}>
                                    <audio controls src={url} className={styles.audioPlayer}>
                                      Your browser does not support inline audio playback.
                                    </audio>
                                    <a href={url} download className={styles.audioDownloadBtn}>
                                      <Icons.Download /> Download MP3
                                    </a>
                                  </div>
                                ))}
                              </>
                            ) : (
                              <span>{msg.content}</span>
                            )}
                          </div>
                        ))}
                        {isSendingFollowUp && (
                          <div style={{ padding: '8px 12px', fontSize: 13, color: '#888' }}>
                            <span style={{ display: 'inline-block', animation: 'pulse 1.5s infinite' }}>Thinking...</span>
                          </div>
                        )}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        type="text"
                        value={followUpInput}
                        onChange={e => setFollowUpInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendFollowUp(); } }}
                        placeholder="Ask a follow-up question..."
                        disabled={isSendingFollowUp}
                        style={{
                          flex: 1,
                          padding: '10px 14px',
                          borderRadius: 8,
                          border: '1px solid rgba(255,255,255,0.12)',
                          background: 'rgba(255,255,255,0.04)',
                          color: '#fff',
                          fontSize: 13,
                          outline: 'none',
                        }}
                      />
                      <button
                        onClick={handleSendFollowUp}
                        disabled={!followUpInput.trim() || isSendingFollowUp}
                        style={{
                          padding: '10px 16px',
                          borderRadius: 8,
                          border: 'none',
                          background: followUpInput.trim() ? '#01A6BC' : 'rgba(255,255,255,0.08)',
                          color: followUpInput.trim() ? '#fff' : '#666',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: followUpInput.trim() ? 'pointer' : 'default',
                          transition: '0.15s',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {isSendingFollowUp ? '...' : 'Send'}
                      </button>
                    </div>
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
