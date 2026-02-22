import React, { useState } from 'react';
import { Check, X, Star, Zap, Crown } from 'lucide-react';

type PricingTier = 'free' | 'starter' | 'pro' | 'enterprise';
type BillingPeriod = 'monthly' | 'yearly';

interface PricingFeature {
  text: string;
  included: boolean;
  tooltip?: string;
}

interface PricingCardProps {
  tier: PricingTier;
  name: string;
  description?: string;
  price: number | string;
  originalPrice?: number;
  billingPeriod?: BillingPeriod;
  features: PricingFeature[];
  isPopular?: boolean;
  isCurrentPlan?: boolean;
  ctaLabel?: string;
  onSelect?: () => void;
  className?: string;
}

const TIER_CONFIG: Record<PricingTier, {
  icon: React.ReactNode;
  color: string;
  gradient: string;
}> = {
  free: {
    icon: <Star size={20} />,
    color: '#888',
    gradient: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
  },
  starter: {
    icon: <Zap size={20} />,
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  },
  pro: {
    icon: <Crown size={20} />,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
  },
  enterprise: {
    icon: <Crown size={20} />,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  },
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '1.5rem',
    transition: 'all 0.3s',
  },
  cardHover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
  },
  cardPopular: {
    border: '2px solid rgba(139, 92, 246, 0.5)',
    background: 'rgba(139, 92, 246, 0.05)',
  },
  popularBadge: {
    position: 'absolute',
    top: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '0.25rem 1rem',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    borderRadius: '20px',
    fontSize: '0.6875rem',
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  header: {
    marginBottom: '1.5rem',
  },
  iconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    marginBottom: '1rem',
  },
  name: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#fff',
    margin: '0 0 0.25rem 0',
  },
  description: {
    fontSize: '0.8125rem',
    color: '#888',
    margin: 0,
  },
  pricing: {
    marginBottom: '1.5rem',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.25rem',
  },
  currency: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#888',
  },
  price: {
    fontSize: '3rem',
    fontWeight: '800',
    color: '#fff',
    lineHeight: 1,
  },
  period: {
    fontSize: '0.875rem',
    color: '#888',
  },
  originalPrice: {
    fontSize: '1rem',
    color: '#666',
    textDecoration: 'line-through',
    marginLeft: '0.5rem',
  },
  savings: {
    display: 'inline-block',
    marginTop: '0.5rem',
    padding: '0.25rem 0.5rem',
    background: 'rgba(16, 185, 129, 0.15)',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#10b981',
  },
  features: {
    flex: 1,
    marginBottom: '1.5rem',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    marginBottom: '0.75rem',
  },
  featureIcon: {
    flexShrink: 0,
    marginTop: '0.125rem',
  },
  featureText: {
    fontSize: '0.875rem',
    color: '#ccc',
    lineHeight: 1.4,
  },
  featureTextDisabled: {
    color: '#666',
  },
  cta: {
    width: '100%',
    padding: '0.875rem 1.5rem',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.9375rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  ctaPrimary: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#fff',
  },
  ctaSecondary: {
    background: 'rgba(255, 255, 255, 0.08)',
    color: '#fff',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  ctaDisabled: {
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#666',
    cursor: 'not-allowed',
  },
  currentPlanBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.375rem',
    padding: '0.75rem',
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '10px',
    color: '#10b981',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
};

export const PricingCard: React.FC<PricingCardProps> = ({
  tier,
  name,
  description,
  price,
  originalPrice,
  billingPeriod = 'monthly',
  features,
  isPopular = false,
  isCurrentPlan = false,
  ctaLabel = 'Get Started',
  onSelect,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const tierConfig = TIER_CONFIG[tier];

  const formatPrice = (p: number | string) => {
    if (typeof p === 'string') return p;
    return p.toLocaleString();
  };

  const savings = originalPrice && typeof price === 'number'
    ? Math.round((1 - price / originalPrice) * 100)
    : null;

  return (
    <div
      style={{
        ...styles.card,
        ...(isHovered ? styles.cardHover : {}),
        ...(isPopular ? styles.cardPopular : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
    >
      {isPopular && <div style={styles.popularBadge}>Most Popular</div>}

      <div style={styles.header}>
        <div style={{ ...styles.iconWrapper, background: tierConfig.gradient }}>
          {tierConfig.icon}
        </div>
        <h3 style={styles.name}>{name}</h3>
        {description && <p style={styles.description}>{description}</p>}
      </div>

      <div style={styles.pricing}>
        <div style={styles.priceRow}>
          {typeof price === 'number' && <span style={styles.currency}>$</span>}
          <span style={styles.price}>{formatPrice(price)}</span>
          {typeof price === 'number' && (
            <span style={styles.period}>/{billingPeriod === 'yearly' ? 'year' : 'mo'}</span>
          )}
          {originalPrice && (
            <span style={styles.originalPrice}>${originalPrice}</span>
          )}
        </div>
        {savings && savings > 0 && (
          <span style={styles.savings}>Save {savings}%</span>
        )}
      </div>

      <div style={styles.features}>
        {features.map((feature, index) => (
          <div key={index} style={styles.featureItem}>
            <span
              style={{
                ...styles.featureIcon,
                color: feature.included ? '#10b981' : '#666',
              }}
            >
              {feature.included ? <Check size={16} /> : <X size={16} />}
            </span>
            <span
              style={{
                ...styles.featureText,
                ...(feature.included ? {} : styles.featureTextDisabled),
              }}
              title={feature.tooltip}
            >
              {feature.text}
            </span>
          </div>
        ))}
      </div>

      {isCurrentPlan ? (
        <div style={styles.currentPlanBadge}>
          <Check size={16} />
          Current Plan
        </div>
      ) : (
        <button
          style={{
            ...styles.cta,
            ...(isPopular ? styles.ctaPrimary : styles.ctaSecondary),
          }}
          onClick={onSelect}
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
};

// Pricing grid
interface PricingGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export const PricingGrid: React.FC<PricingGridProps> = ({
  children,
  columns = 3,
  className,
}) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: '1.5rem',
      alignItems: 'stretch',
    }}
    className={className}
  >
    {children}
  </div>
);

// Billing toggle
interface BillingToggleProps {
  value: BillingPeriod;
  onChange: (period: BillingPeriod) => void;
  yearlyDiscount?: number;
  className?: string;
}

export const BillingToggle: React.FC<BillingToggleProps> = ({
  value,
  onChange,
  yearlyDiscount = 20,
  className,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
    }}
    className={className}
  >
    <span
      style={{
        fontSize: '0.875rem',
        fontWeight: value === 'monthly' ? '600' : '400',
        color: value === 'monthly' ? '#fff' : '#888',
        cursor: 'pointer',
      }}
      onClick={() => onChange('monthly')}
    >
      Monthly
    </span>
    <button
      style={{
        position: 'relative',
        width: '48px',
        height: '24px',
        background: value === 'yearly' ? '#6366f1' : 'rgba(255, 255, 255, 0.1)',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'background 0.2s',
      }}
      onClick={() => onChange(value === 'monthly' ? 'yearly' : 'monthly')}
    >
      <span
        style={{
          position: 'absolute',
          top: '2px',
          left: value === 'yearly' ? '26px' : '2px',
          width: '20px',
          height: '20px',
          background: '#fff',
          borderRadius: '50%',
          transition: 'left 0.2s',
        }}
      />
    </button>
    <span
      style={{
        fontSize: '0.875rem',
        fontWeight: value === 'yearly' ? '600' : '400',
        color: value === 'yearly' ? '#fff' : '#888',
        cursor: 'pointer',
      }}
      onClick={() => onChange('yearly')}
    >
      Yearly
    </span>
    {yearlyDiscount > 0 && (
      <span
        style={{
          padding: '0.25rem 0.5rem',
          background: 'rgba(16, 185, 129, 0.15)',
          borderRadius: '4px',
          fontSize: '0.6875rem',
          fontWeight: '600',
          color: '#10b981',
        }}
      >
        Save {yearlyDiscount}%
      </span>
    )}
  </div>
);

export default PricingCard;
