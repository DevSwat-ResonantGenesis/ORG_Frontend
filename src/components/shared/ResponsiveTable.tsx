import React, { useState } from 'react';
import '../ResponsiveTable.css';

interface ResponsiveTableColumn<T = unknown> {
  key: string;
  label: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  mobileLabel?: string;
  hideOnMobile?: boolean;
}

interface ResponsiveTableProps<T = unknown> {
  columns: ResponsiveTableColumn<T>[];
  data: T[];
  emptyState?: React.ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
}

export const ResponsiveTable = <T extends Record<string, unknown> = Record<string, unknown>>({
  columns,
  data,
  emptyState,
  onRowClick,
  className = '',
}: ResponsiveTableProps<T>) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Auto-switch to cards on mobile
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode('cards');
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (data.length === 0) {
    return <div className="responsive-table-empty">{emptyState || 'No data available'}</div>;
  }

  // Mobile card view
  if (isMobile || viewMode === 'cards') {
    return (
      <div className={`responsive-table-cards ${className}`}>
        {data.map((row, index) => (
          <div
            key={index}
            className={`responsive-table-card ${onRowClick ? 'clickable' : ''}`}
            onClick={() => onRowClick?.(row)}
          >
            {columns
              .filter(col => !col.hideOnMobile)
              .map((column) => {
                const value = row[column.key];
                const displayValue = column.render ? column.render(value, row) : value;
                return (
                  <div key={column.key} className="responsive-table-card-row">
                    <div className="responsive-table-card-label">
                      {column.mobileLabel || column.label}
                    </div>
                    <div className="responsive-table-card-value">{String(displayValue ?? '')}</div>
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    );
  }

  // Desktop table view
  return (
    <div className={`responsive-table-container ${className}`}>
      <div className="responsive-table-wrapper">
        <table className="responsive-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={column.hideOnMobile ? 'hide-on-mobile' : ''}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                className={onRowClick ? 'clickable' : ''}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => {
                  const value = row[column.key];
                  const displayValue = column.render ? column.render(value, row) : value;
                  return (
                    <td key={column.key} className={column.hideOnMobile ? 'hide-on-mobile' : ''}>
                      {String(displayValue ?? '')}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResponsiveTable;

