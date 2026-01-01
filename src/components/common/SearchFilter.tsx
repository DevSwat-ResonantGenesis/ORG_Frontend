import React, { useState } from 'react';
import { SearchIcon, FilterIcon } from '../Icons/DashboardIcons';
import './SearchFilter.css';

interface SearchFilterProps {
  onSearch: (query: string) => void;
  onFilter?: (filters: Record<string, any>) => void;
  placeholder?: string;
  filters?: Array<{
    key: string;
    label: string;
    options: Array<{ value: string; label: string }>;
  }>;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  onSearch,
  onFilter,
  placeholder = 'Search...',
  filters = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...activeFilters };
    if (value === '') {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    setActiveFilters(newFilters);
    if (onFilter) {
      onFilter(newFilters);
    }
  };

  return (
    <div className="search-filter-container">
      <div className="search-input-wrapper">
        <SearchIcon size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      {filters.length > 0 && (
        <>
          <button
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
            aria-label="Toggle filters"
          >
            <FilterIcon size={18} />
            {Object.keys(activeFilters).length > 0 && (
              <span className="filter-badge">{Object.keys(activeFilters).length}</span>
            )}
          </button>
          {showFilters && (
            <div className="filter-panel">
              {filters.map((filter) => (
                <div key={filter.key} className="filter-group">
                  <label className="filter-label">{filter.label}</label>
                  <select
                    className="filter-select"
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  >
                    <option value="">All</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

