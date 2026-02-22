import React, { useState } from 'react';
import { CreditCard, Calendar, AlertCircle, CheckCircle, Clock, Download, ExternalLink } from 'lucide-react';

type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'paused';
type PaymentStatus = 'succeeded' | 'pending' | 'failed';

interface SubscriptionData {
  planName: string;
  status: SubscriptionStatus;
  currentPeriodEnd: Date;
  amount: number;
  interval: 'month' | 'year';
  cancelAtPeriodEnd?: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  brand?: string;
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault?: boolean;
}

interface Invoice {
  id: string;
  date: Date;
  amount: number;
  status: PaymentStatus;
  pdfUrl?: string;
}

interface BillingCardProps {
  subscription: SubscriptionData;
  onManage?: () => void;
  onCancel?: () => void;
  onResume?: () => void;
  className?: string;
}

interface PaymentMethodCardProps {
  method: PaymentMethod;
  onEdit?: () => void;
  onRemove?: () => void;
  onSetDefault?: () => void;
  className?: string;
}

interface InvoiceRowProps {
  invoice: Invoice;
  onDownload?: () => void;
  className?: string;
}

const STATUS_CONFIG: Record<SubscriptionStatus, {
  color: string;
  bgColor: string;
  label: string;
  icon: React.ReactNode;
}> = {
  active: {
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    label: 'Active',
    icon: <CheckCircle size={14} />,
  },
  trialing: {
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    label: 'Trial',
    icon: <Clock size={14} />,
  },
  past_due: {
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    label: 'Past Due',
    icon: <AlertCircle size={14} />,
  },
  canceled: {
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    label: 'Canceled',
    icon: <AlertCircle size={14} />,
  },
  paused: {
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    label: 'Paused',
    icon: <Clock size={14} />,
  },
};

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, {
  color: string;
  label: string;
}> = {
  succeeded: { color: '#10b981', label: 'Paid' },
  pending: { color: '#f59e0b', label: 'Pending' },
  failed: { color: '#ef4444', label: 'Failed' },
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.25rem',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#fff',
    margin: '0 0 0.25rem 0',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.625rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  pricing: {
    textAlign: 'right',
  },
  amount: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#fff',
  },
  interval: {
    fontSize: '0.8125rem',
    color: '#888',
  },
  details: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    padding: '1rem 0',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    marginBottom: '1rem',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8125rem',
    color: '#888',
  },
  warning: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    background: 'rgba(245, 158, 11, 0.1)',
    borderRadius: '8px',
    fontSize: '0.8125rem',
    color: '#f59e0b',
    marginBottom: '1rem',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  manageButton: {
    flex: 1,
    padding: '0.625rem 1rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  cancelButton: {
    padding: '0.625rem 1rem',
    background: 'transparent',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    color: '#ef4444',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  resumeButton: {
    padding: '0.625rem 1rem',
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '8px',
    color: '#10b981',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  paymentCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
  },
  cardIcon: {
    width: '48px',
    height: '32px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#888',
  },
  cardInfo: {
    flex: 1,
  },
  cardNumber: {
    fontSize: '0.9375rem',
    fontWeight: '500',
    color: '#fff',
  },
  cardExpiry: {
    fontSize: '0.75rem',
    color: '#888',
  },
  defaultBadge: {
    padding: '0.125rem 0.5rem',
    background: 'rgba(99, 102, 241, 0.15)',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    color: '#818cf8',
    fontWeight: '500',
  },
  cardActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  cardActionButton: {
    padding: '0.375rem 0.625rem',
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#888',
    fontSize: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  invoiceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.875rem 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
  },
  invoiceDate: {
    fontSize: '0.875rem',
    color: '#e4e4e7',
    minWidth: '100px',
  },
  invoiceAmount: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#fff',
    minWidth: '80px',
  },
  invoiceStatus: {
    fontSize: '0.75rem',
    fontWeight: '500',
    flex: 1,
  },
  downloadButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: 'none',
    borderRadius: '6px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
};

export const BillingCard: React.FC<BillingCardProps> = ({
  subscription,
  onManage,
  onCancel,
  onResume,
  className,
}) => {
  const statusConfig = STATUS_CONFIG[subscription.status];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div style={styles.card} className={className}>
      <div style={styles.header}>
        <div style={styles.planInfo}>
          <h3 style={styles.planName}>{subscription.planName}</h3>
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
        </div>
        <div style={styles.pricing}>
          <div style={styles.amount}>{formatAmount(subscription.amount)}</div>
          <div style={styles.interval}>
            per {subscription.interval === 'year' ? 'year' : 'month'}
          </div>
        </div>
      </div>

      <div style={styles.details}>
        <div style={styles.detailItem}>
          <Calendar size={14} />
          {subscription.status === 'canceled' ? 'Ends' : 'Renews'} {formatDate(subscription.currentPeriodEnd)}
        </div>
      </div>

      {subscription.cancelAtPeriodEnd && (
        <div style={styles.warning}>
          <AlertCircle size={16} />
          Your subscription will cancel at the end of the billing period
        </div>
      )}

      <div style={styles.actions}>
        {onManage && (
          <button style={styles.manageButton} onClick={onManage}>
            Manage Subscription
          </button>
        )}
        {subscription.cancelAtPeriodEnd && onResume ? (
          <button style={styles.resumeButton} onClick={onResume}>
            Resume
          </button>
        ) : (
          onCancel && subscription.status === 'active' && (
            <button style={styles.cancelButton} onClick={onCancel}>
              Cancel
            </button>
          )
        )}
      </div>
    </div>
  );
};

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  method,
  onEdit,
  onRemove,
  onSetDefault,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={styles.paymentCard}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
    >
      <div style={styles.cardIcon}>
        <CreditCard size={20} />
      </div>
      <div style={styles.cardInfo}>
        <div style={styles.cardNumber}>
          {method.brand ? `${method.brand} ` : ''}•••• {method.last4}
        </div>
        {method.expiryMonth && method.expiryYear && (
          <div style={styles.cardExpiry}>
            Expires {method.expiryMonth}/{method.expiryYear}
          </div>
        )}
      </div>
      {method.isDefault && <span style={styles.defaultBadge}>Default</span>}
      {isHovered && (
        <div style={styles.cardActions}>
          {!method.isDefault && onSetDefault && (
            <button style={styles.cardActionButton} onClick={onSetDefault}>
              Set Default
            </button>
          )}
          {onEdit && (
            <button style={styles.cardActionButton} onClick={onEdit}>
              Edit
            </button>
          )}
          {onRemove && !method.isDefault && (
            <button
              style={{ ...styles.cardActionButton, color: '#ef4444' }}
              onClick={onRemove}
            >
              Remove
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const InvoiceRow: React.FC<InvoiceRowProps> = ({
  invoice,
  onDownload,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const statusConfig = PAYMENT_STATUS_CONFIG[invoice.status];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div
      style={styles.invoiceRow}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
    >
      <span style={styles.invoiceDate}>{formatDate(invoice.date)}</span>
      <span style={styles.invoiceAmount}>{formatAmount(invoice.amount)}</span>
      <span style={{ ...styles.invoiceStatus, color: statusConfig.color }}>
        {statusConfig.label}
      </span>
      {(onDownload || invoice.pdfUrl) && (
        <button
          style={{
            ...styles.downloadButton,
            opacity: isHovered ? 1 : 0.5,
          }}
          onClick={onDownload}
          title="Download invoice"
        >
          <Download size={14} />
        </button>
      )}
    </div>
  );
};

// Invoice list container
interface InvoiceListProps {
  invoices: Invoice[];
  onDownload?: (id: string) => void;
  className?: string;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  onDownload,
  className,
}) => (
  <div className={className}>
    {invoices.map((invoice) => (
      <InvoiceRow
        key={invoice.id}
        invoice={invoice}
        onDownload={onDownload ? () => onDownload(invoice.id) : undefined}
      />
    ))}
  </div>
);

export default BillingCard;
