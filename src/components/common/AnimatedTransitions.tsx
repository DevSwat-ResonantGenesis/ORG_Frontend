// ============== ANIMATED TRANSITIONS ==============
// Performant animation components using CSS transforms

import React, { memo, useRef, useEffect, useState, useCallback } from 'react';
import styles from './AnimatedTransitions.module.css';

// ============== FADE TRANSITION ==============

interface FadeProps {
  show: boolean;
  duration?: number;
  children: React.ReactNode;
  className?: string;
  onExited?: () => void;
}

export const Fade: React.FC<FadeProps> = memo(({
  show,
  duration = 200,
  children,
  className,
  onExited,
}) => {
  const [shouldRender, setShouldRender] = useState(show);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
        onExited?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onExited]);

  if (!shouldRender) return null;

  return (
    <div
      className={`${styles.fade} ${show ? styles.fadeIn : styles.fadeOut} ${className || ''}`}
      style={{ animationDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
});

Fade.displayName = 'Fade';

// ============== SLIDE TRANSITION ==============

interface SlideProps {
  show: boolean;
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  children: React.ReactNode;
  className?: string;
  onExited?: () => void;
}

export const Slide: React.FC<SlideProps> = memo(({
  show,
  direction = 'up',
  duration = 300,
  children,
  className,
  onExited,
}) => {
  const [shouldRender, setShouldRender] = useState(show);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
        onExited?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onExited]);

  if (!shouldRender) return null;

  const directionClass = {
    up: styles.slideUp,
    down: styles.slideDown,
    left: styles.slideLeft,
    right: styles.slideRight,
  }[direction];

  return (
    <div
      className={`${styles.slide} ${directionClass} ${show ? styles.slideIn : styles.slideOut} ${className || ''}`}
      style={{ animationDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
});

Slide.displayName = 'Slide';

// ============== SCALE TRANSITION ==============

interface ScaleProps {
  show: boolean;
  duration?: number;
  origin?: string;
  children: React.ReactNode;
  className?: string;
}

export const Scale: React.FC<ScaleProps> = memo(({
  show,
  duration = 200,
  origin = 'center',
  children,
  className,
}) => {
  const [shouldRender, setShouldRender] = useState(show);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!shouldRender) return null;

  return (
    <div
      className={`${styles.scale} ${show ? styles.scaleIn : styles.scaleOut} ${className || ''}`}
      style={{ animationDuration: `${duration}ms`, transformOrigin: origin }}
    >
      {children}
    </div>
  );
});

Scale.displayName = 'Scale';

// ============== COLLAPSE TRANSITION ==============

interface CollapseProps {
  show: boolean;
  duration?: number;
  children: React.ReactNode;
  className?: string;
}

export const Collapse: React.FC<CollapseProps> = memo(({
  show,
  duration = 300,
  children,
  className,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | 'auto'>(show ? 'auto' : 0);

  useEffect(() => {
    if (show) {
      const contentHeight = contentRef.current?.scrollHeight || 0;
      setHeight(contentHeight);
      const timer = setTimeout(() => setHeight('auto'), duration);
      return () => clearTimeout(timer);
    } else {
      const contentHeight = contentRef.current?.scrollHeight || 0;
      setHeight(contentHeight);
      requestAnimationFrame(() => setHeight(0));
    }
  }, [show, duration]);

  return (
    <div
      className={`${styles.collapse} ${className || ''}`}
      style={{
        height,
        transitionDuration: `${duration}ms`,
        overflow: height === 'auto' ? 'visible' : 'hidden',
      }}
    >
      <div ref={contentRef}>{children}</div>
    </div>
  );
});

Collapse.displayName = 'Collapse';

// ============== STAGGER ANIMATION ==============

interface StaggerProps {
  children: React.ReactNode[];
  delay?: number;
  duration?: number;
  className?: string;
}

export const Stagger: React.FC<StaggerProps> = memo(({
  children,
  delay = 50,
  duration = 300,
  className,
}) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <div
          className={styles.staggerItem}
          style={{
            animationDelay: `${index * delay}ms`,
            animationDuration: `${duration}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
});

Stagger.displayName = 'Stagger';

// ============== PROGRESS BAR ==============

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  animated?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = memo(({
  value,
  max = 100,
  showLabel = false,
  size = 'md',
  color,
  animated = true,
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`${styles.progressContainer} ${styles[size]} ${className || ''}`}>
      <div
        className={`${styles.progressBar} ${animated ? styles.animated : ''}`}
        style={{
          width: `${percentage}%`,
          backgroundColor: color,
        }}
      />
      {showLabel && (
        <span className={styles.progressLabel}>{Math.round(percentage)}%</span>
      )}
    </div>
  );
});

ProgressBar.displayName = 'ProgressBar';

// ============== LOADING SPINNER ==============

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = memo(({
  size = 'md',
  color,
  className,
}) => (
  <div
    className={`${styles.spinner} ${styles[`spinner${size.toUpperCase()}`]} ${className || ''}`}
    style={{ borderTopColor: color }}
  />
));

Spinner.displayName = 'Spinner';

// ============== PULSE INDICATOR ==============

interface PulseProps {
  color?: string;
  size?: number;
  className?: string;
}

export const Pulse: React.FC<PulseProps> = memo(({
  color = '#22c55e',
  size = 10,
  className,
}) => (
  <span
    className={`${styles.pulse} ${className || ''}`}
    style={{ width: size, height: size, backgroundColor: color }}
  />
));

Pulse.displayName = 'Pulse';

// ============== RIPPLE EFFECT ==============

interface RippleProps {
  color?: string;
  duration?: number;
  children: React.ReactNode;
  className?: string;
}

export const Ripple: React.FC<RippleProps> = memo(({
  color = 'rgba(255, 255, 255, 0.3)',
  duration = 600,
  children,
  className,
}) => {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples(prev => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, duration);
  }, [duration]);

  return (
    <div className={`${styles.rippleContainer} ${className || ''}`} onClick={handleClick}>
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className={styles.ripple}
          style={{
            left: ripple.x,
            top: ripple.y,
            backgroundColor: color,
            animationDuration: `${duration}ms`,
          }}
        />
      ))}
    </div>
  );
});

Ripple.displayName = 'Ripple';

export default {
  Fade,
  Slide,
  Scale,
  Collapse,
  Stagger,
  ProgressBar,
  Spinner,
  Pulse,
  Ripple,
};
