import React, { useState, useRef, useCallback } from 'react';
import { Plus, Minus, ChevronUp, ChevronDown } from 'lucide-react';

type NumberInputSize = 'sm' | 'md' | 'lg';
type NumberInputVariant = 'default' | 'stepper' | 'inline';

interface NumberInputProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  onChange?: (value: number) => void;
  onBlur?: (value: number) => void;
  size?: NumberInputSize;
  variant?: NumberInputVariant;
  label?: string;
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
  readOnly?: boolean;
  allowMouseWheel?: boolean;
  clampValueOnBlur?: boolean;
  className?: string;
}

const SIZE_CONFIG: Record<NumberInputSize, {
  height: string;
  padding: string;
  fontSize: string;
  buttonSize: string;
  iconSize: number;
  labelSize: string;
}> = {
  sm: {
    height: '32px',
    padding: '0.375rem 0.5rem',
    fontSize: '0.8125rem',
    buttonSize: '24px',
    iconSize: 12,
    labelSize: '0.75rem',
  },
  md: {
    height: '40px',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    buttonSize: '32px',
    iconSize: 14,
    labelSize: '0.8125rem',
  },
  lg: {
    height: '48px',
    padding: '0.625rem 1rem',
    fontSize: '1rem',
    buttonSize: '40px',
    iconSize: 16,
    labelSize: '0.875rem',
  },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
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
    overflow: 'hidden',
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
    textAlign: 'center',
    minWidth: '60px',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.05)',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s',
    flexShrink: 0,
  },
  buttonHover: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  stepperButtons: {
    display: 'flex',
    flexDirection: 'column',
    borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
  },
  stepperButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s',
    padding: '0 0.5rem',
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

export const NumberInput: React.FC<NumberInputProps> = ({
  value: controlledValue,
  defaultValue = 0,
  min,
  max,
  step = 1,
  precision,
  onChange,
  onBlur,
  size = 'md',
  variant = 'default',
  label,
  helperText,
  errorText,
  disabled = false,
  readOnly = false,
  allowMouseWheel = true,
  clampValueOnBlur = true,
  className,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [inputValue, setInputValue] = useState(String(defaultValue));
  const [isFocused, setIsFocused] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const sizeConfig = SIZE_CONFIG[size];

  const clampValue = useCallback((val: number): number => {
    let clamped = val;
    if (min !== undefined) clamped = Math.max(min, clamped);
    if (max !== undefined) clamped = Math.min(max, clamped);
    return clamped;
  }, [min, max]);

  const formatValue = useCallback((val: number): string => {
    if (precision !== undefined) {
      return val.toFixed(precision);
    }
    return String(val);
  }, [precision]);

  const updateValue = useCallback((newValue: number) => {
    const clamped = clampValue(newValue);
    setInternalValue(clamped);
    setInputValue(formatValue(clamped));
    onChange?.(clamped);
  }, [clampValue, formatValue, onChange]);

  const increment = useCallback(() => {
    if (disabled || readOnly) return;
    updateValue(value + step);
  }, [disabled, readOnly, value, step, updateValue]);

  const decrement = useCallback(() => {
    if (disabled || readOnly) return;
    updateValue(value - step);
  }, [disabled, readOnly, value, step, updateValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed)) {
      const finalValue = clampValueOnBlur ? clampValue(parsed) : parsed;
      setInternalValue(finalValue);
      setInputValue(formatValue(finalValue));
      onBlur?.(finalValue);
    } else {
      setInputValue(formatValue(value));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      increment();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      decrement();
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!allowMouseWheel || disabled || readOnly || !isFocused) return;
    e.preventDefault();
    if (e.deltaY < 0) {
      increment();
    } else {
      decrement();
    }
  };

  const isMinDisabled = min !== undefined && value <= min;
  const isMaxDisabled = max !== undefined && value >= max;

  const renderButtons = () => {
    if (variant === 'stepper') {
      return (
        <div style={styles.stepperButtons}>
          <button
            style={{
              ...styles.stepperButton,
              ...(hoveredButton === 'up' && !isMaxDisabled ? styles.buttonHover : {}),
              ...(isMaxDisabled ? styles.buttonDisabled : {}),
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            onClick={increment}
            disabled={disabled || isMaxDisabled}
            onMouseEnter={() => setHoveredButton('up')}
            onMouseLeave={() => setHoveredButton(null)}
            tabIndex={-1}
            aria-label="Increment"
          >
            <ChevronUp size={sizeConfig.iconSize} />
          </button>
          <button
            style={{
              ...styles.stepperButton,
              ...(hoveredButton === 'down' && !isMinDisabled ? styles.buttonHover : {}),
              ...(isMinDisabled ? styles.buttonDisabled : {}),
            }}
            onClick={decrement}
            disabled={disabled || isMinDisabled}
            onMouseEnter={() => setHoveredButton('down')}
            onMouseLeave={() => setHoveredButton(null)}
            tabIndex={-1}
            aria-label="Decrement"
          >
            <ChevronDown size={sizeConfig.iconSize} />
          </button>
        </div>
      );
    }

    return (
      <>
        <button
          style={{
            ...styles.button,
            width: sizeConfig.buttonSize,
            height: sizeConfig.height,
            ...(hoveredButton === 'minus' && !isMinDisabled ? styles.buttonHover : {}),
            ...(isMinDisabled ? styles.buttonDisabled : {}),
          }}
          onClick={decrement}
          disabled={disabled || isMinDisabled}
          onMouseEnter={() => setHoveredButton('minus')}
          onMouseLeave={() => setHoveredButton(null)}
          tabIndex={-1}
          aria-label="Decrement"
        >
          <Minus size={sizeConfig.iconSize} />
        </button>
      </>
    );
  };

  const renderPlusButton = () => {
    if (variant === 'stepper') return null;

    return (
      <button
        style={{
          ...styles.button,
          width: sizeConfig.buttonSize,
          height: sizeConfig.height,
          ...(hoveredButton === 'plus' && !isMaxDisabled ? styles.buttonHover : {}),
          ...(isMaxDisabled ? styles.buttonDisabled : {}),
        }}
        onClick={increment}
        disabled={disabled || isMaxDisabled}
        onMouseEnter={() => setHoveredButton('plus')}
        onMouseLeave={() => setHoveredButton(null)}
        tabIndex={-1}
        aria-label="Increment"
      >
        <Plus size={sizeConfig.iconSize} />
      </button>
    );
  };

  return (
    <div style={styles.container} className={className}>
      {label && (
        <label style={{ ...styles.label, fontSize: sizeConfig.labelSize }}>
          {label}
        </label>
      )}

      <div
        style={{
          ...styles.inputWrapper,
          ...(isFocused ? styles.inputWrapperFocused : {}),
          ...(errorText ? styles.inputWrapperError : {}),
          height: sizeConfig.height,
          opacity: disabled ? 0.5 : 1,
        }}
        onWheel={handleWheel}
      >
        {renderButtons()}

        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          readOnly={readOnly}
          style={{
            ...styles.input,
            padding: sizeConfig.padding,
            fontSize: sizeConfig.fontSize,
          }}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
        />

        {renderPlusButton()}
        {variant === 'stepper' && renderButtons()}
      </div>

      {errorText && <span style={styles.errorText}>{errorText}</span>}
      {helperText && !errorText && <span style={styles.helperText}>{helperText}</span>}
    </div>
  );
};

export default NumberInput;
