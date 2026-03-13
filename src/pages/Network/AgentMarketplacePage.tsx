/**
 * Agent Marketplace Page (DSID Network)
 * Browse DSID-verified agents with categories, search, sort, and execution
 * Redesigned: dashboardicons.com/community grid + haveibeenpwned detail card
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Play, Shield, Clock, Hash,
  CheckCircle, XCircle, Loader2, ExternalLink,
  ArrowLeft, Copy, Zap, Code, Wrench, Database,
  Settings, Bot, BarChart3,
} from 'lucide-react';
import { isAuthenticated } from '../../utils/auth-cookies';
import {
  getNodeStatus, searchAgents, executeAgent,
  type Agent, type NodeStatus, type ExecuteResponse
} from '../../services/nodeApi';
import styles from './NetworkGrid.module.css';

const CATEGORIES = [
  { id: 'all', label: 'All Agents', icon: 'bot' },
  { id: 'utility', label: 'Utility', icon: 'wrench' },
  { id: 'analysis', label: 'Analysis', icon: 'chart' },
  { id: 'productivity', label: 'Productivity', icon: 'zap' },
  { id: 'developer-tools', label: 'Dev Tools', icon: 'code' },
  { id: 'automation', label: 'Automation', icon: 'cog' },
  { id: 'data', label: 'Data', icon: 'database' },
  { id: 'security', label: 'Security', icon: 'shield' },
];

function getCategoryIcon(cat: string, size = 36) {
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

type SortOption = 'newest' | 'popular' | 'rating' | 'name';

export default function AgentMarketplacePage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<NodeStatus | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Detail modal
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
        user_dsid: 'dsid-u-marketplace-user-0000',
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

  // Sort
  const sortedAgents = [...agents].sort((a, b) => {
    switch (sortBy) {
      case 'newest': return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      case 'popular': return (b.execution_count || 0) - (a.execution_count || 0);
      case 'rating': return (b.rating || 0) - (a.rating || 0);
      case 'name': return (a.name || '').localeCompare(b.name || '');
      default: return 0;
    }
  });

  // Filter by search
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
      {/* Hero */}
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>DSID Network Marketplace</h1>
        <p className={styles.heroSub}>
          DSID-verified (Trust Level T3) agents only &mdash; Decentralized &amp; cryptographically verified
        </p>
      </div>

      {/* Status bar */}
      <div className={styles.statusBar}>
        <div className={styles.statusItem}>
          <span className={`${styles.statusDot} ${status?.running ? styles.statusDotOnline : styles.statusDotOffline}`} />
          RARA Node: {status?.running ? 'Online' : 'Offline'}
        </div>
        <span className={styles.statusSep}>|</span>
        <div className={styles.statusItem}>
          {agents.length} verified agents
        </div>
      </div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <div className={styles.searchIcon}>
          <Search size={18} />
        </div>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search agents..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category pills */}
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

      {/* Sort bar */}
      <div className={styles.sortBar}>
        <span className={styles.sortLabel}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        <div className={styles.sortBtns}>
          {(['newest', 'popular', 'rating', 'name'] as SortOption[]).map(s => (
            <button key={s} className={`${styles.sortBtn} ${sortBy === s ? styles.sortBtnActive : ''}`} onClick={() => setSortBy(s)}>
              {s === 'name' ? 'A-Z' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className={styles.loading}><div className={styles.spinner} />Loading agents...</div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <Bot size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p>{searchQuery ? `No results for "${searchQuery}"` : 'No agents found. Try a different category.'}</p>
        </div>
      ) : (
        <div className={styles.iconGrid}>
          {filtered.map(agent => (
            <div key={agent.manifest_hash} className={styles.iconCard} onClick={() => setSelectedAgent(agent)}>
              <span className={`${styles.cardBadge} ${agent.status === 'Active' ? styles.badgeActive : styles.badgeTrust}`}>
                {agent.status === 'Active' ? 'Active' : agent.status}
              </span>
              <div className={styles.cardIcon}>
                {getCategoryIcon(agent.category)}
              </div>
              <div className={styles.cardName}>{agent.name}</div>
              <div className={styles.cardMeta}>v{agent.version} &middot; T{agent.trust_tier}</div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className={styles.footer}>
        <a href="https://sepolia.basescan.org/address/0x10E3079926f6C5790228d0e5f164E506AE96F3Ea" target="_blank" rel="noopener noreferrer">
          BaseScan <ExternalLink size={10} />
        </a>
      </div>

      {/* Detail modal (haveibeenpwned style) */}
      {selectedAgent && (
        <div className={styles.overlay} onClick={closeDetail}>
          <div className={styles.detailPanel} onClick={e => e.stopPropagation()}>
            <button className={styles.detailBack} onClick={closeDetail}>
              <ArrowLeft size={14} /> Back to marketplace
            </button>

            <div className={styles.detailHeader}>
              <div className={styles.detailIcon}>
                {getCategoryIcon(selectedAgent.category)}
              </div>
              <div>
                <h2 className={styles.detailTitle}>{selectedAgent.name}</h2>
                <div className={styles.detailMeta}>
                  v{selectedAgent.version} &middot; {selectedAgent.category} &middot; Trust Tier {selectedAgent.trust_tier}
                </div>
              </div>
            </div>

            {/* Stat chips */}
            <div className={styles.statChips}>
              <div className={styles.statChip}>
                <Clock size={14} />
                <span className={styles.statChipValue}>{selectedAgent.execution_count || 0}</span> executions
              </div>
              <div className={styles.statChip}>
                <Shield size={14} />
                Trust <span className={styles.statChipValue}>T{selectedAgent.trust_tier}</span>
              </div>
              <div className={styles.statChip}>
                {selectedAgent.status === 'Active' ? <CheckCircle size={14} color="#22c55e" /> : <XCircle size={14} color="#ef4444" />}
                <span className={styles.statChipValue}>{selectedAgent.status}</span>
              </div>
              {selectedAgent.rating != null && (
                <div className={styles.statChip}>
                  &#9733; <span className={styles.statChipValue}>{selectedAgent.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className={styles.detailSection}>
              <h3 className={styles.detailSectionTitle}>About this agent</h3>
              <p className={styles.detailDesc}>{selectedAgent.description}</p>
            </div>

            {/* Manifest hash */}
            <div className={styles.detailSection}>
              <h3 className={styles.detailSectionTitle}>Manifest Hash</h3>
              <div className={styles.hashBlock}>
                <code>{selectedAgent.manifest_hash.slice(0, 24)}...{selectedAgent.manifest_hash.slice(-8)}</code>
                <button className={styles.copyBtn} onClick={() => copyHash(selectedAgent.manifest_hash)}>
                  {copied ? <CheckCircle size={14} color="#22c55e" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Capabilities / Tags */}
            {selectedAgent.capabilities && selectedAgent.capabilities.length > 0 && (
              <div className={styles.detailSection}>
                <h3 className={styles.detailSectionTitle}>Capabilities</h3>
                <div className={styles.tagList}>
                  {selectedAgent.capabilities.map((cap, i) => <span key={i} className={styles.tag}>{cap}</span>)}
                </div>
              </div>
            )}

            {selectedAgent.tags && selectedAgent.tags.length > 0 && (
              <div className={styles.detailSection}>
                <h3 className={styles.detailSectionTitle}>Tags</h3>
                <div className={styles.tagList}>
                  {selectedAgent.tags.map((tag, i) => <span key={i} className={styles.tag}>{tag}</span>)}
                </div>
              </div>
            )}

            {/* Execute */}
            <div className={styles.executeSection}>
              <h3 className={styles.detailSectionTitle} style={{ borderBottom: 'none', paddingBottom: 0 }}>Execute Agent</h3>
              <textarea
                className={styles.executeTextarea}
                value={executionInput}
                onChange={e => setExecutionInput(e.target.value)}
              />
              <button className={styles.btnPrimary} onClick={handleExecute} disabled={executing}>
                {executing ? (
                  <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Executing...</>
                ) : (
                  <><Play size={16} /> Execute Agent</>
                )}
              </button>

              {executionResult && (
                <div className={styles.resultBox}>
                  <div style={{ fontWeight: 600, marginBottom: 6, color: executionResult.success ? '#22c55e' : '#ef4444' }}>
                    {executionResult.success ? 'Success' : 'Failed'}
                    <span style={{ color: '#64748b', fontWeight: 'normal', marginLeft: 8 }}>
                      ({executionResult.duration_ms}ms)
                    </span>
                  </div>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 12, color: '#94a3b8', maxHeight: 200, overflow: 'auto' }}>
                    {JSON.stringify(executionResult.output || executionResult.error, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
