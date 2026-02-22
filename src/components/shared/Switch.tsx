import React, { forwardRef } from 'react';

type SwitchSize = 'sm' | 'md' | 'lg';

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  description?: string;
  size?: SwitchSize;
  labelPosition?: 'left' | 'right';
}

const SIZE_CONFIG: Record<SwitchSize, {
  track: { width: string; height: string };
  thumb: string;
  offset: string;
  labelSize: string;
  descSize: string;
  gap: string;
}> = {
  sm: {
    track: { width: '32px', height: '18px' },
    thumb: '14px',
    offset: '2px',
    labelSize: '0.8rem',
    descSize: '0.7rem',
    gap: '0.5rem',
  },
  md: {
    track: { width: '44px', height: '24px' },
    thumb: '20px',
    offset: '2px',
    labelSize: '0.875rem',
    descSize: '0.75rem',
    gap: '0.75rem',
  },
  lg: {
    track: { width: '56px', height: '30px' },
    thumb: '26px',
    offset: '2px',
    labelSize: '1rem',
    descSize: '0.875rem',
    gap: '1rem',
  },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'inline-flex',
    alignItems: 'center',
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
  track: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: '9999px',
    transition: 'all 0.2s ease',
  },
  trackOff: {
    background: 'rgba(255, 255, 255, 0.2)',
  },
  trackOn: {
    background: '#6366f1',
  },
  trackDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  thumb: {
    borderRadius: '50%',
    background: '#fff',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
    transition: 'transform 0.2s ease',
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

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(({
  label,
  description,
  size = 'md',
  labelPosition = 'right',
  disabled,
  checked,
  className,
  ...props
}, ref) => {
  const sizeConfig = SIZE_CONFIG[size];
  
  const thumbTranslate = checked 
    ? `translateX(calc(${sizeConfig.track.width} - ${sizeConfig.thumb} - ${sizeConfig.offset} * 2))`
    : 'translateX(0)';

  const renderContent = () => {
    if (!label && !description) return null;
    
    return (
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
    );
  };

  return (
    <label
      style={{
        ...styles.container,
        gap: sizeConfig.gap,
        flexDirection: labelPosition === 'left' ? 'row-reverse' : 'row',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      className={className}
    >
      <span style={styles.inputWrapper}>
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          style={styles.input}
          aria-checked={checked}
          {...props}
        />
        <span
          style={{
            ...styles.track,
            ...(checked ? styles.trackOn : styles.trackOff),
            ...(disabled ? styles.trackDisabled : {}),
            width: sizeConfig.track.width,
            height: sizeConfig.track.height,
            padding: sizeConfig.offset,
          }}
        >
          <span
            style={{
              ...styles.thumb,
              width: sizeConfig.thumb,
              height: sizeConfig.thumb,
              transform: thumbTranslate,
            }}
          />
        </span>
      </span>
      
      {renderContent()}
    </label>
  );
});

Switch.displayName = 'Switch';

// Switch with icons
interface IconSwitchProps extends SwitchProps {
  offIcon?: React.ReactNode;
  onIcon?: React.ReactNode;
}

export const IconSwitch = forwardRef<HTMLInputElement, IconSwitchProps>(({
  offIcon,
  onIcon,
  size = 'md',
  checked,
  disabled,
  className,
  ...props
}, ref) => {
  const sizeConfig = SIZE_CONFIG[size];
  const iconSize = parseInt(sizeConfig.thumb) * 0.6;
  
  const thumbTranslate = checked 
    ? `translateX(calc(${sizeConfig.track.width} - ${sizeConfig.thumb} - ${sizeConfig.offset} * 2))`
    : 'translateX(0)';

  return (
    <label
      style={{
        ...styles.container,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      className={className}
    >
      <span style={styles.inputWrapper}>
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          style={styles.input}
          aria-checked={checked}
          {...props}
        />
        <span
          style={{
            ...styles.track,
            ...(checked ? styles.trackOn : styles.trackOff),
            ...(disabled ? styles.trackDisabled : {}),
            width: sizeConfig.track.width,
            height: sizeConfig.track.height,
            padding: sizeConfig.offset,
          }}
        >
          <span
            style={{
              ...styles.thumb,
              width: sizeConfig.thumb,
              height: sizeConfig.thumb,
              transform: thumbTranslate,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: checked ? '#6366f1' : '#888',
            }}
          >
            {checked ? (
              onIcon && React.cloneElement(onIcon as React.ReactElement, { size: iconSize })
            ) : (
              offIcon && React.cloneElement(offIcon as React.ReactElement, { size: iconSize })
            )}
          </span>
        </span>
      </span>
    </label>
  );
});

IconSwitch.displayName = 'IconSwitch';

export default Switch;
