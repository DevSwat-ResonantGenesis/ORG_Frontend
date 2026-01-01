import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAuditLogs, AuditEntry } from '../../api/audit';
import { logger } from '../../utils/logger';
import AuditFilters from './AuditFilters';
import AuditLogsTable from './AuditLogsTable';
import MetadataModal from './MetadataModal';
import { Button, Card, Text } from '../../components/ui';
import { LogPanel, LogEntry } from '../../components/panels/LogPanel';
import { exportToCSV, exportToJSON } from '../../utils/export';
import { ModernPageLayout } from '../../components/layout/ModernPageLayout';

const ITEMS_PER_PAGE = 50;

const AuditLogsPage = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [selectedMetadata, setSelectedMetadata] = useState<Record<string, unknown> | null>(null);
  const [systemLogs, setSystemLogs] = useState<LogEntry[]>([]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAuditLogs({ page, limit: ITEMS_PER_PAGE });
      setLogs(res.items || []);

      // Convert audit entries to log entries for LogPanel
      const logEntries: LogEntry[] = (res.items || []).slice(0, 20).map((entry: AuditEntry) => ({
        id: entry.id || '',
        timestamp: entry.timestamp || new Date().toISOString(),
        level: entry.action?.includes('error') || entry.action?.includes('failed') ? 'error' : 
               entry.action?.includes('warning') ? 'warning' : 'info',
        message: `${entry.action || 'Unknown action'} by ${entry.user || 'Unknown user'}`,
        source: entry.actor_type || 'audit',
        metadata: entry.metadata
      }));
      setSystemLogs(logEntries);
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

  const headerActions = (
    <>
      <Button size="md" onClick={handleExportCSV} variant="secondary">
        Export CSV
      </Button>
      <Button size="md" onClick={handleExportJSON} variant="secondary">
        Export JSON
      </Button>
    </>
  );

  return (
    <ModernPageLayout
      title="System Audit Logs"
      subtitle="Complete audit trail of all system activities and user actions. Immutable logs with advanced verification for compliance and security. Export logs for compliance reporting and analysis."
      headerActions={headerActions}
      loading={loading}
      error={error}
      onRetry={load}
      maxWidth="xl"
    >
      {/* Filters */}
      <Card variant="outlined" padding="md">
        <Card.Body>
          <AuditFilters
            search={search}
            setSearch={setSearch}
            actionFilter={actionFilter}
            setActionFilter={setActionFilter}
          />
        </Card.Body>
      </Card>

      {/* Recent Audit Activity */}
          <Card variant="elevated" padding="md">
        <Card.Header>
          <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>
            Recent Audit Activity
          </Text>
        </Card.Header>
        <Card.Body>
          <LogPanel
            logs={systemLogs}
            title="Recent Audit Activity"
            maxHeight={400}
            autoScroll={true}
            filterable={true}
            exportable={true}
            realTime={true}
            onExport={() => handleExportJSON()}
          />
        </Card.Body>
      </Card>

      {/* Audit Logs Table */}
          <Card variant="elevated" padding="none">
        <AuditLogsTable logs={filteredLogs} onOpenMetadata={setSelectedMetadata} />
      </Card>

      {/* Pagination */}
      <div style={{ 
        display: 'flex', 
        gap: 'var(--space-3)', 
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6) 0'
      }}>
        <Button 
          variant="secondary" 
          size="md"
          disabled={page <= 1}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
        >
          Previous
        </Button>
        <Text variant="body" color="secondary" style={{ padding: '0 var(--space-3)' }}>
          Page {page}
        </Text>
        <Button 
          variant="secondary" 
          size="md"
          disabled={logs.length < ITEMS_PER_PAGE}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </Button>
      </div>

      {/* Metadata Modal */}
      {selectedMetadata && (
        <MetadataModal data={selectedMetadata} onClose={() => setSelectedMetadata(null)} />
      )}
    </ModernPageLayout>
  );
};

export default AuditLogsPage;
