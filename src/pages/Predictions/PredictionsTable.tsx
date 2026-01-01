import React from 'react';
import { Card } from '../../components/ui';
import PredictionRow from './PredictionRow';
import type { Prediction } from '../../types';

interface PredictionsTableProps {
  items: Prediction[];
  onViewDetails?: (id: string) => void;
}

const PredictionsTable = ({ items, onViewDetails }: PredictionsTableProps) => (
  <Card variant="elevated" padding="none">
    <div style={{ overflowX: 'auto' }}>
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse',
        fontSize: 'var(--font-size-sm)'
      }}>
        <thead>
          <tr style={{ 
            background: 'var(--color-bg-secondary)',
            borderBottom: '1px solid var(--color-border)'
          }}>
            <th style={{ 
              padding: 'var(--space-2) var(--space-3)',
              textAlign: 'left',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--font-size-sm)'
            }}>ID</th>
            <th style={{ 
              padding: 'var(--space-2) var(--space-3)',
              textAlign: 'left',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--font-size-sm)'
            }}>Input Summary</th>
            <th style={{ 
              padding: 'var(--space-2) var(--space-3)',
              textAlign: 'right',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--font-size-sm)'
            }}>Risk Score</th>
            <th style={{ 
              padding: 'var(--space-2) var(--space-3)',
              textAlign: 'right',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--font-size-sm)'
            }}>Policy Hits</th>
            <th style={{ 
              padding: 'var(--space-2) var(--space-3)',
              textAlign: 'right',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--font-size-sm)'
            }}>Timestamp</th>
            <th style={{ 
              padding: 'var(--space-2) var(--space-3)',
              textAlign: 'right',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--font-size-sm)'
            }}>View Details</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={6} style={{ 
                padding: 'var(--space-6)', 
                textAlign: 'center', 
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-sm)'
              }}>
                No predictions available.
              </td>
            </tr>
          )}
          {items.map((item, index) => {
            const isEven = index % 2 === 0;
            return (
              <PredictionRow 
                key={item.id} 
                item={item} 
                onViewDetails={onViewDetails}
                isEven={isEven}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  </Card>
);

export default PredictionsTable;
