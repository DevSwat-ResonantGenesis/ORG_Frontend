import React, { useState } from 'react';
import { CreditCard, DollarSign, TrendingUp, Calendar, Download, MoreVertical, Search, Filter, RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

type TransactionStatus = 'completed' | 'pending' | 'failed' | 'refunded';
type TransactionType = 'charge' | 'refund' | 'credit' | 'subscription';

interface TransactionData {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  type: TransactionType;
  description: string;
  createdAt: Date;
  paymentMethod?: string;
}

interface RevenueStats {
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  pendingPayments: number;
  refundRate: number;
}

interface BillingManagementProps {
  transactions: TransactionData[];
  stats: RevenueStats;
  onRefund?: (transactionId: string) => void;
  onExport?: () => void;
  className?: string;
}

interface TransactionRowProps {
  transaction: TransactionData;
  onRefund?: () => void;
}

const STATUS_CONFIG: Record<TransactionStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  completed: {
    label: 'Completed',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <CheckCircle size={12} />,
  },
  pending: {
    label: 'Pending',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <Clock size={12} />,
  },
  failed: {
    label: 'Failed',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <XCircle size={12} />,
  },
  refunded: {
    label: 'Refunded',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <RefreshCw size={12} />,
  },
};

const TYPE_CONFIG: Record<TransactionType, {
  label: string;
  color: string;
}> = {
  charge: { label: 'Charge', color: '#10b981' },
  refund: { label: 'Refund', color: '#ef4444' },
  credit: { label: 'Credit', color: '#3b82f6' },
  subscription: { label: 'Subscription', color: '#8b5cf6' },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
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
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  title: {
    fontSize: '1rem',
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
  exportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.875rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#888',
    fontSize: '0.8125rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
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
  userCell: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontWeight: '500',
    color: '#fff',
  },
  userEmail: {
    fontSize: '0.75rem',
    color: '#888',
  },
  amount: {
    fontWeight: '600',
    fontFamily: "'JetBrains Mono', monospace",
  },
  amountPositive: {
    color: '#10b981',
  },
  amountNegative: {
    color: '#ef4444',
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
  typeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.125rem 0.375rem',
    borderRadius: '3px',
    fontSize: '0.625rem',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.05)',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    top: '100%',
    marginTop: '0.25rem',
    background: '#1a1a2e',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '0.375rem',
    minWidth: '140px',
    zIndex: 100,
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.5rem 0.75rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#e4e4e7',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    transition: 'background 0.15s',
    textAlign: 'left',
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

const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction,
  onRefund,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const statusConfig = STATUS_CONFIG[transaction.status];
  const typeConfig = TYPE_CONFIG[transaction.type];
  const isNegative = transaction.type === 'refund' || transaction.amount < 0;

  return (
    <tr
      style={{
        ...styles.tr,
        ...(isHovered ? styles.trHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowMenu(false); }}
    >
      <td style={styles.td}>
        <div style={styles.userCell}>
          <span style={styles.userName}>{transaction.userName}</span>
          <span style={styles.userEmail}>{transaction.userEmail}</span>
        </div>
      </td>
      <td style={styles.td}>
        <span
          style={{
            ...styles.amount,
            ...(isNegative ? styles.amountNegative : styles.amountPositive),
          }}
        >
          {isNegative ? '-' : '+'}{formatCurrency(Math.abs(transaction.amount), transaction.currency)}
        </span>
      </td>
      <td style={styles.td}>
        <span style={{ ...styles.typeBadge, color: typeConfig.color }}>
          {typeConfig.label}
        </span>
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
      <td style={styles.td}>{transaction.description}</td>
      <td style={styles.td}>{formatDate(transaction.createdAt)}</td>
      <td style={{ ...styles.td, position: 'relative' }}>
        <button
          style={styles.actionButton}
          onClick={() => setShowMenu(!showMenu)}
        >
          <MoreVertical size={16} />
        </button>
        {showMenu && (
          <div style={styles.dropdown}>
            {onRefund && transaction.status === 'completed' && transaction.type === 'charge' && (
              <button style={styles.dropdownItem} onClick={onRefund}>
                <RefreshCw size={14} />
                Refund
              </button>
            )}
            <button style={styles.dropdownItem}>
              <Download size={14} />
              Receipt
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

export const BillingManagement: React.FC<BillingManagementProps> = ({
  transactions,
  stats,
  onRefund,
  onExport,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = transactions.filter(t =>
    t.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={styles.container} className={className}>
      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <DollarSign size={20} />
          </div>
          <div style={styles.statValue}>{formatCurrency(stats.totalRevenue)}</div>
          <div style={styles.statLabel}>Total Revenue</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <TrendingUp size={20} />
          </div>
          <div style={styles.statValue}>{formatCurrency(stats.monthlyRevenue)}</div>
          <div style={styles.statLabel}>This Month</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <CreditCard size={20} />
          </div>
          <div style={styles.statValue}>{stats.activeSubscriptions.toLocaleString()}</div>
          <div style={styles.statLabel}>Active Subscriptions</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Clock size={20} />
          </div>
          <div style={styles.statValue}>{stats.pendingPayments}</div>
          <div style={styles.statLabel}>Pending Payments</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <AlertTriangle size={20} />
          </div>
          <div style={styles.statValue}>{stats.refundRate.toFixed(1)}%</div>
          <div style={styles.statLabel}>Refund Rate</div>
        </div>
      </div>

      {/* Transactions Table */}
      <div style={styles.tableContainer}>
        <div style={styles.header}>
          <span style={styles.title}>Transactions</span>
          <div style={styles.headerActions}>
            <div style={styles.searchInput}>
              <Search size={14} />
              <input
                type="text"
                placeholder="Search transactions..."
                style={styles.input}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {onExport && (
              <button style={styles.exportButton} onClick={onExport}>
                <Download size={14} />
                Export
              </button>
            )}
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div style={styles.empty}>
            <CreditCard size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
            <span>No transactions found</span>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  onRefund={onRefund ? () => onRefund(transaction.id) : undefined}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BillingManagement;
