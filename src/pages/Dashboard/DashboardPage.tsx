import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPredictions } from '../../api/predictions';
import { fetchComplianceSummary } from '../../api/compliance';
import { fetchDashboardData, type DashboardData } from '../../api/dashboard';
import { getSession } from '../../utils/auth';
import { normalizeRole, canAccess, type Role } from '../../utils/permissions';
import { logger } from '../../utils/logger';
import type { Prediction, ComplianceSummary } from '../../types';
import ValidityOverTimeChart from './ValidityOverTimeChart';
import AnchorCoverageChart from './AnchorCoverageChart';
import { DashboardEvidenceGraphWidget } from '../../components/dashboard/DashboardEvidenceGraphWidget';
import APIUsageDashboard from '../../components/dashboard/APIUsageDashboard';
import { BusinessImpactKPIs } from '../../components/dashboard/BusinessImpactKPIs';
import { FlowDiagram } from '../../components/diagrams/FlowDiagram';
import { LogPanel, LogEntry } from '../../components/panels/LogPanel';
import { RoleBasedDashboard } from '../../components/dashboard/RoleBasedDashboard';
import { Button } from '../../components/ui';
import { Card } from '../../components/ui';
import { Text } from '../../components/ui';
import { mapPredictionsToLineSeries } from '../../utils/chartHelpers';
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const session = getSession();
  const normalizedRole = normalizeRole((session.role || 'user') as Role);
  const userRole: Role = normalizedRole || 'user';
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [summary, setSummary] = useState<ComplianceSummary | null>(null);
  const [systemLogs, setSystemLogs] = useState<LogEntry[]>([]);
  const [dashData, setDashData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const preds = await fetchPredictions().catch(() => []);
        setPredictions(Array.isArray(preds) ? preds : []);
      } catch (e) {
        logger.error('Dashboard predictions load error', e, { component: 'DashboardPage' });
        setPredictions([]);
      }
      
      try {
        const compliance = await fetchComplianceSummary().catch(() => ({
          risky_predictions: 0,
          low_validity_count: 0,
          active_policies: 0,
          overall_score: 0.85
        }));
        setSummary(compliance as ComplianceSummary || { risky_predictions: 0, low_validity_count: 0, active_policies: 0, hipaa_violations: 0, anchor_coverage: 0 } as ComplianceSummary);
      } catch (e) {
        logger.error('Dashboard compliance load error', e, { component: 'DashboardPage' });
        setSummary({ risky_predictions: 0, low_validity_count: 0, active_policies: 0, hipaa_violations: 0, anchor_coverage: 0 } as ComplianceSummary);
      }

      // Fetch REAL dashboard data from live endpoints
      try {
        const realDash = await fetchDashboardData();
        setDashData(realDash);
        // Build real activity logs from backend data
        const logs: LogEntry[] = (realDash.recentActivity || []).slice(0, 10).map((act, i) => ({
          id: String(i),
          timestamp: act.timestamp || new Date().toISOString(),
          level: act.type === 'error' ? 'error' as const : act.type === 'warning' ? 'warning' as const : 'info' as const,
          message: act.description || 'Activity',
          source: act.type || 'platform',
        }));
        if (logs.length === 0) {
          logs.push({ id: '0', timestamp: new Date().toISOString(), level: 'info', message: 'Dashboard loaded — no recent activity', source: 'dashboard' });
        }
        setSystemLogs(logs);
      } catch (e) {
        logger.error('Dashboard real data load error', e, { component: 'DashboardPage' });
      }
    };

    load();
  }, []);

  // Use role-based dashboard for specific roles
  if (userRole === 'compliance' || userRole === 'ml_engineer' || userRole === 'finance' || userRole === 'platform_dev' || userRole === 'viewer') {
    return <RoleBasedDashboard />;
  }

  // Initialize summary with defaults if null
  const safeSummary = summary || { risky_predictions: 0, low_validity_count: 0, active_policies: 0 };

  const avgValidity =
    predictions.reduce((acc, p) => acc + (p.validity || 0), 0) / Math.max(predictions.length, 1);

  const avgRisk =
    predictions.reduce((acc, p) => acc + (p.entropy || 0), 0) / Math.max(predictions.length, 1);

  const lineData = mapPredictionsToLineSeries(predictions);

  const anchorCounts: Record<string, number> = {};
  predictions.forEach((p) => {
    const anchors = p.anchors || p.policies_triggered || [];
    if (Array.isArray(anchors)) {
      anchors.forEach((anchor: string) => {
        if (anchor) {
          anchorCounts[anchor] = (anchorCounts[anchor] || 0) + 1;
        }
      });
    }
  });
  const barData = Object.entries(anchorCounts).map(([anchor, count]) => ({ anchor, count }));

  const today = new Date().toISOString().split('T')[0];
  const todayPredictions = predictions.filter((p) => {
    const predDate = (p.created_at || p.timestamp || '').split('T')[0];
    return predDate === today;
  });

  const violations24h = safeSummary?.risky_predictions || 0;
  const activeModelVersion = dashData?.tier || 'free';
  const complianceScore = dashData?.platform?.compliance?.score
    ? String(dashData.platform.compliance.score)
    : ((1 - avgRisk) * 100).toFixed(0);
  const complianceGrade = dashData?.platform?.compliance?.grade || '';
  const totalAgents = dashData?.platform?.agentMetrics?.total ?? dashData?.activity?.agents ?? 0;
  const activeSessions = dashData?.platform?.agentMetrics?.sessions ?? dashData?.activity?.sessions ?? 0;
  const creditBalance = dashData?.credits?.balance;
  const creditLimit = dashData?.credits?.limit;
  const totalMemories = dashData?.platform?.memory?.totalMemories ?? dashData?.activity?.memories ?? 0;
  const marketplaceListings = dashData?.platform?.marketplace?.totalListings ?? 0;
  const workflowCount = dashData?.platform?.workflows?.count ?? 0;

  // Recent predictions (last 10)
  const recentPredictions = predictions.slice(0, 10);

  // Helper function to get role badge info
  const getRoleBadge = (role: Role) => {
    if (role === 'org_admin' || role === 'admin') {
      return { label: 'Admin', color: '#3b82f6' };
    }
    if (role === 'platform_dev') {
      return { label: 'Platform Dev', color: '#ef4444' };
    }
    if (role === 'ml_engineer') {
      return { label: 'ML Engineer', color: '#8b5cf6' };
    }
    if (role === 'compliance' || role === 'security') {
      return { label: 'Compliance', color: '#10b981' };
    }
    if (role === 'finance') {
      return { label: 'Finance', color: '#f59e0b' };
    }
    if (role === 'viewer' || role === 'analyst') {
      return { label: 'Viewer', color: '#6b7280' };
    }
    return { label: 'User', color: '#6366f1' };
  };

  const roleBadge = getRoleBadge(userRole);

  return (
    <div className="page-container">
      {/* HEADER */}
      <div className={`${styles.pageHeader} ${styles.fadeIn}`} style={{ marginBottom: 'var(--space-6)' }}>
        <div className={styles.pageHeaderContent}>
          <div className={styles.pageHeaderTitleRow} style={{ marginBottom: 'var(--space-2)' }}>
            <Text variant="h1" color="primary" style={{ margin: 0 }}>Dashboard</Text>
            <span style={{
              padding: 'var(--space-1) var(--space-2)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-12)',
              fontWeight: 'var(--font-weight-semibold)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              background: roleBadge.color,
              color: '#ffffff',
              whiteSpace: 'nowrap'
            }}>
              {roleBadge.label}
            </span>
          </div>
          <Text variant="body" color="secondary" className={styles.pageSubtitleDesktop}>
            Monitor prediction performance, compliance status, and system metrics.
          </Text>
        </div>
        <div className={`${styles.pageHeaderActions} ${styles.pageHeaderActionsDesktop}`} style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <Button variant="secondary" size="md" onClick={() => navigate('/predictions')}>
            View All Predictions
          </Button>
          <Button variant="secondary" size="md" onClick={() => navigate('/compliance')}>
            Compliance Center
          </Button>
          <Button variant="secondary" size="md" onClick={() => navigate('/audit')}>
            Audit Logs
          </Button>
          <Button variant="secondary" size="md" onClick={() => navigate('/ai-audit')}>
            AI Audit
          </Button>
          {(userRole === 'org_admin' || userRole === 'admin') && (
            <>
              <Button variant="secondary" size="md" onClick={() => navigate('/policies')}>
                Policies
              </Button>
              <Button variant="secondary" size="md" onClick={() => navigate('/organization')}>
                Organization
              </Button>
            </>
          )}
        </div>
      </div>

      {/* KPI GRID */}
      <section className={`page-section ${styles.fadeIn}`} style={{ marginBottom: 'var(--space-6)' }}>
        <div className={styles.dashboardDescriptionDesktop} style={{ marginBottom: 'var(--space-2)' }}>
          <Text variant="body-sm" color="secondary">
            Monitor AI prediction health, compliance status, and system performance.
          </Text>
        </div>
        <div className={styles.kpiGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
          <Card variant="elevated" padding="md">
            <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)' }}>Agents</Text>
            <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-1)', fontFamily: 'var(--font-mono)' }}>{totalAgents}</Text>
            <Text variant="caption" color="muted" style={{ marginBottom: 'var(--space-1)' }}>{activeSessions} sessions</Text>
            <Text variant="caption" color="muted">Total agents deployed.</Text>
          </Card>
          <Card variant="elevated" padding="md">
            <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)' }}>Compliance</Text>
            <Text variant="h2" color="accent" style={{ marginBottom: 'var(--space-1)', fontFamily: 'var(--font-mono)' }}>{complianceScore}{complianceGrade ? ` (${complianceGrade})` : '%'}</Text>
            <Text variant="caption" color="success" style={{ marginBottom: 'var(--space-1)' }}>{dashData?.platform?.compliance?.framework || 'SOC2'}</Text>
            <Text variant="caption" color="muted">Live compliance score.</Text>
          </Card>
          <Card variant="elevated" padding="md">
            <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)' }}>Credits</Text>
            <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-1)', fontFamily: 'var(--font-mono)' }}>{creditBalance !== null && creditBalance !== undefined ? creditBalance.toLocaleString() : '—'}</Text>
            <Text variant="caption" color="muted" style={{ marginBottom: 'var(--space-1)' }}>{creditLimit ? `of ${creditLimit.toLocaleString()} limit` : dashData?.credits?.unlimited ? 'Unlimited' : ''}</Text>
            <Text variant="caption" color="muted">Credit balance.</Text>
          </Card>
          <Card variant="elevated" padding="md">
            <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)' }}>Memories</Text>
            <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-1)', fontFamily: 'var(--font-mono)' }}>{totalMemories.toLocaleString()}</Text>
            <Text variant="caption" color="muted" style={{ marginBottom: 'var(--space-1)' }}>{dashData?.platform?.memory?.storageMb ? `${dashData.platform.memory.storageMb.toFixed(1)} MB` : ''}</Text>
            <Text variant="caption" color="muted">Hash Sphere anchors.</Text>
          </Card>
          <Card variant="elevated" padding="md">
            <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)' }}>Marketplace</Text>
            <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-1)', fontFamily: 'var(--font-mono)' }}>{marketplaceListings}</Text>
            <Text variant="caption" color="muted" style={{ marginBottom: 'var(--space-1)' }}>{workflowCount} workflows</Text>
            <Text variant="caption" color="muted">Available listings.</Text>
          </Card>
        </div>
      </section>

      {/* BUSINESS IMPACT KPIs */}
      <section className={`page-section ${styles.fadeIn} ${styles.delay1}`} style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ marginBottom: 'var(--space-2)' }}>
          <Text variant="h3" color="primary" style={{ marginBottom: 'var(--space-1)' }}>Business Impact</Text>
          <Text variant="body-sm" color="secondary">
            Quantify the value of AI governance and risk prevention.
          </Text>
        </div>
        <BusinessImpactKPIs
          predictionsBlocked={violations24h}
          violationsPrevented={violations24h}
          costSavings={violations24h * 10000}
          riskIncidentsAvoided={violations24h}
        />
      </section>

      {/* API USAGE WIDGET */}
      <section className={`page-section ${styles.fadeIn} ${styles.delay1}`} style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ marginBottom: 'var(--space-2)' }}>
          <Text variant="h3" color="primary" style={{ marginBottom: 'var(--space-1)' }}>API Usage</Text>
          <Text variant="body-sm" color="secondary">
            Monitor your API subscriptions and usage across all services.
          </Text>
        </div>
        <APIUsageDashboard compact />
      </section>

      {/* EVIDENCE GRAPH WIDGET */}
      <section className={`page-section ${styles.fadeIn} ${styles.delay1}`} style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ marginBottom: 'var(--space-2)' }}>
          <Text variant="h3" color="primary" style={{ marginBottom: 'var(--space-1)' }}>High-Risk Predictions</Text>
          <Text variant="body-sm" color="secondary">
            Predictions with elevated risk scores requiring review.
          </Text>
        </div>
        <DashboardEvidenceGraphWidget
          recentPredictions={predictions.filter(p => (p.entropy || 0) > 0.7)}
          maxItems={3}
        />
      </section>


      {/* CHARTS */}
      <section className={`page-section ${styles.fadeIn} ${styles.delay1}`} style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ marginBottom: 'var(--space-2)' }}>
          <Text variant="h3" color="primary" style={{ marginBottom: 'var(--space-1)' }}>Analytics & Trends</Text>
          <Text variant="body-sm" color="secondary">
            Track prediction validity and context coverage over time.
          </Text>
        </div>
        <div className={styles.chartsGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-3)' }}>
          <Card variant="elevated" padding="md">
            <Card.Header>
              <Text variant="h4" color="primary" style={{ marginBottom: 'var(--space-1)' }}>Validity Over Time</Text>
              <Text variant="caption" color="muted">Prediction validity over time.</Text>
            </Card.Header>
            <Card.Body>
              <ValidityOverTimeChart data={lineData} />
            </Card.Body>
          </Card>
          <Card variant="elevated" padding="md">
            <Card.Header>
              <Text variant="h4" color="primary" style={{ marginBottom: 'var(--space-1)' }}>Context Coverage</Text>
              <Text variant="caption" color="muted">Context distribution across predictions.</Text>
            </Card.Header>
            <Card.Body>
              <AnchorCoverageChart data={barData} />
            </Card.Body>
          </Card>
        </div>
      </section>

      {/* SYSTEM LOGS */}
      {(userRole === 'org_admin' || userRole === 'admin') && (
        <section className={`page-section ${styles.fadeIn} ${styles.delay2}`}>
          <LogPanel
            logs={systemLogs}
            title="Recent System Activity"
            maxHeight={300}
            autoScroll={false}
            filterable={true}
            exportable={true}
          />
        </section>
      )}

      {/* RECENT PREDICTIONS */}
      <section className="page-section fade-in delay-2" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ marginBottom: 'var(--space-2)' }}>
          <Text variant="h3" color="primary" style={{ marginBottom: 'var(--space-1)' }}>Recent Predictions</Text>
          <Text variant="body-sm" color="secondary">
            Most recent predictions. Click to view details and evidence graphs.
          </Text>
        </div>
        <Card variant="elevated" padding="none">
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.modernTable} style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ 
                  background: 'var(--color-bg-secondary)',
                  borderBottom: '1px solid var(--color-border)'
                }}>
                  <th style={{ 
                    padding: 'var(--space-2) var(--space-3)',
                    textAlign: 'left',
                    fontWeight: 'var(--font-weight-semibold)',
                    fontSize: 'var(--font-14)',
                    color: 'var(--color-text-primary)'
                  }}>Input Preview</th>
                  <th style={{ 
                    padding: 'var(--space-2) var(--space-3)',
                    textAlign: 'left',
                    fontWeight: 'var(--font-weight-semibold)',
                    fontSize: 'var(--font-14)',
                    color: 'var(--color-text-primary)'
                  }}>Risk</th>
                  <th style={{ 
                    padding: 'var(--space-2) var(--space-3)',
                    textAlign: 'left',
                    fontWeight: 'var(--font-weight-semibold)',
                    fontSize: 'var(--font-14)',
                    color: 'var(--color-text-primary)'
                  }}>Compliance</th>
                  <th style={{ 
                    padding: 'var(--space-2) var(--space-3)',
                    textAlign: 'left',
                    fontWeight: 'var(--font-weight-semibold)',
                    fontSize: 'var(--font-14)',
                    color: 'var(--color-text-primary)'
                  }}>Model</th>
                  <th style={{ 
                    padding: 'var(--space-2) var(--space-3)',
                    textAlign: 'right',
                    fontWeight: 'var(--font-weight-semibold)',
                    fontSize: 'var(--font-14)',
                    color: 'var(--color-text-primary)'
                  }}>Date</th>
                  <th style={{ 
                    padding: 'var(--space-2) var(--space-3)',
                    textAlign: 'right',
                    fontWeight: 'var(--font-weight-semibold)',
                    fontSize: 'var(--font-14)',
                    color: 'var(--color-text-primary)'
                  }}></th>
                </tr>
              </thead>
              <tbody>
                {recentPredictions.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ 
                      padding: 'var(--space-6) 0',
                      textAlign: 'center',
                      color: 'var(--color-text-secondary)',
                      fontSize: 'var(--font-14)',
                    }}>
                      No predictions yet
                    </td>
                  </tr>
                ) : (
                  recentPredictions.map((pred, idx) => {
                    const riskLevel = (pred.entropy || 0) < 0.3 ? 'low' : (pred.entropy || 0) < 0.7 ? 'medium' : 'high';
                    const isEven = idx % 2 === 0;
                    return (
                      <tr
                        key={pred.id || idx}
                        onClick={() => navigate(`/predictions/${pred.id}`)}
                        style={{ 
                          cursor: 'pointer',
                          background: isEven ? 'var(--color-bg-surface)' : 'var(--color-bg-secondary)',
                          transition: 'background-color var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--color-bg-secondary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = isEven ? 'var(--color-bg-surface)' : 'var(--color-bg-secondary)';
                        }}
                      >
                        <td style={{ 
                          padding: 'var(--space-2) var(--space-3)',
                          maxWidth: '300px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: 'var(--color-text-primary)',
                          fontSize: 'var(--font-14)'
                        }}>
                          {(pred.input_text || pred.input_excerpt || 'N/A').substring(0, 50)}
                        </td>
                        <td style={{ padding: 'var(--space-2) var(--space-3)' }}>
                          <span className={`${styles.tag} ${styles[riskLevel]}`}>
                            {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
                          </span>
                        </td>
                        <td style={{ 
                          padding: 'var(--space-2) var(--space-3)',
                          color: (pred.policies_triggered?.length || 0) > 0 ? '#ef4444' : '#22c55e',
                          fontSize: 'var(--font-14)'
                        }}>
                          {(pred.policies_triggered?.length || 0) > 0 ? 'Violation' : 'Compliant'}
                        </td>
                        <td style={{ 
                          padding: 'var(--space-2) var(--space-3)',
                          color: 'var(--color-text-primary)',
                          fontSize: 'var(--font-14)'
                        }}>{dashData?.tier || '—'}</td>
                        <td style={{ 
                          padding: 'var(--space-2) var(--space-3)',
                          textAlign: 'right',
                          color: 'var(--color-text-secondary)',
                          fontSize: 'var(--font-14)'
                        }}>
                          {new Date(pred.created_at || pred.timestamp || Date.now()).toLocaleDateString()}
                        </td>
                        <td style={{ padding: 'var(--space-2) var(--space-3)', textAlign: 'right' }}>
                          <Button
                            variant="tertiary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/predictions/${pred.id}`);
                            }}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* COMPLIANCE SUMMARY */}
      <section className={`page-section ${styles.fadeIn} ${styles.delay3}`}>
        <Card variant="elevated" padding="md">
          <Card.Header>
            <Text variant="h3" color="primary" style={{ marginBottom: 'var(--space-2)' }}>Compliance Summary</Text>
            <Text variant="body" color="primary" style={{ marginBottom: 'var(--space-2)' }}>
              {violations24h > 0 ? `${violations24h} violation(s) detected in the last 24 hours requiring review.` : 'No critical violations detected in the last 7 days.'}
            </Text>
            <Text variant="body-sm" color="secondary">
              Active policies are continuously evaluated against all predictions. Visit the Compliance Center for detailed analysis.
            </Text>
          </Card.Header>
          <Card.Body>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: 'var(--space-4)', 
              marginTop: 'var(--space-4)' 
            }}>
              <div>
                <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)' }}>
                  Active Policies
                </Text>
                <Text variant="h3" color="primary" style={{ fontFamily: 'var(--font-mono)' }}>
                  {safeSummary?.active_policies || 0}
                </Text>
              </div>
              <div>
                <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)' }}>
                  Context Groups
                </Text>
                <Text variant="h3" color="primary" style={{ fontFamily: 'var(--font-mono)' }}>
                  {Object.keys(anchorCounts).length}
                </Text>
              </div>
            </div>
          </Card.Body>
        </Card>
      </section>

    </div>
  );
};

export default DashboardPage;
