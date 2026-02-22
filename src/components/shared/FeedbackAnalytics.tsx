import React, { useState } from 'react';
import { MessageCircle, ThumbsUp, ThumbsDown, Star, TrendingUp, TrendingDown, BarChart3, Search, Filter, Calendar, Download, RefreshCw, Eye, ChevronRight, ChevronDown, User, Bot } from 'lucide-react';

type FeedbackType = 'positive' | 'negative' | 'neutral';
type FeedbackCategory = 'accuracy' | 'helpfulness' | 'speed' | 'clarity' | 'relevance' | 'other';
type SentimentScore = 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';

interface FeedbackItem {
  id: string;
  type: FeedbackType;
  category: FeedbackCategory;
  rating?: number;
  comment?: string;
  sentiment: SentimentScore;
  userId: string;
  userName: string;
  agentId?: string;
  agentName?: string;
  conversationId: string;
  messageId?: string;
  createdAt: Date;
  resolved: boolean;
}

interface FeedbackStats {
  totalFeedback: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  avgRating: number;
  responseRate: number;
  trendPercent: number;
  trendDirection: 'up' | 'down' | 'stable';
}

interface CategoryBreakdown {
  category: FeedbackCategory;
  count: number;
  percentage: number;
  avgRating: number;
}

interface FeedbackAnalyticsProps {
  feedback: FeedbackItem[];
  stats: FeedbackStats;
  categoryBreakdown: CategoryBreakdown[];
  onViewFeedback?: (feedbackId: string) => void;
  onResolveFeedback?: (feedbackId: string) => void;
  onExport?: () => void;
  onRefresh?: () => void;
  className?: string;
}

interface FeedbackRowProps {
  feedback: FeedbackItem;
  onView?: () => void;
  onResolve?: () => void;
}

const TYPE_CONFIG: Record<FeedbackType, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  positive: {
    label: 'Positive',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <ThumbsUp size={12} />,
  },
  negative: {
    label: 'Negative',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <ThumbsDown size={12} />,
  },
  neutral: {
    label: 'Neutral',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <MessageCircle size={12} />,
  },
};

const CATEGORY_CONFIG: Record<FeedbackCategory, {
  label: string;
  color: string;
}> = {
  accuracy: { label: 'Accuracy', color: '#3b82f6' },
  helpfulness: { label: 'Helpfulness', color: '#10b981' },
  speed: { label: 'Speed', color: '#f59e0b' },
  clarity: { label: 'Clarity', color: '#8b5cf6' },
  relevance: { label: 'Relevance', color: '#ec4899' },
  other: { label: 'Other', color: '#888' },
};

const SENTIMENT_CONFIG: Record<SentimentScore, {
  label: string;
  color: string;
}> = {
  very_positive: { label: 'Very Positive', color: '#10b981' },
  positive: { label: 'Positive', color: '#22c55e' },
  neutral: { label: 'Neutral', color: '#888' },
  negative: { label: 'Negative', color: '#f59e0b' },
  very_negative: { label: 'Very Negative', color: '#ef4444' },
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
    width: '180px',
  },
  actionButton: {
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
  statTrend: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.75rem',
    marginTop: '0.5rem',
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 300px',
    gap: '1.5rem',
  },
  feedbackSection: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  sectionTitle: {
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
  feedbackCell: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  feedbackIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  feedbackInfo: {
    flex: 1,
    minWidth: 0,
  },
  feedbackComment: {
    fontSize: '0.8125rem',
    color: '#e4e4e7',
    marginBottom: '0.25rem',
    lineHeight: 1.4,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  feedbackMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.6875rem',
    color: '#888',
  },
  typeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
  },
  categoryBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.05)',
  },
  ratingCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  userAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'rgba(59, 130, 246, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.5625rem',
    fontWeight: '600',
    color: '#3b82f6',
  },
  viewButton: {
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
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  breakdownCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.25rem',
  },
  breakdownTitle: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '1rem',
  },
  breakdownList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  breakdownItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  breakdownHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  breakdownLabel: {
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: '#e4e4e7',
  },
  breakdownValue: {
    fontSize: '0.75rem',
    color: '#888',
  },
  breakdownBar: {
    height: '6px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: '3px',
  },
  sentimentCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.25rem',
  },
  sentimentTitle: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '1rem',
  },
  sentimentChart: {
    display: 'flex',
    height: '120px',
    alignItems: 'flex-end',
    gap: '4px',
  },
  sentimentBar: {
    flex: 1,
    borderRadius: '4px 4px 0 0',
    transition: 'height 0.3s ease',
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

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      size={12}
      fill={i < rating ? '#f59e0b' : 'transparent'}
      color={i < rating ? '#f59e0b' : '#888'}
    />
  ));
};

const FeedbackRow: React.FC<FeedbackRowProps> = ({
  feedback,
  onView,
  onResolve,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const typeConfig = TYPE_CONFIG[feedback.type];
  const categoryConfig = CATEGORY_CONFIG[feedback.category];

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
        <div style={styles.feedbackCell}>
          <div
            style={{
              ...styles.feedbackIcon,
              background: typeConfig.bgColor,
              color: typeConfig.color,
            }}
          >
            {typeConfig.icon}
          </div>
          <div style={styles.feedbackInfo}>
            <div style={styles.feedbackComment}>
              {feedback.comment || 'No comment provided'}
            </div>
            <div style={styles.feedbackMeta}>
              {feedback.agentName && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Bot size={10} />
                  {feedback.agentName}
                </span>
              )}
            </div>
          </div>
        </div>
      </td>
      <td style={styles.td}>
        <span
          style={{
            ...styles.typeBadge,
            background: typeConfig.bgColor,
            color: typeConfig.color,
          }}
        >
          {typeConfig.icon}
          {typeConfig.label}
        </span>
      </td>
      <td style={styles.td}>
        <span style={{ ...styles.categoryBadge, color: categoryConfig.color }}>
          {categoryConfig.label}
        </span>
      </td>
      <td style={styles.td}>
        {feedback.rating ? (
          <div style={styles.ratingCell}>{renderStars(feedback.rating)}</div>
        ) : (
          <span style={{ color: '#888' }}>—</span>
        )}
      </td>
      <td style={styles.td}>
        <div style={styles.userCell}>
          <div style={styles.userAvatar}>
            {feedback.userName.charAt(0).toUpperCase()}
          </div>
          <span>{feedback.userName}</span>
        </div>
      </td>
      <td style={styles.td}>{formatTimeAgo(feedback.createdAt)}</td>
      <td style={styles.td}>
        {onView && (
          <button style={styles.viewButton} onClick={onView}>
            <Eye size={14} />
          </button>
        )}
      </td>
    </tr>
  );
};

export const FeedbackAnalytics: React.FC<FeedbackAnalyticsProps> = ({
  feedback,
  stats,
  categoryBreakdown,
  onViewFeedback,
  onResolveFeedback,
  onExport,
  onRefresh,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<FeedbackType | 'all'>('all');

  const filteredFeedback = feedback.filter(f => {
    if (typeFilter !== 'all' && f.type !== typeFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        f.comment?.toLowerCase().includes(query) ||
        f.userName.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const trendColor = stats.trendDirection === 'up' ? '#10b981' : stats.trendDirection === 'down' ? '#ef4444' : '#888';
  const TrendIcon = stats.trendDirection === 'up' ? TrendingUp : stats.trendDirection === 'down' ? TrendingDown : BarChart3;

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <MessageCircle size={22} />
          Feedback Analytics
        </h2>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search feedback..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {onRefresh && (
            <button style={styles.actionButton} onClick={onRefresh}>
              <RefreshCw size={14} />
            </button>
          )}
          {onExport && (
            <button style={styles.actionButton} onClick={onExport}>
              <Download size={14} />
              Export
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <MessageCircle size={20} />
          </div>
          <div style={styles.statValue}>{stats.totalFeedback}</div>
          <div style={styles.statLabel}>Total Feedback</div>
          <div style={{ ...styles.statTrend, color: trendColor }}>
            <TrendIcon size={12} />
            {stats.trendPercent > 0 ? '+' : ''}{stats.trendPercent.toFixed(1)}% vs last period
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <ThumbsUp size={20} />
          </div>
          <div style={styles.statValue}>{stats.positiveCount}</div>
          <div style={styles.statLabel}>Positive</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <ThumbsDown size={20} />
          </div>
          <div style={styles.statValue}>{stats.negativeCount}</div>
          <div style={styles.statLabel}>Negative</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Star size={20} />
          </div>
          <div style={styles.statValue}>{stats.avgRating.toFixed(1)}</div>
          <div style={styles.statLabel}>Avg Rating</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Feedback Table */}
        <div style={styles.feedbackSection}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTitle}>Recent Feedback ({filteredFeedback.length})</span>
          </div>
          {filteredFeedback.length === 0 ? (
            <div style={styles.empty}>
              <MessageCircle size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
              <span>No feedback found</span>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Feedback</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Rating</th>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}></th>
                </tr>
              </thead>
              <tbody>
                {filteredFeedback.slice(0, 10).map((item) => (
                  <FeedbackRow
                    key={item.id}
                    feedback={item}
                    onView={onViewFeedback ? () => onViewFeedback(item.id) : undefined}
                    onResolve={onResolveFeedback ? () => onResolveFeedback(item.id) : undefined}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Sidebar */}
        <div style={styles.sidebar}>
          {/* Category Breakdown */}
          <div style={styles.breakdownCard}>
            <div style={styles.breakdownTitle}>Category Breakdown</div>
            <div style={styles.breakdownList}>
              {categoryBreakdown.map((item) => {
                const config = CATEGORY_CONFIG[item.category];
                return (
                  <div key={item.category} style={styles.breakdownItem}>
                    <div style={styles.breakdownHeader}>
                      <span style={{ ...styles.breakdownLabel, color: config.color }}>
                        {config.label}
                      </span>
                      <span style={styles.breakdownValue}>
                        {item.count} ({item.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div style={styles.breakdownBar}>
                      <div
                        style={{
                          ...styles.breakdownFill,
                          width: `${item.percentage}%`,
                          background: config.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sentiment Distribution */}
          <div style={styles.sentimentCard}>
            <div style={styles.sentimentTitle}>Sentiment Distribution</div>
            <div style={styles.sentimentChart}>
              {Object.entries(SENTIMENT_CONFIG).map(([key, config]) => {
                const count = feedback.filter(f => f.sentiment === key).length;
                const height = feedback.length > 0 ? (count / feedback.length) * 100 : 0;
                return (
                  <div
                    key={key}
                    style={{
                      ...styles.sentimentBar,
                      height: `${Math.max(height, 5)}%`,
                      background: config.color,
                    }}
                    title={`${config.label}: ${count}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackAnalytics;
