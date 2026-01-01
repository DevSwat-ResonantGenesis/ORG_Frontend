import { ReactNode } from 'react';
import styles from './Table.module.css';

interface Props {
  headers: string[];
  rows: ReactNode[][];
}

export const Table = ({ headers, rows }: Props) => (
  <table className={styles.table}>
    <thead className={styles.thead}>
      <tr>
        {headers.map((header) => (
          <th key={header} className={styles.th}>
            {header}
          </th>
        ))}
      </tr>
    </thead>
    <tbody className={styles.tbody}>
      {rows.map((cells, rowIndex) => (
        <tr key={rowIndex} className={styles.tr}>
          {cells.map((cell, cellIndex) => (
            <td key={cellIndex} className={styles.td}>
              {cell}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);
