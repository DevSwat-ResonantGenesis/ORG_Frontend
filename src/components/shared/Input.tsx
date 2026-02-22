import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle, Info } from 'lucide-react';

type InputSize = 'sm' | 'md' | 'lg';
type InputVariant = 'default' | 'filled' | 'flushed';
type InputState = 'default' | 'error' | 'success' | 'warning';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  errorText?: string;
  successText?: string;
  size?: InputSize;
  variant?: InputVariant;
  state?: InputState;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  fullWidth?: boolean;
}

const SIZE_STYLES: Record<InputSize, {
  padding: string;
  fontSize: string;
  height: string;
  iconSize: number;
  labelSize: string;
}> = {
  sm: {
    padding: '0.5rem 0.75rem',
    fontSize: '0.8rem',
    height: '36px',
    iconSize: 14,
    labelSize: '0.7rem',
  },
  md: {
    padding: '0.625rem 1rem',
    fontSize: '0.875rem',
    height: '44px',
    iconSize: 16,
    labelSize: '0.8rem',
  },
  lg: {
    padding: '0.75rem 1.25rem',
    fontSize: '1rem',
    height: '52px',
    iconSize: 18,
    labelSize: '0.875rem',
  },
};

const STATE_COLORS: Record<InputState, {
  border: string;
  focusBorder: string;
  text: string;
  icon: React.ReactNode;
}> = {
  default: {
    border: 'rgba(255, 255, 255, 0.15)',
    focusBorder: 'rgba(99, 102, 241, 0.5)',
    text: '#888',
    icon: null,
  },
  error: {
    border: 'rgba(239, 68, 68, 0.5)',
    focusBorder: 'rgba(239, 68, 68, 0.7)',
    text: '#ef4444',
    icon: <AlertCircle size={14} />,
  },
  success: {
    border: 'rgba(16, 185, 129, 0.5)',
    focusBorder: 'rgba(16, 185, 129, 0.7)',
    text: '#10b981',
    icon: <CheckCircle size={14} />,
  },
  warning: {
    border: 'rgba(245, 158, 11, 0.5)',
    focusBorder: 'rgba(245, 158, 11, 0.7)',
    text: '#f59e0b',
    icon: <Info size={14} />,
  },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  label: {
    fontWeight: '500',
    color: '#ccc',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid',
    borderRadius: '8px',
    color: '#fff',
    outline: 'none',
    transition: 'all 0.2s',
  },
  inputFilled: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid transparent',
  },
  inputFlushed: {
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid',
    borderRadius: '0',
    paddingLeft: '0',
    paddingRight: '0',
  },
  icon: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
    pointerEvents: 'none',
  },
  iconClickable: {
    pointerEvents: 'auto',
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    padding: '0.25rem',
    borderRadius: '4px',
    transition: 'all 0.2s',
  },
  helperText: {
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
};

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  helperText,
  errorText,
  successText,
  size = 'md',
  variant = 'default',
  state = 'default',
  leftIcon,
  rightIcon,
  showPasswordToggle = false,
  fullWidth = true,
  type = 'text',
  disabled,
  className,
  style,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const sizeStyles = SIZE_STYLES[size];
  const stateColors = STATE_COLORS[state];

  const actualType = type === 'password' && showPassword ? 'text' : type;

  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'filled':
        return styles.inputFilled;
      case 'flushed':
        return styles.inputFlushed;
      default:
        return {};
    }
  };

  const inputPadding = {
    paddingLeft: leftIcon ? `calc(${sizeStyles.padding.split(' ')[1]} + ${sizeStyles.iconSize + 8}px)` : sizeStyles.padding.split(' ')[1],
    paddingRight: (rightIcon || showPasswordToggle) ? `calc(${sizeStyles.padding.split(' ')[1]} + ${sizeStyles.iconSize + 8}px)` : sizeStyles.padding.split(' ')[1],
    paddingTop: sizeStyles.padding.split(' ')[0],
    paddingBottom: sizeStyles.padding.split(' ')[0],
  };

  const displayText = errorText || successText || helperText;
  const displayState = errorText ? 'error' : successText ? 'success' : state;
  const displayColors = STATE_COLORS[displayState];

  return (
    <div
      style={{
        ...styles.container,
        width: fullWidth ? '100%' : 'auto',
      }}
      className={className}
    >
      {label && (
        <label style={{ ...styles.label, fontSize: sizeStyles.labelSize }}>
          {label}
        </label>
      )}

      <div style={styles.inputWrapper}>
        {leftIcon && (
          <span
            style={{
              ...styles.icon,
              left: sizeStyles.padding.split(' ')[1],
            }}
          >
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          type={actualType}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            ...styles.input,
            ...getVariantStyles(),
            ...inputPadding,
            fontSize: sizeStyles.fontSize,
            minHeight: sizeStyles.height,
            borderColor: isFocused ? displayColors.focusBorder : displayColors.border,
            boxShadow: isFocused ? `0 0 0 3px ${displayColors.focusBorder}33` : 'none',
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? 'not-allowed' : 'text',
            ...style,
          }}
          {...props}
        />

        {(rightIcon || showPasswordToggle) && (
          <span
            style={{
              ...styles.icon,
              right: sizeStyles.padding.split(' ')[1],
            }}
          >
            {showPasswordToggle && type === 'password' ? (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.iconClickable as React.CSSProperties}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff size={sizeStyles.iconSize} />
                ) : (
                  <Eye size={sizeStyles.iconSize} />
                )}
              </button>
            ) : (
              rightIcon
            )}
          </span>
        )}
      </div>

      {displayText && (
        <span
          style={{
            ...styles.helperText,
            color: displayColors.text,
          }}
        >
          {displayColors.icon}
          {displayText}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Textarea variant
interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  helperText?: string;
  errorText?: string;
  size?: InputSize;
  state?: InputState;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  helperText,
  errorText,
  size = 'md',
  state = 'default',
  fullWidth = true,
  disabled,
  className,
  style,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const sizeStyles = SIZE_STYLES[size];
  const displayState = errorText ? 'error' : state;
  const stateColors = STATE_COLORS[displayState];
  const displayText = errorText || helperText;

  return (
    <div
      style={{
        ...styles.container,
        width: fullWidth ? '100%' : 'auto',
      }}
      className={className}
    >
      {label && (
        <label style={{ ...styles.label, fontSize: sizeStyles.labelSize }}>
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        disabled={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          ...styles.input,
          padding: sizeStyles.padding,
          fontSize: sizeStyles.fontSize,
          minHeight: '100px',
          resize: 'vertical',
          borderColor: isFocused ? stateColors.focusBorder : stateColors.border,
          boxShadow: isFocused ? `0 0 0 3px ${stateColors.focusBorder}33` : 'none',
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'text',
          ...style,
        }}
        {...props}
      />

      {displayText && (
        <span
          style={{
            ...styles.helperText,
            color: stateColors.text,
          }}
        >
          {stateColors.icon}
          {displayText}
        </span>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Input;
