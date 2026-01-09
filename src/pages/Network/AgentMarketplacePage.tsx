import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../../utils/auth-cookies';
import {
  Search,
  Filter,
  Star,
  Download,
  Play,
  ChevronRight,
  Shield,
  Clock,
  Tag,
  User,
  Code,
  Zap,
  TrendingUp,
  Award,
  X,
  ExternalLink,
  Copy,
  CheckCircle,
  Bot,
  Wrench,
  BarChart3,
  Settings,
  Database,
  Plus,
} from 'lucide-react';
import { getNodeStatus, searchAgents, executeAgent, type Agent, type NodeStatus, type ExecuteResponse } from '../../services/nodeApi';

const ICON_MAP: Record<string, React.ReactNode> = {
  bot: <Bot size={14} />,
  wrench: <Wrench size={14} />,
  chart: <BarChart3 size={14} />,
  zap: <Zap size={14} />,
  code: <Code size={14} />,
  cog: <Settings size={14} />,
  database: <Database size={14} />,
  shield: <Shield size={14} />,
};

const CATEGORIES = [
  { id: 'all', name: 'All Agents', icon: 'bot', count: 0 },
  { id: 'utility', name: 'Utility', icon: 'wrench', count: 0 },
  { id: 'analysis', name: 'Analysis', icon: 'chart', count: 0 },
  { id: 'productivity', name: 'Productivity', icon: 'zap', count: 0 },
  { id: 'developer-tools', name: 'Developer Tools', icon: 'code', count: 0 },
  { id: 'automation', name: 'Automation', icon: 'cog', count: 0 },
  { id: 'data', name: 'Data', icon: 'database', count: 0 },
  { id: 'security', name: 'Security', icon: 'shield', count: 0 },
];

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: '100%',
    maxHeight: 'calc(100vh - 56px)',
    background: 'linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)',
    color: '#fff',
    display: 'flex',
    overflow: 'hidden',
  },
  sidebar: {
    width: '200px',
    borderRight: '1px solid rgba(255,255,255,0.05)',
    padding: '0.5rem',
    position: 'relative' as const,
    height: '100%',
    overflowY: 'auto' as const,
    flexShrink: 0,
  },
  sidebarTitle: {
    fontSize: '0.65rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    color: '#666',
    marginBottom: '0.5rem',
    padding: '0 0.5rem',
  },
  categoryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.4rem 0.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: '0.1rem',
  },
  categoryItemActive: {
    background: 'rgba(99,102,241,0.2)',
    color: '#6366f1',
  },
  categoryIcon: {
    fontSize: '1rem',
  },
  categoryName: {
    flex: 1,
    fontSize: '0.75rem',
  },
  categoryCount: {
    fontSize: '0.6rem',
    color: '#666',
    background: 'rgba(255,255,255,0.05)',
    padding: '0.1rem 0.3rem',
    borderRadius: '6px',
  },
  main: {
    flex: 1,
    padding: '0.5rem 1rem',
    overflowY: 'auto' as const,
    height: '100%',
  },
  header: {
    marginBottom: '5px',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
  },
  searchBar: {
    display: 'inline-flex',
    gap: '0.5rem',
    marginBottom: '0.5rem',
    alignItems: 'center',
  },
  searchInput: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.15)',
  },
  input: {
    width: '120px',
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: '0.7rem',
    outline: 'none',
    padding: '0.15rem 0',
  },
  featuredSection: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.125rem',
    fontWeight: '600',
    marginBottom: '1rem',
  },
  featuredGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
  },
  featuredCard: {
    background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.1) 100%)',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: '12px',
    padding: '1.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  agentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem',
  },
  agentCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '1.25rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  agentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem',
  },
  agentName: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  agentVersion: {
    fontSize: '0.75rem',
    color: '#888',
  },
  trustBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    background: 'rgba(16,185,129,0.2)',
    color: '#10b981',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: '500',
  },
  agentDescription: {
    fontSize: '0.8rem',
    color: '#aaa',
    lineHeight: '1.5',
    marginBottom: '1rem',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  },
  agentTags: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  agentTag: {
    padding: '0.25rem 0.5rem',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '4px',
    fontSize: '0.7rem',
    color: '#888',
  },
  agentFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '8px',
    paddingTop: '8px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  agentStats: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.75rem',
    color: '#666',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  runButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.5rem 0.75rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  // Modal styles
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '2rem',
  },
  modal: {
    background: '#1a1a24',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '550px',
    maxHeight: '80vh',
    overflow: 'auto' as const,
    position: 'relative' as const,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '1.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  modalClose: {
    background: 'none',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    padding: '0.5rem',
  },
  modalBody: {
    padding: '1.5rem',
  },
  modalSection: {
    marginBottom: '1.5rem',
  },
  modalSectionTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
    color: '#888',
  },
  capabilityList: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
  },
  capability: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.375rem 0.75rem',
    background: 'rgba(99,102,241,0.1)',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: '6px',
    fontSize: '0.75rem',
    color: '#6366f1',
  },
  codeBlock: {
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '8px',
    padding: '1rem',
    fontFamily: 'monospace',
    fontSize: '0.8rem',
    color: '#10b981',
    overflow: 'auto' as const,
  },
  executeSection: {
    padding: '1.5rem',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(0,0,0,0.2)',
  },
  executeButton: {
    width: '100%',
    padding: '0.875rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  resultBox: {
    marginTop: '1rem',
    padding: '1rem',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '8px',
  },
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    fontSize: '0.8rem',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '4rem 2rem',
    color: '#666',
  },
};

export default function AgentMarketplacePage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<NodeStatus | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [executing, setExecuting] = useState(false);
  const [executionInput, setExecutionInput] = useState('{"message": "hello"}');
  const [executionResult, setExecutionResult] = useState<ExecuteResponse | null>(null);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  // Redirect to signup if not logged in
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/signup', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    loadStatus();
    loadAllAgents();
  }, []);

  useEffect(() => {
    loadAgents();
  }, [selectedCategory, searchQuery]);

  async function loadStatus() {
    try {
      const nodeStatus = await getNodeStatus();
      setStatus(nodeStatus);
    } catch (error) {
      console.error('Failed to load status:', error);
    }
  }

  async function loadAllAgents() {
    try {
      const { agents: allAgents } = await searchAgents();
      // Count by category
      const counts: Record<string, number> = { all: allAgents?.length || 0 };
      allAgents?.forEach(agent => {
        counts[agent.category] = (counts[agent.category] || 0) + 1;
      });
      setCategoryCounts(counts);
    } catch (error) {
      console.error('Failed to count agents:', error);
      // Set default counts when API fails
      setCategoryCounts({ all: 0 });
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
      // Set empty array when API fails
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
      // Parse input - try JSON first, otherwise wrap as message
      let inputData: Record<string, unknown>;
      if (!executionInput.trim()) {
        // Empty input - use default
        inputData = { text: "hello", message: "hello" };
      } else {
        try {
          // Try to parse as JSON
          inputData = JSON.parse(executionInput);
        } catch {
          // Not valid JSON - wrap as text/content/message for compatibility
          const textValue = executionInput.trim();
          inputData = { text: textValue, content: textValue, message: textValue };
        }
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
        success: false,
        output: null,
        execution_hash: '',
        tokens_used: 0,
        duration_ms: 0,
        governance_decision: 'error',
        error: String(error),
      });
    } finally {
      setExecuting(false);
    }
  }

  const featuredAgents = agents?.slice(0, 2) || [];

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarTitle}>Categories</div>
        {CATEGORIES.map(cat => (
          <div
            key={cat.id}
            style={{
              ...styles.categoryItem,
              ...(selectedCategory === cat.id ? styles.categoryItemActive : {}),
            }}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <span style={styles.categoryIcon}>{ICON_MAP[cat.icon] || cat.icon}</span>
            <span style={styles.categoryName}>{cat.name}</span>
            {categoryCounts[cat.id] !== undefined && (
              <span style={styles.categoryCount}>{categoryCounts[cat.id]}</span>
            )}
          </div>
        ))}

        <div style={{ ...styles.sidebarTitle, marginTop: '2rem' }}>Quick Links</div>
        <Link to="/network/publish" style={{ ...styles.categoryItem, textDecoration: 'none', color: 'inherit' }}>
          <Plus size={14} color="#888" />
          <span style={styles.categoryName}>Publish Agent</span>
        </Link>
        <Link to="/network/agents" style={{ ...styles.categoryItem, textDecoration: 'none', color: 'inherit' }}>
          <Search size={14} color="#888" />
          <span style={styles.categoryName}>Agent Browser</span>
        </Link>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTop}>
            <h1 style={styles.title}>🌐 DSID Network Marketplace</h1>
            <p style={{ fontSize: '0.85rem', color: '#888', margin: '4px 0 0 0' }}>
              DSID-verified (Trust Level T3) agents only - Decentralized & cryptographically verified
            </p>
          </div>

          {/* Status Bar */}
          <div style={styles.statusBar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ ...styles.statusDot, background: status?.running ? '#10b981' : '#ef4444' }} />
              RARA Node: {status?.running ? 'Online' : 'Offline'}
            </div>
            <div style={{ color: '#666' }}>|</div>
            <div>{categoryCounts.all || 0} verified agents</div>
          </div>

          {/* Search */}
          <div style={styles.searchBar}>
            <div style={styles.searchInput}>
              <Search size={18} color="#666" />
              <input
                type="text"
                placeholder="Search agents by name..."
                style={styles.input}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Featured Section */}
        {selectedCategory === 'all' && featuredAgents.length > 0 && (
          <div style={styles.featuredSection}>
            <div style={styles.sectionTitle}>
              <Award size={18} color="#fbbf24" />
              Featured Agents
            </div>
            <div style={styles.featuredGrid}>
              {featuredAgents.map(agent => (
                <div
                  key={agent.manifest_hash}
                  style={styles.featuredCard}
                  onClick={() => setSelectedAgent(agent)}
                >
                  <div style={styles.agentHeader}>
                    <div>
                      <div style={styles.agentName}>{agent.name}</div>
                      <div style={styles.agentVersion}>v{agent.version}</div>
                    </div>
                    <div style={styles.trustBadge}>
                      <Shield size={12} />
                      Tier {agent.trust_tier}
                    </div>
                  </div>
                  <div style={styles.agentDescription}>{agent.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Agents */}
        <div>
          <div style={styles.sectionTitle}>
            <Zap size={18} color="#6366f1" />
            {selectedCategory === 'all' ? 'All Agents' : CATEGORIES.find(c => c.id === selectedCategory)?.name}
          </div>

          {loading ? (
            <div style={styles.emptyState}>Loading agents...</div>
          ) : agents.length === 0 ? (
            <div style={styles.emptyState}>
              No agents found. Try a different search or category.
            </div>
          ) : (
            <div style={styles.agentGrid}>
              {agents.map(agent => (
                <div
                  key={agent.manifest_hash}
                  style={styles.agentCard}
                  onClick={() => setSelectedAgent(agent)}
                >
                  <div style={styles.agentHeader}>
                    <div>
                      <div style={styles.agentName}>{agent.name}</div>
                      <div style={styles.agentVersion}>v{agent.version}</div>
                    </div>
                    <div style={styles.trustBadge}>
                      <Shield size={12} />
                      T{agent.trust_tier}
                    </div>
                  </div>
                  <div style={styles.agentDescription}>{agent.description}</div>
                  <div style={styles.agentTags}>
                    <span style={styles.agentTag}>{agent.category}</span>
                  </div>
                  <div style={styles.agentFooter}>
                    <div style={styles.agentStats}>
                      <div style={styles.statItem}>
                        <Play size={12} />
                        {agent.execution_count}
                      </div>
                    </div>
                    <button
                      style={styles.runButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAgent(agent);
                      }}
                    >
                      <Play size={14} />
                      Run
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <div style={styles.modalOverlay} onClick={() => setSelectedAgent(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                  {selectedAgent.name}
                </div>
                <div style={{ color: '#888', fontSize: '0.875rem' }}>
                  v{selectedAgent.version} • {selectedAgent.category}
                </div>
              </div>
              <button style={styles.modalClose} onClick={() => setSelectedAgent(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.modalSection}>
                <div style={styles.modalSectionTitle}>Description</div>
                <p style={{ color: '#ccc', lineHeight: '1.6', margin: 0 }}>
                  {selectedAgent.description}
                </p>
              </div>

              <div style={styles.modalSection}>
                <div style={styles.modalSectionTitle}>Details</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ color: '#666', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Trust Tier</div>
                    <div style={styles.trustBadge}>
                      <Shield size={12} />
                      Tier {selectedAgent.trust_tier}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#666', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Status</div>
                    <div style={{ color: '#10b981', fontSize: '0.875rem' }}>
                      <CheckCircle size={14} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
                      {selectedAgent.status}
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.modalSection}>
                <div style={styles.modalSectionTitle}>Manifest Hash</div>
                <div style={{ ...styles.codeBlock, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <code>{selectedAgent.manifest_hash.slice(0, 30)}...{selectedAgent.manifest_hash.slice(-8)}</code>
                  <button
                    style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
                    onClick={() => navigator.clipboard.writeText(selectedAgent.manifest_hash)}
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div style={styles.executeSection}>
              <div style={styles.modalSectionTitle}>Execute Agent</div>
              <textarea
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#10b981',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  resize: 'vertical' as const,
                  minHeight: '80px',
                  marginBottom: '1rem',
                }}
                value={executionInput}
                onChange={(e) => setExecutionInput(e.target.value)}
              />
              <button
                style={{
                  ...styles.executeButton,
                  opacity: executing ? 0.7 : 1,
                }}
                onClick={handleExecute}
                disabled={executing}
              >
                {executing ? 'Executing...' : (
                  <>
                    <Play size={16} />
                    Execute Agent
                  </>
                )}
              </button>

              {executionResult && (
                <div style={styles.resultBox}>
                  <div style={{
                    color: executionResult.success ? '#10b981' : '#ef4444',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                  }}>
                    {executionResult.success ? '✅ Success' : '❌ Failed'}
                    <span style={{ color: '#666', fontWeight: 'normal', marginLeft: '0.5rem' }}>
                      ({executionResult.duration_ms}ms)
                    </span>
                  </div>
                  <pre style={{
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.75rem',
                    color: '#aaa',
                    maxHeight: '200px',
                    overflow: 'auto',
                  }}>
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
