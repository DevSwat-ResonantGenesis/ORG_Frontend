import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check, X, Loader2 } from 'lucide-react';

type ComboboxSize = 'sm' | 'md' | 'lg';

interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange?: (value: string) => void;
  onInputChange?: (input: string) => void;
  placeholder?: string;
  size?: ComboboxSize;
  disabled?: boolean;
  loading?: boolean;
  allowCustomValue?: boolean;
  clearable?: boolean;
  label?: string;
  errorText?: string;
  helperText?: string;
  emptyMessage?: string;
  className?: string;
}

const SIZE_CONFIG: Record<ComboboxSize, {
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
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    transition: 'all 0.2s',
  },
  inputWrapperFocused: {
    borderColor: 'rgba(99, 102, 241, 0.5)',
    boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.15)',
  },
  inputWrapperError: {
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#fff',
  },
  iconButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: '4px',
    transition: 'all 0.15s',
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
    maxHeight: '240px',
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
  emptyMessage: {
    padding: '1rem',
    textAlign: 'center',
    color: '#666',
    fontSize: '0.875rem',
  },
  loadingWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
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

export const Combobox: React.FC<ComboboxProps> = ({
  options,
  value,
  onChange,
  onInputChange,
  placeholder = 'Search or select...',
  size = 'md',
  disabled = false,
  loading = false,
  allowCustomValue = false,
  clearable = true,
  label,
  errorText,
  helperText,
  emptyMessage = 'No results found',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sizeConfig = SIZE_CONFIG[size];

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(inputValue.toLowerCase()) ||
      opt.description?.toLowerCase().includes(inputValue.toLowerCase())
  );

  useEffect(() => {
    if (selectedOption && !isOpen) {
      setInputValue(selectedOption.label);
    }
  }, [selectedOption, isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        if (selectedOption) {
          setInputValue(selectedOption.label);
        } else if (!allowCustomValue) {
          setInputValue('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedOption, allowCustomValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    onInputChange?.(newValue);

    if (allowCustomValue) {
      onChange?.(newValue);
    }
  };

  const handleSelect = useCallback((option: ComboboxOption) => {
    if (option.disabled) return;
    onChange?.(option.value);
    setInputValue(option.label);
    setIsOpen(false);
  }, [onChange]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.('');
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      if (selectedOption) {
        setInputValue(selectedOption.label);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHoveredIndex((prev) =>
          prev === null || prev >= filteredOptions.length - 1 ? 0 : prev + 1
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHoveredIndex((prev) =>
        prev === null || prev <= 0 ? filteredOptions.length - 1 : prev - 1
      );
    } else if (e.key === 'Enter' && hoveredIndex !== null && filteredOptions[hoveredIndex]) {
      e.preventDefault();
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
          ...styles.inputWrapper,
          ...(isOpen ? styles.inputWrapperFocused : {}),
          ...(errorText ? styles.inputWrapperError : {}),
          height: sizeConfig.height,
          padding: sizeConfig.padding,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            ...styles.input,
            fontSize: sizeConfig.fontSize,
          }}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />

        {loading && (
          <Loader2
            size={sizeConfig.iconSize}
            style={{ color: '#888', animation: 'spin 1s linear infinite' }}
          />
        )}

        {clearable && value && !loading && (
          <button style={styles.iconButton} onClick={handleClear} aria-label="Clear">
            <X size={sizeConfig.iconSize - 2} />
          </button>
        )}

        <ChevronDown
          size={sizeConfig.iconSize}
          style={{
            color: '#888',
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
            marginLeft: '0.25rem',
          }}
        />
      </div>

      {isOpen && (
        <div style={styles.dropdown} role="listbox">
          {loading ? (
            <div style={styles.loadingWrapper}>
              <Loader2
                size={20}
                style={{ color: '#888', animation: 'spin 1s linear infinite' }}
              />
            </div>
          ) : filteredOptions.length === 0 ? (
            <div style={styles.emptyMessage}>{emptyMessage}</div>
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
      )}

      {errorText && <span style={styles.errorText}>{errorText}</span>}
      {helperText && !errorText && <span style={styles.helperText}>{helperText}</span>}
    </div>
  );
};

export default Combobox;
