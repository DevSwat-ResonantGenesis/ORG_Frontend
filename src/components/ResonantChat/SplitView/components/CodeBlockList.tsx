// CodeBlockList Component - Display code blocks from messages

import React from 'react';
// @ts-ignore
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// @ts-ignore
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyIcon } from '@/components/Icons/ResonantChatIcons';
import type { CodeBlock } from '../types';
import styles from '../EnhancedSplitView.module.css';

interface CodeBlockListProps {
  codeBlocks: CodeBlock[];
  onCopyCode: (code: string) => void;
}

export const CodeBlockList: React.FC<CodeBlockListProps> = ({
  codeBlocks,
  onCopyCode,
}) => {
  return (
    <div className={styles.codeBlocksList}>
      {codeBlocks.map(({ language, code, idx }) => (
        <div key={idx} className={styles.codeBlock}>
          <div className={styles.codeBlockHeader}>
            <span className={styles.codeBlockLanguage}>{language}</span>
            <button
              className={styles.codeBlockCopy}
              onClick={() => onCopyCode(code)}
              title="Copy code"
            >
              <CopyIcon />
            </button>
          </div>
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={language}
            PreTag="div"
            customStyle={{
              margin: 0,
              padding: '12px',
              background: 'transparent',
              fontSize: '13px',
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      ))}
    </div>
  );
};

export default CodeBlockList;
