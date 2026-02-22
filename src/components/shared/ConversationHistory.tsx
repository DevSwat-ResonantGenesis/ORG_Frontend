import React, { useState } from 'react';
import { MessageSquare, Search, Filter, Calendar, User, Bot, Clock, Eye, Download, Trash2, Star, StarOff, ChevronRight, ChevronDown, MoreVertical, ThumbsUp, ThumbsDown, AlertTriangle } from 'lucide-react';

type ConversationStatus = 'active' | 'completed' | 'flagged' | 'archived';
type MessageRole = 'user' | 'assistant' | 'system';
type FeedbackType = 'positive' | 'negative' | 'none';

interface ConversationMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  tokens?: number;
  feedback?: FeedbackType;
  model?: string;
}

interface ConversationData {
  id: string;
  title: string;
  userId: string;
  userName: string;
  userEmail: string;
  agentId?: string;
  agentName?: string;
  status: ConversationStatus;
  messages: ConversationMessage[];
  totalTokens: number;
  cost: number;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  duration: number;
}

interface ConversationHistoryProps {
  conversations: ConversationData[];
  onViewConversation?: (conversationId: string) => void;
  onExportConversation?: (conversationId: string) => void;
  onDeleteConversation?: (conversationId: string) => void;
  onToggleFavorite?: (conversationId: string) => void;
  onFlagConversation?: (conversationId: string) => void;
  className?: string;
}

interface ConversationRowProps {
  conversation: ConversationData;
  onView?: () => void;
  onExport?: () => void;
  onDelete?: () => void;
  onToggleFavorite?: () => void;
  onFlag?: () => void;
}

const STATUS_CONFIG: Record<ConversationStatus, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  active: { label: 'Active', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)' },
  completed: { label: 'Completed', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.15)' },
  flagged: { label: 'Flagged', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)' },
  archived: { label: 'Archived', color: '#888', bgColor: 'rgba(255, 255, 255, 0.05)' },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#fff',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  searchInput: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#888',
  },
  input: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#fff',
    fontSize: '0.8125rem',
    width: '200px',
  },
  filterButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#888',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.25rem',
  },
  statIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.75rem',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#888',
  },
  tableContainer: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  tableTitle: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  tr: {
    transition: 'background 0.15s',
  },
  trHover: {
    background: 'rgba(255, 255, 255, 0.02)',
  },
  td: {
    padding: '0.875rem 1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    fontSize: '0.875rem',
    color: '#e4e4e7',
  },
  conversationCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  conversationIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#818cf8',
    flexShrink: 0,
  },
  conversationInfo: {
    flex: 1,
    minWidth: 0,
  },
  conversationTitle: {
    fontWeight: '500',
    color: '#fff',
    marginBottom: '0.125rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  conversationMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.6875rem',
    color: '#888',
  },
  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  userAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'rgba(59, 130, 246, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#3b82f6',
  },
  userName: {
    fontWeight: '500',
    color: '#e4e4e7',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
  },
  statsCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    fontSize: '0.75rem',
  },
  statRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    color: '#888',
  },
  feedbackCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  feedbackBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
  },
  actionButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.375rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  favoriteButton: {
    color: '#888',
  },
  favoriteActive: {
    color: '#f59e0b',
  },
  flagButton: {
    background: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    color: '#666',
  },
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
};

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const ConversationRow: React.FC<ConversationRowProps> = ({
  conversation,
  onView,
  onExport,
  onDelete,
  onToggleFavorite,
  onFlag,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = STATUS_CONFIG[conversation.status];
  const positiveCount = conversation.messages.filter(m => m.feedback === 'positive').length;
  const negativeCount = conversation.messages.filter(m => m.feedback === 'negative').length;

  return (
    <tr
      style={{
        ...styles.tr,
        ...(isHovered ? styles.trHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <td style={styles.td}>
        <div style={styles.conversationCell}>
          <div style={styles.conversationIcon}>
            <MessageSquare size={18} />
          </div>
          <div style={styles.conversationInfo}>
            <div style={styles.conversationTitle}>{conversation.title}</div>
            <div style={styles.conversationMeta}>
              <span>{conversation.messages.length} messages</span>
              <span>•</span>
              <span>{formatDuration(conversation.duration)}</span>
              {conversation.agentName && (
                <>
                  <span>•</span>
                  <span style={{ color: '#818cf8' }}>{conversation.agentName}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </td>
      <td style={styles.td}>
        <div style={styles.userCell}>
          <div style={styles.userAvatar}>
            {conversation.userName.charAt(0).toUpperCase()}
          </div>
          <span style={styles.userName}>{conversation.userName}</span>
        </div>
      </td>
      <td style={styles.td}>
        <span
          style={{
            ...styles.statusBadge,
            background: statusConfig.bgColor,
            color: statusConfig.color,
          }}
        >
          {statusConfig.label}
        </span>
      </td>
      <td style={styles.td}>
        <div style={styles.statsCell}>
          <span style={styles.statRow}>
            <Bot size={12} />
            {formatNumber(conversation.totalTokens)} tokens
          </span>
          <span style={styles.statRow}>
            ${conversation.cost.toFixed(4)}
          </span>
        </div>
      </td>
      <td style={styles.td}>
        <div style={styles.feedbackCell}>
          {positiveCount > 0 && (
            <span
              style={{
                ...styles.feedbackBadge,
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
              }}
            >
              <ThumbsUp size={12} />
              {positiveCount}
            </span>
          )}
          {negativeCount > 0 && (
            <span
              style={{
                ...styles.feedbackBadge,
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
              }}
            >
              <ThumbsDown size={12} />
              {negativeCount}
            </span>
          )}
          {positiveCount === 0 && negativeCount === 0 && (
            <span style={{ color: '#888', fontSize: '0.75rem' }}>No feedback</span>
          )}
        </div>
      </td>
      <td style={styles.td}>{formatTimeAgo(conversation.updatedAt)}</td>
      <td style={styles.td}>
        <div style={styles.actionButtons}>
          {onToggleFavorite && (
            <button
              style={{
                ...styles.actionButton,
                ...styles.favoriteButton,
                ...(conversation.isFavorite ? styles.favoriteActive : {}),
              }}
              onClick={onToggleFavorite}
              title={conversation.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {conversation.isFavorite ? <Star size={14} fill="currentColor" /> : <StarOff size={14} />}
            </button>
          )}
          {onFlag && conversation.status !== 'flagged' && (
            <button style={{ ...styles.actionButton, ...styles.flagButton }} onClick={onFlag} title="Flag">
              <AlertTriangle size={14} />
            </button>
          )}
          {onView && (
            <button style={styles.actionButton} onClick={onView} title="View">
              <Eye size={14} />
            </button>
          )}
          {onExport && (
            <button style={styles.actionButton} onClick={onExport} title="Export">
              <Download size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  conversations,
  onViewConversation,
  onExportConversation,
  onDeleteConversation,
  onToggleFavorite,
  onFlagConversation,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ConversationStatus | 'all'>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const filteredConversations = conversations.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (showFavoritesOnly && !c.isFavorite) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(query) ||
        c.userName.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const totalConversations = conversations.length;
  const activeConversations = conversations.filter(c => c.status === 'active').length;
  const flaggedConversations = conversations.filter(c => c.status === 'flagged').length;
  const totalTokens = conversations.reduce((sum, c) => sum + c.totalTokens, 0);
  const totalCost = conversations.reduce((sum, c) => sum + c.cost, 0);

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <MessageSquare size={22} />
          Conversation History
        </h2>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search conversations..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            style={{
              ...styles.filterButton,
              ...(showFavoritesOnly ? { background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' } : {}),
            }}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            <Star size={14} />
            Favorites
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <MessageSquare size={20} />
          </div>
          <div style={styles.statValue}>{totalConversations}</div>
          <div style={styles.statLabel}>Total Conversations</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Clock size={20} />
          </div>
          <div style={styles.statValue}>{activeConversations}</div>
          <div style={styles.statLabel}>Active</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <Bot size={20} />
          </div>
          <div style={styles.statValue}>{formatNumber(totalTokens)}</div>
          <div style={styles.statLabel}>Total Tokens</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Calendar size={20} />
          </div>
          <div style={styles.statValue}>${totalCost.toFixed(2)}</div>
          <div style={styles.statLabel}>Total Cost</div>
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <span style={styles.tableTitle}>Conversations ({filteredConversations.length})</span>
        </div>
        {filteredConversations.length === 0 ? (
          <div style={styles.empty}>
            <MessageSquare size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
            <span>No conversations found</span>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Conversation</th>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Usage</th>
                <th style={styles.th}>Feedback</th>
                <th style={styles.th}>Last Updated</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {filteredConversations.map((conversation) => (
                <ConversationRow
                  key={conversation.id}
                  conversation={conversation}
                  onView={onViewConversation ? () => onViewConversation(conversation.id) : undefined}
                  onExport={onExportConversation ? () => onExportConversation(conversation.id) : undefined}
                  onDelete={onDeleteConversation ? () => onDeleteConversation(conversation.id) : undefined}
                  onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(conversation.id) : undefined}
                  onFlag={onFlagConversation ? () => onFlagConversation(conversation.id) : undefined}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ConversationHistory;
