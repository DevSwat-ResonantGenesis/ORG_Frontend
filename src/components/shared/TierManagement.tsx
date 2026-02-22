import React, { useState } from 'react';
import { Crown, Plus, Edit2, Trash2, MoreVertical, Search, CheckCircle, Star, Zap, Users, DollarSign, Bot, Database, Clock } from 'lucide-react';

type TierType = 'free' | 'starter' | 'developer' | 'professional' | 'enterprise';

interface TierFeature {
  name: string;
  included: boolean;
  limit?: string;
}

interface TierData {
  id: string;
  name: string;
  type: TierType;
  description?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: TierFeature[];
  limits: {
    tokens?: number;
    agents?: number;
    sessions?: number;
    storage?: number;
    apiCalls?: number;
  };
  subscriberCount: number;
  isActive: boolean;
  isDefault?: boolean;
}

interface TierManagementProps {
  tiers: TierData[];
  onEditTier?: (tierId: string) => void;
  onDeleteTier?: (tierId: string) => void;
  onCreateTier?: () => void;
  onToggleTier?: (tierId: string, active: boolean) => void;
  className?: string;
}

interface TierCardProps {
  tier: TierData;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggle?: (active: boolean) => void;
}

const TIER_CONFIG: Record<TierType, {
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  free: {
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <Star size={18} />,
  },
  starter: {
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <Zap size={18} />,
  },
  developer: {
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    icon: <Bot size={18} />,
  },
  professional: {
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
    icon: <Crown size={18} />,
  },
  enterprise: {
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <Crown size={18} />,
  },
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
  statsBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    padding: '1rem 1.25rem',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  statValue: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#888',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.15s',
  },
  cardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  cardInactive: {
    opacity: 0.6,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  tierIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierName: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.125rem',
  },
  tierType: {
    fontSize: '0.75rem',
    color: '#888',
    textTransform: 'capitalize',
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
  cardBody: {
    padding: '1.25rem',
  },
  pricing: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.25rem',
    marginBottom: '1rem',
  },
  priceValue: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#fff',
  },
  pricePeriod: {
    fontSize: '0.875rem',
    color: '#888',
  },
  yearlyPrice: {
    fontSize: '0.75rem',
    color: '#666',
    marginLeft: '0.5rem',
  },
  limits: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  limitItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8125rem',
    color: '#888',
  },
  limitValue: {
    fontWeight: '600',
    color: '#fff',
  },
  subscriberCount: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
    fontSize: '0.8125rem',
    color: '#888',
  },
  cardActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem 1.25rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(0, 0, 0, 0.1)',
  },
  actionButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.375rem',
    padding: '0.5rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#888',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  actionButtonPrimary: {
    background: 'rgba(99, 102, 241, 0.15)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    color: '#818cf8',
  },
  actionButtonDanger: {
    background: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
  },
  defaultBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.125rem 0.375rem',
    borderRadius: '3px',
    fontSize: '0.625rem',
    fontWeight: '600',
    background: 'rgba(16, 185, 129, 0.15)',
    color: '#10b981',
    marginLeft: '0.5rem',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    color: '#666',
  },
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(0) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
  return num.toLocaleString();
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

const TierCard: React.FC<TierCardProps> = ({
  tier,
  onEdit,
  onDelete,
  onToggle,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const tierConfig = TIER_CONFIG[tier.type];

  return (
    <div
      style={{
        ...styles.card,
        ...(isHovered ? styles.cardHover : {}),
        ...(!tier.isActive ? styles.cardInactive : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.cardHeader}>
        <div style={styles.cardTitle}>
          <div
            style={{
              ...styles.tierIcon,
              background: tierConfig.bgColor,
              color: tierConfig.color,
            }}
          >
            {tierConfig.icon}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={styles.tierName}>{tier.name}</span>
              {tier.isDefault && (
                <span style={styles.defaultBadge}>
                  <CheckCircle size={10} />
                  Default
                </span>
              )}
            </div>
            <span style={styles.tierType}>{tier.type}</span>
          </div>
        </div>
        <span
          style={{
            ...styles.statusBadge,
            background: tier.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            color: tier.isActive ? '#10b981' : '#888',
          }}
        >
          {tier.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div style={styles.cardBody}>
        <div style={styles.pricing}>
          <span style={styles.priceValue}>{formatCurrency(tier.monthlyPrice)}</span>
          <span style={styles.pricePeriod}>/month</span>
          {tier.yearlyPrice > 0 && (
            <span style={styles.yearlyPrice}>
              ({formatCurrency(tier.yearlyPrice)}/year)
            </span>
          )}
        </div>

        <div style={styles.limits}>
          {tier.limits.tokens !== undefined && (
            <div style={styles.limitItem}>
              <Zap size={14} />
              <span style={styles.limitValue}>{formatNumber(tier.limits.tokens)}</span>
              tokens
            </div>
          )}
          {tier.limits.agents !== undefined && (
            <div style={styles.limitItem}>
              <Bot size={14} />
              <span style={styles.limitValue}>{tier.limits.agents}</span>
              agents
            </div>
          )}
          {tier.limits.sessions !== undefined && (
            <div style={styles.limitItem}>
              <Users size={14} />
              <span style={styles.limitValue}>{formatNumber(tier.limits.sessions)}</span>
              sessions
            </div>
          )}
          {tier.limits.storage !== undefined && (
            <div style={styles.limitItem}>
              <Database size={14} />
              <span style={styles.limitValue}>{tier.limits.storage}GB</span>
              storage
            </div>
          )}
        </div>

        <div style={styles.subscriberCount}>
          <Users size={14} />
          <span style={{ fontWeight: '600', color: '#fff' }}>
            {tier.subscriberCount.toLocaleString()}
          </span>
          subscribers
        </div>
      </div>

      <div style={styles.cardActions}>
        {onEdit && (
          <button style={{ ...styles.actionButton, ...styles.actionButtonPrimary }} onClick={onEdit}>
            <Edit2 size={14} />
            Edit
          </button>
        )}
        {onToggle && (
          <button
            style={styles.actionButton}
            onClick={() => onToggle(!tier.isActive)}
          >
            {tier.isActive ? 'Deactivate' : 'Activate'}
          </button>
        )}
        {onDelete && !tier.isDefault && (
          <button
            style={{ ...styles.actionButton, ...styles.actionButtonDanger }}
            onClick={onDelete}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export const TierManagement: React.FC<TierManagementProps> = ({
  tiers,
  onEditTier,
  onDeleteTier,
  onCreateTier,
  onToggleTier,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTiers = tiers.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSubscribers = tiers.reduce((sum, t) => sum + t.subscriberCount, 0);
  const activeTiers = tiers.filter(t => t.isActive).length;
  const totalMRR = tiers.reduce((sum, t) => sum + (t.monthlyPrice * t.subscriberCount), 0);

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Crown size={22} />
          Subscription Tiers
        </h2>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search tiers..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {onCreateTier && (
            <button style={styles.createButton} onClick={onCreateTier}>
              <Plus size={14} />
              Add Tier
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsBar}>
        <div style={styles.stat}>
          <span style={styles.statValue}>{tiers.length}</span>
          <span style={styles.statLabel}>Total Tiers</span>
        </div>
        <div style={styles.stat}>
          <span style={{ ...styles.statValue, color: '#10b981' }}>{activeTiers}</span>
          <span style={styles.statLabel}>Active</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statValue}>{totalSubscribers.toLocaleString()}</span>
          <span style={styles.statLabel}>Subscribers</span>
        </div>
        <div style={styles.stat}>
          <span style={{ ...styles.statValue, color: '#10b981' }}>{formatCurrency(totalMRR)}</span>
          <span style={styles.statLabel}>MRR</span>
        </div>
      </div>

      {/* Grid */}
      {filteredTiers.length === 0 ? (
        <div style={styles.empty}>
          <Crown size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <span>No tiers configured</span>
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredTiers.map((tier) => (
            <TierCard
              key={tier.id}
              tier={tier}
              onEdit={onEditTier ? () => onEditTier(tier.id) : undefined}
              onDelete={onDeleteTier ? () => onDeleteTier(tier.id) : undefined}
              onToggle={onToggleTier ? (active) => onToggleTier(tier.id, active) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TierManagement;
