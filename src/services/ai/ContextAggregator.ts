// ============== CONTEXT AGGREGATOR SERVICE ==============
// Aggregates all relevant context for AI decision making

import {
  ExecutionContext,
  FileInfo,
  DirectoryTree,
  PackageInfo,
  GitStatus,
  Change,
  ConversationMessage,
  ErrorInfo,
  CodebaseAnalysis,
  ArchitectureInfo,
  TechStackInfo,
  PatternInfo,
  Position,
  IContextAggregator,
} from './types';

export class ContextAggregator implements IContextAggregator {
  private context: ExecutionContext;
  private projectRoot: string;
  private conversationHistory: ConversationMessage[] = [];
  private recentChanges: Change[] = [];
  private errorHistory: ErrorInfo[] = [];

  constructor(projectRoot: string = '') {
    this.projectRoot = projectRoot;
    this.context = this.createEmptyContext();
  }

  private createEmptyContext(): ExecutionContext {
    return {
      activeFile: null,
      openFiles: [],
      selectedText: null,
      cursorPosition: null,
      projectStructure: { name: '', path: '', type: 'directory', children: [] },
      projectRoot: this.projectRoot,
      dependencies: null,
      gitStatus: null,
      recentChanges: [],
      conversationHistory: [],
      errorHistory: [],
      codebaseAnalysis: {
        architecture: { type: 'unknown', layers: [], entryPoints: [] },
        patterns: [],
        techStack: { framework: 'unknown', language: 'unknown', buildTool: 'unknown', testFramework: 'unknown' },
      },
    };
  }

  async buildContext(): Promise<ExecutionContext> {
    const [
      activeFile,
      openFiles,
      projectStructure,
      dependencies,
      gitStatus,
      codebaseAnalysis,
    ] = await Promise.all([
      this.getActiveFileInfo(),
      this.getOpenFilesInfo(),
      this.scanProjectStructure(),
      this.analyzeDependencies(),
      this.getGitStatus(),
      this.analyzeCodebase(),
    ]);

    this.context = {
      activeFile,
      openFiles,
      selectedText: this.getSelectedText(),
      cursorPosition: this.getCursorPosition(),
      projectStructure,
      projectRoot: this.projectRoot,
      dependencies,
      gitStatus,
      recentChanges: this.recentChanges.slice(0, 20),
      conversationHistory: this.conversationHistory.slice(-50),
      errorHistory: this.errorHistory.slice(0, 10),
      codebaseAnalysis,
    };

    return this.context;
  }

  updateContext(changes: Partial<ExecutionContext>): void {
    this.context = { ...this.context, ...changes };
  }

  getContext(): ExecutionContext {
    return this.context;
  }

  // ============== FILE METHODS ==============

  async getActiveFileInfo(): Promise<FileInfo | null> {
    try {
      // Get from IDE state - this would be injected from the IDE component
      const ideState = (window as any).__IDE_STATE__;
      if (!ideState?.activeFile) return null;

      const file = ideState.activeFile;
      return {
        path: file.path || '',
        name: file.name || this.extractFileName(file.path),
        extension: this.extractExtension(file.path),
        content: file.content || '',
        language: this.detectLanguage(file.path),
        lastModified: new Date(file.lastModified || Date.now()),
        size: file.content?.length || 0,
      };
    } catch (error) {
      console.error('Failed to get active file info:', error);
      return null;
    }
  }

  async getOpenFilesInfo(): Promise<FileInfo[]> {
    try {
      const ideState = (window as any).__IDE_STATE__;
      if (!ideState?.openFiles) return [];

      return ideState.openFiles.map((file: any) => ({
        path: file.path || '',
        name: file.name || this.extractFileName(file.path),
        extension: this.extractExtension(file.path),
        content: file.content || '',
        language: this.detectLanguage(file.path),
        lastModified: new Date(file.lastModified || Date.now()),
        size: file.content?.length || 0,
      }));
    } catch (error) {
      console.error('Failed to get open files info:', error);
      return [];
    }
  }

  getSelectedText(): string | null {
    try {
      const ideState = (window as any).__IDE_STATE__;
      return ideState?.selectedText || null;
    } catch {
      return null;
    }
  }

  getCursorPosition(): Position | null {
    try {
      const ideState = (window as any).__IDE_STATE__;
      if (!ideState?.cursorPosition) return null;
      return {
        line: ideState.cursorPosition.line || 0,
        column: ideState.cursorPosition.column || 0,
      };
    } catch {
      return null;
    }
  }

  // ============== PROJECT STRUCTURE ==============

  async scanProjectStructure(): Promise<DirectoryTree> {
    try {
      const response = await fetch('/api/v1/code/structure', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
      });

      if (!response.ok) {
        return this.getDefaultProjectStructure();
      }

      const structure = await response.json();
      return this.normalizeStructure(structure);
    } catch (error) {
      console.error('Failed to scan project structure:', error);
      return this.getDefaultProjectStructure();
    }
  }

  private getDefaultProjectStructure(): DirectoryTree {
    return {
      name: 'project',
      path: this.projectRoot,
      type: 'directory',
      children: [],
    };
  }

  private normalizeStructure(structure: any): DirectoryTree {
    return {
      name: structure.name || 'root',
      path: structure.path || '',
      type: structure.type || 'directory',
      children: Array.isArray(structure.children)
        ? structure.children.map((c: any) => this.normalizeStructure(c))
        : undefined,
    };
  }

  // ============== DEPENDENCIES ==============

  async analyzeDependencies(): Promise<PackageInfo | null> {
    try {
      const response = await fetch('/api/v1/code/dependencies', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
      });

      if (!response.ok) {
        return this.parseLocalPackageJson();
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to analyze dependencies:', error);
      return this.parseLocalPackageJson();
    }
  }

  private parseLocalPackageJson(): PackageInfo | null {
    try {
      const ideState = (window as any).__IDE_STATE__;
      const packageJson = ideState?.files?.find((f: any) => f.name === 'package.json');
      
      if (!packageJson?.content) return null;

      const parsed = JSON.parse(packageJson.content);
      return {
        name: parsed.name || 'unknown',
        version: parsed.version || '0.0.0',
        dependencies: parsed.dependencies || {},
        devDependencies: parsed.devDependencies || {},
        scripts: parsed.scripts || {},
      };
    } catch {
      return null;
    }
  }

  // ============== GIT STATUS ==============

  async getGitStatus(): Promise<GitStatus | null> {
    try {
      const response = await fetch('/api/v1/git/status', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
      });

      if (!response.ok) return null;

      const status = await response.json();
      return {
        branch: status.branch || 'unknown',
        ahead: status.ahead || 0,
        behind: status.behind || 0,
        staged: status.staged || [],
        modified: status.modified || [],
        untracked: status.untracked || [],
        hasConflicts: status.hasConflicts || false,
      };
    } catch (error) {
      console.error('Failed to get git status:', error);
      return null;
    }
  }

  // ============== CODEBASE ANALYSIS ==============

  async analyzeCodebase(): Promise<CodebaseAnalysis> {
    const [architecture, patterns, techStack] = await Promise.all([
      this.detectArchitecture(),
      this.detectPatterns(),
      this.detectTechStack(),
    ]);

    return { architecture, patterns, techStack };
  }

  private async detectArchitecture(): Promise<ArchitectureInfo> {
    try {
      const structure = this.context.projectStructure;
      const entryPoints: string[] = [];
      const layers: string[] = [];

      // Detect common architectural patterns
      const hasPages = this.findInStructure(structure, 'pages');
      const hasComponents = this.findInStructure(structure, 'components');
      const hasServices = this.findInStructure(structure, 'services');
      const hasControllers = this.findInStructure(structure, 'controllers');
      const hasModels = this.findInStructure(structure, 'models');
      const hasRoutes = this.findInStructure(structure, 'routes');

      if (hasPages) layers.push('pages');
      if (hasComponents) layers.push('components');
      if (hasServices) layers.push('services');
      if (hasControllers) layers.push('controllers');
      if (hasModels) layers.push('models');
      if (hasRoutes) layers.push('routes');

      // Detect entry points
      const indexFiles = ['index.tsx', 'index.ts', 'main.tsx', 'main.ts', 'App.tsx', 'app.tsx'];
      for (const entry of indexFiles) {
        if (this.findInStructure(structure, entry)) {
          entryPoints.push(entry);
        }
      }

      // Determine architecture type
      let type = 'unknown';
      if (hasPages && hasComponents) type = 'modular-frontend';
      else if (hasControllers && hasModels) type = 'mvc';
      else if (hasServices && hasRoutes) type = 'service-oriented';
      else if (layers.length > 0) type = 'layered';

      return { type, layers, entryPoints };
    } catch {
      return { type: 'unknown', layers: [], entryPoints: [] };
    }
  }

  private findInStructure(tree: DirectoryTree, name: string): boolean {
    if (tree.name.toLowerCase() === name.toLowerCase()) return true;
    if (tree.children) {
      return tree.children.some(child => this.findInStructure(child, name));
    }
    return false;
  }

  private async detectPatterns(): Promise<PatternInfo[]> {
    const patterns: PatternInfo[] = [];
    const structure = this.context.projectStructure;

    // Detect common patterns
    if (this.findInStructure(structure, 'hooks')) {
      patterns.push({
        name: 'Custom Hooks',
        description: 'React custom hooks pattern',
        files: ['hooks/'],
      });
    }

    if (this.findInStructure(structure, 'context')) {
      patterns.push({
        name: 'React Context',
        description: 'Context API for state management',
        files: ['context/'],
      });
    }

    if (this.findInStructure(structure, 'stores')) {
      patterns.push({
        name: 'Store Pattern',
        description: 'Centralized state stores',
        files: ['stores/'],
      });
    }

    if (this.findInStructure(structure, 'utils') || this.findInStructure(structure, 'helpers')) {
      patterns.push({
        name: 'Utility Functions',
        description: 'Shared utility functions',
        files: ['utils/', 'helpers/'],
      });
    }

    return patterns;
  }

  private async detectTechStack(): Promise<TechStackInfo> {
    const deps = this.context.dependencies;
    
    const techStack: TechStackInfo = {
      framework: 'unknown',
      language: 'unknown',
      buildTool: 'unknown',
      testFramework: 'unknown',
    };

    if (!deps) return techStack;

    const allDeps = { ...deps.dependencies, ...deps.devDependencies };

    // Detect framework
    if (allDeps['next']) techStack.framework = 'Next.js';
    else if (allDeps['react']) techStack.framework = 'React';
    else if (allDeps['vue']) techStack.framework = 'Vue';
    else if (allDeps['@angular/core']) techStack.framework = 'Angular';
    else if (allDeps['svelte']) techStack.framework = 'Svelte';
    else if (allDeps['express']) techStack.framework = 'Express';
    else if (allDeps['fastify']) techStack.framework = 'Fastify';

    // Detect language
    if (allDeps['typescript']) techStack.language = 'TypeScript';
    else techStack.language = 'JavaScript';

    // Detect build tool
    if (allDeps['vite']) techStack.buildTool = 'Vite';
    else if (allDeps['webpack']) techStack.buildTool = 'Webpack';
    else if (allDeps['esbuild']) techStack.buildTool = 'esbuild';
    else if (allDeps['rollup']) techStack.buildTool = 'Rollup';

    // Detect test framework
    if (allDeps['jest']) techStack.testFramework = 'Jest';
    else if (allDeps['vitest']) techStack.testFramework = 'Vitest';
    else if (allDeps['mocha']) techStack.testFramework = 'Mocha';
    else if (allDeps['@testing-library/react']) techStack.testFramework = 'React Testing Library';

    // Detect state management
    if (allDeps['zustand']) techStack.stateManagement = 'Zustand';
    else if (allDeps['redux'] || allDeps['@reduxjs/toolkit']) techStack.stateManagement = 'Redux';
    else if (allDeps['mobx']) techStack.stateManagement = 'MobX';
    else if (allDeps['recoil']) techStack.stateManagement = 'Recoil';

    // Detect styling
    if (allDeps['tailwindcss']) techStack.styling = 'Tailwind CSS';
    else if (allDeps['styled-components']) techStack.styling = 'Styled Components';
    else if (allDeps['@emotion/react']) techStack.styling = 'Emotion';
    else if (allDeps['sass']) techStack.styling = 'Sass';

    return techStack;
  }

  // ============== HISTORY TRACKING ==============

  addConversationMessage(role: 'user' | 'assistant' | 'system', content: string): void {
    this.conversationHistory.push({
      role,
      content,
      timestamp: new Date(),
    });

    // Keep only last 100 messages
    if (this.conversationHistory.length > 100) {
      this.conversationHistory = this.conversationHistory.slice(-100);
    }
  }

  addChange(change: Omit<Change, 'id' | 'timestamp'>): void {
    this.recentChanges.unshift({
      ...change,
      id: `change-${Date.now()}`,
      timestamp: new Date(),
    });

    // Keep only last 50 changes
    if (this.recentChanges.length > 50) {
      this.recentChanges = this.recentChanges.slice(0, 50);
    }
  }

  addError(error: Omit<ErrorInfo, 'timestamp'>): void {
    this.errorHistory.unshift({
      ...error,
      timestamp: new Date(),
    });

    // Keep only last 20 errors
    if (this.errorHistory.length > 20) {
      this.errorHistory = this.errorHistory.slice(0, 20);
    }
  }

  // ============== UTILITY METHODS ==============

  private extractFileName(path: string): string {
    return path.split('/').pop() || path;
  }

  private extractExtension(path: string): string {
    const parts = path.split('.');
    return parts.length > 1 ? parts.pop() || '' : '';
  }

  private detectLanguage(path: string): string {
    const ext = this.extractExtension(path).toLowerCase();
    const languageMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescriptreact',
      'js': 'javascript',
      'jsx': 'javascriptreact',
      'py': 'python',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'java': 'java',
      'kt': 'kotlin',
      'swift': 'swift',
      'c': 'c',
      'cpp': 'cpp',
      'h': 'c',
      'hpp': 'cpp',
      'css': 'css',
      'scss': 'scss',
      'less': 'less',
      'html': 'html',
      'json': 'json',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'sql': 'sql',
      'sh': 'shell',
      'bash': 'shell',
    };
    return languageMap[ext] || 'plaintext';
  }
}

export default ContextAggregator;
