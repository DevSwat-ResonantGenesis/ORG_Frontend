/**
 * Agent Browser Page
 * Browse and execute agents on the decentralized network
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Search, 
  Play, 
  Shield, 
  Clock, 
  Hash,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { isAuthenticated } from '../../utils/auth-cookies';
import { 
  getNodeStatus, 
  searchAgents, 
  executeAgent,
  NodeStatus,
  Agent,
  ExecuteResponse
} from '../../services/nodeApi';

// Styles
const styles = {
  container: {
    padding: '0.5rem 1rem',
    maxWidth: '1400px',
    margin: '0 auto',
    height: '100%',
    maxHeight: 'calc(100vh - 56px)',
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
  },
  header: {
    marginBottom: '5px',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0',
    display: 'inline',
  },
  subtitle: {
    color: '#666',
    fontSize: '0.7rem',
    display: 'inline',
    marginLeft: '0.5rem',
  },
  statusBar: {
    display: 'flex',
    gap: '0.5rem',
    padding: '0.4rem 0.6rem',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '6px',
    marginBottom: '0.5rem',
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    color: '#888',
    fontSize: '0.7rem',
  },
  statusDot: (active: boolean) => ({
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: active ? '#10b981' : '#ef4444',
  }),
  searchBar: {
    display: 'inline-flex',
    gap: '1rem',
    marginBottom: '0.5rem',
    alignItems: 'center',
  },
  searchInput: {
    width: '150px',
    padding: '0.15rem 0',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.15)',
    color: '#888',
    fontSize: '0.7rem',
    outline: 'none',
  },
  filterSelect: {
    padding: '0.15rem 0',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.15)',
    color: '#888',
    fontSize: '0.7rem',
    outline: 'none',
    cursor: 'pointer',
  },
  agentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem',
  },
  agentCard: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '1.5rem',
    transition: 'all 0.2s',
  },
  agentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  agentName: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#fff',
  },
  agentVersion: {
    fontSize: '0.75rem',
    color: '#888',
    marginTop: '0.25rem',
  },
  trustBadge: (tier: number) => ({
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '500',
    background: tier >= 3 ? 'rgba(16,185,129,0.2)' : tier >= 2 ? 'rgba(59,130,246,0.2)' : 'rgba(251,191,36,0.2)',
    color: tier >= 3 ? '#10b981' : tier >= 2 ? '#3b82f6' : '#fbbf24',
  }),
  agentDescription: {
    color: '#aaa',
    fontSize: '0.875rem',
    marginBottom: '1rem',
    lineHeight: '1.5',
  },
  agentMeta: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
    flexWrap: 'wrap' as const,
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    color: '#888',
    fontSize: '0.75rem',
  },
  executeButton: {
    width: '100%',
    padding: '0.75rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  executionPanel: {
    marginTop: '1rem',
    padding: '1rem',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '8px',
  },
  inputArea: {
    width: '100%',
    padding: '0.75rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    marginBottom: '0.75rem',
    minHeight: '80px',
    resize: 'vertical' as const,
  },
  resultBox: {
    padding: '1rem',
    background: 'rgba(0,0,0,0.5)',
    borderRadius: '8px',
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    color: '#10b981',
    whiteSpace: 'pre-wrap' as const,
    maxHeight: '200px',
    overflow: 'auto',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '4rem 2rem',
    color: '#888',
  },
};

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
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState<string | null>(null);
  const [executionInput, setExecutionInput] = useState<Record<string, string>>({});
  const [executionResults, setExecutionResults] = useState<Record<string, ExecuteResponse>>({});

  // Redirect to signup if not logged in
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/signup', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    loadData();
  }, []);

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

  async function handleExecute(agent: Agent) {
    setExecuting(agent.manifest_hash);
    
    try {
      const rawInput = executionInput[agent.manifest_hash] || '';
      
      // Parse input - try JSON first, otherwise wrap as message
      let inputData: Record<string, unknown>;
      if (!rawInput.trim()) {
        // Empty input - use default
        inputData = { text: "hello", message: "hello" };
      } else {
        try {
          // Try to parse as JSON
          inputData = JSON.parse(rawInput);
        } catch {
          // Not valid JSON - wrap as text/content/message for compatibility
          const textValue = rawInput.trim();
          inputData = { text: textValue, content: textValue, message: textValue };
        }
      }
      
      const result = await executeAgent({
        manifest_hash: agent.manifest_hash,
        input_data: inputData,
        user_dsid: 'dsid-u-demo000000000000-0000',
        trust_tier: 1,
      });
      
      setExecutionResults(prev => ({
        ...prev,
        [agent.manifest_hash]: result,
      }));
    } catch (error) {
      setExecutionResults(prev => ({
        ...prev,
        [agent.manifest_hash]: {
          success: false,
          output: null,
          execution_hash: '',
          tokens_used: 0,
          duration_ms: 0,
          governance_decision: 'error',
          error: String(error),
        },
      }));
    } finally {
      setExecuting(null);
    }
  }

  const filteredAgents = agents.filter(agent => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesName = agent.name?.toLowerCase().includes(q);
      const matchesDesc = agent.description?.toLowerCase().includes(q);
      const matchesHash = agent.manifest_hash?.toLowerCase().includes(q);
      if (!matchesName && !matchesDesc && !matchesHash) return false;
    }
    if (category !== 'all' && agent.category !== category) {
      return false;
    }
    return true;
  });

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={styles.title}>Agent Browser</h1>
            <p style={styles.subtitle}>
              Discover and execute agents on the ResonantGenesis decentralized network
            </p>
          </div>
          <a
            href="/network/publish"
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              borderRadius: '8px',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            + Publish Agent
          </a>
        </div>
      </div>

      {/* Status Bar */}
      <div style={styles.statusBar}>
        <div style={styles.statusItem}>
          <div style={styles.statusDot(status?.running || false)} />
          Node: {status?.running ? 'Online' : 'Offline'}
        </div>
        <div style={styles.statusItem}>
          <div style={styles.statusDot(status?.runtime_active || false)} />
          Runtime: {status?.runtime_active ? 'Active' : 'Inactive'}
        </div>
        <div style={styles.statusItem}>
          <div style={styles.statusDot(status?.chain_connected || false)} />
          Chain: {status?.chain_connected ? 'Connected' : 'Offline'}
        </div>
        <div style={styles.statusItem}>
          Mode: {status?.mode || 'Unknown'}
        </div>
      </div>

      {/* Search Bar */}
      <div style={styles.searchBar}>
        <input
          type="text"
          placeholder="Search agents..."
          style={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select 
          style={styles.filterSelect}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="utility">Utility</option>
          <option value="analysis">Analysis</option>
          <option value="automation">Automation</option>
        </select>
      </div>

      {/* Agent Grid */}
      {loading ? (
        <div style={styles.emptyState}>
          <Loader2 size={48} style={{ animation: 'spin 1s linear infinite' }} />
          <p>Loading agents...</p>
        </div>
      ) : filteredAgents.length === 0 ? (
        <div style={styles.emptyState}>
          <Bot size={48} />
          <p>No agents found</p>
        </div>
      ) : (
        <div style={styles.agentGrid}>
          {filteredAgents.map(agent => (
            <div key={agent.manifest_hash} style={styles.agentCard}>
              <div style={styles.agentHeader}>
                <div>
                  <div style={styles.agentName}>{agent.name}</div>
                  <div style={styles.agentVersion}>v{agent.version}</div>
                </div>
                <div style={styles.trustBadge(agent.trust_tier)}>
                  <Shield size={12} /> T{agent.trust_tier}
                </div>
              </div>
              
              <p style={styles.agentDescription}>{agent.description}</p>
              
              <div style={styles.agentMeta}>
                <span style={styles.metaItem}>
                  <Hash size={12} /> {agent.manifest_hash.slice(0, 10)}...
                </span>
                <span style={styles.metaItem}>
                  <Clock size={12} /> {agent.execution_count} runs
                </span>
                <span style={styles.metaItem}>
                  {agent.status === 'Active' ? (
                    <CheckCircle size={12} color="#10b981" />
                  ) : (
                    <XCircle size={12} color="#ef4444" />
                  )}
                  {agent.status}
                </span>
              </div>

              {/* Execution Panel */}
              <div style={styles.executionPanel}>
                <textarea
                  style={styles.inputArea}
                  placeholder='Enter text or JSON, e.g. "hello" or {"message": "hello"}'
                  value={executionInput[agent.manifest_hash] || ''}
                  onChange={(e) => setExecutionInput(prev => ({
                    ...prev,
                    [agent.manifest_hash]: e.target.value,
                  }))}
                />
                
                <button
                  style={styles.executeButton}
                  onClick={() => handleExecute(agent)}
                  disabled={executing === agent.manifest_hash}
                >
                  {executing === agent.manifest_hash ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play size={16} />
                      Execute Agent
                    </>
                  )}
                </button>

                {executionResults[agent.manifest_hash] && (
                  <div style={{ ...styles.resultBox, marginTop: '0.75rem' }}>
                    {executionResults[agent.manifest_hash].success ? (
                      JSON.stringify(executionResults[agent.manifest_hash].output, null, 2)
                    ) : (
                      <span style={{ color: '#ef4444' }}>
                        Error: {executionResults[agent.manifest_hash].error}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Minimal Footer */}
      <div style={{ marginTop: '1rem', padding: '6px 0', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <a 
          href="https://sepolia.basescan.org/address/0x10E3079926f6C5790228d0e5f164E506AE96F3Ea"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#666', fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
        >
          BaseScan <ExternalLink size={10} />
        </a>
      </div>
    </div>
  );
}
