/**
 * Toggle Switch Component
 * Enhanced with clear ON/OFF visual states
 */
import React from 'react';
import styles from './ToggleSwitch.module.css';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean; // Show ON/OFF text label
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'medium',
  showLabel = false,
}) => {
  return (
    <label className={`${styles.toggleWrapper} ${styles[size]} ${disabled ? styles.disabled : ''} ${checked ? styles.checked : styles.unchecked}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className={styles.toggleInput}
      />
      <span className={styles.toggleSlider}>
        {showLabel && (
          <span className={styles.toggleText}>
            {checked ? 'ON' : 'OFF'}
          </span>
        )}
      </span>
      {label && <span className={styles.toggleLabel}>{label}</span>}
    </label>
  );
};

