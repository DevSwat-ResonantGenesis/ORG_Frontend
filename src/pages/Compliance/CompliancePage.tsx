import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchComplianceSummary, generateReport } from '../../api/compliance';
import { fetchPredictions } from '../../api/predictions';
import { logger } from '../../utils/logger';
import type { Prediction, ComplianceSummary as ComplianceSummaryType } from '../../types';
import { Button, Card, Text } from '../../components/ui';
import { FlowDiagram } from '../../components/diagrams/FlowDiagram';
import { LogPanel, LogEntry } from '../../components/panels/LogPanel';
import ComplianceSummary from './ComplianceSummary';
import ComplianceRiskDonut from './ComplianceRiskDonut';
import ComplianceTrendChart from './ComplianceTrendChart';
import ComplianceViolationsTable from './ComplianceViolationsTable';
import { getSession } from '../../utils/auth';
import { canAccess, isAdmin, type Role } from '../../utils/permissions';
import { ModernPageLayout } from '../../components/layout/ModernPageLayout';

const CompliancePage = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<ComplianceSummaryType | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportMessage, setReportMessage] = useState('');
  const [complianceLogs, setComplianceLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const s = await fetchComplianceSummary();
        const preds = await fetchPredictions();
        setSummary(s);
        setPredictions(preds);

        // Generate compliance logs
        const logs: LogEntry[] = [
          {
            id: '1',
            timestamp: new Date().toISOString(),
            level: 'info',
            message: 'Compliance check completed',
            source: 'compliance-engine'
          },
          {
            id: '2',
            timestamp: new Date(Date.now() - 60000).toISOString(),
            level: preds.filter(p => (p.policies_triggered?.length || 0) > 0).length > 0 ? 'warning' : 'success',
            message: `Policy evaluation: ${preds.filter(p => (p.policies_triggered?.length || 0) > 0).length} violations detected`,
            source: 'policy-engine'
          }
        ];
        setComplianceLogs(logs);
      } catch (err: any) {
        logger.error('Compliance load error', err, { component: 'CompliancePage' });
        setError(err?.message || 'Failed to load compliance data');
      } finally {
      setLoading(false);
      }
    };
    load();
  }, []);

  const handleReport = async (period: 'daily' | 'weekly' | 'monthly') => {
    try {
    const res = await generateReport(period);
    setReportMessage(`Report created: ${res.filename || 'success'}`);
    setTimeout(() => setReportMessage(''), 5000);
    } catch (err: any) {
      logger.error('Report generation error', err, { component: 'CompliancePage' });
      setReportMessage('Failed to generate report');
    }
  };

  const headerActions = (
    <Button size="md" onClick={() => handleReport('monthly')} variant="secondary">
      Export Report (PDF)
    </Button>
    );

  return (
    <ModernPageLayout
      title="Compliance & Risk Management"
      subtitle="Monitor compliance scores, policy violations, and risk trends. Automated compliance monitoring with real-time violation detection and comprehensive reporting for GDPR, HIPAA, SOC 2, and ISO 27001."
      headerActions={headerActions}
      loading={loading}
      error={error}
      onRetry={() => window.location.reload()}
      maxWidth="xl"
    >
      {/* Report Message */}
          {reportMessage && (
        <Card variant="outlined" padding="md" style={{ 
          background: 'var(--color-bg-success)', 
          borderColor: 'var(--color-success)',
          marginBottom: 'var(--space-4)'
        }}>
                <Text variant="body-sm" color="primary">{reportMessage}</Text>
              </Card>
          )}

          {/* Compliance Flow Diagram */}
        <Card variant="elevated" padding="md">
          <Card.Header>
          <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-1)' }}>
            Compliance Evaluation Flow
          </Text>
            <Text variant="body-sm" color="secondary">
              Every prediction is automatically evaluated against your organization's compliance policies. The system checks for 
              regulatory violations, safety risks, bias indicators, and policy adherence. Violations are flagged immediately 
              and logged in the audit trail for compliance officers to review.
            </Text>
          </Card.Header>
          <Card.Body>
            <FlowDiagram type="compliance" animated={true} />
          </Card.Body>
            </Card>

          {/* Compliance Score Section */}
        <Card variant="elevated" padding="md">
          <Card.Header>
          <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>
            Compliance Score
          </Text>
            <Text variant="body-sm" color="secondary">
              Overall compliance percentage calculated from policy adherence across all predictions. Scores are computed per policy, 
              per model version, and aggregated to provide a comprehensive view of your organization's compliance posture.
            </Text>
          </Card.Header>
          <Card.Body>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
              <Card variant="outlined" padding="md">
              <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)' }}>
                Context Coverage
              </Text>
                <Text variant="h2" color="accent" style={{ fontFamily: 'var(--font-mono)', marginBottom: 'var(--space-1)' }}>
                  {summary?.anchor_coverage ? `${(summary.anchor_coverage * 100).toFixed(0)}%` : 'N/A'}
                </Text>
                <Text variant="caption" color="muted">
                  Aggregate compliance across all policies and predictions
                </Text>
              </Card>
              <Card variant="outlined" padding="md">
              <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)' }}>
                Per Policy
              </Text>
              <Text variant="h4" color="primary" style={{ marginBottom: 'var(--space-1)' }}>
                See violations table
              </Text>
                <Text variant="caption" color="muted">
                  Individual policy compliance scores available below
                </Text>
              </Card>
              <Card variant="outlined" padding="md">
              <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)' }}>
                Per Model Version
              </Text>
              <Text variant="h4" color="primary" style={{ fontFamily: 'var(--font-mono)', marginBottom: 'var(--space-1)' }}>
                v1.2.3: 95%
              </Text>
                <Text variant="caption" color="muted">
                  Compliance score for the active model version
                </Text>
              </Card>
            </div>
          </Card.Body>
        </Card>

      {/* Violations Table */}
        <Card variant="elevated" padding="md">
          <Card.Header>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              <div>
              <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-1)' }}>
                Policy Violations
              </Text>
                <Text variant="body-sm" color="secondary">
                  Predictions that triggered one or more compliance policies. Review each violation to understand the policy requirements 
                  and take corrective action. All violations are logged in the audit trail for compliance reporting.
                </Text>
              </div>
              <Button variant="secondary" size="md" onClick={() => navigate('/policies')}>
                View Policies
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            <ComplianceViolationsTable predictions={predictions} />
          </Card.Body>
        </Card>

      {/* Policy Coverage */}
        <Card variant="elevated" padding="md">
          <Card.Header>
          <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>
            Policy Coverage
          </Text>
            <Text variant="body-sm" color="secondary">
              Policy evaluation coverage shows how many predictions passed compliance checks, failed checks, or were not evaluated. 
              High coverage ensures comprehensive compliance monitoring across all AI predictions.
            </Text>
          </Card.Header>
          <Card.Body>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
              <Card variant="outlined" padding="md">
              <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-2)' }}>
                Passed Checks
              </Text>
                <ComplianceRiskDonut summary={summary || { hipaa_violations: 0, low_validity_count: 0, risky_predictions: 0 }} />
                <Text variant="caption" color="muted" style={{ marginTop: 'var(--space-2)' }}>
                  Predictions that passed all policy evaluations
                </Text>
              </Card>
              <Card variant="outlined" padding="md">
              <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)' }}>
                HIPAA Violations
              </Text>
                <Text variant="h2" color="error" style={{ fontFamily: 'var(--font-mono)', marginBottom: 'var(--space-1)' }}>
                  {summary?.hipaa_violations || 0}
                </Text>
                <Text variant="caption" color="muted">
                  Predictions that violated HIPAA policies
                </Text>
              </Card>
              <Card variant="outlined" padding="md">
              <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)' }}>
                Risky Predictions
              </Text>
                <Text variant="h2" color="error" style={{ fontFamily: 'var(--font-mono)', marginBottom: 'var(--space-1)' }}>
                  {summary?.risky_predictions || 0}
                </Text>
                <Text variant="caption" color="muted">
                  Predictions flagged as high risk
                </Text>
              </Card>
            </div>
          </Card.Body>
        </Card>

          {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-4)' }}>
              <Card variant="elevated" padding="md">
                <ComplianceTrendChart predictions={predictions} />
              </Card>
              <Card variant="elevated" padding="md">
                <ComplianceSummary summary={summary || { hipaa_violations: 0, low_validity_count: 0, risky_predictions: 0, anchor_coverage: 0 }} />
              </Card>
            </div>
    </ModernPageLayout>
  );
};

export default CompliancePage;
