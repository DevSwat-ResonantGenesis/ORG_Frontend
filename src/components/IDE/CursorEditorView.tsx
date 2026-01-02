import React, { Suspense, lazy, useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { LoadingState } from '@/components/shared/LoadingState';
import { InlineActions } from './InlineActions';
import { useThemeStore } from '@/store/themeStore';
import styles from './CursorEditorView.module.css';

// Define custom dark theme (VS Code Dark+ style with vibrant colors)
const defineCustomThemes = (monaco: any) => {
  // VS Code Dark+ Theme (vibrant colors like Windsurf/VS Code)
  // Using Monaco's actual token names for JavaScript/TypeScript
  monaco.editor.defineTheme('resonant-dark', {
    base: 'vs-dark',
    inherit: true, // Inherit base rules for languages we don't explicitly define
    rules: [
      // Default
      { token: '', foreground: 'D4D4D4' },
      
      // Comments (green)
      { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
      { token: 'comment.js', foreground: '6A9955', fontStyle: 'italic' },
      { token: 'comment.ts', foreground: '6A9955', fontStyle: 'italic' },
      { token: 'comment.css', foreground: '6A9955', fontStyle: 'italic' },
      
      // Keywords (blue)
      { token: 'keyword', foreground: '569CD6' },
      { token: 'keyword.js', foreground: '569CD6' },
      { token: 'keyword.ts', foreground: '569CD6' },
      { token: 'keyword.css', foreground: '569CD6' },
      
      // Control keywords (purple/magenta)
      { token: 'keyword.control', foreground: 'C586C0' },
      { token: 'keyword.control.js', foreground: 'C586C0' },
      { token: 'keyword.control.ts', foreground: 'C586C0' },
      
      // Strings (orange)
      { token: 'string', foreground: 'CE9178' },
      { token: 'string.js', foreground: 'CE9178' },
      { token: 'string.ts', foreground: 'CE9178' },
      { token: 'string.html', foreground: 'CE9178' },
      { token: 'string.css', foreground: 'CE9178' },
      { token: 'string.value.css', foreground: 'CE9178' },
      
      // Numbers (light green)
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'number.js', foreground: 'B5CEA8' },
      { token: 'number.ts', foreground: 'B5CEA8' },
      { token: 'number.hex', foreground: 'B5CEA8' },
      { token: 'number.css', foreground: 'B5CEA8' },
      { token: 'number.hex.css', foreground: 'CE9178' },
      
      // Types (teal)
      { token: 'type', foreground: '4EC9B0' },
      { token: 'type.identifier', foreground: '4EC9B0' },
      { token: 'type.identifier.js', foreground: '4EC9B0' },
      { token: 'type.identifier.ts', foreground: '4EC9B0' },
      
      // Identifiers/Variables (light blue)
      { token: 'identifier', foreground: '9CDCFE' },
      { token: 'identifier.js', foreground: '9CDCFE' },
      { token: 'identifier.ts', foreground: '9CDCFE' },
      
      // Delimiters/Brackets
      { token: 'delimiter', foreground: 'D4D4D4' },
      { token: 'delimiter.bracket', foreground: 'FFD700' },
      { token: 'delimiter.parenthesis', foreground: 'DA70D6' },
      { token: 'delimiter.square', foreground: '179FFF' },
      { token: 'delimiter.css', foreground: 'D4D4D4' },
      
      // Operators
      { token: 'operator', foreground: 'D4D4D4' },
      { token: 'operator.js', foreground: 'D4D4D4' },
      { token: 'operator.css', foreground: 'D4D4D4' },
      
      // HTML Tags (blue)
      { token: 'tag', foreground: '569CD6' },
      { token: 'tag.html', foreground: '569CD6' },
      { token: 'tag.css', foreground: 'D7BA7D' },
      { token: 'metatag', foreground: '569CD6' },
      { token: 'metatag.html', foreground: '569CD6' },
      { token: 'metatag.content.html', foreground: 'CE9178' },
      
      // HTML Attributes (light blue)
      { token: 'attribute.name', foreground: '9CDCFE' },
      { token: 'attribute.name.html', foreground: '9CDCFE' },
      { token: 'attribute.value', foreground: 'CE9178' },
      { token: 'attribute.value.html', foreground: 'CE9178' },
      
      // CSS Selectors (gold/yellow)
      { token: 'tag.css', foreground: 'D7BA7D' },
      { token: 'tag.id.css', foreground: 'D7BA7D' },
      { token: 'tag.class.css', foreground: 'D7BA7D' },
      { token: 'selector.css', foreground: 'D7BA7D' },
      
      // CSS Properties (light blue)
      { token: 'attribute.name.css', foreground: '9CDCFE' },
      { token: 'property-name.css', foreground: '9CDCFE' },
      
      // CSS Values (orange/green for numbers)
      { token: 'attribute.value.css', foreground: 'CE9178' },
      { token: 'attribute.value.number.css', foreground: 'B5CEA8' },
      { token: 'attribute.value.unit.css', foreground: 'B5CEA8' },
      { token: 'property-value.css', foreground: 'CE9178' },
      
      // Regex
      { token: 'regexp', foreground: 'D16969' },
      
      // Constants
      { token: 'constant', foreground: '569CD6' },
    ],
    colors: {
      'editor.background': '#121212',
      'editor.foreground': '#D4D4D4',
      'editor.lineHighlightBackground': '#0a0a0a',
      'editor.selectionBackground': '#264F78',
      'editor.inactiveSelectionBackground': '#3A3D41',
      'editorLineNumber.foreground': '#5A5A5A',
      'editorLineNumber.activeForeground': '#C6C6C6',
      'editorCursor.foreground': '#3b82f6',
      'editor.findMatchBackground': '#515C6A',
      'editor.findMatchHighlightBackground': '#EA5C0055',
      'editorBracketMatch.background': '#3b82f633',
      'editorBracketMatch.border': '#3b82f6',
      'editorIndentGuide.background': '#2a2a2a',
      'editorIndentGuide.activeBackground': '#111111',
      'editorWhitespace.foreground': '#2a2a2a',
      'scrollbarSlider.background': '#3b82f633',
      'scrollbarSlider.hoverBackground': '#3b82f666',
      'scrollbarSlider.activeBackground': '#3b82f699',
      'minimap.background': '#0a0a0a',
      'minimapSlider.background': '#79797966',
    }
  });

  // GitHub Light Theme
  monaco.editor.defineTheme('resonant-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6e7781', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'cf222e' },
      { token: 'string', foreground: '0a3069' },
      { token: 'number', foreground: '0550ae' },
      { token: 'type', foreground: '953800' },
      { token: 'class', foreground: '953800' },
      { token: 'function', foreground: '8250df' },
      { token: 'variable', foreground: '953800' },
      { token: 'constant', foreground: '0550ae' },
      { token: 'parameter', foreground: '953800' },
      { token: 'property', foreground: '0550ae' },
      { token: 'operator', foreground: 'cf222e' },
      { token: 'punctuation', foreground: '24292f' },
      { token: 'tag', foreground: '116329' },
      { token: 'attribute.name', foreground: '0550ae' },
      { token: 'attribute.value', foreground: '0a3069' },
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#24292f',
      'editor.lineHighlightBackground': '#f6f8fa',
      'editor.selectionBackground': '#0969da33',
      'editorLineNumber.foreground': '#8c959f',
      'editorLineNumber.activeForeground': '#24292f',
      'editorCursor.foreground': '#0969da',
      'editorBracketMatch.background': '#1168391a',
      'editorBracketMatch.border': '#116839',
      'editorIndentGuide.background': '#d8dee4',
      'scrollbarSlider.background': '#8c959f33',
    }
  });
};

// Lazy load Monaco Editor
const Editor = lazy(() => 
  import('@monaco-editor/react').catch(() => {
    return { 
      default: React.memo(() => (
        <div className={styles.fallback}>
          <h3>Monaco Editor Not Available</h3>
          <p>Please run: <code>npm install @monaco-editor/react</code></p>
        </div>
      )) as React.MemoExoticComponent<() => JSX.Element>
    };
  })
);

interface CursorEditorViewProps {
  filePath?: string | null;
  content?: string;
  language?: string;
  onChange?: (value: string | undefined) => void;
  onSave?: () => void;
  onEditorMount?: (editor: any) => void;
  // Alternative prop names for compatibility
  value?: string;
  path?: string;
  onMount?: (editor: any) => void;
  options?: Record<string, any>;
}

export const CursorEditorView: React.FC<CursorEditorViewProps> = React.memo(({
  filePath,
  content,
  language,
  onChange,
  onSave,
  onEditorMount,
}) => {
  const [inlineActionsVisible, setInlineActionsVisible] = useState(false);
  const [inlineActionsPosition, setInlineActionsPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useThemeStore(); // Get current theme

  // Debounced onChange to prevent excessive re-renders while typing
  const debouncedOnChange = useMemo(() => {
    let timeout: ReturnType<typeof setTimeout>;
    return (value: string | undefined) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (onChange && value !== undefined) {
          onChange(value);
        }
      }, 150); // 150ms debounce
    };
  }, [onChange]);

  const handleEditorChange = useCallback((value: string | undefined) => {
    debouncedOnChange(value);
  }, [debouncedOnChange]);

  // Define themes BEFORE the editor mounts
  const handleEditorWillMount = useCallback((monaco: any) => {
    defineCustomThemes(monaco);
  }, []);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Ensure themes are defined (in case beforeMount didn't run)
    defineCustomThemes(monaco);
    
    // Apply the custom theme based on current theme setting
    monaco.editor.setTheme(theme === 'light' ? 'resonant-light' : 'resonant-dark');
    
    // Add custom keybindings
    // Cmd/Ctrl + S to save
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (onSave) onSave();
    });
    
    // Cmd/Ctrl + D to duplicate line
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, () => {
      editor.getAction('editor.action.copyLinesDownAction')?.run();
    });
    
    // Cmd/Ctrl + / to toggle comment
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash, () => {
      editor.getAction('editor.action.commentLine')?.run();
    });
    
    // Alt + Up/Down to move line
    editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.UpArrow, () => {
      editor.getAction('editor.action.moveLinesUpAction')?.run();
    });
    editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.DownArrow, () => {
      editor.getAction('editor.action.moveLinesDownAction')?.run();
    });
    
    // Cmd/Ctrl + Shift + K to delete line
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyK, () => {
      editor.getAction('editor.action.deleteLines')?.run();
    });
    
    // Enable bracket pair colorization
    editor.updateOptions({
      'bracketPairColorization.enabled': true,
      'guides.bracketPairs': true,
      'guides.bracketPairsHorizontal': true,
    });
    
    if (onEditorMount) {
      onEditorMount(editor);
    }

    // Handle mouse move to show inline actions on code tokens
    // PERFORMANCE: Debounce mouse move to prevent excessive state updates
    let mouseMoveTimeout: ReturnType<typeof setTimeout>;
    editor.onMouseMove((e: any) => {
      clearTimeout(mouseMoveTimeout);
      mouseMoveTimeout = setTimeout(() => {
        if (e.target && e.target.type === 2) { // Token type
          const position = editor.getPosition();
          const model = editor.getModel();
          if (model && position) {
            const word = model.getWordAtPosition(position);
            if (word) {
              const coords = editor.getScrolledVisiblePosition(position);
              if (coords && containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setInlineActionsPosition({
                  x: coords.left + rect.left,
                  y: coords.top + rect.top - 30,
                });
                setSelectedText(word.word);
                setInlineActionsVisible(true);
              }
            }
          }
        } else {
          setInlineActionsVisible(false);
        }
      }, 100); // 100ms debounce for mouse move
    });

    // Hide on click outside
    editor.onMouseDown(() => {
      setTimeout(() => setInlineActionsVisible(false), 100);
    });
  };

  const handleFix = () => {
    // TODO: Implement AI fix functionality
    console.log('Fix code:', selectedText);
    setInlineActionsVisible(false);
  };

  const handleExplain = () => {
    // TODO: Implement AI explain functionality
    console.log('Explain code:', selectedText);
    setInlineActionsVisible(false);
  };

  const handleRefactor = () => {
    // Trigger AST refactor via custom event
    window.dispatchEvent(new CustomEvent('ide-ast-refactor', { 
      detail: { 
        selectedText,
        filePath,
      } 
    }));
    setInlineActionsVisible(false);
  };

  // Detect language from file extension if not provided
  const detectLanguage = (path: string | null): string => {
    if (language) return language;
    if (!path) return 'plaintext';
    
    const ext = path.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'go': 'go',
      'rs': 'rust',
      'rb': 'ruby',
      'php': 'php',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'md': 'markdown',
      'yaml': 'yaml',
      'yml': 'yaml',
      'xml': 'xml',
      'sql': 'sql',
      'sh': 'shell',
      'bash': 'shell',
    };
    
    return langMap[ext || ''] || 'plaintext';
  };

  if (!filePath) {
    return (
      <div className={styles.emptyEditor}>
        <div className={styles.emptyContent}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.emptyIcon}>
            <path d="M32 8L8 16V32C8 44 16 52 32 56C48 52 56 44 56 32V16L32 8Z" />
            <path d="M32 24V40M24 32H40" strokeLinecap="round" />
          </svg>
          <h3>No file open</h3>
          <p>Select a file from the explorer to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={styles.editorView} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Suspense fallback={<LoadingState message="Loading editor..." />}>
        <Editor
          height="100%"
          width="100%"
          theme={theme === 'light' ? 'resonant-light' : 'resonant-dark'}
          language={detectLanguage(filePath)}
          value={content || ''}
          onChange={handleEditorChange}
          beforeMount={handleEditorWillMount}
          onMount={handleEditorDidMount}
          options={{
            // Font settings
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, Monaco, 'Courier New', monospace",
            fontLigatures: true,
            fontWeight: '400',
            letterSpacing: 0.5,
            lineHeight: 22,
            
            // Editor behavior
            automaticLayout: true,
            wordWrap: 'on',
            wrappingStrategy: 'advanced',
            tabSize: 2,
            insertSpaces: true,
            detectIndentation: true,
            trimAutoWhitespace: true,
            
            // Minimap
            minimap: { 
              enabled: true,
              maxColumn: 80,
              renderCharacters: false,
              showSlider: 'mouseover',
              side: 'right',
            },
            
            // Scrolling
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            mouseWheelScrollSensitivity: 1,
            fastScrollSensitivity: 5,
            
            // Cursor
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            cursorStyle: 'line',
            cursorWidth: 2,
            
            // Line numbers & rendering
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            renderLineHighlightOnlyWhenFocus: false,
            renderWhitespace: 'selection',
            
            // Bracket matching
            matchBrackets: 'always',
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              bracketPairsHorizontal: true,
              highlightActiveBracketPair: true,
              indentation: true,
              highlightActiveIndentation: true,
            },
            
            // Code intelligence
            suggestOnTriggerCharacters: true,
            quickSuggestions: {
              other: true,
              comments: false,
              strings: true,
            },
            acceptSuggestionOnEnter: 'on',
            tabCompletion: 'on',
            wordBasedSuggestions: 'allDocuments',
            suggestSelection: 'first',
            suggest: {
              showKeywords: true,
              showSnippets: true,
              showClasses: true,
              showFunctions: true,
              showVariables: true,
              showConstants: true,
              showModules: true,
              showProperties: true,
              showMethods: true,
              showInterfaces: true,
              showColors: true,
              showFiles: true,
              showFolders: true,
              insertMode: 'insert',
              filterGraceful: true,
              snippetsPreventQuickSuggestions: false,
            },
            
            // Formatting
            formatOnPaste: true,
            formatOnType: true,
            autoClosingBrackets: 'always',
            autoClosingQuotes: 'always',
            autoSurround: 'languageDefined',
            autoIndent: 'full',
            
            // Find & replace
            find: {
              addExtraSpaceOnTop: false,
              autoFindInSelection: 'multiline',
              seedSearchStringFromSelection: 'selection',
            },
            
            // Folding
            folding: true,
            foldingStrategy: 'auto',
            foldingHighlight: true,
            showFoldingControls: 'mouseover',
            
            // Other
            colorDecorators: true,
            linkedEditing: true,
            readOnly: false,
            domReadOnly: false,
            padding: { top: 8, bottom: 8 },
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: false,
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
              useShadows: false,
            },
          }}
        />
      </Suspense>
      {inlineActionsVisible && (
        <InlineActions
          position={inlineActionsPosition}
          onFix={handleFix}
          onExplain={handleExplain}
          onRefactor={handleRefactor}
          onClose={() => setInlineActionsVisible(false)}
        />
      )}
    </div>
  );
});

