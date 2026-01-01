import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  X,
  Zap,
  Users,
  Building2,
  Cloud,
  Star,
  ArrowRight,
  Info,
  Sparkles,
} from 'lucide-react';
import { PLANS, USAGE_PRICING, MARKETPLACE_COMMISSION, COMPUTE_CREDITS, formatPrice } from '../../utils/signupLogic';

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)',
    color: '#fff',
    padding: '4rem 2rem',
  },
  header: {
    textAlign: 'center',
    maxWidth: '800px',
    margin: '0 auto 3rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '1rem',
    background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '1.125rem',
    color: '#888',
    lineHeight: '1.6',
  },
  toggleContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '3rem',
  },
  toggleButton: {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  toggleActive: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#fff',
  },
  toggleInactive: {
    background: 'rgba(255,255,255,0.05)',
    color: '#888',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  saveBadge: {
    background: 'rgba(16,185,129,0.2)',
    color: '#10b981',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    marginLeft: '0.5rem',
  },
  plansGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    maxWidth: '1400px',
    margin: '0 auto 4rem',
  },
  planCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '2rem',
    position: 'relative',
    transition: 'all 0.3s',
  },
  planCardRecommended: {
    border: '2px solid #6366f1',
    background: 'rgba(99,102,241,0.05)',
  },
  recommendedBadge: {
    position: 'absolute',
    top: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#fff',
    padding: '0.375rem 1rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  planIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  planName: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  planBestFor: {
    fontSize: '0.8rem',
    color: '#888',
    marginBottom: '1rem',
  },
  planPrice: {
    marginBottom: '1.5rem',
  },
  priceAmount: {
    fontSize: '2.5rem',
    fontWeight: '700',
  },
  pricePeriod: {
    fontSize: '0.875rem',
    color: '#888',
  },
  planFeatures: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 1.5rem 0',
  },
  planFeature: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    fontSize: '0.8rem',
    color: '#ccc',
    marginBottom: '0.5rem',
  },
  planButton: {
    width: '100%',
    padding: '0.875rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s',
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#fff',
  },
  secondaryButton: {
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  section: {
    maxWidth: '1200px',
    margin: '0 auto 4rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  usageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  usageCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '1.5rem',
    textAlign: 'center',
  },
  usagePrice: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#6366f1',
    marginBottom: '0.25rem',
  },
  usageLabel: {
    fontSize: '0.8rem',
    color: '#888',
  },
  marketplaceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
  },
  marketplaceCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  marketplaceType: {
    fontSize: '0.875rem',
    fontWeight: '500',
    marginBottom: '0.5rem',
  },
  marketplaceCommission: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#10b981',
  },
  marketplaceNote: {
    fontSize: '0.7rem',
    color: '#666',
    marginTop: '0.5rem',
  },
  faq: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  faqItem: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '1.25rem',
    marginBottom: '1rem',
  },
  faqQuestion: {
    fontSize: '1rem',
    fontWeight: '500',
    marginBottom: '0.5rem',
  },
  faqAnswer: {
    fontSize: '0.875rem',
    color: '#888',
    lineHeight: '1.6',
  },
  comparisonTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.8rem',
  },
  th: {
    padding: '1rem',
    textAlign: 'left',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    color: '#888',
    fontWeight: '500',
  },
  td: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
};

const PLAN_ICONS: Record<string, { icon: React.ReactNode; bg: string }> = {
  free: { icon: <Zap size={24} />, bg: 'rgba(156,163,175,0.2)' },
  starter: { icon: <Sparkles size={24} />, bg: 'rgba(59,130,246,0.2)' },
  pro: { icon: <Star size={24} />, bg: 'rgba(99,102,241,0.2)' },
  team: { icon: <Users size={24} />, bg: 'rgba(16,185,129,0.2)' },
  enterprise: { icon: <Building2 size={24} />, bg: 'rgba(139,92,246,0.2)' },
  'private-cloud': { icon: <Cloud size={24} />, bg: 'rgba(236,72,153,0.2)' },
};

export default function PricingPageNew() {
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const handleSelectPlan = (planId: string, contactSales?: boolean) => {
    if (contactSales) {
      navigate('/contact?plan=' + planId);
    } else {
      navigate('/signup?plan=' + planId + '&billing=' + billingPeriod);
    }
  };

  const formatLimit = (value: number, suffix: string = '') => {
    if (value === -1) return 'Unlimited';
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M${suffix}`;
    if (value >= 1000) return `${Math.round(value / 1000)}K${suffix}`;
    return `${value}${suffix}`;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Simple, Transparent Pricing</h1>
        <p style={styles.subtitle}>
          Start free, scale as you grow. Build, deploy, and monetize AI agents 
          on the decentralized network.
        </p>
      </div>

      {/* Billing Toggle */}
      <div style={styles.toggleContainer}>
        <button
          style={{
            ...styles.toggleButton,
            ...(billingPeriod === 'monthly' ? styles.toggleActive : styles.toggleInactive),
          }}
          onClick={() => setBillingPeriod('monthly')}
        >
          Monthly
        </button>
        <button
          style={{
            ...styles.toggleButton,
            ...(billingPeriod === 'yearly' ? styles.toggleActive : styles.toggleInactive),
          }}
          onClick={() => setBillingPeriod('yearly')}
        >
          Yearly
          <span style={styles.saveBadge}>Save 17%</span>
        </button>
      </div>

      {/* Plans Grid */}
      <div style={styles.plansGrid}>
        {PLANS.filter(p => !p.isTrial).map((plan) => {
          const price = billingPeriod === 'monthly' ? plan.price.monthly : Math.round(plan.price.yearly / 12);
          const iconData = PLAN_ICONS[plan.id] || PLAN_ICONS.free;
          
          return (
            <div
              key={plan.id}
              style={{
                ...styles.planCard,
                ...(plan.recommended ? styles.planCardRecommended : {}),
              }}
            >
              {plan.recommended && (
                <div style={styles.recommendedBadge}>
                  <Star size={12} /> Most Popular
                </div>
              )}
              
              <div style={{ ...styles.planIcon, background: iconData.bg, color: '#fff' }}>
                {iconData.icon}
              </div>
              
              <div style={styles.planName}>{plan.name}</div>
              <div style={styles.planBestFor}>{plan.bestFor}</div>
              
              <div style={styles.planPrice}>
                {plan.contactSales ? (
                  <>
                    <span style={styles.priceAmount}>Custom</span>
                    <span style={styles.pricePeriod}> / starting at ${plan.price.monthly}/mo</span>
                  </>
                ) : (
                  <>
                    <span style={styles.priceAmount}>{formatPrice(price)}</span>
                    <span style={styles.pricePeriod}> / month</span>
                  </>
                )}
              </div>
              
              <ul style={styles.planFeatures}>
                {plan.features.slice(0, 8).map((feature, i) => (
                  <li key={i} style={styles.planFeature}>
                    <Check size={14} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button
                style={{
                  ...styles.planButton,
                  ...(plan.recommended ? styles.primaryButton : styles.secondaryButton),
                }}
                onClick={() => handleSelectPlan(plan.id, plan.contactSales)}
              >
                {plan.contactSales ? 'Contact Sales' : 'Get Started'}
                <ArrowRight size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Usage-Based Pricing */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Pay-as-you-go Pricing</h2>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '2rem', fontSize: '0.875rem' }}>
          Only pay for what you use beyond your plan limits
        </p>
        <div style={styles.usageGrid}>
          <div style={styles.usageCard}>
            <div style={styles.usagePrice}>${USAGE_PRICING.agentExecution}</div>
            <div style={styles.usageLabel}>per agent execution</div>
          </div>
          <div style={styles.usageCard}>
            <div style={styles.usagePrice}>${USAGE_PRICING.workflowRun}</div>
            <div style={styles.usageLabel}>per workflow run</div>
          </div>
          <div style={styles.usageCard}>
            <div style={styles.usagePrice}>${USAGE_PRICING.storagePerGB}</div>
            <div style={styles.usageLabel}>per GB / month</div>
          </div>
          <div style={styles.usageCard}>
            <div style={styles.usagePrice}>${USAGE_PRICING.computePerSecond}</div>
            <div style={styles.usageLabel}>per compute second</div>
          </div>
        </div>
      </div>

      {/* Marketplace Earnings */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Monetize Your Agents</h2>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '2rem', fontSize: '0.875rem' }}>
          Publish agents to the marketplace and earn revenue
        </p>
        <div style={styles.marketplaceGrid}>
          <div style={styles.marketplaceCard}>
            <div style={styles.marketplaceType}>One-time Purchase</div>
            <div style={styles.marketplaceCommission}>You keep {(1 - MARKETPLACE_COMMISSION.oneTimePurchase) * 100}%</div>
            <div style={styles.marketplaceNote}>Platform fee: {MARKETPLACE_COMMISSION.oneTimePurchase * 100}%</div>
          </div>
          <div style={styles.marketplaceCard}>
            <div style={styles.marketplaceType}>Subscription</div>
            <div style={styles.marketplaceCommission}>You keep {(1 - MARKETPLACE_COMMISSION.subscription) * 100}%</div>
            <div style={styles.marketplaceNote}>Platform fee: {MARKETPLACE_COMMISSION.subscription * 100}%</div>
          </div>
          <div style={styles.marketplaceCard}>
            <div style={styles.marketplaceType}>Per-Execution</div>
            <div style={styles.marketplaceCommission}>You keep {(1 - MARKETPLACE_COMMISSION.perExecution) * 100}%</div>
            <div style={styles.marketplaceNote}>Platform fee: {MARKETPLACE_COMMISSION.perExecution * 100}%</div>
          </div>
          <div style={styles.marketplaceCard}>
            <div style={styles.marketplaceType}>Enterprise License</div>
            <div style={styles.marketplaceCommission}>You keep {(1 - MARKETPLACE_COMMISSION.enterpriseLicense) * 100}%</div>
            <div style={styles.marketplaceNote}>Platform fee: {MARKETPLACE_COMMISSION.enterpriseLicense * 100}%</div>
          </div>
        </div>
      </div>

      {/* Compute Credits */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Compute Credits</h2>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '2rem', fontSize: '0.875rem' }}>
          Pre-purchase compute at a discount
        </p>
        <div style={{ ...styles.usageGrid, maxWidth: '600px', margin: '0 auto' }}>
          {COMPUTE_CREDITS.map((pack) => (
            <div key={pack.id} style={styles.usageCard}>
              <div style={styles.usagePrice}>${pack.price}</div>
              <div style={styles.usageLabel}>{formatLimit(pack.credits)} credits</div>
              <div style={{ color: '#10b981', fontSize: '0.7rem', marginTop: '0.25rem' }}>
                Save {pack.savings}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Frequently Asked Questions</h2>
        <div style={styles.faq}>
          <div style={styles.faqItem}>
            <div style={styles.faqQuestion}>What's included in the free tier?</div>
            <div style={styles.faqAnswer}>
              The free tier includes 100 agent executions, 10 workflow runs, and the ability to 
              publish up to 2 agents. You'll need to bring your own API key (BYOK) for LLM access.
            </div>
          </div>
          <div style={styles.faqItem}>
            <div style={styles.faqQuestion}>How does marketplace monetization work?</div>
            <div style={styles.faqAnswer}>
              When you publish an agent to the marketplace, you can set your own pricing model 
              (one-time, subscription, or per-execution). We handle payments and take a small 
              platform fee, then pay you automatically via Stripe Connect.
            </div>
          </div>
          <div style={styles.faqItem}>
            <div style={styles.faqQuestion}>What happens if I exceed my plan limits?</div>
            <div style={styles.faqAnswer}>
              You'll be notified when approaching limits (80%, 90%, 100%). You can either 
              upgrade your plan or pay-as-you-go for overages at the rates shown above.
            </div>
          </div>
          <div style={styles.faqItem}>
            <div style={styles.faqQuestion}>Can I cancel anytime?</div>
            <div style={styles.faqAnswer}>
              Yes! All plans are month-to-month with no long-term commitment. Annual plans 
              can be cancelled with prorated refunds.
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Ready to get started?</h2>
        <p style={{ color: '#888', marginBottom: '1.5rem' }}>
          Start free and upgrade when you need more power
        </p>
        <button
          style={{ ...styles.planButton, ...styles.primaryButton, width: 'auto', padding: '1rem 2rem' }}
          onClick={() => handleSelectPlan('free')}
        >
          Start Building for Free
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
