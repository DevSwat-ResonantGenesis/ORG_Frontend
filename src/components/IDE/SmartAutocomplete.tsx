// ============== SMART AUTOCOMPLETE ==============
// Context-aware intelligent code completion with AI suggestions

import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import styles from './SmartAutocomplete.module.css';

interface CompletionItem {
  id: string;
  label: string;
  kind: 'function' | 'variable' | 'class' | 'interface' | 'property' | 'method' | 'keyword' | 'snippet' | 'ai';
  detail?: string;
  documentation?: string;
  insertText: string;
  sortPriority: number;
  isAISuggestion?: boolean;
  confidence?: number;
}

interface CompletionContext {
  prefix: string;
  line: string;
  lineNumber: number;
  column: number;
  scope?: string;
  imports?: string[];
}

interface SmartAutocompleteProps {
  code: string;
  language: string;
  cursorPosition: { line: number; column: number };
  onSelect: (item: CompletionItem) => void;
  onDismiss: () => void;
  isVisible: boolean;
  position?: { x: number; y: number };
  maxItems?: number;
  className?: string;
}

const SmartAutocompleteComponent: React.FC<SmartAutocompleteProps> = ({
  code,
  language,
  cursorPosition,
  onSelect,
  onDismiss,
  isVisible,
  position = { x: 0, y: 0 },
  maxItems = 10,
  className,
}) => {
  const [items, setItems] = useState<CompletionItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const getContext = useCallback((): CompletionContext => {
    const lines = code.split('\n');
    const currentLine = lines[cursorPosition.line - 1] || '';
    const prefix = currentLine.slice(0, cursorPosition.column).match(/[\w.]*$/)?.[0] || '';
    
    return {
      prefix,
      line: currentLine,
      lineNumber: cursorPosition.line,
      column: cursorPosition.column,
      scope: detectScope(code, cursorPosition.line),
      imports: extractImports(code),
    };
  }, [code, cursorPosition]);

  const generateCompletions = useCallback(async () => {
    setIsLoading(true);
    const context = getContext();
    
    // Simulate AI completion generation
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    const completions: CompletionItem[] = [];
    
    // Language-specific keywords
    const keywords = getLanguageKeywords(language);
    keywords.forEach((kw, i) => {
      if (kw.toLowerCase().startsWith(context.prefix.toLowerCase())) {
        completions.push({
          id: `kw-${i}`,
          label: kw,
          kind: 'keyword',
          insertText: kw,
          sortPriority: 100,
        });
      }
    });
    
    // Extract symbols from code
    const symbols = extractSymbols(code, language);
    symbols.forEach((sym, i) => {
      if (sym.name.toLowerCase().startsWith(context.prefix.toLowerCase())) {
        completions.push({
          id: `sym-${i}`,
          label: sym.name,
          kind: sym.kind as CompletionItem['kind'],
          detail: sym.detail,
          insertText: sym.insertText || sym.name,
          sortPriority: 50,
        });
      }
    });
    
    // AI-powered suggestions
    const aiSuggestions = generateAISuggestions(context, language);
    completions.push(...aiSuggestions);
    
    // Common snippets
    const snippets = getSnippets(language, context);
    completions.push(...snippets);
    
    // Sort by priority and relevance
    completions.sort((a, b) => {
      if (a.isAISuggestion && !b.isAISuggestion) return -1;
      if (!a.isAISuggestion && b.isAISuggestion) return 1;
      return a.sortPriority - b.sortPriority;
    });
    
    setItems(completions.slice(0, maxItems));
    setSelectedIndex(0);
    setIsLoading(false);
  }, [code, language, getContext, maxItems]);

  useEffect(() => {
    if (isVisible) {
      generateCompletions();
    } else {
      setItems([]);
    }
  }, [isVisible, generateCompletions]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible || items.length === 0) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % items.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + items.length) % items.length);
          break;
        case 'Enter':
        case 'Tab':
          e.preventDefault();
          onSelect(items[selectedIndex]);
          break;
        case 'Escape':
          e.preventDefault();
          onDismiss();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, items, selectedIndex, onSelect, onDismiss]);

  useEffect(() => {
    if (listRef.current && items.length > 0) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      selectedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, items.length]);

  const getKindIcon = (kind: CompletionItem['kind']) => {
    switch (kind) {
      case 'function': return '𝑓';
      case 'variable': return '𝑥';
      case 'class': return 'C';
      case 'interface': return 'I';
      case 'property': return '◇';
      case 'method': return '◎';
      case 'keyword': return '⌘';
      case 'snippet': return '{}';
      case 'ai': return '✨';
      default: return '•';
    }
  };

  const getKindClass = (kind: CompletionItem['kind']) => {
    return styles[`kind${kind.charAt(0).toUpperCase()}${kind.slice(1)}`] || '';
  };

  if (!isVisible || items.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className || ''}`}
      style={{ left: position.x, top: position.y }}
    >
      <div className={styles.list} ref={listRef}>
        {isLoading && (
          <div className={styles.loading}>
            <span className={styles.spinner} />
            <span>Loading suggestions...</span>
          </div>
        )}
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`${styles.item} ${index === selectedIndex ? styles.selected : ''} ${item.isAISuggestion ? styles.aiSuggestion : ''}`}
            onClick={() => onSelect(item)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <span className={`${styles.kindIcon} ${getKindClass(item.kind)}`}>
              {getKindIcon(item.kind)}
            </span>
            <span className={styles.label}>{item.label}</span>
            {item.detail && <span className={styles.detail}>{item.detail}</span>}
            {item.isAISuggestion && item.confidence && (
              <span className={styles.confidence}>{Math.round(item.confidence * 100)}%</span>
            )}
            {item.isAISuggestion && <span className={styles.aiBadge}>AI</span>}
          </div>
        ))}
      </div>
      
      {showDocumentation && items[selectedIndex]?.documentation && (
        <div className={styles.documentation}>
          <div className={styles.docHeader}>{items[selectedIndex].label}</div>
          <div className={styles.docContent}>{items[selectedIndex].documentation}</div>
        </div>
      )}
      
      <div className={styles.footer}>
        <span className={styles.hint}>↑↓ Navigate</span>
        <span className={styles.hint}>⏎ Select</span>
        <span className={styles.hint}>⎋ Dismiss</span>
        <button
          className={styles.docToggle}
          onClick={() => setShowDocumentation(!showDocumentation)}
        >
          {showDocumentation ? '📖' : '📕'}
        </button>
      </div>
    </div>
  );
};

// Helper functions
function detectScope(code: string, line: number): string {
  const lines = code.split('\n').slice(0, line);
  let scope = 'global';
  
  for (const l of lines) {
    if (l.includes('function ') || l.includes('=> {')) scope = 'function';
    if (l.includes('class ')) scope = 'class';
    if (l.includes('if (') || l.includes('for (') || l.includes('while (')) scope = 'block';
  }
  
  return scope;
}

function extractImports(code: string): string[] {
  const imports: string[] = [];
  const matches = code.matchAll(/import\s+.*\s+from\s+['"]([^'"]+)['"]/g);
  for (const match of matches) {
    imports.push(match[1]);
  }
  return imports;
}

function getLanguageKeywords(language: string): string[] {
  const keywords: Record<string, string[]> = {
    typescript: ['async', 'await', 'const', 'let', 'var', 'function', 'class', 'interface', 'type', 'enum', 'import', 'export', 'default', 'return', 'if', 'else', 'for', 'while', 'try', 'catch', 'throw', 'new', 'this', 'super', 'extends', 'implements', 'public', 'private', 'protected', 'static', 'readonly'],
    javascript: ['async', 'await', 'const', 'let', 'var', 'function', 'class', 'import', 'export', 'default', 'return', 'if', 'else', 'for', 'while', 'try', 'catch', 'throw', 'new', 'this', 'super', 'extends'],
    python: ['def', 'class', 'import', 'from', 'return', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'raise', 'with', 'as', 'async', 'await', 'lambda', 'yield', 'pass', 'break', 'continue'],
  };
  return keywords[language] || keywords.typescript;
}

function extractSymbols(code: string, language: string): { name: string; kind: string; detail?: string; insertText?: string }[] {
  const symbols: { name: string; kind: string; detail?: string; insertText?: string }[] = [];
  
  // Extract functions
  const funcMatches = code.matchAll(/(?:function\s+|const\s+|let\s+)(\w+)\s*(?:=\s*)?(?:\([^)]*\)\s*(?:=>|:)|\()/g);
  for (const match of funcMatches) {
    symbols.push({ name: match[1], kind: 'function', detail: 'function', insertText: `${match[1]}()` });
  }
  
  // Extract variables
  const varMatches = code.matchAll(/(?:const|let|var)\s+(\w+)\s*(?::\s*\w+)?\s*=/g);
  for (const match of varMatches) {
    if (!symbols.find(s => s.name === match[1])) {
      symbols.push({ name: match[1], kind: 'variable', detail: 'variable' });
    }
  }
  
  // Extract classes
  const classMatches = code.matchAll(/class\s+(\w+)/g);
  for (const match of classMatches) {
    symbols.push({ name: match[1], kind: 'class', detail: 'class', insertText: `new ${match[1]}()` });
  }
  
  // Extract interfaces (TypeScript)
  const interfaceMatches = code.matchAll(/interface\s+(\w+)/g);
  for (const match of interfaceMatches) {
    symbols.push({ name: match[1], kind: 'interface', detail: 'interface' });
  }
  
  return symbols;
}

function generateAISuggestions(context: CompletionContext, language: string): CompletionItem[] {
  const suggestions: CompletionItem[] = [];
  
  // Context-aware AI suggestions
  if (context.line.includes('useState')) {
    suggestions.push({
      id: 'ai-usestate',
      label: 'useState with initial value',
      kind: 'ai',
      detail: 'React Hook',
      insertText: 'const [value, setValue] = useState(initialValue);',
      sortPriority: 1,
      isAISuggestion: true,
      confidence: 0.92,
      documentation: 'Creates a state variable with useState hook',
    });
  }
  
  if (context.line.includes('useEffect')) {
    suggestions.push({
      id: 'ai-useeffect',
      label: 'useEffect with cleanup',
      kind: 'ai',
      detail: 'React Hook',
      insertText: `useEffect(() => {\n  // Effect\n  return () => {\n    // Cleanup\n  };\n}, []);`,
      sortPriority: 1,
      isAISuggestion: true,
      confidence: 0.88,
      documentation: 'Creates a useEffect hook with cleanup function',
    });
  }
  
  if (context.line.includes('fetch') || context.line.includes('api')) {
    suggestions.push({
      id: 'ai-fetch',
      label: 'async fetch with error handling',
      kind: 'ai',
      detail: 'API Pattern',
      insertText: `try {\n  const response = await fetch(url);\n  const data = await response.json();\n  return data;\n} catch (error) {\n  console.error('Error:', error);\n  throw error;\n}`,
      sortPriority: 1,
      isAISuggestion: true,
      confidence: 0.85,
      documentation: 'Async fetch pattern with try-catch error handling',
    });
  }
  
  if (context.prefix.startsWith('handle')) {
    suggestions.push({
      id: 'ai-handler',
      label: `${context.prefix} event handler`,
      kind: 'ai',
      detail: 'Event Handler',
      insertText: `const ${context.prefix} = useCallback((event) => {\n  // Handle event\n}, []);`,
      sortPriority: 1,
      isAISuggestion: true,
      confidence: 0.90,
      documentation: 'Memoized event handler with useCallback',
    });
  }
  
  return suggestions;
}

function getSnippets(language: string, context: CompletionContext): CompletionItem[] {
  const snippets: CompletionItem[] = [];
  
  if (language === 'typescript' || language === 'javascript' || language === 'tsx') {
    snippets.push(
      {
        id: 'snip-comp',
        label: 'React Component',
        kind: 'snippet',
        detail: 'Component Template',
        insertText: `interface Props {\n  // props\n}\n\nconst Component: React.FC<Props> = ({ }) => {\n  return (\n    <div>\n      \n    </div>\n  );\n};\n\nexport default Component;`,
        sortPriority: 10,
        documentation: 'Creates a React functional component template',
      },
      {
        id: 'snip-hook',
        label: 'Custom Hook',
        kind: 'snippet',
        detail: 'Hook Template',
        insertText: `export function useCustomHook() {\n  const [state, setState] = useState();\n\n  useEffect(() => {\n    // effect\n  }, []);\n\n  return { state };\n}`,
        sortPriority: 10,
        documentation: 'Creates a custom React hook template',
      }
    );
  }
  
  return snippets.filter(s => 
    s.label.toLowerCase().includes(context.prefix.toLowerCase())
  );
}

export const SmartAutocomplete = memo(SmartAutocompleteComponent);
export default SmartAutocomplete;
