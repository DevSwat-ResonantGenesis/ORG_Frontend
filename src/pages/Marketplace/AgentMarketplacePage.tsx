/**
 * Agent Marketplace Page
 * Split-view: card grid left, detail panel right
 * Brand: #FAA525 #01A6BC #FA547C #71C23E #FFFFFF #FFD800 #121214
 *
 * Rebuilt to use the real, working backend (GET /api/v1/agents/marketplace,
 * GET /api/v1/agent-teams/marketplace, POST /api/v1/execution/agents/{id}/execute,
 * POST /agent-teams/{id}/execute) instead of the decentralized DSID-node API
 * (services/nodeApi.ts), which pointed at a mostly-empty separate network and
 * never reflected agents/teams users actually publish from Agent OS. Cards
 * are modeled on the real Agent OS card (AgentsPanel) and Team card
 * (AgentTeams/TeamCard) so the look/sections match what already works there.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Search, Play, X, Copy, Zap, Code, Wrench, Database,
  Settings, Bot, BarChart3, Download, Star, Shield, Users, Loader2, CheckCircle, XCircle,
  Brain, MessageSquare, Circle, AlertTriangle, ChevronDown, History,
} from 'lucide-react';
import { isAuthenticated } from '../../utils/auth-cookies';
import { listMarketplaceAgents, type MarketplaceAgentListing } from '../../api/agents';
import {
  listMarketplaceTeams, executeWorkflow, getWorkflowStatus,
  type MarketplaceTeamListing, type WorkflowStatus,
} from '../../api/agentTeams';
import * as agentEngine from '../../api/agentEngine';
import type { AgentSession, AgentStep } from '../../api/agentEngine';
import { extractAgentAudioUrls } from '../../utils/agentAudioUrl';
import agentCardStyles from '../Agents/components/Panels/AgentsPanel/AgentsPanel.module.css';
import teamCardStyles from '../AgentTeams/TeamCard.module.css';
import sessionStyles from '../Agents/components/Panels/SessionsPanel/SessionsPanel.module.css';
import styles from './Marketplace.module.css';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'utility', label: 'Utility' },
  { id: 'analysis', label: 'Analysis' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'developer-tools', label: 'Dev Tools' },
  { id: 'automation', label: 'Automation' },
  { id: 'data', label: 'Data' },
  { id: 'security', label: 'Security' },
];

function getCategoryIcon(cat: string, size = 18) {
  switch (cat) {
    case 'utility': return <Wrench size={size} />;
    case 'analysis': return <BarChart3 size={size} />;
    case 'productivity': return <Zap size={size} />;
    case 'developer-tools': return <Code size={size} />;
    case 'automation': return <Settings size={size} />;
    case 'data': return <Database size={size} />;
    case 'security': return <Shield size={size} />;
    default: return <Bot size={size} />;
  }
}

type SortOption = 'newest' | 'name';
type MarketTab = 'agents' | 'teams';

// Marketplace-specific agent card — visually modeled on the real Agent OS
// card (AgentsPanel.module.css) but always expanded (no hover/tap-to-reveal),
// since a browsing grid benefits from immediately-visible info, and with
// browse-appropriate actions (Execute/About) instead of owner actions
// (Run/Chat/Archive) that don't apply to someone else's published agent.
function MarketplaceAgentCard({
  agent, selected, onSelect,
}: { agent: MarketplaceAgentListing; selected: boolean; onSelect: () => void }) {
  return (
    <div
      className={`${agentCardStyles.agentCard} ${agentCardStyles.expanded} ${selected ? agentCardStyles.selected : ''}`}
      onClick={onSelect}
    >
      <div className={agentCardStyles.cardCollapsedRow}>
        <span className={`${agentCardStyles.statusDotMini} ${agent.is_active ? agentCardStyles.active : ''}`} />
        <h3 className={agentCardStyles.cardName}>{agent.name}</h3>
      </div>
      <div className={agentCardStyles.cardDetails}>
        <div className={agentCardStyles.badgeRow}>
          <span className={`${agentCardStyles.statusPill} ${agent.is_active ? agentCardStyles.active : agentCardStyles.idle}`}>
            {agent.is_active ? 'Active' : 'Idle'}
          </span>
          <span className={agentCardStyles.typeBadge}>{agent.category}</span>
        </div>
        {agent.description && (
          <div className={agentCardStyles.agentSubtitle}>{agent.description}</div>
        )}
        <div className={agentCardStyles.cardStats}>
          <div className={agentCardStyles.stat}>
            <Wrench size={10} /><span>{agent.tools?.length || 0} tools</span>
          </div>
          <div className={agentCardStyles.stat}>
            <Code size={10} /><span>{agent.model}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Marketplace-specific team card — same visual language as the real
// AgentTeams/TeamCard, minus owner-only actions (Edit/Archive/Dashboard)
// since a marketplace browser isn't the team's owner.
function MarketplaceTeamCard({
  team, selected, onSelect,
}: { team: MarketplaceTeamListing; selected: boolean; onSelect: () => void }) {
  return (
    <div
      className={teamCardStyles.teamCard}
      style={selected ? { borderColor: '#01A6BC', boxShadow: '0 0 0 2px rgba(1,166,188,0.3)' } : undefined}
      onClick={onSelect}
    >
      <div className={teamCardStyles.cardHeader}>
        <div className={teamCardStyles.titleSection}>
          <div className={teamCardStyles.teamTitle}>
            <span className={teamCardStyles.teamIcon}>👥</span>
            <h3>{team.name}</h3>
          </div>
          <div className={teamCardStyles.metadata}>
            <span className={teamCardStyles.metaItem}>🤖 {team.member_count} agents</span>
            {team.is_nft && <span className={teamCardStyles.metaItem}>💎 NFT</span>}
            {team.rating != null && team.rating > 0 && (
              <span className={teamCardStyles.metaItem}><Star size={10} /> {team.rating.toFixed(1)}</span>
            )}
          </div>
        </div>
      </div>
      {team.description && <p className={teamCardStyles.description}>{team.description}</p>}
      <div className={teamCardStyles.cardFooter}>
        <span className={teamCardStyles.timestamp}>
          {team.listing_price ? `$${team.listing_price}` : team.rent_price_per_day ? `$${team.rent_price_per_day.toFixed(2)}/day rent` : 'Free to run'}
        </span>
      </div>
    </div>
  );
}

export default function AgentMarketplacePage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<MarketTab>('agents');

  const [agents, setAgents] = useState<MarketplaceAgentListing[]>([]);
  const [teams, setTeams] = useState<MarketplaceTeamListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const [selectedAgent, setSelectedAgent] = useState<MarketplaceAgentListing | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<MarketplaceTeamListing | null>(null);

  const [taskInput, setTaskInput] = useState('');
  const [executing, setExecuting] = useState(false);
  const [executionOutput, setExecutionOutput] = useState<{ success: boolean; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Real session-based execution for agents — cloned from Agent OS's
  // SessionsPanel flow (start a real AgentSession, poll it + its steps while
  // running) instead of the old one-shot /execution/agents/{id}/execute call,
  // so marketplace users see the same live step trace as the owner does.
  const [agentSession, setAgentSession] = useState<AgentSession | null>(null);
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([]);

  // Full session history for the selected agent — each row is a collapsed
  // "mobile card"-style item (title/goal only, cloned from AgentsPanel's
  // collapse-until-tap card pattern) that expands to reveal just that
  // session's Final Output, reusing the same finalOutput block as the live
  // session above.
  const [agentSessions, setAgentSessions] = useState<AgentSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [expandedSessionIds, setExpandedSessionIds] = useState<Set<string>>(new Set());

  const loadAgentSessions = useCallback(async (agentId: string) => {
    setSessionsLoading(true);
    try {
      const list = await agentEngine.listSessions(agentId);
      setAgentSessions(list);
    } catch {
      setAgentSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedAgent?.id) {
      loadAgentSessions(selectedAgent.id);
      setExpandedSessionIds(new Set());
    } else {
      setAgentSessions([]);
    }
  }, [selectedAgent?.id, loadAgentSessions]);

  const toggleSessionExpanded = useCallback((sessionId: string) => {
    setExpandedSessionIds((prev) => {
      const next = new Set(prev);
      if (next.has(sessionId)) next.delete(sessionId); else next.add(sessionId);
      return next;
    });
  }, []);

  useEffect(() => {
    const isActive = agentSession && ['initializing', 'running', 'waiting_approval'].includes(agentSession.status);
    if (!isActive || !agentSession) return;
    const interval = setInterval(async () => {
      try {
        const fresh = await agentEngine.getSession(agentSession.id);
        setAgentSession(fresh);
        const steps = await agentEngine.getSessionSteps(agentSession.id);
        setAgentSteps(steps);
        if (['completed', 'failed', 'cancelled'].includes(fresh.status) && selectedAgent) {
          loadAgentSessions(selectedAgent.id);
        }
      } catch { /* ignore poll errors */ }
    }, 2000);
    return () => clearInterval(interval);
  }, [agentSession?.id, agentSession?.status, selectedAgent, loadAgentSessions]);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/signup', { replace: true });
    }
  }, [navigate]);

  const loadAgents = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listMarketplaceAgents({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
      });
      setAgents(list);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  const loadTeams = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listMarketplaceTeams();
      setTeams(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'agents') loadAgents();
    else loadTeams();
  }, [tab, loadAgents, loadTeams]);

  function closeDetail() {
    setSelectedAgent(null);
    setSelectedTeam(null);
    setExecutionOutput(null);
    setTaskInput('');
    setAgentSession(null);
    setAgentSteps([]);
  }

  function selectAgent(agent: MarketplaceAgentListing) {
    setSelectedTeam(null);
    setSelectedAgent(agent);
    setExecutionOutput(null);
    setTaskInput('');
    setAgentSession(null);
    setAgentSteps([]);
  }

  function selectTeam(team: MarketplaceTeamListing) {
    setSelectedAgent(null);
    setSelectedTeam(team);
    setExecutionOutput(null);
    setTaskInput('');
  }

  async function handleExecuteAgent() {
    if (!selectedAgent) return;
    setExecuting(true);
    setAgentSteps([]);
    try {
      const goal = taskInput.trim() || 'Hello — introduce yourself and what you can do.';
      const session = await agentEngine.startSession(selectedAgent.id, goal);
      setAgentSession(session);
      loadAgentSessions(selectedAgent.id);
    } catch (error: any) {
      setAgentSession({
        id: 'error', agent_id: selectedAgent.id, status: 'failed',
        loop_count: 0, total_tokens_used: 0,
        error_message: error?.response?.data?.detail || error?.message || String(error),
      });
    } finally {
      setExecuting(false);
    }
  }

  function sessionStatusPillClass(status: string): string {
    switch (status) {
      case 'completed':
      case 'running': return agentCardStyles.active;
      case 'waiting_approval': return agentCardStyles.paused;
      case 'failed': return agentCardStyles.failed;
      case 'cancelled': return agentCardStyles.archived;
      default: return agentCardStyles.idle;
    }
  }

  function getStepIcon(stepType: string) {
    switch (stepType) {
      case 'think': return <Brain size={12} />;
      case 'tool_call': return <Wrench size={12} />;
      case 'respond': return <MessageSquare size={12} />;
      default: return <Circle size={12} />;
    }
  }

  async function handleExecuteTeam() {
    if (!selectedTeam) return;
    setExecuting(true);
    setExecutionOutput(null);
    try {
      const task = taskInput.trim() || 'Hello — introduce the team and what it can do.';
      const workflow = await executeWorkflow(selectedTeam.team_id, { input_data: { message: task, text: task } });
      const maxWait = 60_000;
      const pollInterval = 2000;
      const start = Date.now();
      let status: WorkflowStatus | null = null;
      while (Date.now() - start < maxWait) {
        await new Promise((r) => setTimeout(r, pollInterval));
        try {
          status = await getWorkflowStatus(workflow.id);
          if (status.status === 'completed' || status.status === 'failed') break;
        } catch { /* keep polling */ }
      }
      if (status?.status === 'completed') {
        const out = status.result;
        setExecutionOutput({
          success: true,
          text: typeof out === 'string' ? out : JSON.stringify(out ?? { message: 'Workflow completed.' }, null, 2),
        });
      } else if (status?.status === 'failed') {
        setExecutionOutput({ success: false, text: status.error || 'Workflow failed.' });
      } else {
        setExecutionOutput({ success: false, text: `Workflow is still ${status?.status || 'running'}. Check back in Agent Teams.` });
      }
    } catch (error: any) {
      setExecutionOutput({ success: false, text: error?.message || String(error) });
    } finally {
      setExecuting(false);
    }
  }

  function copyId(id: string) {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const sortedAgents = [...agents].sort((a, b) => {
    if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });
  const filteredAgents = sortedAgents.filter((agent) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return agent.name?.toLowerCase().includes(q) || agent.description?.toLowerCase().includes(q);
  });

  const filteredTeams = [...teams]
    .sort((a, b) => sortBy === 'name' ? (a.name || '').localeCompare(b.name || '') : 0)
    .filter((team) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return team.name?.toLowerCase().includes(q) || team.description?.toLowerCase().includes(q);
    });

  const count = tab === 'agents' ? filteredAgents.length : filteredTeams.length;

  return (
    <div className={styles.page}>
      {/* Row 1: Title + description */}
      <div className={styles.topBar}>
        <h1 className={styles.topTitle}>Marketplace</h1>
        <span className={styles.topDesc}>Discover and run agents &amp; agent teams published by the community</span>
        <div className={styles.topRight}>
          <span className={styles.countChip}>{count} {tab}</span>
        </div>
      </div>

      {/* Row 2: Tab toggle + search + pills + sort */}
      <div className={styles.controlBar}>
        <div className={styles.pills}>
          <button className={`${styles.pill} ${tab === 'agents' ? styles.pillActive : ''}`} onClick={() => { setTab('agents'); closeDetail(); }}>
            <Bot size={12} style={{ marginRight: 4, verticalAlign: -2 }} /> Agents
          </button>
          <button className={`${styles.pill} ${tab === 'teams' ? styles.pillActive : ''}`} onClick={() => { setTab('teams'); closeDetail(); }}>
            <Users size={12} style={{ marginRight: 4, verticalAlign: -2 }} /> Agent Teams
          </button>
        </div>
        <div className={styles.divider} />
        <div className={styles.searchWrap}>
          <div className={styles.searchIcon}><Search size={14} /></div>
          <input
            className={styles.searchInput}
            type="text"
            placeholder={`Search ${tab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {tab === 'agents' && (
          <>
            <div className={styles.divider} />
            <div className={styles.pills}>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  className={`${styles.pill} ${selectedCategory === c.id ? styles.pillActive : ''}`}
                  onClick={() => setSelectedCategory(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </>
        )}
        <div className={styles.sortBtns}>
          {(['newest', 'name'] as SortOption[]).map((s) => (
            <button
              key={s}
              className={`${styles.sortBtn} ${sortBy === s ? styles.sortBtnActive : ''}`}
              onClick={() => setSortBy(s)}
            >
              {s === 'name' ? 'A-Z' : 'Newest'}
            </button>
          ))}
        </div>
      </div>

      {/* Content: Grid + optional Detail split */}
      <div className={styles.content}>
        <div className={styles.gridPane}>
          {loading ? (
            <div className={styles.loading}><div className={styles.spinner} />Loading...</div>
          ) : tab === 'agents' ? (
            filteredAgents.length === 0 ? (
              <div className={styles.emptyState}>
                <Bot size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
                <p>{searchQuery ? `No results for "${searchQuery}"` : 'No agents published yet. Publish one from Agent OS to see it here.'}</p>
              </div>
            ) : (
              <div className={agentCardStyles.agentsGrid}>
                {filteredAgents.map((agent) => (
                  <MarketplaceAgentCard
                    key={agent.id}
                    agent={agent}
                    selected={selectedAgent?.id === agent.id}
                    onSelect={() => selectAgent(agent)}
                  />
                ))}
              </div>
            )
          ) : (
            filteredTeams.length === 0 ? (
              <div className={styles.emptyState}>
                <Users size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
                <p>{searchQuery ? `No results for "${searchQuery}"` : 'No teams published yet. Publish one from Agent Teams to see it here.'}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 16 }}>
                {filteredTeams.map((team) => (
                  <MarketplaceTeamCard
                    key={team.team_id}
                    team={team}
                    selected={selectedTeam?.team_id === team.team_id}
                    onSelect={() => selectTeam(team)}
                  />
                ))}
              </div>
            )
          )}
        </div>

        {/* Detail split panel — shared between agents and teams */}
        {(selectedAgent || selectedTeam) && (
          <div className={styles.detailPane}>
            <div className={styles.detailInner}>
              <button className={styles.detailClose} onClick={closeDetail}>
                <X size={12} /> Close
              </button>

              <div className={styles.detailHero}>
                <div className={styles.detailIconWrap}>
                  {selectedAgent ? getCategoryIcon(selectedAgent.category, 26) : <Users size={26} />}
                </div>
                <div>
                  <h2 className={styles.detailTitle}>{selectedAgent?.name || selectedTeam?.name}</h2>
                  <div className={styles.detailMeta}>
                    {selectedAgent ? `v${selectedAgent.version} · ${selectedAgent.category}` : `${selectedTeam?.member_count} agents`}
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>About</h3>
                <p className={styles.descText}>{selectedAgent?.description || selectedTeam?.description || 'No description provided.'}</p>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>{selectedAgent ? 'Agent ID' : 'Team ID'}</h3>
                <div className={styles.hashBlock}>
                  <code>{(selectedAgent?.id || selectedTeam?.team_id || '').slice(0, 8)}...</code>
                  <button className={styles.copyBtn} onClick={() => copyId(selectedAgent?.id || selectedTeam?.team_id || '')}>
                    {copied ? <CheckCircle size={12} color="#71C23E" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              {selectedAgent?.tools && selectedAgent.tools.length > 0 && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Capabilities</h3>
                  <div className={styles.tagList}>
                    {selectedAgent.tools.map((tool, i) => <span key={i} className={styles.tag}>{tool}</span>)}
                  </div>
                </div>
              )}

              {/* Execute */}
              <div className={styles.executeSection}>
                <h3 className={styles.sectionTitle}>{selectedAgent ? 'Give this agent a task' : 'Run this team'}</h3>
                <textarea
                  className={styles.executeTextarea}
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  placeholder={selectedAgent ? 'e.g. Summarize this week\'s top AI news' : 'e.g. Research and draft a report on...'}
                />
                <button
                  className={styles.btnPrimary}
                  onClick={selectedAgent ? handleExecuteAgent : handleExecuteTeam}
                  disabled={executing}
                >
                  {executing ? (
                    <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Running...</>
                  ) : (
                    <><Play size={14} /> Execute</>
                  )}
                </button>

                {/* Teams: simple one-shot workflow result */}
                {selectedTeam && executionOutput && (() => {
                  const audioUrls = extractAgentAudioUrls(executionOutput.text);
                  return (
                    <div className={`${styles.resultBox} ${executionOutput.success ? styles.resultSuccess : styles.resultError}`}>
                      <div style={{ fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {executionOutput.success ? <CheckCircle size={14} color="#71C23E" /> : <XCircle size={14} color="#FA547C" />}
                        {executionOutput.success ? 'Success' : 'Failed'}
                      </div>
                      <div style={{ fontSize: 12 }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{executionOutput.text}</ReactMarkdown>
                      </div>
                      {audioUrls.map((url) => (
                        <div key={url} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                          <audio controls src={url} style={{ flex: 1, minWidth: 220, height: 34 }}>
                            Your browser does not support inline audio playback.
                          </audio>
                          <a
                            href={url}
                            download
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px',
                              borderRadius: 8, background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)',
                              color: '#22c55e', fontSize: 12, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap',
                            }}
                          >
                            <Download size={12} /> Download MP3
                          </a>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Agents: real session flow cloned from Agent OS's SessionsPanel —
                    Final Output window on top, Session Steps below it. */}
                {selectedAgent && agentSession && (
                  <div style={{ marginTop: 12 }}>
                    <div className={sessionStyles.detailHeader}>
                      <h3>Session</h3>
                      <span
                        className={sessionStyles.statusBadge}
                        style={{
                          background: agentSession.status === 'completed' ? 'var(--color-info)'
                            : agentSession.status === 'failed' ? 'var(--color-error)'
                            : agentSession.status === 'waiting_approval' ? 'var(--color-warning)'
                            : 'var(--color-success)',
                        }}
                      >
                        {agentSession.status}
                      </span>
                    </div>

                    {/* Final Output — shown first/on top, per how this should read for a browsing user */}
                    {agentSession.final_output && (
                      <div className={sessionStyles.finalOutput}>
                        <h4>Final Output</h4>
                        <div className={sessionStyles.finalOutputBody}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{agentSession.final_output}</ReactMarkdown>
                          {extractAgentAudioUrls(agentSession.final_output).map((url) => (
                            <div key={url} className={sessionStyles.audioResult}>
                              <audio controls src={url} className={sessionStyles.audioPlayer}>
                                Your browser does not support inline audio playback.
                              </audio>
                              <a href={url} download className={sessionStyles.audioDownloadBtn}>
                                <Download size={12} /> Download MP3
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {agentSession.error_message && (
                      <div className={sessionStyles.errorOutput}>
                        <h4>Error</h4>
                        <p>{agentSession.error_message}</p>
                      </div>
                    )}

                    {/* Session Steps — below the final output */}
                    <div className={sessionStyles.stepsList}>
                      {agentSteps.length === 0 && ['initializing', 'running'].includes(agentSession.status) && (
                        <div className={sessionStyles.noSteps}><p>Starting…</p></div>
                      )}
                      {agentSteps.map((step) => (
                        <div key={step.id} className={`${sessionStyles.stepCard} ${step.required_approval ? sessionStyles.needsApproval : ''}`}>
                          <div className={sessionStyles.stepHeader}>
                            <span className={sessionStyles.stepIcon}>{getStepIcon(step.step_type)}</span>
                            <span className={sessionStyles.stepNumber}>Step {step.step_number}</span>
                            <span className={sessionStyles.stepType}>{step.step_type}</span>
                            {step.duration_ms && <span className={sessionStyles.stepDuration}>{step.duration_ms}ms</span>}
                          </div>
                          {step.reasoning && (
                            <div className={sessionStyles.stepReasoning}><strong>Reasoning:</strong> {step.reasoning}</div>
                          )}
                          {step.tool_name && (
                            <div className={sessionStyles.stepTool}>
                              <strong>Tool:</strong> {step.tool_name}
                              {step.tool_input && <pre>{JSON.stringify(step.tool_input, null, 2)}</pre>}
                            </div>
                          )}
                          {step.step_type === 'respond' && (step.output_data as any)?.response && (
                            <div className={sessionStyles.stepReasoning} style={{ marginTop: 8, borderLeft: '3px solid var(--color-success)', paddingLeft: 12 }}>
                              <strong>Response:</strong>{' '}
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {typeof (step.output_data as any).response === 'object'
                                  ? JSON.stringify((step.output_data as any).response, null, 2)
                                  : String((step.output_data as any).response)}
                              </ReactMarkdown>
                            </div>
                          )}
                          {!step.safety_check_passed && step.safety_violations && (
                            <div className={sessionStyles.safetyWarning}>
                              <AlertTriangle size={12} />
                              <span>Safety violations: {step.safety_violations.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Sessions — history list, collapsed "mobile card" style
                    (title/goal only, cloned from AgentsPanel's collapse-until-
                    tap card) that expands per-row to reveal just that
                    session's Final Output (same finalOutput block as above). */}
                {selectedAgent && (
                  <div style={{ marginTop: 20 }}>
                    <h3 className={styles.sectionTitle}>
                      <History size={13} style={{ verticalAlign: -2, marginRight: 5 }} />
                      All Sessions {agentSessions.length > 0 ? `(${agentSessions.length})` : ''}
                    </h3>
                    {sessionsLoading ? (
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', padding: '8px 0' }}>Loading sessions...</div>
                    ) : agentSessions.length === 0 ? (
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', padding: '8px 0' }}>No sessions yet.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {agentSessions.map((s) => {
                          const isExpanded = expandedSessionIds.has(s.id);
                          return (
                            <div
                              key={s.id}
                              className={`${agentCardStyles.agentCard} ${isExpanded ? agentCardStyles.expanded : ''}`}
                              onClick={() => toggleSessionExpanded(s.id)}
                            >
                              <div className={agentCardStyles.cardCollapsedRow}>
                                <span
                                  className={`${agentCardStyles.statusDotMini} ${
                                    s.status === 'completed' ? agentCardStyles.active
                                    : s.status === 'failed' ? agentCardStyles.failed
                                    : s.status === 'running' ? agentCardStyles.active
                                    : ''
                                  }`}
                                />
                                <h3 className={agentCardStyles.cardName}>{s.current_goal || 'No goal set'}</h3>
                                <span
                                  className={agentCardStyles.expandChevron}
                                  style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}
                                >
                                  <ChevronDown size={12} />
                                </span>
                              </div>
                              <div className={agentCardStyles.cardDetails}>
                                <div className={agentCardStyles.badgeRow}>
                                  <span className={`${agentCardStyles.statusPill} ${sessionStatusPillClass(s.status)}`}>{s.status}</span>
                                  {s.created_at && (
                                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                                      {new Date(s.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  )}
                                </div>

                                {s.final_output ? (
                                  <div className={sessionStyles.finalOutput} style={{ marginTop: 8 }}>
                                    <h4>Final Output</h4>
                                    <div className={sessionStyles.finalOutputBody}>
                                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{s.final_output}</ReactMarkdown>
                                      {extractAgentAudioUrls(s.final_output).map((url) => (
                                        <div key={url} className={sessionStyles.audioResult}>
                                          <audio controls src={url} className={sessionStyles.audioPlayer}>
                                            Your browser does not support inline audio playback.
                                          </audio>
                                          <a href={url} download className={sessionStyles.audioDownloadBtn}>
                                            <Download size={12} /> Download MP3
                                          </a>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : s.error_message ? (
                                  <div className={sessionStyles.errorOutput} style={{ marginTop: 8 }}>
                                    <h4>Error</h4>
                                    <p>{s.error_message}</p>
                                  </div>
                                ) : (
                                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
                                    {['running', 'initializing', 'waiting_approval'].includes(s.status) ? 'Still running…' : 'No output.'}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
