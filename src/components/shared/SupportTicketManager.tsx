import React, { useState } from 'react';
import { Ticket, Plus, Search, Eye, MessageSquare, CheckCircle, Clock, AlertTriangle, User, Tag, Filter, RefreshCw, Send, Paperclip } from 'lucide-react';

type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
type TicketCategory = 'technical' | 'billing' | 'account' | 'feature' | 'bug' | 'other';

interface TicketMessage {
  id: string;
  content: string;
  author: string;
  authorType: 'user' | 'agent' | 'system';
  createdAt: Date;
  attachments?: string[];
}

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  userId: string;
  userName: string;
  userEmail: string;
  assignedTo?: string;
  assignedToName?: string;
  messages: TicketMessage[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

interface SupportTicketManagerProps {
  tickets: SupportTicket[];
  onCreateTicket?: () => void;
  onViewTicket?: (ticketId: string) => void;
  onAssignTicket?: (ticketId: string) => void;
  onUpdateStatus?: (ticketId: string, status: TicketStatus) => void;
  onReplyTicket?: (ticketId: string) => void;
  onRefresh?: () => void;
  className?: string;
}

interface TicketRowProps {
  ticket: SupportTicket;
  onView?: () => void;
  onAssign?: () => void;
  onReply?: () => void;
}

const STATUS_CONFIG: Record<TicketStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  open: {
    label: 'Open',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    icon: <Ticket size={12} />,
  },
  in_progress: {
    label: 'In Progress',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <Clock size={12} />,
  },
  waiting: {
    label: 'Waiting',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
    icon: <Clock size={12} />,
  },
  resolved: {
    label: 'Resolved',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <CheckCircle size={12} />,
  },
  closed: {
    label: 'Closed',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <CheckCircle size={12} />,
  },
};

const PRIORITY_CONFIG: Record<TicketPriority, {
  label: string;
  color: string;
}> = {
  low: { label: 'Low', color: '#888' },
  medium: { label: 'Medium', color: '#3b82f6' },
  high: { label: 'High', color: '#f59e0b' },
  urgent: { label: 'Urgent', color: '#ef4444' },
};

const CATEGORY_CONFIG: Record<TicketCategory, {
  label: string;
  color: string;
}> = {
  technical: { label: 'Technical', color: '#3b82f6' },
  billing: { label: 'Billing', color: '#10b981' },
  account: { label: 'Account', color: '#8b5cf6' },
  feature: { label: 'Feature', color: '#f59e0b' },
  bug: { label: 'Bug', color: '#ef4444' },
  other: { label: 'Other', color: '#888' },
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
  refreshButton: {
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
  createButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.875rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.8125rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
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
  ticketCell: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  ticketIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ticketInfo: {
    flex: 1,
    minWidth: 0,
  },
  ticketSubject: {
    fontWeight: '500',
    color: '#fff',
    marginBottom: '0.25rem',
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  ticketId: {
    fontSize: '0.6875rem',
    color: '#888',
    fontFamily: "'JetBrains Mono', monospace",
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
  },
  priorityBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.05)',
  },
  categoryBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '500',
    background: 'rgba(255, 255, 255, 0.05)',
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
    fontSize: '0.625rem',
    fontWeight: '600',
    color: '#3b82f6',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: '#e4e4e7',
  },
  userEmail: {
    fontSize: '0.6875rem',
    color: '#888',
  },
  assigneeCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  assigneeAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'rgba(16, 185, 129, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.5625rem',
    fontWeight: '600',
    color: '#10b981',
  },
  messagesCount: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.75rem',
    color: '#888',
  },
  actionButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  iconButton: {
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
  replyButton: {
    background: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    color: '#3b82f6',
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

  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const TicketRow: React.FC<TicketRowProps> = ({
  ticket,
  onView,
  onAssign,
  onReply,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = STATUS_CONFIG[ticket.status];
  const priorityConfig = PRIORITY_CONFIG[ticket.priority];
  const categoryConfig = CATEGORY_CONFIG[ticket.category];

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
        <div style={styles.ticketCell}>
          <div
            style={{
              ...styles.ticketIcon,
              background: priorityConfig.color === '#ef4444' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)',
              color: priorityConfig.color === '#ef4444' ? '#ef4444' : '#818cf8',
            }}
          >
            <Ticket size={18} />
          </div>
          <div style={styles.ticketInfo}>
            <div style={styles.ticketSubject}>{ticket.subject}</div>
            <div style={styles.ticketId}>#{ticket.id}</div>
          </div>
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
          {statusConfig.icon}
          {statusConfig.label}
        </span>
      </td>
      <td style={styles.td}>
        <span style={{ ...styles.priorityBadge, color: priorityConfig.color }}>
          {priorityConfig.label}
        </span>
      </td>
      <td style={styles.td}>
        <span style={{ ...styles.categoryBadge, color: categoryConfig.color }}>
          {categoryConfig.label}
        </span>
      </td>
      <td style={styles.td}>
        <div style={styles.userCell}>
          <div style={styles.userAvatar}>
            {ticket.userName.charAt(0).toUpperCase()}
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{ticket.userName}</div>
            <div style={styles.userEmail}>{ticket.userEmail}</div>
          </div>
        </div>
      </td>
      <td style={styles.td}>
        {ticket.assignedToName ? (
          <div style={styles.assigneeCell}>
            <div style={styles.assigneeAvatar}>
              {ticket.assignedToName.charAt(0).toUpperCase()}
            </div>
            <span>{ticket.assignedToName}</span>
          </div>
        ) : (
          <span style={{ color: '#888' }}>Unassigned</span>
        )}
      </td>
      <td style={styles.td}>
        <span style={styles.messagesCount}>
          <MessageSquare size={12} />
          {ticket.messages.length}
        </span>
      </td>
      <td style={styles.td}>{formatTimeAgo(ticket.updatedAt)}</td>
      <td style={styles.td}>
        <div style={styles.actionButtons}>
          {onReply && (
            <button style={{ ...styles.iconButton, ...styles.replyButton }} onClick={onReply} title="Reply">
              <Send size={14} />
            </button>
          )}
          {onView && (
            <button style={styles.iconButton} onClick={onView} title="View">
              <Eye size={14} />
            </button>
          )}
          {onAssign && !ticket.assignedTo && (
            <button style={styles.iconButton} onClick={onAssign} title="Assign">
              <User size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export const SupportTicketManager: React.FC<SupportTicketManagerProps> = ({
  tickets,
  onCreateTicket,
  onViewTicket,
  onAssignTicket,
  onUpdateStatus,
  onReplyTicket,
  onRefresh,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');

  const filteredTickets = tickets.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        t.subject.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query) ||
        t.userName.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
  const waitingTickets = tickets.filter(t => t.status === 'waiting').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
  const urgentTickets = tickets.filter(t => t.priority === 'urgent' && t.status !== 'resolved' && t.status !== 'closed').length;

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Ticket size={22} />
          Support Ticket Manager
        </h2>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search tickets..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button style={styles.filterButton}>
            <Filter size={14} />
            Filter
          </button>
          {onRefresh && (
            <button style={styles.refreshButton} onClick={onRefresh}>
              <RefreshCw size={14} />
            </button>
          )}
          {onCreateTicket && (
            <button style={styles.createButton} onClick={onCreateTicket}>
              <Plus size={14} />
              New Ticket
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <Ticket size={20} />
          </div>
          <div style={styles.statValue}>{openTickets}</div>
          <div style={styles.statLabel}>Open</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Clock size={20} />
          </div>
          <div style={styles.statValue}>{inProgressTickets}</div>
          <div style={styles.statLabel}>In Progress</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <Clock size={20} />
          </div>
          <div style={styles.statValue}>{waitingTickets}</div>
          <div style={styles.statLabel}>Waiting</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <CheckCircle size={20} />
          </div>
          <div style={styles.statValue}>{resolvedTickets}</div>
          <div style={styles.statLabel}>Resolved</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <AlertTriangle size={20} />
          </div>
          <div style={styles.statValue}>{urgentTickets}</div>
          <div style={styles.statLabel}>Urgent</div>
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <span style={styles.tableTitle}>Tickets ({filteredTickets.length})</span>
        </div>
        {filteredTickets.length === 0 ? (
          <div style={styles.empty}>
            <Ticket size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
            <span>No tickets found</span>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Ticket</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Priority</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Requester</th>
                <th style={styles.th}>Assignee</th>
                <th style={styles.th}>Messages</th>
                <th style={styles.th}>Updated</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <TicketRow
                  key={ticket.id}
                  ticket={ticket}
                  onView={onViewTicket ? () => onViewTicket(ticket.id) : undefined}
                  onAssign={onAssignTicket ? () => onAssignTicket(ticket.id) : undefined}
                  onReply={onReplyTicket ? () => onReplyTicket(ticket.id) : undefined}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SupportTicketManager;
