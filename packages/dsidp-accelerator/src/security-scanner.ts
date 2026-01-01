/**
 * DSID-P Security Scanner
 * 
 * Comprehensive security scanning for:
 * - Code vulnerabilities
 * - Dependency audits
 * - Secret detection
 * - OWASP compliance
 * - Security best practices
 */

// ============== TYPES ==============

export interface SecurityConfig {
  scanDependencies: boolean;
  scanSecrets: boolean;
  scanCode: boolean;
  scanInfra: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ignorePatterns: string[];
  customRules: SecurityRule[];
}

export interface SecurityRule {
  id: string;
  name: string;
  description: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: SecurityCategory;
  fix?: string;
}

export type SecurityCategory = 
  | 'injection'
  | 'authentication'
  | 'sensitive_data'
  | 'xxe'
  | 'access_control'
  | 'misconfig'
  | 'xss'
  | 'deserialization'
  | 'components'
  | 'logging'
  | 'secrets'
  | 'cryptography';

export interface Vulnerability {
  id: string;
  rule: string;
  category: SecurityCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  file?: string;
  line?: number;
  column?: number;
  code?: string;
  fix?: string;
  references: string[];
  cwe?: string;
  cvss?: number;
}

export interface DependencyVuln {
  package: string;
  version: string;
  vulnerability: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  fixedIn?: string;
  cve?: string;
  advisory?: string;
}

export interface SecretFinding {
  type: string;
  file: string;
  line: number;
  match: string;
  entropy?: number;
}

export interface ScanResult {
  timestamp: number;
  duration: number;
  vulnerabilities: Vulnerability[];
  dependencies: DependencyVuln[];
  secrets: SecretFinding[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  score: number; // 0-100
  passed: boolean;
}

// ============== OWASP TOP 10 RULES ==============

const OWASP_RULES: SecurityRule[] = [
  // A01: Broken Access Control
  {
    id: 'A01-001',
    name: 'Insecure Direct Object Reference',
    description: 'Direct reference to internal objects without access control',
    pattern: /\.(find|findOne|findById)\s*\(\s*(req\.params|req\.query|req\.body)/gi,
    severity: 'high',
    category: 'access_control',
    fix: 'Add ownership/permission checks before accessing resources',
  },
  {
    id: 'A01-002',
    name: 'Missing Authorization',
    description: 'Route handler without authorization middleware',
    pattern: /app\.(get|post|put|delete|patch)\s*\([^)]+,\s*(?!.*auth).*\)/gi,
    severity: 'medium',
    category: 'access_control',
    fix: 'Add authentication/authorization middleware',
  },

  // A02: Cryptographic Failures
  {
    id: 'A02-001',
    name: 'Weak Hashing Algorithm',
    description: 'Use of MD5 or SHA1 for password hashing',
    pattern: /createHash\s*\(\s*['"`](md5|sha1)['"`]\s*\)/gi,
    severity: 'critical',
    category: 'cryptography',
    fix: 'Use bcrypt, argon2, or scrypt for password hashing',
  },
  {
    id: 'A02-002',
    name: 'Hardcoded Encryption Key',
    description: 'Encryption key hardcoded in source code',
    pattern: /(encrypt|decrypt|cipher|createCipher)\s*\([^)]*['"`][a-zA-Z0-9]{16,}['"`]/gi,
    severity: 'critical',
    category: 'cryptography',
    fix: 'Use environment variables or key management service',
  },

  // A03: Injection
  {
    id: 'A03-001',
    name: 'SQL Injection',
    description: 'String concatenation in SQL query',
    pattern: /(query|execute)\s*\(\s*[`'"].*\$\{|(\+\s*req\.(params|query|body))/gi,
    severity: 'critical',
    category: 'injection',
    fix: 'Use parameterized queries or ORM',
  },
  {
    id: 'A03-002',
    name: 'Command Injection',
    description: 'User input in shell command',
    pattern: /(exec|spawn|execSync|spawnSync)\s*\([^)]*(\$\{|req\.(params|query|body))/gi,
    severity: 'critical',
    category: 'injection',
    fix: 'Sanitize input and avoid shell commands with user data',
  },
  {
    id: 'A03-003',
    name: 'NoSQL Injection',
    description: 'Unsanitized input in NoSQL query',
    pattern: /\.(find|findOne|update|delete)\s*\(\s*\{[^}]*req\.(params|query|body)/gi,
    severity: 'high',
    category: 'injection',
    fix: 'Validate and sanitize input, use schema validation',
  },
  {
    id: 'A03-004',
    name: 'Eval Usage',
    description: 'Use of eval() with potential user input',
    pattern: /eval\s*\(/gi,
    severity: 'critical',
    category: 'injection',
    fix: 'Avoid eval(), use safer alternatives',
  },

  // A04: Insecure Design
  {
    id: 'A04-001',
    name: 'Missing Rate Limiting',
    description: 'API endpoint without rate limiting',
    pattern: /app\.(get|post|put|delete)\s*\(['"`]\/api/gi,
    severity: 'medium',
    category: 'misconfig',
    fix: 'Add rate limiting middleware',
  },

  // A05: Security Misconfiguration
  {
    id: 'A05-001',
    name: 'Debug Mode Enabled',
    description: 'Debug or development mode in production',
    pattern: /(DEBUG|NODE_ENV)\s*[=:]\s*['"`]?(true|development)/gi,
    severity: 'medium',
    category: 'misconfig',
    fix: 'Disable debug mode in production',
  },
  {
    id: 'A05-002',
    name: 'CORS Wildcard',
    description: 'CORS allowing all origins',
    pattern: /cors\s*\(\s*\{[^}]*origin\s*:\s*['"`]\*['"`]/gi,
    severity: 'high',
    category: 'misconfig',
    fix: 'Restrict CORS to specific origins',
  },
  {
    id: 'A05-003',
    name: 'Missing Security Headers',
    description: 'Response without security headers',
    pattern: /res\.(send|json|render)\s*\(/gi,
    severity: 'low',
    category: 'misconfig',
    fix: 'Use helmet middleware for security headers',
  },

  // A06: Vulnerable Components
  {
    id: 'A06-001',
    name: 'Outdated jQuery',
    description: 'jQuery version with known vulnerabilities',
    pattern: /jquery[@-]([0-2]\.|3\.[0-4]\.)/gi,
    severity: 'medium',
    category: 'components',
    fix: 'Update jQuery to latest version',
  },

  // A07: Authentication Failures
  {
    id: 'A07-001',
    name: 'Weak Password Policy',
    description: 'Password validation too permissive',
    pattern: /password\s*\.\s*length\s*[<>=]+\s*[0-5]/gi,
    severity: 'medium',
    category: 'authentication',
    fix: 'Require minimum 8 characters with complexity',
  },
  {
    id: 'A07-002',
    name: 'JWT Without Expiry',
    description: 'JWT token without expiration',
    pattern: /jwt\.sign\s*\([^)]*(?!expiresIn)/gi,
    severity: 'high',
    category: 'authentication',
    fix: 'Add expiresIn option to JWT tokens',
  },
  {
    id: 'A07-003',
    name: 'Hardcoded JWT Secret',
    description: 'JWT secret hardcoded in source',
    pattern: /jwt\.(sign|verify)\s*\([^)]*['"`][a-zA-Z0-9]{8,}['"`]/gi,
    severity: 'critical',
    category: 'authentication',
    fix: 'Use environment variable for JWT secret',
  },

  // A08: Software Integrity Failures
  {
    id: 'A08-001',
    name: 'Insecure Deserialization',
    description: 'Unsafe JSON parsing',
    pattern: /JSON\.parse\s*\(\s*(req\.|user|input|data)/gi,
    severity: 'medium',
    category: 'deserialization',
    fix: 'Validate JSON structure before parsing',
  },

  // A09: Logging Failures
  {
    id: 'A09-001',
    name: 'Sensitive Data in Logs',
    description: 'Logging potentially sensitive data',
    pattern: /console\.(log|info|debug)\s*\([^)]*password|token|secret|key|credential/gi,
    severity: 'high',
    category: 'logging',
    fix: 'Remove sensitive data from logs',
  },

  // A10: SSRF
  {
    id: 'A10-001',
    name: 'Server-Side Request Forgery',
    description: 'User-controlled URL in HTTP request',
    pattern: /(fetch|axios|request)\s*\(\s*(req\.|user|input|\$\{)/gi,
    severity: 'high',
    category: 'injection',
    fix: 'Validate and whitelist allowed URLs',
  },
];

// ============== SECRET PATTERNS ==============

const SECRET_PATTERNS: Array<{ name: string; pattern: RegExp; entropy?: number }> = [
  { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/g },
  { name: 'AWS Secret Key', pattern: /[0-9a-zA-Z/+]{40}/g, entropy: 4.5 },
  { name: 'GitHub Token', pattern: /ghp_[0-9a-zA-Z]{36}/g },
  { name: 'GitHub OAuth', pattern: /gho_[0-9a-zA-Z]{36}/g },
  { name: 'Slack Token', pattern: /xox[baprs]-[0-9a-zA-Z-]{10,}/g },
  { name: 'Stripe Key', pattern: /sk_live_[0-9a-zA-Z]{24,}/g },
  { name: 'Google API Key', pattern: /AIza[0-9A-Za-z-_]{35}/g },
  { name: 'Private Key', pattern: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g },
  { name: 'JWT Token', pattern: /eyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/]*/g },
  { name: 'Generic API Key', pattern: /['"](api[_-]?key|apikey)['"]\s*[:=]\s*['"][0-9a-zA-Z]{20,}['"]/gi },
  { name: 'Generic Secret', pattern: /['"](secret|password|passwd|pwd)['"]\s*[:=]\s*['"][^'"]{8,}['"]/gi },
  { name: 'Database URL', pattern: /(mongodb|postgres|mysql|redis):\/\/[^:]+:[^@]+@/gi },
  { name: 'Bearer Token', pattern: /Bearer\s+[0-9a-zA-Z-_.]+/g },
];

// ============== XSS PATTERNS ==============

const XSS_RULES: SecurityRule[] = [
  {
    id: 'XSS-001',
    name: 'innerHTML Assignment',
    description: 'Direct innerHTML assignment with user data',
    pattern: /\.innerHTML\s*=\s*(req\.|user|input|\$\{|data)/gi,
    severity: 'high',
    category: 'xss',
    fix: 'Use textContent or sanitize HTML',
  },
  {
    id: 'XSS-002',
    name: 'dangerouslySetInnerHTML',
    description: 'React dangerouslySetInnerHTML usage',
    pattern: /dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html/gi,
    severity: 'high',
    category: 'xss',
    fix: 'Sanitize HTML with DOMPurify or avoid raw HTML',
  },
  {
    id: 'XSS-003',
    name: 'document.write',
    description: 'Use of document.write',
    pattern: /document\.write\s*\(/gi,
    severity: 'medium',
    category: 'xss',
    fix: 'Use DOM manipulation methods instead',
  },
];

// ============== SECURITY SCANNER ==============

export class SecurityScanner {
  private config: SecurityConfig;
  private rules: SecurityRule[];

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = {
      scanDependencies: config.scanDependencies ?? true,
      scanSecrets: config.scanSecrets ?? true,
      scanCode: config.scanCode ?? true,
      scanInfra: config.scanInfra ?? true,
      severity: config.severity || 'low',
      ignorePatterns: config.ignorePatterns || ['node_modules', '.git', 'dist', 'build'],
      customRules: config.customRules || [],
    };

    this.rules = [...OWASP_RULES, ...XSS_RULES, ...this.config.customRules];
  }

  // ============== MAIN SCAN ==============

  async scan(projectPath: string): Promise<ScanResult> {
    const start = Date.now();
    const vulnerabilities: Vulnerability[] = [];
    const dependencies: DependencyVuln[] = [];
    const secrets: SecretFinding[] = [];

    // Scan code
    if (this.config.scanCode) {
      const codeVulns = await this.scanCode(projectPath);
      vulnerabilities.push(...codeVulns);
    }

    // Scan dependencies
    if (this.config.scanDependencies) {
      const depVulns = await this.scanDependencies(projectPath);
      dependencies.push(...depVulns);
    }

    // Scan secrets
    if (this.config.scanSecrets) {
      const secretFindings = await this.scanSecrets(projectPath);
      secrets.push(...secretFindings);
    }

    // Calculate summary
    const summary = this.calculateSummary(vulnerabilities, dependencies, secrets);
    const score = this.calculateScore(summary);

    return {
      timestamp: Date.now(),
      duration: Date.now() - start,
      vulnerabilities,
      dependencies,
      secrets,
      summary,
      score,
      passed: score >= 70 && summary.critical === 0,
    };
  }

  // ============== CODE SCANNING ==============

  async scanCode(projectPath: string): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = [];
    
    try {
      const files = await this.getFiles(projectPath);
      
      for (const file of files) {
        const content = await this.readFile(file);
        const fileVulns = this.scanFileContent(content, file);
        vulnerabilities.push(...fileVulns);
      }
    } catch (error) {
      console.error('Code scan error:', error);
    }

    return vulnerabilities;
  }

  private scanFileContent(content: string, filePath: string): Vulnerability[] {
    const vulnerabilities: Vulnerability[] = [];
    const lines = content.split('\n');

    for (const rule of this.rules) {
      const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
      if (severityOrder[rule.severity] < severityOrder[this.config.severity]) {
        continue;
      }

      let match;
      const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
      
      while ((match = regex.exec(content)) !== null) {
        const lineNumber = this.getLineNumber(content, match.index);
        
        vulnerabilities.push({
          id: `${rule.id}-${Date.now()}`,
          rule: rule.id,
          category: rule.category,
          severity: rule.severity,
          title: rule.name,
          description: rule.description,
          file: filePath,
          line: lineNumber,
          code: lines[lineNumber - 1]?.trim(),
          fix: rule.fix,
          references: [`OWASP: ${rule.category}`],
        });
      }
    }

    return vulnerabilities;
  }

  // ============== DEPENDENCY SCANNING ==============

  async scanDependencies(projectPath: string): Promise<DependencyVuln[]> {
    const vulnerabilities: DependencyVuln[] = [];
    
    try {
      // Check package.json
      const packageJsonPath = `${projectPath}/package.json`;
      const packageJson = JSON.parse(await this.readFile(packageJsonPath));
      
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      // Check known vulnerable packages (simplified)
      const knownVulnerable: Record<string, { version: string; severity: string; advisory: string }> = {
        'lodash': { version: '<4.17.21', severity: 'high', advisory: 'Prototype Pollution' },
        'minimist': { version: '<1.2.6', severity: 'critical', advisory: 'Prototype Pollution' },
        'node-fetch': { version: '<2.6.7', severity: 'high', advisory: 'Information Exposure' },
        'axios': { version: '<0.21.2', severity: 'high', advisory: 'SSRF' },
        'express': { version: '<4.17.3', severity: 'medium', advisory: 'Open Redirect' },
      };

      for (const [pkg, version] of Object.entries(allDeps)) {
        if (knownVulnerable[pkg]) {
          // Simplified version check
          vulnerabilities.push({
            package: pkg,
            version: version as string,
            vulnerability: knownVulnerable[pkg].advisory,
            severity: knownVulnerable[pkg].severity as any,
            fixedIn: 'Latest',
            advisory: knownVulnerable[pkg].advisory,
          });
        }
      }
    } catch (error) {
      // No package.json or read error
    }

    return vulnerabilities;
  }

  // ============== SECRET SCANNING ==============

  async scanSecrets(projectPath: string): Promise<SecretFinding[]> {
    const secrets: SecretFinding[] = [];
    
    try {
      const files = await this.getFiles(projectPath);
      
      for (const file of files) {
        // Skip binary and large files
        if (this.shouldSkipFile(file)) continue;
        
        const content = await this.readFile(file);
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          for (const pattern of SECRET_PATTERNS) {
            const matches = line.matchAll(new RegExp(pattern.pattern.source, 'g'));
            
            for (const match of matches) {
              // Check entropy if specified
              if (pattern.entropy) {
                const entropy = this.calculateEntropy(match[0]);
                if (entropy < pattern.entropy) continue;
              }
              
              secrets.push({
                type: pattern.name,
                file,
                line: i + 1,
                match: this.maskSecret(match[0]),
                entropy: this.calculateEntropy(match[0]),
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Secret scan error:', error);
    }

    return secrets;
  }

  // ============== UTILITIES ==============

  private async getFiles(projectPath: string): Promise<string[]> {
    const fs = await import('fs/promises');
    const path = await import('path');
    const files: string[] = [];

    const scan = async (dir: string) => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        // Check ignore patterns
        if (this.config.ignorePatterns.some(p => fullPath.includes(p))) {
          continue;
        }
        
        if (entry.isDirectory()) {
          await scan(fullPath);
        } else if (this.isCodeFile(entry.name)) {
          files.push(fullPath);
        }
      }
    };

    await scan(projectPath);
    return files;
  }

  private async readFile(filePath: string): Promise<string> {
    const fs = await import('fs/promises');
    return await fs.readFile(filePath, 'utf-8');
  }

  private isCodeFile(filename: string): boolean {
    const codeExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.go', '.rs', '.java', '.rb', '.php', '.vue', '.svelte'];
    return codeExtensions.some(ext => filename.endsWith(ext));
  }

  private shouldSkipFile(filePath: string): boolean {
    const skipPatterns = ['.min.js', '.bundle.js', 'package-lock.json', 'yarn.lock'];
    return skipPatterns.some(p => filePath.includes(p));
  }

  private getLineNumber(content: string, index: number): number {
    return content.substring(0, index).split('\n').length;
  }

  private calculateEntropy(str: string): number {
    const freq: Record<string, number> = {};
    for (const char of str) {
      freq[char] = (freq[char] || 0) + 1;
    }
    
    let entropy = 0;
    const len = str.length;
    for (const count of Object.values(freq)) {
      const p = count / len;
      entropy -= p * Math.log2(p);
    }
    
    return entropy;
  }

  private maskSecret(secret: string): string {
    if (secret.length <= 8) return '*'.repeat(secret.length);
    return secret.substring(0, 4) + '*'.repeat(secret.length - 8) + secret.substring(secret.length - 4);
  }

  private calculateSummary(
    vulnerabilities: Vulnerability[],
    dependencies: DependencyVuln[],
    secrets: SecretFinding[]
  ): ScanResult['summary'] {
    const all = [
      ...vulnerabilities.map(v => v.severity),
      ...dependencies.map(d => d.severity),
      ...secrets.map(() => 'high' as const), // Secrets are always high
    ];

    return {
      critical: all.filter(s => s === 'critical').length,
      high: all.filter(s => s === 'high').length,
      medium: all.filter(s => s === 'medium').length,
      low: all.filter(s => s === 'low').length,
      total: all.length,
    };
  }

  private calculateScore(summary: ScanResult['summary']): number {
    // Start at 100, subtract for each finding
    let score = 100;
    score -= summary.critical * 25;
    score -= summary.high * 10;
    score -= summary.medium * 5;
    score -= summary.low * 2;
    return Math.max(0, Math.min(100, score));
  }

  // ============== QUICK CHECKS ==============

  async quickScan(code: string, language: string = 'javascript'): Promise<Vulnerability[]> {
    return this.scanFileContent(code, `inline.${language}`);
  }

  checkSecret(value: string): SecretFinding | null {
    for (const pattern of SECRET_PATTERNS) {
      if (pattern.pattern.test(value)) {
        return {
          type: pattern.name,
          file: 'inline',
          line: 1,
          match: this.maskSecret(value),
          entropy: this.calculateEntropy(value),
        };
      }
    }
    return null;
  }

  // ============== RULES ==============

  addRule(rule: SecurityRule): void {
    this.rules.push(rule);
  }

  removeRule(ruleId: string): void {
    this.rules = this.rules.filter(r => r.id !== ruleId);
  }

  getRules(): SecurityRule[] {
    return [...this.rules];
  }
}

// ============== FACTORY ==============

export function createSecurityScanner(config?: Partial<SecurityConfig>): SecurityScanner {
  return new SecurityScanner(config);
}

// ============== EXPORTS ==============

export { OWASP_RULES, XSS_RULES, SECRET_PATTERNS };
