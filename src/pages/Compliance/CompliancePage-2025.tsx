import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchComplianceSummary, generateReport } from '../../api/compliance';
import { fetchPredictions } from '../../api/predictions';
import { logger } from '../../utils/logger';
import type { Prediction, ComplianceSummary as ComplianceSummaryType } from '../../types';
import layoutStyles from '../../components/layout/PageLayout-2025.module.css';
import buttonStyles from '../../components/ui/Button-2025.module.css';
import cardStyles from '../../components/ui/Card-2025.module.css';
import typographyStyles from '../../theme/modules/typography-2025.css';
import styles from './CompliancePage-2025.module.css';

const CompliancePage = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<ComplianceSummaryType | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportMessage, setReportMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const s = await fetchComplianceSummary();
        const preds = await fetchPredictions();
        setSummary(s);
        setPredictions(preds);
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

  if (loading) {
    return (
      <div className={layoutStyles.page + ' ' + layoutStyles.dashboardPage}>
        <div className={layoutStyles.dashboardMain}>
          <div className={layoutStyles.dashboardContainer}>
            <div className={styles.loading}>Loading compliance data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={layoutStyles.page + ' ' + layoutStyles.dashboardPage}>
        <div className={layoutStyles.dashboardMain}>
          <div className={layoutStyles.dashboardContainer}>
            <div className={cardStyles.card + ' ' + styles.errorCard}>
              <h2 className="typography-section-title">Error</h2>
              <p className="typography-body">{error}</p>
              <button
                className={buttonStyles.button + ' ' + buttonStyles.buttonPrimary}
                onClick={() => window.location.reload()}
                style={{ marginTop: 'var(--space-4)' }}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const violations = predictions.filter(p => (p.policies_triggered?.length || 0) > 0);
  const complianceScore = summary?.overall_score || 0;

  return (
    <div className={layoutStyles.page + ' ' + layoutStyles.dashboardPage}>
      <div className={layoutStyles.dashboardMain}>
        <div className={layoutStyles.dashboardContainer}>
          {/* Page Header */}
          <header className={styles.header}>
            <div>
              <h1 className="typography-page-title">Compliance</h1>
              <p className={`typography-body-small ${styles.subtitle}`}>
                Monitor AI compliance and policy violations
              </p>
            </div>
            <button
              className={buttonStyles.button + ' ' + buttonStyles.buttonSecondary}
              onClick={() => handleReport('monthly')}
            >
              Export Report
            </button>
          </header>

          {reportMessage && (
            <div className={styles.message}>
              {reportMessage}
            </div>
          )}

          {/* Summary Cards */}
          <section className={styles.summarySection}>
            <div className={styles.summaryGrid}>
              <div className={cardStyles.card + ' ' + cardStyles.cardElevated}>
                <div className={styles.summaryValue}>{Math.round(complianceScore)}%</div>
                <div className="typography-label">Compliance Score</div>
              </div>
              <div className={cardStyles.card + ' ' + cardStyles.cardElevated}>
                <div className={styles.summaryValue}>{violations.length}</div>
                <div className="typography-label">Violations</div>
              </div>
              <div className={cardStyles.card + ' ' + cardStyles.cardElevated}>
                <div className={styles.summaryValue}>{predictions.length}</div>
                <div className="typography-label">Total Predictions</div>
              </div>
              <div className={cardStyles.card + ' ' + cardStyles.cardElevated}>
                <div className={styles.summaryValue}>
                  {predictions.length > 0 ? Math.round((violations.length / predictions.length) * 100) : 0}%
                </div>
                <div className="typography-label">Violation Rate</div>
              </div>
            </div>
          </section>

          {/* Violations List */}
          <section className={styles.violationsSection}>
            <h2 className="typography-section-title">Recent Violations</h2>
            {violations.length === 0 ? (
              <div className={cardStyles.card}>
                <p className="typography-body">No violations found.</p>
              </div>
            ) : (
              <div className={styles.violationsList}>
                {violations.slice(0, 10).map((prediction) => (
                  <div key={prediction.id} className={cardStyles.card}>
                    <div className={styles.violationHeader}>
                      <h3 className="typography-card-title">
                        Prediction {prediction.id?.substring(0, 8)}
                      </h3>
                      <span className={styles.violationBadge}>
                        {prediction.policies_triggered?.length || 0} policies
                      </span>
                    </div>
                    <p className={`typography-body-small ${styles.violationContent}`}>
                      {(prediction.input_text || (prediction as any).input || '').substring(0, 100)}...
                    </p>
                    <div className={styles.violationPolicies}>
                      {prediction.policies_triggered?.map((policy, idx) => (
                        <span key={idx} className={styles.policyTag}>
                          {policy}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default CompliancePage;

