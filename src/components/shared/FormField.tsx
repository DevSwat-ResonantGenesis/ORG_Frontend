import React from 'react';
import { AlertCircle, HelpCircle, CheckCircle } from 'lucide-react';

type FormFieldStatus = 'default' | 'error' | 'success' | 'warning';

interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
  helperText?: string;
  errorText?: string;
  successText?: string;
  status?: FormFieldStatus;
  tooltip?: string;
  children: React.ReactNode;
  className?: string;
}

const STATUS_CONFIG: Record<FormFieldStatus, {
  color: string;
  icon: React.ReactNode | null;
}> = {
  default: { color: '#888', icon: null },
  error: { color: '#ef4444', icon: <AlertCircle size={14} /> },
  success: { color: '#10b981', icon: <CheckCircle size={14} /> },
  warning: { color: '#f59e0b', icon: <AlertCircle size={14} /> },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  labelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: '#ccc',
  },
  required: {
    color: '#ef4444',
    marginLeft: '0.125rem',
  },
  optional: {
    fontSize: '0.75rem',
    color: '#666',
    fontWeight: '400',
  },
  tooltip: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
    cursor: 'help',
  },
  inputWrapper: {
    position: 'relative',
  },
  helperRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.375rem',
    fontSize: '0.75rem',
    lineHeight: 1.4,
  },
  helperIcon: {
    flexShrink: 0,
    marginTop: '0.125rem',
  },
};

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  required = false,
  optional = false,
  helperText,
  errorText,
  successText,
  status: propStatus,
  tooltip,
  children,
  className,
}) => {
  // Determine status from props
  let status: FormFieldStatus = propStatus || 'default';
  if (errorText) status = 'error';
  else if (successText) status = 'success';

  const config = STATUS_CONFIG[status];
  const messageText = errorText || successText || helperText;

  return (
    <div style={styles.container} className={className}>
      {label && (
        <div style={styles.labelRow}>
          <label htmlFor={htmlFor} style={styles.label}>
            {label}
            {required && <span style={styles.required}>*</span>}
          </label>
          {optional && <span style={styles.optional}>(optional)</span>}
          {tooltip && (
            <span style={styles.tooltip} title={tooltip}>
              <HelpCircle size={14} />
            </span>
          )}
        </div>
      )}

      <div style={styles.inputWrapper}>{children}</div>

      {messageText && (
        <div style={{ ...styles.helperRow, color: config.color }}>
          {config.icon && <span style={styles.helperIcon}>{config.icon}</span>}
          <span>{messageText}</span>
        </div>
      )}
    </div>
  );
};

// Form section for grouping fields
interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className,
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      padding: '1.5rem',
      background: 'rgba(255, 255, 255, 0.02)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.06)',
    }}
    className={className}
  >
    {(title || description) && (
      <div style={{ marginBottom: '0.5rem' }}>
        {title && (
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#fff',
              marginBottom: description ? '0.375rem' : 0,
            }}
          >
            {title}
          </h3>
        )}
        {description && (
          <p style={{ fontSize: '0.8125rem', color: '#888', lineHeight: 1.5 }}>
            {description}
          </p>
        )}
      </div>
    )}
    {children}
  </div>
);

// Form row for horizontal layout
interface FormRowProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  gap?: string;
  className?: string;
}

export const FormRow: React.FC<FormRowProps> = ({
  children,
  columns = 2,
  gap = '1rem',
  className,
}) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap,
    }}
    className={className}
  >
    {children}
  </div>
);

// Form actions for submit/cancel buttons
interface FormActionsProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right' | 'space-between';
  className?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({
  children,
  align = 'right',
  className,
}) => {
  const justifyMap = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
    'space-between': 'space-between',
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: justifyMap[align],
        gap: '0.75rem',
        paddingTop: '1rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        marginTop: '0.5rem',
      }}
      className={className}
    >
      {children}
    </div>
  );
};

// Fieldset for grouping related fields
interface FieldsetProps {
  legend?: string;
  children: React.ReactNode;
  className?: string;
}

export const Fieldset: React.FC<FieldsetProps> = ({
  legend,
  children,
  className,
}) => (
  <fieldset
    style={{
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '10px',
      padding: '1.25rem',
      margin: 0,
    }}
    className={className}
  >
    {legend && (
      <legend
        style={{
          padding: '0 0.5rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#ccc',
        }}
      >
        {legend}
      </legend>
    )}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {children}
    </div>
  </fieldset>
);

export default FormField;
