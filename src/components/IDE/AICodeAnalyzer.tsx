// ============== AI CODE ANALYZER ==============
// Intelligent code analysis with real-time suggestions and insights

import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import styles from './AICodeAnalyzer.module.css';

interface CodeIssue {
  id: string;
  type: 'error' | 'warning' | 'info' | 'optimization' | 'security';
  severity: 'critical' | 'high' | 'medium' | 'low';
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  message: string;
  suggestion?: string;
  autoFix?: string;
  rule?: string;
}

interface CodeMetrics {
  complexity: number;
  maintainability: number;
  testability: number;
  performance: number;
  security: number;
  linesOfCode: number;
  functions: number;
  classes: number;
  imports: number;
  comments: number;
  duplications: number;
}

interface AnalysisResult {
  issues: CodeIssue[];
  metrics: CodeMetrics;
  suggestions: string[];
  patterns: { name: string; count: number; quality: 'good' | 'bad' | 'neutral' }[];
  dependencies: { name: string; version?: string; isOutdated?: boolean; hasVulnerability?: boolean }[];
  timestamp: Date;
}

interface AICodeAnalyzerProps {
  code: string;
  language: string;
  filePath?: string;
  onIssueClick?: (issue: CodeIssue) => void;
  onAutoFix?: (issue: CodeIssue) => void;
  onAnalysisComplete?: (result: AnalysisResult) => void;
  autoAnalyze?: boolean;
  analyzeDebounceMs?: number;
  className?: string;
}

const AICodeAnalyzerComponent: React.FC<AICodeAnalyzerProps> = ({
  code,
  language,
  filePath,
  onIssueClick,
  onAutoFix,
  onAnalysisComplete,
  autoAnalyze = true,
  analyzeDebounceMs = 1000,
  className,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'issues' | 'metrics' | 'suggestions' | 'patterns'>('issues');
  const [issueFilter, setIssueFilter] = useState<'all' | 'error' | 'warning' | 'optimization' | 'security'>('all');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  const analyzeCode = useCallback(async () => {
    if (!code.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis - in production, call actual AI service
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
    
    const issues = generateIssues(code, language);
    const metrics = calculateMetrics(code);
    const suggestions = generateSuggestions(code, language, issues);
    const patterns = detectPatterns(code, language);
    const dependencies = extractDependencies(code, language);
    
    const analysisResult: AnalysisResult = {
      issues,
      metrics,
      suggestions,
      patterns,
      dependencies,
      timestamp: new Date(),
    };
    
    setResult(analysisResult);
    setIsAnalyzing(false);
    onAnalysisComplete?.(analysisResult);
  }, [code, language, onAnalysisComplete]);

  useEffect(() => {
    if (!autoAnalyze) return;
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      analyzeCode();
    }, analyzeDebounceMs);
    
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [code, autoAnalyze, analyzeDebounceMs, analyzeCode]);

  const handleAutoFix = useCallback((issue: CodeIssue) => {
    if (issue.autoFix) {
      onAutoFix?.(issue);
    }
  }, [onAutoFix]);

  const handleFixAll = useCallback(() => {
    const fixableIssues = result?.issues.filter(i => i.autoFix) || [];
    fixableIssues.forEach(issue => onAutoFix?.(issue));
  }, [result, onAutoFix]);

  const filteredIssues = result?.issues.filter(issue => 
    issueFilter === 'all' || issue.type === issueFilter
  ) || [];

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'optimization': return '⚡';
      case 'security': return '🔒';
      default: return 'ℹ️';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return styles.scoreGood;
    if (score >= 60) return styles.scoreMedium;
    return styles.scoreBad;
  };

  if (isCollapsed) {
    return (
      <div className={`${styles.collapsed} ${className || ''}`} onClick={() => setIsCollapsed(false)}>
        <span className={styles.collapseIcon}>🔍</span>
        <span>AI Analysis</span>
        {result && (
          <span className={styles.collapsedBadge}>
            {result.issues.filter(i => i.type === 'error').length} errors
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.icon}>🧠</span>
          <span>AI Code Analyzer</span>
          {isAnalyzing && <span className={styles.spinner} />}
        </div>
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={analyzeCode} disabled={isAnalyzing}>
            🔄 Analyze
          </button>
          {result && result.issues.some(i => i.autoFix) && (
            <button className={styles.fixAllBtn} onClick={handleFixAll}>
              ✨ Fix All
            </button>
          )}
          <button className={styles.collapseBtn} onClick={() => setIsCollapsed(true)}>−</button>
        </div>
      </div>

      <div className={styles.tabs}>
        {(['issues', 'metrics', 'suggestions', 'patterns'] as const).map(tab => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'issues' && `Issues (${result?.issues.length || 0})`}
            {tab === 'metrics' && 'Metrics'}
            {tab === 'suggestions' && 'Suggestions'}
            {tab === 'patterns' && 'Patterns'}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {activeTab === 'issues' && (
          <div className={styles.issuesPanel}>
            <div className={styles.filters}>
              {(['all', 'error', 'warning', 'optimization', 'security'] as const).map(filter => (
                <button
                  key={filter}
                  className={`${styles.filterBtn} ${issueFilter === filter ? styles.active : ''}`}
                  onClick={() => setIssueFilter(filter)}
                >
                  {filter === 'all' ? 'All' : getIssueIcon(filter)}
                </button>
              ))}
            </div>
            
            {filteredIssues.length === 0 ? (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>✅</span>
                <p>No issues found</p>
              </div>
            ) : (
              <div className={styles.issuesList}>
                {filteredIssues.map(issue => (
                  <div
                    key={issue.id}
                    className={`${styles.issue} ${styles[issue.type]} ${styles[issue.severity]}`}
                    onClick={() => onIssueClick?.(issue)}
                  >
                    <div className={styles.issueHeader}>
                      <span className={styles.issueIcon}>{getIssueIcon(issue.type)}</span>
                      <span className={styles.issueLocation}>Line {issue.line}</span>
                      {issue.rule && <span className={styles.issueRule}>{issue.rule}</span>}
                    </div>
                    <p className={styles.issueMessage}>{issue.message}</p>
                    {issue.suggestion && (
                      <p className={styles.issueSuggestion}>💡 {issue.suggestion}</p>
                    )}
                    {issue.autoFix && (
                      <button
                        className={styles.autoFixBtn}
                        onClick={e => { e.stopPropagation(); handleAutoFix(issue); }}
                      >
                        ✨ Auto-fix
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'metrics' && result && (
          <div className={styles.metricsPanel}>
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Complexity</div>
                <div className={`${styles.metricScore} ${getScoreColor(100 - result.metrics.complexity)}`}>
                  {result.metrics.complexity}
                </div>
                <div className={styles.metricBar}>
                  <div style={{ width: `${Math.min(100, result.metrics.complexity)}%` }} />
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Maintainability</div>
                <div className={`${styles.metricScore} ${getScoreColor(result.metrics.maintainability)}`}>
                  {result.metrics.maintainability}%
                </div>
                <div className={styles.metricBar}>
                  <div style={{ width: `${result.metrics.maintainability}%` }} />
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Performance</div>
                <div className={`${styles.metricScore} ${getScoreColor(result.metrics.performance)}`}>
                  {result.metrics.performance}%
                </div>
                <div className={styles.metricBar}>
                  <div style={{ width: `${result.metrics.performance}%` }} />
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Security</div>
                <div className={`${styles.metricScore} ${getScoreColor(result.metrics.security)}`}>
                  {result.metrics.security}%
                </div>
                <div className={styles.metricBar}>
                  <div style={{ width: `${result.metrics.security}%` }} />
                </div>
              </div>
            </div>
            
            <div className={styles.statsGrid}>
              <div className={styles.stat}>
                <span className={styles.statValue}>{result.metrics.linesOfCode}</span>
                <span className={styles.statLabel}>Lines</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{result.metrics.functions}</span>
                <span className={styles.statLabel}>Functions</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{result.metrics.classes}</span>
                <span className={styles.statLabel}>Classes</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{result.metrics.imports}</span>
                <span className={styles.statLabel}>Imports</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'suggestions' && result && (
          <div className={styles.suggestionsPanel}>
            {result.suggestions.length === 0 ? (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>👍</span>
                <p>Code looks great!</p>
              </div>
            ) : (
              <div className={styles.suggestionsList}>
                {result.suggestions.map((suggestion, i) => (
                  <div key={i} className={styles.suggestion}>
                    <span className={styles.suggestionIcon}>💡</span>
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'patterns' && result && (
          <div className={styles.patternsPanel}>
            {result.patterns.length === 0 ? (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>📊</span>
                <p>No patterns detected</p>
              </div>
            ) : (
              <div className={styles.patternsList}>
                {result.patterns.map((pattern, i) => (
                  <div key={i} className={`${styles.pattern} ${styles[pattern.quality]}`}>
                    <span className={styles.patternName}>{pattern.name}</span>
                    <span className={styles.patternCount}>{pattern.count}x</span>
                    <span className={`${styles.patternQuality} ${styles[pattern.quality]}`}>
                      {pattern.quality === 'good' ? '✅' : pattern.quality === 'bad' ? '⚠️' : '•'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Analysis helper functions
function generateIssues(code: string, language: string): CodeIssue[] {
  const issues: CodeIssue[] = [];
  const lines = code.split('\n');
  
  lines.forEach((line, i) => {
    // Detect console.log statements
    if (line.includes('console.log')) {
      issues.push({
        id: `issue-${i}-console`,
        type: 'warning',
        severity: 'low',
        line: i + 1,
        column: line.indexOf('console.log'),
        message: 'Avoid using console.log in production code',
        suggestion: 'Use a proper logging library instead',
        autoFix: line.replace(/console\.log\([^)]*\);?/, '// console.log removed'),
        rule: 'no-console',
      });
    }
    
    // Detect TODO comments
    if (line.includes('TODO') || line.includes('FIXME')) {
      issues.push({
        id: `issue-${i}-todo`,
        type: 'info',
        severity: 'low',
        line: i + 1,
        column: line.indexOf('TODO') !== -1 ? line.indexOf('TODO') : line.indexOf('FIXME'),
        message: 'Found TODO/FIXME comment that needs attention',
        rule: 'no-warning-comments',
      });
    }
    
    // Detect any type usage in TypeScript
    if ((language === 'typescript' || language === 'tsx') && line.includes(': any')) {
      issues.push({
        id: `issue-${i}-any`,
        type: 'warning',
        severity: 'medium',
        line: i + 1,
        column: line.indexOf(': any'),
        message: 'Avoid using "any" type - it defeats the purpose of TypeScript',
        suggestion: 'Use a more specific type or generic',
        rule: 'no-explicit-any',
      });
    }
    
    // Detect potential security issues
    if (line.includes('eval(') || line.includes('innerHTML')) {
      issues.push({
        id: `issue-${i}-security`,
        type: 'security',
        severity: 'critical',
        line: i + 1,
        column: line.indexOf('eval(') !== -1 ? line.indexOf('eval(') : line.indexOf('innerHTML'),
        message: 'Potential XSS vulnerability detected',
        suggestion: 'Avoid using eval() and innerHTML with user input',
        rule: 'no-eval',
      });
    }
    
    // Detect long lines
    if (line.length > 120) {
      issues.push({
        id: `issue-${i}-linelength`,
        type: 'optimization',
        severity: 'low',
        line: i + 1,
        column: 120,
        message: `Line exceeds 120 characters (${line.length})`,
        suggestion: 'Consider breaking this line into multiple lines',
        rule: 'max-line-length',
      });
    }
    
    // Detect empty catch blocks
    if (line.includes('catch') && lines[i + 1]?.trim() === '}') {
      issues.push({
        id: `issue-${i}-emptycatch`,
        type: 'error',
        severity: 'high',
        line: i + 1,
        column: line.indexOf('catch'),
        message: 'Empty catch block - errors will be silently ignored',
        suggestion: 'Handle the error or at least log it',
        rule: 'no-empty-catch',
      });
    }
  });
  
  return issues;
}

function calculateMetrics(code: string): CodeMetrics {
  const lines = code.split('\n');
  const nonEmptyLines = lines.filter(l => l.trim().length > 0);
  const commentLines = lines.filter(l => l.trim().startsWith('//') || l.trim().startsWith('/*'));
  const functionMatches = code.match(/function\s+\w+|const\s+\w+\s*=\s*(\([^)]*\)|[^=]+)\s*=>/g) || [];
  const classMatches = code.match(/class\s+\w+/g) || [];
  const importMatches = code.match(/import\s+/g) || [];
  
  // Calculate cyclomatic complexity (simplified)
  const conditionals = (code.match(/if\s*\(|else\s+if|\?\s*[^:]+:/g) || []).length;
  const loops = (code.match(/for\s*\(|while\s*\(|\.forEach|\.map|\.filter|\.reduce/g) || []).length;
  const complexity = Math.min(100, (conditionals + loops) * 5);
  
  return {
    complexity,
    maintainability: Math.max(0, 100 - complexity - (nonEmptyLines.length > 300 ? 20 : 0)),
    testability: Math.max(0, 100 - (functionMatches.length > 10 ? 30 : 0) - complexity / 2),
    performance: Math.max(0, 100 - loops * 3 - (code.includes('await') ? 10 : 0)),
    security: code.includes('eval') || code.includes('innerHTML') ? 40 : 95,
    linesOfCode: nonEmptyLines.length,
    functions: functionMatches.length,
    classes: classMatches.length,
    imports: importMatches.length,
    comments: commentLines.length,
    duplications: 0,
  };
}

function generateSuggestions(code: string, language: string, issues: CodeIssue[]): string[] {
  const suggestions: string[] = [];
  
  if (issues.filter(i => i.type === 'error').length > 5) {
    suggestions.push('Consider refactoring this file - it has multiple critical issues');
  }
  
  if (code.split('\n').length > 300) {
    suggestions.push('This file is quite long. Consider splitting it into smaller modules');
  }
  
  if (!code.includes('try') && code.includes('await')) {
    suggestions.push('Add try-catch blocks around async operations for better error handling');
  }
  
  if ((language === 'typescript' || language === 'tsx') && code.includes(': any')) {
    suggestions.push('Replace "any" types with proper TypeScript types for better type safety');
  }
  
  if (!code.includes('export') && code.includes('function')) {
    suggestions.push('Consider exporting functions that might be reusable in other modules');
  }
  
  if (code.includes('var ')) {
    suggestions.push('Use "const" or "let" instead of "var" for better scoping');
  }
  
  return suggestions;
}

function detectPatterns(code: string, language: string): { name: string; count: number; quality: 'good' | 'bad' | 'neutral' }[] {
  const patterns: { name: string; count: number; quality: 'good' | 'bad' | 'neutral' }[] = [];
  
  const arrowFunctions = (code.match(/=>/g) || []).length;
  if (arrowFunctions > 0) {
    patterns.push({ name: 'Arrow Functions', count: arrowFunctions, quality: 'good' });
  }
  
  const destructuring = (code.match(/const\s*\{|\let\s*\{/g) || []).length;
  if (destructuring > 0) {
    patterns.push({ name: 'Destructuring', count: destructuring, quality: 'good' });
  }
  
  const asyncAwait = (code.match(/async\s+/g) || []).length;
  if (asyncAwait > 0) {
    patterns.push({ name: 'Async/Await', count: asyncAwait, quality: 'good' });
  }
  
  const callbacks = (code.match(/\.then\(/g) || []).length;
  if (callbacks > 0) {
    patterns.push({ name: 'Promise Chains', count: callbacks, quality: 'neutral' });
  }
  
  const nestedCallbacks = (code.match(/\)\s*=>\s*\{[^}]*\)\s*=>/g) || []).length;
  if (nestedCallbacks > 0) {
    patterns.push({ name: 'Nested Callbacks', count: nestedCallbacks, quality: 'bad' });
  }
  
  return patterns;
}

function extractDependencies(code: string, language: string): { name: string; version?: string; isOutdated?: boolean; hasVulnerability?: boolean }[] {
  const dependencies: { name: string; version?: string; isOutdated?: boolean; hasVulnerability?: boolean }[] = [];
  
  const importMatches = code.matchAll(/import\s+.*\s+from\s+['"]([^'"]+)['"]/g);
  for (const match of importMatches) {
    const dep = match[1];
    if (!dep.startsWith('.') && !dep.startsWith('@/')) {
      dependencies.push({ name: dep });
    }
  }
  
  return dependencies;
}

export const AICodeAnalyzer = memo(AICodeAnalyzerComponent);
export default AICodeAnalyzer;
