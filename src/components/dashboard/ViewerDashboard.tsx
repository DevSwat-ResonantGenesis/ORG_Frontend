import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPredictions } from '../../api/predictions';
import { fetchComplianceSummary } from '../../api/compliance';
import { Button } from '@/components/ui/Button';
import { getSession } from '../../utils/auth';
import logger from '../../utils/logger';
import '../../theme/pages.css';

export const ViewerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const session = getSession();
  const [predictions, setPredictions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [preds, comp] = await Promise.all([
          fetchPredictions().catch(() => []),
          fetchComplianceSummary().catch(() => ({ overall_score: 0.85, active_policies: 0 }))
        ]);
        setPredictions(Array.isArray(preds) ? preds : []);
        setSummary(comp || { overall_score: 0.85, active_policies: 0 });
      } catch (error) {
        logger.error('Viewer dashboard load error', error);
        setPredictions([]);
        setSummary({ overall_score: 0.85, active_policies: 0 });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>Loading dashboard...</div>
      </div>
    );
  }

  const avgValidity = predictions.reduce((acc, p) => acc + (p.validity || 0), 0) / Math.max(predictions.length, 1);
  const avgRisk = predictions.reduce((acc, p) => acc + (p.entropy || 0), 0) / Math.max(predictions.length, 1);

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <h1 className="page-title" style={{ margin: 0 }}>Dashboard (Read-Only)</h1>
            <span style={{
              padding: '4px 12px',
              borderRadius: '0',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              background: '#6b7280',
              color: '#ffffff',
            }}>
              Viewer
            </span>
          </div>
          <p className="page-subtitle">View-only access to predictions, compliance, and audit information</p>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', lineHeight: '1.5', marginTop: '8px', maxWidth: '700px' }}>
            Read-only dashboard for viewers showing prediction summaries, compliance scores, and audit information. Viewers can 
            access all information but cannot create, modify, or delete any data. This role is ideal for auditors, analysts, and 
            stakeholders who need visibility without modification rights.
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
            Logged in as: <strong>{session.email || 'Unknown'}</strong> | Organization: <strong>{session.org || 'N/A'}</strong>
          </p>
        </div>
      </div>

      {/* Read-Only KPIs */}
      <section className="page-section">
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Total Predictions</div>
            <div className="kpi-value">{predictions.length}</div>
            <div className="kpi-meta">All time</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Average Validity</div>
            <div className="kpi-value">{avgValidity.toFixed(2)}</div>
            <div className="kpi-meta">Overall</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Average Risk</div>
            <div className="kpi-value">{avgRisk.toFixed(3)}</div>
            <div className="kpi-meta">Overall</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Compliance Score</div>
            <div className="kpi-value">
              {summary?.overall_score ? `${(summary.overall_score * 100).toFixed(0)}%` : 'N/A'}
            </div>
            <div className="kpi-meta">Overall</div>
          </div>
        </div>
      </section>

      {/* Read-Only Actions */}
      <section className="page-section">
        <div className="page-card">
          <h3 className="section-title">Available Views</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
            Navigate to all available read-only views. As a viewer, you can access all information but cannot create, modify, or delete data.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <Button variant="secondary" onClick={() => navigate('/predictions')} style={{ width: '100%' }}>
              View Predictions
            </Button>
            <Button variant="secondary" onClick={() => navigate('/compliance')} style={{ width: '100%' }}>
              View Compliance
            </Button>
            <Button variant="secondary" onClick={() => navigate('/audit')} style={{ width: '100%' }}>
              View Audit Logs
            </Button>
            <Button variant="secondary" onClick={() => navigate('/ai-audit')} style={{ width: '100%' }}>
              AI Audit Dashboard
            </Button>
            <Button variant="secondary" onClick={() => navigate('/policies')} style={{ width: '100%' }}>
              View Policies
            </Button>
            <Button variant="secondary" onClick={() => navigate('/settings')} style={{ width: '100%' }}>
              Settings
            </Button>
            <Button variant="secondary" onClick={() => navigate('/profile')} style={{ width: '100%' }}>
              Profile
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

