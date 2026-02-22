import React, { useState, useRef, useCallback, useEffect } from 'react';

type SliderSize = 'sm' | 'md' | 'lg';

interface SliderProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  size?: SliderSize;
  disabled?: boolean;
  showValue?: boolean;
  showMinMax?: boolean;
  label?: string;
  formatValue?: (value: number) => string;
  marks?: Array<{ value: number; label?: string }>;
  className?: string;
}

const SIZE_CONFIG: Record<SliderSize, {
  trackHeight: string;
  thumbSize: string;
  labelSize: string;
  markSize: string;
}> = {
  sm: {
    trackHeight: '4px',
    thumbSize: '14px',
    labelSize: '0.7rem',
    markSize: '0.65rem',
  },
  md: {
    trackHeight: '6px',
    thumbSize: '18px',
    labelSize: '0.8rem',
    markSize: '0.7rem',
  },
  lg: {
    trackHeight: '8px',
    thumbSize: '22px',
    labelSize: '0.875rem',
    markSize: '0.75rem',
  },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  label: {
    color: '#ccc',
    fontWeight: '500',
  },
  value: {
    color: '#6366f1',
    fontWeight: '600',
  },
  sliderWrapper: {
    position: 'relative',
    width: '100%',
    cursor: 'pointer',
  },
  track: {
    width: '100%',
    borderRadius: '9999px',
    background: 'rgba(255, 255, 255, 0.15)',
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    borderRadius: '9999px',
    background: '#6366f1',
    transition: 'width 0.1s ease',
  },
  thumb: {
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    background: '#fff',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
    cursor: 'grab',
    transition: 'transform 0.1s ease, box-shadow 0.2s ease',
  },
  thumbActive: {
    cursor: 'grabbing',
    transform: 'translate(-50%, -50%) scale(1.1)',
    boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.3)',
  },
  thumbDisabled: {
    background: '#666',
    cursor: 'not-allowed',
  },
  minMax: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '0.25rem',
    color: '#666',
  },
  marks: {
    position: 'relative',
    width: '100%',
    marginTop: '0.5rem',
  },
  mark: {
    position: 'absolute',
    transform: 'translateX(-50%)',
    color: '#888',
    whiteSpace: 'nowrap',
  },
};

export const Slider: React.FC<SliderProps> = ({
  value: controlledValue,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  onChangeEnd,
  size = 'md',
  disabled = false,
  showValue = true,
  showMinMax = false,
  label,
  formatValue = (v) => String(v),
  marks,
  className,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const sizeConfig = SIZE_CONFIG[size];

  const getPercentage = useCallback((val: number) => {
    return ((val - min) / (max - min)) * 100;
  }, [min, max]);

  const getValueFromPosition = useCallback((clientX: number) => {
    if (!trackRef.current) return value;

    const rect = trackRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const rawValue = min + percentage * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    return Math.max(min, Math.min(max, steppedValue));
  }, [min, max, step, value]);

  const handleMove = useCallback((clientX: number) => {
    if (disabled) return;
    const newValue = getValueFromPosition(clientX);
    setInternalValue(newValue);
    onChange?.(newValue);
  }, [disabled, getValueFromPosition, onChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
    handleMove(e.clientX);
  }, [disabled, handleMove]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    setIsDragging(true);
    handleMove(e.touches[0].clientX);
  }, [disabled, handleMove]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      handleMove(e.touches[0].clientX);
    };

    const handleEnd = () => {
      setIsDragging(false);
      onChangeEnd?.(value);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, handleMove, onChangeEnd, value]);

  const percentage = getPercentage(value);

  return (
    <div style={styles.container} className={className}>
      {(label || showValue) && (
        <div style={styles.header}>
          {label && (
            <span style={{ ...styles.label, fontSize: sizeConfig.labelSize }}>
              {label}
            </span>
          )}
          {showValue && (
            <span style={{ ...styles.value, fontSize: sizeConfig.labelSize }}>
              {formatValue(value)}
            </span>
          )}
        </div>
      )}

      <div
        ref={trackRef}
        style={{
          ...styles.sliderWrapper,
          padding: `${parseInt(sizeConfig.thumbSize) / 2}px 0`,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
      >
        <div style={{ ...styles.track, height: sizeConfig.trackHeight }}>
          <div style={{ ...styles.fill, width: `${percentage}%` }} />
        </div>
        <div
          style={{
            ...styles.thumb,
            ...(isDragging ? styles.thumbActive : {}),
            ...(disabled ? styles.thumbDisabled : {}),
            width: sizeConfig.thumbSize,
            height: sizeConfig.thumbSize,
            left: `${percentage}%`,
          }}
        />
      </div>

      {showMinMax && (
        <div style={{ ...styles.minMax, fontSize: sizeConfig.markSize }}>
          <span>{formatValue(min)}</span>
          <span>{formatValue(max)}</span>
        </div>
      )}

      {marks && marks.length > 0 && (
        <div style={styles.marks}>
          {marks.map((mark) => (
            <span
              key={mark.value}
              style={{
                ...styles.mark,
                left: `${getPercentage(mark.value)}%`,
                fontSize: sizeConfig.markSize,
              }}
            >
              {mark.label || formatValue(mark.value)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// Range Slider with two thumbs
interface RangeSliderProps extends Omit<SliderProps, 'value' | 'defaultValue' | 'onChange' | 'onChangeEnd'> {
  value?: [number, number];
  defaultValue?: [number, number];
  onChange?: (value: [number, number]) => void;
  onChangeEnd?: (value: [number, number]) => void;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  value: controlledValue,
  defaultValue = [25, 75],
  min = 0,
  max = 100,
  step = 1,
  onChange,
  onChangeEnd,
  size = 'md',
  disabled = false,
  showValue = true,
  label,
  formatValue = (v) => String(v),
  className,
}) => {
  const [internalValue, setInternalValue] = useState<[number, number]>(defaultValue);
  const [activeThumb, setActiveThumb] = useState<0 | 1 | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const sizeConfig = SIZE_CONFIG[size];

  const getPercentage = useCallback((val: number) => {
    return ((val - min) / (max - min)) * 100;
  }, [min, max]);

  const getValueFromPosition = useCallback((clientX: number) => {
    if (!trackRef.current) return 0;

    const rect = trackRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const rawValue = min + percentage * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    return Math.max(min, Math.min(max, steppedValue));
  }, [min, max, step]);

  const handleMove = useCallback((clientX: number) => {
    if (disabled || activeThumb === null) return;
    
    const newValue = getValueFromPosition(clientX);
    const newRange: [number, number] = [...value] as [number, number];
    
    if (activeThumb === 0) {
      newRange[0] = Math.min(newValue, value[1] - step);
    } else {
      newRange[1] = Math.max(newValue, value[0] + step);
    }
    
    setInternalValue(newRange);
    onChange?.(newRange);
  }, [disabled, activeThumb, getValueFromPosition, value, step, onChange]);

  const handleMouseDown = useCallback((thumb: 0 | 1) => (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setActiveThumb(thumb);
  }, [disabled]);

  useEffect(() => {
    if (activeThumb === null) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX);
    };

    const handleEnd = () => {
      setActiveThumb(null);
      onChangeEnd?.(value);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
    };
  }, [activeThumb, handleMove, onChangeEnd, value]);

  const leftPercentage = getPercentage(value[0]);
  const rightPercentage = getPercentage(value[1]);

  return (
    <div style={styles.container} className={className}>
      {(label || showValue) && (
        <div style={styles.header}>
          {label && (
            <span style={{ ...styles.label, fontSize: sizeConfig.labelSize }}>
              {label}
            </span>
          )}
          {showValue && (
            <span style={{ ...styles.value, fontSize: sizeConfig.labelSize }}>
              {formatValue(value[0])} - {formatValue(value[1])}
            </span>
          )}
        </div>
      )}

      <div
        ref={trackRef}
        style={{
          ...styles.sliderWrapper,
          padding: `${parseInt(sizeConfig.thumbSize) / 2}px 0`,
          opacity: disabled ? 0.5 : 1,
        }}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-disabled={disabled}
      >
        <div style={{ ...styles.track, height: sizeConfig.trackHeight }}>
          <div
            style={{
              ...styles.fill,
              left: `${leftPercentage}%`,
              width: `${rightPercentage - leftPercentage}%`,
            }}
          />
        </div>
        
        {/* Left thumb */}
        <div
          style={{
            ...styles.thumb,
            ...(activeThumb === 0 ? styles.thumbActive : {}),
            ...(disabled ? styles.thumbDisabled : {}),
            width: sizeConfig.thumbSize,
            height: sizeConfig.thumbSize,
            left: `${leftPercentage}%`,
            zIndex: activeThumb === 0 ? 2 : 1,
          }}
          onMouseDown={handleMouseDown(0)}
        />
        
        {/* Right thumb */}
        <div
          style={{
            ...styles.thumb,
            ...(activeThumb === 1 ? styles.thumbActive : {}),
            ...(disabled ? styles.thumbDisabled : {}),
            width: sizeConfig.thumbSize,
            height: sizeConfig.thumbSize,
            left: `${rightPercentage}%`,
            zIndex: activeThumb === 1 ? 2 : 1,
          }}
          onMouseDown={handleMouseDown(1)}
        />
      </div>
    </div>
  );
};

export default Slider;
