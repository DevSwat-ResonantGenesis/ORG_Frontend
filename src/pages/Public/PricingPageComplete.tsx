/**
 * Pricing Page - Complete Implementation
 * Uses pricing configuration from src/config/pricing.ts
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getSessionData } from '../../utils/auth-cookies';
import {
  Globe, Brain, Users, Code, GitBranch,
  Shield, Lock, Store, Check, Zap,
  Building2, ChevronDown,
} from 'lucide-react';
import {
  CORE_FEATURES,
  FAQ,
  HASH_SPHERE_MEMORY_API_PLANS,
  CODE_VISUALIZER_API_PLANS,
  type Plan,
  type CoreFeature,
} from '../../config/pricing';
import { pricingService } from '../../services/pricingService';
import type { CreditPack } from '../../config/pricingConfig';
import styles from './PricingPage.module.css';

const iconMap: Record<string, React.ReactNode> = {
  globe: <Globe size={22} />,
  brain: <Brain size={22} />,
  users: <Users size={22} />,
  code: <Code size={22} />,
  git_branch: <GitBranch size={22} />,
  shield: <Shield size={22} />,
  lock: <Lock size={22} />,
  store: <Store size={22} />,
};

const planIcons: Record<string, React.ReactNode> = {
  developer: <Zap size={16} />,
  'consulting-workshop': <Brain size={16} />,
  plus: <Shield size={16} />,
  enterprise: <Building2 size={16} />,
};

// Short, non-duplicated bullet list per plan — Developer & Plus share the same
// feature set (only credits/rollover differ), so this is written once per tier
// rather than repeated inside a giant per-plan limits table.
const PLAN_HIGHLIGHTS: Record<string, string[]> = {
  developer: [
    'All platform features unlocked',
    'Unlimited agents & autonomous mode',
    '100 compute hours / month',
    '5 GB storage, 100 RAG documents',
    'Community + email support',
  ],
  'consulting-workshop': [
    '1st Week: Technical Pre-Research & Analysis',
    '2nd Week: High-Intensity Sprint Workshop',
    'Next 30 Days: Dedicated Engineering Advisory',
    'Product & Architecture Discovery',
    'One-time payment, no subscription',
  ],
  plus: [
    'Everything in Plus',
    'Rollover up to 249.5K credits',
    'Discounted top-ups ($8 / 10K)',
    '100 compute hours / month',
    'Priority email + Slack support',
  ],
  enterprise: [
    'Custom credits & compute',
    'SLA-backed governance',
    'SOC2, HIPAA, GDPR compliance',
    'Cloud, hybrid, or on-prem',
    'Dedicated engineers',
  ],
};

const PLAN_META: Record<string, { support: string; sla: string; deployment: string }> = {
  developer: { support: 'Community + email', sla: 'Standard', deployment: 'Cloud' },
  'consulting-workshop': { support: 'Dedicated advisory', sla: 'N/A', deployment: 'N/A' },
  plus: { support: 'Priority email + Slack', sla: 'Standard', deployment: 'Cloud' },
  enterprise: { support: 'Dedicated engineers', sla: '99.9% guarantee', deployment: 'Cloud, hybrid, or on-prem' },
};

interface CompareRow {
  label: string;
  value: (plan: Plan) => React.ReactNode;
}

const COMPARE_ROWS: CompareRow[] = [
  { label: 'Credits / month', value: (p) => p.credits.display },
  { label: 'Rollover & top-ups', value: (p) => p.credits.note },
  {
    label: 'Compute hours',
    value: (p) => (p.limits.ideCompute.computeHours === -1 ? 'Unlimited' : `${p.limits.ideCompute.computeHours}/mo`),
  },
  {
    label: 'Snapshots',
    value: (p) => (p.limits.governance.snapshots === -1 ? 'Unlimited' : String(p.limits.governance.snapshots)),
  },
  { label: 'Support', value: (p) => PLAN_META[p.id]?.support ?? '—' },
  { label: 'SLA', value: (p) => PLAN_META[p.id]?.sla ?? '—' },
  { label: 'Deployment', value: (p) => PLAN_META[p.id]?.deployment ?? '—' },
];

// Credit usage reference — condensed from 6 overlapping cards (which contained
// a direct contradiction: "Memory write" was listed at both 50 and 2 credits)
// down to 3 groups. Memory API and Code Visualizer usage are intentionally
// NOT repeated here — their pricing lives once, in the Add-on APIs section below.
interface CreditGroup {
  title: string;
  rows: { label: string; value: string }[];
  note?: string;
}

const CREDIT_GROUPS: CreditGroup[] = [
  {
    title: 'AI & Agents',
    rows: [
      { label: 'Average chat message', value: '~20 credits' },
      { label: 'Agent session start', value: '100 credits' },
      { label: 'Agent reasoning step', value: '500 credits' },
      { label: 'Tool / web call', value: '200–300 credits' },
      { label: 'Workflow run (5-node avg)', value: '~2,500 credits' },
    ],
  },
  {
    title: 'Compute & Storage',
    rows: [
      { label: 'Code execution (base)', value: '5 credits' },
      { label: 'Terminal session (per min)', value: '50 credits' },
      { label: 'Preview (per min)', value: '200 credits' },
      { label: 'Storage', value: '1 credit / MB' },
    ],
    note: 'All plans include 100 compute hours, 5 GB storage, and 100 RAG documents/month. Memory API usage is billed separately — see Memory API below.',
  },
  {
    title: 'Platform & Governance',
    rows: [
      { label: 'Hash Sphere identity add', value: '50 credits' },
      { label: 'Hash Sphere transaction', value: '20 credits' },
      { label: 'Governance check', value: '50 credits' },
      { label: 'Audit entry / compliance report', value: '100 / 500 credits' },
      { label: 'API GET / POST', value: '1 / 5 credits' },
    ],
    note: 'Code Visualizer usage is billed separately — see Code Visualizer API below.',
  },
];

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const billingPeriod = 'monthly' as const;
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [apiCheckoutLoading, setApiCheckoutLoading] = useState<string | null>(null);
  const [creditPackLoading, setCreditPackLoading] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [creditPacks, setCreditPacks] = useState<CreditPack[]>([]);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [showCreditDetails, setShowCreditDetails] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Get user's current plan to determine credit pack access
  const sessionData = getSessionData();
  const userPlan = sessionData?.plan?.toLowerCase();
  const canPurchaseCredits = userPlan === 'developer' || userPlan === 'plus' || userPlan === 'enterprise';

  useEffect(() => {
    const loadPricing = async () => {
      try {
        const pricing = await pricingService.getPricing(true);

        const buildPlan = (planId: string, name: string): Plan => {
          const cfg = pricing?.plans?.[planId];
          const monthly = Number(cfg?.price?.monthly ?? 0);
          const yearly = Number(cfg?.price?.yearly ?? 0);
          const included = Number(cfg?.credits?.included ?? 0);
          const isEnterprise = planId === 'enterprise';
          const isPlus = planId === 'plus';

          // Override credits display for specific plans
          let creditsDisplay = included === -1 ? 'Custom' : `${included.toLocaleString()} / month`;
          if (planId === 'developer') {
            creditsDisplay = '29,000 credits / month';
          } else if (planId === 'plus') {
            creditsDisplay = '499,000 credits / month';
          }

          return {
            id: planId,
            name,
            badge: isEnterprise ? 'Custom' : isPlus ? 'Professional' : `$${monthly}/month`,
            price: {
              monthly,
              yearly,
              display: isEnterprise ? 'Custom' : `$${monthly}`,
              period: isEnterprise ? '' : '/month',
            },
            description:
              planId === 'developer'
                ? 'Full platform access for solo builders.'
                : planId === 'plus'
                ? 'For power users and heavy workloads.'
                : 'For organizations running AI as critical infrastructure.',
            credits: {
              included,
              display: creditsDisplay,
              rollover: Boolean(cfg?.credits?.rollover ?? false),
              rolloverLimit: cfg?.credits?.rolloverLimit,
              topups: Boolean(cfg?.credits?.topups ?? false),
              topupPrice: cfg?.credits?.topupPrice,
              topupAmount: cfg?.credits?.topupAmount,
              note: isEnterprise ? 'Tailored to your needs' : isPlus ? 'Rollover up to 249.5K • Top-ups: $8/10K' : 'No rollover • Top-ups available',
            },
            recommended: planId === 'plus',
            contactSales: isEnterprise,
            cta: {
              text: isEnterprise ? 'Contact Sales' : planId === 'plus' ? 'Start Business Plan' : 'Start Plus Plan',
              style: planId === 'plus' ? 'primary' : 'secondary',
            },
            limits: {
              agents: { active: -1, autonomousMode: true, teams: true },
              userTeams: { enabled: false },
              chat: { conversations: -1, messagesPerDay: -1, evidenceGraph: true },
              hashSphereMemory: {
                standaloneService: true,
                universeAccess: planId === 'enterprise' ? 'Multi Universe' : '1 Universe',
                multiLayer: planId === 'enterprise',
              },
              ideCompute: {
                computeHours: cfg?.limits?.compute?.hours ?? (planId === 'enterprise' ? -1 : 100),
                previewTime: 'Unlimited',
                aiAssistance: planId === 'enterprise' ? 'Full + Custom' : 'Full',
                customRuntimes: planId === 'enterprise',
              },
              governance: {
                killSwitch: planId === 'enterprise' ? 'SLA-backed' : 'Automated',
                invariants: planId === 'enterprise' ? 'Custom' : 15,
                snapshots: planId === 'enterprise' ? -1 : 10,
              },
              codeVisualizer: {
                codebaseGraphs: true,
                dependencyAnalysis: true,
                ciIntegration: planId === 'enterprise',
              },
            },
            features: [],
          };
        };

        // Enterprise is hidden from the public pricing page for now (still a
        // valid plan in pricing.yaml for existing/contact-sales customers —
        // just not shown as a selectable card here).
        const nextPlans: Plan[] = [
          buildPlan('developer', 'Plus'),
          {
            id: 'consulting-workshop',
            name: 'Consulting Workshop',
            badge: 'One-time',
            price: {
              monthly: 24500,
              yearly: 24500,
              display: '$24,500',
              period: '',
            },
            description: 'Product & Architecture Discovery Consulting Workshop',
            credits: {
              included: 0,
              display: 'One-time payment',
              rollover: false,
              topups: false,
              note: '',
            },
            recommended: false,
            contactSales: false,
            cta: {
              text: 'Purchase Workshop',
              style: 'primary',
            },
            limits: {
              agents: { active: -1, autonomousMode: true, teams: true },
              userTeams: { enabled: false },
              chat: { conversations: -1, messagesPerDay: -1, evidenceGraph: true },
              hashSphereMemory: {
                standaloneService: true,
                universeAccess: '1 Universe',
                multiLayer: false,
              },
              ideCompute: {
                computeHours: -1,
                previewTime: 'Unlimited',
                aiAssistance: 'Full',
                customRuntimes: false,
              },
              governance: {
                killSwitch: 'Automated',
                invariants: 15,
                snapshots: 10,
              },
              codeVisualizer: {
                codebaseGraphs: true,
                dependencyAnalysis: true,
                ciIntegration: false,
              },
            },
            features: [],
          },
          buildPlan('plus', 'Business'),
        ];
        setPlans(nextPlans);
        setExpandedPlanId((prev) => prev ?? nextPlans.find((p) => p.recommended)?.id ?? nextPlans[0]?.id ?? null);
      } catch {
        setPlans([]);
      }

      try {
        if (typeof navigator !== 'undefined' && navigator.userAgent === 'ReactSnap') {
          setCreditPacks([]);
          return;
        }
        const res = await fetch('/api/billing/pricing', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const packs = Array.isArray(data?.credit_packs) ? data.credit_packs : [];
          const mapped: CreditPack[] = packs.map((p: any) => ({
            id: String(p.id),
            name: String(p.name),
            credits: Number(p.credits ?? 0),
            price: Number(p.price ?? 0),
            pricePerK: Number(p.price_per_1k ?? p.pricePerK ?? 0),
            savings: p.savings_percent ? `${p.savings_percent}%` : undefined,
            description: String(p.description ?? ''),
            recommended: Boolean(p.recommended ?? false),
          }));
          setCreditPacks(mapped);
        }
      } catch {
        setCreditPacks([]);
      }
    };

    loadPricing();
  }, []);

  // Silently refresh access token cookie before authenticated calls.
  // The rg_access_token cookie (60 min) may expire while rg_session (30 day) persists.
  // This uses the rg_refresh_token HttpOnly cookie to get a fresh access token.
  const ensureAuth = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const handleCreditPackPurchase = async (pack: CreditPack) => {
    if (!isAuthenticated()) {
      navigate('/signup', { state: { creditPack: pack.id } });
      return;
    }

    if (!canPurchaseCredits) {
      navigate('/pricing?upgrade=plus');
      return;
    }

    setCreditPackLoading(pack.id);
    try {
      await ensureAuth();
      const response = await fetch('/api/billing/checkout/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          pack_id: pack.id,
          credits: pack.credits,
          amount_usd: pack.price,
          success_url: `${window.location.origin}/dashboard?credits_purchased=true`,
          cancel_url: `${window.location.origin}/pricing?canceled=true`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.checkout_url || data.url) {
          window.location.href = data.checkout_url || data.url;
        } else {
          alert('Checkout session created but no redirect URL received.');
        }
      } else {
        const error = await response.json();
        console.error('Credit checkout failed:', error);
        alert('Checkout failed: ' + (error.detail || 'Please try again.'));
      }
    } catch (err) {
      console.error('Credit checkout failed:', err);
      alert('Checkout failed. Please try again.');
    } finally {
      setCreditPackLoading(null);
    }
  };

  const handleConsultingWorkshopPurchase = async () => {
    if (!isAuthenticated()) {
      navigate('/signup', { state: { consultingWorkshop: true } });
      return;
    }

    setCheckoutLoading('consulting-workshop');
    try {
      await ensureAuth();
      const response = await fetch('/api/billing/checkout/consulting-workshop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount_usd: 24500,
          success_url: `${window.location.origin}/dashboard?workshop_purchased=true`,
          cancel_url: `${window.location.origin}/pricing?canceled=true`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.checkout_url || data.url) {
          window.location.href = data.checkout_url || data.url;
        } else {
          alert('Checkout session created but no redirect URL received.');
        }
      } else {
        const error = await response.json();
        console.error('Consulting workshop checkout failed:', error);
        alert('Checkout failed: ' + (error.detail || 'Please try again.'));
      }
    } catch (err) {
      console.error('Consulting workshop checkout failed:', err);
      alert('Checkout failed. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handlePlanSelect = async (plan: Plan) => {
    if (plan.contactSales) {
      navigate('/contact?plan=enterprise');
      return;
    }

    if (!isAuthenticated()) {
      navigate('/signup', { state: { plan: plan.id, billingPeriod } });
      return;
    }

    setCheckoutLoading(plan.id);
    try {
      await ensureAuth();
      const response = await fetch('/api/billing/checkout/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          plan_id: plan.id,
          billing_cycle: billingPeriod,
          success_url: `${window.location.origin}/dashboard?success=true&plan=${plan.id}`,
          cancel_url: `${window.location.origin}/pricing?canceled=true`,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.checkout_url || data.url) {
          window.location.href = data.checkout_url || data.url;
        } else {
          console.error('No checkout URL returned:', data);
          alert('Checkout session created but no redirect URL received.');
        }
      } else {
        const error = await response.json().catch(() => ({}));
        console.error('Checkout failed:', error);
        alert('Checkout failed: ' + (error.detail || 'Please try again.'));
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      alert('Checkout failed. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleApiSubscribe = async (apiType: 'state_physics' | 'hash_sphere_memory' | 'code_visualizer', planId: string, isEnterprise: boolean = false) => {
    if (isEnterprise) {
      navigate(`/contact?api=${apiType}&plan=enterprise`);
      return;
    }

    if (!isAuthenticated()) {
      navigate('/signup', { state: { apiSubscription: { type: apiType, plan: planId } } });
      return;
    }

    const loadingKey = `${apiType}_${planId}`;
    setApiCheckoutLoading(loadingKey);

    try {
      await ensureAuth();
      const response = await fetch('/api/billing/checkout/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          plan_id: apiType === 'state_physics'
          ? `state_physics_${planId}`
          : apiType === 'code_visualizer'
          ? `code_visualizer_${planId}`
          : `hash_sphere_memory_${planId}`,
          billing_cycle: 'monthly',
          success_url: `${window.location.origin}/api-keys?success=true&api=${apiType}`,
          cancel_url: `${window.location.origin}/pricing?canceled=true`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.checkout_url || data.url;
      } else {
        console.error('API checkout failed');
        alert('Checkout failed. Please try again.');
      }
    } catch (err) {
      console.error('API checkout failed:', err);
      alert('Checkout failed. Please try again.');
    } finally {
      setApiCheckoutLoading(null);
    }
  };

  const getDisplayPrice = (plan: Plan): string => {
    if (plan.price.display === 'Custom') return 'Custom';
    return billingPeriod === 'monthly'
      ? plan.price.display
      : `$${Math.round(plan.price.yearly / 12)}`;
  };

  const renderPlanCard = (plan: Plan) => {
    const isRecommended = plan.recommended;
    const isConsultingWorkshop = plan.id === 'consulting-workshop';

    return (
      <div
        key={plan.id}
        className={`${styles.planCard} ${isRecommended ? styles.planCardRecommended : ''}`}
      >
        {isRecommended && <span className={styles.recommendedBadge}>Recommended</span>}
        <div className={styles.planCardHeader}>
          {planIcons[plan.id]}
          <span className={styles.planName}>{plan.name}</span>
        </div>
        <div className={styles.planPrice}>
          {getDisplayPrice(plan)}
          {plan.price.period && <span>{plan.price.period}</span>}
        </div>
        <div className={styles.planCredits}>{plan.credits.display}</div>
        <ul className={styles.planFeatureList}>
          {(PLAN_HIGHLIGHTS[plan.id] ?? []).map((item) => (
            <li key={item} className={styles.planFeatureItem}>
              <Check size={15} className={styles.checkIcon} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <button
          className={`${styles.planCta} ${isRecommended ? styles.planCtaPrimary : ''}`}
          onClick={() => isConsultingWorkshop ? handleConsultingWorkshopPurchase() : handlePlanSelect(plan)}
          disabled={checkoutLoading === plan.id}
        >
          {checkoutLoading === plan.id ? 'Redirecting…' : plan.cta.text}
        </button>
      </div>
    );
  };

  const renderFeatureCard = (feature: CoreFeature) => (
    <div key={feature.id} className={styles.featureCard}>
      <div className={styles.featureIcon}>
        {iconMap[feature.icon] || <Zap size={22} />}
      </div>
      <h4 className={styles.featureTitle}>{feature.name}</h4>
      <p className={styles.featureDescription}>{feature.description}</p>
    </div>
  );

  const renderAddonPlans = (
    apiType: 'state_physics' | 'hash_sphere_memory' | 'code_visualizer',
    addonPlans: Array<{ id: string; name: string; price: number; period: string; features: string[] }>,
    unitLabel: (plan: any) => string,
    popularId: string,
    enterpriseDisplayPrice: string,
  ) => (
    <div className={styles.addonPlansGrid}>
      {addonPlans.map((plan) => {
        const isEnterprise = plan.id === 'enterprise';
        const isPopular = plan.id === popularId;
        const loadingKey = `${apiType}_${plan.id}`;

        return (
          <div key={plan.id} className={`${styles.addonPlanCard} ${isPopular ? styles.addonPlanCardPopular : ''}`}>
            {isPopular && <span className={styles.addonPlanBadge}>Popular</span>}
            <h4 className={styles.addonPlanName}>{plan.name}</h4>
            <div className={styles.addonPlanPrice}>
              <span className={styles.addonPriceAmount}>{isEnterprise ? enterpriseDisplayPrice : `$${plan.price}`}</span>
              <span className={styles.addonPricePeriod}>/{plan.period}</span>
            </div>
            <div className={styles.addonPlanUnits}>{unitLabel(plan)}</div>
            <ul className={styles.addonPlanFeatures}>
              {plan.features.slice(0, 4).map((feature: string, idx: number) => (
                <li key={idx} className={styles.addonPlanFeature}>
                  <Check size={14} className={styles.checkIcon} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              className={`${styles.addonPlanCta} ${isPopular ? styles.addonPlanCtaPrimary : ''}`}
              onClick={() => handleApiSubscribe(apiType, plan.id, isEnterprise)}
              disabled={apiCheckoutLoading === loadingKey}
            >
              {apiCheckoutLoading === loadingKey ? 'Redirecting…' : isEnterprise ? 'Contact Sales' : 'Subscribe'}
            </button>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={styles.pricingPage}>
      <div className={styles.sectionContent}>
        {/* 1. Hero */}
        <div className={styles.sectionHeader}>
          <h1 className={styles.sectionTitle}>Simple, transparent pricing</h1>
          <p className={styles.sectionDescription}>
            Plus and Business share every feature — only credits and rollover differ. Usage is metered via Resonant Credits, 1 credit ≈ $0.001.
          </p>
        </div>

        {/* 2. Plan cards */}
        <div className={styles.plansGrid}>
          {plans.map(renderPlanCard)}
        </div>

        {/* 3. Plan comparison — one table instead of a 24-box breakdown */}
        {plans.length > 0 && (
          <section className={styles.compareSection}>
            <div className={styles.compareTableWrapper}>
              <table className={styles.compareTable}>
                <thead>
                  <tr>
                    <th></th>
                    {plans.map((plan) => (
                      <th key={plan.id} className={plan.recommended ? styles.compareColRecommended : ''}>
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((row) => (
                    <tr key={row.label}>
                      <td className={styles.compareRowLabel}>{row.label}</td>
                      {plans.map((plan) => (
                        <td key={plan.id} className={plan.recommended ? styles.compareColRecommended : ''}>
                          {row.value(plan)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile-only accordion rendering of the same data */}
            <div className={styles.compareMobileList}>
              {plans.map((plan) => {
                const isOpen = expandedPlanId === plan.id;
                return (
                  <div key={plan.id} className={styles.compareMobileCard}>
                    <button
                      type="button"
                      className={styles.compareMobileHeader}
                      onClick={() => setExpandedPlanId(isOpen ? null : plan.id)}
                      aria-expanded={isOpen}
                    >
                      <span>{plan.name}</span>
                      <ChevronDown size={18} className={isOpen ? styles.chevronOpen : ''} />
                    </button>
                    {isOpen && (
                      <div className={styles.compareMobileBody}>
                        {COMPARE_ROWS.map((row) => (
                          <div key={row.label} className={styles.compareMobileRow}>
                            <span>{row.label}</span>
                            <strong>{row.value(plan)}</strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 4. Everything included — shown once, not per plan */}
        <section className={styles.featuresSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Everything included</h2>
            <p className={styles.sectionDescription}>Every paid plan includes full access to the core platform.</p>
          </div>
          <div className={styles.featuresGrid}>
            {CORE_FEATURES.map(renderFeatureCard)}
          </div>
        </section>

        {/* 5. Credit usage reference — collapsed by default */}
        <section className={styles.creditRefSection}>
          <button
            type="button"
            className={styles.creditRefToggle}
            onClick={() => setShowCreditDetails((v) => !v)}
            aria-expanded={showCreditDetails}
          >
            <span>{showCreditDetails ? 'Hide' : 'Show'} credit pricing details</span>
            <ChevronDown size={18} className={showCreditDetails ? styles.chevronOpen : ''} />
          </button>

          {showCreditDetails && (
            <div className={styles.creditRefGrid}>
              {CREDIT_GROUPS.map((group) => (
                <div key={group.title} className={styles.creditRefCard}>
                  <h4 className={styles.creditRefTitle}>{group.title}</h4>
                  <ul className={styles.creditRefList}>
                    {group.rows.map((row) => (
                      <li key={row.label}>
                        <span>{row.label}</span>
                        <strong>{row.value}</strong>
                      </li>
                    ))}
                  </ul>
                  {group.note && <p className={styles.creditRefNote}>{group.note}</p>}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 6. Buy credits */}
        <section className={styles.creditPacksSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Buy credits</h2>
            <p className={styles.sectionDescription}>
              {canPurchaseCredits
                ? 'Top up your account with credit packs. Larger packs offer better value.'
                : 'Credit packs are available for all paid subscribers. Sign up for a plan to purchase credits.'}
            </p>
          </div>

          <div className={styles.creditPacksGrid}>
            {creditPacks.map((pack) => (
              <div
                key={pack.id}
                className={`${styles.creditPackCard} ${pack.recommended ? styles.creditPackRecommended : ''}`}
              >
                {pack.recommended && <span className={styles.recommendedBadge}>Best Value</span>}
                <h3 className={styles.creditPackName}>{pack.name}</h3>
                <div className={styles.creditPackCredits}>{pack.credits.toLocaleString()} credits</div>
                <div className={styles.creditPackPrice}>
                  <span className={styles.creditPackPriceAmount}>${pack.price}</span>
                  <span className={styles.creditPackPriceRate}>${pack.pricePerK.toFixed(2)}/1k</span>
                </div>
                {pack.savings && <div className={styles.creditPackSavings}>Save {pack.savings}</div>}
                <p className={styles.creditPackDescription}>{pack.description}</p>
                <button
                  className={`${styles.creditPackButton} ${pack.recommended ? styles.creditPackButtonPrimary : ''}`}
                  onClick={() => handleCreditPackPurchase(pack)}
                  disabled={creditPackLoading === pack.id || !canPurchaseCredits}
                >
                  {creditPackLoading === pack.id ? 'Processing…' : canPurchaseCredits ? 'Buy Now' : 'Upgrade to Plus'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Add-on APIs — the single, properly-tiered home for Memory, State Physics, and Code Visualizer pricing */}
        <section className={styles.addonSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Add-on APIs</h2>
            <p className={styles.sectionDescription}>
              Specialized APIs billed separately from platform credits. Add any of these to any plan.
            </p>
          </div>

          <div className={styles.addonProduct}>
            <div className={styles.addonProductHeader}>
              <div className={styles.addonProductIcon}><Brain size={28} /></div>
              <div>
                <h3 className={styles.addonProductName}>Memory API</h3>
                <p className={styles.addonProductDescription}>
                  Physics-informed, immutable AI memory. 12-D hash-sphere retrieval, encrypted and hash-chained, isolated per user/agent/org.
                </p>
              </div>
            </div>
            {renderAddonPlans(
              'hash_sphere_memory',
              HASH_SPHERE_MEMORY_API_PLANS,
              (plan) => (plan.memoryUnits === -1 ? 'Unlimited MU' : `${(plan.memoryUnits / 1000).toLocaleString()}k MU/month`),
              'builder',
              '$25k+',
            )}
          </div>

          <div className={styles.addonProduct}>
            <div className={styles.addonProductHeader}>
              <div className={styles.addonProductIcon}><Code size={28} /></div>
              <div>
                <h3 className={styles.addonProductName}>Code Visualizer API</h3>
                <p className={styles.addonProductDescription}>
                  AST analysis, dependency graph generation, and interactive code visualization for understanding complex codebases at scale.
                </p>
              </div>
            </div>
            {renderAddonPlans(
              'code_visualizer',
              CODE_VISUALIZER_API_PLANS,
              (plan) => (plan.analysisUnits === -1 ? 'Custom AU' : `${(plan.analysisUnits / 1000).toLocaleString()}k AU/month`),
              'startup',
              '$2k+',
            )}
          </div>
        </section>

        {/* 8. FAQ — accordion, collapsed by default */}
        <section className={styles.faqSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Frequently asked questions</h2>
          </div>

          <div className={styles.faqList}>
            {FAQ.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className={styles.faqItem}>
                  <button
                    type="button"
                    className={styles.faqQuestionButton}
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                  >
                    <span>{item.question}</span>
                    <ChevronDown size={18} className={isOpen ? styles.chevronOpen : ''} />
                  </button>
                  {isOpen && <p className={styles.faqAnswer}>{item.answer}</p>}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PricingPage;
