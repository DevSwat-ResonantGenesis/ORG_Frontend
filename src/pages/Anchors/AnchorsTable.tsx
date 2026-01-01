import { Anchor } from '../../api/anchors';

interface Props {
  items: Anchor[];
  onDelete: (id: string) => Promise<any>;
  reload: () => void;
}

const AnchorsTable = ({ items, onDelete, reload }: Props) => (
  <table width="100%" cellPadding={12} style={{ background: '#fff', borderRadius: 12 }}>
    <thead>
      <tr>
        <th align="left">Word</th>
        <th align="left">Category</th>
        <th align="left">Created</th>
        <th align="left"></th>
      </tr>
    </thead>
    <tbody>
      {items.map((anchor) => (
        <tr key={anchor.id}>
          <td>{anchor.word}</td>
          <td>{anchor.category}</td>
          <td>{new Date(anchor.created_at).toLocaleString()}</td>
          <td>
            <button onClick={() => onDelete(anchor.id).then(reload)}>Delete</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default AnchorsTable;
