/**
 * Input Component - 2025 Redesign
 * Standardized form input with proper focus states and theme support
 * 
 * Now using CSS Modules for scoped styling
 */

import React, { InputHTMLAttributes, forwardRef } from 'react';
import styles from './Input.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  multiline?: boolean;
  rows?: number;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = true,
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);
    const inputClasses = [
      styles.input,
      fullWidth && styles.fullWidth,
      hasError && styles.error,
      disabled && styles.disabled,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={`${styles.wrapper} ${fullWidth ? styles.wrapperFullWidth : ''}`}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={
            error || helperText
              ? `${inputId}-helper`
              : undefined
          }
          {...props}
        />
        {(error || helperText) && (
          <div
            id={`${inputId}-helper`}
            className={`${styles.helper} ${hasError ? styles.helperError : ''}`}
          >
            {error || helperText}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

