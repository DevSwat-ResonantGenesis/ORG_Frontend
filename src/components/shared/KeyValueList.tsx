import React from 'react';
import { Copy, ExternalLink } from 'lucide-react';

type KeyValueVariant = 'default' | 'compact' | 'striped' | 'card';

interface KeyValueItem {
  key: string;
  value: React.ReactNode;
  copyable?: boolean;
  link?: string;
  icon?: React.ReactNode;
  hidden?: boolean;
}

interface KeyValueListProps {
  items: KeyValueItem[];
  variant?: KeyValueVariant;
  labelWidth?: string;
  showDividers?: boolean;
  className?: string;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  containerCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '0.75rem 0',
  },
  rowCompact: {
    padding: '0.5rem 0',
  },
  rowCard: {
    padding: '0.75rem 1rem',
  },
  rowStriped: {
    padding: '0.75rem 1rem',
  },
  rowStripedEven: {
    background: 'rgba(255, 255, 255, 0.02)',
  },
  rowDivider: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  label: {
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: '#888',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  labelIcon: {
    color: '#666',
  },
  value: {
    fontSize: '0.875rem',
    color: '#e4e4e7',
    flex: 1,
    minWidth: 0,
    wordBreak: 'break-word',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    marginLeft: '0.5rem',
    flexShrink: 0,
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    background: 'transparent',
    border: 'none',
    borderRadius: '4px',
    color: '#666',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  actionButtonHover: {
    color: '#fff',
    background: 'rgba(255, 255, 255, 0.1)',
  },
};

const KeyValueRow: React.FC<{
  item: KeyValueItem;
  variant: KeyValueVariant;
  labelWidth: string;
  showDivider: boolean;
  isEven: boolean;
}> = ({ item, variant, labelWidth, showDivider, isEven }) => {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const [hoveredAction, setHoveredAction] = React.useState<string | null>(null);

  if (item.hidden) return null;

  const handleCopy = async () => {
    const textValue = typeof item.value === 'string' ? item.value : String(item.value);
    try {
      await navigator.clipboard.writeText(textValue);
      setCopiedKey(item.key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getRowStyle = (): React.CSSProperties => {
    let style = { ...styles.row };

    if (variant === 'compact') {
      style = { ...style, ...styles.rowCompact };
    } else if (variant === 'card' || variant === 'striped') {
      style = { ...style, ...styles.rowCard };
    }

    if (variant === 'striped' && isEven) {
      style = { ...style, ...styles.rowStripedEven };
    }

    if (showDivider) {
      style = { ...style, ...styles.rowDivider };
    }

    return style;
  };

  return (
    <div style={getRowStyle()}>
      <div style={{ ...styles.label, width: labelWidth }}>
        {item.icon && <span style={styles.labelIcon}>{item.icon}</span>}
        {item.key}
      </div>
      <div style={styles.value}>
        <span style={{ flex: 1, minWidth: 0 }}>{item.value}</span>
        {(item.copyable || item.link) && (
          <div style={styles.actions}>
            {item.copyable && (
              <button
                style={{
                  ...styles.actionButton,
                  ...(hoveredAction === `copy-${item.key}` ? styles.actionButtonHover : {}),
                  color: copiedKey === item.key ? '#10b981' : undefined,
                }}
                onClick={handleCopy}
                onMouseEnter={() => setHoveredAction(`copy-${item.key}`)}
                onMouseLeave={() => setHoveredAction(null)}
                title={copiedKey === item.key ? 'Copied!' : 'Copy'}
              >
                <Copy size={14} />
              </button>
            )}
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  ...styles.actionButton,
                  ...(hoveredAction === `link-${item.key}` ? styles.actionButtonHover : {}),
                  textDecoration: 'none',
                }}
                onMouseEnter={() => setHoveredAction(`link-${item.key}`)}
                onMouseLeave={() => setHoveredAction(null)}
                title="Open link"
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const KeyValueList: React.FC<KeyValueListProps> = ({
  items,
  variant = 'default',
  labelWidth = '140px',
  showDividers = true,
  className,
}) => {
  const visibleItems = items.filter((item) => !item.hidden);

  return (
    <div
      style={{
        ...styles.container,
        ...(variant === 'card' ? styles.containerCard : {}),
      }}
      className={className}
    >
      {visibleItems.map((item, index) => (
        <KeyValueRow
          key={item.key}
          item={item}
          variant={variant}
          labelWidth={labelWidth}
          showDivider={showDividers && index < visibleItems.length - 1}
          isEven={index % 2 === 0}
        />
      ))}
    </div>
  );
};

// Definition list variant
interface DefinitionListProps {
  items: { term: string; definition: React.ReactNode }[];
  className?: string;
}

export const DefinitionList: React.FC<DefinitionListProps> = ({
  items,
  className,
}) => (
  <dl
    style={{
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
      gap: '0.5rem 1rem',
      margin: 0,
    }}
    className={className}
  >
    {items.map((item) => (
      <React.Fragment key={item.term}>
        <dt style={{ fontSize: '0.8125rem', fontWeight: '500', color: '#888' }}>
          {item.term}
        </dt>
        <dd style={{ fontSize: '0.875rem', color: '#e4e4e7', margin: 0 }}>
          {item.definition}
        </dd>
      </React.Fragment>
    ))}
  </dl>
);

// Property grid for object display
interface PropertyGridProps {
  data: Record<string, unknown>;
  excludeKeys?: string[];
  className?: string;
}

export const PropertyGrid: React.FC<PropertyGridProps> = ({
  data,
  excludeKeys = [],
  className,
}) => {
  const items = Object.entries(data)
    .filter(([key]) => !excludeKeys.includes(key))
    .map(([key, value]) => ({
      key: key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
      value: typeof value === 'object' ? JSON.stringify(value) : String(value ?? '-'),
      copyable: typeof value === 'string' && value.length > 20,
    }));

  return <KeyValueList items={items} variant="striped" className={className} />;
};

export default KeyValueList;
