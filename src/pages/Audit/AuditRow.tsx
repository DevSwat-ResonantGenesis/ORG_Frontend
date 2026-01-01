import React from 'react';
import { AuditEntry } from '../../api/audit';

type AuditRowProps = {
  item: AuditEntry;
  onOpenMetadata: (metadata: Record<string, unknown>) => void;
};

const AuditRow = ({ item, onOpenMetadata }: AuditRowProps) => {
  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      <td style={{ padding: '12px' }}>
        <span
          style={{
            color: item.action === 'policy_triggered' ? 'var(--color-error)' : 'var(--text-primary)',
            fontWeight: 500
          }}
        >
          {item.action || 'N/A'}
        </span>
      </td>
      <td style={{ padding: '12px', fontWeight: 500 }}>{item.user || item.actor_id || 'N/A'}</td>
      <td style={{ padding: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
        {(item as any).org_id || 'N/A'}
      </td>
      <td style={{ padding: '12px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
        {(item as any).ip_address || 'N/A'}
      </td>
      <td style={{ padding: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
        {new Date(item.timestamp || item.created_at || Date.now()).toLocaleString()}
      </td>
      <td style={{ padding: '12px' }}>
        <button
          onClick={() => onOpenMetadata(item.metadata || {})}
          style={{
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            borderRadius: '6px',
            padding: '6px 10px',
            cursor: 'pointer',
            color: 'var(--text-primary)'
          }}
        >
          View
        </button>
      </td>
    </tr>
  );
};

export default AuditRow;
