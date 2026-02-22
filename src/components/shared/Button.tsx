import React from 'react';
import { Loader } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children?: React.ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, {
  base: React.CSSProperties;
  hover: React.CSSProperties;
  disabled: React.CSSProperties;
}> = {
  primary: {
    base: {
      background: '#6366f1',
      color: '#fff',
      border: 'none',
    },
    hover: {
      background: '#4f46e5',
    },
    disabled: {
      background: 'rgba(99, 102, 241, 0.5)',
    },
  },
  secondary: {
    base: {
      background: 'rgba(255, 255, 255, 0.1)',
      color: '#fff',
      border: 'none',
    },
    hover: {
      background: 'rgba(255, 255, 255, 0.15)',
    },
    disabled: {
      background: 'rgba(255, 255, 255, 0.05)',
      color: 'rgba(255, 255, 255, 0.5)',
    },
  },
  outline: {
    base: {
      background: 'transparent',
      color: '#ccc',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    hover: {
      background: 'rgba(255, 255, 255, 0.05)',
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    disabled: {
      color: 'rgba(255, 255, 255, 0.3)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
  ghost: {
    base: {
      background: 'transparent',
      color: '#ccc',
      border: 'none',
    },
    hover: {
      background: 'rgba(255, 255, 255, 0.1)',
      color: '#fff',
    },
    disabled: {
      color: 'rgba(255, 255, 255, 0.3)',
    },
  },
  danger: {
    base: {
      background: '#ef4444',
      color: '#fff',
      border: 'none',
    },
    hover: {
      background: '#dc2626',
    },
    disabled: {
      background: 'rgba(239, 68, 68, 0.5)',
    },
  },
  success: {
    base: {
      background: '#10b981',
      color: '#fff',
      border: 'none',
    },
    hover: {
      background: '#059669',
    },
    disabled: {
      background: 'rgba(16, 185, 129, 0.5)',
    },
  },
};

const SIZE_STYLES: Record<ButtonSize, {
  padding: string;
  fontSize: string;
  height: string;
  iconSize: number;
  gap: string;
}> = {
  xs: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.7rem',
    height: '28px',
    iconSize: 12,
    gap: '0.25rem',
  },
  sm: {
    padding: '0.375rem 0.75rem',
    fontSize: '0.8rem',
    height: '32px',
    iconSize: 14,
    gap: '0.375rem',
  },
  md: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    height: '40px',
    iconSize: 16,
    gap: '0.5rem',
  },
  lg: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    height: '48px',
    iconSize: 18,
    gap: '0.625rem',
  },
};

const baseStyles: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '8px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  outline: 'none',
  position: 'relative',
  whiteSpace: 'nowrap',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  children,
  style,
  ...props
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  
  const variantStyles = VARIANT_STYLES[variant];
  const sizeStyles = SIZE_STYLES[size];
  const isDisabled = disabled || loading;

  const buttonStyle: React.CSSProperties = {
    ...baseStyles,
    ...variantStyles.base,
    ...(isHovered && !isDisabled ? variantStyles.hover : {}),
    ...(isDisabled ? variantStyles.disabled : {}),
    padding: sizeStyles.padding,
    fontSize: sizeStyles.fontSize,
    minHeight: sizeStyles.height,
    gap: sizeStyles.gap,
    width: fullWidth ? '100%' : 'auto',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.8 : 1,
    ...style,
  };

  const renderIcon = (iconElement: React.ReactNode) => {
    if (loading && iconPosition === 'left') {
      return (
        <Loader
          size={sizeStyles.iconSize}
          style={{ animation: 'spin 1s linear infinite' }}
        />
      );
    }
    return iconElement;
  };

  return (
    <button
      style={buttonStyle}
      disabled={isDisabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {icon && iconPosition === 'left' && renderIcon(icon)}
      {loading && !icon && (
        <Loader
          size={sizeStyles.iconSize}
          style={{ animation: 'spin 1s linear infinite' }}
        />
      )}
      {children && <span>{children}</span>}
      {icon && iconPosition === 'right' && !loading && icon}
    </button>
  );
};

// Icon-only button variant
interface IconButtonProps extends Omit<ButtonProps, 'children' | 'icon' | 'iconPosition'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = 'md',
  ...props
}) => {
  const sizeStyles = SIZE_STYLES[size];
  
  return (
    <Button
      size={size}
      style={{
        padding: '0',
        width: sizeStyles.height,
        minWidth: sizeStyles.height,
      }}
      {...props}
    >
      {icon}
    </Button>
  );
};

// Button group for related actions
interface ButtonGroupProps {
  children: React.ReactNode;
  attached?: boolean;
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  attached = false,
  className,
}) => (
  <div
    style={{
      display: 'inline-flex',
      gap: attached ? 0 : '0.5rem',
    }}
    className={className}
    role="group"
  >
    {React.Children.map(children, (child, index) => {
      if (!attached || !React.isValidElement(child)) return child;
      
      const isFirst = index === 0;
      const isLast = index === React.Children.count(children) - 1;
      
      return React.cloneElement(child as React.ReactElement<ButtonProps>, {
        style: {
          ...(child.props as ButtonProps).style,
          borderRadius: isFirst
            ? '8px 0 0 8px'
            : isLast
            ? '0 8px 8px 0'
            : '0',
          marginLeft: isFirst ? 0 : '-1px',
        },
      });
    })}
  </div>
);

export default Button;
