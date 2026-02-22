import React, { forwardRef } from 'react';
import { Check, Minus } from 'lucide-react';

type CheckboxSize = 'sm' | 'md' | 'lg';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  description?: string;
  size?: CheckboxSize;
  indeterminate?: boolean;
  error?: boolean;
}

const SIZE_CONFIG: Record<CheckboxSize, {
  box: string;
  iconSize: number;
  labelSize: string;
  descSize: string;
  gap: string;
}> = {
  sm: {
    box: '16px',
    iconSize: 10,
    labelSize: '0.8rem',
    descSize: '0.7rem',
    gap: '0.5rem',
  },
  md: {
    box: '20px',
    iconSize: 12,
    labelSize: '0.875rem',
    descSize: '0.75rem',
    gap: '0.625rem',
  },
  lg: {
    box: '24px',
    iconSize: 14,
    labelSize: '1rem',
    descSize: '0.875rem',
    gap: '0.75rem',
  },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'inline-flex',
    alignItems: 'flex-start',
    cursor: 'pointer',
  },
  inputWrapper: {
    position: 'relative',
    flexShrink: 0,
  },
  input: {
    position: 'absolute',
    opacity: 0,
    width: '100%',
    height: '100%',
    cursor: 'pointer',
    margin: 0,
  },
  box: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    border: '2px solid',
    transition: 'all 0.2s',
  },
  boxUnchecked: {
    background: 'transparent',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  boxChecked: {
    background: '#6366f1',
    borderColor: '#6366f1',
  },
  boxError: {
    borderColor: '#ef4444',
  },
  boxDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    color: '#fff',
    fontWeight: '500',
  },
  description: {
    color: '#888',
    marginTop: '0.125rem',
  },
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  description,
  size = 'md',
  indeterminate = false,
  error = false,
  disabled,
  checked,
  className,
  ...props
}, ref) => {
  const sizeConfig = SIZE_CONFIG[size];

  const getBoxStyle = (): React.CSSProperties => {
    let style = { ...styles.box };
    
    if (checked || indeterminate) {
      style = { ...style, ...styles.boxChecked };
    } else {
      style = { ...style, ...styles.boxUnchecked };
    }
    
    if (error) {
      style = { ...style, ...styles.boxError };
    }
    
    if (disabled) {
      style = { ...style, ...styles.boxDisabled };
    }
    
    return {
      ...style,
      width: sizeConfig.box,
      height: sizeConfig.box,
    };
  };

  return (
    <label
      style={{
        ...styles.container,
        gap: sizeConfig.gap,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      className={className}
    >
      <span style={styles.inputWrapper}>
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          style={styles.input}
          {...props}
        />
        <span style={getBoxStyle()}>
          {(checked || indeterminate) && (
            indeterminate ? (
              <Minus size={sizeConfig.iconSize} color="#fff" strokeWidth={3} />
            ) : (
              <Check size={sizeConfig.iconSize} color="#fff" strokeWidth={3} />
            )
          )}
        </span>
      </span>
      
      {(label || description) && (
        <span style={styles.content}>
          {label && (
            <span style={{ ...styles.label, fontSize: sizeConfig.labelSize }}>
              {label}
            </span>
          )}
          {description && (
            <span style={{ ...styles.description, fontSize: sizeConfig.descSize }}>
              {description}
            </span>
          )}
        </span>
      )}
    </label>
  );
});

Checkbox.displayName = 'Checkbox';

// Radio component
interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  description?: string;
  size?: CheckboxSize;
  error?: boolean;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(({
  label,
  description,
  size = 'md',
  error = false,
  disabled,
  checked,
  className,
  ...props
}, ref) => {
  const sizeConfig = SIZE_CONFIG[size];
  const dotSize = parseInt(sizeConfig.box) / 2.5;

  const getBoxStyle = (): React.CSSProperties => {
    let style: React.CSSProperties = {
      ...styles.box,
      borderRadius: '50%',
    };
    
    if (checked) {
      style = { ...style, borderColor: '#6366f1' };
    } else {
      style = { ...style, ...styles.boxUnchecked };
    }
    
    if (error) {
      style = { ...style, ...styles.boxError };
    }
    
    if (disabled) {
      style = { ...style, ...styles.boxDisabled };
    }
    
    return {
      ...style,
      width: sizeConfig.box,
      height: sizeConfig.box,
    };
  };

  return (
    <label
      style={{
        ...styles.container,
        gap: sizeConfig.gap,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      className={className}
    >
      <span style={styles.inputWrapper}>
        <input
          ref={ref}
          type="radio"
          checked={checked}
          disabled={disabled}
          style={styles.input}
          {...props}
        />
        <span style={getBoxStyle()}>
          {checked && (
            <span
              style={{
                width: `${dotSize}px`,
                height: `${dotSize}px`,
                borderRadius: '50%',
                background: '#6366f1',
              }}
            />
          )}
        </span>
      </span>
      
      {(label || description) && (
        <span style={styles.content}>
          {label && (
            <span style={{ ...styles.label, fontSize: sizeConfig.labelSize }}>
              {label}
            </span>
          )}
          {description && (
            <span style={{ ...styles.description, fontSize: sizeConfig.descSize }}>
              {description}
            </span>
          )}
        </span>
      )}
    </label>
  );
});

Radio.displayName = 'Radio';

// Radio Group
interface RadioGroupProps {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
  }>;
  size?: CheckboxSize;
  direction?: 'horizontal' | 'vertical';
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  value,
  onChange,
  options,
  size = 'md',
  direction = 'vertical',
  className,
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: direction === 'horizontal' ? 'row' : 'column',
      gap: direction === 'horizontal' ? '1.5rem' : '0.75rem',
    }}
    role="radiogroup"
    className={className}
  >
    {options.map((option) => (
      <Radio
        key={option.value}
        name={name}
        value={option.value}
        label={option.label}
        description={option.description}
        checked={value === option.value}
        disabled={option.disabled}
        size={size}
        onChange={() => onChange?.(option.value)}
      />
    ))}
  </div>
);

// Checkbox Group
interface CheckboxGroupProps {
  values?: string[];
  onChange?: (values: string[]) => void;
  options: Array<{
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
  }>;
  size?: CheckboxSize;
  direction?: 'horizontal' | 'vertical';
  className?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  values = [],
  onChange,
  options,
  size = 'md',
  direction = 'vertical',
  className,
}) => {
  const handleChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onChange?.([...values, optionValue]);
    } else {
      onChange?.(values.filter(v => v !== optionValue));
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: direction === 'horizontal' ? 'row' : 'column',
        gap: direction === 'horizontal' ? '1.5rem' : '0.75rem',
      }}
      className={className}
    >
      {options.map((option) => (
        <Checkbox
          key={option.value}
          label={option.label}
          description={option.description}
          checked={values.includes(option.value)}
          disabled={option.disabled}
          size={size}
          onChange={(e) => handleChange(option.value, e.target.checked)}
        />
      ))}
    </div>
  );
};

export default Checkbox;
