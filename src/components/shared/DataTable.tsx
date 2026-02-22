import React, { useState, useMemo, useCallback } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';

type SortDirection = 'asc' | 'desc' | null;

interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  loading?: boolean;
  onRowClick?: (row: T, index: number) => void;
  selectedRowIndex?: number;
  className?: string;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  searchWrapper: {
    position: 'relative',
    maxWidth: '320px',
  },
  searchIcon: {
    position: 'absolute',
    left: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#666',
  },
  searchInput: {
    width: '100%',
    padding: '0.5rem 0.75rem 0.5rem 2.25rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.875rem',
    outline: 'none',
  },
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  thead: {
    background: 'rgba(255, 255, 255, 0.03)',
  },
  th: {
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    whiteSpace: 'nowrap',
  },
  thSortable: {
    cursor: 'pointer',
    userSelect: 'none',
  },
  thContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
  },
  tbody: {},
  tr: {
    transition: 'background 0.15s',
  },
  trHover: {
    background: 'rgba(255, 255, 255, 0.03)',
  },
  trSelected: {
    background: 'rgba(99, 102, 241, 0.1)',
  },
  trClickable: {
    cursor: 'pointer',
  },
  td: {
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    color: '#ccc',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  empty: {
    padding: '2rem',
    textAlign: 'center',
    color: '#666',
    fontSize: '0.875rem',
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 0',
  },
  pageInfo: {
    fontSize: '0.8125rem',
    color: '#888',
  },
  pageControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  pageButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#ccc',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  pageButtonDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  loadingOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

function getNestedValue<T>(obj: T, path: string): unknown {
  return path.split('.').reduce((acc: unknown, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  pageSize = 10,
  searchable = false,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No data available',
  loading = false,
  onRowClick,
  selectedRowIndex,
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null);

  const handleSort = useCallback((key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortKey(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  }, [sortKey, sortDirection]);

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;

    const query = searchQuery.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const value = getNestedValue(row, col.key as string);
        return String(value).toLowerCase().includes(query);
      })
    );
  }, [data, searchQuery, columns]);

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = getNestedValue(a, sortKey);
      const bValue = getNestedValue(b, sortKey);

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const getSortIcon = (key: string) => {
    if (sortKey !== key) return <ChevronsUpDown size={14} />;
    if (sortDirection === 'asc') return <ChevronUp size={14} />;
    return <ChevronDown size={14} />;
  };

  return (
    <div style={styles.container} className={className}>
      {searchable && (
        <div style={styles.searchWrapper}>
          <Search size={16} style={styles.searchIcon} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            style={styles.searchInput}
          />
        </div>
      )}

      <div style={{ ...styles.tableWrapper, position: 'relative' }}>
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key as string}
                  style={{
                    ...styles.th,
                    ...(col.sortable ? styles.thSortable : {}),
                    width: col.width,
                  }}
                  onClick={() => col.sortable && handleSort(col.key as string)}
                >
                  <div style={styles.thContent}>
                    {col.header}
                    {col.sortable && getSortIcon(col.key as string)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={styles.tbody}>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={styles.empty}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => {
                const actualIndex = (currentPage - 1) * pageSize + rowIndex;
                const isHovered = hoveredRowIndex === rowIndex;
                const isSelected = selectedRowIndex === actualIndex;

                return (
                  <tr
                    key={rowIndex}
                    style={{
                      ...styles.tr,
                      ...(isHovered ? styles.trHover : {}),
                      ...(isSelected ? styles.trSelected : {}),
                      ...(onRowClick ? styles.trClickable : {}),
                    }}
                    onClick={() => onRowClick?.(row, actualIndex)}
                    onMouseEnter={() => setHoveredRowIndex(rowIndex)}
                    onMouseLeave={() => setHoveredRowIndex(null)}
                  >
                    {columns.map((col) => {
                      const value = getNestedValue(row, col.key as string);
                      return (
                        <td key={col.key as string} style={styles.td}>
                          {col.render
                            ? col.render(value, row, actualIndex)
                            : String(value ?? '')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {loading && (
          <div style={styles.loadingOverlay}>
            <div style={{ color: '#fff' }}>Loading...</div>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div style={styles.pagination}>
          <span style={styles.pageInfo}>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedData.length)} of{' '}
            {sortedData.length} results
          </span>
          <div style={styles.pageControls}>
            <button
              style={{
                ...styles.pageButton,
                ...(currentPage === 1 ? styles.pageButtonDisabled : {}),
              }}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: '0.875rem', color: '#ccc' }}>
              {currentPage} / {totalPages}
            </span>
            <button
              style={{
                ...styles.pageButton,
                ...(currentPage === totalPages ? styles.pageButtonDisabled : {}),
              }}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
