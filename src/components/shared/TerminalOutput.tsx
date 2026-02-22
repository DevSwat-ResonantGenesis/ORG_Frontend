import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Copy, Check, Maximize2, Minimize2, X } from 'lucide-react';

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'info' | 'success';
  content: string;
  timestamp?: Date;
}

interface TerminalOutputProps {
  lines: TerminalLine[];
  title?: string;
  prompt?: string;
  maxHeight?: string;
  showTimestamps?: boolean;
  showCopy?: boolean;
  showFullscreen?: boolean;
  autoScroll?: boolean;
  onClear?: () => void;
  className?: string;
}

const TYPE_COLORS: Record<TerminalLine['type'], string> = {
  input: '#a5d6ff',
  output: '#e4e4e7',
  error: '#ff7b72',
  info: '#79c0ff',
  success: '#7ee787',
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    background: '#0d1117',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  containerFullscreen: {
    position: 'fixed',
    inset: '1rem',
    zIndex: 1000,
    borderRadius: '12px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.625rem 1rem',
    background: 'rgba(255, 255, 255, 0.03)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  dots: {
    display: 'flex',
    gap: '0.375rem',
  },
  dot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
  },
  title: {
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: '#888',
    marginLeft: '0.5rem',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#666',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  actionButtonHover: {
    background: 'rgba(255, 255, 255, 0.08)',
    color: '#fff',
  },
  body: {
    flex: 1,
    overflow: 'auto',
    padding: '1rem',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.8125rem',
    lineHeight: 1.6,
  },
  line: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    marginBottom: '0.25rem',
  },
  timestamp: {
    color: '#444',
    fontSize: '0.6875rem',
    flexShrink: 0,
  },
  prompt: {
    color: '#7ee787',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  cursor: {
    display: 'inline-block',
    width: '8px',
    height: '16px',
    background: '#7ee787',
    animation: 'blink 1s step-end infinite',
  },
  empty: {
    color: '#666',
    fontStyle: 'italic',
  },
};

export const TerminalOutput: React.FC<TerminalOutputProps> = ({
  lines,
  title = 'Terminal',
  prompt = '$',
  maxHeight = '400px',
  showTimestamps = false,
  showCopy = true,
  showFullscreen = true,
  autoScroll = true,
  onClear,
  className,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [lines, autoScroll]);

  const handleCopy = async () => {
    const text = lines.map((l) => l.content).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div
      style={{
        ...styles.container,
        ...(isFullscreen ? styles.containerFullscreen : {}),
      }}
      className={className}
    >
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.dots}>
            <div style={{ ...styles.dot, background: '#ff5f56' }} />
            <div style={{ ...styles.dot, background: '#ffbd2e' }} />
            <div style={{ ...styles.dot, background: '#27c93f' }} />
          </div>
          <Terminal size={14} style={{ color: '#666' }} />
          <span style={styles.title}>{title}</span>
        </div>

        <div style={styles.actions}>
          {showCopy && (
            <button
              style={{
                ...styles.actionButton,
                ...(hoveredAction === 'copy' ? styles.actionButtonHover : {}),
                color: copied ? '#10b981' : undefined,
              }}
              onClick={handleCopy}
              onMouseEnter={() => setHoveredAction('copy')}
              onMouseLeave={() => setHoveredAction(null)}
              title={copied ? 'Copied!' : 'Copy output'}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          )}

          {showFullscreen && (
            <button
              style={{
                ...styles.actionButton,
                ...(hoveredAction === 'fullscreen' ? styles.actionButtonHover : {}),
              }}
              onClick={() => setIsFullscreen(!isFullscreen)}
              onMouseEnter={() => setHoveredAction('fullscreen')}
              onMouseLeave={() => setHoveredAction(null)}
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          )}

          {onClear && (
            <button
              style={{
                ...styles.actionButton,
                ...(hoveredAction === 'clear' ? styles.actionButtonHover : {}),
              }}
              onClick={onClear}
              onMouseEnter={() => setHoveredAction('clear')}
              onMouseLeave={() => setHoveredAction(null)}
              title="Clear terminal"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div
        ref={bodyRef}
        style={{
          ...styles.body,
          maxHeight: isFullscreen ? 'none' : maxHeight,
        }}
      >
        {lines.length === 0 ? (
          <span style={styles.empty}>No output</span>
        ) : (
          lines.map((line) => (
            <div key={line.id} style={styles.line}>
              {showTimestamps && line.timestamp && (
                <span style={styles.timestamp}>
                  [{formatTimestamp(line.timestamp)}]
                </span>
              )}
              {line.type === 'input' && (
                <span style={styles.prompt}>{prompt}</span>
              )}
              <span
                style={{
                  ...styles.content,
                  color: TYPE_COLORS[line.type],
                }}
              >
                {line.content}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Interactive terminal with input
interface InteractiveTerminalProps extends Omit<TerminalOutputProps, 'lines'> {
  lines: TerminalLine[];
  onCommand?: (command: string) => void;
  disabled?: boolean;
}

export const InteractiveTerminal: React.FC<InteractiveTerminalProps> = ({
  lines,
  onCommand,
  disabled = false,
  prompt = '$',
  ...props
}) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && onCommand) {
      onCommand(input.trim());
      setInput('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <TerminalOutput lines={lines} prompt={prompt} {...props} />
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          background: '#0d1117',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        <span style={{ color: '#7ee787' }}>{prompt}</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={disabled}
          placeholder={disabled ? 'Terminal disabled' : 'Enter command...'}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#e4e4e7',
            fontSize: '0.8125rem',
            fontFamily: 'inherit',
          }}
        />
      </form>
    </div>
  );
};

export default TerminalOutput;
