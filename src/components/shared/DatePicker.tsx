import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

type DatePickerSize = 'sm' | 'md' | 'lg';

interface DatePickerProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  size?: DatePickerSize;
  disabled?: boolean;
  clearable?: boolean;
  label?: string;
  errorText?: string;
  className?: string;
}

const SIZE_CONFIG: Record<DatePickerSize, {
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

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

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
  calendar: {
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
    minWidth: '280px',
  },
  calendarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  monthYear: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: 'none',
    borderRadius: '6px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  daysHeader: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '2px',
    marginBottom: '0.5rem',
  },
  dayLabel: {
    textAlign: 'center',
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#666',
    padding: '0.25rem',
    textTransform: 'uppercase',
  },
  daysGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '2px',
  },
  dayCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
    border: 'none',
    background: 'transparent',
    color: '#ccc',
  },
  dayCellToday: {
    border: '1px solid rgba(99, 102, 241, 0.5)',
  },
  dayCellSelected: {
    background: '#6366f1',
    color: '#fff',
  },
  dayCellDisabled: {
    opacity: 0.3,
    cursor: 'not-allowed',
  },
  dayCellOtherMonth: {
    color: '#444',
  },
  errorText: {
    fontSize: '0.75rem',
    color: '#ef4444',
  },
};

const formatDate = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

const isSameDay = (a: Date, b: Date): boolean => {
  return a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();
};

const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date',
  minDate,
  maxDate,
  size = 'md',
  disabled = false,
  clearable = true,
  label,
  errorText,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value || new Date());
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sizeConfig = SIZE_CONFIG[size];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = useCallback((year: number, month: number): Date[] => {
    const days: Date[] = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Add days from previous month
    const startDay = firstDay.getDay();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Add days from next month
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  }, []);

  const isDateDisabled = useCallback((date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  }, [minDate, maxDate]);

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleSelectDate = (date: Date) => {
    if (isDateDisabled(date)) return;
    onChange?.(date);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(null);
  };

  const days = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());

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
        <Calendar size={sizeConfig.iconSize} color="#888" style={{ marginRight: '0.5rem' }} />
        <span
          style={{
            ...styles.input,
            fontSize: sizeConfig.fontSize,
            ...(value ? {} : styles.placeholder),
          }}
        >
          {value ? formatDate(value) : placeholder}
        </span>
        {clearable && value && (
          <button style={styles.iconButton} onClick={handleClear} aria-label="Clear">
            <X size={sizeConfig.iconSize - 2} />
          </button>
        )}
      </div>

      {isOpen && (
        <div style={styles.calendar}>
          <div style={styles.calendarHeader}>
            <button style={styles.navButton} onClick={handlePrevMonth}>
              <ChevronLeft size={16} />
            </button>
            <span style={styles.monthYear}>
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button style={styles.navButton} onClick={handleNextMonth}>
              <ChevronRight size={16} />
            </button>
          </div>

          <div style={styles.daysHeader}>
            {DAYS.map((day) => (
              <div key={day} style={styles.dayLabel}>{day}</div>
            ))}
          </div>

          <div style={styles.daysGrid}>
            {days.map((date, index) => {
              const isCurrentMonth = date.getMonth() === viewDate.getMonth();
              const isSelected = value && isSameDay(date, value);
              const isTodayDate = isToday(date);
              const isDisabled = isDateDisabled(date);
              const isHovered = hoveredDay === index;

              return (
                <button
                  key={index}
                  style={{
                    ...styles.dayCell,
                    ...(!isCurrentMonth ? styles.dayCellOtherMonth : {}),
                    ...(isTodayDate && !isSelected ? styles.dayCellToday : {}),
                    ...(isSelected ? styles.dayCellSelected : {}),
                    ...(isDisabled ? styles.dayCellDisabled : {}),
                    ...(isHovered && !isSelected && !isDisabled
                      ? { background: 'rgba(255, 255, 255, 0.1)' }
                      : {}),
                  }}
                  onClick={() => handleSelectDate(date)}
                  onMouseEnter={() => setHoveredDay(index)}
                  onMouseLeave={() => setHoveredDay(null)}
                  disabled={isDisabled}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {errorText && <span style={styles.errorText}>{errorText}</span>}
    </div>
  );
};

export default DatePicker;
