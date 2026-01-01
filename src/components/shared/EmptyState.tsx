import React from 'react';
import { Button, type ButtonVariant } from '@/components/ui/Button';
import '../EmptyState.css';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: ButtonVariant;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: ButtonVariant;
  };
  illustration?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  secondaryAction,
  illustration,
}) => {
  return (
    <div className="empty-state">
      {illustration && <div className="empty-state-illustration">{illustration}</div>}
      {icon && !illustration && <div className="empty-state-icon">{icon}</div>}
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {(action || secondaryAction) && (
        <div className="empty-state-actions">
          {action && (
            <Button variant={action.variant || 'primary'} onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant={secondaryAction.variant || 'secondary'} onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;

