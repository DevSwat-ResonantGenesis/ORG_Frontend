import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Copy, Check } from 'lucide-react';

interface JsonViewerProps {
  data: unknown;
  name?: string;
  initialExpanded?: boolean;
  expandDepth?: number;
  showCopy?: boolean;
  showLineNumbers?: boolean;
  className?: string;
}

type JsonValueType = 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array';

const TYPE_COLORS: Record<JsonValueType, string> = {
  string: '#a5d6ff',
  number: '#79c0ff',
  boolean: '#ff7b72',
  null: '#888',
  object: '#e4e4e7',
  array: '#e4e4e7',
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.8125rem',
    lineHeight: 1.6,
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '10px',
    padding: '1rem',
    overflow: 'auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  title: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  copyButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.25rem 0.5rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    color: '#888',
    fontSize: '0.6875rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  copyButtonSuccess: {
    color: '#10b981',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  row: {
    display: 'flex',
    alignItems: 'flex-start',
  },
  lineNumber: {
    width: '32px',
    textAlign: 'right',
    paddingRight: '1rem',
    color: '#444',
    userSelect: 'none',
    flexShrink: 0,
  },
  expandButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    background: 'transparent',
    border: 'none',
    borderRadius: '2px',
    color: '#666',
    cursor: 'pointer',
    marginRight: '0.25rem',
    flexShrink: 0,
  },
  key: {
    color: '#7ee787',
  },
  colon: {
    color: '#888',
    marginRight: '0.5rem',
  },
  bracket: {
    color: '#888',
  },
  comma: {
    color: '#888',
  },
  collapsed: {
    color: '#666',
    fontStyle: 'italic',
  },
  indent: {
    display: 'inline-block',
  },
};

const getValueType = (value: unknown): JsonValueType => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value as JsonValueType;
};

const JsonValue: React.FC<{
  value: unknown;
  depth: number;
  expandDepth: number;
  isLast: boolean;
  keyName?: string;
  showLineNumbers: boolean;
  lineNumber: { current: number };
}> = ({ value, depth, expandDepth, isLast, keyName, showLineNumbers, lineNumber }) => {
  const [isExpanded, setIsExpanded] = useState(depth < expandDepth);
  const valueType = getValueType(value);
  const isExpandable = valueType === 'object' || valueType === 'array';
  const indent = depth * 16;

  const renderPrimitive = () => {
    let displayValue: string;
    let color = TYPE_COLORS[valueType];

    switch (valueType) {
      case 'string':
        displayValue = `"${value}"`;
        break;
      case 'number':
      case 'boolean':
        displayValue = String(value);
        break;
      case 'null':
        displayValue = 'null';
        break;
      default:
        displayValue = String(value);
    }

    return (
      <span style={{ color }}>
        {displayValue}
        {!isLast && <span style={styles.comma}>,</span>}
      </span>
    );
  };

  const renderExpandable = () => {
    const isArray = valueType === 'array';
    const entries = isArray
      ? (value as unknown[]).map((v, i) => [i, v] as [number, unknown])
      : Object.entries(value as Record<string, unknown>);
    const openBracket = isArray ? '[' : '{';
    const closeBracket = isArray ? ']' : '}';

    if (!isExpanded) {
      const preview = isArray
        ? `[${entries.length} items]`
        : `{${entries.length} keys}`;

      return (
        <>
          <button
            style={styles.expandButton}
            onClick={() => setIsExpanded(true)}
          >
            <ChevronRight size={12} />
          </button>
          <span style={styles.bracket}>{openBracket}</span>
          <span style={styles.collapsed}>{preview}</span>
          <span style={styles.bracket}>{closeBracket}</span>
          {!isLast && <span style={styles.comma}>,</span>}
        </>
      );
    }

    return (
      <>
        <button
          style={styles.expandButton}
          onClick={() => setIsExpanded(false)}
        >
          <ChevronDown size={12} />
        </button>
        <span style={styles.bracket}>{openBracket}</span>
        <div>
          {entries.map(([key, val], index) => (
            <JsonValue
              key={key}
              value={val}
              depth={depth + 1}
              expandDepth={expandDepth}
              isLast={index === entries.length - 1}
              keyName={isArray ? undefined : String(key)}
              showLineNumbers={showLineNumbers}
              lineNumber={lineNumber}
            />
          ))}
        </div>
        <div style={styles.row}>
          {showLineNumbers && (
            <span style={styles.lineNumber}>{++lineNumber.current}</span>
          )}
          <span style={{ ...styles.indent, width: indent }} />
          <span style={styles.bracket}>{closeBracket}</span>
          {!isLast && <span style={styles.comma}>,</span>}
        </div>
      </>
    );
  };

  return (
    <div style={styles.row}>
      {showLineNumbers && (
        <span style={styles.lineNumber}>{++lineNumber.current}</span>
      )}
      <span style={{ ...styles.indent, width: indent }} />
      {!isExpandable && <span style={{ width: '20px', display: 'inline-block' }} />}
      {keyName !== undefined && (
        <>
          <span style={styles.key}>"{keyName}"</span>
          <span style={styles.colon}>:</span>
        </>
      )}
      {isExpandable ? renderExpandable() : renderPrimitive()}
    </div>
  );
};

export const JsonViewer: React.FC<JsonViewerProps> = ({
  data,
  name,
  initialExpanded = true,
  expandDepth = 2,
  showCopy = true,
  showLineNumbers = false,
  className,
}) => {
  const [copied, setCopied] = useState(false);
  const lineNumber = useMemo(() => ({ current: 0 }), [data]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div style={styles.container} className={className}>
      {(name || showCopy) && (
        <div style={styles.header}>
          {name && <span style={styles.title}>{name}</span>}
          {showCopy && (
            <button
              style={{
                ...styles.copyButton,
                ...(copied ? styles.copyButtonSuccess : {}),
              }}
              onClick={handleCopy}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
      )}
      <JsonValue
        value={data}
        depth={0}
        expandDepth={initialExpanded ? expandDepth : 0}
        isLast={true}
        showLineNumbers={showLineNumbers}
        lineNumber={lineNumber}
      />
    </div>
  );
};

// Compact inline JSON display
interface InlineJsonProps {
  data: unknown;
  maxLength?: number;
  className?: string;
}

export const InlineJson: React.FC<InlineJsonProps> = ({
  data,
  maxLength = 100,
  className,
}) => {
  const jsonString = JSON.stringify(data);
  const truncated = jsonString.length > maxLength;
  const displayString = truncated
    ? jsonString.slice(0, maxLength) + '...'
    : jsonString;

  return (
    <code
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.75rem',
        padding: '0.125rem 0.375rem',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '4px',
        color: '#a5d6ff',
      }}
      title={truncated ? jsonString : undefined}
      className={className}
    >
      {displayString}
    </code>
  );
};

export default JsonViewer;
