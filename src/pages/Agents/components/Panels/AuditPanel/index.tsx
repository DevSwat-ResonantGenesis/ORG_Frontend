import React, { memo, useState, useEffect, useCallback } from 'react';
import { useAgentStore } from '../../../../../stores';
import { Icons } from '../../shared/Icons';
import * as auditApi from '../../../../../api/audit';
import fastapiClient from '../../../../../api/fastapiClient';
import styles from './AuditPanel.module.css';

// Local AuditEntry type to avoid import issues
interface AuditEntry {
  id: string;
  timestamp: Date;
  action: string;
  actor: {
    userId: string;
    agentId?: string;
    ip?: string;
  };
  target: {
    type: string;
    id: string;
    name?: string;
  };
  details: Record<string, unknown>;
  result: 'success' | 'failure' | 'pending';
  metadata?: Record<string, unknown>;
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'critical';
  category: string;
  message: string;
  source: string;
  timestamp: Date;
  acknowledged: boolean;
}

interface ComplianceReport {
  id: string;
  type: string;
  name: string;
  dateRange: string;
  score: number;
  status: 'completed' | 'in_progress' | 'certified';
  certifiedBy?: string;
  findings: { severity: string; count: number }[];
}

interface ForensicCase {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'resolved';
  agent: string;
  findings: string[];
  timeline: { timestamp: Date; event: string; actor: string }[];
}

// ============== AUDIT PANEL ==============
// Contract: reads [audit, agent, execution], writes []
// Forbidden: [economy]
// Full-featured audit panel with monitoring, reports, compliance, forensics

type TabType = 'monitoring' | 'reports' | 'compliance' | 'forensics';
type FilterType = 'all' | 'agent' | 'workflow' | 'execution' | 'auth';

interface AuditPanelProps {
  className?: string;
}

const AuditPanelComponent: React.FC<AuditPanelProps> = ({ className }) => {
  const agents = useAgentStore(state => state.agents);
  const [activeTab, setActiveTab] = useState<TabType>('monitoring');
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auditEntries, setAuditEntries] = useState<auditApi.AuditEntry[]>([]);
  const [stats, setStats] = useState<auditApi.AuditStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [cases, setCases] = useState<ForensicCase[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  
  // Real data from backend - no mocks

  // Fetch real audit data
  const fetchAuditData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [logsData, statsData] = await Promise.all([
        auditApi.fetchAuditLogs({ page: currentPage, limit: 50, category: filter !== 'all' ? filter : undefined }),
        auditApi.getAuditStats(),
      ]);
      setAuditEntries(logsData.items);
      setTotalEntries(logsData.total);
      setStats(statsData);
    } catch (err: any) {
      console.error('Failed to fetch audit data:', err);
      setError(err.message || 'Failed to load audit data');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filter]);

  // Fetch alerts, reports, and cases from real backend endpoints
  useEffect(() => {
    const fetchAuditExtras = async () => {
      try {
        const [alertsRes, reportsRes, casesRes] = await Promise.allSettled([
          fastapiClient.get('/api/v1/audit/alerts'),
          fastapiClient.get('/api/v1/audit/reports'),
          fastapiClient.get('/api/v1/audit/cases'),
        ]);
        if (alertsRes.status === 'fulfilled') setAlerts(alertsRes.value.data || []);
        if (reportsRes.status === 'fulfilled') setReports(reportsRes.value.data || []);
        if (casesRes.status === 'fulfilled') setCases(casesRes.value.data || []);
      } catch (err) {
        console.error('Failed to fetch audit extras:', err);
      }
    };
    fetchAuditExtras();
  }, []);

  // Fetch audit data on mount and when filters change
  useEffect(() => {
    fetchAuditData();
  }, [fetchAuditData]);

  // Verify audit chain integrity
  const handleVerifyChain = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await auditApi.verifyAuditChain();
      alert(result.valid ? 'Audit chain is valid!' : `Audit chain verification failed: ${result.message}`);
    } catch (err: any) {
      setError(err.message || 'Failed to verify audit chain');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
  }, []);

  const resolveCase = useCallback(async (caseId: string) => {
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, status: 'resolved' } : c));
  }, []);

  // Transform API entries to display format
  const displayEntries: AuditEntry[] = (auditEntries || []).map(entry => ({
    id: entry.id || entry.entry_hash,
    timestamp: new Date(entry.timestamp || entry.created_at || Date.now()),
    action: entry.action || entry.event_type,
    actor: { 
      userId: entry.user || entry.actor_id || 'system',
      agentId: entry.actor_dsid,
    },
    target: { 
      type: entry.target_type || entry.event_category || 'unknown',
      id: entry.target_id || '',
      name: entry.target_id,
    },
    details: entry.metadata || {},
    result: entry.success ? 'success' : 'failure',
  }));

  const filteredEntries = displayEntries.filter(entry => {
    if (filter !== 'all') {
      const actionPrefix = entry.action.split('.')[0];
      if (filter === 'auth' && actionPrefix !== 'auth') return false;
      if (filter === 'agent' && actionPrefix !== 'agent') return false;
      if (filter === 'workflow' && actionPrefix !== 'workflow') return false;
      if (filter === 'execution' && actionPrefix !== 'execution') return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        entry.action.toLowerCase().includes(query) ||
        entry.target.name?.toLowerCase().includes(query) ||
        entry.actor.userId.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getActionColor = (action: string) => {
    if (action.includes('create') || action.includes('start')) return styles.success;
    if (action.includes('delete') || action.includes('fail')) return styles.error;
    if (action.includes('update') || action.includes('stop')) return styles.warning;
    return styles.info;
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'success': return <Icons.CheckCircle />;
      case 'failure': return <Icons.XCircle />;
      default: return <Icons.Clock />;
    }
  };

  const exportAuditLog = () => {
    const data = JSON.stringify(auditEntries, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getAlertTypeColor = (type: Alert['type']) => {
    switch (type) {
      case 'critical': return styles.critical;
      case 'error': return styles.error;
      case 'warning': return styles.warning;
      default: return styles.info;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return styles.completed;
      case 'certified': return styles.certified;
      case 'in_progress': return styles.inProgress;
      case 'resolved': return styles.resolved;
      case 'investigating': return styles.investigating;
      case 'open': return styles.open;
      default: return '';
    }
  };

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <div className={`${styles.panel} ${className || ''}`}>
      <div className={styles.panelHeader}>
        <h2><Icons.Audit /> Audit & Proof</h2>
        <div className={styles.tabNav}>
          {(['monitoring', 'reports', 'compliance', 'forensics'] as TabType[]).map(tab => (
            <button
              key={tab}
              className={`${styles.tabBtn} ${activeTab === tab ? styles.active : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'monitoring' && <Icons.Activity />}
              {tab === 'reports' && <Icons.BarChart />}
              {tab === 'compliance' && <Icons.ShieldCheck />}
              {tab === 'forensics' && <Icons.Search />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.panelContent}>
        {/* Monitoring Tab */}
        {activeTab === 'monitoring' && (
          <div className={styles.monitoringSection}>
            <div className={styles.sectionHeader}>
              <h3><Icons.Zap /> Real-Time Monitoring</h3>
              <span className={styles.liveBadge}><Icons.Activity /> Live</span>
            </div>

            <div className={styles.alertsSection}>
              <div className={styles.alertsHeader}>
                <h4><Icons.Alert /> Active Alerts</h4>
                <span className={styles.alertCount}>{unacknowledgedCount} unacknowledged</span>
              </div>
              <div className={styles.alertsList}>
                {alerts.map(alert => (
                  <div key={alert.id} className={`${styles.alertCard} ${getAlertTypeColor(alert.type)} ${alert.acknowledged ? styles.acknowledged : ''}`}>
                    <div className={styles.alertHeader}>
                      <span className={`${styles.alertType} ${getAlertTypeColor(alert.type)}`}>{alert.type.toUpperCase()}</span>
                      <span className={styles.alertCategory}>{alert.category}</span>
                      <span className={styles.alertTime}>{alert.timestamp.toLocaleString()}</span>
                    </div>
                    <p className={styles.alertMessage}>{alert.message}</p>
                    <div className={styles.alertFooter}>
                      <span className={styles.alertSource}><Icons.Server /> {alert.source}</span>
                      {!alert.acknowledged && (
                        <button className={styles.ackBtn} onClick={() => acknowledgeAlert(alert.id)}>
                          <Icons.Check /> Acknowledge
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className={styles.reportsSection}>
            <div className={styles.sectionHeader}>
              <h3><Icons.BarChart /> Audit Reports & Analytics</h3>
              <button className={styles.exportBtn} onClick={exportAuditLog}>
                <Icons.Download /> Export Report
              </button>
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Total Audited Actions</span>
                <span className={styles.statValue}>{stats?.total_entries?.toLocaleString() || totalEntries || 0}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Success Rate</span>
                <span className={styles.statValue}>{stats?.success_rate?.toFixed(1) || '0.0'}%</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Recent Activity</span>
                <span className={styles.statValue}>{stats?.recent_activity || 0}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Categories</span>
                <span className={styles.statValue}>{Object.keys(stats?.categories || {}).length}</span>
              </div>
            </div>

            <div className={styles.chartsRow}>
              <div className={styles.chartCard}>
                <h4>Action Distribution by Category</h4>
                <div className={styles.pieChart}>
                  {stats?.categories && Object.entries(stats.categories).length > 0 ? (
                    Object.entries(stats.categories).map(([category, count], i) => {
                      const colors = ['#0ea5e9', '#22c55e', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4'];
                      const total = Object.values(stats.categories).reduce((a, b) => a + b, 0);
                      const percent = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
                      return (
                        <div key={category} className={styles.pieItem}>
                          <span className={styles.pieDot} style={{ background: colors[i % colors.length] }} />
                          {category} ({percent}%)
                        </div>
                      );
                    })
                  ) : (
                    <div className={styles.emptyState}>No category data available</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div className={styles.complianceSection}>
            <div className={styles.sectionHeader}>
              <h3><Icons.ShieldCheck /> Compliance Reports & Certifications</h3>
              <button className={styles.newReportBtn}>
                <Icons.Plus /> New Report
              </button>
            </div>

            <div className={styles.reportsGrid}>
              {reports.map(report => (
                <div key={report.id} className={styles.reportCard}>
                  <div className={styles.reportHeader}>
                    <span className={styles.reportType}>{report.type}</span>
                    <span className={`${styles.reportStatus} ${getStatusColor(report.status)}`}>
                      {report.status === 'in_progress' ? 'In Progress' : report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                  </div>
                  <h4>{report.name}</h4>
                  <p className={styles.reportDate}><Icons.Calendar /> {report.dateRange}</p>
                  <div className={styles.scoreCircle}>
                    <span className={styles.scoreValue}>{isNaN(report.score) ? 0 : report.score}%</span>
                  </div>
                  <div className={styles.findingsTags}>
                    {report.findings.map((f, i) => (
                      <span key={i} className={`${styles.findingTag} ${styles[f.severity]}`}>
                        {f.count} {f.severity}
                      </span>
                    ))}
                  </div>
                  {report.certifiedBy && (
                    <p className={styles.certifiedBy}><Icons.ShieldCheck /> Certified by {report.certifiedBy}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Forensics Tab */}
        {activeTab === 'forensics' && (
          <div className={styles.forensicsSection}>
            <div className={styles.sectionHeader}>
              <h3><Icons.Search /> Forensic Analysis</h3>
              <button className={styles.newCaseBtn}>
                <Icons.Plus /> New Case
              </button>
            </div>

            <div className={styles.caseStats}>
              <span><strong>{cases.filter(c => c.status === 'open').length}</strong> Open</span>
              <span><strong>{cases.filter(c => c.status === 'investigating').length}</strong> Investigating</span>
              <span><strong>{cases.filter(c => c.status === 'resolved').length}</strong> Resolved</span>
            </div>

            <div className={styles.casesList}>
              {cases.map(c => (
                <div key={c.id} className={`${styles.caseCard} ${styles[c.severity]}`}>
                  <div className={styles.caseHeader}>
                    <h4>{c.title}</h4>
                    <div className={styles.caseBadges}>
                      <span className={`${styles.severityBadge} ${styles[c.severity]}`}>{c.severity.toUpperCase()}</span>
                      <span className={`${styles.statusBadge} ${getStatusColor(c.status)}`}>{c.status.toUpperCase()}</span>
                    </div>
                  </div>
                  <p className={styles.caseDesc}>{c.description}</p>
                  <p className={styles.caseAgent}><Icons.User /> {c.agent}</p>
                  <div className={styles.caseFindings}>
                    <strong>Findings:</strong>
                    <ul>
                      {c.findings.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  </div>
                  <div className={styles.caseTimeline}>
                    {c.timeline.map((t, i) => (
                      <div key={i} className={styles.timelineItem}>
                        <span className={styles.timelineDate}>{t.timestamp.toLocaleString()}</span>
                        <span className={styles.timelineEvent}>{t.event}</span>
                        <span className={styles.timelineActor}>{t.actor}</span>
                      </div>
                    ))}
                  </div>
                  {c.status !== 'resolved' && (
                    <button className={styles.resolveBtn} onClick={() => resolveCase(c.id)}>
                      <Icons.Check /> Resolve
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legacy Audit Log - shown in all tabs as collapsible */}
        {/* Filters */}
        <div className={styles.filtersBar}>
          <div className={styles.filterTabs}>
            {(['all', 'agent', 'workflow', 'execution', 'auth'] as FilterType[]).map(f => (
              <button
                key={f}
                className={`${styles.filterTab} ${filter === f ? styles.active : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search audit log..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Stats */}
        <div className={styles.statsBar}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats?.total_entries || totalEntries}</span>
            <span className={styles.statLabel}>Total Events</span>
          </div>
          <div className={styles.stat}>
            <span className={`${styles.statValue} ${styles.success}`}>
              {stats ? Math.round(stats.total_entries * (stats.success_rate || 0)) : 0}
            </span>
            <span className={styles.statLabel}>Successful</span>
          </div>
          <div className={styles.stat}>
            <span className={`${styles.statValue} ${styles.error}`}>
              {stats ? Math.round(stats.total_entries * (1 - (stats.success_rate || 0))) : 0}
            </span>
            <span className={styles.statLabel}>Failed</span>
          </div>
        </div>

        {/* Audit Log */}
        <div className={styles.auditLog}>
          {filteredEntries.map(entry => (
            <div 
              key={entry.id} 
              className={`${styles.auditEntry} ${selectedEntry?.id === entry.id ? styles.selected : ''}`}
              onClick={() => setSelectedEntry(entry)}
            >
              <div className={styles.entryMain}>
                <span className={`${styles.resultIcon} ${entry.result === 'success' ? styles.success : styles.error}`}>
                  {getResultIcon(entry.result)}
                </span>
                <span className={`${styles.actionBadge} ${getActionColor(entry.action)}`}>
                  {entry.action}
                </span>
                <span className={styles.targetName}>
                  {entry.target.name || entry.target.id}
                </span>
                <span className={styles.actor}>
                  by {entry.actor.userId}
                </span>
                <span className={styles.timestamp}>
                  {entry.timestamp.toLocaleTimeString()}
                </span>
              </div>
              {selectedEntry?.id === entry.id && (
                <div className={styles.entryDetails}>
                  <h4>Details</h4>
                  <pre>{JSON.stringify(entry.details, null, 2)}</pre>
                  {entry.metadata && (
                    <>
                      <h4>Metadata</h4>
                      <pre>{JSON.stringify(entry.metadata, null, 2)}</pre>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
          {filteredEntries.length === 0 && (
            <div className={styles.emptyState}>
              <Icons.Search />
              <p>No audit entries found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const AuditPanel = memo(AuditPanelComponent);
export default AuditPanel;
