// ============== VERIFICATION SERVICE ==============
// Automated verification: tests, type checking, linting, security scanning

import { codeExecutionService } from './codeExecution';

// ============== TYPES ==============
export interface VerificationConfig {
  typeCheck: boolean;
  lint: boolean;
  tests: boolean;
  security: boolean;
  format: boolean;
}

export interface VerificationReport {
  id: string;
  timestamp: number;
  duration: number;
  passed: boolean;
  results: VerificationResultItem[];
  summary: VerificationSummary;
}

export interface VerificationResultItem {
  type: VerificationType;
  passed: boolean;
  output: string;
  errors: VerificationError[];
  warnings: VerificationWarning[];
  duration: number;
}

export type VerificationType = 'typecheck' | 'lint' | 'test' | 'security' | 'format';

export interface VerificationError {
  file: string;
  line: number;
  column: number;
  message: string;
  rule?: string;
  severity: 'error';
}

export interface VerificationWarning {
  file: string;
  line: number;
  column: number;
  message: string;
  rule?: string;
  severity: 'warning';
}

export interface VerificationSummary {
  totalErrors: number;
  totalWarnings: number;
  testsRun: number;
  testsPassed: number;
  testsFailed: number;
  coverage?: number;
}

export interface LanguageVerifier {
  language: string;
  typeCheck?: string;
  lint?: string;
  test?: string;
  format?: string;
  security?: string;
}

// ============== LANGUAGE VERIFIERS ==============
const LANGUAGE_VERIFIERS: Record<string, LanguageVerifier> = {
  typescript: {
    language: 'typescript',
    typeCheck: 'npx tsc --noEmit --pretty 2>&1',
    lint: 'npx eslint . --ext .ts,.tsx --format json 2>&1 || true',
    test: 'npx jest --passWithNoTests --json 2>&1 || npx vitest run --reporter=json 2>&1 || true',
    format: 'npx prettier --check "**/*.{ts,tsx}" 2>&1 || true',
    security: 'npx audit-ci --moderate 2>&1 || true',
  },
  javascript: {
    language: 'javascript',
    lint: 'npx eslint . --ext .js,.jsx --format json 2>&1 || true',
    test: 'npx jest --passWithNoTests --json 2>&1 || true',
    format: 'npx prettier --check "**/*.{js,jsx}" 2>&1 || true',
    security: 'npx audit-ci --moderate 2>&1 || true',
  },
  python: {
    language: 'python',
    typeCheck: 'python -m mypy . --ignore-missing-imports 2>&1 || true',
    lint: 'python -m pylint **/*.py --output-format=json 2>&1 || true',
    test: 'python -m pytest -v --tb=short 2>&1 || true',
    format: 'python -m black --check . 2>&1 || true',
    security: 'python -m bandit -r . -f json 2>&1 || true',
  },
  go: {
    language: 'go',
    typeCheck: 'go build ./... 2>&1',
    lint: 'golangci-lint run --out-format json 2>&1 || true',
    test: 'go test -v ./... 2>&1 || true',
    format: 'gofmt -l . 2>&1',
  },
  rust: {
    language: 'rust',
    typeCheck: 'cargo check 2>&1',
    lint: 'cargo clippy --message-format=json 2>&1 || true',
    test: 'cargo test 2>&1 || true',
    format: 'cargo fmt --check 2>&1 || true',
  },
};

// ============== VERIFICATION SERVICE ==============
class VerificationService {
  private defaultConfig: VerificationConfig = {
    typeCheck: true,
    lint: true,
    tests: true,
    security: false,
    format: false,
  };

  // Run full verification suite
  async verify(
    language: string,
    config?: Partial<VerificationConfig>
  ): Promise<VerificationReport> {
    const startTime = Date.now();
    const mergedConfig = { ...this.defaultConfig, ...config };
    const verifier = LANGUAGE_VERIFIERS[language] || LANGUAGE_VERIFIERS.typescript;
    const results: VerificationResultItem[] = [];

    // Type checking
    if (mergedConfig.typeCheck && verifier.typeCheck) {
      results.push(await this.runVerification('typecheck', verifier.typeCheck));
    }

    // Linting
    if (mergedConfig.lint && verifier.lint) {
      results.push(await this.runVerification('lint', verifier.lint));
    }

    // Tests
    if (mergedConfig.tests && verifier.test) {
      results.push(await this.runVerification('test', verifier.test));
    }

    // Security scan
    if (mergedConfig.security && verifier.security) {
      results.push(await this.runVerification('security', verifier.security));
    }

    // Format check
    if (mergedConfig.format && verifier.format) {
      results.push(await this.runVerification('format', verifier.format));
    }

    const passed = results.every(r => r.passed);
    const summary = this.generateSummary(results);

    return {
      id: this.generateId(),
      timestamp: Date.now(),
      duration: Date.now() - startTime,
      passed,
      results,
      summary,
    };
  }

  // Run type check only
  async typeCheck(language: string = 'typescript'): Promise<VerificationResultItem> {
    const verifier = LANGUAGE_VERIFIERS[language];
    if (!verifier?.typeCheck) {
      return this.createSkippedResult('typecheck', 'No type checker configured');
    }
    return this.runVerification('typecheck', verifier.typeCheck);
  }

  // Run lint only
  async lint(language: string = 'typescript'): Promise<VerificationResultItem> {
    const verifier = LANGUAGE_VERIFIERS[language];
    if (!verifier?.lint) {
      return this.createSkippedResult('lint', 'No linter configured');
    }
    return this.runVerification('lint', verifier.lint);
  }

  // Run tests only
  async test(language: string = 'typescript'): Promise<VerificationResultItem> {
    const verifier = LANGUAGE_VERIFIERS[language];
    if (!verifier?.test) {
      return this.createSkippedResult('test', 'No test runner configured');
    }
    return this.runVerification('test', verifier.test);
  }

  // Run security scan only
  async securityScan(language: string = 'typescript'): Promise<VerificationResultItem> {
    const verifier = LANGUAGE_VERIFIERS[language];
    if (!verifier?.security) {
      return this.createSkippedResult('security', 'No security scanner configured');
    }
    return this.runVerification('security', verifier.security);
  }

  // Verify specific file
  async verifyFile(
    filePath: string,
    language: string,
    config?: Partial<VerificationConfig>
  ): Promise<VerificationReport> {
    const startTime = Date.now();
    const mergedConfig = { ...this.defaultConfig, ...config };
    const results: VerificationResultItem[] = [];

    // Type check specific file
    if (mergedConfig.typeCheck) {
      const cmd = this.getFileTypeCheckCommand(filePath, language);
      if (cmd) {
        results.push(await this.runVerification('typecheck', cmd));
      }
    }

    // Lint specific file
    if (mergedConfig.lint) {
      const cmd = this.getFileLintCommand(filePath, language);
      if (cmd) {
        results.push(await this.runVerification('lint', cmd));
      }
    }

    const passed = results.every(r => r.passed);
    const summary = this.generateSummary(results);

    return {
      id: this.generateId(),
      timestamp: Date.now(),
      duration: Date.now() - startTime,
      passed,
      results,
      summary,
    };
  }

  // Quick verification (type check + lint only)
  async quickVerify(language: string = 'typescript'): Promise<VerificationReport> {
    return this.verify(language, {
      typeCheck: true,
      lint: true,
      tests: false,
      security: false,
      format: false,
    });
  }

  // Full verification (all checks)
  async fullVerify(language: string = 'typescript'): Promise<VerificationReport> {
    return this.verify(language, {
      typeCheck: true,
      lint: true,
      tests: true,
      security: true,
      format: true,
    });
  }

  private async runVerification(
    type: VerificationType,
    command: string
  ): Promise<VerificationResultItem> {
    const startTime = Date.now();

    try {
      const result = await codeExecutionService.execute({
        code: command,
        language: 'bash',
        timeout: 120000, // 2 minutes
      });

      const errors = this.parseErrors(type, result.output);
      const warnings = this.parseWarnings(type, result.output);
      const passed = this.determinePassStatus(type, result, errors);

      return {
        type,
        passed,
        output: result.output,
        errors,
        warnings,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        type,
        passed: false,
        output: error instanceof Error ? error.message : 'Verification failed',
        errors: [{
          file: '',
          line: 0,
          column: 0,
          message: error instanceof Error ? error.message : 'Unknown error',
          severity: 'error',
        }],
        warnings: [],
        duration: Date.now() - startTime,
      };
    }
  }

  private parseErrors(type: VerificationType, output: string): VerificationError[] {
    const errors: VerificationError[] = [];

    // Parse TypeScript errors
    if (type === 'typecheck') {
      const tsErrorRegex = /(.+)\((\d+),(\d+)\):\s*error\s*TS\d+:\s*(.+)/g;
      let match;
      while ((match = tsErrorRegex.exec(output)) !== null) {
        errors.push({
          file: match[1],
          line: parseInt(match[2]),
          column: parseInt(match[3]),
          message: match[4],
          severity: 'error',
        });
      }
    }

    // Parse ESLint JSON errors
    if (type === 'lint') {
      try {
        const jsonMatch = output.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const lintResults = JSON.parse(jsonMatch[0]);
          for (const file of lintResults) {
            for (const msg of file.messages || []) {
              if (msg.severity === 2) {
                errors.push({
                  file: file.filePath,
                  line: msg.line,
                  column: msg.column,
                  message: msg.message,
                  rule: msg.ruleId,
                  severity: 'error',
                });
              }
            }
          }
        }
      } catch {
        // Not JSON format, try regex
        const eslintRegex = /(.+):(\d+):(\d+):\s*error\s+(.+)/g;
        let match;
        while ((match = eslintRegex.exec(output)) !== null) {
          errors.push({
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            message: match[4],
            severity: 'error',
          });
        }
      }
    }

    // Parse test failures
    if (type === 'test') {
      if (output.includes('FAIL') || output.includes('failed')) {
        const failRegex = /FAIL\s+(.+)|✕\s+(.+)/g;
        let match;
        while ((match = failRegex.exec(output)) !== null) {
          errors.push({
            file: match[1] || match[2] || 'unknown',
            line: 0,
            column: 0,
            message: 'Test failed',
            severity: 'error',
          });
        }
      }
    }

    return errors;
  }

  private parseWarnings(type: VerificationType, output: string): VerificationWarning[] {
    const warnings: VerificationWarning[] = [];

    // Parse lint warnings
    if (type === 'lint') {
      try {
        const jsonMatch = output.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const lintResults = JSON.parse(jsonMatch[0]);
          for (const file of lintResults) {
            for (const msg of file.messages || []) {
              if (msg.severity === 1) {
                warnings.push({
                  file: file.filePath,
                  line: msg.line,
                  column: msg.column,
                  message: msg.message,
                  rule: msg.ruleId,
                  severity: 'warning',
                });
              }
            }
          }
        }
      } catch {
        // Ignore
      }
    }

    return warnings;
  }

  private determinePassStatus(
    type: VerificationType,
    result: { success: boolean; output: string },
    errors: VerificationError[]
  ): boolean {
    // Test failures are critical
    if (type === 'test') {
      return result.success && 
        !result.output.includes('FAIL') && 
        !result.output.includes('failed');
    }

    // Type errors are critical
    if (type === 'typecheck') {
      return errors.length === 0;
    }

    // Lint errors are critical, warnings are not
    if (type === 'lint') {
      return errors.length === 0;
    }

    // Security issues are critical
    if (type === 'security') {
      return result.success && !result.output.includes('vulnerability');
    }

    // Format issues are not critical
    if (type === 'format') {
      return true; // Always pass, just informational
    }

    return result.success;
  }

  private generateSummary(results: VerificationResultItem[]): VerificationSummary {
    let totalErrors = 0;
    let totalWarnings = 0;
    let testsRun = 0;
    let testsPassed = 0;
    let testsFailed = 0;

    for (const result of results) {
      totalErrors += result.errors.length;
      totalWarnings += result.warnings.length;

      if (result.type === 'test') {
        // Try to parse test counts from output
        const passMatch = result.output.match(/(\d+)\s+pass/i);
        const failMatch = result.output.match(/(\d+)\s+fail/i);
        
        if (passMatch) testsPassed = parseInt(passMatch[1]);
        if (failMatch) testsFailed = parseInt(failMatch[1]);
        testsRun = testsPassed + testsFailed;
      }
    }

    return {
      totalErrors,
      totalWarnings,
      testsRun,
      testsPassed,
      testsFailed,
    };
  }

  private getFileTypeCheckCommand(filePath: string, language: string): string | null {
    switch (language) {
      case 'typescript':
      case 'typescriptreact':
        return `npx tsc --noEmit ${filePath} 2>&1`;
      case 'python':
        return `python -m mypy ${filePath} --ignore-missing-imports 2>&1 || true`;
      default:
        return null;
    }
  }

  private getFileLintCommand(filePath: string, language: string): string | null {
    switch (language) {
      case 'typescript':
      case 'typescriptreact':
      case 'javascript':
      case 'javascriptreact':
        return `npx eslint ${filePath} --format json 2>&1 || true`;
      case 'python':
        return `python -m pylint ${filePath} --output-format=json 2>&1 || true`;
      default:
        return null;
    }
  }

  private createSkippedResult(type: VerificationType, reason: string): VerificationResultItem {
    return {
      type,
      passed: true,
      output: reason,
      errors: [],
      warnings: [],
      duration: 0,
    };
  }

  private generateId(): string {
    return `verify-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============== SINGLETON ==============
export const verificationService = new VerificationService();

// ============== REACT HOOKS ==============
import { useState, useCallback } from 'react';

export function useVerification() {
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const verify = useCallback(async (language: string, config?: Partial<VerificationConfig>) => {
    setIsRunning(true);
    setError(null);
    try {
      const result = await verificationService.verify(language, config);
      setReport(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Verification failed'));
      throw err;
    } finally {
      setIsRunning(false);
    }
  }, []);

  const quickVerify = useCallback(async (language: string = 'typescript') => {
    setIsRunning(true);
    setError(null);
    try {
      const result = await verificationService.quickVerify(language);
      setReport(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Verification failed'));
      throw err;
    } finally {
      setIsRunning(false);
    }
  }, []);

  return {
    report,
    isRunning,
    error,
    verify,
    quickVerify,
    typeCheck: verificationService.typeCheck.bind(verificationService),
    lint: verificationService.lint.bind(verificationService),
    test: verificationService.test.bind(verificationService),
  };
}

export default verificationService;
