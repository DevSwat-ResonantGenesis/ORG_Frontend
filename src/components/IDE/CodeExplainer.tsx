// ============== CODE EXPLAINER ==============
// AI-powered code explanation and documentation generator

import React, { memo, useState, useCallback } from 'react';
import styles from './CodeExplainer.module.css';

interface Explanation {
  summary: string;
  details: string[];
  complexity: 'simple' | 'moderate' | 'complex';
  concepts: string[];
  suggestions: string[];
  documentation?: string;
}

interface CodeExplainerProps {
  code: string;
  language: string;
  selection?: { start: number; end: number; text: string };
  onGenerateDocs?: (docs: string) => void;
  className?: string;
}

const CodeExplainerComponent: React.FC<CodeExplainerProps> = ({
  code,
  language,
  selection,
  onGenerateDocs,
  className,
}) => {
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [activeTab, setActiveTab] = useState<'explain' | 'docs' | 'learn'>('explain');
  const [explainLevel, setExplainLevel] = useState<'beginner' | 'intermediate' | 'expert'>('intermediate');
  const [generatedDocs, setGeneratedDocs] = useState<string>('');

  const explainCode = useCallback(async () => {
    setIsExplaining(true);
    const codeToExplain = selection?.text || code;
    
    // Simulate AI explanation
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 500));
    
    const result = analyzeCode(codeToExplain, language, explainLevel);
    setExplanation(result);
    setIsExplaining(false);
  }, [code, selection, language, explainLevel]);

  const generateDocumentation = useCallback(async () => {
    setIsExplaining(true);
    
    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
    
    const docs = generateDocs(code, language);
    setGeneratedDocs(docs);
    setIsExplaining(false);
    onGenerateDocs?.(docs);
  }, [code, language, onGenerateDocs]);

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return styles.simple;
      case 'moderate': return styles.moderate;
      case 'complex': return styles.complex;
      default: return '';
    }
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.icon}>📚</span>
          <span>Code Explainer</span>
        </div>
        {selection?.text && (
          <span className={styles.selectionBadge}>Selection mode</span>
        )}
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'explain' ? styles.active : ''}`}
          onClick={() => setActiveTab('explain')}
        >
          🧠 Explain
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'docs' ? styles.active : ''}`}
          onClick={() => setActiveTab('docs')}
        >
          📝 Generate Docs
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'learn' ? styles.active : ''}`}
          onClick={() => setActiveTab('learn')}
        >
          🎓 Learn
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'explain' && (
          <div className={styles.explainPanel}>
            <div className={styles.levelSelector}>
              <label>Explanation Level:</label>
              <div className={styles.levels}>
                {(['beginner', 'intermediate', 'expert'] as const).map(level => (
                  <button
                    key={level}
                    className={`${styles.levelBtn} ${explainLevel === level ? styles.active : ''}`}
                    onClick={() => setExplainLevel(level)}
                  >
                    {level === 'beginner' && '🌱'}
                    {level === 'intermediate' && '🌿'}
                    {level === 'expert' && '🌳'}
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <button
              className={styles.explainBtn}
              onClick={explainCode}
              disabled={isExplaining}
            >
              {isExplaining ? (
                <>
                  <span className={styles.spinner} />
                  Analyzing...
                </>
              ) : (
                <>🔍 Explain {selection?.text ? 'Selection' : 'Code'}</>
              )}
            </button>

            {explanation && (
              <div className={styles.explanation}>
                <div className={styles.summary}>
                  <div className={styles.summaryHeader}>
                    <span>Summary</span>
                    <span className={`${styles.complexity} ${getComplexityColor(explanation.complexity)}`}>
                      {explanation.complexity}
                    </span>
                  </div>
                  <p>{explanation.summary}</p>
                </div>

                <div className={styles.details}>
                  <h4>How it works:</h4>
                  <ol>
                    {explanation.details.map((detail, i) => (
                      <li key={i}>{detail}</li>
                    ))}
                  </ol>
                </div>

                {explanation.concepts.length > 0 && (
                  <div className={styles.concepts}>
                    <h4>Key Concepts:</h4>
                    <div className={styles.conceptTags}>
                      {explanation.concepts.map((concept, i) => (
                        <span key={i} className={styles.conceptTag}>{concept}</span>
                      ))}
                    </div>
                  </div>
                )}

                {explanation.suggestions.length > 0 && (
                  <div className={styles.suggestions}>
                    <h4>💡 Suggestions:</h4>
                    <ul>
                      {explanation.suggestions.map((suggestion, i) => (
                        <li key={i}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'docs' && (
          <div className={styles.docsPanel}>
            <button
              className={styles.generateBtn}
              onClick={generateDocumentation}
              disabled={isExplaining}
            >
              {isExplaining ? (
                <>
                  <span className={styles.spinner} />
                  Generating...
                </>
              ) : (
                <>✨ Generate Documentation</>
              )}
            </button>

            {generatedDocs && (
              <div className={styles.docsPreview}>
                <div className={styles.docsHeader}>
                  <span>Generated Documentation</span>
                  <button
                    className={styles.copyBtn}
                    onClick={() => navigator.clipboard.writeText(generatedDocs)}
                  >
                    📋 Copy
                  </button>
                </div>
                <pre className={styles.docsCode}>{generatedDocs}</pre>
              </div>
            )}
          </div>
        )}

        {activeTab === 'learn' && (
          <div className={styles.learnPanel}>
            <div className={styles.learnSection}>
              <h4>📖 Related Topics</h4>
              <div className={styles.topicsList}>
                {getRelatedTopics(code, language).map((topic, i) => (
                  <button key={i} className={styles.topicBtn}>
                    <span className={styles.topicIcon}>{topic.icon}</span>
                    <div className={styles.topicInfo}>
                      <span className={styles.topicName}>{topic.name}</span>
                      <span className={styles.topicDesc}>{topic.description}</span>
                    </div>
                    <span className={styles.topicArrow}>→</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.learnSection}>
              <h4>🔗 Resources</h4>
              <div className={styles.resourcesList}>
                {getResources(language).map((resource, i) => (
                  <a key={i} href={resource.url} className={styles.resourceLink} target="_blank" rel="noopener noreferrer">
                    <span>{resource.icon}</span>
                    <span>{resource.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions
function analyzeCode(code: string, language: string, level: string): Explanation {
  const lines = code.split('\n').filter(l => l.trim());
  const hasAsync = code.includes('async') || code.includes('await');
  const hasReact = code.includes('useState') || code.includes('useEffect') || code.includes('React');
  const hasLoops = code.includes('for') || code.includes('while') || code.includes('.map') || code.includes('.forEach');
  
  let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
  if (lines.length > 50 || (hasAsync && hasLoops)) complexity = 'complex';
  else if (lines.length > 20 || hasAsync || hasReact) complexity = 'moderate';
  
  const details: string[] = [];
  const concepts: string[] = [];
  const suggestions: string[] = [];
  
  if (hasReact) {
    details.push('This code uses React for building user interfaces');
    concepts.push('React', 'Components', 'Hooks');
  }
  
  if (hasAsync) {
    details.push('Asynchronous operations are used for non-blocking execution');
    concepts.push('Async/Await', 'Promises');
  }
  
  if (code.includes('useState')) {
    details.push('useState hook manages component state');
    concepts.push('State Management');
  }
  
  if (code.includes('useEffect')) {
    details.push('useEffect hook handles side effects like data fetching');
    concepts.push('Side Effects');
  }
  
  if (code.includes('useCallback') || code.includes('useMemo')) {
    details.push('Memoization is used to optimize performance');
    concepts.push('Memoization', 'Performance');
  }
  
  if (hasLoops) {
    details.push('Iteration is used to process collections of data');
    concepts.push('Iteration', 'Array Methods');
  }
  
  // Suggestions based on code analysis
  if (code.includes('any')) {
    suggestions.push('Replace "any" types with specific TypeScript types');
  }
  if (!code.includes('try') && hasAsync) {
    suggestions.push('Add error handling with try-catch for async operations');
  }
  if (lines.length > 100) {
    suggestions.push('Consider splitting this into smaller, focused functions');
  }
  
  return {
    summary: `This ${language} code ${hasReact ? 'is a React component that ' : ''}${hasAsync ? 'performs asynchronous operations' : 'defines logic'} with ${complexity} complexity. It contains ${lines.length} lines of code.`,
    details: details.length > 0 ? details : ['This code defines functions and logic for your application'],
    complexity,
    concepts: concepts.length > 0 ? concepts : ['JavaScript', 'Functions'],
    suggestions,
  };
}

function generateDocs(code: string, language: string): string {
  const functions = code.matchAll(/(?:export\s+)?(?:async\s+)?(?:function\s+(\w+)|const\s+(\w+)\s*=)/g);
  let docs = '';
  
  for (const match of functions) {
    const name = match[1] || match[2];
    if (name) {
      docs += `/**
 * ${name}
 * 
 * @description TODO: Add description
 * @param {any} param - TODO: Add parameter description
 * @returns {any} TODO: Add return description
 * @example
 * ${name}(arg);
 */\n\n`;
    }
  }
  
  return docs || '// No documentable functions found';
}

function getRelatedTopics(code: string, language: string): { icon: string; name: string; description: string }[] {
  const topics: { icon: string; name: string; description: string }[] = [];
  
  if (code.includes('useState') || code.includes('useEffect')) {
    topics.push({ icon: '⚛️', name: 'React Hooks', description: 'Modern React state and lifecycle management' });
  }
  if (code.includes('async') || code.includes('await')) {
    topics.push({ icon: '⏳', name: 'Async JavaScript', description: 'Asynchronous programming patterns' });
  }
  if (code.includes('interface') || code.includes(': string') || code.includes(': number')) {
    topics.push({ icon: '🔷', name: 'TypeScript', description: 'Static typing for JavaScript' });
  }
  if (code.includes('.map') || code.includes('.filter') || code.includes('.reduce')) {
    topics.push({ icon: '📚', name: 'Array Methods', description: 'Functional array transformations' });
  }
  
  if (topics.length === 0) {
    topics.push({ icon: '📖', name: 'JavaScript Basics', description: 'Core JavaScript concepts' });
  }
  
  return topics;
}

function getResources(language: string): { icon: string; name: string; url: string }[] {
  return [
    { icon: '📚', name: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
    { icon: '⚛️', name: 'React Documentation', url: 'https://react.dev' },
    { icon: '🔷', name: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/' },
    { icon: '📖', name: 'JavaScript.info', url: 'https://javascript.info' },
  ];
}

export const CodeExplainer = memo(CodeExplainerComponent);
export default CodeExplainer;
