// ============== TEST GENERATOR ==============
// AI-powered test generation with multiple frameworks support

import React, { memo, useState, useCallback } from 'react';
import styles from './TestGenerator.module.css';

interface TestCase {
  id: string;
  name: string;
  type: 'unit' | 'integration' | 'e2e' | 'snapshot';
  code: string;
  description: string;
  coverage: string[];
}

interface TestSuite {
  name: string;
  framework: string;
  imports: string;
  setup?: string;
  teardown?: string;
  tests: TestCase[];
}

interface TestGeneratorProps {
  code: string;
  language: string;
  filePath?: string;
  framework?: 'jest' | 'vitest' | 'mocha' | 'playwright' | 'cypress';
  onGenerate?: (suite: TestSuite) => void;
  onInsert?: (code: string) => void;
  className?: string;
}

const TestGeneratorComponent: React.FC<TestGeneratorProps> = ({
  code,
  language,
  filePath,
  framework = 'jest',
  onGenerate,
  onInsert,
  className,
}) => {
  const [selectedFramework, setSelectedFramework] = useState(framework);
  const [testTypes, setTestTypes] = useState<Set<string>>(new Set(['unit']));
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSuite, setGeneratedSuite] = useState<TestSuite | null>(null);
  const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set());
  const [showPreview, setShowPreview] = useState(false);
  const [options, setOptions] = useState({
    includeMocks: true,
    includeEdgeCases: true,
    includeErrorCases: true,
    generateSnapshots: false,
    coverage: 80,
  });

  const frameworks = [
    { id: 'jest', name: 'Jest', icon: '🃏' },
    { id: 'vitest', name: 'Vitest', icon: '⚡' },
    { id: 'mocha', name: 'Mocha', icon: '☕' },
    { id: 'playwright', name: 'Playwright', icon: '🎭' },
    { id: 'cypress', name: 'Cypress', icon: '🌲' },
  ];

  const testTypeOptions = [
    { id: 'unit', name: 'Unit Tests', icon: '🧪' },
    { id: 'integration', name: 'Integration', icon: '🔗' },
    { id: 'e2e', name: 'E2E', icon: '🌐' },
    { id: 'snapshot', name: 'Snapshot', icon: '📸' },
  ];

  const toggleTestType = (type: string) => {
    setTestTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const generateTests = useCallback(async () => {
    setIsGenerating(true);
    
    // Simulate AI test generation
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    const functions = extractFunctions(code);
    const tests: TestCase[] = [];
    
    functions.forEach((func, i) => {
      // Generate unit test
      if (testTypes.has('unit')) {
        tests.push({
          id: `test-unit-${i}`,
          name: `should ${func.name} correctly`,
          type: 'unit',
          code: generateUnitTest(func, selectedFramework),
          description: `Tests the ${func.name} function with valid inputs`,
          coverage: [func.name],
        });
        
        if (options.includeEdgeCases) {
          tests.push({
            id: `test-edge-${i}`,
            name: `should handle edge cases for ${func.name}`,
            type: 'unit',
            code: generateEdgeCaseTest(func, selectedFramework),
            description: `Tests edge cases like null, undefined, empty values`,
            coverage: [func.name],
          });
        }
        
        if (options.includeErrorCases) {
          tests.push({
            id: `test-error-${i}`,
            name: `should throw error for invalid input in ${func.name}`,
            type: 'unit',
            code: generateErrorTest(func, selectedFramework),
            description: `Tests error handling and validation`,
            coverage: [func.name],
          });
        }
      }
      
      if (testTypes.has('snapshot') && options.generateSnapshots) {
        tests.push({
          id: `test-snap-${i}`,
          name: `should match snapshot for ${func.name}`,
          type: 'snapshot',
          code: generateSnapshotTest(func, selectedFramework),
          description: `Snapshot test for output verification`,
          coverage: [func.name],
        });
      }
    });
    
    const suite: TestSuite = {
      name: filePath ? `${filePath.split('/').pop()?.replace(/\.\w+$/, '')}.test` : 'generated.test',
      framework: selectedFramework,
      imports: generateImports(selectedFramework, code),
      setup: options.includeMocks ? generateSetup(selectedFramework) : undefined,
      teardown: options.includeMocks ? generateTeardown(selectedFramework) : undefined,
      tests,
    };
    
    setGeneratedSuite(suite);
    setSelectedTests(new Set(tests.map(t => t.id)));
    setShowPreview(true);
    setIsGenerating(false);
    onGenerate?.(suite);
  }, [code, filePath, selectedFramework, testTypes, options, onGenerate]);

  const getFullTestCode = useCallback(() => {
    if (!generatedSuite) return '';
    
    const selectedTestCases = generatedSuite.tests.filter(t => selectedTests.has(t.id));
    
    let code = generatedSuite.imports + '\n\n';
    code += `describe('${generatedSuite.name}', () => {\n`;
    
    if (generatedSuite.setup) {
      code += `  beforeEach(() => {\n${generatedSuite.setup}\n  });\n\n`;
    }
    
    if (generatedSuite.teardown) {
      code += `  afterEach(() => {\n${generatedSuite.teardown}\n  });\n\n`;
    }
    
    selectedTestCases.forEach(test => {
      code += `  ${test.type === 'unit' ? 'it' : 'test'}('${test.name}', ${test.type === 'e2e' ? 'async ' : ''}() => {\n`;
      code += test.code.split('\n').map(l => `    ${l}`).join('\n');
      code += '\n  });\n\n';
    });
    
    code += '});\n';
    
    return code;
  }, [generatedSuite, selectedTests]);

  const handleInsert = useCallback(() => {
    const code = getFullTestCode();
    onInsert?.(code);
  }, [getFullTestCode, onInsert]);

  const toggleTest = (id: string) => {
    setSelectedTests(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.icon}>🧪</span>
          <span>AI Test Generator</span>
        </div>
      </div>

      <div className={styles.config}>
        <div className={styles.section}>
          <label className={styles.sectionLabel}>Framework</label>
          <div className={styles.frameworkGrid}>
            {frameworks.map(fw => (
              <button
                key={fw.id}
                className={`${styles.frameworkBtn} ${selectedFramework === fw.id ? styles.active : ''}`}
                onClick={() => setSelectedFramework(fw.id as typeof selectedFramework)}
              >
                <span>{fw.icon}</span>
                <span>{fw.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <label className={styles.sectionLabel}>Test Types</label>
          <div className={styles.testTypes}>
            {testTypeOptions.map(type => (
              <button
                key={type.id}
                className={`${styles.typeBtn} ${testTypes.has(type.id) ? styles.active : ''}`}
                onClick={() => toggleTestType(type.id)}
              >
                <span>{type.icon}</span>
                <span>{type.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <label className={styles.sectionLabel}>Options</label>
          <div className={styles.optionsList}>
            <label className={styles.option}>
              <input
                type="checkbox"
                checked={options.includeMocks}
                onChange={e => setOptions(prev => ({ ...prev, includeMocks: e.target.checked }))}
              />
              <span>Include mocks & stubs</span>
            </label>
            <label className={styles.option}>
              <input
                type="checkbox"
                checked={options.includeEdgeCases}
                onChange={e => setOptions(prev => ({ ...prev, includeEdgeCases: e.target.checked }))}
              />
              <span>Generate edge cases</span>
            </label>
            <label className={styles.option}>
              <input
                type="checkbox"
                checked={options.includeErrorCases}
                onChange={e => setOptions(prev => ({ ...prev, includeErrorCases: e.target.checked }))}
              />
              <span>Generate error cases</span>
            </label>
            <label className={styles.option}>
              <input
                type="checkbox"
                checked={options.generateSnapshots}
                onChange={e => setOptions(prev => ({ ...prev, generateSnapshots: e.target.checked }))}
              />
              <span>Generate snapshots</span>
            </label>
          </div>
        </div>

        <div className={styles.section}>
          <label className={styles.sectionLabel}>Target Coverage: {options.coverage}%</label>
          <input
            type="range"
            min="50"
            max="100"
            value={options.coverage}
            onChange={e => setOptions(prev => ({ ...prev, coverage: parseInt(e.target.value) }))}
            className={styles.slider}
          />
        </div>
      </div>

      <button
        className={styles.generateBtn}
        onClick={generateTests}
        disabled={isGenerating || testTypes.size === 0}
      >
        {isGenerating ? (
          <>
            <span className={styles.spinner} />
            Generating...
          </>
        ) : (
          <>✨ Generate Tests</>
        )}
      </button>

      {showPreview && generatedSuite && (
        <div className={styles.preview}>
          <div className={styles.previewHeader}>
            <span className={styles.previewTitle}>
              Generated {generatedSuite.tests.length} tests
            </span>
            <div className={styles.previewActions}>
              <button className={styles.selectAllBtn} onClick={() => setSelectedTests(new Set(generatedSuite.tests.map(t => t.id)))}>
                Select All
              </button>
              <button className={styles.insertBtn} onClick={handleInsert}>
                📋 Copy Code
              </button>
            </div>
          </div>

          <div className={styles.testsList}>
            {generatedSuite.tests.map(test => (
              <div key={test.id} className={`${styles.testItem} ${selectedTests.has(test.id) ? styles.selected : ''}`}>
                <input
                  type="checkbox"
                  checked={selectedTests.has(test.id)}
                  onChange={() => toggleTest(test.id)}
                />
                <div className={styles.testInfo}>
                  <span className={styles.testName}>{test.name}</span>
                  <span className={styles.testDesc}>{test.description}</span>
                </div>
                <span className={`${styles.testType} ${styles[test.type]}`}>{test.type}</span>
              </div>
            ))}
          </div>

          <div className={styles.codePreview}>
            <pre>{getFullTestCode()}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
function extractFunctions(code: string): { name: string; params: string[]; isAsync: boolean }[] {
  const functions: { name: string; params: string[]; isAsync: boolean }[] = [];
  
  const funcMatches = code.matchAll(/(?:export\s+)?(?:async\s+)?(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>)/g);
  for (const match of funcMatches) {
    const name = match[1] || match[2];
    if (name && !name.startsWith('_')) {
      functions.push({
        name,
        params: [],
        isAsync: match[0].includes('async'),
      });
    }
  }
  
  return functions;
}

function generateImports(framework: string, code: string): string {
  const imports: string[] = [];
  
  switch (framework) {
    case 'jest':
    case 'vitest':
      imports.push(`import { describe, it, expect, beforeEach, afterEach, vi } from '${framework}';`);
      break;
    case 'mocha':
      imports.push(`import { describe, it, beforeEach, afterEach } from 'mocha';`);
      imports.push(`import { expect } from 'chai';`);
      break;
    case 'playwright':
      imports.push(`import { test, expect } from '@playwright/test';`);
      break;
    case 'cypress':
      imports.push(`/// <reference types="cypress" />`);
      break;
  }
  
  // Add import for the module being tested
  imports.push(`import { /* functions */ } from './module';`);
  
  return imports.join('\n');
}

function generateSetup(framework: string): string {
  return `    // Setup mocks and test data`;
}

function generateTeardown(framework: string): string {
  return `    // Cleanup mocks`;
}

function generateUnitTest(func: { name: string; params: string[]; isAsync: boolean }, framework: string): string {
  const expectFn = framework === 'cypress' ? 'cy.wrap' : 'expect';
  const asyncPrefix = func.isAsync ? 'await ' : '';
  
  return `// Arrange
const input = /* test input */;
const expected = /* expected output */;

// Act
const result = ${asyncPrefix}${func.name}(input);

// Assert
${expectFn}(result).toEqual(expected);`;
}

function generateEdgeCaseTest(func: { name: string }, framework: string): string {
  return `// Test with null
expect(() => ${func.name}(null)).not.toThrow();

// Test with undefined
expect(() => ${func.name}(undefined)).not.toThrow();

// Test with empty value
expect(() => ${func.name}('')).not.toThrow();`;
}

function generateErrorTest(func: { name: string }, framework: string): string {
  return `// Test invalid input throws
expect(() => ${func.name}(invalidInput)).toThrow();

// Test specific error type
expect(() => ${func.name}(invalidInput)).toThrow(ValidationError);`;
}

function generateSnapshotTest(func: { name: string }, framework: string): string {
  return `const result = ${func.name}(testInput);
expect(result).toMatchSnapshot();`;
}

export const TestGenerator = memo(TestGeneratorComponent);
export default TestGenerator;
