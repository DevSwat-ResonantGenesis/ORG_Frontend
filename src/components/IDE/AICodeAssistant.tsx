// ============== AI CODE ASSISTANT ==============
// Advanced AI-powered code assistance panel

import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import styles from './AICodeAssistant.module.css';

interface CodeSuggestion {
  id: string;
  type: 'completion' | 'refactor' | 'fix' | 'optimize' | 'document';
  title: string;
  description: string;
  code: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
}

interface CodeIssue {
  id: string;
  type: 'error' | 'warning' | 'info' | 'hint';
  message: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  fix?: {
    description: string;
    changes: { start: number; end: number; replacement: string }[];
  };
}

interface AICodeAssistantProps {
  code: string;
  language: string;
  filePath: string;
  cursorPosition?: { line: number; column: number };
  selectedText?: string;
  onApplySuggestion?: (suggestion: CodeSuggestion) => void;
  onApplyFix?: (issue: CodeIssue) => void;
  className?: string;
}

const AICodeAssistantComponent: React.FC<AICodeAssistantProps> = ({
  code,
  language,
  filePath,
  cursorPosition,
  selectedText,
  onApplySuggestion,
  onApplyFix,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'issues' | 'refactor' | 'docs'>('suggestions');
  const [suggestions, setSuggestions] = useState<CodeSuggestion[]>([]);
  const [issues, setIssues] = useState<CodeIssue[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const analysisTimeoutRef = useRef<NodeJS.Timeout>();

  // Analyze code when it changes (debounced)
  useEffect(() => {
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }

    analysisTimeoutRef.current = setTimeout(() => {
      analyzeCode();
    }, 1000);

    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
    };
  }, [code, language]);

  const analyzeCode = useCallback(async () => {
    if (!code.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      // Simulate AI analysis (replace with actual API call)
      const [newSuggestions, newIssues] = await Promise.all([
        generateSuggestions(code, language, cursorPosition),
        detectIssues(code, language),
      ]);
      
      setSuggestions(newSuggestions);
      setIssues(newIssues);
    } catch (error) {
      console.error('Code analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [code, language, cursorPosition]);

  const handleApplySuggestion = useCallback((suggestion: CodeSuggestion) => {
    onApplySuggestion?.(suggestion);
    setSelectedSuggestion(null);
  }, [onApplySuggestion]);

  const handleApplyFix = useCallback((issue: CodeIssue) => {
    onApplyFix?.(issue);
  }, [onApplyFix]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'completion': return '✨';
      case 'refactor': return '🔄';
      case 'fix': return '🔧';
      case 'optimize': return '⚡';
      case 'document': return '📝';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'hint': return '💡';
      default: return '•';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return '#888';
    }
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <span className={styles.aiIcon}>🤖</span>
          AI Assistant
        </h3>
        {isAnalyzing && <span className={styles.analyzing}>Analyzing...</span>}
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'suggestions' ? styles.active : ''}`}
          onClick={() => setActiveTab('suggestions')}
        >
          Suggestions
          {suggestions.length > 0 && (
            <span className={styles.badge}>{suggestions.length}</span>
          )}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'issues' ? styles.active : ''}`}
          onClick={() => setActiveTab('issues')}
        >
          Issues
          {issues.length > 0 && (
            <span className={`${styles.badge} ${styles.issueBadge}`}>{issues.length}</span>
          )}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'refactor' ? styles.active : ''}`}
          onClick={() => setActiveTab('refactor')}
        >
          Refactor
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'docs' ? styles.active : ''}`}
          onClick={() => setActiveTab('docs')}
        >
          Docs
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'suggestions' && (
          <div className={styles.suggestionsList}>
            {suggestions.length === 0 ? (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>💡</span>
                <p>No suggestions at the moment</p>
                <small>Write some code to get AI-powered suggestions</small>
              </div>
            ) : (
              suggestions.map(suggestion => (
                <div
                  key={suggestion.id}
                  className={`${styles.suggestionCard} ${selectedSuggestion === suggestion.id ? styles.selected : ''}`}
                  onClick={() => setSelectedSuggestion(
                    selectedSuggestion === suggestion.id ? null : suggestion.id
                  )}
                >
                  <div className={styles.suggestionHeader}>
                    <span className={styles.typeIcon}>{getTypeIcon(suggestion.type)}</span>
                    <span className={styles.suggestionTitle}>{suggestion.title}</span>
                    <span 
                      className={styles.impact}
                      style={{ color: getImpactColor(suggestion.impact) }}
                    >
                      {suggestion.impact}
                    </span>
                  </div>
                  <p className={styles.suggestionDesc}>{suggestion.description}</p>
                  
                  {selectedSuggestion === suggestion.id && (
                    <div className={styles.suggestionPreview}>
                      <pre className={styles.codePreview}>
                        <code>{suggestion.code}</code>
                      </pre>
                      <div className={styles.suggestionActions}>
                        <button
                          className={styles.applyBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplySuggestion(suggestion);
                          }}
                        >
                          Apply
                        </button>
                        <button
                          className={styles.dismissBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
                          }}
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className={styles.confidence}>
                    <div 
                      className={styles.confidenceBar}
                      style={{ width: `${suggestion.confidence * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'issues' && (
          <div className={styles.issuesList}>
            {issues.length === 0 ? (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>✅</span>
                <p>No issues detected</p>
                <small>Your code looks good!</small>
              </div>
            ) : (
              issues.map(issue => (
                <div key={issue.id} className={`${styles.issueCard} ${styles[issue.type]}`}>
                  <div className={styles.issueHeader}>
                    <span className={styles.typeIcon}>{getTypeIcon(issue.type)}</span>
                    <span className={styles.issueType}>{issue.type}</span>
                    <span className={styles.issueLine}>Line {issue.line}</span>
                  </div>
                  <p className={styles.issueMessage}>{issue.message}</p>
                  
                  {issue.fix && (
                    <button
                      className={styles.quickFixBtn}
                      onClick={() => handleApplyFix(issue)}
                    >
                      🔧 Quick Fix: {issue.fix.description}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'refactor' && (
          <div className={styles.refactorPanel}>
            <RefactorTools
              code={code}
              selectedText={selectedText}
              language={language}
              onApply={(newCode) => {
                onApplySuggestion?.({
                  id: `refactor-${Date.now()}`,
                  type: 'refactor',
                  title: 'Refactoring',
                  description: 'Applied refactoring',
                  code: newCode,
                  confidence: 1,
                  impact: 'medium',
                });
              }}
            />
          </div>
        )}

        {activeTab === 'docs' && (
          <div className={styles.docsPanel}>
            <DocumentationGenerator
              code={code}
              language={language}
              onGenerate={(docs) => {
                onApplySuggestion?.({
                  id: `docs-${Date.now()}`,
                  type: 'document',
                  title: 'Generated Documentation',
                  description: 'Add documentation to your code',
                  code: docs,
                  confidence: 0.9,
                  impact: 'low',
                });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// ============== REFACTOR TOOLS ==============

interface RefactorToolsProps {
  code: string;
  selectedText?: string;
  language: string;
  onApply: (newCode: string) => void;
}

const RefactorTools: React.FC<RefactorToolsProps> = memo(({
  code,
  selectedText,
  language,
  onApply,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const refactorOptions = [
    { id: 'extract-function', label: 'Extract Function', icon: '📦', description: 'Extract selection into a new function' },
    { id: 'extract-variable', label: 'Extract Variable', icon: '📌', description: 'Extract expression into a variable' },
    { id: 'inline-variable', label: 'Inline Variable', icon: '📍', description: 'Inline a variable usage' },
    { id: 'rename-symbol', label: 'Rename Symbol', icon: '✏️', description: 'Rename a symbol across the file' },
    { id: 'convert-to-arrow', label: 'Convert to Arrow', icon: '➡️', description: 'Convert function to arrow function' },
    { id: 'convert-to-async', label: 'Convert to Async', icon: '⏳', description: 'Convert to async/await syntax' },
    { id: 'extract-interface', label: 'Extract Interface', icon: '🔷', description: 'Extract TypeScript interface' },
    { id: 'simplify-conditional', label: 'Simplify Conditional', icon: '🔀', description: 'Simplify complex conditionals' },
  ];

  const handleRefactor = async (refactorType: string) => {
    setIsLoading(true);
    try {
      // Simulate refactoring (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For demo, just return original code
      // In real implementation, this would call the AI backend
      onApply(code);
    } catch (error) {
      console.error('Refactoring failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.refactorTools}>
      <p className={styles.refactorHint}>
        {selectedText 
          ? `Selected: "${selectedText.slice(0, 50)}${selectedText.length > 50 ? '...' : ''}"`
          : 'Select code to see refactoring options'}
      </p>
      
      <div className={styles.refactorGrid}>
        {refactorOptions.map(option => (
          <button
            key={option.id}
            className={styles.refactorOption}
            onClick={() => handleRefactor(option.id)}
            disabled={isLoading || (!selectedText && option.id !== 'rename-symbol')}
          >
            <span className={styles.refactorIcon}>{option.icon}</span>
            <span className={styles.refactorLabel}>{option.label}</span>
            <small className={styles.refactorDesc}>{option.description}</small>
          </button>
        ))}
      </div>
      
      {isLoading && (
        <div className={styles.refactorLoading}>
          <span className={styles.spinner} />
          Refactoring...
        </div>
      )}
    </div>
  );
});

RefactorTools.displayName = 'RefactorTools';

// ============== DOCUMENTATION GENERATOR ==============

interface DocumentationGeneratorProps {
  code: string;
  language: string;
  onGenerate: (docs: string) => void;
}

const DocumentationGenerator: React.FC<DocumentationGeneratorProps> = memo(({
  code,
  language,
  onGenerate,
}) => {
  const [docStyle, setDocStyle] = useState<'jsdoc' | 'tsdoc' | 'markdown' | 'inline'>('jsdoc');
  const [isGenerating, setIsGenerating] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const docStyles = [
    { id: 'jsdoc', label: 'JSDoc', description: 'Standard JavaScript documentation' },
    { id: 'tsdoc', label: 'TSDoc', description: 'TypeScript documentation format' },
    { id: 'markdown', label: 'Markdown', description: 'README-style documentation' },
    { id: 'inline', label: 'Inline Comments', description: 'Simple inline comments' },
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Simulate generation (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const generated = generateDocumentation(code, language, docStyle);
      setPreview(generated);
    } catch (error) {
      console.error('Documentation generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={styles.docsGenerator}>
      <div className={styles.docStyleSelector}>
        <label>Documentation Style:</label>
        <div className={styles.styleOptions}>
          {docStyles.map(style => (
            <button
              key={style.id}
              className={`${styles.styleOption} ${docStyle === style.id ? styles.active : ''}`}
              onClick={() => setDocStyle(style.id as any)}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      <button
        className={styles.generateBtn}
        onClick={handleGenerate}
        disabled={isGenerating || !code.trim()}
      >
        {isGenerating ? (
          <>
            <span className={styles.spinner} />
            Generating...
          </>
        ) : (
          <>
            📝 Generate Documentation
          </>
        )}
      </button>

      {preview && (
        <div className={styles.docsPreview}>
          <div className={styles.previewHeader}>
            <span>Preview</span>
            <button
              className={styles.applyDocsBtn}
              onClick={() => {
                onGenerate(preview);
                setPreview(null);
              }}
            >
              Apply
            </button>
          </div>
          <pre className={styles.previewCode}>
            <code>{preview}</code>
          </pre>
        </div>
      )}
    </div>
  );
});

DocumentationGenerator.displayName = 'DocumentationGenerator';

// ============== HELPER FUNCTIONS ==============

async function generateSuggestions(
  code: string,
  language: string,
  cursorPosition?: { line: number; column: number }
): Promise<CodeSuggestion[]> {
  // Simulate AI suggestions based on code patterns
  const suggestions: CodeSuggestion[] = [];
  
  // Check for common patterns and suggest improvements
  if (code.includes('console.log')) {
    suggestions.push({
      id: 'remove-console',
      type: 'optimize',
      title: 'Remove Console Logs',
      description: 'Consider removing console.log statements for production',
      code: code.replace(/console\.log\([^)]*\);?\n?/g, ''),
      confidence: 0.85,
      impact: 'low',
    });
  }

  if (code.includes('var ')) {
    suggestions.push({
      id: 'use-const-let',
      type: 'refactor',
      title: 'Use const/let instead of var',
      description: 'Modern JavaScript recommends using const or let',
      code: code.replace(/\bvar\s+/g, 'const '),
      confidence: 0.95,
      impact: 'medium',
    });
  }

  if (code.includes('function') && !code.includes('=>')) {
    suggestions.push({
      id: 'convert-arrow',
      type: 'refactor',
      title: 'Convert to Arrow Functions',
      description: 'Consider using arrow functions for cleaner syntax',
      code: code,
      confidence: 0.7,
      impact: 'low',
    });
  }

  if (!code.includes('try') && (code.includes('await') || code.includes('fetch'))) {
    suggestions.push({
      id: 'add-error-handling',
      type: 'fix',
      title: 'Add Error Handling',
      description: 'Async operations should have error handling',
      code: `try {\n  ${code}\n} catch (error) {\n  console.error('Error:', error);\n  throw error;\n}`,
      confidence: 0.9,
      impact: 'high',
    });
  }

  return suggestions;
}

async function detectIssues(code: string, language: string): Promise<CodeIssue[]> {
  const issues: CodeIssue[] = [];
  const lines = code.split('\n');

  lines.forEach((line, index) => {
    // Check for common issues
    if (line.includes('==') && !line.includes('===') && !line.includes('!==')) {
      issues.push({
        id: `issue-${index}-equality`,
        type: 'warning',
        message: 'Use strict equality (===) instead of loose equality (==)',
        line: index + 1,
        column: line.indexOf('==') + 1,
        fix: {
          description: 'Convert to strict equality',
          changes: [{ start: line.indexOf('=='), end: line.indexOf('==') + 2, replacement: '===' }],
        },
      });
    }

    if (line.includes('// TODO') || line.includes('// FIXME')) {
      issues.push({
        id: `issue-${index}-todo`,
        type: 'info',
        message: 'TODO/FIXME comment found',
        line: index + 1,
        column: 1,
      });
    }

    if (line.length > 120) {
      issues.push({
        id: `issue-${index}-line-length`,
        type: 'hint',
        message: 'Line exceeds 120 characters',
        line: index + 1,
        column: 121,
      });
    }
  });

  return issues;
}

function generateDocumentation(code: string, language: string, style: string): string {
  // Simple documentation generation (replace with AI-powered generation)
  const functionMatch = code.match(/(?:function|const|let)\s+(\w+)\s*(?:=\s*)?(?:async\s*)?\([^)]*\)/);
  const functionName = functionMatch?.[1] || 'myFunction';
  
  switch (style) {
    case 'jsdoc':
      return `/**
 * ${functionName}
 * @description TODO: Add description
 * @param {any} param - TODO: Add parameter description
 * @returns {any} TODO: Add return description
 * @example
 * ${functionName}()
 */
${code}`;
    
    case 'tsdoc':
      return `/**
 * ${functionName}
 * @remarks
 * TODO: Add detailed remarks
 * @param param - TODO: Add parameter description
 * @returns TODO: Add return description
 */
${code}`;
    
    case 'markdown':
      return `## ${functionName}

### Description
TODO: Add description

### Parameters
- \`param\` - TODO: Add parameter description

### Returns
TODO: Add return description

### Example
\`\`\`${language}
${functionName}()
\`\`\`

---

${code}`;
    
    case 'inline':
      return `// ${functionName}
// TODO: Add description
// Params: param - TODO: Add description
// Returns: TODO: Add description
${code}`;
    
    default:
      return code;
  }
}

export const AICodeAssistant = memo(AICodeAssistantComponent);
export default AICodeAssistant;
