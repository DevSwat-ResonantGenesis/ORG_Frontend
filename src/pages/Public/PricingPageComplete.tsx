/**
 * Pricing Page - Complete Implementation
 * Uses pricing configuration from src/config/pricing.ts
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getSessionData } from '../../utils/auth-cookies';
import {
  Globe, Brain, Users, Database, Code, GitBranch,
  Shield, Lock, Network, Store, Check, X, Zap, Atom
} from 'lucide-react';
import {
  CORE_FEATURES,
  HASH_SPHERE_FEATURES,
  FAQ,
  STATE_PHYSICS_API_PLANS,
  HASH_SPHERE_MEMORY_API_PLANS,
  type Plan,
  type CoreFeature,
  type StatePhysicsAPIPlan,
  type HashSphereMemoryAPIPlan,
} from '../../config/pricing';
import { pricingService } from '../../services/pricingService';
import type { CreditPack } from '../../config/pricingConfig';
import styles from './PricingPage.module.css';

const iconMap: Record<string, React.ReactNode> = {
  globe: <Globe size={24} />,
  brain: <Brain size={24} />,
  users: <Users size={24} />,
  database: <Database size={24} />,
  code: <Code size={24} />,
  git_branch: <GitBranch size={24} />,
  shield: <Shield size={24} />,
  lock: <Lock size={24} />,
  network: <Network size={24} />,
  store: <Store size={24} />,
};

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [apiCheckoutLoading, setApiCheckoutLoading] = useState<string | null>(null);
  const [creditPackLoading, setCreditPackLoading] = useState<string | null>(null);
  const [creditRateDescription, setCreditRateDescription] = useState<string>('1 credit ≈ $0.001');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [creditPacks, setCreditPacks] = useState<CreditPack[]>([]);

  // Get user's current plan to determine credit pack access
  const sessionData = getSessionData();
  const userPlan = sessionData?.plan?.toLowerCase();
  const canPurchaseCredits = userPlan === 'plus' || userPlan === 'enterprise';

  // Show upgrade message if URL contains upgrade parameter
  useEffect(() => {
    if (location.search.includes('upgrade=plus')) {
      setTimeout(() => {
        alert('Upgrade to Plus plan to unlock credit pack purchases and other premium features!');
      }, 1000);
    }
  }, [location.search]);

  useEffect(() => {
    const loadPricing = async () => {
      try {
        const pricing = await pricingService.getPricing(true);
        const rateValue = pricing?.creditRate ?? 0.001;
        setCreditRateDescription(`1 credit ≈ $${rateValue}`);

        const buildPlan = (planId: string, name: string): Plan => {
          const cfg = pricing?.plans?.[planId];
          const monthly = Number(cfg?.price?.monthly ?? 0);
          const yearly = Number(cfg?.price?.yearly ?? 0);
          const included = Number(cfg?.credits?.included ?? 0);
          const isEnterprise = planId === 'enterprise';
          const isPlus = planId === 'plus';

          return {
            id: planId,
            name,
            badge: isEnterprise ? 'Custom' : isPlus ? 'Professional' : 'Free Forever',
            price: {
              monthly,
              yearly,
              display: isEnterprise ? 'Custom' : `$${monthly}`,
              period: isEnterprise ? '' : '/month',
            },
            description:
              planId === 'developer'
                ? 'For solo builders exploring ResonantGenesis. Get started with essential features and limited credits to test the platform.'
                : planId === 'plus'
                ? 'For serious builders, teams, and power users. Unlock autonomous agents, full AI assistance, and advanced features.'
                : 'For organizations running AI as critical infrastructure. SLA guarantees, dedicated support, and custom deployments.',
            credits: {
              included,
              display: included === -1 ? 'Custom' : `${included.toLocaleString()} / month`,
              rollover: Boolean(cfg?.credits?.rollover ?? false),
              rolloverLimit: cfg?.credits?.rolloverLimit,
              topups: Boolean(cfg?.credits?.topups ?? false),
              topupPrice: cfg?.credits?.topupPrice,
              topupAmount: cfg?.credits?.topupAmount,
              note: isEnterprise ? 'Tailored to your needs' : isPlus ? 'Rollover + Top-ups' : 'Top-ups available',
            },
            recommended: planId === 'plus',
            contactSales: isEnterprise,
            cta: {
              text: isEnterprise ? 'Contact Sales' : planId === 'plus' ? 'Start Plus Plan' : 'Get Started Free',
              style: planId === 'plus' ? 'primary' : 'secondary',
            },
            limits: {
              agents: {
                active: planId === 'enterprise' ? -1 : -1,
                autonomousMode: planId !== 'developer',
                teams: planId !== 'developer',
              },
              userTeams: {
                enabled: false,
              },
              chat: {
                conversations: -1,
                messagesPerDay: -1,
                evidenceGraph: planId !== 'developer',
              },
              hashSphereMemory: {
                standaloneService: planId !== 'developer',
                universeAccess: planId === 'enterprise' ? 'Multi Universe' : planId === 'plus' ? '1 Universe' : false,
                multiLayer: planId === 'enterprise',
              },
              ideCompute: {
                computeHours: cfg?.limits?.compute?.hours ?? (planId === 'enterprise' ? -1 : planId === 'plus' ? 100 : 10),
                previewTime: planId === 'developer' ? '1 hr/day' : 'Unlimited',
                aiAssistance: planId === 'enterprise' ? 'Full + Custom' : planId === 'plus' ? 'Full' : 'Basic',
                customRuntimes: planId === 'enterprise',
              },
              governance: {
                killSwitch: planId === 'enterprise' ? 'SLA-backed' : planId === 'plus' ? 'Automated' : 'Manual',
                invariants: planId === 'enterprise' ? 'Custom' : planId === 'plus' ? 15 : 5,
                snapshots: planId === 'enterprise' ? -1 : planId === 'plus' ? 10 : false,
              },
              codeVisualizer: {
                codebaseGraphs: planId !== 'developer',
                dependencyAnalysis: planId !== 'developer',
                ciIntegration: planId === 'enterprise',
              },
            },
            features: [],
          };
        };

        const nextPlans: Plan[] = [
          buildPlan('developer', 'Developer'),
          buildPlan('plus', 'Plus'),
          buildPlan('enterprise', 'Enterprise'),
        ];
        setPlans(nextPlans);
      } catch {
        setPlans([]);
      }

      try {
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

  // Handle credit pack purchase
  const handleCreditPackPurchase = async (pack: CreditPack) => {
    if (!isAuthenticated()) {
      navigate('/signup', { state: { creditPack: pack.id } });
      return;
    }

    if (!canPurchaseCredits) {
      // Redirect to upgrade if user can't purchase credits
      navigate('/pricing?upgrade=plus');
      return;
    }

    setCreditPackLoading(pack.id);
    try {
      const response = await fetch('/api/billing/checkout/credits', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
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

  const handlePlanSelect = async (plan: Plan) => {
    if (plan.contactSales) {
      navigate('/contact?plan=enterprise');
      return;
    }
    
    // If user is logged in, go directly to Stripe checkout
    if (isAuthenticated()) {
      // Free tier - just go to dashboard
      if (plan.id === 'developer') {
        navigate('/dashboard');
        return;
      }
      
      setCheckoutLoading(plan.id);
      try {
        const response = await fetch('/api/billing/checkout/subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            plan_id: plan.id,
            billing_cycle: billingPeriod,
            success_url: `${window.location.origin}/dashboard?success=true`,
            cancel_url: `${window.location.origin}/pricing?canceled=true`,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          window.location.href = data.checkout_url || data.url;
        } else {
          console.error('Checkout failed');
          alert('Checkout failed. Please try again.');
        }
      } catch (err) {
        console.error('Checkout failed:', err);
        alert('Checkout failed. Please try again.');
      } finally {
        setCheckoutLoading(null);
      }
      return;
    }
    
    // Not logged in - go to signup
    navigate('/signup', { state: { plan: plan.id, billingPeriod } });
  };

  const getDisplayPrice = (plan: Plan): string => {
    if (plan.price.display === 'Custom') return 'Custom';
    return billingPeriod === 'monthly' 
      ? plan.price.display 
      : `$${Math.round(plan.price.yearly / 12)}`;
  };

  const renderPlanCard = (plan: Plan) => {
    const isRecommended = plan.recommended;
    
    return (
      <div 
        key={plan.id}
        className={`${styles.planCard} ${isRecommended ? styles.planCardRecommended : ''}`}
      >
        {isRecommended && (
          <span className={styles.recommendedBadge}>Recommended</span>
        )}
        
        <div className={styles.planIcon}>
          <Zap size={32} />
        </div>
        
        <h3 className={styles.planName}>{plan.name}</h3>
        <span className={styles.planBadge}>{plan.badge}</span>
        
        <div className={styles.planPrice}>
          <span className={styles.priceAmount}>{getDisplayPrice(plan)}</span>
          {plan.price.period && (
            <span className={styles.pricePeriod}>{plan.price.period}</span>
          )}
        </div>
        
        <p className={styles.planDescription}>{plan.description}</p>
        
        <div className={styles.creditsInfo}>
          <div className={styles.creditsTitle}>Credits</div>
          <div className={styles.creditsValue}>{plan.credits.display}</div>
          <div className={styles.creditsNote}>{plan.credits.note}</div>
        </div>
        
        <button
          className={`${styles.planCta} ${plan.cta.style === 'primary' ? styles.planCtaPrimary : styles.planCtaSecondary}`}
          onClick={() => handlePlanSelect(plan)}
          disabled={checkoutLoading === plan.id}
        >
          {checkoutLoading === plan.id ? 'Redirecting...' : plan.cta.text}
        </button>
      </div>
    );
  };

  const renderFeatureCard = (feature: CoreFeature) => (
    <div key={feature.id} className={styles.featureCard}>
      <div className={styles.featureIcon}>
        {iconMap[feature.icon] || <Zap size={24} />}
      </div>
      <h4 className={styles.featureTitle}>{feature.name}</h4>
      <span className={styles.featureBadge}>{feature.badge}</span>
      <p className={styles.featureDescription}>{feature.description}</p>
    </div>
  );

  // Handle API subscription checkout
  const handleApiSubscribe = async (apiType: 'state_physics' | 'hash_sphere_memory', planId: string, isEnterprise: boolean = false) => {
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
      const response = await fetch('/api/billing/checkout/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          plan_id: apiType === 'state_physics' 
          ? `state_physics_${planId}`  // "state_physics_dev", "state_physics_startup"
          : `hash_sphere_memory_${planId === 'starter' ? 'dev' : planId === 'builder' ? 'startup' : planId}`,  // Map pricing page IDs to backend IDs
          billing_cycle: 'monthly',  // API subscriptions are monthly
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

  return (
    <div className={styles.pricingPage}>
      <div className={styles.sectionContent}>
        {/* Header */}
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Pricing</span>
          <h1 className={styles.sectionTitle}>Simple, Transparent Pricing</h1>
          <p className={styles.sectionDescription}>
            Start free, scale as you grow. All plans include governance, memory, and multi-provider AI.
            Usage is metered via Resonant Credits ({creditRateDescription}).
          </p>
          
        </div>

        {/* Plans Grid */}
        <div className={styles.plansGrid}>
          {plans.map(renderPlanCard)}
        </div>

        {/* Credit Calculator */}
        <div className={styles.calculatorSection}>
          <h2 className={styles.calculatorTitle}>Credit-Based Pricing</h2>
          <p className={styles.calculatorSubtitle}>
            Pay only for what you use. Credits cover AI model calls, compute time, storage, and agent execution.
          </p>
          <div className={styles.creditRate}>
            <div className={styles.creditRateValue}>{creditRateDescription}</div>
            <div className={styles.creditRateLabel}>
              Real-time cost estimation before each action
            </div>
          </div>
        </div>

        {/* Credit Packs Section */}
        <section className={styles.creditPacksSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>Credit Packs</span>
            <h2 className={styles.sectionTitle}>Buy Credits</h2>
            <p className={styles.sectionDescription}>
              {canPurchaseCredits 
                ? 'Top up your account with credit packs. Larger packs offer better value.'
                : 'Credit packs are available for Plus and Enterprise subscribers. Upgrade your plan to access credit purchases.'
              }
            </p>
          </div>
          
          <div className={styles.creditPacksGrid}>
            {creditPacks.map((pack) => (
              <div 
                key={pack.id}
                className={`${styles.creditPackCard} ${pack.recommended ? styles.creditPackRecommended : ''}`}
              >
                {pack.recommended && (
                  <span className={styles.recommendedBadge}>Best Value</span>
                )}
                <h3 className={styles.creditPackName}>{pack.name}</h3>
                <div className={styles.creditPackCredits}>
                  {pack.credits.toLocaleString()} credits
                </div>
                <div className={styles.creditPackPrice}>
                  <span className={styles.creditPackPriceAmount}>${pack.price}</span>
                  <span className={styles.creditPackPriceRate}>${pack.pricePerK.toFixed(2)}/1k</span>
                </div>
                {pack.savings && (
                  <div className={styles.creditPackSavings}>Save {pack.savings}</div>
                )}
                <p className={styles.creditPackDescription}>{pack.description}</p>
                <button
                  className={styles.creditPackButton}
                  onClick={() => handleCreditPackPurchase(pack)}
                  disabled={creditPackLoading === pack.id || !canPurchaseCredits}
                >
                  {creditPackLoading === pack.id ? 'Processing...' : 
                   canPurchaseCredits ? 'Buy Now' : 'Upgrade to Plus'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* API Subscriptions Section */}
        <section className={styles.apiSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>API Subscriptions</span>
            <h2 className={styles.sectionTitle}>Standalone API Products</h2>
            <p className={styles.sectionDescription}>
              Add specialized APIs to any platform plan. Billed separately from platform credits.
            </p>
          </div>

          {/* Hash Sphere Memory API */}
          <div className={styles.apiProductSection}>
            <div className={styles.apiProductHeader}>
              <div className={styles.apiProductIcon}>
                <Brain size={32} />
              </div>
              <div className={styles.apiProductInfo}>
                <h3 className={styles.apiProductName}>Hash Sphere Memory API</h3>
                <p className={styles.apiProductDescription}>
                  Invariant-governed long-term memory for AI systems. Persistent, encrypted, high-dimensional memory with conservation laws.
                </p>
              </div>
            </div>
            
            <div className={styles.apiPlansGrid}>
              {HASH_SPHERE_MEMORY_API_PLANS.map((plan) => {
                const isEnterprise = plan.id === 'enterprise';
                const loadingKey = `hash_sphere_memory_${plan.id}`;
                
                return (
                  <div key={plan.id} className={`${styles.apiPlanCard} ${plan.id === 'builder' ? styles.apiPlanCardPopular : ''}`}>
                    {plan.id === 'builder' && (
                      <span className={styles.apiPlanBadge}>Popular</span>
                    )}
                    <h4 className={styles.apiPlanName}>{plan.name}</h4>
                    <div className={styles.apiPlanPrice}>
                      <span className={styles.apiPriceAmount}>
                        {isEnterprise ? '$25k+' : `$${plan.price}`}
                      </span>
                      <span className={styles.apiPricePeriod}>/{plan.period}</span>
                    </div>
                    <div className={styles.apiPlanUnits}>
                      {plan.memoryUnits === -1 ? 'Unlimited MU' : `${(plan.memoryUnits / 1000).toLocaleString()}k MU/month`}
                    </div>
                    <ul className={styles.apiPlanFeatures}>
                      {plan.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className={styles.apiPlanFeature}>
                          <Check size={14} className={styles.checkIcon} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      className={`${styles.apiPlanCta} ${plan.id === 'builder' ? styles.apiPlanCtaPrimary : ''}`}
                      onClick={() => handleApiSubscribe('hash_sphere_memory', plan.id, isEnterprise)}
                      disabled={apiCheckoutLoading === loadingKey}
                    >
                      {apiCheckoutLoading === loadingKey ? 'Redirecting...' : isEnterprise ? 'Contact Sales' : 'Subscribe'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* State Physics API */}
          <div className={styles.apiProductSection}>
            <div className={styles.apiProductHeader}>
              <div className={styles.apiProductIcon} style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)' }}>
                <Atom size={32} />
              </div>
              <div className={styles.apiProductInfo}>
                <h3 className={styles.apiProductName}>State Physics API</h3>
                <p className={styles.apiProductDescription}>
                  Real-time anomaly detection and conservation law enforcement for complex state systems. Fraud detection, trust networks, distributed monitoring.
                </p>
              </div>
            </div>
            
            <div className={styles.apiPlansGrid}>
              {STATE_PHYSICS_API_PLANS.map((plan) => {
                const isEnterprise = plan.id === 'enterprise';
                const loadingKey = `state_physics_${plan.id}`;
                
                return (
                  <div key={plan.id} className={`${styles.apiPlanCard} ${plan.id === 'startup' ? styles.apiPlanCardPopular : ''}`}>
                    {plan.id === 'startup' && (
                      <span className={styles.apiPlanBadge}>Popular</span>
                    )}
                    <h4 className={styles.apiPlanName}>{plan.name}</h4>
                    <div className={styles.apiPlanPrice}>
                      <span className={styles.apiPriceAmount}>
                        {isEnterprise ? '$2k+' : `$${plan.price}`}
                      </span>
                      <span className={styles.apiPricePeriod}>/{plan.period}</span>
                    </div>
                    <div className={styles.apiPlanUnits}>
                      {plan.simulationUnits === -1 ? 'Custom SU' : `${(plan.simulationUnits / 1000).toLocaleString()}k SU/month`}
                    </div>
                    <ul className={styles.apiPlanFeatures}>
                      {plan.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className={styles.apiPlanFeature}>
                          <Check size={14} className={styles.checkIcon} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      className={`${styles.apiPlanCta} ${plan.id === 'startup' ? styles.apiPlanCtaPrimary : ''}`}
                      onClick={() => handleApiSubscribe('state_physics', plan.id, isEnterprise)}
                      disabled={apiCheckoutLoading === loadingKey}
                    >
                      {apiCheckoutLoading === loadingKey ? 'Redirecting...' : isEnterprise ? 'Contact Sales' : 'Subscribe'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Limits Section */}
        <section className={styles.limitsSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>Plan Details</span>
            <h2 className={styles.sectionTitle}>Detailed Plan Limits</h2>
            <p className={styles.sectionDescription}>
              Compare features and limits across all plans
            </p>
          </div>
          
          <div className={styles.limitsGrid}>
            {plans.map((plan) => (
              <div key={plan.id} className={styles.limitCard}>
                <h3 className={styles.limitCardTitle}>{plan.name}</h3>
                
                <div className={styles.limitCategory}>
                  <h4 className={styles.limitCategoryTitle}>Agent Console</h4>
                  <ul className={styles.limitList}>
                    <li className={styles.limitItem}>
                      <span>Active Agents</span>
                      <span className={`${styles.limitValue} ${plan.limits.agents.active === -1 ? styles.limitValueUnlimited : ''}`}>
                        {plan.limits.agents.active === -1 ? 'Unlimited' : plan.limits.agents.active}
                      </span>
                    </li>
                    <li className={styles.limitItem}>
                      <span>Autonomous Mode</span>
                      <span className={plan.limits.agents.autonomousMode ? styles.checkIcon : styles.crossIcon}>
                        {plan.limits.agents.autonomousMode ? <Check size={16} /> : <X size={16} />}
                      </span>
                    </li>
                    <li className={styles.limitItem}>
                      <span>Teams</span>
                      <span className={styles.limitValue}>
                        {typeof plan.limits.agents.teams === 'boolean' 
                          ? (plan.limits.agents.teams ? 'Yes' : 'No')
                          : plan.limits.agents.teams}
                      </span>
                    </li>
                  </ul>
                </div>
                
                <div className={styles.limitCategory}>
                  <h4 className={styles.limitCategoryTitle}>Resonant Chat</h4>
                  <ul className={styles.limitList}>
                    <li className={styles.limitItem}>
                      <span>Conversations</span>
                      <span className={`${styles.limitValue} ${plan.limits.chat.conversations === -1 ? styles.limitValueUnlimited : ''}`}>
                        {plan.limits.chat.conversations === -1 ? 'Unlimited' : plan.limits.chat.conversations.toLocaleString()}
                      </span>
                    </li>
                    <li className={styles.limitItem}>
                      <span>Messages/Day</span>
                      <span className={`${styles.limitValue} ${plan.limits.chat.messagesPerDay === -1 ? styles.limitValueUnlimited : ''}`}>
                        {plan.limits.chat.messagesPerDay === -1 ? 'Unlimited' : plan.limits.chat.messagesPerDay.toLocaleString()}
                      </span>
                    </li>
                  </ul>
                </div>
                
                <div className={styles.limitCategory}>
                  <h4 className={styles.limitCategoryTitle}>IDE & Compute</h4>
                  <ul className={styles.limitList}>
                    <li className={styles.limitItem}>
                      <span>Compute Hours</span>
                      <span className={`${styles.limitValue} ${plan.limits.ideCompute.computeHours === -1 ? styles.limitValueUnlimited : ''}`}>
                        {plan.limits.ideCompute.computeHours === -1 ? 'Unlimited' : `${plan.limits.ideCompute.computeHours}/mo`}
                      </span>
                    </li>
                    <li className={styles.limitItem}>
                      <span>AI Assistance</span>
                      <span className={styles.limitValue}>{plan.limits.ideCompute.aiAssistance}</span>
                    </li>
                  </ul>
                </div>
                
                <div className={styles.limitCategory}>
                  <h4 className={styles.limitCategoryTitle}>RARA Governance</h4>
                  <ul className={styles.limitList}>
                    <li className={styles.limitItem}>
                      <span>Kill Switch</span>
                      <span className={styles.limitValue}>{plan.limits.governance.killSwitch}</span>
                    </li>
                    <li className={styles.limitItem}>
                      <span>Invariants</span>
                      <span className={styles.limitValue}>
                        {plan.limits.governance.invariants === -1 ? 'Custom' : plan.limits.governance.invariants}
                      </span>
                    </li>
                    <li className={styles.limitItem}>
                      <span>Snapshots</span>
                      <span className={`${styles.limitValue} ${plan.limits.governance.snapshots === -1 ? styles.limitValueUnlimited : ''}`}>
                        {plan.limits.governance.snapshots === -1 ? 'Unlimited' : 
                         plan.limits.governance.snapshots === false ? <X size={16} className={styles.crossIcon} /> : 
                         plan.limits.governance.snapshots}
                      </span>
                    </li>
                  </ul>
                </div>

                <div className={styles.limitCategory}>
                  <h4 className={styles.limitCategoryTitle}>Hash Sphere</h4>
                  <ul className={styles.limitList}>
                    <li className={styles.limitItem}>
                      <span>View Identity Node</span>
                      <span className={plan.id === 'developer' || plan.id === 'plus' || plan.id === 'enterprise' ? styles.checkIcon : styles.crossIcon}>
                        <Check size={16} />
                      </span>
                    </li>
                    <li className={styles.limitItem}>
                      <span>Full Identity Graph</span>
                      <span className={plan.id === 'plus' || plan.id === 'enterprise' ? styles.checkIcon : styles.crossIcon}>
                        {plan.id === 'plus' || plan.id === 'enterprise' ? <Check size={16} /> : <X size={16} />}
                      </span>
                    </li>
                    <li className={styles.limitItem}>
                      <span>Economic Flow Tracking</span>
                      <span className={plan.id === 'enterprise' ? styles.checkIcon : styles.crossIcon}>
                        {plan.id === 'enterprise' ? <Check size={16} /> : <X size={16} />}
                      </span>
                    </li>
                    <li className={styles.limitItem}>
                      <span>API Access</span>
                      <span className={plan.id === 'enterprise' ? styles.checkIcon : styles.crossIcon}>
                        {plan.id === 'enterprise' ? <Check size={16} /> : <X size={16} />}
                      </span>
                    </li>
                  </ul>
                </div>

                <div className={styles.limitCategory}>
                  <h4 className={styles.limitCategoryTitle}>Code Visualizer</h4>
                  <ul className={styles.limitList}>
                    <li className={styles.limitItem}>
                      <span>Codebase Graphs</span>
                      <span className={plan.limits.codeVisualizer.codebaseGraphs ? styles.checkIcon : styles.crossIcon}>
                        {plan.limits.codeVisualizer.codebaseGraphs ? <Check size={16} /> : <X size={16} />}
                      </span>
                    </li>
                    <li className={styles.limitItem}>
                      <span>Dependency Analysis</span>
                      <span className={plan.limits.codeVisualizer.dependencyAnalysis ? styles.checkIcon : styles.crossIcon}>
                        {plan.limits.codeVisualizer.dependencyAnalysis ? <Check size={16} /> : <X size={16} />}
                      </span>
                    </li>
                    <li className={styles.limitItem}>
                      <span>CI Integration</span>
                      <span className={plan.limits.codeVisualizer.ciIntegration ? styles.checkIcon : styles.crossIcon}>
                        {plan.limits.codeVisualizer.ciIntegration ? <Check size={16} /> : <X size={16} />}
                      </span>
                    </li>
                  </ul>
                </div>

                <div className={styles.limitCategory}>
                  <h4 className={styles.limitCategoryTitle}>Hash Sphere Memory</h4>
                  <ul className={styles.limitList}>
                    <li className={styles.limitItem}>
                      <span>Standalone Service</span>
                      <span className={plan.limits.hashSphereMemory.standaloneService ? styles.checkIcon : styles.crossIcon}>
                        {plan.limits.hashSphereMemory.standaloneService ? <Check size={16} /> : <X size={16} />}
                      </span>
                    </li>
                    <li className={styles.limitItem}>
                      <span>Universe Access</span>
                      <span className={styles.limitValue}>
                        {plan.limits.hashSphereMemory.universeAccess === false ? <X size={16} className={styles.crossIcon} /> : 
                         plan.limits.hashSphereMemory.universeAccess}
                      </span>
                    </li>
                    <li className={styles.limitItem}>
                      <span>Multi-Layer</span>
                      <span className={plan.limits.hashSphereMemory.multiLayer ? styles.checkIcon : styles.crossIcon}>
                        {plan.limits.hashSphereMemory.multiLayer ? <Check size={16} /> : <X size={16} />}
                      </span>
                    </li>
                  </ul>
                </div>

                <div className={styles.limitCategory}>
                  <h4 className={styles.limitCategoryTitle}>Blockchain Audit</h4>
                  <ul className={styles.limitList}>
                    <li className={styles.limitItem}>
                      <span>Audit Trail</span>
                      <span className={styles.limitValue}>
                        {plan.id === 'developer' ? 'Basic' : plan.id === 'plus' ? 'Full' : 'Immutable'}
                      </span>
                    </li>
                    <li className={styles.limitItem}>
                      <span>Compliance Reports</span>
                      <span className={plan.id !== 'developer' ? styles.checkIcon : styles.crossIcon}>
                        {plan.id !== 'developer' ? <Check size={16} /> : <X size={16} />}
                      </span>
                    </li>
                    <li className={styles.limitItem}>
                      <span>Legal-Grade Proof</span>
                      <span className={plan.id === 'enterprise' ? styles.checkIcon : styles.crossIcon}>
                        {plan.id === 'enterprise' ? <Check size={16} /> : <X size={16} />}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Hash Sphere Comparison */}
        <section className={styles.comparisonSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>Hash Sphere</span>
            <h2 className={styles.sectionTitle}>Hash Sphere Feature Comparison</h2>
            <p className={styles.sectionDescription}>
              Advanced identity and economic graph capabilities by plan
            </p>
          </div>
          
          <div className={styles.tableWrapper}>
            <table className={styles.comparisonTable}>
              <thead>
                <tr>
                  <th>Capability</th>
                  <th>Developer</th>
                  <th>Plus</th>
                  <th>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {HASH_SPHERE_FEATURES.map((feature, idx) => (
                  <tr key={idx}>
                    <td>{feature.capability}</td>
                    <td className={feature.developer ? styles.checkIcon : styles.crossIcon}>
                      {feature.developer ? <Check size={18} /> : <X size={18} />}
                    </td>
                    <td className={feature.plus ? styles.checkIcon : styles.crossIcon}>
                      {feature.plus ? <Check size={18} /> : <X size={18} />}
                    </td>
                    <td className={feature.enterprise ? styles.checkIcon : styles.crossIcon}>
                      {feature.enterprise ? <Check size={18} /> : <X size={18} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Core Features */}
        <section className={styles.featuresSection}>
          <div className={styles.featuresSectionHeader}>
            <span className={styles.sectionBadge}>Platform Features</span>
            <h2 className={styles.sectionTitle}>Everything You Need</h2>
            <p className={styles.sectionDescription}>
              All plans include access to our core platform features
            </p>
          </div>
          
          <div className={styles.featuresGrid}>
            {CORE_FEATURES.map(renderFeatureCard)}
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.faqSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>FAQ</span>
            <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          </div>
          
          <div className={styles.faqGrid}>
            {FAQ.map((item, idx) => (
              <div key={idx} className={styles.faqCard}>
                <h4 className={styles.faqQuestion}>{item.question}</h4>
                <p className={styles.faqAnswer}>{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PricingPage;
