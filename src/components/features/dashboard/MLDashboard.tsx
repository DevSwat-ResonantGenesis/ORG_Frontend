import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { FlowDiagram } from '../../diagrams/FlowDiagram';
import { getSession } from '@/utils/auth';
import { fetchTrainingJobs, fetchModelVersions, fetchWorkerMetrics } from '@/api/ml';
import { logger } from '@/utils/logger';import { goToDashboard, goToHelp } from '@/utils/navigation';

import '../../theme/pages.css';

interface MLMetrics {
  activeJobs: number;
  completedJobs: number;
  modelVersions: number;
  workerHealth: 'healthy' | 'unhealthy';
}

export const MLDashboard: React.FC = () => {
  const navigate = useNavigate();
  const session = getSession();
  const [metrics, setMetrics] = useState<MLMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load ML-specific metrics from API
    const load = async () => {
      try {
        const [jobs, versions, worker] = await Promise.all([
          fetchTrainingJobs().catch(() => []),
          fetchModelVersions().catch(() => []),
          fetchWorkerMetrics().catch(() => ({ status: 'unhealthy' as const }))
        ]);

        const activeJobs = jobs.filter((j: { status: string }) => j.status === 'running').length;
        const completedJobs = jobs.filter((j: { status: string }) => j.status === 'completed').length;

        setMetrics({
          activeJobs,
          completedJobs,
          modelVersions: Array.isArray(versions) ? versions.length : 0,
          workerHealth: worker.status === 'healthy' ? 'healthy' : 'unhealthy'
        });
      } catch (error) {
        logger.error('ML dashboard load error', error, { component: 'MLDashboard' });
        // Fallback to default metrics on error
        setMetrics({
          activeJobs: 0,
          completedJobs: 0,
          modelVersions: 0,
          workerHealth: 'unhealthy'
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
        <div style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>Loading ML dashboard...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <h1 className="page-title" style={{ margin: 0 }}>ML Operations Dashboard</h1>
            <span style={{
              padding: '4px 12px',
              borderRadius: '0',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              background: '#8b5cf6',
              color: '#ffffff',
            }}>
              ML Engineer
            </span>
          </div>
          <p className="page-subtitle">ML engineer view: training jobs, model versions, and worker monitoring</p>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', lineHeight: '1.5', marginTop: '8px', maxWidth: '700px' }}>
            Specialized dashboard for ML engineers showing training job status, model version management, and worker health. 
            Monitor ML pipeline performance, track model deployments, and manage the ML lifecycle from this centralized view.
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
            Logged in as: <strong>{session.email || 'Unknown'}</strong> | Organization: <strong>{session.org || 'N/A'}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button onClick={() => navigate('/ml/training-jobs')}>Training Jobs</Button>
          <Button variant="secondary" onClick={() => navigate('/ml/model-versions')}>Model Versions</Button>
          <Button variant="secondary" onClick={() => navigate('/ml/worker')}>Worker Monitor</Button>
        </div>
      </div>

      {/* ML KPIs */}
      <section className="page-section">
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Active Training Jobs</div>
            <div className="kpi-value">{metrics?.activeJobs || 0}</div>
            <div className="kpi-meta">Running now</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Completed Jobs</div>
            <div className="kpi-value">{metrics?.completedJobs || 0}</div>
            <div className="kpi-meta">Total</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Model Versions</div>
            <div className="kpi-value">{metrics?.modelVersions || 0}</div>
            <div className="kpi-meta">Active models</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Worker Health</div>
            <div className="kpi-value" style={{ color: metrics?.workerHealth === 'healthy' ? '#22c55e' : '#ef4444' }}>
              {metrics?.workerHealth === 'healthy' ? 'Healthy' : 'Unhealthy'}
            </div>
            <div className="kpi-meta">System status</div>
          </div>
        </div>
      </section>

      {/* ML Flow Diagram */}
      <section className="page-section">
        <div className="page-card">
          <h3 className="section-title">ML Pipeline Flow</h3>
          <FlowDiagram type="prediction" animated={true} />
        </div>
      </section>

      {/* Quick Actions */}
      <section className="page-section">
        <div className="page-card">
          <h3 className="section-title">Quick Actions</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
            Navigate to ML operations pages. Create training jobs, manage model versions, monitor workers, and view predictions.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <Button onClick={() => navigate('/ml/training-jobs/new')} style={{ width: '100%' }}>
              Create Training Job
            </Button>
            <Button variant="secondary" onClick={() => navigate('/ml/training-jobs')} style={{ width: '100%' }}>
              Training Jobs
            </Button>
            <Button variant="secondary" onClick={() => navigate('/ml/model-versions')} style={{ width: '100%' }}>
              Model Versions
            </Button>
            <Button variant="secondary" onClick={() => navigate('/ml/worker')} style={{ width: '100%' }}>
              Worker Monitor
            </Button>
            <Button variant="secondary" onClick={() => navigate('/predictions')} style={{ width: '100%' }}>
              View Predictions
            </Button>
            <Button variant="secondary" onClick={() => goToDashboard(navigate)} style={{ width: '100%' }}>
              Main Dashboard
            </Button>
            <Button variant="secondary" onClick={() => navigate('/compliance')} style={{ width: '100%' }}>
              Compliance
            </Button>
            <Button variant="secondary" onClick={() => navigate('/settings')} style={{ width: '100%' }}>
              Settings
            </Button>
            <Button variant="secondary" onClick={() => goToHelp(navigate)} style={{ width: '100%' }}>
              Help Center
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

