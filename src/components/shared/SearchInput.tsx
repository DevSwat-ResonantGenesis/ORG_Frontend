import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Command, ArrowRight } from 'lucide-react';

interface SearchSuggestion {
  id: string;
  label: string;
  category?: string;
  icon?: React.ReactNode;
  action?: () => void;
}

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  suggestions?: SearchSuggestion[];
  showShortcut?: boolean;
  autoFocus?: boolean;
  className?: string;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    width: '100%',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    transition: 'all 0.2s',
  },
  inputWrapperFocused: {
    borderColor: 'rgba(99, 102, 241, 0.5)',
    boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
  },
  searchIcon: {
    color: '#666',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '0.875rem',
    outline: 'none',
  },
  shortcut: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    fontSize: '0.7rem',
    color: '#888',
    flexShrink: 0,
  },
  shortcutKey: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '18px',
    height: '18px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    fontSize: '0.65rem',
  },
  clearButton: {
    background: 'transparent',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '0.5rem',
    background: '#1a1a24',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
    zIndex: 100,
    overflow: 'hidden',
  },
  suggestionsList: {
    maxHeight: '300px',
    overflowY: 'auto',
  },
  suggestionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  suggestionItemActive: {
    background: 'rgba(99, 102, 241, 0.1)',
  },
  suggestionIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#888',
    flexShrink: 0,
  },
  suggestionContent: {
    flex: 1,
    minWidth: 0,
  },
  suggestionLabel: {
    fontSize: '0.875rem',
    color: '#fff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  suggestionCategory: {
    fontSize: '0.75rem',
    color: '#666',
  },
  suggestionArrow: {
    color: '#444',
    flexShrink: 0,
  },
  noResults: {
    padding: '1.5rem',
    textAlign: 'center',
    color: '#666',
    fontSize: '0.875rem',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    fontSize: '0.7rem',
    color: '#666',
  },
  footerHint: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  footerKey: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '20px',
    height: '20px',
    padding: '0 0.25rem',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    fontSize: '0.65rem',
  },
};

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search...',
  value: controlledValue,
  onChange,
  onSearch,
  suggestions = [],
  showShortcut = true,
  autoFocus = false,
  className,
}) => {
  const [internalValue, setInternalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const filteredSuggestions = suggestions.filter(s =>
    s.label.toLowerCase().includes(value.toLowerCase())
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange?.(newValue);
    setShowDropdown(true);
    setActiveIndex(-1);
  }, [onChange]);

  const handleClear = useCallback(() => {
    setInternalValue('');
    onChange?.('');
    inputRef.current?.focus();
  }, [onChange]);

  const handleSelect = useCallback((suggestion: SearchSuggestion) => {
    if (suggestion.action) {
      suggestion.action();
    }
    setInternalValue(suggestion.label);
    onChange?.(suggestion.label);
    onSearch?.(suggestion.label);
    setShowDropdown(false);
  }, [onChange, onSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showDropdown || filteredSuggestions.length === 0) {
      if (e.key === 'Enter') {
        onSearch?.(value);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0) {
          handleSelect(filteredSuggestions[activeIndex]);
        } else {
          onSearch?.(value);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setActiveIndex(-1);
        break;
    }
  }, [showDropdown, filteredSuggestions, activeIndex, handleSelect, onSearch, value]);

  // Global Cmd+K shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setShowDropdown(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={styles.container} className={className}>
      <div
        style={{
          ...styles.inputWrapper,
          ...(isFocused ? styles.inputWrapperFocused : {}),
        }}
      >
        <Search size={18} style={styles.searchIcon} />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => {
            setIsFocused(true);
            setShowDropdown(true);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={styles.input}
          autoFocus={autoFocus}
          aria-label="Search"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
        />
        {value && (
          <button
            style={styles.clearButton}
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
        {showShortcut && !value && (
          <div style={styles.shortcut}>
            <span style={styles.shortcutKey}>
              <Command size={10} />
            </span>
            <span style={styles.shortcutKey}>K</span>
          </div>
        )}
      </div>

      {showDropdown && (value || suggestions.length > 0) && (
        <div style={styles.dropdown} role="listbox">
          <div style={styles.suggestionsList}>
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  style={{
                    ...styles.suggestionItem,
                    ...(index === activeIndex ? styles.suggestionItemActive : {}),
                  }}
                  onClick={() => handleSelect(suggestion)}
                  onMouseEnter={() => setActiveIndex(index)}
                  role="option"
                  aria-selected={index === activeIndex}
                >
                  <div style={styles.suggestionIcon}>
                    {suggestion.icon || <Search size={16} />}
                  </div>
                  <div style={styles.suggestionContent}>
                    <div style={styles.suggestionLabel}>{suggestion.label}</div>
                    {suggestion.category && (
                      <div style={styles.suggestionCategory}>{suggestion.category}</div>
                    )}
                  </div>
                  <ArrowRight size={14} style={styles.suggestionArrow} />
                </div>
              ))
            ) : value ? (
              <div style={styles.noResults}>
                No results for "{value}"
              </div>
            ) : null}
          </div>

          <div style={styles.footer}>
            <div style={styles.footerHint}>
              <span style={styles.footerKey}>↑</span>
              <span style={styles.footerKey}>↓</span>
              to navigate
            </div>
            <div style={styles.footerHint}>
              <span style={styles.footerKey}>↵</span>
              to select
            </div>
            <div style={styles.footerHint}>
              <span style={styles.footerKey}>esc</span>
              to close
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchInput;
