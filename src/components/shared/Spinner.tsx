import React from 'react';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type SpinnerVariant = 'default' | 'dots' | 'bars' | 'pulse';

interface SpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  color?: string;
  thickness?: number;
  speed?: 'slow' | 'normal' | 'fast';
  label?: string;
  className?: string;
}

const SIZE_CONFIG: Record<SpinnerSize, number> = {
  xs: 16,
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
};

const SPEED_CONFIG: Record<string, string> = {
  slow: '1.5s',
  normal: '0.75s',
  fast: '0.5s',
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    borderRadius: '50%',
    borderStyle: 'solid',
    borderColor: 'transparent',
    animation: 'spin linear infinite',
  },
  label: {
    marginLeft: '0.75rem',
    color: '#ccc',
    fontSize: '0.875rem',
  },
  dotsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  dot: {
    borderRadius: '50%',
    animation: 'bounce ease-in-out infinite',
  },
  barsContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '2px',
  },
  bar: {
    borderRadius: '2px',
    animation: 'bars ease-in-out infinite',
  },
  pulseCircle: {
    borderRadius: '50%',
    animation: 'pulse ease-in-out infinite',
  },
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'default',
  color = '#6366f1',
  thickness = 3,
  speed = 'normal',
  label,
  className,
}) => {
  const sizeValue = SIZE_CONFIG[size];
  const speedValue = SPEED_CONFIG[speed];

  const renderDefault = () => (
    <div
      style={{
        ...styles.spinner,
        width: sizeValue,
        height: sizeValue,
        borderWidth: thickness,
        borderTopColor: color,
        animationDuration: speedValue,
      }}
    />
  );

  const renderDots = () => {
    const dotSize = sizeValue / 4;
    return (
      <div style={styles.dotsContainer}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              ...styles.dot,
              width: dotSize,
              height: dotSize,
              background: color,
              animationDuration: speedValue,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    );
  };

  const renderBars = () => {
    const barWidth = sizeValue / 5;
    const barHeight = sizeValue;
    return (
      <div style={styles.barsContainer}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              ...styles.bar,
              width: barWidth,
              height: barHeight * 0.6,
              background: color,
              animationDuration: speedValue,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    );
  };

  const renderPulse = () => (
    <div
      style={{
        ...styles.pulseCircle,
        width: sizeValue,
        height: sizeValue,
        background: color,
        animationDuration: speedValue,
      }}
    />
  );

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'bars':
        return renderBars();
      case 'pulse':
        return renderPulse();
      default:
        return renderDefault();
    }
  };

  return (
    <div style={styles.container} className={className} role="status" aria-label={label || 'Loading'}>
      {renderSpinner()}
      {label && <span style={styles.label}>{label}</span>}
    </div>
  );
};

// Full page loading overlay
interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  spinnerSize?: SpinnerSize;
  spinnerVariant?: SpinnerVariant;
  blur?: boolean;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message,
  spinnerSize = 'lg',
  spinnerVariant = 'default',
  blur = true,
  className,
}) => {
  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: blur ? 'blur(4px)' : undefined,
        zIndex: 9999,
      }}
      className={className}
    >
      <Spinner size={spinnerSize} variant={spinnerVariant} />
      {message && (
        <p
          style={{
            marginTop: '1rem',
            color: '#fff',
            fontSize: '1rem',
            fontWeight: '500',
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

// Inline loading indicator
interface InlineLoaderProps {
  size?: SpinnerSize;
  text?: string;
  className?: string;
}

export const InlineLoader: React.FC<InlineLoaderProps> = ({
  size = 'sm',
  text = 'Loading...',
  className,
}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: '#888',
      fontSize: '0.875rem',
    }}
    className={className}
  >
    <Spinner size={size} color="#888" />
    {text && <span>{text}</span>}
  </div>
);

// Button loading state helper
interface ButtonLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  spinnerSize?: SpinnerSize;
}

export const ButtonLoader: React.FC<ButtonLoaderProps> = ({
  isLoading,
  children,
  loadingText,
  spinnerSize = 'sm',
}) => {
  if (!isLoading) return <>{children}</>;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
      <Spinner size={spinnerSize} color="currentColor" />
      {loadingText || children}
    </span>
  );
};

export default Spinner;
