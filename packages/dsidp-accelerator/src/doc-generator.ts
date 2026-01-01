/**
 * DSID-P Documentation Generator
 * 
 * Auto-generate documentation:
 * - README files
 * - API documentation
 * - JSDoc/TSDoc comments
 * - Storybook stories
 * - Changelog
 */

import { LLMEngine, createLLMEngine } from './llm-engine';

// ============== TYPES ==============

export interface DocConfig {
  outputDir: string;
  format: 'markdown' | 'html' | 'json';
  includeExamples: boolean;
  includeTypes: boolean;
  language: string;
}

export interface FunctionDoc {
  name: string;
  description: string;
  params: ParamDoc[];
  returns: ReturnDoc;
  examples: string[];
  tags: string[];
  deprecated?: string;
  since?: string;
}

export interface ParamDoc {
  name: string;
  type: string;
  description: string;
  optional: boolean;
  default?: string;
}

export interface ReturnDoc {
  type: string;
  description: string;
}

export interface ClassDoc {
  name: string;
  description: string;
  extends?: string;
  implements?: string[];
  constructor?: FunctionDoc;
  methods: FunctionDoc[];
  properties: PropertyDoc[];
  examples: string[];
}

export interface PropertyDoc {
  name: string;
  type: string;
  description: string;
  readonly: boolean;
  static: boolean;
  default?: string;
}

export interface ModuleDoc {
  name: string;
  description: string;
  exports: string[];
  classes: ClassDoc[];
  functions: FunctionDoc[];
  types: TypeDoc[];
  constants: ConstantDoc[];
}

export interface TypeDoc {
  name: string;
  description: string;
  definition: string;
  properties?: PropertyDoc[];
}

export interface ConstantDoc {
  name: string;
  type: string;
  value: string;
  description: string;
}

export interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  params: ParamDoc[];
  queryParams: ParamDoc[];
  body?: TypeDoc;
  response: TypeDoc;
  errors: Array<{ code: number; description: string }>;
  examples: Array<{ request: string; response: string }>;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    added: string[];
    changed: string[];
    deprecated: string[];
    removed: string[];
    fixed: string[];
    security: string[];
  };
}

// ============== CODE PARSER ==============

export class CodeParser {
  parseTypeScript(code: string): ModuleDoc {
    const module: ModuleDoc = {
      name: '',
      description: '',
      exports: [],
      classes: [],
      functions: [],
      types: [],
      constants: [],
    };

    // Parse exports
    const exportMatches = code.matchAll(/export\s+(const|function|class|type|interface)\s+(\w+)/g);
    for (const match of exportMatches) {
      module.exports.push(match[2]);
    }

    // Parse classes
    const classMatches = code.matchAll(/(?:export\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([\w,\s]+))?\s*\{/g);
    for (const match of classMatches) {
      module.classes.push({
        name: match[1],
        description: this.extractPrecedingComment(code, match.index || 0),
        extends: match[2],
        implements: match[3]?.split(',').map(s => s.trim()),
        constructor: undefined,
        methods: [],
        properties: [],
        examples: [],
      });
    }

    // Parse functions
    const funcMatches = code.matchAll(/(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)(?:\s*:\s*([^{]+))?\s*\{/g);
    for (const match of funcMatches) {
      module.functions.push({
        name: match[1],
        description: this.extractPrecedingComment(code, match.index || 0),
        params: this.parseParams(match[2]),
        returns: { type: match[3]?.trim() || 'void', description: '' },
        examples: [],
        tags: [],
      });
    }

    // Parse types/interfaces
    const typeMatches = code.matchAll(/(?:export\s+)?(?:type|interface)\s+(\w+)(?:<[^>]+>)?\s*=?\s*\{?/g);
    for (const match of typeMatches) {
      module.types.push({
        name: match[1],
        description: this.extractPrecedingComment(code, match.index || 0),
        definition: this.extractTypeDefinition(code, match.index || 0),
      });
    }

    // Parse constants
    const constMatches = code.matchAll(/(?:export\s+)?const\s+(\w+)(?:\s*:\s*([^=]+))?\s*=\s*([^;]+)/g);
    for (const match of constMatches) {
      if (!match[3].includes('function') && !match[3].includes('=>')) {
        module.constants.push({
          name: match[1],
          type: match[2]?.trim() || 'unknown',
          value: match[3].trim().substring(0, 100),
          description: this.extractPrecedingComment(code, match.index || 0),
        });
      }
    }

    return module;
  }

  private parseParams(paramsStr: string): ParamDoc[] {
    if (!paramsStr.trim()) return [];
    
    const params: ParamDoc[] = [];
    const parts = paramsStr.split(',');
    
    for (const part of parts) {
      const match = part.trim().match(/(\w+)(\?)?(?:\s*:\s*(.+))?(?:\s*=\s*(.+))?/);
      if (match) {
        params.push({
          name: match[1],
          type: match[3]?.trim() || 'any',
          description: '',
          optional: !!match[2] || !!match[4],
          default: match[4]?.trim(),
        });
      }
    }
    
    return params;
  }

  private extractPrecedingComment(code: string, index: number): string {
    const before = code.substring(Math.max(0, index - 500), index);
    const commentMatch = before.match(/\/\*\*[\s\S]*?\*\/\s*$/);
    if (commentMatch) {
      return commentMatch[0]
        .replace(/\/\*\*|\*\//g, '')
        .replace(/^\s*\*\s?/gm, '')
        .trim();
    }
    
    const lineComments = before.match(/(?:\/\/[^\n]*\n)+\s*$/);
    if (lineComments) {
      return lineComments[0]
        .replace(/\/\/\s?/g, '')
        .trim();
    }
    
    return '';
  }

  private extractTypeDefinition(code: string, index: number): string {
    const after = code.substring(index, index + 500);
    const match = after.match(/(?:type|interface)\s+\w+(?:<[^>]+>)?\s*=?\s*(\{[\s\S]*?\}|[^;{]+)/);
    return match ? match[1].trim() : '';
  }
}

// ============== README GENERATOR ==============

export class ReadmeGenerator {
  private llm: LLMEngine;

  constructor(llm?: LLMEngine) {
    this.llm = llm || createLLMEngine();
  }

  async generate(projectInfo: {
    name: string;
    description: string;
    features?: string[];
    installation?: string;
    usage?: string;
    api?: ModuleDoc;
    license?: string;
  }): Promise<string> {
    const prompt = `Generate a professional README.md for this project:

Name: ${projectInfo.name}
Description: ${projectInfo.description}
${projectInfo.features ? `Features:\n${projectInfo.features.map(f => `- ${f}`).join('\n')}` : ''}

Include these sections:
1. Title with badges (npm, license, build status)
2. Description
3. Features (if provided)
4. Installation
5. Quick Start
6. Usage Examples
7. API Reference (brief)
8. Configuration
9. Contributing
10. License

Make it professional, clear, and developer-friendly.`;

    return this.llm.chat_simple(prompt);
  }

  generateBadges(options: {
    npm?: string;
    license?: string;
    build?: string;
    coverage?: string;
  }): string {
    const badges: string[] = [];
    
    if (options.npm) {
      badges.push(`[![npm version](https://badge.fury.io/js/${options.npm}.svg)](https://badge.fury.io/js/${options.npm})`);
    }
    if (options.license) {
      badges.push(`[![License: ${options.license}](https://img.shields.io/badge/License-${options.license}-yellow.svg)](https://opensource.org/licenses/${options.license})`);
    }
    if (options.build) {
      badges.push(`[![Build Status](${options.build})](${options.build})`);
    }
    if (options.coverage) {
      badges.push(`[![Coverage](${options.coverage})](${options.coverage})`);
    }
    
    return badges.join(' ');
  }

  generateTableOfContents(headers: string[]): string {
    return `## Table of Contents\n\n${headers.map(h => `- [${h}](#${h.toLowerCase().replace(/\s+/g, '-')})`).join('\n')}`;
  }
}

// ============== API DOC GENERATOR ==============

export class APIDocGenerator {
  private llm: LLMEngine;

  constructor(llm?: LLMEngine) {
    this.llm = llm || createLLMEngine();
  }

  async generateFromCode(code: string): Promise<string> {
    const parser = new CodeParser();
    const module = parser.parseTypeScript(code);
    return this.generateModuleDoc(module);
  }

  generateModuleDoc(module: ModuleDoc): string {
    let doc = `# ${module.name || 'API Reference'}\n\n`;
    doc += `${module.description}\n\n`;

    // Types
    if (module.types.length > 0) {
      doc += `## Types\n\n`;
      for (const type of module.types) {
        doc += this.generateTypeDoc(type);
      }
    }

    // Classes
    if (module.classes.length > 0) {
      doc += `## Classes\n\n`;
      for (const cls of module.classes) {
        doc += this.generateClassDoc(cls);
      }
    }

    // Functions
    if (module.functions.length > 0) {
      doc += `## Functions\n\n`;
      for (const func of module.functions) {
        doc += this.generateFunctionDoc(func);
      }
    }

    // Constants
    if (module.constants.length > 0) {
      doc += `## Constants\n\n`;
      for (const constant of module.constants) {
        doc += `### \`${constant.name}\`\n\n`;
        doc += `Type: \`${constant.type}\`\n\n`;
        doc += `${constant.description}\n\n`;
      }
    }

    return doc;
  }

  generateClassDoc(cls: ClassDoc): string {
    let doc = `### ${cls.name}\n\n`;
    doc += `${cls.description}\n\n`;
    
    if (cls.extends) {
      doc += `**Extends:** \`${cls.extends}\`\n\n`;
    }
    
    if (cls.implements?.length) {
      doc += `**Implements:** ${cls.implements.map(i => `\`${i}\``).join(', ')}\n\n`;
    }

    // Properties
    if (cls.properties.length > 0) {
      doc += `#### Properties\n\n`;
      doc += `| Name | Type | Description |\n`;
      doc += `|------|------|-------------|\n`;
      for (const prop of cls.properties) {
        doc += `| \`${prop.name}\` | \`${prop.type}\` | ${prop.description} |\n`;
      }
      doc += '\n';
    }

    // Methods
    if (cls.methods.length > 0) {
      doc += `#### Methods\n\n`;
      for (const method of cls.methods) {
        doc += this.generateFunctionDoc(method, true);
      }
    }

    return doc;
  }

  generateFunctionDoc(func: FunctionDoc, isMethod: boolean = false): string {
    const prefix = isMethod ? '##### ' : '### ';
    let doc = `${prefix}\`${func.name}()\`\n\n`;
    doc += `${func.description}\n\n`;

    if (func.params.length > 0) {
      doc += `**Parameters:**\n\n`;
      doc += `| Name | Type | Required | Description |\n`;
      doc += `|------|------|----------|-------------|\n`;
      for (const param of func.params) {
        doc += `| \`${param.name}\` | \`${param.type}\` | ${param.optional ? 'No' : 'Yes'} | ${param.description} |\n`;
      }
      doc += '\n';
    }

    doc += `**Returns:** \`${func.returns.type}\``;
    if (func.returns.description) {
      doc += ` - ${func.returns.description}`;
    }
    doc += '\n\n';

    if (func.examples.length > 0) {
      doc += `**Example:**\n\n`;
      for (const example of func.examples) {
        doc += `\`\`\`typescript\n${example}\n\`\`\`\n\n`;
      }
    }

    return doc;
  }

  generateTypeDoc(type: TypeDoc): string {
    let doc = `### \`${type.name}\`\n\n`;
    doc += `${type.description}\n\n`;
    doc += `\`\`\`typescript\n${type.definition}\n\`\`\`\n\n`;
    return doc;
  }

  async generateEndpointDoc(endpoint: APIEndpoint): Promise<string> {
    let doc = `### ${endpoint.method} ${endpoint.path}\n\n`;
    doc += `${endpoint.description}\n\n`;

    if (endpoint.params.length > 0) {
      doc += `**Path Parameters:**\n\n`;
      doc += `| Name | Type | Description |\n`;
      doc += `|------|------|-------------|\n`;
      for (const param of endpoint.params) {
        doc += `| \`${param.name}\` | \`${param.type}\` | ${param.description} |\n`;
      }
      doc += '\n';
    }

    if (endpoint.queryParams.length > 0) {
      doc += `**Query Parameters:**\n\n`;
      doc += `| Name | Type | Required | Description |\n`;
      doc += `|------|------|----------|-------------|\n`;
      for (const param of endpoint.queryParams) {
        doc += `| \`${param.name}\` | \`${param.type}\` | ${param.optional ? 'No' : 'Yes'} | ${param.description} |\n`;
      }
      doc += '\n';
    }

    if (endpoint.body) {
      doc += `**Request Body:**\n\n`;
      doc += `\`\`\`typescript\n${endpoint.body.definition}\n\`\`\`\n\n`;
    }

    doc += `**Response:**\n\n`;
    doc += `\`\`\`typescript\n${endpoint.response.definition}\n\`\`\`\n\n`;

    if (endpoint.errors.length > 0) {
      doc += `**Errors:**\n\n`;
      doc += `| Code | Description |\n`;
      doc += `|------|-------------|\n`;
      for (const error of endpoint.errors) {
        doc += `| ${error.code} | ${error.description} |\n`;
      }
      doc += '\n';
    }

    if (endpoint.examples.length > 0) {
      doc += `**Examples:**\n\n`;
      for (const example of endpoint.examples) {
        doc += `Request:\n\`\`\`bash\n${example.request}\n\`\`\`\n\n`;
        doc += `Response:\n\`\`\`json\n${example.response}\n\`\`\`\n\n`;
      }
    }

    return doc;
  }
}

// ============== JSDOC GENERATOR ==============

export class JSDocGenerator {
  private llm: LLMEngine;

  constructor(llm?: LLMEngine) {
    this.llm = llm || createLLMEngine();
  }

  async generateForFunction(code: string): Promise<string> {
    const prompt = `Generate JSDoc comment for this function:

${code}

Return ONLY the JSDoc comment block (/** ... */) with:
- @description
- @param for each parameter
- @returns
- @example (if useful)
- @throws (if applicable)`;

    return this.llm.chat_simple(prompt);
  }

  async addDocsToFile(code: string): Promise<string> {
    const prompt = `Add JSDoc/TSDoc comments to all exported functions, classes, and types in this code:

${code.substring(0, 8000)}

Rules:
- Add /** */ style comments before each export
- Include @param, @returns, @example where appropriate
- Keep existing code unchanged
- Return the full file with comments added`;

    return this.llm.chat_simple(prompt);
  }

  generateFromFunction(func: FunctionDoc): string {
    let doc = '/**\n';
    doc += ` * ${func.description}\n`;
    
    for (const param of func.params) {
      doc += ` * @param {${param.type}} ${param.optional ? `[${param.name}]` : param.name} - ${param.description}\n`;
    }
    
    doc += ` * @returns {${func.returns.type}} ${func.returns.description}\n`;
    
    for (const example of func.examples) {
      doc += ` * @example\n * ${example.split('\n').join('\n * ')}\n`;
    }
    
    if (func.deprecated) {
      doc += ` * @deprecated ${func.deprecated}\n`;
    }
    
    doc += ' */';
    return doc;
  }
}

// ============== CHANGELOG GENERATOR ==============

export class ChangelogGenerator {
  private llm: LLMEngine;

  constructor(llm?: LLMEngine) {
    this.llm = llm || createLLMEngine();
  }

  async generateFromCommits(commits: Array<{ message: string; date: string }>): Promise<ChangelogEntry> {
    const changes: ChangelogEntry['changes'] = {
      added: [],
      changed: [],
      deprecated: [],
      removed: [],
      fixed: [],
      security: [],
    };

    for (const commit of commits) {
      const msg = commit.message.toLowerCase();
      
      if (msg.startsWith('feat') || msg.includes('add')) {
        changes.added.push(commit.message);
      } else if (msg.startsWith('fix') || msg.includes('bug')) {
        changes.fixed.push(commit.message);
      } else if (msg.startsWith('refactor') || msg.includes('change')) {
        changes.changed.push(commit.message);
      } else if (msg.includes('deprecate')) {
        changes.deprecated.push(commit.message);
      } else if (msg.includes('remove') || msg.includes('delete')) {
        changes.removed.push(commit.message);
      } else if (msg.includes('security') || msg.includes('vuln')) {
        changes.security.push(commit.message);
      }
    }

    return {
      version: 'Unreleased',
      date: new Date().toISOString().split('T')[0],
      changes,
    };
  }

  formatChangelog(entries: ChangelogEntry[]): string {
    let changelog = '# Changelog\n\n';
    changelog += 'All notable changes to this project will be documented in this file.\n\n';
    changelog += 'The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),\n';
    changelog += 'and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\n';

    for (const entry of entries) {
      changelog += `## [${entry.version}] - ${entry.date}\n\n`;
      
      if (entry.changes.added.length > 0) {
        changelog += '### Added\n\n';
        changelog += entry.changes.added.map(c => `- ${c}`).join('\n') + '\n\n';
      }
      if (entry.changes.changed.length > 0) {
        changelog += '### Changed\n\n';
        changelog += entry.changes.changed.map(c => `- ${c}`).join('\n') + '\n\n';
      }
      if (entry.changes.deprecated.length > 0) {
        changelog += '### Deprecated\n\n';
        changelog += entry.changes.deprecated.map(c => `- ${c}`).join('\n') + '\n\n';
      }
      if (entry.changes.removed.length > 0) {
        changelog += '### Removed\n\n';
        changelog += entry.changes.removed.map(c => `- ${c}`).join('\n') + '\n\n';
      }
      if (entry.changes.fixed.length > 0) {
        changelog += '### Fixed\n\n';
        changelog += entry.changes.fixed.map(c => `- ${c}`).join('\n') + '\n\n';
      }
      if (entry.changes.security.length > 0) {
        changelog += '### Security\n\n';
        changelog += entry.changes.security.map(c => `- ${c}`).join('\n') + '\n\n';
      }
    }

    return changelog;
  }
}

// ============== STORYBOOK GENERATOR ==============

export class StorybookGenerator {
  private llm: LLMEngine;

  constructor(llm?: LLMEngine) {
    this.llm = llm || createLLMEngine();
  }

  async generateStory(componentCode: string, componentName: string): Promise<string> {
    const prompt = `Generate a Storybook story for this React component:

Component: ${componentName}
Code:
${componentCode.substring(0, 3000)}

Generate a complete .stories.tsx file with:
- Default export with title and component
- Multiple stories showing different states
- Args/controls for props
- Play functions for interactions if needed

Use Storybook 7+ syntax.`;

    return this.llm.chat_simple(prompt);
  }

  generateBasicStory(componentName: string, props: ParamDoc[]): string {
    let story = `import type { Meta, StoryObj } from '@storybook/react';\n`;
    story += `import { ${componentName} } from './${componentName}';\n\n`;
    
    story += `const meta: Meta<typeof ${componentName}> = {\n`;
    story += `  title: 'Components/${componentName}',\n`;
    story += `  component: ${componentName},\n`;
    story += `  parameters: {\n`;
    story += `    layout: 'centered',\n`;
    story += `  },\n`;
    story += `  tags: ['autodocs'],\n`;
    
    if (props.length > 0) {
      story += `  argTypes: {\n`;
      for (const prop of props) {
        story += `    ${prop.name}: { control: '${this.getControlType(prop.type)}' },\n`;
      }
      story += `  },\n`;
    }
    
    story += `};\n\n`;
    story += `export default meta;\n`;
    story += `type Story = StoryObj<typeof meta>;\n\n`;
    
    story += `export const Default: Story = {\n`;
    story += `  args: {\n`;
    for (const prop of props) {
      story += `    ${prop.name}: ${this.getDefaultValue(prop)},\n`;
    }
    story += `  },\n`;
    story += `};\n`;

    return story;
  }

  private getControlType(type: string): string {
    if (type.includes('string')) return 'text';
    if (type.includes('number')) return 'number';
    if (type.includes('boolean')) return 'boolean';
    if (type.includes('|')) return 'select';
    return 'object';
  }

  private getDefaultValue(prop: ParamDoc): string {
    if (prop.default) return prop.default;
    if (prop.type.includes('string')) return "''";
    if (prop.type.includes('number')) return '0';
    if (prop.type.includes('boolean')) return 'false';
    return 'undefined';
  }
}

// ============== DOCUMENTATION GENERATOR ==============

export class DocumentationGenerator {
  private config: DocConfig;
  private codeParser: CodeParser;
  private readmeGenerator: ReadmeGenerator;
  private apiDocGenerator: APIDocGenerator;
  private jsDocGenerator: JSDocGenerator;
  private changelogGenerator: ChangelogGenerator;
  private storybookGenerator: StorybookGenerator;

  constructor(config: Partial<DocConfig> = {}) {
    this.config = {
      outputDir: config.outputDir || './docs',
      format: config.format || 'markdown',
      includeExamples: config.includeExamples ?? true,
      includeTypes: config.includeTypes ?? true,
      language: config.language || 'typescript',
    };

    const llm = createLLMEngine();
    this.codeParser = new CodeParser();
    this.readmeGenerator = new ReadmeGenerator(llm);
    this.apiDocGenerator = new APIDocGenerator(llm);
    this.jsDocGenerator = new JSDocGenerator(llm);
    this.changelogGenerator = new ChangelogGenerator(llm);
    this.storybookGenerator = new StorybookGenerator(llm);
  }

  async generateProjectDocs(projectPath: string): Promise<{
    readme: string;
    api: string;
    changelog: string;
  }> {
    // Read package.json
    const fs = await import('fs/promises');
    const path = await import('path');
    
    let packageJson: any = {};
    try {
      packageJson = JSON.parse(
        await fs.readFile(path.join(projectPath, 'package.json'), 'utf-8')
      );
    } catch {}

    // Generate README
    const readme = await this.readmeGenerator.generate({
      name: packageJson.name || 'Project',
      description: packageJson.description || '',
      license: packageJson.license,
    });

    // Generate API docs from source files
    const srcPath = path.join(projectPath, 'src');
    let apiDoc = '# API Reference\n\n';
    
    try {
      const files = await fs.readdir(srcPath);
      for (const file of files) {
        if (file.endsWith('.ts') || file.endsWith('.tsx')) {
          const code = await fs.readFile(path.join(srcPath, file), 'utf-8');
          const module = this.codeParser.parseTypeScript(code);
          module.name = file.replace(/\.(ts|tsx)$/, '');
          apiDoc += this.apiDocGenerator.generateModuleDoc(module);
        }
      }
    } catch {}

    // Generate changelog (simplified)
    const changelog = this.changelogGenerator.formatChangelog([{
      version: packageJson.version || '0.0.0',
      date: new Date().toISOString().split('T')[0],
      changes: {
        added: ['Initial release'],
        changed: [],
        deprecated: [],
        removed: [],
        fixed: [],
        security: [],
      },
    }]);

    return { readme, api: apiDoc, changelog };
  }

  async addJSDocToFile(filePath: string): Promise<string> {
    const fs = await import('fs/promises');
    const code = await fs.readFile(filePath, 'utf-8');
    return this.jsDocGenerator.addDocsToFile(code);
  }

  async generateStorybook(componentPath: string): Promise<string> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const code = await fs.readFile(componentPath, 'utf-8');
    const componentName = path.basename(componentPath).replace(/\.(tsx|jsx)$/, '');
    
    return this.storybookGenerator.generateStory(code, componentName);
  }

  parseCode(code: string): ModuleDoc {
    return this.codeParser.parseTypeScript(code);
  }
}

// ============== FACTORY ==============

export function createDocumentationGenerator(config?: Partial<DocConfig>): DocumentationGenerator {
  return new DocumentationGenerator(config);
}
