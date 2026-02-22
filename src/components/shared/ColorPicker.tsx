import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Pipette, X } from 'lucide-react';

type ColorPickerSize = 'sm' | 'md' | 'lg';

interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  presetColors?: string[];
  showInput?: boolean;
  showPresets?: boolean;
  size?: ColorPickerSize;
  disabled?: boolean;
  label?: string;
  className?: string;
}

const DEFAULT_PRESETS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#64748b', '#1e293b', '#ffffff',
];

const SIZE_CONFIG: Record<ColorPickerSize, {
  swatchSize: string;
  presetSize: string;
  fontSize: string;
  padding: string;
  labelSize: string;
}> = {
  sm: {
    swatchSize: '28px',
    presetSize: '20px',
    fontSize: '0.8125rem',
    padding: '0.375rem',
    labelSize: '0.75rem',
  },
  md: {
    swatchSize: '36px',
    presetSize: '24px',
    fontSize: '0.875rem',
    padding: '0.5rem',
    labelSize: '0.8125rem',
  },
  lg: {
    swatchSize: '44px',
    presetSize: '28px',
    fontSize: '1rem',
    padding: '0.625rem',
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
    gap: '0.5rem',
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
  swatch: {
    borderRadius: '6px',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    flexShrink: 0,
  },
  colorValue: {
    color: '#fff',
    fontFamily: "'JetBrains Mono', monospace",
    flex: 1,
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
    minWidth: '240px',
  },
  presets: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '0.375rem',
    marginBottom: '0.75rem',
  },
  presetSwatch: {
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    border: '2px solid transparent',
  },
  presetSwatchSelected: {
    border: '2px solid #fff',
    transform: 'scale(1.1)',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  input: {
    flex: 1,
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.875rem',
    fontFamily: "'JetBrains Mono', monospace",
    outline: 'none',
    textTransform: 'uppercase',
  },
  nativeInput: {
    width: '36px',
    height: '36px',
    padding: 0,
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    background: 'transparent',
  },
  clearButton: {
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
};

const isValidHex = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value = '#6366f1',
  onChange,
  presetColors = DEFAULT_PRESETS,
  showInput = true,
  showPresets = true,
  size = 'md',
  disabled = false,
  label,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [hoveredPreset, setHoveredPreset] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sizeConfig = SIZE_CONFIG[size];

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    if (!newValue.startsWith('#')) {
      newValue = '#' + newValue;
    }
    setInputValue(newValue);
    if (isValidHex(newValue)) {
      onChange?.(newValue);
    }
  };

  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
  };

  const handlePresetClick = (color: string) => {
    setInputValue(color);
    onChange?.(color);
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
          padding: sizeConfig.padding,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div
          style={{
            ...styles.swatch,
            width: sizeConfig.swatchSize,
            height: sizeConfig.swatchSize,
            background: value,
          }}
        />
        <span style={{ ...styles.colorValue, fontSize: sizeConfig.fontSize }}>
          {value.toUpperCase()}
        </span>
        <Pipette size={16} color="#888" />
      </div>

      {isOpen && (
        <div style={styles.dropdown}>
          {showPresets && (
            <div style={styles.presets}>
              {presetColors.map((color) => (
                <div
                  key={color}
                  style={{
                    ...styles.presetSwatch,
                    ...(value === color || hoveredPreset === color
                      ? styles.presetSwatchSelected
                      : {}),
                    width: sizeConfig.presetSize,
                    height: sizeConfig.presetSize,
                    background: color,
                  }}
                  onClick={() => handlePresetClick(color)}
                  onMouseEnter={() => setHoveredPreset(color)}
                  onMouseLeave={() => setHoveredPreset(null)}
                />
              ))}
            </div>
          )}

          {showInput && (
            <div style={styles.inputWrapper}>
              <input
                type="color"
                value={value}
                onChange={handleNativeChange}
                style={styles.nativeInput}
              />
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="#000000"
                maxLength={7}
                style={styles.input}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Simple color swatch display
interface ColorSwatchProps {
  color: string;
  size?: number;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

export const ColorSwatch: React.FC<ColorSwatchProps> = ({
  color,
  size = 24,
  onClick,
  selected = false,
  className,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '4px',
      background: color,
      border: selected ? '2px solid #fff' : '2px solid transparent',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.15s',
      boxShadow: selected ? '0 0 0 2px rgba(99, 102, 241, 0.5)' : 'none',
    }}
    onClick={onClick}
    className={className}
  />
);

// Color palette display
interface ColorPaletteProps {
  colors: string[];
  value?: string;
  onChange?: (color: string) => void;
  columns?: number;
  swatchSize?: number;
  className?: string;
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({
  colors,
  value,
  onChange,
  columns = 5,
  swatchSize = 28,
  className,
}) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: '0.375rem',
    }}
    className={className}
  >
    {colors.map((color) => (
      <ColorSwatch
        key={color}
        color={color}
        size={swatchSize}
        selected={value === color}
        onClick={() => onChange?.(color)}
      />
    ))}
  </div>
);

export default ColorPicker;
