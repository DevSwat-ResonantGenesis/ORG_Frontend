import React, { useState } from 'react';
import { Copy, Check, Terminal, Code, FileCode } from 'lucide-react';

type CodeBlockVariant = 'default' | 'terminal' | 'inline';
type CodeBlockTheme = 'dark' | 'darker' | 'light';

interface CodeBlockProps {
  code: string;
  language?: string;
  variant?: CodeBlockVariant;
  theme?: CodeBlockTheme;
  showLineNumbers?: boolean;
  showCopyButton?: boolean;
  showLanguage?: boolean;
  title?: string;
  highlightLines?: number[];
  maxHeight?: string;
  className?: string;
}

const THEME_CONFIG: Record<CodeBlockTheme, {
  bg: string;
  headerBg: string;
  border: string;
  text: string;
  lineNumber: string;
  highlight: string;
}> = {
  dark: {
    bg: '#1a1a24',
    headerBg: 'rgba(255, 255, 255, 0.05)',
    border: 'rgba(255, 255, 255, 0.1)',
    text: '#e4e4e7',
    lineNumber: '#52525b',
    highlight: 'rgba(99, 102, 241, 0.15)',
  },
  darker: {
    bg: '#0d0d12',
    headerBg: 'rgba(255, 255, 255, 0.03)',
    border: 'rgba(255, 255, 255, 0.08)',
    text: '#d4d4d8',
    lineNumber: '#3f3f46',
    highlight: 'rgba(99, 102, 241, 0.2)',
  },
  light: {
    bg: '#f8f8f8',
    headerBg: '#e8e8e8',
    border: '#d0d0d0',
    text: '#1a1a1a',
    lineNumber: '#888888',
    highlight: 'rgba(99, 102, 241, 0.1)',
  },
};

const LANGUAGE_ICONS: Record<string, React.ReactNode> = {
  bash: <Terminal size={14} />,
  sh: <Terminal size={14} />,
  shell: <Terminal size={14} />,
  terminal: <Terminal size={14} />,
  default: <Code size={14} />,
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    borderRadius: '10px',
    overflow: 'hidden',
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', monospace",
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.5rem 1rem',
    fontSize: '0.75rem',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  dots: {
    display: 'flex',
    gap: '6px',
  },
  dot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
  },
  language: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  copyButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.25rem 0.5rem',
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  codeWrapper: {
    padding: '1rem',
    overflowX: 'auto',
  },
  code: {
    display: 'block',
    fontSize: '0.8125rem',
    lineHeight: '1.6',
    whiteSpace: 'pre',
    margin: 0,
  },
  lineContainer: {
    display: 'table',
    width: '100%',
  },
  line: {
    display: 'table-row',
  },
  lineNumber: {
    display: 'table-cell',
    textAlign: 'right',
    paddingRight: '1rem',
    userSelect: 'none',
    width: '1%',
    whiteSpace: 'nowrap',
    fontSize: '0.75rem',
  },
  lineContent: {
    display: 'table-cell',
    whiteSpace: 'pre',
  },
  inline: {
    display: 'inline',
    padding: '0.125rem 0.375rem',
    borderRadius: '4px',
    fontSize: '0.8125rem',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  },
};

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'text',
  variant = 'default',
  theme = 'dark',
  showLineNumbers = true,
  showCopyButton = true,
  showLanguage = true,
  title,
  highlightLines = [],
  maxHeight,
  className,
}) => {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const themeConfig = THEME_CONFIG[theme];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const lines = code.split('\n');
  const LanguageIcon = LANGUAGE_ICONS[language.toLowerCase()] || LANGUAGE_ICONS.default;

  if (variant === 'inline') {
    return (
      <code
        style={{
          ...styles.inline,
          background: themeConfig.bg,
          color: themeConfig.text,
        }}
        className={className}
      >
        {code}
      </code>
    );
  }

  return (
    <div
      style={{
        ...styles.container,
        background: themeConfig.bg,
        border: `1px solid ${themeConfig.border}`,
      }}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {(title || showLanguage || showCopyButton) && (
        <div
          style={{
            ...styles.header,
            background: themeConfig.headerBg,
            borderBottom: `1px solid ${themeConfig.border}`,
          }}
        >
          <div style={styles.headerLeft}>
            {variant === 'terminal' && (
              <div style={styles.dots}>
                <span style={{ ...styles.dot, background: '#ff5f56' }} />
                <span style={{ ...styles.dot, background: '#ffbd2e' }} />
                <span style={{ ...styles.dot, background: '#27c93f' }} />
              </div>
            )}
            {title && (
              <span style={{ color: themeConfig.text, fontWeight: '500' }}>
                {title}
              </span>
            )}
            {showLanguage && !title && (
              <span style={{ ...styles.language, color: themeConfig.lineNumber }}>
                {LanguageIcon}
                {language}
              </span>
            )}
          </div>

          {showCopyButton && (
            <button
              style={{
                ...styles.copyButton,
                color: copied ? '#10b981' : themeConfig.text,
                opacity: isHovered || copied ? 1 : 0.5,
              }}
              onClick={handleCopy}
              aria-label={copied ? 'Copied!' : 'Copy code'}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>
      )}

      <div
        style={{
          ...styles.codeWrapper,
          maxHeight: maxHeight,
          overflowY: maxHeight ? 'auto' : undefined,
        }}
      >
        {showLineNumbers ? (
          <div style={styles.lineContainer}>
            {lines.map((line, index) => {
              const lineNum = index + 1;
              const isHighlighted = highlightLines.includes(lineNum);

              return (
                <div
                  key={index}
                  style={{
                    ...styles.line,
                    background: isHighlighted ? themeConfig.highlight : 'transparent',
                  }}
                >
                  <span style={{ ...styles.lineNumber, color: themeConfig.lineNumber }}>
                    {lineNum}
                  </span>
                  <span style={{ ...styles.lineContent, color: themeConfig.text }}>
                    {line || ' '}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <pre style={{ ...styles.code, color: themeConfig.text }}>{code}</pre>
        )}
      </div>
    </div>
  );
};

// Inline code component
interface InlineCodeProps {
  children: React.ReactNode;
  theme?: CodeBlockTheme;
  className?: string;
}

export const InlineCode: React.FC<InlineCodeProps> = ({
  children,
  theme = 'dark',
  className,
}) => {
  const themeConfig = THEME_CONFIG[theme];

  return (
    <code
      style={{
        ...styles.inline,
        background: themeConfig.bg,
        color: themeConfig.text,
        border: `1px solid ${themeConfig.border}`,
      }}
      className={className}
    >
      {children}
    </code>
  );
};

export default CodeBlock;
