import type { Policy } from '../../types';

interface PolicyRowProps {
  item: Policy;
  onDelete: (id: string) => void;
  onEdit: (policy: Policy) => void;
}

const PolicyRow = ({ item, onDelete, onEdit }: PolicyRowProps) => (
  <tr style={{ borderBottom: '1px solid var(--border)' }}>
    <td style={{ padding: '12px', fontWeight: 500 }}>{item.name}</td>
    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{item.rule_type}</td>
    <td style={{ padding: '12px' }}>{item.threshold ?? '—'}</td>
    <td style={{ padding: '12px' }}>{item.active ? <span style={{ color: 'var(--color-success)' }}>Active</span> : <span style={{ color: 'var(--color-error)' }}>Inactive</span>}</td>
    <td style={{ padding: '12px', fontWeight: 500 }}>{item.violations}</td>
    <td style={{ padding: '12px', display: 'flex', gap: 10 }}>
      <button onClick={() => onEdit(item)} style={{ padding: '6px 10px', borderRadius: '6px', background: 'var(--color-primary-500)', color: '#fff', border: 'none', cursor: 'pointer' }}>
        Edit
      </button>
      <button onClick={() => onDelete(item.id)} style={{ padding: '6px 10px', borderRadius: '6px', background: 'var(--color-error)', color: '#fff', border: 'none', cursor: 'pointer' }}>
        Delete
      </button>
    </td>
  </tr>
);

export default PolicyRow;
