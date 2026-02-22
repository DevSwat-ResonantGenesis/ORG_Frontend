import React from 'react';
import { Check, Circle } from 'lucide-react';

type StepStatus = 'pending' | 'current' | 'completed' | 'error';
type StepperOrientation = 'horizontal' | 'vertical';
type StepperSize = 'sm' | 'md' | 'lg';

interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  status?: StepStatus;
}

interface StepperProps {
  steps: Step[];
  currentStep?: number;
  orientation?: StepperOrientation;
  size?: StepperSize;
  clickable?: boolean;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

const SIZE_CONFIG: Record<StepperSize, {
  circle: number;
  iconSize: number;
  titleSize: string;
  descSize: string;
  lineWidth: number;
  gap: string;
}> = {
  sm: {
    circle: 28,
    iconSize: 14,
    titleSize: '0.8125rem',
    descSize: '0.6875rem',
    lineWidth: 2,
    gap: '0.5rem',
  },
  md: {
    circle: 36,
    iconSize: 18,
    titleSize: '0.875rem',
    descSize: '0.75rem',
    lineWidth: 2,
    gap: '0.75rem',
  },
  lg: {
    circle: 44,
    iconSize: 22,
    titleSize: '1rem',
    descSize: '0.8125rem',
    lineWidth: 3,
    gap: '1rem',
  },
};

const STATUS_COLORS: Record<StepStatus, {
  bg: string;
  border: string;
  icon: string;
  title: string;
  desc: string;
}> = {
  pending: {
    bg: 'transparent',
    border: 'rgba(255, 255, 255, 0.2)',
    icon: '#666',
    title: '#888',
    desc: '#666',
  },
  current: {
    bg: 'rgba(99, 102, 241, 0.15)',
    border: '#6366f1',
    icon: '#6366f1',
    title: '#fff',
    desc: '#ccc',
  },
  completed: {
    bg: '#6366f1',
    border: '#6366f1',
    icon: '#fff',
    title: '#ccc',
    desc: '#888',
  },
  error: {
    bg: 'rgba(239, 68, 68, 0.15)',
    border: '#ef4444',
    icon: '#ef4444',
    title: '#f87171',
    desc: '#fca5a5',
  },
};

const styles: Record<string, React.CSSProperties> = {
  containerHorizontal: {
    display: 'flex',
    alignItems: 'flex-start',
    width: '100%',
  },
  containerVertical: {
    display: 'flex',
    flexDirection: 'column',
  },
  stepHorizontal: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  stepVertical: {
    display: 'flex',
    alignItems: 'flex-start',
    position: 'relative',
  },
  circle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    border: '2px solid',
    flexShrink: 0,
    transition: 'all 0.2s',
  },
  circleClickable: {
    cursor: 'pointer',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
  },
  contentHorizontal: {
    alignItems: 'center',
    textAlign: 'center',
    marginTop: '0.5rem',
  },
  contentVertical: {
    marginLeft: '0.75rem',
    paddingBottom: '1.5rem',
  },
  title: {
    fontWeight: '500',
    transition: 'color 0.2s',
  },
  description: {
    marginTop: '0.125rem',
    transition: 'color 0.2s',
  },
  lineHorizontal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '100%',
    transform: 'translateY(-50%)',
    zIndex: -1,
  },
  lineVertical: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: -1,
  },
};

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep = 0,
  orientation = 'horizontal',
  size = 'md',
  clickable = false,
  onStepClick,
  className,
}) => {
  const sizeConfig = SIZE_CONFIG[size];
  const isHorizontal = orientation === 'horizontal';

  const getStepStatus = (index: number, step: Step): StepStatus => {
    if (step.status) return step.status;
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'pending';
  };

  const renderStepIcon = (status: StepStatus, step: Step) => {
    const colors = STATUS_COLORS[status];

    if (status === 'completed') {
      return <Check size={sizeConfig.iconSize} color={colors.icon} />;
    }

    if (step.icon) {
      return React.cloneElement(step.icon as React.ReactElement, {
        size: sizeConfig.iconSize,
        color: colors.icon,
      });
    }

    return <Circle size={sizeConfig.iconSize * 0.5} color={colors.icon} fill={colors.icon} />;
  };

  const renderLine = (index: number, status: StepStatus) => {
    if (index === steps.length - 1) return null;

    const isCompleted = status === 'completed';
    const lineColor = isCompleted ? '#6366f1' : 'rgba(255, 255, 255, 0.1)';

    if (isHorizontal) {
      return (
        <div
          style={{
            ...styles.lineHorizontal,
            height: sizeConfig.lineWidth,
            background: lineColor,
          }}
        />
      );
    }

    return (
      <div
        style={{
          ...styles.lineVertical,
          width: sizeConfig.lineWidth,
          top: sizeConfig.circle,
          bottom: 0,
          background: lineColor,
        }}
      />
    );
  };

  return (
    <div
      style={isHorizontal ? styles.containerHorizontal : styles.containerVertical}
      className={className}
    >
      {steps.map((step, index) => {
        const status = getStepStatus(index, step);
        const colors = STATUS_COLORS[status];

        return (
          <div
            key={step.id}
            style={isHorizontal ? styles.stepHorizontal : styles.stepVertical}
          >
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div
                style={{
                  ...styles.circle,
                  ...(clickable ? styles.circleClickable : {}),
                  width: sizeConfig.circle,
                  height: sizeConfig.circle,
                  background: colors.bg,
                  borderColor: colors.border,
                }}
                onClick={clickable ? () => onStepClick?.(index) : undefined}
                role={clickable ? 'button' : undefined}
                tabIndex={clickable ? 0 : undefined}
              >
                {renderStepIcon(status, step)}
              </div>
            </div>

            <div
              style={{
                ...styles.content,
                ...(isHorizontal ? styles.contentHorizontal : styles.contentVertical),
              }}
            >
              <span
                style={{
                  ...styles.title,
                  fontSize: sizeConfig.titleSize,
                  color: colors.title,
                }}
              >
                {step.title}
              </span>
              {step.description && (
                <span
                  style={{
                    ...styles.description,
                    fontSize: sizeConfig.descSize,
                    color: colors.desc,
                  }}
                >
                  {step.description}
                </span>
              )}
            </div>

            {renderLine(index, status)}
          </div>
        );
      })}
    </div>
  );
};

// Simple step indicator (dots)
interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  totalSteps,
  currentStep,
  size = 'md',
  className,
}) => {
  const dotSizes = { sm: 6, md: 8, lg: 10 };
  const gaps = { sm: '0.375rem', md: '0.5rem', lg: '0.625rem' };
  const dotSize = dotSizes[size];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: gaps[size],
      }}
      className={className}
      role="progressbar"
      aria-valuenow={currentStep + 1}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
    >
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            background: index <= currentStep ? '#6366f1' : 'rgba(255, 255, 255, 0.2)',
            transition: 'background 0.2s',
          }}
        />
      ))}
    </div>
  );
};

export default Stepper;
