import React, { useState } from 'react';
import { User, Bot, Copy, Check, ThumbsUp, ThumbsDown, RotateCcw, MoreVertical } from 'lucide-react';

type MessageRole = 'user' | 'assistant' | 'system';
type MessageStatus = 'sending' | 'sent' | 'error';

interface ChatMessageProps {
  role: MessageRole;
  content: string;
  timestamp?: Date;
  avatar?: React.ReactNode;
  name?: string;
  status?: MessageStatus;
  isStreaming?: boolean;
  showActions?: boolean;
  onCopy?: () => void;
  onRegenerate?: () => void;
  onFeedback?: (positive: boolean) => void;
  className?: string;
}

const ROLE_CONFIG: Record<MessageRole, {
  icon: React.ReactNode;
  name: string;
  bgColor: string;
  iconBg: string;
  iconColor: string;
}> = {
  user: {
    icon: <User size={16} />,
    name: 'You',
    bgColor: 'rgba(99, 102, 241, 0.08)',
    iconBg: '#6366f1',
    iconColor: '#fff',
  },
  assistant: {
    icon: <Bot size={16} />,
    name: 'Assistant',
    bgColor: 'rgba(255, 255, 255, 0.02)',
    iconBg: 'rgba(16, 185, 129, 0.15)',
    iconColor: '#10b981',
  },
  system: {
    icon: <Bot size={16} />,
    name: 'System',
    bgColor: 'rgba(245, 158, 11, 0.08)',
    iconBg: 'rgba(245, 158, 11, 0.15)',
    iconColor: '#f59e0b',
  },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    gap: '0.875rem',
    padding: '1rem 1.25rem',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.375rem',
  },
  name: {
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: '#fff',
  },
  timestamp: {
    fontSize: '0.6875rem',
    color: '#666',
  },
  status: {
    fontSize: '0.6875rem',
    color: '#888',
  },
  statusError: {
    color: '#ef4444',
  },
  message: {
    fontSize: '0.9375rem',
    lineHeight: 1.7,
    color: '#e4e4e7',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  streamingCursor: {
    display: 'inline-block',
    width: '8px',
    height: '16px',
    background: '#6366f1',
    marginLeft: '2px',
    animation: 'blink 1s step-end infinite',
    verticalAlign: 'text-bottom',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    marginTop: '0.75rem',
    opacity: 0,
    transition: 'opacity 0.15s',
  },
  actionsVisible: {
    opacity: 1,
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
  actionButtonActive: {
    color: '#10b981',
  },
};

export const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  timestamp,
  avatar,
  name,
  status,
  isStreaming = false,
  showActions = true,
  onCopy,
  onRegenerate,
  onFeedback,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const config = ROLE_CONFIG[role];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.();
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleFeedback = (positive: boolean) => {
    setFeedback(positive ? 'positive' : 'negative');
    onFeedback?.(positive);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div
      style={{
        ...styles.container,
        background: config.bgColor,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
    >
      <div
        style={{
          ...styles.avatar,
          background: config.iconBg,
          color: config.iconColor,
        }}
      >
        {avatar || config.icon}
      </div>

      <div style={styles.content}>
        <div style={styles.header}>
          <span style={styles.name}>{name || config.name}</span>
          {timestamp && (
            <span style={styles.timestamp}>{formatTimestamp(timestamp)}</span>
          )}
          {status === 'sending' && (
            <span style={styles.status}>Sending...</span>
          )}
          {status === 'error' && (
            <span style={{ ...styles.status, ...styles.statusError }}>
              Failed to send
            </span>
          )}
        </div>

        <div style={styles.message}>
          {content}
          {isStreaming && <span style={styles.streamingCursor} />}
        </div>

        {showActions && role === 'assistant' && !isStreaming && (
          <div
            style={{
              ...styles.actions,
              ...(isHovered ? styles.actionsVisible : {}),
            }}
          >
            <button
              style={{
                ...styles.actionButton,
                ...(hoveredAction === 'copy' ? styles.actionButtonHover : {}),
                ...(copied ? styles.actionButtonActive : {}),
              }}
              onClick={handleCopy}
              onMouseEnter={() => setHoveredAction('copy')}
              onMouseLeave={() => setHoveredAction(null)}
              title={copied ? 'Copied!' : 'Copy'}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>

            {onRegenerate && (
              <button
                style={{
                  ...styles.actionButton,
                  ...(hoveredAction === 'regenerate' ? styles.actionButtonHover : {}),
                }}
                onClick={onRegenerate}
                onMouseEnter={() => setHoveredAction('regenerate')}
                onMouseLeave={() => setHoveredAction(null)}
                title="Regenerate"
              >
                <RotateCcw size={14} />
              </button>
            )}

            {onFeedback && (
              <>
                <button
                  style={{
                    ...styles.actionButton,
                    ...(hoveredAction === 'thumbsUp' ? styles.actionButtonHover : {}),
                    ...(feedback === 'positive' ? styles.actionButtonActive : {}),
                  }}
                  onClick={() => handleFeedback(true)}
                  onMouseEnter={() => setHoveredAction('thumbsUp')}
                  onMouseLeave={() => setHoveredAction(null)}
                  title="Good response"
                >
                  <ThumbsUp size={14} />
                </button>
                <button
                  style={{
                    ...styles.actionButton,
                    ...(hoveredAction === 'thumbsDown' ? styles.actionButtonHover : {}),
                    ...(feedback === 'negative' ? { color: '#ef4444' } : {}),
                  }}
                  onClick={() => handleFeedback(false)}
                  onMouseEnter={() => setHoveredAction('thumbsDown')}
                  onMouseLeave={() => setHoveredAction(null)}
                  title="Bad response"
                >
                  <ThumbsDown size={14} />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Chat container
interface ChatContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  children,
  className,
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(255, 255, 255, 0.01)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      overflow: 'hidden',
    }}
    className={className}
  >
    {children}
  </div>
);

// Typing indicator
interface TypingIndicatorProps {
  name?: string;
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  name = 'Assistant',
  className,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.25rem',
      color: '#888',
      fontSize: '0.8125rem',
    }}
    className={className}
  >
    <span>{name} is typing</span>
    <span style={{ display: 'flex', gap: '2px' }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: '#888',
            animation: `bounce 1.4s infinite ease-in-out both`,
            animationDelay: `${i * 0.16}s`,
          }}
        />
      ))}
    </span>
  </div>
);

// Message divider
interface MessageDividerProps {
  label: string;
  className?: string;
}

export const MessageDivider: React.FC<MessageDividerProps> = ({
  label,
  className,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '0.75rem 1.25rem',
    }}
    className={className}
  >
    <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
    <span style={{ fontSize: '0.6875rem', color: '#666', textTransform: 'uppercase' }}>
      {label}
    </span>
    <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
  </div>
);

export default ChatMessage;
