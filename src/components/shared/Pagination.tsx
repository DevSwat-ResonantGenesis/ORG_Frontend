import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  showFirstLast?: boolean;
  showPageNumbers?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CONFIG = {
  sm: {
    button: { padding: '0.25rem 0.5rem', fontSize: '0.75rem', minWidth: '28px', height: '28px' },
    iconSize: 14,
    gap: '0.25rem',
  },
  md: {
    button: { padding: '0.375rem 0.75rem', fontSize: '0.875rem', minWidth: '36px', height: '36px' },
    iconSize: 16,
    gap: '0.375rem',
  },
  lg: {
    button: { padding: '0.5rem 1rem', fontSize: '1rem', minWidth: '44px', height: '44px' },
    iconSize: 18,
    gap: '0.5rem',
  },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#ccc',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontWeight: '500',
  },
  buttonHover: {
    background: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonActive: {
    background: '#6366f1',
    borderColor: '#6366f1',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  ellipsis: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
    userSelect: 'none',
  },
};

const range = (start: number, end: number): number[] => {
  const length = end - start + 1;
  return Array.from({ length }, (_, i) => start + i);
};

const usePagination = (
  currentPage: number,
  totalPages: number,
  siblingCount: number
): (number | 'ellipsis')[] => {
  const totalPageNumbers = siblingCount * 2 + 5;

  if (totalPageNumbers >= totalPages) {
    return range(1, totalPages);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftEllipsis = leftSiblingIndex > 2;
  const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 1;

  if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = range(1, leftItemCount);
    return [...leftRange, 'ellipsis', totalPages];
  }

  if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = range(totalPages - rightItemCount + 1, totalPages);
    return [1, 'ellipsis', ...rightRange];
  }

  const middleRange = range(leftSiblingIndex, rightSiblingIndex);
  return [1, 'ellipsis', ...middleRange, 'ellipsis', totalPages];
};

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  showPageNumbers = true,
  size = 'md',
  className,
}) => {
  const [hoveredButton, setHoveredButton] = React.useState<string | null>(null);
  const sizeConfig = SIZE_CONFIG[size];
  const pages = usePagination(currentPage, totalPages, siblingCount);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const getButtonStyle = (
    key: string,
    isActive: boolean,
    isDisabled: boolean
  ): React.CSSProperties => ({
    ...styles.button,
    ...sizeConfig.button,
    ...(hoveredButton === key && !isActive && !isDisabled ? styles.buttonHover : {}),
    ...(isActive ? styles.buttonActive : {}),
    ...(isDisabled ? styles.buttonDisabled : {}),
  });

  if (totalPages <= 1) return null;

  return (
    <div style={{ ...styles.container, gap: sizeConfig.gap }} className={className}>
      {showFirstLast && (
        <button
          style={getButtonStyle('first', false, currentPage === 1)}
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          onMouseEnter={() => setHoveredButton('first')}
          onMouseLeave={() => setHoveredButton(null)}
          aria-label="First page"
        >
          <ChevronsLeft size={sizeConfig.iconSize} />
        </button>
      )}

      <button
        style={getButtonStyle('prev', false, currentPage === 1)}
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        onMouseEnter={() => setHoveredButton('prev')}
        onMouseLeave={() => setHoveredButton(null)}
        aria-label="Previous page"
      >
        <ChevronLeft size={sizeConfig.iconSize} />
      </button>

      {showPageNumbers &&
        pages.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${index}`}
                style={{ ...styles.ellipsis, ...sizeConfig.button }}
              >
                ...
              </span>
            );
          }

          const isActive = page === currentPage;
          const key = `page-${page}`;

          return (
            <button
              key={key}
              style={getButtonStyle(key, isActive, false)}
              onClick={() => handlePageChange(page)}
              onMouseEnter={() => setHoveredButton(key)}
              onMouseLeave={() => setHoveredButton(null)}
              aria-label={`Page ${page}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {page}
            </button>
          );
        })}

      <button
        style={getButtonStyle('next', false, currentPage === totalPages)}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        onMouseEnter={() => setHoveredButton('next')}
        onMouseLeave={() => setHoveredButton(null)}
        aria-label="Next page"
      >
        <ChevronRight size={sizeConfig.iconSize} />
      </button>

      {showFirstLast && (
        <button
          style={getButtonStyle('last', false, currentPage === totalPages)}
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          onMouseEnter={() => setHoveredButton('last')}
          onMouseLeave={() => setHoveredButton(null)}
          aria-label="Last page"
        >
          <ChevronsRight size={sizeConfig.iconSize} />
        </button>
      )}
    </div>
  );
};

// Simple pagination with page info
interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SimplePagination: React.FC<SimplePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  size = 'md',
  className,
}) => {
  const [hoveredButton, setHoveredButton] = React.useState<string | null>(null);
  const sizeConfig = SIZE_CONFIG[size];

  const getButtonStyle = (key: string, isDisabled: boolean): React.CSSProperties => ({
    ...styles.button,
    ...sizeConfig.button,
    ...(hoveredButton === key && !isDisabled ? styles.buttonHover : {}),
    ...(isDisabled ? styles.buttonDisabled : {}),
  });

  const startItem = totalItems ? (currentPage - 1) * (itemsPerPage || 10) + 1 : null;
  const endItem = totalItems
    ? Math.min(currentPage * (itemsPerPage || 10), totalItems)
    : null;

  if (totalPages <= 1) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}
      className={className}
    >
      {totalItems && (
        <span style={{ color: '#888', fontSize: sizeConfig.button.fontSize }}>
          Showing {startItem}-{endItem} of {totalItems}
        </span>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: sizeConfig.gap }}>
        <button
          style={getButtonStyle('prev', currentPage === 1)}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          onMouseEnter={() => setHoveredButton('prev')}
          onMouseLeave={() => setHoveredButton(null)}
        >
          <ChevronLeft size={sizeConfig.iconSize} />
          <span style={{ marginLeft: '0.25rem' }}>Previous</span>
        </button>

        <span style={{ color: '#ccc', fontSize: sizeConfig.button.fontSize }}>
          Page {currentPage} of {totalPages}
        </span>

        <button
          style={getButtonStyle('next', currentPage === totalPages)}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          onMouseEnter={() => setHoveredButton('next')}
          onMouseLeave={() => setHoveredButton(null)}
        >
          <span style={{ marginRight: '0.25rem' }}>Next</span>
          <ChevronRight size={sizeConfig.iconSize} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
