import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

type SelectSize = 'sm' | 'md' | 'lg';

interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface SelectDropdownProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
  size?: SelectSize;
  disabled?: boolean;
  label?: string;
  errorText?: string;
  helperText?: string;
  className?: string;
}

const SIZE_CONFIG: Record<SelectSize, {
  height: string;
  padding: string;
  fontSize: string;
  iconSize: number;
  labelSize: string;
}> = {
  sm: {
    height: '32px',
    padding: '0.375rem 0.75rem',
    fontSize: '0.8125rem',
    iconSize: 14,
    labelSize: '0.75rem',
  },
  md: {
    height: '40px',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    iconSize: 16,
    labelSize: '0.8125rem',
  },
  lg: {
    height: '48px',
    padding: '0.625rem 1.25rem',
    fontSize: '1rem',
    iconSize: 18,
    labelSize: '0.875rem',
  },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  label: {
    color: '#ccc',
    fontWeight: '500',
  },
  trigger: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: '#fff',
  },
  triggerFocused: {
    borderColor: 'rgba(99, 102, 241, 0.5)',
    boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.15)',
  },
  triggerError: {
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  placeholder: {
    color: '#666',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '4px',
    background: '#1a1a24',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
    zIndex: 100,
    maxHeight: '280px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  searchWrapper: {
    padding: '0.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  searchInput: {
    width: '100%',
    padding: '0.5rem 0.75rem 0.5rem 2rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.8125rem',
    outline: 'none',
  },
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#666',
  },
  optionsList: {
    overflowY: 'auto',
    padding: '0.25rem',
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.625rem 0.75rem',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  optionHovered: {
    background: 'rgba(255, 255, 255, 0.05)',
  },
  optionSelected: {
    background: 'rgba(99, 102, 241, 0.15)',
  },
  optionDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  optionContent: {
    flex: 1,
    minWidth: 0,
  },
  optionLabel: {
    color: '#fff',
    fontSize: '0.875rem',
  },
  optionDescription: {
    color: '#666',
    fontSize: '0.75rem',
    marginTop: '0.125rem',
  },
  checkIcon: {
    color: '#6366f1',
    flexShrink: 0,
  },
  noResults: {
    padding: '1rem',
    textAlign: 'center',
    color: '#666',
    fontSize: '0.875rem',
  },
  clearButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.25rem',
    background: 'transparent',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'all 0.15s',
  },
  helperText: {
    fontSize: '0.75rem',
    color: '#888',
  },
  errorText: {
    fontSize: '0.75rem',
    color: '#ef4444',
  },
};

export const SelectDropdown: React.FC<SelectDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  searchable = false,
  clearable = false,
  size = 'md',
  disabled = false,
  label,
  errorText,
  helperText,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sizeConfig = SIZE_CONFIG[size];

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = searchable
    ? options.filter(
        (opt) =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          opt.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleSelect = useCallback((option: SelectOption) => {
    if (option.disabled) return;
    onChange?.(option.value);
    setIsOpen(false);
    setSearchQuery('');
  }, [onChange]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHoveredIndex((prev) =>
        prev === null || prev >= filteredOptions.length - 1 ? 0 : prev + 1
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHoveredIndex((prev) =>
        prev === null || prev <= 0 ? filteredOptions.length - 1 : prev - 1
      );
    } else if (e.key === 'Enter' && hoveredIndex !== null) {
      handleSelect(filteredOptions[hoveredIndex]);
    }
  };

  return (
    <div ref={containerRef} style={styles.container} className={className}>
      {label && (
        <label style={{ ...styles.label, fontSize: sizeConfig.labelSize }}>
          {label}
        </label>
      )}

      <div
        style={{
          ...styles.trigger,
          ...(isOpen ? styles.triggerFocused : {}),
          ...(errorText ? styles.triggerError : {}),
          height: sizeConfig.height,
          padding: sizeConfig.padding,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span
          style={{
            fontSize: sizeConfig.fontSize,
            ...(selectedOption ? {} : styles.placeholder),
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {selectedOption?.icon}
          {selectedOption?.label || placeholder}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {clearable && value && (
            <button
              style={styles.clearButton}
              onClick={handleClear}
              aria-label="Clear selection"
            >
              <X size={sizeConfig.iconSize - 2} />
            </button>
          )}
          <ChevronDown
            size={sizeConfig.iconSize}
            style={{
              color: '#888',
              transition: 'transform 0.2s',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
            }}
          />
        </div>
      </div>

      {isOpen && (
        <div style={styles.dropdown}>
          {searchable && (
            <div style={{ ...styles.searchWrapper, position: 'relative' }}>
              <Search size={14} style={styles.searchIcon} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                style={styles.searchInput}
                onKeyDown={handleKeyDown}
              />
            </div>
          )}

          <div style={styles.optionsList} role="listbox">
            {filteredOptions.length === 0 ? (
              <div style={styles.noResults}>No options found</div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = option.value === value;
                const isHovered = hoveredIndex === index;

                return (
                  <div
                    key={option.value}
                    style={{
                      ...styles.option,
                      ...(isHovered ? styles.optionHovered : {}),
                      ...(isSelected ? styles.optionSelected : {}),
                      ...(option.disabled ? styles.optionDisabled : {}),
                    }}
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    {option.icon && (
                      <span style={{ color: '#888', flexShrink: 0 }}>
                        {option.icon}
                      </span>
                    )}
                    <div style={styles.optionContent}>
                      <div style={styles.optionLabel}>{option.label}</div>
                      {option.description && (
                        <div style={styles.optionDescription}>
                          {option.description}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <Check size={16} style={styles.checkIcon} />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {errorText && <span style={styles.errorText}>{errorText}</span>}
      {helperText && !errorText && <span style={styles.helperText}>{helperText}</span>}
    </div>
  );
};

export default SelectDropdown;
