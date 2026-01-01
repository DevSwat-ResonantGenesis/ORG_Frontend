import PolicyRow from './PolicyRow';
import type { Policy } from '../../types';

interface PolicyTableProps {
  items: Policy[];
  onDelete: (id: string) => void;
  onEdit: (policy: Policy) => void;
}

const PolicyTable = ({ items, onDelete, onEdit }: PolicyTableProps) => (
  <table width="100%">
    <thead>
      <tr>
        <th style={{ padding: '12px' }}>Name</th>
        <th style={{ padding: '12px' }}>Rule Type</th>
        <th style={{ padding: '12px' }}>Threshold</th>
        <th style={{ padding: '12px' }}>Active</th>
        <th style={{ padding: '12px' }}>Violations</th>
        <th style={{ padding: '12px' }}>Actions</th>
      </tr>
    </thead>
    <tbody>
      {items.map((policy) => (
        <PolicyRow key={policy.id} item={policy} onDelete={onDelete} onEdit={onEdit} />
      ))}
      {items.length === 0 && (
        <tr>
          <td colSpan={6} style={{ padding: 20, textAlign: 'center' }}>
            No policies found.
          </td>
        </tr>
      )}
    </tbody>
  </table>
);

export default PolicyTable;
