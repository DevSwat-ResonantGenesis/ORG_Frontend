import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession } from '../../utils/auth';
import { canAccess, type Role } from '../../utils/permissions';
import logger from '../../utils/logger';
import {
  fetchAIAuditLogs,
  fetchAuditStatistics,
  verifyHashChain,
  generateComplianceBundle,
  exportAuditLogsJSON,
  exportAuditLogsCSV,
  type AIAuditLog,
  type AuditStatistics,
  type HashChainVerification,
  type ComplianceBundle,
} from '../../api/aiAudit';
import { Button, Card, Text } from '../../components/ui';
import { LogPanel, LogEntry } from '../../components/panels/LogPanel';import { goToDashboard } from '../../utils/navigation';

import styles from './AIAuditDashboardPage.module.css';

const ITEMS_PER_PAGE = 50;

const AIAuditDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const session = getSession();
  const userRole = session.role as Role | null;
  
  const [logs, setLogs] = useState<AIAuditLog[]>([]);
  const [statistics, setStatistics] = useState<AuditStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    risk_level: '',
    safe_to_use: undefined as boolean | undefined,
    pii_detected: undefined as boolean | undefined,
    model_name: '',
    search: '',
    start_date: '',
    end_date: '',
  });
  const [hashVerification, setHashVerification] = useState<HashChainVerification | null>(null);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!canAccess(userRole, 'audit')) {
      goToDashboard(navigate);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [logsData, statsData, verificationData] = await Promise.all([
        fetchAIAuditLogs({
          page,
          limit: ITEMS_PER_PAGE,
          risk_level: filters.risk_level || undefined,
          safe_to_use: filters.safe_to_use,
          pii_detected: filters.pii_detected,
          model_name: filters.model_name || undefined,
          search: filters.search || undefined,
          start_date: filters.start_date || undefined,
          end_date: filters.end_date || undefined,
        }),
        fetchAuditStatistics({
          start_date: filters.start_date || undefined,
          end_date: filters.end_date || undefined,
        }),
        verifyHashChain(100),
      ]);

      setLogs(logsData.items);
      setTotalPages(logsData.pages);
      setStatistics(statsData);
      setHashVerification(verificationData);

      // Convert to log entries for LogPanel
      const logEntries: LogEntry[] = logsData.items.slice(0, 20).map((log) => ({
        id: log.id,
        timestamp: log.created_at,
        level: log.risk_level === 'critical' ? 'error' :
               log.risk_level === 'high' ? 'warning' :
               log.safe_to_use ? 'success' : 'info',
        message: `${log.model_name || 'Unknown'} - ${log.risk_level.toUpperCase()} risk`,
        source: 'ai-audit',
        metadata: {
          prompt: log.prompt.substring(0, 100),
          safe_to_use: log.safe_to_use,
          pii_detected: log.pii_detected,
        }
      }));
    } catch (err: unknown) {
      logger.error('AI Audit dashboard load error', err);
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { status?: number; data?: { detail?: string } } }).response?.data?.detail
        : err && typeof err === 'object' && 'message' in err
        ? String((err as { message?: string }).message)
        : 'Failed to load AI audit data';
      
      // Set error state for display
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { status?: number } }).response;
        if (response?.status === 404) {
          setError('AI Audit endpoints are not available. The backend may not have these endpoints configured.');
        } else if (response?.status === 500) {
          setError('Server error loading AI audit data. Please try again later.');
        } else {
          setError(errorMessage || 'Failed to load AI audit data');
        }
      } else {
        setError(errorMessage || 'Failed to load AI audit data');
      }
    } finally {
      setLoading(false);
    }
  }, [userRole, navigate, page, filters]);

  useEffect(() => {
    if (!canAccess(userRole, 'audit')) {
      goToDashboard(navigate);
      return;
    }

    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [userRole, navigate, loadData]);

  const handleExport = async (format: 'json' | 'csv') => {
    setExporting(true);
    try {
      const exportParams = {
        risk_level: filters.risk_level || undefined,
        safe_to_use: filters.safe_to_use,
        pii_detected: filters.pii_detected,
        model_name: filters.model_name || undefined,
        search: filters.search || undefined,
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
      };
      const blob = format === 'json'
        ? await exportAuditLogsJSON(exportParams)
        : await exportAuditLogsCSV(exportParams);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai_audit_logs_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Export failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setExporting(false);
    }
  };

  const handleGenerateComplianceBundle = async (bundleType: 'gdpr' | 'hipaa' | 'general') => {
    if (!filters.start_date || !filters.end_date) {
      alert('Please select start and end dates for the compliance bundle');
      return;
    }

    try {
      const bundle = await generateComplianceBundle(
        filters.start_date,
        filters.end_date,
        bundleType
      );

      // Download as JSON
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance_bundle_${bundleType}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Compliance bundle generation failed: ${err?.message || 'Unknown error'}`);
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

  if (loading && !statistics && !error) {
    return (
      <div className={styles.aiAuditDashboardPage}>
        <div className={styles.container}>
          <div className={styles.loadingState}>Loading AI Audit Dashboard...</div>
        </div>
      </div>
    );
  }

  if (error && !statistics) {
    return (
      <div className={styles.aiAuditDashboardPage}>
        <div className={styles.container}>
          <div className={styles.errorState}>
            <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>
              AI Audit Dashboard Unavailable
            </Text>
            <Text variant="body" color="secondary" style={{ marginBottom: 'var(--space-4)' }}>
              {error}
            </Text>
            <Button onClick={() => {
              setError(null);
              loadData();
            }}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.aiAuditDashboardPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>AI Governance & Compliance Dashboard</h1>
          <p className={styles.subtitle}>
            Immutable audit trail with advanced verification. Monitor AI operations, risk assessments, and compliance violations. 
            Unique verification technology ensures tamper-proof audit logs.
          </p>
          <div className={styles.headerActions}>
            <Button
              variant="secondary"
              size="md"
              onClick={() => handleExport('json')}
              disabled={exporting}
            >
              {exporting ? 'Exporting...' : 'Export JSON'}
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => handleExport('csv')}
              disabled={exporting}
            >
              {exporting ? 'Exporting...' : 'Export CSV'}
            </Button>
          </div>
        </div>
        <div className={styles.contentBody}>
          <div className={styles.contentMain}>
            {/* Statistics Overview */}
            {statistics && (
              <section className={styles.contentSection}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
          <Card variant="outlined" padding="md">
            <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)' }}>Total Logs</Text>
            <Text variant="h2" color="primary">{statistics.total_logs.toLocaleString()}</Text>
          </Card>
          <Card variant="outlined" padding="md">
            <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)' }}>PII Detected</Text>
            <Text variant="h2" color="primary" style={{ color: statistics.pii_detected > 0 ? '#EF4444' : '#10B981' }}>
              {statistics.pii_detected.toLocaleString()}
            </Text>
          </Card>
          <Card variant="outlined" padding="md">
            <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)' }}>Unsafe Outputs</Text>
            <Text variant="h2" color="primary" style={{ color: statistics.unsafe_outputs > 0 ? '#EF4444' : '#10B981' }}>
              {statistics.unsafe_outputs.toLocaleString()}
            </Text>
          </Card>
          <Card variant="outlined" padding="md">
            <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)' }}>Compliance Violations</Text>
            <Text variant="h2" color="primary" style={{ color: statistics.compliance_violations > 0 ? '#EF4444' : '#10B981' }}>
              {statistics.compliance_violations.toLocaleString()}
            </Text>
          </Card>
        </div>
            </section>
      )}

      {/* Risk Distribution */}
      {statistics && (
        <Card variant="elevated" padding="md" style={{ marginBottom: 'var(--space-6)' }}>
          <Card.Header>
            <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>Risk Distribution</Text>
          </Card.Header>
          <Card.Body>
            <div className={styles.riskDistribution}>
            {Object.entries(statistics.risk_distribution).map(([level, count]) => (
              <div key={level} className={styles.riskBarItem}>
                <div className={styles.riskBarLabel}>
                  <span style={{ color: getRiskColor(level) }}>{level.toUpperCase()}</span>
                  <span>{count.toLocaleString()}</span>
                </div>
                <div className={styles.riskBar}>
                  <div
                    className={styles.riskBarFill}
                    style={{
                      width: `${(count / statistics.total_logs) * 100}%`,
                      backgroundColor: getRiskColor(level),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          </Card.Body>
        </Card>
      )}

      {/* Hash Chain Verification */}
      {hashVerification && (
        <Card variant="elevated" padding="md" style={{ marginBottom: 'var(--space-6)' }}>
          <Card.Header>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <Text variant="h2" color="primary">Verification Integrity</Text>
              <div
                style={{
                  backgroundColor: hashVerification.verified ? '#10B981' : '#EF4444',
                  color: 'white',
                  padding: 'var(--space-1) var(--space-2)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                {hashVerification.verified ? '✓ Verified' : '⚠ Broken'}
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            <Text variant="body" color="primary" style={{ marginBottom: 'var(--space-2)' }}>{hashVerification.message}</Text>
            <Text variant="body-sm" color="secondary">
              Checked {hashVerification.total_checked} logs
              {hashVerification.broken_links.length > 0 && (
                <span style={{ color: '#EF4444' }}>
                  {' '}• {hashVerification.broken_links.length} broken links detected
                </span>
              )}
            </Text>
          </Card.Body>
        </Card>
      )}

      {/* Filters */}
      <Card variant="elevated" padding="md" style={{ marginBottom: 'var(--space-6)' }}>
        <Card.Header>
          <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>Filters</Text>
        </Card.Header>
        <Card.Body>
        <div className={styles.filtersGrid}>
          <div className={styles.filterGroup}>
            <label>Risk Level</label>
            <select
              value={filters.risk_level}
              onChange={(e) => setFilters({ ...filters, risk_level: e.target.value })}
            >
              <option value="">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label>Safe to Use</label>
            <select
              value={filters.safe_to_use === undefined ? '' : filters.safe_to_use.toString()}
              onChange={(e) => setFilters({
                ...filters,
                safe_to_use: e.target.value === '' ? undefined : e.target.value === 'true'
              })}
            >
              <option value="">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label>PII Detected</label>
            <select
              value={filters.pii_detected === undefined ? '' : filters.pii_detected.toString()}
              onChange={(e) => setFilters({
                ...filters,
                pii_detected: e.target.value === '' ? undefined : e.target.value === 'true'
              })}
            >
              <option value="">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label>Model Name</label>
            <input
              type="text"
              value={filters.model_name}
              onChange={(e) => setFilters({ ...filters, model_name: e.target.value })}
              placeholder="e.g., gpt-4"
            />
          </div>
          <div className={styles.filterGroup}>
            <label>Start Date</label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
            />
          </div>
          <div className={styles.filterGroup}>
            <label>End Date</label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
            />
          </div>
          <div className={styles.filterGroup} style={{ gridColumn: '1 / -1' }}>
            <label>Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search in prompts and outputs..."
            />
          </div>
        </div>
        <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)' }}>
          <Button size="md" onClick={() => setFilters({
            risk_level: '',
            safe_to_use: undefined,
            pii_detected: undefined,
            model_name: '',
            search: '',
            start_date: '',
            end_date: '',
          })}>
            Clear Filters
          </Button>
        </div>
        </Card.Body>
      </Card>

      {/* Compliance Bundles */}
      <Card variant="elevated" padding="md" style={{ marginBottom: 'var(--space-6)' }}>
        <Card.Header>
          <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>Compliance Bundles</Text>
          <Text variant="body-sm" color="secondary">
            Generate compliance-ready audit bundles for GDPR, HIPAA, or general compliance reporting.
          </Text>
        </Card.Header>
        <Card.Body>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
            <Button
              variant="secondary"
              size="md"
              onClick={() => handleGenerateComplianceBundle('gdpr')}
              disabled={!filters.start_date || !filters.end_date}
            >
              Generate GDPR Bundle
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => handleGenerateComplianceBundle('hipaa')}
              disabled={!filters.start_date || !filters.end_date}
            >
              Generate HIPAA Bundle
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => handleGenerateComplianceBundle('general')}
              disabled={!filters.start_date || !filters.end_date}
            >
              Generate General Bundle
            </Button>
          </div>
          {(!filters.start_date || !filters.end_date) && (
            <Text variant="body-sm" color="secondary" style={{ fontStyle: 'italic' }}>
              Please select start and end dates to generate bundles
            </Text>
          )}
        </Card.Body>
      </Card>

      {/* Audit Logs Table */}
      <Card variant="elevated" padding="md">
        <Card.Header>
          <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>Audit Logs</Text>
        </Card.Header>
        <Card.Body>
        {loading ? (
          <div>Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className={styles.emptyState}>No audit logs found</div>
        ) : (
          <>
            <div className={styles.auditLogsTable}>
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Model</th>
                    <th>Prompt</th>
                    <th>Risk Level</th>
                    <th>Safe</th>
                    <th>PII</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td>{new Date(log.created_at).toLocaleString()}</td>
                      <td>{log.model_name || 'N/A'}</td>
                      <td className={styles.promptCell}>
                        {log.prompt.length > 100 ? `${log.prompt.substring(0, 100)}...` : log.prompt}
                      </td>
                      <td>
                        <span
                          className={styles.riskBadge}
                          style={{ backgroundColor: getRiskColor(log.risk_level) }}
                        >
                          {log.risk_level.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: log.safe_to_use ? '#10B981' : '#EF4444' }}>
                          {log.safe_to_use ? '✓' : '✗'}
                        </span>
                      </td>
                      <td>
                        {log.pii_detected ? (
                          <span style={{ color: '#EF4444' }}>⚠ {log.pii_types.length} types</span>
                        ) : (
                          <span style={{ color: '#10B981' }}>✓</span>
                        )}
                      </td>
                      <td>
                        <Button
                          variant="tertiary"
                          onClick={() => navigate(`/ai-audit/logs/${log.id}`)}
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={styles.pagination}>
              <Button
                variant="secondary"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span>Page {page} of {totalPages}</span>
              <Button
                variant="secondary"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          </>
        )}
        </Card.Body>
      </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAuditDashboardPage;

