import React from 'react';
import { AuditEntry } from '../../api/audit';
import AuditRow from './AuditRow';

type AuditLogsTableProps = {
  logs: AuditEntry[];
  onOpenMetadata: (metadata: Record<string, unknown>) => void;
};

const AuditLogsTable = ({ logs, onOpenMetadata }: AuditLogsTableProps) => {
  return (
    <table
      width="100%"
      style={{
        background: 'var(--surface)',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        overflow: 'hidden'
      }}
    >
      <thead>
        <tr style={{ background: 'var(--bg-secondary)' }}>
          <th style={{ padding: '12px', textAlign: 'left' }}>Event</th>
          <th style={{ padding: '12px', textAlign: 'left' }}>User</th>
          <th style={{ padding: '12px', textAlign: 'left' }}>Org</th>
          <th style={{ padding: '12px', textAlign: 'left' }}>IP</th>
          <th style={{ padding: '12px', textAlign: 'left' }}>Timestamp</th>
          <th style={{ padding: '12px', textAlign: 'left' }}>Metadata</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log) => (
          <AuditRow key={log.id} item={log} onOpenMetadata={onOpenMetadata} />
        ))}
        {logs.length === 0 && (
          <tr>
            <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No audit logs found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default AuditLogsTable;
