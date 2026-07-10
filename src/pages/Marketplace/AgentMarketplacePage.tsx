/**
 * Agent Marketplace Page — Compact branded redesign
 * Split-view: card grid left, detail panel right
 * Brand: #FAA525 #01A6BC #FA547C #71C23E #FFFFFF #FFD800 #121214
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Play, Clock,
  CheckCircle, XCircle, Loader2,
  X, Copy, Zap, Code, Wrench, Database,
  Settings, Bot, BarChart3, Download, Star, Shield,
} from 'lucide-react';
import { isAuthenticated } from '../../utils/auth-cookies';
import {
  getNodeStatus, searchAgents, executeAgent,
  type Agent, type NodeStatus, type ExecuteResponse
} from '../../services/nodeApi';
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

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < Math.round(rating) ? styles.starFilled : styles.star}>&#9733;</span>
  ));
}

type SortOption = 'newest' | 'popular' | 'rating' | 'name';

export default function AgentMarketplacePage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<NodeStatus | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [executing, setExecuting] = useState(false);
  const [executionInput, setExecutionInput] = useState('{"message": "hello"}');
  const [executionResult, setExecutionResult] = useState<ExecuteResponse | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/signup', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    loadStatus();
    loadAgents();
  }, []);

  useEffect(() => { loadAgents(); }, [selectedCategory]);

  async function loadStatus() {
    try {
      const nodeStatus = await getNodeStatus();
      setStatus(nodeStatus);
    } catch (error) {
      console.error('Failed to load status:', error);
    }
  }

  async function loadAgents() {
    setLoading(true);
    try {
      const { agents: fetchedAgents } = await searchAgents({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
      });
      setAgents(fetchedAgents || []);
    } catch (error) {
      console.error('Failed to load agents:', error);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleExecute() {
    if (!selectedAgent) return;
    setExecuting(true);
    setExecutionResult(null);
    try {
      let inputData: Record<string, unknown>;
      if (!executionInput.trim()) {
        inputData = { text: "hello", message: "hello" };
      } else {
        try { inputData = JSON.parse(executionInput); }
        catch { const t = executionInput.trim(); inputData = { text: t, content: t, message: t }; }
      }
      const result = await executeAgent({
        manifest_hash: selectedAgent.manifest_hash,
        input_data: inputData,
        user_dsid: 'marketplace-user',
        trust_tier: 1,
      });
      setExecutionResult(result);
    } catch (error) {
      setExecutionResult({
        success: false, output: null, execution_hash: '',
        tokens_used: 0, duration_ms: 0, governance_decision: 'error',
        error: String(error),
      });
    } finally {
      setExecuting(false);
    }
  }

  function copyHash(hash: string) {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function closeDetail() {
    setSelectedAgent(null);
    setExecutionResult(null);
    setExecutionInput('{"message": "hello"}');
  }

  const sortedAgents = [...agents].sort((a, b) => {
    switch (sortBy) {
      case 'newest': return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      case 'popular': return (b.execution_count || 0) - (a.execution_count || 0);
      case 'rating': return (b.rating || 0) - (a.rating || 0);
      case 'name': return (a.name || '').localeCompare(b.name || '');
      default: return 0;
    }
  });

  const filtered = sortedAgents.filter(agent => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      agent.name?.toLowerCase().includes(q) ||
      agent.description?.toLowerCase().includes(q) ||
      agent.manifest_hash?.toLowerCase().includes(q) ||
      agent.tags?.some(tag => tag.toLowerCase().includes(q))
    );
  });

  return (
    <div className={styles.page}>
      {/* Row 1: Title + description + status */}
      <div className={styles.topBar}>
        <h1 className={styles.topTitle}>Agent Marketplace</h1>
        <span className={styles.topDesc}>Discover and run agents published by the community</span>
        <div className={styles.topRight}>
          <div className={styles.statusChip}>
            <span className={status?.running ? styles.dotOnline : styles.dotOffline} />
            Marketplace {status?.running ? 'Online' : 'Offline'}
          </div>
          <span className={styles.countChip}>{filtered.length} agents</span>
        </div>
      </div>

      {/* Row 2: Search + pills + sort */}
      <div className={styles.controlBar}>
        <div className={styles.searchWrap}>
          <div className={styles.searchIcon}><Search size={14} /></div>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className={styles.divider} />
        <div className={styles.pills}>
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              className={`${styles.pill} ${selectedCategory === c.id ? styles.pillActive : ''}`}
              onClick={() => setSelectedCategory(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className={styles.sortBtns}>
          {(['newest', 'popular', 'rating', 'name'] as SortOption[]).map(s => (
            <button
              key={s}
              className={`${styles.sortBtn} ${sortBy === s ? styles.sortBtnActive : ''}`}
              onClick={() => setSortBy(s)}
            >
              {s === 'name' ? 'A-Z' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content: Grid + optional Detail split */}
      <div className={styles.content}>
        <div className={styles.gridPane}>
          {loading ? (
            <div className={styles.loading}><div className={styles.spinner} />Loading...</div>
          ) : filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <Bot size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
              <p>{searchQuery ? `No results for "${searchQuery}"` : 'No agents found. Try a different category.'}</p>
            </div>
          ) : (
            <div className={styles.cardGrid}>
              {filtered.map(agent => (
                <div
                  key={agent.manifest_hash}
                  className={`${styles.card} ${selectedAgent?.manifest_hash === agent.manifest_hash ? styles.cardSelected : ''}`}
                  onClick={() => setSelectedAgent(agent)}
                >
                  <div className={styles.cardIconWrap}>
                    {getCategoryIcon(agent.category)}
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardName}>{agent.name}</div>
                    <div className={styles.cardTagline}>
                      {agent.description?.slice(0, 60) || `v${agent.version} · ${agent.category}`}
                      {agent.description && agent.description.length > 60 ? '...' : ''}
                    </div>
                  </div>
                  <div className={styles.cardRight}>
                    <span className={`${styles.cardBadge} ${agent.price_per_execution ? styles.badgePaid : styles.badgeFree}`}>
                      {agent.price_per_execution ? `$${agent.price_per_execution}` : 'Free'}
                    </span>
                    <div className={styles.cardStats}>
                      {agent.rating != null && agent.rating > 0 && (
                        <><Star size={10} className={styles.starIcon} /> {agent.rating.toFixed(1)}</>
                      )}
                      <><Download size={10} /> {agent.execution_count || 0}</>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail split panel */}
        {selectedAgent && (
          <div className={styles.detailPane}>
            <div className={styles.detailInner}>
              <button className={styles.detailClose} onClick={closeDetail}>
                <X size={12} /> Close
              </button>

              <div className={styles.detailHero}>
                <div className={styles.detailIconWrap}>
                  {getCategoryIcon(selectedAgent.category, 26)}
                </div>
                <div>
                  <h2 className={styles.detailTitle}>{selectedAgent.name}</h2>
                  <div className={styles.detailMeta}>
                    v{selectedAgent.version} &middot; {selectedAgent.category}
                  </div>
                </div>
              </div>

              {/* Stars */}
              <div className={styles.starsRow}>
                {renderStars(selectedAgent.rating || 0)}
                <span className={styles.ratingText}>
                  {selectedAgent.rating ? selectedAgent.rating.toFixed(1) : 'No ratings'}
                </span>
              </div>

              {/* Metrics */}
              <div className={styles.metricsRow}>
                <div className={styles.metric}>
                  <Clock size={12} />
                  <span className={styles.metricVal}>{selectedAgent.execution_count || 0}</span> runs
                </div>
                <div className={styles.metric}>
                  {selectedAgent.status === 'Active' ? <CheckCircle size={12} color="#71C23E" /> : <XCircle size={12} color="#FA547C" />}
                  <span className={styles.metricVal}>{selectedAgent.status}</span>
                </div>
              </div>

              {/* Description */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>About</h3>
                <p className={styles.descText}>{selectedAgent.description}</p>
              </div>

              {/* Agent ID */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Agent ID</h3>
                <div className={styles.hashBlock}>
                  <code>{selectedAgent.manifest_hash.slice(0, 20)}...{selectedAgent.manifest_hash.slice(-8)}</code>
                  <button className={styles.copyBtn} onClick={() => copyHash(selectedAgent.manifest_hash)}>
                    {copied ? <CheckCircle size={12} color="#71C23E" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              {/* Capabilities */}
              {selectedAgent.capabilities && selectedAgent.capabilities.length > 0 && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Capabilities</h3>
                  <div className={styles.tagList}>
                    {selectedAgent.capabilities.map((cap, i) => <span key={i} className={styles.tag}>{cap}</span>)}
                  </div>
                </div>
              )}

              {/* Tags */}
              {selectedAgent.tags && selectedAgent.tags.length > 0 && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>Tags</h3>
                  <div className={styles.tagList}>
                    {selectedAgent.tags.map((tag, i) => <span key={i} className={styles.tag}>{tag}</span>)}
                  </div>
                </div>
              )}

              {/* Execute */}
              <div className={styles.executeSection}>
                <h3 className={styles.sectionTitle}>Execute Agent</h3>
                <textarea
                  className={styles.executeTextarea}
                  value={executionInput}
                  onChange={e => setExecutionInput(e.target.value)}
                />
                <button className={styles.btnPrimary} onClick={handleExecute} disabled={executing}>
                  {executing ? (
                    <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Running...</>
                  ) : (
                    <><Play size={14} /> Execute</>
                  )}
                </button>

                {executionResult && (
                  <div className={`${styles.resultBox} ${executionResult.success ? styles.resultSuccess : styles.resultError}`}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>
                      {executionResult.success ? 'Success' : 'Failed'}
                      <span style={{ fontWeight: 400, opacity: 0.5, marginLeft: 6 }}>
                        {executionResult.duration_ms}ms
                      </span>
                    </div>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 11 }}>
                      {JSON.stringify(executionResult.output || executionResult.error, null, 2)}
                    </pre>
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
