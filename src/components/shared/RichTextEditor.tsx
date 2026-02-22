import React, { useState, useRef, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Link,
  Code,
  Quote,
  Heading1,
  Heading2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
} from 'lucide-react';

type RichTextEditorSize = 'sm' | 'md' | 'lg';

interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  size?: RichTextEditorSize;
  disabled?: boolean;
  readOnly?: boolean;
  minHeight?: string;
  maxHeight?: string;
  label?: string;
  errorText?: string;
  helperText?: string;
  className?: string;
}

interface ToolbarButton {
  icon: React.ReactNode;
  command: string;
  value?: string;
  title: string;
}

const SIZE_CONFIG: Record<RichTextEditorSize, {
  toolbarPadding: string;
  editorPadding: string;
  fontSize: string;
  iconSize: number;
  labelSize: string;
  minHeight: string;
}> = {
  sm: {
    toolbarPadding: '0.25rem',
    editorPadding: '0.5rem',
    fontSize: '0.8125rem',
    iconSize: 14,
    labelSize: '0.75rem',
    minHeight: '100px',
  },
  md: {
    toolbarPadding: '0.375rem',
    editorPadding: '0.75rem',
    fontSize: '0.875rem',
    iconSize: 16,
    labelSize: '0.8125rem',
    minHeight: '150px',
  },
  lg: {
    toolbarPadding: '0.5rem',
    editorPadding: '1rem',
    fontSize: '1rem',
    iconSize: 18,
    labelSize: '0.875rem',
    minHeight: '200px',
  },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  label: {
    color: '#ccc',
    fontWeight: '500',
  },
  wrapper: {
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '10px',
    overflow: 'hidden',
    background: 'rgba(255, 255, 255, 0.02)',
    transition: 'all 0.2s',
  },
  wrapperFocused: {
    borderColor: 'rgba(99, 102, 241, 0.5)',
    boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.15)',
  },
  wrapperError: {
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  toolbar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.125rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(255, 255, 255, 0.03)',
  },
  toolbarGroup: {
    display: 'flex',
    gap: '0.125rem',
    padding: '0 0.25rem',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
  },
  toolbarButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    background: 'transparent',
    border: 'none',
    borderRadius: '4px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  toolbarButtonHover: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
  },
  toolbarButtonActive: {
    background: 'rgba(99, 102, 241, 0.2)',
    color: '#818cf8',
  },
  editor: {
    outline: 'none',
    color: '#e4e4e7',
    lineHeight: '1.6',
    overflowY: 'auto',
  },
  placeholder: {
    color: '#666',
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  helperText: {
    fontSize: '0.75rem',
    color: '#888',
  },
  errorText: {
    fontSize: '0.75rem',
    color: '#ef4444',
  },
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = '',
  onChange,
  placeholder = 'Start typing...',
  size = 'md',
  disabled = false,
  readOnly = false,
  minHeight,
  maxHeight,
  label,
  errorText,
  helperText,
  className,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const sizeConfig = SIZE_CONFIG[size];

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    if (editorRef.current) {
      onChange?.(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange?.(editorRef.current.innerHTML);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const toolbarGroups: ToolbarButton[][] = [
    [
      { icon: <Undo size={sizeConfig.iconSize} />, command: 'undo', title: 'Undo' },
      { icon: <Redo size={sizeConfig.iconSize} />, command: 'redo', title: 'Redo' },
    ],
    [
      { icon: <Heading1 size={sizeConfig.iconSize} />, command: 'formatBlock', value: 'h1', title: 'Heading 1' },
      { icon: <Heading2 size={sizeConfig.iconSize} />, command: 'formatBlock', value: 'h2', title: 'Heading 2' },
    ],
    [
      { icon: <Bold size={sizeConfig.iconSize} />, command: 'bold', title: 'Bold' },
      { icon: <Italic size={sizeConfig.iconSize} />, command: 'italic', title: 'Italic' },
      { icon: <Underline size={sizeConfig.iconSize} />, command: 'underline', title: 'Underline' },
      { icon: <Strikethrough size={sizeConfig.iconSize} />, command: 'strikeThrough', title: 'Strikethrough' },
    ],
    [
      { icon: <List size={sizeConfig.iconSize} />, command: 'insertUnorderedList', title: 'Bullet List' },
      { icon: <ListOrdered size={sizeConfig.iconSize} />, command: 'insertOrderedList', title: 'Numbered List' },
    ],
    [
      { icon: <AlignLeft size={sizeConfig.iconSize} />, command: 'justifyLeft', title: 'Align Left' },
      { icon: <AlignCenter size={sizeConfig.iconSize} />, command: 'justifyCenter', title: 'Align Center' },
      { icon: <AlignRight size={sizeConfig.iconSize} />, command: 'justifyRight', title: 'Align Right' },
    ],
    [
      { icon: <Quote size={sizeConfig.iconSize} />, command: 'formatBlock', value: 'blockquote', title: 'Quote' },
      { icon: <Code size={sizeConfig.iconSize} />, command: 'formatBlock', value: 'pre', title: 'Code Block' },
    ],
  ];

  const isEmpty = !value || value === '<br>' || value === '<div><br></div>';

  return (
    <div style={styles.container} className={className}>
      {label && (
        <label style={{ ...styles.label, fontSize: sizeConfig.labelSize }}>
          {label}
        </label>
      )}

      <div
        style={{
          ...styles.wrapper,
          ...(isFocused ? styles.wrapperFocused : {}),
          ...(errorText ? styles.wrapperError : {}),
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {!readOnly && (
          <div style={{ ...styles.toolbar, padding: sizeConfig.toolbarPadding }}>
            {toolbarGroups.map((group, groupIndex) => (
              <div
                key={groupIndex}
                style={{
                  ...styles.toolbarGroup,
                  ...(groupIndex === toolbarGroups.length - 1 ? { borderRight: 'none' } : {}),
                }}
              >
                {group.map((button) => {
                  const buttonKey = `${button.command}-${button.value || ''}`;
                  const isHovered = hoveredButton === buttonKey;

                  return (
                    <button
                      key={buttonKey}
                      style={{
                        ...styles.toolbarButton,
                        ...(isHovered ? styles.toolbarButtonHover : {}),
                      }}
                      onClick={() => execCommand(button.command, button.value)}
                      onMouseEnter={() => setHoveredButton(buttonKey)}
                      onMouseLeave={() => setHoveredButton(null)}
                      title={button.title}
                      disabled={disabled}
                      type="button"
                    >
                      {button.icon}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        <div style={{ position: 'relative' }}>
          {isEmpty && !isFocused && (
            <div
              style={{
                ...styles.placeholder,
                padding: sizeConfig.editorPadding,
                fontSize: sizeConfig.fontSize,
              }}
            >
              {placeholder}
            </div>
          )}
          <div
            ref={editorRef}
            contentEditable={!disabled && !readOnly}
            onInput={handleInput}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onPaste={handlePaste}
            dangerouslySetInnerHTML={{ __html: value }}
            style={{
              ...styles.editor,
              padding: sizeConfig.editorPadding,
              fontSize: sizeConfig.fontSize,
              minHeight: minHeight || sizeConfig.minHeight,
              maxHeight: maxHeight,
            }}
          />
        </div>
      </div>

      {errorText && <span style={styles.errorText}>{errorText}</span>}
      {helperText && !errorText && <span style={styles.helperText}>{helperText}</span>}
    </div>
  );
};

// Simple markdown-style text area
interface MarkdownEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value = '',
  onChange,
  placeholder = 'Write in markdown...',
  minHeight = '150px',
  maxHeight,
  disabled = false,
  label,
  className,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div style={styles.container} className={className}>
      {label && (
        <label style={{ ...styles.label, fontSize: '0.8125rem' }}>
          {label}
        </label>
      )}

      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: '100%',
          minHeight,
          maxHeight,
          padding: '0.75rem',
          background: 'rgba(255, 255, 255, 0.05)',
          border: `1px solid ${isFocused ? 'rgba(99, 102, 241, 0.5)' : 'rgba(255, 255, 255, 0.15)'}`,
          borderRadius: '10px',
          color: '#e4e4e7',
          fontSize: '0.875rem',
          fontFamily: "'JetBrains Mono', monospace",
          lineHeight: '1.6',
          resize: 'vertical',
          outline: 'none',
          transition: 'all 0.2s',
          boxShadow: isFocused ? '0 0 0 3px rgba(99, 102, 241, 0.15)' : 'none',
        }}
      />
    </div>
  );
};

export default RichTextEditor;
