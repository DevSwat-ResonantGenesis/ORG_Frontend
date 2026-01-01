/**
 * DSID-P Git Workflows
 * 
 * Automated Git operations:
 * - Branch management
 * - PR creation and review
 * - Commit automation
 * - Merge strategies
 * - Code review automation
 */

import { LLMEngine, createLLMEngine } from './llm-engine';

// ============== TYPES ==============

export interface GitConfig {
  remote: string;
  defaultBranch: string;
  branchPrefix: string;
  commitPrefix: string;
  autoMerge: boolean;
  requireReview: boolean;
  protectedBranches: string[];
}

export interface Branch {
  name: string;
  type: BranchType;
  base: string;
  createdAt: number;
  lastCommit?: string;
  ahead: number;
  behind: number;
}

export type BranchType = 'feature' | 'bugfix' | 'hotfix' | 'release' | 'chore' | 'refactor';

export interface Commit {
  hash: string;
  message: string;
  author: string;
  timestamp: number;
  files: string[];
  additions: number;
  deletions: number;
}

export interface PullRequest {
  id: string;
  number: number;
  title: string;
  description: string;
  sourceBranch: string;
  targetBranch: string;
  status: PRStatus;
  author: string;
  reviewers: string[];
  labels: string[];
  createdAt: number;
  updatedAt: number;
  mergedAt?: number;
  closedAt?: number;
  commits: number;
  additions: number;
  deletions: number;
  files: string[];
  checks: PRCheck[];
  comments: PRComment[];
}

export type PRStatus = 'open' | 'merged' | 'closed' | 'draft';

export interface PRCheck {
  name: string;
  status: 'pending' | 'success' | 'failure' | 'skipped';
  description?: string;
}

export interface PRComment {
  id: string;
  author: string;
  body: string;
  createdAt: number;
  file?: string;
  line?: number;
  resolved: boolean;
}

export interface CodeReview {
  prId: string;
  reviewer: string;
  status: 'pending' | 'approved' | 'changes_requested' | 'commented';
  comments: ReviewComment[];
  submittedAt?: number;
}

export interface ReviewComment {
  file: string;
  line: number;
  body: string;
  type: 'issue' | 'suggestion' | 'praise' | 'question';
  severity?: 'critical' | 'major' | 'minor' | 'nitpick';
}

export interface MergeResult {
  success: boolean;
  merged: boolean;
  sha?: string;
  error?: string;
  conflicts?: string[];
}

export interface ConflictResolution {
  file: string;
  ours: string;
  theirs: string;
  resolved: string;
  strategy: 'ours' | 'theirs' | 'manual' | 'ai';
}

// ============== GIT OPERATIONS ==============

export class GitOperations {
  private workDir: string;

  constructor(workDir: string = '.') {
    this.workDir = workDir;
  }

  async exec(command: string): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      const { stdout, stderr } = await execAsync(`git ${command}`, { cwd: this.workDir });
      return { stdout: stdout.trim(), stderr: stderr.trim(), exitCode: 0 };
    } catch (error: any) {
      return {
        stdout: error.stdout?.trim() || '',
        stderr: error.stderr?.trim() || error.message,
        exitCode: error.code || 1,
      };
    }
  }

  async getCurrentBranch(): Promise<string> {
    const result = await this.exec('rev-parse --abbrev-ref HEAD');
    return result.stdout;
  }

  async getBranches(): Promise<string[]> {
    const result = await this.exec('branch -a');
    return result.stdout
      .split('\n')
      .map(b => b.trim().replace('* ', ''))
      .filter(b => b && !b.startsWith('remotes/'));
  }

  async createBranch(name: string, base?: string): Promise<boolean> {
    const baseRef = base || await this.getCurrentBranch();
    const result = await this.exec(`checkout -b ${name} ${baseRef}`);
    return result.exitCode === 0;
  }

  async switchBranch(name: string): Promise<boolean> {
    const result = await this.exec(`checkout ${name}`);
    return result.exitCode === 0;
  }

  async deleteBranch(name: string, force: boolean = false): Promise<boolean> {
    const flag = force ? '-D' : '-d';
    const result = await this.exec(`branch ${flag} ${name}`);
    return result.exitCode === 0;
  }

  async getStatus(): Promise<{ staged: string[]; unstaged: string[]; untracked: string[] }> {
    const result = await this.exec('status --porcelain');
    const lines = result.stdout.split('\n').filter(Boolean);
    
    const staged: string[] = [];
    const unstaged: string[] = [];
    const untracked: string[] = [];

    for (const line of lines) {
      const status = line.substring(0, 2);
      const file = line.substring(3);
      
      if (status.startsWith('?')) {
        untracked.push(file);
      } else if (status[0] !== ' ') {
        staged.push(file);
      } else {
        unstaged.push(file);
      }
    }

    return { staged, unstaged, untracked };
  }

  async add(files: string | string[]): Promise<boolean> {
    const fileList = Array.isArray(files) ? files.join(' ') : files;
    const result = await this.exec(`add ${fileList}`);
    return result.exitCode === 0;
  }

  async commit(message: string): Promise<string | null> {
    const result = await this.exec(`commit -m "${message.replace(/"/g, '\\"')}"`);
    if (result.exitCode === 0) {
      const hashResult = await this.exec('rev-parse HEAD');
      return hashResult.stdout;
    }
    return null;
  }

  async push(remote: string = 'origin', branch?: string): Promise<boolean> {
    const branchName = branch || await this.getCurrentBranch();
    const result = await this.exec(`push ${remote} ${branchName}`);
    return result.exitCode === 0;
  }

  async pull(remote: string = 'origin', branch?: string): Promise<boolean> {
    const branchName = branch || await this.getCurrentBranch();
    const result = await this.exec(`pull ${remote} ${branchName}`);
    return result.exitCode === 0;
  }

  async merge(branch: string, noFf: boolean = false): Promise<MergeResult> {
    const flags = noFf ? '--no-ff' : '';
    const result = await this.exec(`merge ${flags} ${branch}`);
    
    if (result.exitCode === 0) {
      const sha = await this.exec('rev-parse HEAD');
      return { success: true, merged: true, sha: sha.stdout };
    }

    // Check for conflicts
    const status = await this.getStatus();
    const conflicts = status.unstaged.filter(f => f.includes('UU'));
    
    return {
      success: false,
      merged: false,
      error: result.stderr,
      conflicts,
    };
  }

  async rebase(branch: string): Promise<boolean> {
    const result = await this.exec(`rebase ${branch}`);
    return result.exitCode === 0;
  }

  async stash(message?: string): Promise<boolean> {
    const cmd = message ? `stash push -m "${message}"` : 'stash';
    const result = await this.exec(cmd);
    return result.exitCode === 0;
  }

  async stashPop(): Promise<boolean> {
    const result = await this.exec('stash pop');
    return result.exitCode === 0;
  }

  async getLog(count: number = 10): Promise<Commit[]> {
    const result = await this.exec(`log -${count} --pretty=format:"%H|%s|%an|%at" --shortstat`);
    const lines = result.stdout.split('\n');
    const commits: Commit[] = [];
    
    let currentCommit: Partial<Commit> | null = null;
    
    for (const line of lines) {
      if (line.includes('|')) {
        if (currentCommit) {
          commits.push(currentCommit as Commit);
        }
        const [hash, message, author, timestamp] = line.split('|');
        currentCommit = {
          hash,
          message,
          author,
          timestamp: parseInt(timestamp) * 1000,
          files: [],
          additions: 0,
          deletions: 0,
        };
      } else if (line.includes('insertion') || line.includes('deletion')) {
        if (currentCommit) {
          const additions = line.match(/(\d+) insertion/);
          const deletions = line.match(/(\d+) deletion/);
          currentCommit.additions = additions ? parseInt(additions[1]) : 0;
          currentCommit.deletions = deletions ? parseInt(deletions[1]) : 0;
        }
      }
    }
    
    if (currentCommit) {
      commits.push(currentCommit as Commit);
    }
    
    return commits;
  }

  async getDiff(base?: string, head?: string): Promise<string> {
    const cmd = base && head ? `diff ${base}...${head}` : 'diff';
    const result = await this.exec(cmd);
    return result.stdout;
  }

  async getConflicts(): Promise<string[]> {
    const result = await this.exec('diff --name-only --diff-filter=U');
    return result.stdout.split('\n').filter(Boolean);
  }

  async abortMerge(): Promise<boolean> {
    const result = await this.exec('merge --abort');
    return result.exitCode === 0;
  }

  async reset(mode: 'soft' | 'mixed' | 'hard' = 'mixed', ref: string = 'HEAD~1'): Promise<boolean> {
    const result = await this.exec(`reset --${mode} ${ref}`);
    return result.exitCode === 0;
  }

  async cherryPick(commit: string): Promise<boolean> {
    const result = await this.exec(`cherry-pick ${commit}`);
    return result.exitCode === 0;
  }

  async tag(name: string, message?: string): Promise<boolean> {
    const cmd = message ? `tag -a ${name} -m "${message}"` : `tag ${name}`;
    const result = await this.exec(cmd);
    return result.exitCode === 0;
  }
}

// ============== BRANCH MANAGER ==============

export class BranchManager {
  private git: GitOperations;
  private config: GitConfig;

  constructor(workDir: string, config: Partial<GitConfig> = {}) {
    this.git = new GitOperations(workDir);
    this.config = {
      remote: config.remote || 'origin',
      defaultBranch: config.defaultBranch || 'main',
      branchPrefix: config.branchPrefix || '',
      commitPrefix: config.commitPrefix || '',
      autoMerge: config.autoMerge ?? false,
      requireReview: config.requireReview ?? true,
      protectedBranches: config.protectedBranches || ['main', 'master', 'develop'],
    };
  }

  async createFeatureBranch(name: string, type: BranchType = 'feature'): Promise<Branch> {
    const branchName = `${type}/${this.config.branchPrefix}${name}`;
    const base = this.config.defaultBranch;
    
    await this.git.switchBranch(base);
    await this.git.pull();
    await this.git.createBranch(branchName, base);
    
    return {
      name: branchName,
      type,
      base,
      createdAt: Date.now(),
      ahead: 0,
      behind: 0,
    };
  }

  async listBranches(): Promise<Branch[]> {
    const branches = await this.git.getBranches();
    return branches.map(name => ({
      name,
      type: this.detectBranchType(name),
      base: this.config.defaultBranch,
      createdAt: Date.now(),
      ahead: 0,
      behind: 0,
    }));
  }

  async deleteMergedBranches(): Promise<string[]> {
    const branches = await this.git.getBranches();
    const deleted: string[] = [];
    
    for (const branch of branches) {
      if (this.config.protectedBranches.includes(branch)) continue;
      
      // Check if merged (simplified)
      const current = await this.git.getCurrentBranch();
      if (branch !== current) {
        const success = await this.git.deleteBranch(branch);
        if (success) deleted.push(branch);
      }
    }
    
    return deleted;
  }

  private detectBranchType(name: string): BranchType {
    if (name.startsWith('feature/')) return 'feature';
    if (name.startsWith('bugfix/') || name.startsWith('fix/')) return 'bugfix';
    if (name.startsWith('hotfix/')) return 'hotfix';
    if (name.startsWith('release/')) return 'release';
    if (name.startsWith('chore/')) return 'chore';
    if (name.startsWith('refactor/')) return 'refactor';
    return 'feature';
  }
}

// ============== COMMIT GENERATOR ==============

export class CommitGenerator {
  private llm: LLMEngine;
  private git: GitOperations;
  private prefix: string;

  constructor(workDir: string, llm?: LLMEngine, prefix: string = '') {
    this.git = new GitOperations(workDir);
    this.llm = llm || createLLMEngine();
    this.prefix = prefix;
  }

  async generateMessage(diff?: string): Promise<string> {
    const changes = diff || await this.git.getDiff();
    
    if (!changes) {
      return 'chore: minor updates';
    }

    const prompt = `Generate a conventional commit message for these changes:

${changes.substring(0, 3000)}

Rules:
- Use conventional commits format: type(scope): description
- Types: feat, fix, docs, style, refactor, perf, test, chore
- Keep under 72 characters
- Be specific about what changed
- Don't include file names in the message

Return ONLY the commit message, nothing else.`;

    const message = await this.llm.chat_simple(prompt);
    return this.prefix + message.trim().replace(/^["']|["']$/g, '');
  }

  async commitWithMessage(files: string | string[] = '.'): Promise<string | null> {
    await this.git.add(files);
    const message = await this.generateMessage();
    return this.git.commit(message);
  }

  generateConventionalMessage(type: string, scope: string, description: string, breaking: boolean = false): string {
    const breakingMark = breaking ? '!' : '';
    const scopePart = scope ? `(${scope})` : '';
    return `${type}${scopePart}${breakingMark}: ${description}`;
  }
}

// ============== CODE REVIEWER ==============

export class CodeReviewer {
  private llm: LLMEngine;

  constructor(llm?: LLMEngine) {
    this.llm = llm || createLLMEngine();
  }

  async reviewDiff(diff: string): Promise<ReviewComment[]> {
    const prompt = `Review this code diff and provide feedback:

${diff.substring(0, 5000)}

For each issue found, provide JSON:
[
  {
    "file": "path/to/file",
    "line": 42,
    "body": "Description of issue or suggestion",
    "type": "issue|suggestion|praise|question",
    "severity": "critical|major|minor|nitpick"
  }
]

Focus on:
- Bugs and logic errors
- Security issues
- Performance problems
- Code style and best practices
- Missing error handling

Return ONLY the JSON array.`;

    const response = await this.llm.chat_simple(prompt);
    
    try {
      return JSON.parse(this.extractJson(response));
    } catch {
      return [];
    }
  }

  async reviewFile(content: string, filename: string): Promise<ReviewComment[]> {
    const prompt = `Review this code file and provide feedback:

File: ${filename}
\`\`\`
${content.substring(0, 5000)}
\`\`\`

Return JSON array of review comments with file, line, body, type, severity.`;

    const response = await this.llm.chat_simple(prompt);
    
    try {
      const comments = JSON.parse(this.extractJson(response));
      return comments.map((c: any) => ({ ...c, file: filename }));
    } catch {
      return [];
    }
  }

  async generateSummary(diff: string): Promise<string> {
    const prompt = `Summarize these code changes for a PR description:

${diff.substring(0, 4000)}

Include:
- What was changed
- Why it was changed (infer from context)
- Any notable implementation details
- Testing considerations

Keep it concise but informative.`;

    return this.llm.chat_simple(prompt);
  }

  async suggestReviewers(files: string[], teamMembers: string[]): Promise<string[]> {
    // Simple file-based reviewer suggestion
    // Would use CODEOWNERS or git blame in real implementation
    return teamMembers.slice(0, 2);
  }

  private extractJson(content: string): string {
    const match = content.match(/\[[\s\S]*\]/);
    return match ? match[0] : '[]';
  }
}

// ============== PR MANAGER ==============

export class PRManager {
  private git: GitOperations;
  private reviewer: CodeReviewer;
  private platform: 'github' | 'gitlab' | 'bitbucket';
  private token: string;

  constructor(
    workDir: string,
    platform: 'github' | 'gitlab' | 'bitbucket' = 'github',
    token: string = ''
  ) {
    this.git = new GitOperations(workDir);
    this.reviewer = new CodeReviewer();
    this.platform = platform;
    this.token = token;
  }

  async createPR(options: {
    title: string;
    description?: string;
    sourceBranch?: string;
    targetBranch?: string;
    draft?: boolean;
    reviewers?: string[];
    labels?: string[];
  }): Promise<PullRequest | null> {
    const source = options.sourceBranch || await this.git.getCurrentBranch();
    const target = options.targetBranch || 'main';
    
    // Generate description if not provided
    let description = options.description;
    if (!description) {
      const diff = await this.git.getDiff(target, source);
      description = await this.reviewer.generateSummary(diff);
    }

    // Would call GitHub/GitLab/Bitbucket API here
    const pr: PullRequest = {
      id: `pr-${Date.now()}`,
      number: Math.floor(Math.random() * 1000),
      title: options.title,
      description,
      sourceBranch: source,
      targetBranch: target,
      status: options.draft ? 'draft' : 'open',
      author: 'user',
      reviewers: options.reviewers || [],
      labels: options.labels || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      commits: 1,
      additions: 0,
      deletions: 0,
      files: [],
      checks: [],
      comments: [],
    };

    return pr;
  }

  async autoReview(prId: string): Promise<CodeReview> {
    const diff = await this.git.getDiff();
    const comments = await this.reviewer.reviewDiff(diff);
    
    const hasIssues = comments.some(c => 
      c.type === 'issue' && (c.severity === 'critical' || c.severity === 'major')
    );

    return {
      prId,
      reviewer: 'dsidp-bot',
      status: hasIssues ? 'changes_requested' : 'approved',
      comments,
      submittedAt: Date.now(),
    };
  }

  async mergePR(prId: string, strategy: 'merge' | 'squash' | 'rebase' = 'squash'): Promise<MergeResult> {
    // Would call API to merge
    return {
      success: true,
      merged: true,
      sha: 'abc123',
    };
  }

  async closePR(prId: string): Promise<boolean> {
    // Would call API to close
    return true;
  }

  async addComment(prId: string, body: string, file?: string, line?: number): Promise<PRComment> {
    return {
      id: `comment-${Date.now()}`,
      author: 'user',
      body,
      createdAt: Date.now(),
      file,
      line,
      resolved: false,
    };
  }

  async requestReviewers(prId: string, reviewers: string[]): Promise<boolean> {
    // Would call API to request reviewers
    return true;
  }
}

// ============== CONFLICT RESOLVER ==============

export class ConflictResolver {
  private llm: LLMEngine;
  private git: GitOperations;

  constructor(workDir: string, llm?: LLMEngine) {
    this.git = new GitOperations(workDir);
    this.llm = llm || createLLMEngine();
  }

  async resolveConflicts(): Promise<ConflictResolution[]> {
    const conflicts = await this.git.getConflicts();
    const resolutions: ConflictResolution[] = [];

    for (const file of conflicts) {
      const resolution = await this.resolveFile(file);
      if (resolution) {
        resolutions.push(resolution);
      }
    }

    return resolutions;
  }

  private async resolveFile(filePath: string): Promise<ConflictResolution | null> {
    try {
      const fs = await import('fs/promises');
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Parse conflict markers
      const conflicts = this.parseConflicts(content);
      if (conflicts.length === 0) return null;

      // Resolve each conflict
      let resolved = content;
      for (const conflict of conflicts) {
        const resolution = await this.resolveConflict(conflict.ours, conflict.theirs, filePath);
        resolved = resolved.replace(conflict.full, resolution);
      }

      return {
        file: filePath,
        ours: conflicts[0]?.ours || '',
        theirs: conflicts[0]?.theirs || '',
        resolved,
        strategy: 'ai',
      };
    } catch {
      return null;
    }
  }

  private parseConflicts(content: string): Array<{ full: string; ours: string; theirs: string }> {
    const conflictPattern = /<<<<<<< [\w/]+\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> [\w/]+/g;
    const conflicts: Array<{ full: string; ours: string; theirs: string }> = [];
    
    let match;
    while ((match = conflictPattern.exec(content)) !== null) {
      conflicts.push({
        full: match[0],
        ours: match[1].trim(),
        theirs: match[2].trim(),
      });
    }
    
    return conflicts;
  }

  private async resolveConflict(ours: string, theirs: string, file: string): Promise<string> {
    const prompt = `Resolve this git merge conflict intelligently:

File: ${file}

Our version (current branch):
\`\`\`
${ours}
\`\`\`

Their version (incoming branch):
\`\`\`
${theirs}
\`\`\`

Analyze both versions and produce the best merged result that:
- Preserves all necessary functionality
- Doesn't break the code
- Combines changes where appropriate

Return ONLY the resolved code, no explanations.`;

    const response = await this.llm.chat_simple(prompt);
    return response.replace(/```[\w]*\n?/g, '').trim();
  }
}

// ============== GIT WORKFLOWS ==============

export class GitWorkflows {
  private git: GitOperations;
  private branchManager: BranchManager;
  private commitGenerator: CommitGenerator;
  private prManager: PRManager;
  private conflictResolver: ConflictResolver;
  private config: GitConfig;

  constructor(workDir: string, config: Partial<GitConfig> = {}) {
    this.config = {
      remote: config.remote || 'origin',
      defaultBranch: config.defaultBranch || 'main',
      branchPrefix: config.branchPrefix || '',
      commitPrefix: config.commitPrefix || '',
      autoMerge: config.autoMerge ?? false,
      requireReview: config.requireReview ?? true,
      protectedBranches: config.protectedBranches || ['main', 'master', 'develop'],
    };

    this.git = new GitOperations(workDir);
    this.branchManager = new BranchManager(workDir, config);
    this.commitGenerator = new CommitGenerator(workDir, undefined, this.config.commitPrefix);
    this.prManager = new PRManager(workDir);
    this.conflictResolver = new ConflictResolver(workDir);
  }

  async startFeature(name: string): Promise<Branch> {
    return this.branchManager.createFeatureBranch(name, 'feature');
  }

  async startBugfix(name: string): Promise<Branch> {
    return this.branchManager.createFeatureBranch(name, 'bugfix');
  }

  async startHotfix(name: string): Promise<Branch> {
    return this.branchManager.createFeatureBranch(name, 'hotfix');
  }

  async commitChanges(files: string | string[] = '.'): Promise<string | null> {
    return this.commitGenerator.commitWithMessage(files);
  }

  async pushAndCreatePR(title: string): Promise<PullRequest | null> {
    const branch = await this.git.getCurrentBranch();
    await this.git.push(this.config.remote, branch);
    
    return this.prManager.createPR({
      title,
      sourceBranch: branch,
      targetBranch: this.config.defaultBranch,
    });
  }

  async finishFeature(merge: boolean = true): Promise<MergeResult | null> {
    const branch = await this.git.getCurrentBranch();
    
    if (merge) {
      await this.git.switchBranch(this.config.defaultBranch);
      await this.git.pull();
      const result = await this.git.merge(branch, true);
      
      if (result.success) {
        await this.git.deleteBranch(branch);
        await this.git.push();
      }
      
      return result;
    }
    
    return null;
  }

  async syncWithMain(): Promise<boolean> {
    const branch = await this.git.getCurrentBranch();
    await this.git.stash('Auto-stash before sync');
    
    await this.git.switchBranch(this.config.defaultBranch);
    await this.git.pull();
    await this.git.switchBranch(branch);
    
    const success = await this.git.rebase(this.config.defaultBranch);
    await this.git.stashPop();
    
    return success;
  }

  async resolveConflictsAuto(): Promise<ConflictResolution[]> {
    return this.conflictResolver.resolveConflicts();
  }

  async cleanupBranches(): Promise<string[]> {
    return this.branchManager.deleteMergedBranches();
  }

  async getWorkflowStatus(): Promise<{
    branch: string;
    status: { staged: string[]; unstaged: string[]; untracked: string[] };
    commits: Commit[];
  }> {
    const branch = await this.git.getCurrentBranch();
    const status = await this.git.getStatus();
    const commits = await this.git.getLog(5);
    
    return { branch, status, commits };
  }
}

// ============== FACTORY ==============

export function createGitWorkflows(workDir: string, config?: Partial<GitConfig>): GitWorkflows {
  return new GitWorkflows(workDir, config);
}

