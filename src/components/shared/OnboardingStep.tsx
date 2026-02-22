import React, { useState } from 'react';
import { Check, ChevronRight, Circle, ArrowRight, ArrowLeft } from 'lucide-react';

type StepStatus = 'pending' | 'current' | 'completed' | 'skipped';

interface OnboardingStepData {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  content?: React.ReactNode;
  optional?: boolean;
}

interface OnboardingStepProps {
  step: OnboardingStepData;
  status: StepStatus;
  stepNumber: number;
  totalSteps: number;
  onComplete?: () => void;
  onSkip?: () => void;
  className?: string;
}

interface OnboardingWizardProps {
  steps: OnboardingStepData[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete?: () => void;
  showProgress?: boolean;
  allowSkip?: boolean;
  className?: string;
}

const STATUS_CONFIG: Record<StepStatus, {
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  pending: {
    color: '#666',
    bgColor: 'transparent',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  current: {
    color: '#fff',
    bgColor: '#6366f1',
    borderColor: '#6366f1',
  },
  completed: {
    color: '#fff',
    bgColor: '#10b981',
    borderColor: '#10b981',
  },
  skipped: {
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
};

const styles: Record<string, React.CSSProperties> = {
  wizard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  progressBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  progressStep: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  stepIndicator: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8125rem',
    fontWeight: '600',
    border: '2px solid',
    transition: 'all 0.3s',
  },
  stepLabel: {
    fontSize: '0.8125rem',
    fontWeight: '500',
    display: 'none',
  },
  connector: {
    width: '40px',
    height: '2px',
    background: 'rgba(255, 255, 255, 0.1)',
    transition: 'background 0.3s',
  },
  connectorCompleted: {
    background: '#10b981',
  },
  stepContent: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '2rem',
  },
  stepHeader: {
    marginBottom: '1.5rem',
  },
  stepTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#fff',
    margin: '0 0 0.5rem 0',
  },
  stepDescription: {
    fontSize: '0.9375rem',
    color: '#888',
    margin: 0,
    lineHeight: 1.6,
  },
  stepBody: {
    marginBottom: '2rem',
  },
  stepActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.25rem',
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: '#888',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  skipButton: {
    padding: '0.75rem 1.25rem',
    background: 'transparent',
    border: 'none',
    color: '#888',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  nextButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  rightActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
};

const StepIndicator: React.FC<{
  number: number;
  status: StepStatus;
  label?: string;
}> = ({ number, status, label }) => {
  const config = STATUS_CONFIG[status];

  return (
    <div style={styles.progressStep}>
      <div
        style={{
          ...styles.stepIndicator,
          color: config.color,
          background: config.bgColor,
          borderColor: config.borderColor,
        }}
      >
        {status === 'completed' ? (
          <Check size={16} />
        ) : status === 'skipped' ? (
          <Circle size={8} />
        ) : (
          number
        )}
      </div>
      {label && (
        <span
          style={{
            ...styles.stepLabel,
            color: status === 'current' ? '#fff' : '#888',
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
};

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  steps,
  currentStep,
  onStepChange,
  onComplete,
  showProgress = true,
  allowSkip = true,
  className,
}) => {
  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const getStepStatus = (index: number): StepStatus => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'pending';
  };

  const handleNext = () => {
    if (isLastStep) {
      onComplete?.();
    } else {
      onStepChange(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      onStepChange(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (!isLastStep) {
      onStepChange(currentStep + 1);
    }
  };

  return (
    <div style={styles.wizard} className={className}>
      {showProgress && (
        <div style={styles.progressBar}>
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <StepIndicator
                number={index + 1}
                status={getStepStatus(index)}
                label={step.title}
              />
              {index < steps.length - 1 && (
                <div
                  style={{
                    ...styles.connector,
                    ...(index < currentStep ? styles.connectorCompleted : {}),
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      <div style={styles.stepContent}>
        <div style={styles.stepHeader}>
          <h2 style={styles.stepTitle}>{currentStepData.title}</h2>
          {currentStepData.description && (
            <p style={styles.stepDescription}>{currentStepData.description}</p>
          )}
        </div>

        <div style={styles.stepBody}>{currentStepData.content}</div>

        <div style={styles.stepActions}>
          {!isFirstStep ? (
            <button style={styles.backButton} onClick={handleBack}>
              <ArrowLeft size={16} />
              Back
            </button>
          ) : (
            <div />
          )}

          <div style={styles.rightActions}>
            {allowSkip && currentStepData.optional && !isLastStep && (
              <button style={styles.skipButton} onClick={handleSkip}>
                Skip
              </button>
            )}
            <button style={styles.nextButton} onClick={handleNext}>
              {isLastStep ? 'Complete' : 'Continue'}
              {!isLastStep && <ArrowRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Checklist variant for onboarding
interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  action?: () => void;
}

interface OnboardingChecklistProps {
  title?: string;
  items: ChecklistItem[];
  onItemClick?: (id: string) => void;
  className?: string;
}

export const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  title = 'Getting Started',
  items,
  onItemClick,
  className,
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const completedCount = items.filter((i) => i.completed).length;
  const progress = (completedCount / items.length) * 100;

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '1.25rem',
      }}
      className={className}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#fff', margin: 0 }}>
          {title}
        </h3>
        <span style={{ fontSize: '0.75rem', color: '#888' }}>
          {completedCount}/{items.length} completed
        </span>
      </div>

      <div
        style={{
          height: '4px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '2px',
          marginBottom: '1rem',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #6366f1 0%, #10b981 100%)',
            borderRadius: '2px',
            transition: 'width 0.3s',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.75rem',
              borderRadius: '8px',
              cursor: item.action || onItemClick ? 'pointer' : 'default',
              background: hoveredItem === item.id ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
              transition: 'background 0.15s',
            }}
            onClick={() => {
              item.action?.();
              onItemClick?.(item.id);
            }}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: item.completed ? '#10b981' : 'transparent',
                border: item.completed ? 'none' : '2px solid rgba(255, 255, 255, 0.2)',
                flexShrink: 0,
                marginTop: '0.125rem',
              }}
            >
              {item.completed && <Check size={12} color="#fff" />}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: item.completed ? '#888' : '#fff',
                  textDecoration: item.completed ? 'line-through' : 'none',
                }}
              >
                {item.title}
              </div>
              {item.description && (
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.125rem' }}>
                  {item.description}
                </div>
              )}
            </div>
            {(item.action || onItemClick) && !item.completed && (
              <ChevronRight size={16} color="#666" style={{ flexShrink: 0 }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnboardingWizard;
