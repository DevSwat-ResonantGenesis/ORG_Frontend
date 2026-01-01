import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSession } from '../../utils/auth';
import { canAccess, type Role } from '../../utils/permissions';
import logger from '../../utils/logger';
import { fetchAIAuditLogById, type AIAuditLog } from '../../api/aiAudit';
import { Button, Card, Text } from '../../components/ui';import { goToDashboard } from '../../utils/navigation';

import styles from './AIAuditLogDetailPage.module.css';

const AIAuditLogDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const session = getSession();
  const userRole = session.role as Role | null;
  
  const [log, setLog] = useState<AIAuditLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!canAccess(userRole, 'audit')) {
      goToDashboard(navigate);
      return;
    }

    if (id) {
      loadLog();
    }
  }, [id, userRole, navigate]);

  const loadLog = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const logData = await fetchAIAuditLogById(id);
      setLog(logData);
    } catch (err: unknown) {
      logger.error('Failed to load audit log', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      case 'critical': return '#DC2626';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <div className={styles.aiAuditLogDetailPage}>
        <div className={styles.container}>
          <div className={styles.loadingState}>Loading audit log...</div>
        </div>
      </div>
    );
  }

  if (!log) {
    return (
      <div className={styles.aiAuditLogDetailPage}>
        <div className={styles.container}>
          <div className={styles.errorState}>Audit log not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.aiAuditLogDetailPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>AI Audit Log Detail</h1>
          <p className={styles.subtitle}>View complete audit record with evidence verification and risk analysis</p>
          <div className={styles.headerActions}>
            <Button variant="secondary" size="md" onClick={() => navigate('/ai-audit')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
        <div className={styles.contentBody}>
          <div className={styles.contentMain}>
            {/* Summary Card */}
            <section className={styles.contentSection}>
            <Card variant="elevated" padding="md" style={{ marginBottom: 'var(--space-lg)' }}>
        <Card.Body>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
            <div>
              <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>Risk Level</Text>
              <Text variant="h3" color="primary" style={{ color: getRiskColor(log.risk_level) }}>
                {log.risk_level.toUpperCase()}
              </Text>
            </div>
            <div>
              <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>Risk Score</Text>
              <Text variant="h3" color="primary">{log.risk_score}/100</Text>
            </div>
            <div>
              <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>Safe to Use</Text>
              <Text variant="h3" color="primary" style={{ color: log.safe_to_use ? '#10B981' : '#EF4444' }}>
                {log.safe_to_use ? 'Yes' : 'No'}
              </Text>
            </div>
            <div>
              <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>PII Detected</Text>
              <Text variant="h3" color="primary" style={{ color: log.pii_detected ? '#EF4444' : '#10B981' }}>
                {log.pii_detected ? `Yes (${log.pii_types.length} types)` : 'No'}
              </Text>
            </div>
            <div>
              <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>Model</Text>
              <Text variant="body" color="primary">{log.model_name || 'N/A'}</Text>
            </div>
            <div>
              <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>Timestamp</Text>
              <Text variant="body" color="primary">
                {new Date(log.created_at).toLocaleString()}
              </Text>
            </div>
          </div>
            </Card.Body>
            </Card>
          </section>

          {/* Prompt */}
          <section className={styles.contentSection}>
            <Card variant="elevated" padding="md" style={{ marginBottom: 'var(--space-lg)' }}>
        <Card.Header>
          <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>Prompt</Text>
        </Card.Header>
        <Card.Body>
          <div className={styles.codeBlock}>
            <pre style={{ 
              padding: 'var(--space-3)', 
              background: 'var(--color-bg-root)', 
              borderRadius: 'var(--radius-md)',
              overflow: 'auto',
              fontFamily: 'var(--font-mono)',
              fontSize: '14px'
            }}>{log.prompt}</pre>
          </div>
        </Card.Body>
      </Card>

      {/* LLM Output */}
      <Card variant="elevated" padding="md" style={{ marginBottom: 'var(--space-6)' }}>
        <Card.Header>
          <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>LLM Output</Text>
        </Card.Header>
        <Card.Body>
          <div className={styles.codeBlock}>
            <pre style={{ 
              padding: 'var(--space-3)', 
              background: 'var(--color-bg-root)', 
              borderRadius: 'var(--radius-md)',
              overflow: 'auto',
              fontFamily: 'var(--font-mono)',
              fontSize: '14px'
            }}>{log.llm_output}</pre>
          </div>
        </Card.Body>
      </Card>

      {/* Risk Flags */}
      <Card variant="elevated" padding="md" style={{ marginBottom: 'var(--space-6)' }}>
        <Card.Header>
          <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>Risk Flags</Text>
        </Card.Header>
        <Card.Body>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-3)' }}>
            {log.hallucination_flags.length > 0 && (
              <Card variant="outlined" padding="md">
                <Card.Body>
                  <Text variant="h3" color="primary" style={{ marginBottom: 'var(--space-2)' }}>Hallucination Flags</Text>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {log.hallucination_flags.map((flag, idx) => (
                      <li key={idx} style={{ padding: 'var(--space-1) 0' }}>
                        <Text variant="body-sm" color="secondary">• {flag}</Text>
                      </li>
                    ))}
                  </ul>
                </Card.Body>
              </Card>
            )}
            {log.bias_flags.length > 0 && (
              <Card variant="outlined" padding="md">
                <Card.Body>
                  <Text variant="h3" color="primary" style={{ marginBottom: 'var(--space-2)' }}>Bias Flags</Text>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {log.bias_flags.map((flag, idx) => (
                      <li key={idx} style={{ padding: 'var(--space-1) 0' }}>
                        <Text variant="body-sm" color="secondary">• {flag}</Text>
                      </li>
                    ))}
                  </ul>
                </Card.Body>
              </Card>
            )}
            {log.toxicity_flags.length > 0 && (
              <Card variant="outlined" padding="md">
                <Card.Body>
                  <Text variant="h3" color="primary" style={{ marginBottom: 'var(--space-2)' }}>Toxicity Flags</Text>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {log.toxicity_flags.map((flag, idx) => (
                      <li key={idx} style={{ padding: 'var(--space-1) 0' }}>
                        <Text variant="body-sm" color="secondary">• {flag}</Text>
                      </li>
                    ))}
                  </ul>
                </Card.Body>
              </Card>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Compliance */}
      <Card variant="elevated" padding="md" style={{ marginBottom: 'var(--space-6)' }}>
        <Card.Header>
          <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>Compliance</Text>
        </Card.Header>
        <Card.Body>
          {log.compliance_flags.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {log.compliance_flags.map((flag, idx) => (
                <span key={idx} style={{
                  padding: 'var(--space-1) var(--space-2)',
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '12px',
                  fontWeight: 'var(--font-weight-medium)'
                }}>
                  {flag.replace(/_/g, ' ').toUpperCase()}
                </span>
              ))}
            </div>
          ) : (
            <Text variant="body" color="secondary">No compliance flags</Text>
          )}
          {log.pii_detected && (
            <div style={{ marginTop: 'var(--space-3)' }}>
              <Text variant="h3" color="primary" style={{ marginBottom: 'var(--space-2)' }}>PII Types Detected</Text>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {log.pii_types.map((type, idx) => (
                  <span key={idx} style={{
                    padding: 'var(--space-1) var(--space-2)',
                    background: 'var(--color-bg-error)',
                    color: 'var(--color-text-error)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '12px',
                    fontWeight: 'var(--font-weight-medium)'
                  }}>
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Evidence & Integrity */}
      <Card variant="elevated" padding="md" style={{ marginBottom: 'var(--space-6)' }}>
        <Card.Header>
          <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>Evidence & Integrity</Text>
        </Card.Header>
        <Card.Body>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-3)' }}>
            <div>
              <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>Evidence ID</Text>
              <Text variant="body" color="primary" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', marginBottom: 'var(--space-1)' }}>{log.evidence_hash}</Text>
              <Text variant="caption" color="muted">
                Verification ID of prompt + output + timestamp (tamper-proof)
              </Text>
            </div>
            {log.previous_hash && (
              <div>
                <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>Previous ID</Text>
                <Text variant="body" color="primary" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', marginBottom: 'var(--space-1)' }}>{log.previous_hash}</Text>
                <Text variant="caption" color="muted">
                  Verification ID of previous log entry (chain integrity)
                </Text>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Metadata */}
      <Card variant="elevated" padding="md">
        <Card.Header>
          <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>Metadata</Text>
        </Card.Header>
        <Card.Body>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-2)' }}>
            <div>
              <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>Session ID</Text>
              <Text variant="body" color="primary">{log.session_id || 'N/A'}</Text>
            </div>
            <div>
              <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>Request IP</Text>
              <Text variant="body" color="primary">{log.request_ip || 'N/A'}</Text>
            </div>
            <div>
              <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>User ID</Text>
              <Text variant="body" color="primary">{log.user_id || 'Anonymous'}</Text>
            </div>
            <div>
              <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)', fontWeight: 'var(--font-weight-medium)' }}>Model Version</Text>
              <Text variant="body" color="primary">{log.model_version || 'N/A'}</Text>
            </div>
          </div>
            </Card.Body>
            </Card>
          </section>
        </div>
      </div>
    </div>
    </div>
  );
};

export default AIAuditLogDetailPage;

