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

function useTheme() {
  const [isLight, setIsLight] = React.useState(() => document.documentElement.getAttribute('data-theme') === 'light');
  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLight(document.documentElement.getAttribute('data-theme') === 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);
  return isLight;
}

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

function getStyles(light: boolean): Record<string, React.CSSProperties> {
  const bg = light ? '#fafafa' : 'linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)';
  const fg = light ? '#1D1D1F' : '#fff';
  const fg2 = light ? '#6b7280' : '#888';
  const fg3 = light ? '#9ca3af' : '#666';
  const fg4 = light ? '#4b5563' : '#aaa';
  const border1 = light ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.05)';
  const border2 = light ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
  const surface = light ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)';
  const surfaceHover = light ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)';
  const surfaceSubtle = light ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)';
  const modalBg = light ? '#ffffff' : '#1a1a24';
  const overlayBg = light ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.9)';
  const codeBlockBg = light ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.3)';
  const skeletonLine = light
    ? 'linear-gradient(90deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.04) 100%)'
    : 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)';

  return {
    container: {
      height: '100%',
      maxHeight: 'calc(100vh - 56px)',
      background: bg,
      color: fg,
      display: 'flex',
      overflow: 'hidden',
    },
    sidebar: {
      width: '200px',
      borderRight: `1px solid ${border1}`,
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
      color: fg3,
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
      color: fg4,
    },
    categoryItemActive: {
      background: light ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.2)',
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
      color: fg3,
      background: surfaceSubtle,
      padding: '0.1rem 0.3rem',
      borderRadius: '6px',
    },
    main: {
      flex: 1,
      padding: '0.5rem 1rem',
      overflowY: 'auto' as const,
      minHeight: 0,
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
      color: fg,
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
      borderBottom: `1px solid ${border2}`,
    },
    input: {
      width: '120px',
      background: 'none',
      border: 'none',
      color: fg2,
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
      color: fg,
    },
    featuredGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
    },
    featuredCard: {
      background: light
        ? 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.04) 100%)'
        : 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.1) 100%)',
      border: `1px solid ${light ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.3)'}`,
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
      background: surface,
      border: `1px solid ${border2}`,
      borderRadius: '12px',
      padding: '1.25rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative' as const,
    },
    agentCardHover: {
      background: surfaceHover,
      borderColor: 'rgba(99,102,241,0.3)',
      transform: 'translateY(-2px)',
      boxShadow: light ? '0 4px 12px rgba(0,0,0,0.08)' : '0 4px 12px rgba(0,0,0,0.2)',
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
      color: fg,
    },
    agentVersion: {
      fontSize: '0.75rem',
      color: fg2,
    },
    trustBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.25rem 0.5rem',
      background: light ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.2)',
      color: '#10b981',
      borderRadius: '4px',
      fontSize: '0.7rem',
      fontWeight: '500',
    },
    agentDescription: {
      fontSize: '0.8rem',
      color: fg4,
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
      background: surfaceSubtle,
      borderRadius: '4px',
      fontSize: '0.7rem',
      color: fg2,
    },
    agentFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '8px',
      paddingTop: '8px',
      borderTop: `1px solid ${border1}`,
    },
    agentStats: {
      display: 'flex',
      gap: '1rem',
      fontSize: '0.75rem',
      color: fg3,
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
    modalOverlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: overlayBg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '2rem',
    },
    modal: {
      background: modalBg,
      borderRadius: '12px',
      width: '100%',
      maxWidth: '550px',
      maxHeight: '80vh',
      overflow: 'auto' as const,
      position: 'relative' as const,
      boxShadow: light ? '0 25px 50px -12px rgba(0,0,0,0.15)' : '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      border: light ? '1px solid rgba(0,0,0,0.1)' : 'none',
      color: fg,
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: '1.5rem',
      borderBottom: `1px solid ${border2}`,
    },
    modalClose: {
      background: 'none',
      border: 'none',
      color: fg2,
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
      color: fg2,
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
      background: light ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.1)',
      border: '1px solid rgba(99,102,241,0.3)',
      borderRadius: '6px',
      fontSize: '0.75rem',
      color: '#6366f1',
    },
    codeBlock: {
      background: codeBlockBg,
      borderRadius: '8px',
      padding: '1rem',
      fontFamily: 'monospace',
      fontSize: '0.8rem',
      color: '#10b981',
      overflow: 'auto' as const,
    },
    executeSection: {
      padding: '1.5rem',
      borderTop: `1px solid ${border2}`,
      background: codeBlockBg,
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
      background: codeBlockBg,
      borderRadius: '8px',
    },
    statusBar: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '0.75rem 1rem',
      background: surface,
      borderRadius: '8px',
      marginBottom: '1.5rem',
      fontSize: '0.8rem',
      color: fg4,
    },
    statusDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
    },
    emptyState: {
      textAlign: 'center' as const,
      padding: '4rem 2rem',
      color: fg3,
    },
    skeletonCard: {
      background: surface,
      border: `1px solid ${border2}`,
      borderRadius: '12px',
      padding: '1.25rem',
      animation: 'pulse 1.5s ease-in-out infinite',
    },
    skeletonLine: {
      background: skeletonLine,
      borderRadius: '4px',
      animation: 'shimmer 1.5s ease-in-out infinite',
    },
    skeletonTitle: {
      height: '20px',
      width: '60%',
      marginBottom: '8px',
    },
    skeletonText: {
      height: '14px',
      width: '40%',
      marginBottom: '12px',
    },
    skeletonDescription: {
      height: '40px',
      width: '100%',
      marginBottom: '12px',
    },
    skeletonTag: {
      height: '24px',
      width: '80px',
      marginBottom: '12px',
    },
    skeletonFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '12px',
      borderTop: `1px solid ${border1}`,
    },
    skeletonStats: {
      height: '16px',
      width: '100px',
    },
    skeletonButton: {
      height: '32px',
      width: '70px',
      borderRadius: '6px',
    },
  };
}

type SortOption = 'newest' | 'popular' | 'rating' | 'name';

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'newest', label: 'Newest' },
  { id: 'popular', label: 'Most Popular' },
  { id: 'rating', label: 'Highest Rated' },
  { id: 'name', label: 'Name A-Z' },
];

export default function AgentMarketplacePage() {
  const navigate = useNavigate();
  const isLight = useTheme();
  const styles = getStyles(isLight);
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
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

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

  // Sort agents based on selected sort option
  const sortedAgents = [...(agents || [])].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      case 'popular':
        return (b.execution_count || 0) - (a.execution_count || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      default:
        return 0;
    }
  });

  // Filter by search query
  const filteredAgents = sortedAgents.filter(agent => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      agent.name?.toLowerCase().includes(query) ||
      agent.description?.toLowerCase().includes(query) ||
      agent.manifest_hash?.toLowerCase().includes(query) ||
      agent.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  });

  const featuredAgents = filteredAgents?.slice(0, 2) || [];

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
          <Plus size={14} color={isLight ? '#6b7280' : '#888'} />
          <span style={styles.categoryName}>Publish Agent</span>
        </Link>
        <Link to="/network/agents" style={{ ...styles.categoryItem, textDecoration: 'none', color: 'inherit' }}>
          <Search size={14} color={isLight ? '#6b7280' : '#888'} />
          <span style={styles.categoryName}>Agent Browser</span>
        </Link>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTop}>
            <h1 style={styles.title}>🌐 DSID Network Marketplace</h1>
            <p style={{ fontSize: '0.85rem', color: isLight ? '#6b7280' : '#888', margin: '4px 0 0 0' }}>
              DSID-verified (Trust Level T3) agents only - Decentralized & cryptographically verified
            </p>
          </div>

          {/* Status Bar */}
          <div style={styles.statusBar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ ...styles.statusDot, background: status?.running ? '#10b981' : '#ef4444' }} />
              RARA Node: {status?.running ? 'Online' : 'Offline'}
            </div>
            <div style={{ color: isLight ? '#9ca3af' : '#666' }}>|</div>
            <div>{categoryCounts.all || 0} verified agents</div>
          </div>

          {/* Search and Sort */}
          <div style={styles.searchBar}>
            <div style={styles.searchInput}>
              <Search size={18} color={isLight ? '#9ca3af' : '#666'} />
              <input
                type="text"
                placeholder="Search agents..."
                style={{ ...styles.input, width: '180px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Sort Dropdown */}
            <div style={{ position: 'relative' as const }}>
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.75rem',
                  background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)',
                  border: isLight ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  color: isLight ? '#6b7280' : '#888',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                <Filter size={14} />
                {SORT_OPTIONS.find(s => s.id === sortBy)?.label}
                <ChevronRight size={14} style={{ transform: showSortDropdown ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
              </button>
              
              {showSortDropdown && (
                <div
                  style={{
                    position: 'absolute' as const,
                    top: '100%',
                    right: 0,
                    marginTop: '4px',
                    background: isLight ? '#ffffff' : '#1a1a24',
                    border: isLight ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '0.5rem 0',
                    minWidth: '140px',
                    zIndex: 100,
                    boxShadow: isLight ? '0 4px 12px rgba(0,0,0,0.1)' : '0 4px 12px rgba(0,0,0,0.3)',
                  }}
                >
                  {SORT_OPTIONS.map(option => (
                    <div
                      key={option.id}
                      onClick={() => {
                        setSortBy(option.id);
                        setShowSortDropdown(false);
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.75rem',
                        color: sortBy === option.id ? '#6366f1' : (isLight ? '#4b5563' : '#aaa'),
                        cursor: 'pointer',
                        background: sortBy === option.id ? 'rgba(99,102,241,0.1)' : 'transparent',
                      }}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
<span style={{ fontSize: '0.7rem', color: isLight ? '#9ca3af' : '#666' }}>
              {filteredAgents.length} result{filteredAgents.length !== 1 ? 's' : ''}
            </span>
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
            <div style={styles.agentGrid}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={styles.skeletonCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <div style={{ ...styles.skeletonLine, ...styles.skeletonTitle }} />
                      <div style={{ ...styles.skeletonLine, ...styles.skeletonText }} />
                    </div>
                    <div style={{ ...styles.skeletonLine, height: '24px', width: '50px', borderRadius: '4px' }} />
                  </div>
                  <div style={{ ...styles.skeletonLine, ...styles.skeletonDescription }} />
                  <div style={{ ...styles.skeletonLine, ...styles.skeletonTag }} />
                  <div style={styles.skeletonFooter}>
                    <div style={{ ...styles.skeletonLine, ...styles.skeletonStats }} />
                    <div style={{ ...styles.skeletonLine, ...styles.skeletonButton }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAgents.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>No agents found</p>
              <p style={{ fontSize: '0.8rem' }}>
                {searchQuery ? `No results for "${searchQuery}"` : 'Try a different category'}
              </p>
            </div>
          ) : (
            <div style={styles.agentGrid}>
              {filteredAgents.map(agent => (
                <div
                  key={agent.manifest_hash}
                  style={{
                    ...styles.agentCard,
                    ...(hoveredAgent === agent.manifest_hash ? styles.agentCardHover : {}),
                  }}
                  onClick={() => setSelectedAgent(agent)}
                  onMouseEnter={() => setHoveredAgent(agent.manifest_hash)}
                  onMouseLeave={() => setHoveredAgent(null)}
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
                      <div style={styles.statItem} title="Executions">
                        <Play size={12} />
                        {agent.execution_count || 0}
                      </div>
                      <div style={styles.statItem} title="Rating">
                        <Star size={12} />
                        {agent.rating?.toFixed(1) || '—'}
                      </div>
                      <div style={styles.statItem} title="Trust Tier">
                        <Shield size={12} />
                        T{agent.trust_tier}
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
                <div style={{ color: isLight ? '#6b7280' : '#888', fontSize: '0.875rem' }}>
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
                <p style={{ color: isLight ? '#4b5563' : '#ccc', lineHeight: '1.6', margin: 0 }}>
                  {selectedAgent.description}
                </p>
              </div>

              <div style={styles.modalSection}>
                <div style={styles.modalSectionTitle}>Details</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ color: isLight ? '#9ca3af' : '#666', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Trust Tier</div>
                    <div style={styles.trustBadge}>
                      <Shield size={12} />
                      Tier {selectedAgent.trust_tier}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: isLight ? '#9ca3af' : '#666', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Status</div>
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
                    style={{ background: 'none', border: 'none', color: isLight ? '#6b7280' : '#888', cursor: 'pointer' }}
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
                  background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.3)',
                  border: isLight ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)',
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
                    <span style={{ color: isLight ? '#9ca3af' : '#666', fontWeight: 'normal', marginLeft: '0.5rem' }}>
                      ({executionResult.duration_ms}ms)
                    </span>
                  </div>
                  <pre style={{
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.75rem',
                    color: isLight ? '#4b5563' : '#aaa',
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
