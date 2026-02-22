import React, { useState, useCallback } from 'react';
import { Search, Filter, X, ChevronDown, Calendar, SlidersHorizontal } from 'lucide-react';

type FilterType = 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'toggle';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterConfig {
  id: string;
  label: string;
  type: FilterType;
  placeholder?: string;
  options?: FilterOption[];
  defaultValue?: unknown;
}

interface ActiveFilter {
  id: string;
  value: unknown;
  label: string;
}

interface FilterBarProps {
  filters: FilterConfig[];
  onFilterChange: (filters: Record<string, unknown>) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  className?: string;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  searchWrapper: {
    position: 'relative',
    flex: 1,
    minWidth: '200px',
    maxWidth: '400px',
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
  filterButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#ccc',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  filterButtonActive: {
    background: 'rgba(99, 102, 241, 0.15)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    color: '#818cf8',
  },
  filterDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: '0.375rem',
    minWidth: '200px',
    background: '#1a1a24',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
    padding: '0.5rem',
    zIndex: 100,
  },
  filterOption: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontSize: '0.875rem',
    color: '#ccc',
  },
  filterOptionHover: {
    background: 'rgba(255, 255, 255, 0.08)',
  },
  filterOptionSelected: {
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#818cf8',
  },
  optionCount: {
    fontSize: '0.75rem',
    color: '#666',
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '0.125rem 0.375rem',
    borderRadius: '4px',
  },
  activeFilters: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  activeFilterTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.25rem 0.5rem',
    background: 'rgba(99, 102, 241, 0.15)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: '6px',
    fontSize: '0.75rem',
    color: '#818cf8',
  },
  removeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    background: 'transparent',
    border: 'none',
    borderRadius: '50%',
    color: '#818cf8',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  clearAll: {
    fontSize: '0.75rem',
    color: '#888',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
};

const FilterDropdown: React.FC<{
  filter: FilterConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  onClose: () => void;
}> = ({ filter, value, onChange, onClose }) => {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  if (filter.type === 'select' || filter.type === 'multiselect') {
    return (
      <div style={styles.filterDropdown}>
        {filter.options?.map((option) => {
          const isSelected = filter.type === 'multiselect'
            ? (value as string[] || []).includes(option.value)
            : value === option.value;

          return (
            <div
              key={option.value}
              style={{
                ...styles.filterOption,
                ...(hoveredOption === option.value ? styles.filterOptionHover : {}),
                ...(isSelected ? styles.filterOptionSelected : {}),
              }}
              onClick={() => {
                if (filter.type === 'multiselect') {
                  const current = (value as string[]) || [];
                  const newValue = isSelected
                    ? current.filter((v) => v !== option.value)
                    : [...current, option.value];
                  onChange(newValue);
                } else {
                  onChange(isSelected ? null : option.value);
                  onClose();
                }
              }}
              onMouseEnter={() => setHoveredOption(option.value)}
              onMouseLeave={() => setHoveredOption(null)}
            >
              <span>{option.label}</span>
              {option.count !== undefined && (
                <span style={styles.optionCount}>{option.count}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return null;
};

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  searchPlaceholder = 'Search...',
  showSearch = true,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, unknown>>({});
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onFilterChange({ ...filterValues, search: value });
  }, [filterValues, onFilterChange]);

  const handleFilterChange = useCallback((filterId: string, value: unknown) => {
    const newValues = { ...filterValues, [filterId]: value };
    if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
      delete newValues[filterId];
    }
    setFilterValues(newValues);
    onFilterChange({ ...newValues, search: searchQuery });
  }, [filterValues, searchQuery, onFilterChange]);

  const clearFilter = useCallback((filterId: string) => {
    const newValues = { ...filterValues };
    delete newValues[filterId];
    setFilterValues(newValues);
    onFilterChange({ ...newValues, search: searchQuery });
  }, [filterValues, searchQuery, onFilterChange]);

  const clearAll = useCallback(() => {
    setFilterValues({});
    setSearchQuery('');
    onFilterChange({});
  }, [onFilterChange]);

  const getActiveFilters = (): ActiveFilter[] => {
    const active: ActiveFilter[] = [];
    Object.entries(filterValues).forEach(([id, value]) => {
      const filter = filters.find((f) => f.id === id);
      if (!filter || value === null || value === undefined) return;

      if (Array.isArray(value)) {
        value.forEach((v) => {
          const option = filter.options?.find((o) => o.value === v);
          active.push({ id, value: v, label: `${filter.label}: ${option?.label || v}` });
        });
      } else {
        const option = filter.options?.find((o) => o.value === value);
        active.push({ id, value, label: `${filter.label}: ${option?.label || value}` });
      }
    });
    return active;
  };

  const activeFilters = getActiveFilters();
  const hasActiveFilters = activeFilters.length > 0 || searchQuery;

  return (
    <div style={styles.container} className={className}>
      <div style={styles.topRow}>
        {showSearch && (
          <div style={styles.searchWrapper}>
            <Search size={16} style={styles.searchIcon} />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={searchPlaceholder}
              style={styles.searchInput}
            />
          </div>
        )}

        {filters.map((filter) => {
          const isOpen = openFilter === filter.id;
          const hasValue = filterValues[filter.id] !== undefined;

          return (
            <div key={filter.id} style={{ position: 'relative' }}>
              <button
                style={{
                  ...styles.filterButton,
                  ...(hasValue ? styles.filterButtonActive : {}),
                }}
                onClick={() => setOpenFilter(isOpen ? null : filter.id)}
              >
                <Filter size={14} />
                {filter.label}
                <ChevronDown size={14} />
              </button>

              {isOpen && (
                <FilterDropdown
                  filter={filter}
                  value={filterValues[filter.id]}
                  onChange={(value) => handleFilterChange(filter.id, value)}
                  onClose={() => setOpenFilter(null)}
                />
              )}
            </div>
          );
        })}
      </div>

      {hasActiveFilters && (
        <div style={styles.activeFilters}>
          {activeFilters.map((filter, index) => (
            <span key={`${filter.id}-${index}`} style={styles.activeFilterTag}>
              {filter.label}
              <button
                style={styles.removeButton}
                onClick={() => {
                  const filterConfig = filters.find((f) => f.id === filter.id);
                  if (filterConfig?.type === 'multiselect') {
                    const current = (filterValues[filter.id] as string[]) || [];
                    handleFilterChange(filter.id, current.filter((v) => v !== filter.value));
                  } else {
                    clearFilter(filter.id);
                  }
                }}
              >
                <X size={12} />
              </button>
            </span>
          ))}
          <button style={styles.clearAll} onClick={clearAll}>
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
