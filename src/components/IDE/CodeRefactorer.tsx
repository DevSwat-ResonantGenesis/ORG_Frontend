// ============== CODE REFACTORER ==============
// Automated code refactoring with AI-powered transformations

import React, { memo, useState, useCallback } from 'react';
import styles from './CodeRefactorer.module.css';

interface RefactorAction {
  id: string;
  name: string;
  description: string;
  category: 'extract' | 'rename' | 'move' | 'inline' | 'optimize' | 'modernize';
  icon: string;
  isAvailable: boolean;
  preview?: string;
}

interface RefactorResult {
  success: boolean;
  originalCode: string;
  refactoredCode: string;
  changes: { line: number; type: 'add' | 'remove' | 'modify'; content: string }[];
  explanation: string;
}

interface CodeRefactorerProps {
  code: string;
  language: string;
  selection?: { start: number; end: number; text: string };
  onApplyRefactor?: (result: RefactorResult) => void;
  onPreview?: (preview: string) => void;
  className?: string;
}

const defaultActions: RefactorAction[] = [
  // Extract
  { id: 'extract-function', name: 'Extract Function', description: 'Extract selected code into a new function', category: 'extract', icon: '📤', isAvailable: true },
  { id: 'extract-variable', name: 'Extract Variable', description: 'Extract expression into a variable', category: 'extract', icon: '📦', isAvailable: true },
  { id: 'extract-component', name: 'Extract Component', description: 'Extract JSX into a new component', category: 'extract', icon: '🧩', isAvailable: true },
  { id: 'extract-hook', name: 'Extract Custom Hook', description: 'Extract logic into a custom React hook', category: 'extract', icon: '🪝', isAvailable: true },
  
  // Rename
  { id: 'rename-symbol', name: 'Rename Symbol', description: 'Rename variable, function, or class across files', category: 'rename', icon: '✏️', isAvailable: true },
  { id: 'rename-file', name: 'Rename & Update Imports', description: 'Rename file and update all imports', category: 'rename', icon: '📝', isAvailable: true },
  
  // Inline
  { id: 'inline-variable', name: 'Inline Variable', description: 'Replace variable with its value', category: 'inline', icon: '⬅️', isAvailable: true },
  { id: 'inline-function', name: 'Inline Function', description: 'Replace function call with function body', category: 'inline', icon: '📥', isAvailable: true },
  
  // Optimize
  { id: 'optimize-imports', name: 'Optimize Imports', description: 'Remove unused and organize imports', category: 'optimize', icon: '🧹', isAvailable: true },
  { id: 'remove-dead-code', name: 'Remove Dead Code', description: 'Remove unreachable or unused code', category: 'optimize', icon: '🗑️', isAvailable: true },
  { id: 'simplify-conditionals', name: 'Simplify Conditionals', description: 'Simplify complex if-else chains', category: 'optimize', icon: '🔀', isAvailable: true },
  { id: 'memoize-component', name: 'Add Memoization', description: 'Wrap component with React.memo', category: 'optimize', icon: '💾', isAvailable: true },
  
  // Modernize
  { id: 'convert-to-arrow', name: 'Convert to Arrow Function', description: 'Convert function to arrow function', category: 'modernize', icon: '➡️', isAvailable: true },
  { id: 'convert-to-async', name: 'Convert to Async/Await', description: 'Convert Promise chains to async/await', category: 'modernize', icon: '⏳', isAvailable: true },
  { id: 'convert-to-hooks', name: 'Convert to Hooks', description: 'Convert class component to hooks', category: 'modernize', icon: '🪝', isAvailable: true },
  { id: 'add-typescript', name: 'Add TypeScript Types', description: 'Infer and add TypeScript types', category: 'modernize', icon: '🔷', isAvailable: true },
];

const CodeRefactorerComponent: React.FC<CodeRefactorerProps> = ({
  code,
  language,
  selection,
  onApplyRefactor,
  onPreview,
  className,
}) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<RefactorAction | null>(null);
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [previewResult, setPreviewResult] = useState<RefactorResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const categories = [
    { id: 'extract', name: 'Extract', icon: '📤' },
    { id: 'rename', name: 'Rename', icon: '✏️' },
    { id: 'inline', name: 'Inline', icon: '⬅️' },
    { id: 'optimize', name: 'Optimize', icon: '⚡' },
    { id: 'modernize', name: 'Modernize', icon: '🚀' },
  ];

  const filteredActions = activeCategory 
    ? defaultActions.filter(a => a.category === activeCategory)
    : defaultActions;

  const performRefactor = useCallback(async (action: RefactorAction) => {
    setIsRefactoring(true);
    setSelectedAction(action);
    
    // Simulate AI refactoring
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 500));
    
    let refactoredCode = code;
    let explanation = '';
    const changes: RefactorResult['changes'] = [];
    
    switch (action.id) {
      case 'extract-function':
        if (selection?.text) {
          const funcName = customInput || 'extractedFunction';
          refactoredCode = `function ${funcName}() {\n  ${selection.text}\n}\n\n${code.replace(selection.text, `${funcName}()`)}`;
          explanation = `Extracted selected code into function "${funcName}"`;
          changes.push({ line: 1, type: 'add', content: `function ${funcName}() { ... }` });
        }
        break;
        
      case 'extract-variable':
        if (selection?.text) {
          const varName = customInput || 'extractedValue';
          refactoredCode = code.replace(selection.text, varName);
          refactoredCode = `const ${varName} = ${selection.text};\n${refactoredCode}`;
          explanation = `Extracted expression into variable "${varName}"`;
        }
        break;
        
      case 'optimize-imports':
        // Simulate removing unused imports
        const lines = code.split('\n');
        const optimizedLines = lines.filter(line => {
          if (line.includes('import') && line.includes('unused')) {
            changes.push({ line: lines.indexOf(line) + 1, type: 'remove', content: line });
            return false;
          }
          return true;
        });
        refactoredCode = optimizedLines.join('\n');
        explanation = 'Removed unused imports and organized import statements';
        break;
        
      case 'convert-to-arrow':
        refactoredCode = code.replace(/function\s+(\w+)\s*\(([^)]*)\)\s*\{/g, 'const $1 = ($2) => {');
        explanation = 'Converted function declarations to arrow functions';
        break;
        
      case 'convert-to-async':
        refactoredCode = code.replace(/\.then\(\s*(\w+)\s*=>\s*\{?([^}]*)\}?\s*\)/g, 'const $1 = await');
        explanation = 'Converted Promise.then chains to async/await syntax';
        break;
        
      case 'memoize-component':
        if (code.includes('export default')) {
          refactoredCode = code.replace(
            /export default (\w+)/,
            'export default memo($1)'
          );
          if (!code.includes("import { memo }")) {
            refactoredCode = "import { memo } from 'react';\n" + refactoredCode;
          }
          explanation = 'Wrapped component with React.memo for performance optimization';
        }
        break;
        
      case 'add-typescript':
        // Add basic types
        refactoredCode = code
          .replace(/const (\w+) = \[\]/g, 'const $1: any[] = []')
          .replace(/const (\w+) = \{\}/g, 'const $1: Record<string, any> = {}')
          .replace(/function (\w+)\((\w+)\)/g, 'function $1($2: any)');
        explanation = 'Added TypeScript type annotations (review and refine as needed)';
        break;
        
      default:
        explanation = `Applied ${action.name} refactoring`;
    }
    
    const result: RefactorResult = {
      success: true,
      originalCode: code,
      refactoredCode,
      changes,
      explanation,
    };
    
    setPreviewResult(result);
    setShowPreview(true);
    setIsRefactoring(false);
    onPreview?.(refactoredCode);
  }, [code, selection, customInput, onPreview]);

  const applyRefactor = useCallback(() => {
    if (previewResult) {
      onApplyRefactor?.(previewResult);
      setShowPreview(false);
      setPreviewResult(null);
      setSelectedAction(null);
    }
  }, [previewResult, onApplyRefactor]);

  const cancelRefactor = useCallback(() => {
    setShowPreview(false);
    setPreviewResult(null);
    setSelectedAction(null);
  }, []);

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.icon}>🔧</span>
          <span>Code Refactorer</span>
        </div>
        {selection?.text && (
          <span className={styles.selectionBadge}>
            {selection.text.length} chars selected
          </span>
        )}
      </div>

      <div className={styles.categories}>
        <button
          className={`${styles.categoryBtn} ${!activeCategory ? styles.active : ''}`}
          onClick={() => setActiveCategory(null)}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`${styles.categoryBtn} ${activeCategory === cat.id ? styles.active : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {(selectedAction?.id === 'extract-function' || selectedAction?.id === 'extract-variable') && (
        <div className={styles.inputPanel}>
          <input
            type="text"
            placeholder={selectedAction.id === 'extract-function' ? 'Function name...' : 'Variable name...'}
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            autoFocus
          />
        </div>
      )}

      <div className={styles.actions}>
        {filteredActions.map(action => (
          <button
            key={action.id}
            className={`${styles.action} ${!action.isAvailable ? styles.disabled : ''} ${selectedAction?.id === action.id ? styles.selected : ''}`}
            onClick={() => action.isAvailable && performRefactor(action)}
            disabled={!action.isAvailable || isRefactoring}
          >
            <span className={styles.actionIcon}>{action.icon}</span>
            <div className={styles.actionInfo}>
              <span className={styles.actionName}>{action.name}</span>
              <span className={styles.actionDesc}>{action.description}</span>
            </div>
            {isRefactoring && selectedAction?.id === action.id && (
              <span className={styles.spinner} />
            )}
          </button>
        ))}
      </div>

      {showPreview && previewResult && (
        <div className={styles.previewPanel}>
          <div className={styles.previewHeader}>
            <span className={styles.previewTitle}>Preview Changes</span>
            <div className={styles.previewActions}>
              <button className={styles.cancelBtn} onClick={cancelRefactor}>Cancel</button>
              <button className={styles.applyBtn} onClick={applyRefactor}>Apply</button>
            </div>
          </div>
          <p className={styles.previewExplanation}>{previewResult.explanation}</p>
          <div className={styles.changesList}>
            {previewResult.changes.map((change, i) => (
              <div key={i} className={`${styles.change} ${styles[change.type]}`}>
                <span className={styles.changeLine}>L{change.line}</span>
                <span className={styles.changeType}>
                  {change.type === 'add' ? '+' : change.type === 'remove' ? '-' : '~'}
                </span>
                <code className={styles.changeContent}>{change.content}</code>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.aiSection}>
        <div className={styles.aiHeader}>
          <span className={styles.aiIcon}>🧠</span>
          <span>AI-Powered Refactoring</span>
        </div>
        <textarea
          className={styles.aiPrompt}
          placeholder="Describe the refactoring you want, e.g., 'Convert all callbacks to async/await' or 'Split this function into smaller ones'"
        />
        <button className={styles.aiBtn}>
          ✨ Refactor with AI
        </button>
      </div>
    </div>
  );
};

export const CodeRefactorer = memo(CodeRefactorerComponent);
export default CodeRefactorer;
