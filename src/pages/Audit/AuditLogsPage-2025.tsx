import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAuditLogs, AuditEntry } from '../../api/audit';
import { logger } from '../../utils/logger';
import { exportToCSV, exportToJSON } from '../../utils/export';
import layoutStyles from '../../components/layout/PageLayout-2025.module.css';
import buttonStyles from '../../components/ui/Button-2025.module.css';
import cardStyles from '../../components/ui/Card-2025.module.css';
import inputStyles from '../../components/ui/Input-2025.module.css';
import typographyStyles from '../../theme/modules/typography-2025.css';
import styles from './AuditLogsPage-2025.module.css';

const ITEMS_PER_PAGE = 50;

const AuditLogsPage = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAuditLogs({ page, limit: ITEMS_PER_PAGE });
      setLogs(res.items || []);
    } catch (err: any) {
      logger.error('Audit logs load error', err, { component: 'AuditLogsPage' });
      setError(err?.message || 'Failed to load audit logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page]);

  const filteredLogs = (logs || []).filter((log) => {
    const term = search.toLowerCase();
    const matchesSearch =
      term.length === 0 ||
      (log.user || '').toLowerCase().includes(term) ||
      (log.action || '').toLowerCase().includes(term) ||
      JSON.stringify(log.metadata || {}).toLowerCase().includes(term);

    const matchesAction = !actionFilter || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const handleExportCSV = () => {
    exportToCSV(filteredLogs, 'audit-logs');
  };

  const handleExportJSON = () => {
    exportToJSON(filteredLogs, 'audit-logs');
  };

  const totalPages = Math.ceil((logs.length || 0) / ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className={layoutStyles.page + ' ' + layoutStyles.dashboardPage}>
        <div className={layoutStyles.dashboardMain}>
          <div className={layoutStyles.dashboardContainer}>
            <div className={styles.loading}>Loading audit logs...</div>
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
              <h2 className="typography-h2">Error</h2>
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

  return (
    <div className={layoutStyles.page + ' ' + layoutStyles.dashboardPage}>
      <div className={layoutStyles.dashboardMain}>
        <div className={layoutStyles.dashboardContainer}>
          {/* Page Header */}
          <header className={styles.header}>
            <div>
              <h1 className="typography-page-title">Audit Logs</h1>
              <p className={`typography-body-small ${styles.subtitle}`}>
                View all system audit logs and activity
              </p>
            </div>
            <div className={styles.headerActions}>
              <button
                className={buttonStyles.button + ' ' + buttonStyles.buttonSecondary}
                onClick={handleExportCSV}
              >
                Export CSV
              </button>
              <button
                className={buttonStyles.button + ' ' + buttonStyles.buttonSecondary}
                onClick={handleExportJSON}
              >
                Export JSON
              </button>
            </div>
          </header>

          {/* Filters */}
          <section className={styles.filtersSection}>
            <div className={cardStyles.card}>
              <div className={styles.filters}>
                <input
                  type="text"
                  className={inputStyles.input}
                  placeholder="Search logs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ flex: 1 }}
                />
                <select
                  className={inputStyles.input + ' ' + inputStyles.select}
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                >
                  <option value="">All Actions</option>
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                  <option value="read">Read</option>
                </select>
              </div>
            </div>
          </section>

          {/* Logs Table */}
          <section className={styles.logsSection}>
            {filteredLogs.length === 0 ? (
              <div className={cardStyles.card}>
                <p className="typography-body">No audit logs found.</p>
              </div>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className="typography-label">Timestamp</th>
                      <th className="typography-label">User</th>
                      <th className="typography-label">Action</th>
                      <th className="typography-label">Resource</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="typography-body-small">
                          {new Date(log.timestamp || '').toLocaleString()}
                        </td>
                        <td className="typography-body-small">{log.user || '—'}</td>
                        <td>
                          <span className={styles.actionBadge}>{log.action || '—'}</span>
                        </td>
                        <td className="typography-body-small">
                          {(log as any).resource_type || (log as any).resource || log.action || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={buttonStyles.button + ' ' + buttonStyles.buttonSecondary + ' ' + buttonStyles.buttonSmall}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span className="typography-body-small">
                  Page {page} of {totalPages}
                </span>
                <button
                  className={buttonStyles.button + ' ' + buttonStyles.buttonSecondary + ' ' + buttonStyles.buttonSmall}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPage;

