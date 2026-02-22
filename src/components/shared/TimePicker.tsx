import React, { useState, useRef, useEffect } from 'react';
import { Clock, ChevronUp, ChevronDown, X } from 'lucide-react';

type TimePickerSize = 'sm' | 'md' | 'lg';
type TimeFormat = '12h' | '24h';

interface TimePickerProps {
  value?: string;
  onChange?: (time: string) => void;
  placeholder?: string;
  format?: TimeFormat;
  minuteStep?: number;
  size?: TimePickerSize;
  disabled?: boolean;
  clearable?: boolean;
  label?: string;
  errorText?: string;
  className?: string;
}

const SIZE_CONFIG: Record<TimePickerSize, {
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
    cursor: 'pointer',
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
    cursor: 'pointer',
  },
  placeholder: {
    color: '#666',
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
    marginTop: '4px',
    background: '#1a1a24',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
    padding: '1rem',
    zIndex: 100,
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem',
  },
  columnLabel: {
    fontSize: '0.6875rem',
    color: '#666',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  spinButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '28px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: 'none',
    borderRadius: '6px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  spinButtonHover: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
  },
  valueDisplay: {
    width: '48px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(99, 102, 241, 0.1)',
    borderRadius: '8px',
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#fff',
  },
  separator: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#666',
    padding: '0 0.25rem',
  },
  periodButton: {
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    border: 'none',
    fontSize: '0.8125rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  periodButtonActive: {
    background: '#6366f1',
    color: '#fff',
  },
  periodButtonInactive: {
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#888',
  },
  errorText: {
    fontSize: '0.75rem',
    color: '#ef4444',
  },
};

const padZero = (num: number): string => String(num).padStart(2, '0');

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select time',
  format = '12h',
  minuteStep = 1,
  size = 'md',
  disabled = false,
  clearable = true,
  label,
  errorText,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState(12);
  const [minutes, setMinutes] = useState(0);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sizeConfig = SIZE_CONFIG[size];

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':').map(Number);
      if (format === '12h') {
        setHours(h === 0 ? 12 : h > 12 ? h - 12 : h);
        setPeriod(h >= 12 ? 'PM' : 'AM');
      } else {
        setHours(h);
      }
      setMinutes(m);
    }
  }, [value, format]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTimeString = (): string => {
    let h = hours;
    if (format === '12h') {
      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
    }
    return `${padZero(h)}:${padZero(minutes)}`;
  };

  const getDisplayTime = (): string => {
    if (!value) return '';
    if (format === '12h') {
      return `${hours}:${padZero(minutes)} ${period}`;
    }
    return `${padZero(hours)}:${padZero(minutes)}`;
  };

  const incrementHours = () => {
    const maxHours = format === '12h' ? 12 : 23;
    const minHours = format === '12h' ? 1 : 0;
    setHours((h) => (h >= maxHours ? minHours : h + 1));
  };

  const decrementHours = () => {
    const maxHours = format === '12h' ? 12 : 23;
    const minHours = format === '12h' ? 1 : 0;
    setHours((h) => (h <= minHours ? maxHours : h - 1));
  };

  const incrementMinutes = () => {
    setMinutes((m) => (m >= 60 - minuteStep ? 0 : m + minuteStep));
  };

  const decrementMinutes = () => {
    setMinutes((m) => (m < minuteStep ? 60 - minuteStep : m - minuteStep));
  };

  const handleConfirm = () => {
    onChange?.(getTimeString());
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.('');
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
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <Clock size={sizeConfig.iconSize} color="#888" style={{ marginRight: '0.5rem' }} />
        <span
          style={{
            ...styles.input,
            fontSize: sizeConfig.fontSize,
            ...(value ? {} : styles.placeholder),
          }}
        >
          {value ? getDisplayTime() : placeholder}
        </span>
        {clearable && value && (
          <button style={styles.iconButton} onClick={handleClear} aria-label="Clear">
            <X size={sizeConfig.iconSize - 2} />
          </button>
        )}
      </div>

      {isOpen && (
        <div style={styles.dropdown}>
          <div style={styles.column}>
            <span style={styles.columnLabel}>Hour</span>
            <button
              style={{
                ...styles.spinButton,
                ...(hoveredButton === 'hour-up' ? styles.spinButtonHover : {}),
              }}
              onClick={incrementHours}
              onMouseEnter={() => setHoveredButton('hour-up')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <ChevronUp size={16} />
            </button>
            <div style={styles.valueDisplay}>
              {format === '12h' ? hours : padZero(hours)}
            </div>
            <button
              style={{
                ...styles.spinButton,
                ...(hoveredButton === 'hour-down' ? styles.spinButtonHover : {}),
              }}
              onClick={decrementHours}
              onMouseEnter={() => setHoveredButton('hour-down')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <ChevronDown size={16} />
            </button>
          </div>

          <span style={styles.separator}>:</span>

          <div style={styles.column}>
            <span style={styles.columnLabel}>Min</span>
            <button
              style={{
                ...styles.spinButton,
                ...(hoveredButton === 'min-up' ? styles.spinButtonHover : {}),
              }}
              onClick={incrementMinutes}
              onMouseEnter={() => setHoveredButton('min-up')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <ChevronUp size={16} />
            </button>
            <div style={styles.valueDisplay}>{padZero(minutes)}</div>
            <button
              style={{
                ...styles.spinButton,
                ...(hoveredButton === 'min-down' ? styles.spinButtonHover : {}),
              }}
              onClick={decrementMinutes}
              onMouseEnter={() => setHoveredButton('min-down')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <ChevronDown size={16} />
            </button>
          </div>

          {format === '12h' && (
            <div style={{ ...styles.column, marginLeft: '0.5rem' }}>
              <span style={styles.columnLabel}>Period</span>
              <button
                style={{
                  ...styles.periodButton,
                  ...(period === 'AM' ? styles.periodButtonActive : styles.periodButtonInactive),
                }}
                onClick={() => setPeriod('AM')}
              >
                AM
              </button>
              <button
                style={{
                  ...styles.periodButton,
                  ...(period === 'PM' ? styles.periodButtonActive : styles.periodButtonInactive),
                }}
                onClick={() => setPeriod('PM')}
              >
                PM
              </button>
            </div>
          )}

          <button
            style={{
              marginLeft: '0.5rem',
              padding: '0.5rem 1rem',
              background: '#6366f1',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontWeight: '500',
              cursor: 'pointer',
              alignSelf: 'flex-end',
            }}
            onClick={handleConfirm}
          >
            OK
          </button>
        </div>
      )}

      {errorText && <span style={styles.errorText}>{errorText}</span>}
    </div>
  );
};

export default TimePicker;
