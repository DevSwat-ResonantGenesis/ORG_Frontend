/**
 * Consulting Workshop - Window 2: Roadmap Alignment & Payment
 * Multi-window onboarding workflow for consulting workshop signup
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ROUTE_META } from '@/config/routeMeta.mjs';
import { Check, Calendar, Clock, Users, ArrowRight } from 'lucide-react';
import styles from './ConsultingWorkshopPayment.module.css';

const meta = ROUTE_META['/consulting-workshop/payment'];

export default function ConsultingWorkshopPayment() {
  const navigate = useNavigate();
  
  const [intakeData, setIntakeData] = useState<any>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Retrieve intake data from sessionStorage
    const stored = sessionStorage.getItem('consultingWorkshopIntake');
    if (!stored) {
      navigate('/consulting-workshop/intake');
      return;
    }
    setIntakeData(JSON.parse(stored));
  }, [navigate]);

  const handlePayment = async () => {
    if (!agreedToTerms) return;

    setIsProcessing(true);
    try {
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
      setIsProcessing(false);
    }
  };

  if (!intakeData) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
      </Helmet>

      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Left Column: Roadmap */}
          <div className={styles.leftColumn}>
            <div className={styles.header}>
              <h1 className={styles.title}>Your 6-Week Execution Framework</h1>
              <p className={styles.subtitle}>What happens immediately following your payment</p>
            </div>

            <div className={styles.phases}>
              <div className={styles.phase}>
                <div className={styles.phaseHeader}>
                  <Calendar className={styles.phaseIcon} size={24} />
                  <div>
                    <h3 className={styles.phaseTitle}>Phase 1 | Kickoff Consultation & Secure Onboarding</h3>
                    <span className={styles.phaseBadge}>Immediately after checkout</span>
                  </div>
                </div>
                <p className={styles.phaseDescription}>
                  Immediately after checkout, you will open our scheduling interface to secure your primary video kickoff session. On this initial call, we finalize standard NDAs and establish secure, read-only codebase or documentation access parameters via direct email. We gather the granular structural context our engineering leads need to begin processing your audit.
                </p>
              </div>

              <div className={styles.phase}>
                <div className={styles.phaseHeader}>
                  <Clock className={styles.phaseIcon} size={24} />
                  <div>
                    <h3 className={styles.phaseTitle}>Phase 2 | Week 1: Deep Asynchronous Pre-Research Diagnostics</h3>
                    <span className={styles.phaseBadge}>Week 1</span>
                  </div>
                </div>
                <p className={styles.phaseDescription}>
                  Our Principal Engineering team embeds into your domain to perform a comprehensive diagnostic audit of your syntax architecture, system boundaries, and data schemas. If we require deeper clarity during this technical audit week, our team will coordinate directly with you or your engineering contacts. You are equally free to pass along any additional data or documentation to us at any time.
                </p>
              </div>

              <div className={styles.phase}>
                <div className={styles.phaseHeader}>
                  <Users className={styles.phaseIcon} size={24} />
                  <div>
                    <h3 className={styles.phaseTitle}>Phase 3 | Week 2: High-Intensity Sprint Workshop</h3>
                    <span className={styles.phaseBadge}>Week 2</span>
                  </div>
                </div>
                <p className={styles.phaseDescription}>
                  We align on a pre-scheduled, side-by-side online sprint. Working closely alongside your team, we deliver the comprehensive research audit findings, map out concrete engineering boundaries, and deeply calibrate your technical product roadmap.
                </p>
              </div>

              <div className={styles.phase}>
                <div className={styles.phaseHeader}>
                  <Check className={styles.phaseIcon} size={24} />
                  <div>
                    <h3 className={styles.phaseTitle}>Phase 4 | Next 30 Days: Dedicated Implementation Advisory Support</h3>
                    <span className={styles.phaseBadge}>Next 30 Days</span>
                  </div>
                </div>
                <p className={styles.phaseDescription}>
                  For the next month, your internal team has a dedicated architectural lifeline. Through weekly engineering alignment calls, we answer ongoing questions, review implementation patterns, and guarantee flawless, risk-free execution by your developers.
                </p>
              </div>
            </div>

            <div className={styles.pricing}>
              <div className={styles.pricingCard}>
                <div className={styles.pricingHeader}>
                  <span className={styles.pricingLabel}>Fee</span>
                  <span className={styles.pricingAmount}>$24,500</span>
                </div>
                <p className={styles.pricingDescription}>
                  Flat-rate corporate pricing inclusive of all pre-research diagnostics, live workshop sprints, and 30 days of dedicated elite technical advisory.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Payment */}
          <div className={styles.rightColumn}>
            <div className={styles.paymentCard}>
              <h2 className={styles.paymentTitle}>Complete Your Purchase</h2>
              <p className={styles.paymentSubtitle}>
                Secure payment via Stripe
              </p>

              <div className={styles.summary}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Product</span>
                  <span className={styles.summaryValue}>Consulting Workshop</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Company</span>
                  <span className={styles.summaryValue}>{intakeData.companyName}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Email</span>
                  <span className={styles.summaryValue}>{intakeData.companyEmail}</span>
                </div>
                <div className={styles.summaryTotal}>
                  <span className={styles.totalLabel}>Total</span>
                  <span className={styles.totalAmount}>$24,500</span>
                </div>
              </div>

              <div className={styles.terms}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxText}>
                    By checking this box, you are signing the service agreement governed by USA California law
                  </span>
                </label>
              </div>

              <button
                onClick={handlePayment}
                disabled={!agreedToTerms || isProcessing}
                className={styles.payButton}
              >
                {isProcessing ? 'Processing...' : (
                  <>
                    Proceed to Payment
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <p className={styles.secureNote}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Secure payment powered by Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
