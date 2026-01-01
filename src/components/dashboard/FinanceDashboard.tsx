import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchBillingOverview } from '../../api/billing';
import { Button } from '@/components/ui/Button';
import { AnimatedCounter } from '../features/landing/AnimatedCounter';
import { getSession } from '../../utils/auth';
import logger from '../../utils/logger';
import '../../theme/pages.css';

export const FinanceDashboard: React.FC = () => {
  const navigate = useNavigate();
  const session = getSession();
  const [billing, setBilling] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchBillingOverview().catch(() => ({
          plan: 'Professional',
          overview: {
            monthly_cost: 0,
            remaining_credits: 'Unlimited'
          },
          usage: {
            predictions_this_month: 0,
            api_calls_this_month: 0,
            storage_gb: 0
          }
        }));
        setBilling(data || {
          plan: 'Professional',
          overview: { monthly_cost: 0, remaining_credits: 'Unlimited' },
          usage: { predictions_this_month: 0, api_calls_this_month: 0, storage_gb: 0 }
        });
      } catch (error) {
        logger.error('Finance dashboard load error', error);
        setBilling({
          plan: 'Professional',
          overview: { monthly_cost: 0, remaining_credits: 'Unlimited' },
          usage: { predictions_this_month: 0, api_calls_this_month: 0, storage_gb: 0 }
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>Loading finance dashboard...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <h1 className="page-title" style={{ margin: 0 }}>Finance Dashboard</h1>
            <span style={{
              padding: '4px 12px',
              borderRadius: '0',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              background: '#f59e0b',
              color: '#ffffff',
            }}>
              Finance
            </span>
          </div>
          <p className="page-subtitle">Financial overview, usage, and billing management</p>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', lineHeight: '1.5', marginTop: '8px', maxWidth: '700px' }}>
            Specialized dashboard for finance teams showing subscription plans, usage metrics, billing information, and cost analysis. 
            Monitor spending, track usage trends, and manage payment methods from this centralized financial view.
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
            Logged in as: <strong>{session.email || 'Unknown'}</strong> | Organization: <strong>{session.org || 'N/A'}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="secondary" onClick={() => navigate('/billing')}>
            Full Billing View
          </Button>
          <Button variant="secondary" onClick={() => navigate('/finance/reports')}>
            Financial Reports
          </Button>
        </div>
      </div>

      {/* Finance KPIs */}
      <section className="page-section">
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Current Plan</div>
            <div className="kpi-value" style={{ fontSize: '24px' }}>
              {billing?.plan || 'N/A'}
            </div>
            <div className="kpi-meta">Active subscription</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Monthly Cost</div>
            <div className="kpi-value">
              <AnimatedCounter value={billing?.overview?.monthly_cost || 0} prefix="$" decimals={2} />
            </div>
            <div className="kpi-meta">Current month</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Usage This Month</div>
            <div className="kpi-value">
              <AnimatedCounter value={billing?.usage?.predictions_this_month || 0} suffix=" predictions" />
            </div>
            <div className="kpi-meta">Total usage</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Remaining Credits</div>
            <div className="kpi-value">
              {billing?.overview?.remaining_credits || 'Unlimited'}
            </div>
            <div className="kpi-meta">Available</div>
          </div>
        </div>
      </section>

      {/* Usage Breakdown */}
      <section className="page-section">
        <div className="page-card">
          <h3 className="section-title">Usage Breakdown</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginTop: '24px' }}>
            <div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Predictions</div>
              <div style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {billing?.usage?.predictions_this_month || 0}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>API Calls</div>
              <div style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {billing?.usage?.api_calls_this_month || 0}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Storage</div>
              <div style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {billing?.usage?.storage_gb ? `${billing.usage.storage_gb} GB` : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="page-section">
        <div className="page-card">
          <h3 className="section-title">Quick Actions</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
            Navigate to financial management pages. View billing details, invoices, financial reports, and manage payment methods.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <Button onClick={() => navigate('/billing')} style={{ width: '100%' }}>
              View Billing Details
            </Button>
            <Button variant="secondary" onClick={() => navigate('/finance/invoices')} style={{ width: '100%' }}>
              View Invoices
            </Button>
            <Button variant="secondary" onClick={() => navigate('/finance/reports')} style={{ width: '100%' }}>
              Financial Reports
            </Button>
            <Button variant="secondary" onClick={() => navigate('/organization')} style={{ width: '100%' }}>
              Organization
            </Button>
            <Button variant="secondary" onClick={() => navigate('/dashboard')} style={{ width: '100%' }}>
              Main Dashboard
            </Button>
            <Button variant="secondary" onClick={() => navigate('/settings')} style={{ width: '100%' }}>
              Settings
            </Button>
            <Button variant="secondary" onClick={() => navigate('/help')} style={{ width: '100%' }}>
              Help Center
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

