/**
 * Pricing Page - Based on backend billing system
 * Token-based pricing with 6 tiers from PAYMENT_PRICING_ANALYSIS.md
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  Zap,
  Shield,
  Users,
  Star,
  ArrowRight,
  Sparkles,
  Building2,
  Cloud,
  Coins,
} from 'lucide-react';

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100%',
    background: 'linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)',
    color: '#fff',
    padding: '1.5rem',
    overflowY: 'auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    maxWidth: '600px',
    margin: '0 auto 1.5rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: '#888',
    fontSize: '0.8rem',
    lineHeight: 1.5,
  },
  toggle: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    alignItems: 'center',
  },
  toggleBtn: {
    padding: '0.4rem 1rem',
    borderRadius: '20px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.75rem',
    transition: 'all 0.2s',
  },
  toggleActive: {
    background: '#6366f1',
    color: '#fff',
  },
  toggleInactive: {
    background: 'rgba(255,255,255,0.1)',
    color: '#888',
  },
  saveBadge: {
    background: 'rgba(16, 185, 129, 0.2)',
    color: '#10b981',
    padding: '0.2rem 0.5rem',
    borderRadius: '10px',
    fontSize: '0.65rem',
    fontWeight: '500',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    maxWidth: '900px',
    margin: '0 auto 1.5rem',
  },
  card: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '1rem',
    position: 'relative' as const,
    display: 'flex',
    flexDirection: 'column' as const,
  },
  cardPopular: {
    border: '1px solid #6366f1',
    background: 'rgba(99,102,241,0.08)',
  },
  popularBadge: {
    position: 'absolute' as const,
    top: '-8px',
    right: '12px',
    background: '#6366f1',
    color: '#fff',
    padding: '0.15rem 0.5rem',
    borderRadius: '8px',
    fontSize: '0.6rem',
    fontWeight: '500',
  },
  planIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.5rem',
  },
  planName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '0.15rem',
  },
  planDesc: {
    color: '#666',
    fontSize: '0.65rem',
    marginBottom: '0.75rem',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.25rem',
    marginBottom: '0.25rem',
  },
  price: {
    fontSize: '1.5rem',
    fontWeight: '700',
  },
  priceUnit: {
    fontSize: '0.65rem',
    color: '#888',
  },
  tokens: {
    fontSize: '0.65rem',
    color: '#10b981',
    marginBottom: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  features: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 0.75rem 0',
    flex: 1,
  },
  feature: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.35rem',
    fontSize: '0.65rem',
    color: '#aaa',
    marginBottom: '0.35rem',
    lineHeight: 1.3,
  },
  featureCheck: {
    color: '#10b981',
    flexShrink: 0,
    marginTop: '1px',
  },
  cta: {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.7rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    transition: 'all 0.2s',
    marginTop: 'auto',
  },
  ctaPrimary: {
    background: '#6366f1',
    color: '#fff',
  },
  ctaSecondary: {
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.15)',
  },
  tokenSection: {
    maxWidth: '900px',
    margin: '0 auto 1.5rem',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    padding: '1rem',
  },
  tokenTitle: {
    fontSize: '0.85rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  tokenGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '0.75rem',
  },
  tokenPack: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '0.75rem',
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tokenAmount: {
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  tokenPrice: {
    fontSize: '0.7rem',
    color: '#10b981',
  },
  tokenSavings: {
    fontSize: '0.6rem',
    color: '#888',
  },
  faq: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  faqTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
    textAlign: 'center' as const,
  },
  faqItem: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '8px',
    padding: '0.6rem 0.75rem',
    marginBottom: '0.4rem',
  },
  faqQ: {
    fontSize: '0.7rem',
    fontWeight: '500',
    marginBottom: '0.2rem',
  },
  faqA: {
    fontSize: '0.65rem',
    color: '#888',
    lineHeight: 1.4,
  },
};

// Pricing tiers from PAYMENT_PRICING_ANALYSIS.md
const plans = [
  {
    name: 'Free',
    icon: <Zap size={16} color="#6366f1" />,
    iconBg: 'rgba(99,102,241,0.2)',
    description: 'Try the platform',
    price: { monthly: 0, yearly: 0 },
    tokens: '10,000',
    features: [
      '2 agents max',
      'Community support',
      'Basic analytics',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Builder',
    icon: <Sparkles size={16} color="#f59e0b" />,
    iconBg: 'rgba(245,158,11,0.2)',
    description: 'Individual developers',
    price: { monthly: 39, yearly: 390 },
    tokens: '500,000',
    features: [
      '10 agents',
      '5 published agents',
      'Email support',
      'API access',
    ],
    cta: 'Start Trial',
    popular: false,
  },
  {
    name: 'Pro',
    icon: <Star size={16} color="#fbbf24" />,
    iconBg: 'rgba(251,191,36,0.2)',
    description: 'Growing teams',
    price: { monthly: 99, yearly: 990 },
    tokens: '2,000,000',
    features: [
      '50 agents',
      '5 team members',
      'Priority support',
      'Advanced analytics',
      'Custom domains',
    ],
    cta: 'Start Trial',
    popular: true,
  },
  {
    name: 'Team',
    icon: <Users size={16} color="#10b981" />,
    iconBg: 'rgba(16,185,129,0.2)',
    description: 'Scaling organizations',
    price: { monthly: 299, yearly: 2990 },
    tokens: '10,000,000',
    features: [
      '200 agents',
      '25 team members',
      'SSO & RBAC',
      'Account manager',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
  {
    name: 'Enterprise',
    icon: <Building2 size={16} color="#8b5cf6" />,
    iconBg: 'rgba(139,92,246,0.2)',
    description: 'Large organizations',
    price: { monthly: 999, yearly: 9990 },
    tokens: 'Unlimited',
    features: [
      'Unlimited agents',
      'On-premise option',
      'Compliance (SOC2)',
      'Dedicated support',
      'Custom SLA',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
  {
    name: 'Private Cloud',
    icon: <Cloud size={16} color="#ec4899" />,
    iconBg: 'rgba(236,72,153,0.2)',
    description: 'Air-gapped deployments',
    price: { monthly: -1, yearly: -1 },
    tokens: 'Unlimited',
    features: [
      'Dedicated infrastructure',
      'Air-gapped option',
      'Custom compliance',
      '24/7 support',
      'White-label',
    ],
    cta: 'Contact Us',
    popular: false,
  },
];

// Token packs from PAYMENT_PRICING_ANALYSIS.md
const tokenPacks = [
  { amount: '100K', price: 9, perK: 0.09, savings: '10%' },
  { amount: '500K', price: 40, perK: 0.08, savings: '20%' },
  { amount: '1M', price: 70, perK: 0.07, savings: '30%' },
  { amount: '5M', price: 300, perK: 0.06, savings: '40%' },
  { amount: '10M', price: 500, perK: 0.05, savings: '50%' },
];

const faqs = [
  { q: 'What are Platform Tokens?', a: 'One currency for everything - agent runs, workflows, storage, and LLM calls.' },
  { q: 'Can I buy more tokens?', a: 'Yes, token packs are available with volume discounts up to 50% off.' },
  { q: 'What happens when I run out?', a: 'You can purchase additional tokens or upgrade your plan anytime.' },
];

export default function PricingPageNew() {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(true);
  const [loading, setLoading] = useState(false);

  const formatPrice = (price: number) => {
    if (price === -1) return 'Custom';
    if (price === 0) return '$0';
    const displayPrice = isYearly ? Math.round(price * 10 / 12) : price;
    return `$${displayPrice}`;
  };

  const handleSelectPlan = async (planName: string) => {
    if (planName === 'Free') {
      navigate('/signup');
    } else if (planName === 'Enterprise' || planName === 'Private Cloud' || planName === 'Team') {
      navigate('/contact');
    } else {
      navigate(`/signup?plan=${planName.toLowerCase()}`);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Simple Token-Based Pricing</h1>
        <p style={styles.subtitle}>
          One currency for everything: agent executions, workflows, storage, and LLM calls.
          No hidden fees, no surprises.
        </p>
      </header>

      <div style={styles.toggle}>
        <button
          style={{ ...styles.toggleBtn, ...(isYearly ? styles.toggleInactive : styles.toggleActive) }}
          onClick={() => setIsYearly(false)}
        >
          Monthly
        </button>
        <button
          style={{ ...styles.toggleBtn, ...(isYearly ? styles.toggleActive : styles.toggleInactive) }}
          onClick={() => setIsYearly(true)}
        >
          Yearly
        </button>
        {isYearly && <span style={styles.saveBadge}>Save 17%</span>}
      </div>

      <div style={styles.grid}>
        {plans.map((plan) => (
          <div
            key={plan.name}
            style={{ ...styles.card, ...(plan.popular ? styles.cardPopular : {}) }}
          >
            {plan.popular && <span style={styles.popularBadge}>Popular</span>}
            <div style={{ ...styles.planIcon, background: plan.iconBg }}>
              {plan.icon}
            </div>
            <div style={styles.planName}>{plan.name}</div>
            <div style={styles.planDesc}>{plan.description}</div>
            <div style={styles.priceRow}>
              <span style={styles.price}>{formatPrice(plan.price.monthly)}</span>
              {plan.price.monthly > 0 && <span style={styles.priceUnit}>/mo</span>}
            </div>
            <div style={styles.tokens}>
              <Coins size={12} />
              {plan.tokens} tokens/mo
            </div>
            <ul style={styles.features}>
              {plan.features.map((f, i) => (
                <li key={i} style={styles.feature}>
                  <Check size={12} style={styles.featureCheck} />
                  {f}
                </li>
              ))}
            </ul>
            <button
              style={{ ...styles.cta, ...(plan.popular ? styles.ctaPrimary : styles.ctaSecondary) }}
              onClick={() => handleSelectPlan(plan.name)}
            >
              {plan.cta}
              <ArrowRight size={12} />
            </button>
          </div>
        ))}
      </div>

      <div style={styles.tokenSection}>
        <div style={styles.tokenTitle}>
          <Coins size={16} color="#10b981" />
          Need More Tokens? Buy Token Packs
        </div>
        <div style={styles.tokenGrid}>
          {tokenPacks.map((pack) => (
            <div
              key={pack.amount}
              style={styles.tokenPack}
              onClick={() => navigate('/billing?purchase=' + pack.amount)}
            >
              <div style={styles.tokenAmount}>{pack.amount}</div>
              <div style={styles.tokenPrice}>${pack.price}</div>
              <div style={styles.tokenSavings}>Save {pack.savings}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.faq}>
        <h2 style={styles.faqTitle}>Questions?</h2>
        {faqs.map((faq, i) => (
          <div key={i} style={styles.faqItem}>
            <div style={styles.faqQ}>{faq.q}</div>
            <div style={styles.faqA}>{faq.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
