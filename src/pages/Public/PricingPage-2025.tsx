import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui';
import { goToSignup, goToContact } from '../../utils/navigation';
import { PLANS, TOKEN_PACKS, formatPrice } from '../../utils/signupLogic';
import { isAuthenticated } from '../../utils/auth-cookies';
import styles from '../Help/HelpCenterPage.module.css';

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [loadingTokenPack, setLoadingTokenPack] = useState<string | null>(null);

  const handlePlanSelect = async (planId: string) => {
    const plan = PLANS.find(p => p.id === planId);
    
    // Enterprise requires contact sales
    if (plan?.contactSales) {
      goToContact(navigate);
      return;
    }

    // If not authenticated, redirect to signup with plan pre-selected
    if (!isAuthenticated()) {
      navigate('/signup', { state: { plan: planId, billingPeriod } });
      return;
    }

    // For free/developer plan, just navigate to dashboard
    if (planId === 'developer' || plan?.price.monthly === 0) {
      navigate('/dashboard');
      return;
    }

    // Plus plan - redirect directly to Stripe Payment Link
    if (planId === 'plus') {
      window.location.href = 'https://buy.stripe.com/7sYaEW7owgbHclrb7f33W0b';
      return;
    }

    // For other paid plans, redirect to Stripe checkout via backend
    setLoadingPlan(planId);
    try {
      const response = await fetch('/api/billing/checkout/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          plan_id: planId,
          billing_cycle: billingPeriod,
          success_url: `${window.location.origin}/dashboard?subscription=success&plan=${planId}`,
          cancel_url: `${window.location.origin}/pricing?canceled=true`,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.checkout_url || data.url;
      } else {
        console.error('Checkout failed:', await response.text());
        alert('Failed to start checkout. Please try again.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Failed to connect to payment service. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleTokenPackPurchase = async (packId: string, tokens: number, price: number) => {
    // If not authenticated, redirect to signup first
    if (!isAuthenticated()) {
      navigate('/signup', { state: { redirectTo: '/pricing' } });
      return;
    }

    setLoadingTokenPack(packId);
    try {
      const response = await fetch('/api/billing/checkout/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          credits: tokens,
          price_cents: price * 100, // Convert to cents
          success_url: `${window.location.origin}/dashboard?tokens_purchased=true&amount=${tokens}`,
          cancel_url: `${window.location.origin}/pricing?canceled=true`,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.checkout_url || data.url;
      } else {
        console.error('Token purchase failed:', await response.text());
        alert('Failed to start checkout. Please try again.');
      }
    } catch (err) {
      console.error('Token purchase error:', err);
      alert('Failed to connect to payment service. Please try again.');
    } finally {
      setLoadingTokenPack(null);
    }
  };

  // Format limit value for display
  const formatLimit = (value: number, suffix: string = '') => {
    if (value === -1) return 'Unlimited';
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M${suffix}`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K${suffix}`;
    return `${value}${suffix}`;
  };

  return (
    <div className={styles.helpCenterPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Simple, Transparent Pricing</h1>
          <p className={styles.subtitle}>
            Start free, scale as you grow. All plans include governance, memory, and multi-provider AI.
          </p>
        </div>

        <div className={styles.contentBody}>
          <div className={styles.contentMain}>
            {/* Billing Toggle */}
            <section className={styles.contentSection}>
              <h2>Billing Period</h2>
              <div className={styles.categoryFilters}>
                <button
                  className={`${styles.categoryFilter} ${billingPeriod === 'monthly' ? styles.active : ''}`}
                  onClick={() => setBillingPeriod('monthly')}
                >
                  Monthly
                </button>
                <button
                  className={`${styles.categoryFilter} ${billingPeriod === 'yearly' ? styles.active : ''}`}
                  onClick={() => setBillingPeriod('yearly')}
                >
                  Yearly (Save 17%)
                </button>
              </div>
            </section>

            {/* Free Trial CTA */}
            <section className={styles.contentSection}>
              <div style={{
                padding: 'var(--space-6)',
                background: 'linear-gradient(135deg, var(--color-primary-100) 0%, var(--color-primary-50) 100%)',
                borderRadius: 'var(--radius-lg)',
                border: '2px solid var(--color-primary-300)',
                textAlign: 'center',
                marginBottom: 'var(--space-4)'
              }}>
                <h2 style={{ fontSize: 'var(--font-2xl)', marginBottom: 'var(--space-2)', color: 'var(--text-primary)' }}>
                  🎉 Start Your 14-Day Free Trial
                </h2>
                <p style={{ fontSize: 'var(--font-md)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', maxWidth: '600px', margin: '0 auto var(--space-4)' }}>
                  Get full Pro-level access with your own API key. No credit card required.
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
                  <span style={{ background: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: 'var(--font-sm)' }}>✓ 25 Agents</span>
                  <span style={{ background: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: 'var(--font-sm)' }}>✓ 5 Teams</span>
                  <span style={{ background: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: 'var(--font-sm)' }}>✓ Full IDE Access</span>
                  <span style={{ background: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: 'var(--font-sm)' }}>✓ BYOK (Bring Your Own Key)</span>
                </div>
                <Button variant="primary" size="lg" onClick={() => handlePlanSelect('free-trial')}>
                  Start Free Trial
                </Button>
              </div>
            </section>

            {/* Plans */}
            <section className={styles.contentSection}>
              <h2>Platform Plans</h2>
              <div className={styles.articleGrid}>
                {PLANS.filter(p => !p.isTrial).map((plan) => {
                  const price = billingPeriod === 'monthly' ? plan.price.monthly : plan.price.yearly;
                  const isContactSales = plan.contactSales;
                  
                  return (
                    <div 
                      key={plan.id} 
                      className={styles.articleCard} 
                      style={{ 
                        cursor: 'pointer',
                        border: plan.recommended ? '2px solid var(--color-primary-500)' : undefined
                      }}
                      onClick={() => handlePlanSelect(plan.id)}
                    >
                      {plan.recommended && (
                        <div style={{ 
                          background: 'var(--color-primary-500)', 
                          color: 'white', 
                          padding: '4px 12px', 
                          borderRadius: '4px',
                          fontSize: 'var(--font-xs)',
                          fontWeight: 600,
                          marginBottom: 'var(--space-2)',
                          display: 'inline-block'
                        }}>
                          RECOMMENDED
                        </div>
                      )}
                      <h3>{plan.name}</h3>
                      <div style={{ 
                        fontSize: 'var(--font-2xl)', 
                        fontWeight: 700, 
                        color: 'var(--text-primary)',
                        marginBottom: 'var(--space-2)'
                      }}>
                        {isContactSales ? (
                          <>Starting at {formatPrice(price)}</>
                        ) : (
                          formatPrice(price)
                        )}
                        <span style={{ fontSize: 'var(--font-sm)', fontWeight: 400, color: 'var(--text-secondary)' }}>
                          {billingPeriod === 'monthly' ? '/month' : '/year'}
                        </span>
                      </div>
                      {plan.bestFor && (
                        <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                          Best for: {plan.bestFor}
                        </p>
                      )}
                      <div className={styles.articleTags}>
                        <span className={styles.articleTag}>{formatLimit(plan.limits.tokens)} tokens</span>
                        <span className={styles.articleTag}>{formatLimit(plan.limits.agents)} agents</span>
                        <span className={styles.articleTag}>{formatLimit(plan.limits.teams)} teams</span>
                      </div>
                      <ul style={{ 
                        listStyle: 'none', 
                        padding: 0, 
                        margin: 'var(--space-4) 0 0 0',
                        fontSize: 'var(--font-sm)',
                        color: 'var(--text-secondary)'
                      }}>
                        {plan.features.slice(0, 6).map((feature: string, idx: number) => (
                          <li key={idx} style={{ marginBottom: 'var(--space-1)' }}>✓ {feature}</li>
                        ))}
                        {plan.features.length > 6 && (
                          <li style={{ color: 'var(--color-primary-500)' }}>
                            +{plan.features.length - 6} more features
                          </li>
                        )}
                      </ul>
                      <div style={{ marginTop: 'var(--space-4)' }}>
                        <Button 
                          variant={plan.recommended ? 'primary' : 'secondary'} 
                          size="sm" 
                          fullWidth
                          disabled={loadingPlan === plan.id}
                        >
                          {loadingPlan === plan.id ? 'Redirecting to Stripe...' : (isContactSales ? 'Contact Sales' : 'Get Started')}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Token Packs */}
            <section className={styles.contentSection}>
              <h2>Add More Tokens Anytime</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                Tokens never expire. Better rates at higher volumes.
              </p>
              <div className={styles.articleGrid}>
                {TOKEN_PACKS.map((pack: any) => (
                  <div 
                    key={pack.id} 
                    className={styles.articleCard} 
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleTokenPackPurchase(pack.id, pack.tokens, pack.price)}
                  >
                    <h3>{pack.label}</h3>
                    <div style={{ 
                      fontSize: 'var(--font-xl)', 
                      fontWeight: 700, 
                      color: 'var(--text-primary)',
                      marginBottom: 'var(--space-2)'
                    }}>
                      ${pack.price}
                    </div>
                    <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                      {pack.tokens.toLocaleString()} tokens
                    </p>
                    {pack.perK && (
                      <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-primary-500)', marginTop: '4px' }}>
                        ${pack.perK}/1K tokens
                      </p>
                    )}
                    <div style={{ marginTop: 'var(--space-3)' }}>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        fullWidth
                        disabled={loadingTokenPack === pack.id}
                      >
                        {loadingTokenPack === pack.id ? 'Redirecting...' : 'Buy Now'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ Section */}
            <section className={styles.contentSection}>
              <h2>Frequently Asked Questions</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className={styles.articleCard} style={{ cursor: 'default' }}>
                  <h4 style={{ marginBottom: '8px' }}>What happens when I run out of tokens?</h4>
                  <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', margin: 0 }}>
                    Your agents pause until next month or you purchase more tokens. You can buy token packs anytime.
                  </p>
                </div>
                <div className={styles.articleCard} style={{ cursor: 'default' }}>
                  <h4 style={{ marginBottom: '8px' }}>Can I change plans?</h4>
                  <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', margin: 0 }}>
                    Yes! Upgrade instantly, downgrade at end of billing cycle. Unused tokens don't roll over.
                  </p>
                </div>
                <div className={styles.articleCard} style={{ cursor: 'default' }}>
                  <h4 style={{ marginBottom: '8px' }}>What's BYOK?</h4>
                  <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', margin: 0 }}>
                    "Bring Your Own Key" - use your own OpenAI/Anthropic API keys. You pay the provider directly.
                  </p>
                </div>
                <div className={styles.articleCard} style={{ cursor: 'default' }}>
                  <h4 style={{ marginBottom: '8px' }}>Do you offer discounts?</h4>
                  <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', margin: 0 }}>
                    Yes! Startups get 50% off first year. Nonprofits get 30% off. Contact sales for details.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className={styles.contentSidebar}>
            <div className={styles.sidebarCard}>
              <h3>All Plans Include</h3>
              <ul>
                <li>Cryptographic login</li>
                <li>Dual-encrypted memory</li>
                <li>Multi-agent orchestration</li>
                <li>DSID-P governance</li>
                <li>Hash Sphere cloud</li>
                <li>Cryptographic memory vault</li>
              </ul>
            </div>
            <div className={styles.sidebarCard}>
              <h3>Quick Links</h3>
              <ul>
                <li><a href="/help">Documentation</a></li>
                <li><a href="/about">About Us</a></li>
                <li><a href="/contact">Contact Sales</a></li>
              </ul>
            </div>
            <div className={styles.sidebarCard}>
              <h3>Questions?</h3>
              <p>
                Not sure which plan is right for you? We're here to help.
              </p>
              <Button variant="primary" size="sm" fullWidth onClick={() => goToContact(navigate)}>
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;

