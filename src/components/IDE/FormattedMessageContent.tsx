import React from 'react';
import { CodeBlock } from './CodeBlock';
import styles from './FormattedMessageContent.module.css';
import { 
  Sparkles, CheckCircle, AlertCircle, Info, Lightbulb, 
  Zap, Star, Heart, ThumbsUp, ArrowRight, FileCode,
  Rocket, Target, Clock, Settings, Search, Edit3,
  Code, Terminal, File, Folder, Package, Globe
} from 'lucide-react';

// Map common emojis to Lucide icons
const emojiToIcon: Record<string, React.ReactNode> = {
  '✨': <Sparkles size={14} className={styles.inlineIcon} />,
  '🎉': <Sparkles size={14} className={styles.inlineIcon} />,
  '✅': <CheckCircle size={14} className={styles.inlineIcon} />,
  '☑️': <CheckCircle size={14} className={styles.inlineIcon} />,
  '❌': <AlertCircle size={14} className={styles.inlineIcon} />,
  '⚠️': <AlertCircle size={14} className={styles.inlineIcon} />,
  'ℹ️': <Info size={14} className={styles.inlineIcon} />,
  '💡': <Lightbulb size={14} className={styles.inlineIcon} />,
  '⚡': <Zap size={14} className={styles.inlineIcon} />,
  '🔥': <Zap size={14} className={styles.inlineIcon} />,
  '⭐': <Star size={14} className={styles.inlineIcon} />,
  '🌟': <Star size={14} className={styles.inlineIcon} />,
  '❤️': <Heart size={14} className={styles.inlineIcon} />,
  '💖': <Heart size={14} className={styles.inlineIcon} />,
  '👍': <ThumbsUp size={14} className={styles.inlineIcon} />,
  '👉': <ArrowRight size={14} className={styles.inlineIcon} />,
  '➡️': <ArrowRight size={14} className={styles.inlineIcon} />,
  '📝': <Edit3 size={14} className={styles.inlineIcon} />,
  '📄': <File size={14} className={styles.inlineIcon} />,
  '📁': <Folder size={14} className={styles.inlineIcon} />,
  '💻': <Code size={14} className={styles.inlineIcon} />,
  '🖥️': <Terminal size={14} className={styles.inlineIcon} />,
  '🚀': <Rocket size={14} className={styles.inlineIcon} />,
  '🎯': <Target size={14} className={styles.inlineIcon} />,
  '⏰': <Clock size={14} className={styles.inlineIcon} />,
  '🕐': <Clock size={14} className={styles.inlineIcon} />,
  '⚙️': <Settings size={14} className={styles.inlineIcon} />,
  '🔧': <Settings size={14} className={styles.inlineIcon} />,
  '🔍': <Search size={14} className={styles.inlineIcon} />,
  '📦': <Package size={14} className={styles.inlineIcon} />,
  '🌐': <Globe size={14} className={styles.inlineIcon} />,
  '📂': <Folder size={14} className={styles.inlineIcon} />,
  '🗂️': <Folder size={14} className={styles.inlineIcon} />,
};

// Replace emojis with icons in text
const replaceEmojisWithIcons = (text: string): React.ReactNode[] => {
  const emojiPattern = new RegExp(Object.keys(emojiToIcon).join('|'), 'g');
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let keyIndex = 0;

  while ((match = emojiPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(<span key={`icon-${keyIndex++}`}>{emojiToIcon[match[0]]}</span>);
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
};

interface FormattedMessageContentProps {
  content: string;
}

export const FormattedMessageContent: React.FC<FormattedMessageContentProps> = ({ content }) => {
  // Split content into text and code blocks
  const parts: Array<{ type: 'text' | 'code'; content: string; language?: string; filePath?: string }> = [];
  
  // Match code blocks - improved regex to handle various formats
  // Matches: ```lang, ```lang file:path, ```file:path, or just ```
  const codeBlockRegex = /```(\w+)?\s*(?:file:\s*)?([^\n]+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  // Reset regex lastIndex to ensure it works correctly
  codeBlockRegex.lastIndex = 0;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      const textContent = content.substring(lastIndex, match.index);
      if (textContent.trim()) {
        parts.push({ type: 'text', content: textContent });
      }
    }

    // Extract code block info
    const language = match[1] || undefined;
    const potentialPath = match[2]?.trim();
    const codeContent = match[3] || '';
    
    // Check if second match group is a file path
    const isFilePath = potentialPath && (
      potentialPath.includes('/') || 
      potentialPath.includes('\\') || 
      potentialPath.match(/\.\w+$/)
    );

    // Only add code block if it has content
    if (codeContent.trim()) {
      parts.push({
        type: 'code',
        content: codeContent.trim(),
        language: language,
        filePath: isFilePath ? potentialPath : undefined,
      });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    const textContent = content.substring(lastIndex);
    if (textContent.trim()) {
      parts.push({ type: 'text', content: textContent });
    }
  }

  // If no code blocks found, return plain text
  if (parts.length === 0) {
    return <div className={styles.textContent}>{content}</div>;
  }

  return (
    <div className={styles.formattedContent}>
      {parts.map((part, idx) => {
        if (part.type === 'code') {
          return (
            <CodeBlock
              key={idx}
              code={part.content}
              language={part.language}
              filePath={part.filePath}
            />
          );
        }
        return (
          <div key={idx} className={styles.textContent}>
            {part.content.split('\n').map((line, lineIdx) => (
              <React.Fragment key={lineIdx}>
                {replaceEmojisWithIcons(line)}
                {lineIdx < part.content.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>
        );
      })}
    </div>
  );
};

