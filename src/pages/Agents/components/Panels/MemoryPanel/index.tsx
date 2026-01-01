import React, { memo, useState, useCallback, useEffect } from 'react';
import { useAgentStore } from '../../../../../stores';
import { Icons } from '../../shared/Icons';
import * as memoryApi from '../../../../../api/memory';
import styles from './MemoryPanel.module.css';

// ============== MEMORY PANEL ==============
// Contract: reads [agent, execution], writes [agent]
// Forbidden: [economy]

interface MemoryEntry {
  id: string;
  type: 'short_term' | 'long_term' | 'vector';
  content: string;
  timestamp: Date;
  agentId: string;
  relevance?: number;
  tokens?: number;
}

interface MemoryPanelProps {
  className?: string;
}

const MemoryPanelComponent: React.FC<MemoryPanelProps> = ({ className }) => {
  const agents = useAgentStore(state => state.agents);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'short_term' | 'long_term' | 'vector'>('short_term');
  const [searchQuery, setSearchQuery] = useState('');
  const [memories, setMemories] = useState<memoryApi.MemoryRecord[]>([]);
  const [anchors, setAnchors] = useState<memoryApi.MemoryAnchor[]>([]);
  const [stats, setStats] = useState<memoryApi.MemoryStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  // Fetch memories from backend
  const fetchMemories = useCallback(async () => {
    if (!selectedAgentId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      if (searchQuery) {
        // Search memories
        const results = await memoryApi.retrieveMemories({
          user_id: selectedAgentId,
          query: searchQuery,
          limit: 50,
        });
        setMemories(results);
      } else {
        // Get all memories (could filter by source based on tab)
        const results = await memoryApi.retrieveMemories({
          user_id: selectedAgentId,
          query: '',
          limit: 100,
          use_vector_search: false,
        });
        setMemories(results);
      }
    } catch (err: any) {
      console.error('Failed to fetch memories:', err);
      setError(err.message || 'Failed to load memories');
    } finally {
      setIsLoading(false);
    }
  }, [selectedAgentId, searchQuery]);

  // Fetch anchors
  const fetchAnchors = useCallback(async () => {
    if (!selectedAgentId) return;
    try {
      const anchorList = await memoryApi.listAnchors(selectedAgentId, 50);
      setAnchors(anchorList);
    } catch (err: any) {
      console.error('Failed to fetch anchors:', err);
    }
  }, [selectedAgentId]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    if (!selectedAgentId) return;
    try {
      const memoryStats = await memoryApi.getMemoryStats(selectedAgentId);
      setStats(memoryStats);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
    }
  }, [selectedAgentId]);

  useEffect(() => {
    fetchMemories();
    fetchAnchors();
    fetchStats();
  }, [fetchMemories, fetchAnchors, fetchStats]);

  // Convert memories to display format
  const memoryEntries: MemoryEntry[] = memories.map(mem => ({
    id: mem.id,
    type: activeTab,
    content: mem.content,
    timestamp: mem.created_at ? new Date(mem.created_at) : new Date(),
    agentId: mem.user_id || selectedAgentId || '',
    relevance: mem.similarity,
  }));

  const filteredEntries = memoryEntries.filter(entry => {
    if (entry.type !== activeTab) return false;
    if (searchQuery) {
      return entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const memoryStats = {
    shortTerm: { count: memories.length, tokens: 0 },
    longTerm: { count: stats?.total_memories || 0, size: memoryApi.formatStorageSize(stats?.storage_size_mb || 0) },
    vector: { count: stats?.total_embeddings || 0, chunks: anchors.length },
  };

  const handleDeleteMemory = async (memoryId: string) => {
    if (!confirm('Are you sure you want to delete this memory?')) return;
    try {
      await memoryApi.deleteMemory(memoryId);
      await fetchMemories();
    } catch (err: any) {
      setError(err.message || 'Failed to delete memory');
    }
  };

  return (
    <div className={`${styles.panel} ${className || ''}`}>
      <div className={styles.panelHeader}>
        <h2><Icons.Memory /> Agent Memory</h2>
        <div className={styles.agentSelector}>
          <select 
            value={selectedAgentId || ''} 
            onChange={e => setSelectedAgentId(e.target.value)}
          >
            <option value="">Select Agent</option>
            {agents.map(agent => (
              <option key={agent.id} value={agent.id}>{agent.name}</option>
            ))}
            {agents.length === 0 && (
              <option value="" disabled>No agents available - create one first</option>
            )}
          </select>
        </div>
      </div>

      <div className={styles.panelContent}>
        {/* Error Message */}
        {error && (
          <div className={styles.errorBanner}>
            <Icons.XCircle />
            <span>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className={styles.loadingBanner}>
            <span>Loading memories...</span>
          </div>
        )}
        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h4>Short-Term Memory</h4>
            <div className={styles.statValue}>{memoryStats.shortTerm.count}</div>
            <div className={styles.statMeta}>{memoryStats.shortTerm.tokens} tokens</div>
          </div>
          <div className={styles.statCard}>
            <h4>Long-Term Memory</h4>
            <div className={styles.statValue}>{memoryStats.longTerm.count}</div>
            <div className={styles.statMeta}>{memoryStats.longTerm.size}</div>
          </div>
          <div className={styles.statCard}>
            <h4>Vector Store</h4>
            <div className={styles.statValue}>{memoryStats.vector.count}</div>
            <div className={styles.statMeta}>{memoryStats.vector.chunks} chunks</div>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabsBar}>
          <div className={styles.tabs}>
            {(['short_term', 'long_term', 'vector'] as const).map(tab => (
              <button
                key={tab}
                className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'short_term' && 'Short-Term'}
                {tab === 'long_term' && 'Long-Term'}
                {tab === 'vector' && 'Vector Store'}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search memories..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Memory List */}
        <div className={styles.memoryList}>
          {filteredEntries.map(entry => (
            <div key={entry.id} className={styles.memoryCard}>
              <div className={styles.memoryHeader}>
                <span className={styles.memoryType}>{entry.type.replace('_', ' ')}</span>
                <span className={styles.memoryTime}>
                  {entry.timestamp.toLocaleString()}
                </span>
              </div>
              <div className={styles.memoryContent}>{entry.content}</div>
              <div className={styles.memoryMeta}>
                {entry.tokens && <span><Icons.Zap /> {entry.tokens} tokens</span>}
                {entry.relevance && (
                  <span className={styles.relevance}>
                    Relevance: {(entry.relevance * 100).toFixed(0)}%
                  </span>
                )}
              </div>
              <div className={styles.memoryActions}>
                <button className={styles.viewBtn}><Icons.Eye /> View</button>
                <button 
                  className={styles.deleteBtn}
                  onClick={() => handleDeleteMemory(entry.id)}
                >
                  <Icons.Trash /> Delete
                </button>
              </div>
            </div>
          ))}
          {filteredEntries.length === 0 && (
            <div className={styles.emptyState}>
              <Icons.Memory />
              <p>No memories found</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={styles.actionsBar}>
          <button className={styles.clearBtn}>
            <Icons.Trash /> Clear Short-Term
          </button>
          <button className={styles.exportBtn}>
            <Icons.Download /> Export All
          </button>
          <button className={styles.syncBtn}>
            <Icons.Refresh /> Sync Vector Store
          </button>
        </div>
      </div>
    </div>
  );
};

export const MemoryPanel = memo(MemoryPanelComponent);
export default MemoryPanel;
