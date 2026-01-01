import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';
import type { Prediction } from '../../types';

interface PredictionRowProps {
  item: Prediction;
  onViewDetails?: (id: string) => void;
  isEven?: boolean;
}

const PredictionRow = ({ item, onViewDetails, isEven = false }: PredictionRowProps) => {
  const inputSummary = (item.input_text || item.input_excerpt || item.external_id || item.id || 'N/A').substring(0, 50) + '...';
  const policyHits = Array.isArray(item.policies_triggered) ? item.policies_triggered.length : 0;
  const riskScore = item.entropy || 0;
  const riskLevel = riskScore > 0.6 ? 'high' : riskScore > 0.3 ? 'medium' : 'low';
  
  return (
    <tr style={{ 
      background: isEven ? 'var(--color-bg-surface)' : 'var(--color-bg-secondary)',
      transition: 'background-color var(--transition-fast)',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'var(--color-bg-secondary)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = isEven ? 'var(--color-bg-surface)' : 'var(--color-bg-secondary)';
    }}
    onClick={() => onViewDetails ? onViewDetails(item.id) : window.location.href = `/predictions/${item.id}`}
    >
      <td style={{ padding: 'var(--space-2) var(--space-3)' }}>
        <Link 
          to={`/predictions/${item.id}`} 
          onClick={(e) => e.stopPropagation()}
          style={{ 
            color: 'var(--color-accent-primary)', 
            textDecoration: 'none', 
            fontWeight: 'var(--font-weight-medium)', 
            fontFamily: 'var(--font-family-mono)', 
            fontSize: 'var(--font-size-xs)',
            transition: 'color var(--transition-fast)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-accent-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-accent-primary)';
          }}
        >
          {item.id?.substring(0, 8)}...
        </Link>
      </td>
      <td style={{ 
        padding: 'var(--space-2) var(--space-3)',
        color: 'var(--color-text-primary)', 
        maxWidth: '300px', 
        overflow: 'hidden', 
        textOverflow: 'ellipsis', 
        whiteSpace: 'nowrap',
        fontSize: 'var(--font-size-sm)'
      }}>
        {inputSummary}
      </td>
      <td style={{ padding: 'var(--space-2) var(--space-3)', textAlign: 'right' }}>
        <span className={`badge badge-${riskLevel === 'high' ? 'danger' : riskLevel === 'medium' ? 'warning' : 'success'}`}>
          {riskScore.toFixed(3)}
        </span>
      </td>
      <td style={{ 
        padding: 'var(--space-2) var(--space-3)',
        textAlign: 'right',
        color: policyHits > 0 ? '#f59e0b' : 'var(--color-text-secondary)',
        fontSize: 'var(--font-size-sm)',
        fontFamily: 'var(--font-family-mono)'
      }}>
        {policyHits}
      </td>
      <td style={{ 
        padding: 'var(--space-2) var(--space-3)',
        textAlign: 'right',
        fontSize: 'var(--font-size-xs)',
        color: 'var(--color-text-secondary)',
        fontFamily: 'var(--font-family-mono)'
      }}>
        {new Date(item.created_at || item.timestamp || Date.now()).toLocaleString()}
      </td>
      <td style={{ padding: 'var(--space-2) var(--space-3)', textAlign: 'right' }}>
        <Button
          variant="tertiary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails ? onViewDetails(item.id) : window.location.href = `/predictions/${item.id}`;
          }}
        >
          View
        </Button>
      </td>
    </tr>
  );
};

export default PredictionRow;
