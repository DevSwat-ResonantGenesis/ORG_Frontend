import React from 'react';
import { X } from 'lucide-react';

type TagVariant = 'solid' | 'subtle' | 'outline';
type TagSize = 'sm' | 'md' | 'lg';
type TagColor = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';

interface TagProps {
  children: React.ReactNode;
  variant?: TagVariant;
  size?: TagSize;
  color?: TagColor;
  icon?: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
}

const COLOR_CONFIG: Record<TagColor, {
  solid: { bg: string; color: string };
  subtle: { bg: string; color: string };
  outline: { border: string; color: string };
}> = {
  default: {
    solid: { bg: 'rgba(255, 255, 255, 0.15)', color: '#fff' },
    subtle: { bg: 'rgba(255, 255, 255, 0.05)', color: '#ccc' },
    outline: { border: 'rgba(255, 255, 255, 0.2)', color: '#ccc' },
  },
  primary: {
    solid: { bg: '#6366f1', color: '#fff' },
    subtle: { bg: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' },
    outline: { border: 'rgba(99, 102, 241, 0.5)', color: '#818cf8' },
  },
  success: {
    solid: { bg: '#10b981', color: '#fff' },
    subtle: { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399' },
    outline: { border: 'rgba(16, 185, 129, 0.5)', color: '#34d399' },
  },
  warning: {
    solid: { bg: '#f59e0b', color: '#fff' },
    subtle: { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' },
    outline: { border: 'rgba(245, 158, 11, 0.5)', color: '#fbbf24' },
  },
  error: {
    solid: { bg: '#ef4444', color: '#fff' },
    subtle: { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171' },
    outline: { border: 'rgba(239, 68, 68, 0.5)', color: '#f87171' },
  },
  info: {
    solid: { bg: '#3b82f6', color: '#fff' },
    subtle: { bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' },
    outline: { border: 'rgba(59, 130, 246, 0.5)', color: '#60a5fa' },
  },
};

const SIZE_CONFIG: Record<TagSize, {
  padding: string;
  fontSize: string;
  iconSize: number;
  gap: string;
  height: string;
}> = {
  sm: {
    padding: '0.125rem 0.5rem',
    fontSize: '0.6875rem',
    iconSize: 10,
    gap: '0.25rem',
    height: '20px',
  },
  md: {
    padding: '0.25rem 0.625rem',
    fontSize: '0.75rem',
    iconSize: 12,
    gap: '0.375rem',
    height: '26px',
  },
  lg: {
    padding: '0.375rem 0.75rem',
    fontSize: '0.8125rem',
    iconSize: 14,
    gap: '0.5rem',
    height: '32px',
  },
};

const styles: Record<string, React.CSSProperties> = {
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '9999px',
    fontWeight: '500',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  clickable: {
    cursor: 'pointer',
  },
  removeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    padding: '0',
    cursor: 'pointer',
    opacity: 0.7,
    transition: 'opacity 0.2s',
    marginLeft: '0.25rem',
    marginRight: '-0.25rem',
  },
};

export const Tag: React.FC<TagProps> = ({
  children,
  variant = 'subtle',
  size = 'md',
  color = 'default',
  icon,
  removable = false,
  onRemove,
  onClick,
  className,
}) => {
  const colorConfig = COLOR_CONFIG[color];
  const sizeConfig = SIZE_CONFIG[size];

  const getVariantStyle = (): React.CSSProperties => {
    switch (variant) {
      case 'solid':
        return {
          background: colorConfig.solid.bg,
          color: colorConfig.solid.color,
        };
      case 'outline':
        return {
          background: 'transparent',
          border: `1px solid ${colorConfig.outline.border}`,
          color: colorConfig.outline.color,
        };
      default:
        return {
          background: colorConfig.subtle.bg,
          color: colorConfig.subtle.color,
        };
    }
  };

  return (
    <span
      style={{
        ...styles.tag,
        ...getVariantStyle(),
        padding: sizeConfig.padding,
        fontSize: sizeConfig.fontSize,
        gap: sizeConfig.gap,
        minHeight: sizeConfig.height,
        ...(onClick ? styles.clickable : {}),
      }}
      onClick={onClick}
      className={className}
      role={onClick ? 'button' : undefined}
    >
      {icon && (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {React.cloneElement(icon as React.ReactElement, { size: sizeConfig.iconSize })}
        </span>
      )}
      {children}
      {removable && (
        <button
          style={styles.removeButton}
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          aria-label="Remove"
        >
          <X size={sizeConfig.iconSize} />
        </button>
      )}
    </span>
  );
};

// Tag group for multiple tags
interface TagGroupProps {
  children: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg';
  wrap?: boolean;
  className?: string;
}

export const TagGroup: React.FC<TagGroupProps> = ({
  children,
  spacing = 'sm',
  wrap = true,
  className,
}) => {
  const spacingValues = { sm: '0.375rem', md: '0.5rem', lg: '0.75rem' };

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: wrap ? 'wrap' : 'nowrap',
        gap: spacingValues[spacing],
        alignItems: 'center',
      }}
      className={className}
    >
      {children}
    </div>
  );
};

// Input tag for editable tags
interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  size?: TagSize;
  color?: TagColor;
  className?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  onChange,
  placeholder = 'Add tag...',
  maxTags,
  size = 'md',
  color = 'primary',
  className,
}) => {
  const [inputValue, setInputValue] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (maxTags && tags.length >= maxTags) return;
      if (!tags.includes(inputValue.trim())) {
        onChange([...tags, inputValue.trim()]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const sizeConfig = SIZE_CONFIG[size];

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.375rem',
        padding: '0.5rem',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        cursor: 'text',
      }}
      onClick={() => inputRef.current?.focus()}
      className={className}
    >
      {tags.map((tag, index) => (
        <Tag
          key={`${tag}-${index}`}
          size={size}
          color={color}
          removable
          onRemove={() => removeTag(index)}
        >
          {tag}
        </Tag>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ''}
        disabled={maxTags ? tags.length >= maxTags : false}
        style={{
          flex: 1,
          minWidth: '80px',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: '#fff',
          fontSize: sizeConfig.fontSize,
          padding: '0.25rem',
        }}
      />
    </div>
  );
};

export default Tag;
