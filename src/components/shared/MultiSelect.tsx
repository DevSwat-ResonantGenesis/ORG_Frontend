import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

type MultiSelectSize = 'sm' | 'md' | 'lg';

interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface MultiSelectProps {
  options: SelectOption[];
  value?: string[];
  onChange?: (values: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  size?: MultiSelectSize;
  disabled?: boolean;
  maxSelections?: number;
  label?: string;
  errorText?: string;
  helperText?: string;
  className?: string;
}

const SIZE_CONFIG: Record<MultiSelectSize, {
  minHeight: string;
  padding: string;
  fontSize: string;
  iconSize: number;
  labelSize: string;
  tagPadding: string;
}> = {
  sm: {
    minHeight: '32px',
    padding: '0.25rem 0.5rem',
    fontSize: '0.8125rem',
    iconSize: 14,
    labelSize: '0.75rem',
    tagPadding: '0.125rem 0.375rem',
  },
  md: {
    minHeight: '40px',
    padding: '0.375rem 0.75rem',
    fontSize: '0.875rem',
    iconSize: 16,
    labelSize: '0.8125rem',
    tagPadding: '0.25rem 0.5rem',
  },
  lg: {
    minHeight: '48px',
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    iconSize: 18,
    labelSize: '0.875rem',
    tagPadding: '0.25rem 0.625rem',
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
    flexWrap: 'wrap',
    gap: '0.375rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
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
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    background: 'rgba(99, 102, 241, 0.2)',
    color: '#818cf8',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  tagRemove: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
    padding: 0,
    opacity: 0.7,
    transition: 'opacity 0.15s',
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
    position: 'relative',
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
  checkbox: {
    width: '18px',
    height: '18px',
    borderRadius: '4px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.15s',
  },
  checkboxChecked: {
    background: '#6366f1',
    borderColor: '#6366f1',
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
  noResults: {
    padding: '1rem',
    textAlign: 'center',
    color: '#666',
    fontSize: '0.875rem',
  },
  helperText: {
    fontSize: '0.75rem',
    color: '#888',
  },
  errorText: {
    fontSize: '0.75rem',
    color: '#ef4444',
  },
  selectAll: {
    padding: '0.5rem 0.75rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  selectAllButton: {
    background: 'transparent',
    border: 'none',
    color: '#6366f1',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    transition: 'all 0.15s',
  },
};

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value = [],
  onChange,
  placeholder = 'Select options',
  searchable = false,
  size = 'md',
  disabled = false,
  maxSelections,
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

  const selectedOptions = options.filter((opt) => value.includes(opt.value));

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

  const toggleOption = useCallback((optionValue: string) => {
    const option = options.find((o) => o.value === optionValue);
    if (option?.disabled) return;

    let newValues: string[];
    if (value.includes(optionValue)) {
      newValues = value.filter((v) => v !== optionValue);
    } else {
      if (maxSelections && value.length >= maxSelections) return;
      newValues = [...value, optionValue];
    }
    onChange?.(newValues);
  }, [value, onChange, options, maxSelections]);

  const removeOption = (e: React.MouseEvent, optionValue: string) => {
    e.stopPropagation();
    onChange?.(value.filter((v) => v !== optionValue));
  };

  const selectAll = () => {
    const selectableOptions = options.filter((o) => !o.disabled).map((o) => o.value);
    if (maxSelections) {
      onChange?.(selectableOptions.slice(0, maxSelections));
    } else {
      onChange?.(selectableOptions);
    }
  };

  const clearAll = () => {
    onChange?.([]);
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
          minHeight: sizeConfig.minHeight,
          padding: sizeConfig.padding,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {selectedOptions.length === 0 ? (
          <span style={{ ...styles.placeholder, fontSize: sizeConfig.fontSize }}>
            {placeholder}
          </span>
        ) : (
          selectedOptions.map((opt) => (
            <span
              key={opt.value}
              style={{ ...styles.tag, padding: sizeConfig.tagPadding }}
            >
              {opt.label}
              <button
                style={styles.tagRemove}
                onClick={(e) => removeOption(e, opt.value)}
                aria-label={`Remove ${opt.label}`}
              >
                <X size={12} />
              </button>
            </span>
          ))
        )}

        <ChevronDown
          size={sizeConfig.iconSize}
          style={{
            marginLeft: 'auto',
            color: '#888',
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
            flexShrink: 0,
          }}
        />
      </div>

      {isOpen && (
        <div style={styles.dropdown}>
          {searchable && (
            <div style={styles.searchWrapper}>
              <Search size={14} style={styles.searchIcon} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                style={styles.searchInput}
              />
            </div>
          )}

          <div style={styles.selectAll}>
            <button style={styles.selectAllButton} onClick={selectAll}>
              Select All
            </button>
            <button style={styles.selectAllButton} onClick={clearAll}>
              Clear All
            </button>
            <span style={{ marginLeft: 'auto', color: '#666', fontSize: '0.75rem' }}>
              {value.length} selected
              {maxSelections && ` / ${maxSelections} max`}
            </span>
          </div>

          <div style={styles.optionsList} role="listbox">
            {filteredOptions.length === 0 ? (
              <div style={styles.noResults}>No options found</div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = value.includes(option.value);
                const isHovered = hoveredIndex === index;
                const isMaxReached = maxSelections && value.length >= maxSelections && !isSelected;

                return (
                  <div
                    key={option.value}
                    style={{
                      ...styles.option,
                      ...(isHovered ? styles.optionHovered : {}),
                      ...(isSelected ? styles.optionSelected : {}),
                      ...(option.disabled || isMaxReached ? styles.optionDisabled : {}),
                    }}
                    onClick={() => toggleOption(option.value)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div
                      style={{
                        ...styles.checkbox,
                        ...(isSelected ? styles.checkboxChecked : {}),
                      }}
                    >
                      {isSelected && <Check size={12} color="#fff" />}
                    </div>
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

export default MultiSelect;
