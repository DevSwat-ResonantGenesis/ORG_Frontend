import React, { useMemo } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: '0.9375rem',
    lineHeight: 1.7,
    color: '#e4e4e7',
  },
  h1: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#fff',
    marginTop: '1.5rem',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  h2: {
    fontSize: '1.375rem',
    fontWeight: '600',
    color: '#fff',
    marginTop: '1.5rem',
    marginBottom: '0.75rem',
  },
  h3: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#fff',
    marginTop: '1.25rem',
    marginBottom: '0.5rem',
  },
  h4: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#e4e4e7',
    marginTop: '1rem',
    marginBottom: '0.5rem',
  },
  p: {
    marginTop: '0',
    marginBottom: '1rem',
  },
  a: {
    color: '#818cf8',
    textDecoration: 'none',
  },
  strong: {
    fontWeight: '600',
    color: '#fff',
  },
  em: {
    fontStyle: 'italic',
  },
  code: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.8125rem',
    padding: '0.125rem 0.375rem',
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '4px',
    color: '#a5d6ff',
  },
  pre: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.8125rem',
    padding: '1rem',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '8px',
    overflow: 'auto',
    marginTop: '0',
    marginBottom: '1rem',
  },
  blockquote: {
    margin: '1rem 0',
    padding: '0.75rem 1rem',
    borderLeft: '3px solid #6366f1',
    background: 'rgba(99, 102, 241, 0.1)',
    borderRadius: '0 8px 8px 0',
    color: '#ccc',
  },
  ul: {
    marginTop: '0',
    marginBottom: '1rem',
    paddingLeft: '1.5rem',
  },
  ol: {
    marginTop: '0',
    marginBottom: '1rem',
    paddingLeft: '1.5rem',
  },
  li: {
    marginBottom: '0.375rem',
  },
  hr: {
    border: 'none',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    margin: '1.5rem 0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '1rem',
  },
  th: {
    padding: '0.625rem 0.75rem',
    textAlign: 'left',
    fontWeight: '600',
    color: '#fff',
    borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  td: {
    padding: '0.625rem 0.75rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  img: {
    maxWidth: '100%',
    borderRadius: '8px',
  },
  checkbox: {
    marginRight: '0.5rem',
  },
};

function parseMarkdown(content: string): React.ReactNode[] {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let codeBlock: { lang: string; lines: string[] } | null = null;
  let tableRows: string[][] | null = null;
  let key = 0;

  const parseInline = (text: string): React.ReactNode[] => {
    const result: React.ReactNode[] = [];
    let remaining = text;
    let inlineKey = 0;

    while (remaining.length > 0) {
      // Code
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        result.push(<code key={inlineKey++} style={styles.code}>{codeMatch[1]}</code>);
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      // Bold
      const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
      if (boldMatch) {
        result.push(<strong key={inlineKey++} style={styles.strong}>{boldMatch[1]}</strong>);
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // Italic
      const italicMatch = remaining.match(/^\*([^*]+)\*/);
      if (italicMatch) {
        result.push(<em key={inlineKey++} style={styles.em}>{italicMatch[1]}</em>);
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // Link
      const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        result.push(
          <a key={inlineKey++} href={linkMatch[2]} style={styles.a} target="_blank" rel="noopener noreferrer">
            {linkMatch[1]}
          </a>
        );
        remaining = remaining.slice(linkMatch[0].length);
        continue;
      }

      // Regular text
      const nextSpecial = remaining.search(/[`*\[]/);
      if (nextSpecial === -1) {
        result.push(remaining);
        break;
      } else if (nextSpecial === 0) {
        result.push(remaining[0]);
        remaining = remaining.slice(1);
      } else {
        result.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      }
    }

    return result;
  };

  const flushList = () => {
    if (currentList) {
      const ListTag = currentList.type === 'ul' ? 'ul' : 'ol';
      elements.push(
        <ListTag key={key++} style={currentList.type === 'ul' ? styles.ul : styles.ol}>
          {currentList.items.map((item, i) => (
            <li key={i} style={styles.li}>{parseInline(item)}</li>
          ))}
        </ListTag>
      );
      currentList = null;
    }
  };

  const flushTable = () => {
    if (tableRows && tableRows.length > 0) {
      const headers = tableRows[0];
      const body = tableRows.slice(2); // Skip header separator
      elements.push(
        <table key={key++} style={styles.table}>
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} style={styles.th}>{parseInline(h.trim())}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} style={styles.td}>{parseInline(cell.trim())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
      tableRows = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block
    if (line.startsWith('```')) {
      if (codeBlock) {
        elements.push(
          <pre key={key++} style={styles.pre}>
            <code>{codeBlock.lines.join('\n')}</code>
          </pre>
        );
        codeBlock = null;
      } else {
        flushList();
        flushTable();
        codeBlock = { lang: line.slice(3), lines: [] };
      }
      continue;
    }

    if (codeBlock) {
      codeBlock.lines.push(line);
      continue;
    }

    // Table
    if (line.includes('|') && line.trim().startsWith('|')) {
      flushList();
      const cells = line.split('|').filter((c, i, arr) => i > 0 && i < arr.length - 1);
      if (!tableRows) {
        tableRows = [];
      }
      tableRows.push(cells);
      continue;
    } else {
      flushTable();
    }

    // Headers
    const h1Match = line.match(/^# (.+)/);
    if (h1Match) {
      flushList();
      elements.push(<h1 key={key++} style={styles.h1}>{parseInline(h1Match[1])}</h1>);
      continue;
    }

    const h2Match = line.match(/^## (.+)/);
    if (h2Match) {
      flushList();
      elements.push(<h2 key={key++} style={styles.h2}>{parseInline(h2Match[1])}</h2>);
      continue;
    }

    const h3Match = line.match(/^### (.+)/);
    if (h3Match) {
      flushList();
      elements.push(<h3 key={key++} style={styles.h3}>{parseInline(h3Match[1])}</h3>);
      continue;
    }

    const h4Match = line.match(/^#### (.+)/);
    if (h4Match) {
      flushList();
      elements.push(<h4 key={key++} style={styles.h4}>{parseInline(h4Match[1])}</h4>);
      continue;
    }

    // Horizontal rule
    if (line.match(/^---+$/)) {
      flushList();
      elements.push(<hr key={key++} style={styles.hr} />);
      continue;
    }

    // Blockquote
    const quoteMatch = line.match(/^> (.+)/);
    if (quoteMatch) {
      flushList();
      elements.push(
        <blockquote key={key++} style={styles.blockquote}>
          {parseInline(quoteMatch[1])}
        </blockquote>
      );
      continue;
    }

    // Unordered list
    const ulMatch = line.match(/^[-*] (.+)/);
    if (ulMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(ulMatch[1]);
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^\d+\. (.+)/);
    if (olMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(olMatch[1]);
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      flushList();
      continue;
    }

    // Paragraph
    flushList();
    elements.push(<p key={key++} style={styles.p}>{parseInline(line)}</p>);
  }

  flushList();
  flushTable();

  return elements;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className,
}) => {
  const elements = useMemo(() => parseMarkdown(content), [content]);

  return (
    <div style={styles.container} className={className}>
      {elements}
    </div>
  );
};

// Compact markdown for single-line rendering
interface InlineMarkdownProps {
  content: string;
  className?: string;
}

export const InlineMarkdown: React.FC<InlineMarkdownProps> = ({
  content,
  className,
}) => {
  const parseInline = (text: string): React.ReactNode[] => {
    const result: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        result.push(<code key={key++} style={styles.code}>{codeMatch[1]}</code>);
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
      if (boldMatch) {
        result.push(<strong key={key++} style={styles.strong}>{boldMatch[1]}</strong>);
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      const nextSpecial = remaining.search(/[`*]/);
      if (nextSpecial === -1) {
        result.push(remaining);
        break;
      } else if (nextSpecial === 0) {
        result.push(remaining[0]);
        remaining = remaining.slice(1);
      } else {
        result.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      }
    }

    return result;
  };

  return <span className={className}>{parseInline(content)}</span>;
};

export default MarkdownRenderer;
