/**
 * New User Pricing Page - Shown after signup for plan selection
 * Features trial offers for Plus and Business plans
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Check, Shield, Building2, Brain } from 'lucide-react';
import { isAuthenticated, getSessionData } from '../../utils/auth-cookies';

const PLAN_HIGHLIGHTS: Record<string, string[]> = {
  plus: [
    '29,000 credits / month',
    'All platform features unlocked',
    'Unlimited agents & autonomous mode',
    '100 compute hours / month',
    '5 GB storage, 100 RAG documents',
    'Community + email support',
  ],
  business: [
    '499,000 credits / month',
    'Everything in Plus',
    'Rollover up to 249.5K credits',
    'Discounted top-ups ($8 / 10K)',
    '100 compute hours / month',
    'Priority email + Slack support',
  ],
  consulting: [
    '1st Week: Technical Pre-Research & Analysis',
    '2nd Week: High-Intensity Sprint Workshop',
    'Next 30 Days: Dedicated Engineering Advisory',
    'Product & Architecture Discovery',
    'One-time payment, no subscription',
  ],
};

const NewUserPricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const handlePlanSelect = async (planId: string) => {
    if (planId === 'consulting') {
      navigate('/consulting-workshop/intake');
      return;
    }

    setCheckoutLoading(planId);
    try {
      const response = await fetch('/api/billing/checkout/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          plan_id: planId,
          billing_cycle: 'monthly',
          trial: true, // Enable trial period - $0 first month, then normal charge
          success_url: `${window.location.origin}/chat?trial_activated=true`,
          cancel_url: `${window.location.origin}/new-user-pricing?canceled=true`,
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
        const error = await response.json().catch(() => ({}));
        alert('Checkout failed: ' + (error.detail || 'Please try again.'));
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      alert('Checkout failed. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleSkip = () => {
    navigate('/chat');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Choose Your Plan
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#888',
            maxWidth: '600px',
            margin: '0 auto',
          }}>
            Start with a free trial on Plus or Business. No commitment required.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem',
        }}>
          {/* Plus Plan */}
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '16px',
            padding: '2rem',
            position: 'relative',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}>
              <Shield size={24} style={{ color: '#6366f1' }} />
              <span style={{ fontSize: '1.5rem', fontWeight: '600' }}>Plus</span>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                $29<span style={{ fontSize: '1rem', fontWeight: '400', color: '#888' }}>/month</span>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#6366f1', fontWeight: '500' }}>
                First month FREE
              </div>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', gap: '0.75rem', display: 'flex', flexDirection: 'column' }}>
              {PLAN_HIGHLIGHTS.plus.map((item) => (
                <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.95rem' }}>
                  <Check size={16} style={{ color: '#10b981', minWidth: '16px', marginTop: '2px' }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handlePlanSelect('developer')}
              disabled={checkoutLoading === 'developer'}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: checkoutLoading === 'developer' ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                opacity: checkoutLoading === 'developer' ? 0.6 : 1,
              }}
            >
              <Gift size={18} />
              {checkoutLoading === 'developer' ? 'Redirecting...' : 'Claim Offer'}
            </button>
          </div>

          {/* Business Plan */}
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            border: '2px solid #6366f1',
            borderRadius: '16px',
            padding: '2rem',
            position: 'relative',
            boxShadow: '0 8px 30px rgba(99,102,241,0.15)',
          }}>
            <div style={{
              position: 'absolute',
              top: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: 'white',
              padding: '0.25rem 1rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: '600',
            }}>
              RECOMMENDED
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}>
              <Building2 size={24} style={{ color: '#6366f1' }} />
              <span style={{ fontSize: '1.5rem', fontWeight: '600' }}>Business</span>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                $499<span style={{ fontSize: '1rem', fontWeight: '400', color: '#888' }}>/month</span>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#6366f1', fontWeight: '500' }}>
                First month FREE
              </div>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', gap: '0.75rem', display: 'flex', flexDirection: 'column' }}>
              {PLAN_HIGHLIGHTS.business.map((item) => (
                <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.95rem' }}>
                  <Check size={16} style={{ color: '#10b981', minWidth: '16px', marginTop: '2px' }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handlePlanSelect('plus')}
              disabled={checkoutLoading === 'plus'}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: checkoutLoading === 'plus' ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                opacity: checkoutLoading === 'plus' ? 0.6 : 1,
              }}
            >
              <Gift size={18} />
              {checkoutLoading === 'plus' ? 'Redirecting...' : 'Claim Offer'}
            </button>
          </div>

          {/* Consulting Workshop */}
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '16px',
            padding: '2rem',
            position: 'relative',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}>
              <Brain size={24} style={{ color: '#6366f1' }} />
              <span style={{ fontSize: '1.5rem', fontWeight: '600' }}>Consulting Workshop</span>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                $24,500
              </div>
              <div style={{ fontSize: '0.9rem', color: '#888', fontWeight: '500' }}>
                One-time payment
              </div>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', gap: '0.75rem', display: 'flex', flexDirection: 'column' }}>
              {PLAN_HIGHLIGHTS.consulting.map((item) => (
                <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.95rem' }}>
                  <Check size={16} style={{ color: '#10b981', minWidth: '16px', marginTop: '2px' }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handlePlanSelect('consulting')}
              disabled={checkoutLoading === 'consulting'}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #6366f1',
                background: 'transparent',
                color: '#6366f1',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: checkoutLoading === 'consulting' ? 'not-allowed' : 'pointer',
                opacity: checkoutLoading === 'consulting' ? 0.6 : 1,
              }}
            >
              {checkoutLoading === 'consulting' ? 'Redirecting...' : 'Purchase Workshop'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewUserPricingPage;
