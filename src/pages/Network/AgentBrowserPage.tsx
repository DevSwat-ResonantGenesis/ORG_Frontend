/**
 * Agent Browser Page
 * Browse and execute agents on the decentralized network
 * Redesigned: dashboardicons.com/community grid + haveibeenpwned detail card
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, Search, Play, Shield, Clock, Hash,
  CheckCircle, XCircle, Loader2, ExternalLink,
  ArrowLeft, Copy, Zap, Code, Wrench, Database, Settings,
} from 'lucide-react';
import { isAuthenticated } from '../../utils/auth-cookies';
import { 
  getNodeStatus, searchAgents, executeAgent,
  NodeStatus, Agent, ExecuteResponse
} from '../../services/nodeApi';
import styles from './NetworkGrid.module.css';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'utility', label: 'Utility' },
  { id: 'analysis', label: 'Analysis' },
  { id: 'automation', label: 'Automation' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'developer-tools', label: 'Dev Tools' },
  { id: 'data', label: 'Data' },
  { id: 'security', label: 'Security' },
];

function getCategoryIcon(cat: string) {
  switch (cat) {
    case 'utility': return <Wrench size={36} />;
    case 'analysis': return <Zap size={36} />;
    case 'automation': return <Settings size={36} />;
    case 'developer-tools': return <Code size={36} />;
    case 'data': return <Database size={36} />;
    case 'security': return <Shield size={36} />;
    default: return <Bot size={36} />;
  }
}

// Published agents (from Base Sepolia chain)
const DEMO_AGENTS: Agent[] = [
  {
    manifest_hash: 'PRIVATE_KEY_PLACEHOLDER_2',
    name: 'Hello World Agent',
    version: '1.0.0',
    description: 'A simple reference agent that demonstrates the ResonantGenesis agent manifest format and basic agent structure.',
    category: 'utility',
    trust_tier: 1,
    status: 'Active',
    owner_dsid: 'PRIVATE_KEY_PLACEHOLDER_1',
    execution_count: 0,
  },
  {
    manifest_hash: 'PRIVATE_KEY_PLACEHOLDER_3',
    name: 'Code Analyzer Agent',
    version: '1.0.0',
    description: 'Analyzes code snippets for complexity, security issues, and best practices. Provides actionable recommendations for improvement.',
    category: 'analysis',
    trust_tier: 1,
    status: 'Active',
    owner_dsid: 'PRIVATE_KEY_PLACEHOLDER_1',
    execution_count: 0,
  }
];

export default function AgentBrowserPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<NodeStatus | null>(null);
  const [agents, setAgents] = useState<Agent[]>(DEMO_AGENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'name'>('popular');
  const [loading, setLoading] = useState(true);

  // Detail modal
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [executing, setExecuting] = useState(false);
  const [executionInput, setExecutionInput] = useState('');
  const [executionResult, setExecutionResult] = useState<ExecuteResponse | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/signup', { replace: true });
    }
  }, [navigate]);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const nodeStatus = await getNodeStatus();
      setStatus(nodeStatus);
      const { agents: fetchedAgents } = await searchAgents();
      if (fetchedAgents.length > 0) {
        setAgents(fetchedAgents);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleExecute() {
    if (!selectedAgent) return;
    setExecuting(true);
    setExecutionResult(null);
    try {
      const rawInput = executionInput || '';
      let inputData: Record<string, unknown>;
      if (!rawInput.trim()) {
        inputData = { text: "hello", message: "hello" };
      } else {
        try { inputData = JSON.parse(rawInput); }
        catch { const t = rawInput.trim(); inputData = { text: t, content: t, message: t }; }
      }
      const result = await executeAgent({
        manifest_hash: selectedAgent.manifest_hash,
        input_data: inputData,
        user_dsid: 'dsid-u-demo000000000000-0000',
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
    setExecutionInput('');
  }

  // Filter and sort
  const filtered = agents.filter(a => {
    if (category !== 'all' && a.category !== category) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return a.name?.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q) || a.manifest_hash?.toLowerCase().includes(q);
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'popular') return (b.execution_count || 0) - (a.execution_count || 0);
    if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
    return 0; // newest - keep order
  });

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Agent Browser</h1>
        <p className={styles.heroSub}>
          Discover and execute agents on the ResonantGenesis decentralized network
        </p>
      </div>

      {/* Status bar */}
      <div className={styles.statusBar}>
        <div className={styles.statusItem}>
          <span className={`${styles.statusDot} ${status?.running ? styles.statusDotOnline : styles.statusDotOffline}`} />
          Node: {status?.running ? 'Online' : 'Offline'}
        </div>
        <span className={styles.statusSep}>|</span>
        <div className={styles.statusItem}>
          <span className={`${styles.statusDot} ${status?.runtime_active ? styles.statusDotOnline : styles.statusDotOffline}`} />
          Runtime: {status?.runtime_active ? 'Active' : 'Inactive'}
        </div>
        <span className={styles.statusSep}>|</span>
        <div className={styles.statusItem}>
          <span className={`${styles.statusDot} ${status?.chain_connected ? styles.statusDotOnline : styles.statusDotOffline}`} />
          Chain: {status?.chain_connected ? 'Connected' : 'Offline'}
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
          placeholder="Search agents by name, description, or hash..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category pills */}
      <div className={styles.pills}>
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            className={`${styles.pill} ${category === c.id ? styles.pillActive : ''}`}
            onClick={() => setCategory(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Sort bar */}
      <div className={styles.sortBar}>
        <span className={styles.sortLabel}>{sorted.length} agent{sorted.length !== 1 ? 's' : ''}</span>
        <div className={styles.sortBtns}>
          {(['popular', 'newest', 'name'] as const).map(s => (
            <button key={s} className={`${styles.sortBtn} ${sortBy === s ? styles.sortBtnActive : ''}`} onClick={() => setSortBy(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className={styles.loading}><div className={styles.spinner} />Loading agents...</div>
      ) : sorted.length === 0 ? (
        <div className={styles.emptyState}>
          <Bot size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p>No agents found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className={styles.iconGrid}>
          {sorted.map(agent => (
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

      {/* Detail modal */}
      {selectedAgent && (
        <div className={styles.overlay} onClick={closeDetail}>
          <div className={styles.detailPanel} onClick={e => e.stopPropagation()}>
            <button className={styles.detailBack} onClick={closeDetail}>
              <ArrowLeft size={14} /> Back to browser
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
                <span className={styles.statChipValue}>{selectedAgent.execution_count || 0}</span> runs
              </div>
              <div className={styles.statChip}>
                <Shield size={14} />
                Trust <span className={styles.statChipValue}>T{selectedAgent.trust_tier}</span>
              </div>
              <div className={styles.statChip}>
                {selectedAgent.status === 'Active' ? <CheckCircle size={14} color="#22c55e" /> : <XCircle size={14} color="#ef4444" />}
                <span className={styles.statChipValue}>{selectedAgent.status}</span>
              </div>
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

            {/* Tags */}
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
                placeholder='Enter text or JSON, e.g. "hello" or {"message": "hello"}'
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
                <div className={`${styles.resultBox} ${!executionResult.success ? styles.resultError : ''}`}>
                  {executionResult.success
                    ? JSON.stringify(executionResult.output, null, 2)
                    : `Error: ${executionResult.error}`
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
