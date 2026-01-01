// ============== GIT SERVICE ==============
// Git version control operations and repository management

// ============== TYPES ==============
export interface GitStatus {
  branch: string;
  ahead: number;
  behind: number;
  staged: FileStatus[];
  unstaged: FileStatus[];
  untracked: string[];
  conflicts: string[];
}

export interface FileStatus {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed' | 'copied';
  oldPath?: string;
}

export interface GitCommit {
  hash: string;
  shortHash: string;
  message: string;
  author: string;
  email: string;
  date: Date;
  parents: string[];
}

export interface GitBranch {
  name: string;
  current: boolean;
  remote?: string;
  upstream?: string;
  ahead?: number;
  behind?: number;
}

export interface GitRemote {
  name: string;
  fetchUrl: string;
  pushUrl: string;
}

export interface GitDiff {
  file: string;
  additions: number;
  deletions: number;
  hunks: DiffHunk[];
}

export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
}

export interface DiffLine {
  type: 'context' | 'add' | 'delete';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export interface GitStash {
  index: number;
  message: string;
  branch: string;
  date: Date;
}

// ============== GIT SERVICE ==============
class GitService {
  private repoPath: string = '';
  private statusCache: GitStatus | null = null;
  private cacheTime = 0;
  private cacheTTL = 5000;

  // Set repository path
  setRepo(path: string): void {
    this.repoPath = path;
    this.statusCache = null;
  }

  // Get repository status
  async getStatus(force = false): Promise<GitStatus> {
    if (!force && this.statusCache && Date.now() - this.cacheTime < this.cacheTTL) {
      return this.statusCache;
    }

    const response = await this.request('/git/status');
    this.statusCache = response;
    this.cacheTime = Date.now();
    return response;
  }

  // Stage files
  async stage(files: string[]): Promise<void> {
    await this.request('/git/stage', { files });
    this.invalidateCache();
  }

  // Stage all changes
  async stageAll(): Promise<void> {
    await this.request('/git/stage-all');
    this.invalidateCache();
  }

  // Unstage files
  async unstage(files: string[]): Promise<void> {
    await this.request('/git/unstage', { files });
    this.invalidateCache();
  }

  // Discard changes
  async discard(files: string[]): Promise<void> {
    await this.request('/git/discard', { files });
    this.invalidateCache();
  }

  // Commit changes
  async commit(message: string, options?: { amend?: boolean; signoff?: boolean }): Promise<GitCommit> {
    const result = await this.request('/git/commit', { message, ...options });
    this.invalidateCache();
    return result;
  }

  // Push to remote
  async push(remote = 'origin', branch?: string, options?: { force?: boolean; setUpstream?: boolean }): Promise<void> {
    await this.request('/git/push', { remote, branch, ...options });
  }

  // Pull from remote
  async pull(remote = 'origin', branch?: string, options?: { rebase?: boolean }): Promise<void> {
    await this.request('/git/pull', { remote, branch, ...options });
    this.invalidateCache();
  }

  // Fetch from remote
  async fetch(remote?: string, options?: { all?: boolean; prune?: boolean }): Promise<void> {
    await this.request('/git/fetch', { remote, ...options });
  }

  // Get commit log
  async log(options?: { limit?: number; branch?: string; file?: string; author?: string }): Promise<GitCommit[]> {
    return this.request('/git/log', options);
  }

  // Get commit details
  async getCommit(hash: string): Promise<GitCommit & { diff: GitDiff[] }> {
    return this.request(`/git/commit/${hash}`);
  }

  // Get branches
  async getBranches(options?: { all?: boolean; remote?: boolean }): Promise<GitBranch[]> {
    return this.request('/git/branches', options);
  }

  // Create branch
  async createBranch(name: string, startPoint?: string): Promise<void> {
    await this.request('/git/branch/create', { name, startPoint });
  }

  // Delete branch
  async deleteBranch(name: string, force = false): Promise<void> {
    await this.request('/git/branch/delete', { name, force });
  }

  // Checkout branch
  async checkout(ref: string, options?: { create?: boolean; force?: boolean }): Promise<void> {
    await this.request('/git/checkout', { ref, ...options });
    this.invalidateCache();
  }

  // Merge branch
  async merge(branch: string, options?: { noFf?: boolean; squash?: boolean }): Promise<void> {
    await this.request('/git/merge', { branch, ...options });
    this.invalidateCache();
  }

  // Rebase
  async rebase(upstream: string, options?: { interactive?: boolean; onto?: string }): Promise<void> {
    await this.request('/git/rebase', { upstream, ...options });
    this.invalidateCache();
  }

  // Get diff
  async diff(options?: { staged?: boolean; file?: string; commit?: string }): Promise<GitDiff[]> {
    return this.request('/git/diff', options);
  }

  // Get file diff
  async fileDiff(file: string, options?: { staged?: boolean }): Promise<GitDiff> {
    return this.request('/git/diff/file', { file, ...options });
  }

  // Get remotes
  async getRemotes(): Promise<GitRemote[]> {
    return this.request('/git/remotes');
  }

  // Add remote
  async addRemote(name: string, url: string): Promise<void> {
    await this.request('/git/remote/add', { name, url });
  }

  // Remove remote
  async removeRemote(name: string): Promise<void> {
    await this.request('/git/remote/remove', { name });
  }

  // Stash changes
  async stash(message?: string): Promise<void> {
    await this.request('/git/stash', { message });
    this.invalidateCache();
  }

  // List stashes
  async stashList(): Promise<GitStash[]> {
    return this.request('/git/stash/list');
  }

  // Apply stash
  async stashApply(index = 0, options?: { drop?: boolean }): Promise<void> {
    await this.request('/git/stash/apply', { index, ...options });
    this.invalidateCache();
  }

  // Drop stash
  async stashDrop(index = 0): Promise<void> {
    await this.request('/git/stash/drop', { index });
  }

  // Reset
  async reset(mode: 'soft' | 'mixed' | 'hard', ref = 'HEAD'): Promise<void> {
    await this.request('/git/reset', { mode, ref });
    this.invalidateCache();
  }

  // Revert commit
  async revert(commit: string): Promise<void> {
    await this.request('/git/revert', { commit });
    this.invalidateCache();
  }

  // Cherry-pick
  async cherryPick(commit: string): Promise<void> {
    await this.request('/git/cherry-pick', { commit });
    this.invalidateCache();
  }

  // Get tags
  async getTags(): Promise<string[]> {
    return this.request('/git/tags');
  }

  // Create tag
  async createTag(name: string, options?: { message?: string; commit?: string }): Promise<void> {
    await this.request('/git/tag/create', { name, ...options });
  }

  // Delete tag
  async deleteTag(name: string): Promise<void> {
    await this.request('/git/tag/delete', { name });
  }

  // Blame file
  async blame(file: string): Promise<Array<{ commit: string; author: string; line: number; content: string }>> {
    return this.request('/git/blame', { file });
  }

  // Search commits
  async searchCommits(query: string): Promise<GitCommit[]> {
    return this.request('/git/search', { query });
  }

  // Clone repository
  async clone(url: string, path: string, options?: { branch?: string; depth?: number }): Promise<void> {
    await this.request('/git/clone', { url, path, ...options });
  }

  // Initialize repository
  async init(path: string): Promise<void> {
    await this.request('/git/init', { path });
  }

  private async request(endpoint: string, body?: unknown): Promise<any> {
    const response = await fetch(`http://localhost:8080/api${endpoint}`, {
      method: body ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify({ ...(body as object), repoPath: this.repoPath }) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Git operation failed' }));
      throw new Error(error.message || 'Git operation failed');
    }

    return response.json();
  }

  private invalidateCache(): void {
    this.statusCache = null;
  }
}

// ============== SINGLETON ==============
export const gitService = new GitService();

// ============== REACT HOOKS ==============
import { useState, useEffect, useCallback } from 'react';

export function useGitStatus(repoPath?: string) {
  const [status, setStatus] = useState<GitStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (repoPath) gitService.setRepo(repoPath);
      const result = await gitService.getStatus(true);
      setStatus(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get status'));
    } finally {
      setIsLoading(false);
    }
  }, [repoPath]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { status, isLoading, error, refresh };
}

export function useGitBranches(repoPath?: string) {
  const [branches, setBranches] = useState<GitBranch[]>([]);
  const [currentBranch, setCurrentBranch] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      if (repoPath) gitService.setRepo(repoPath);
      const result = await gitService.getBranches({ all: true });
      setBranches(result);
      const current = result.find(b => b.current);
      if (current) setCurrentBranch(current.name);
    } finally {
      setIsLoading(false);
    }
  }, [repoPath]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const checkout = useCallback(async (branch: string) => {
    await gitService.checkout(branch);
    await refresh();
  }, [refresh]);

  const create = useCallback(async (name: string, startPoint?: string) => {
    await gitService.createBranch(name, startPoint);
    await refresh();
  }, [refresh]);

  const deleteBranch = useCallback(async (name: string, force?: boolean) => {
    await gitService.deleteBranch(name, force);
    await refresh();
  }, [refresh]);

  return { branches, currentBranch, isLoading, refresh, checkout, create, deleteBranch };
}

export function useGitLog(options?: { limit?: number; branch?: string }) {
  const [commits, setCommits] = useState<GitCommit[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await gitService.log(options);
      setCommits(result);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { commits, isLoading, refresh };
}

export function useGitDiff(file?: string, staged = false) {
  const [diff, setDiff] = useState<GitDiff | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!file) {
      setDiff(null);
      return;
    }

    setIsLoading(true);
    gitService.fileDiff(file, { staged })
      .then(setDiff)
      .catch(() => setDiff(null))
      .finally(() => setIsLoading(false));
  }, [file, staged]);

  return { diff, isLoading };
}

export function useGitActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async <T>(action: () => Promise<T>): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    try {
      return await action();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Git operation failed'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    stage: (files: string[]) => execute(() => gitService.stage(files)),
    stageAll: () => execute(() => gitService.stageAll()),
    unstage: (files: string[]) => execute(() => gitService.unstage(files)),
    discard: (files: string[]) => execute(() => gitService.discard(files)),
    commit: (message: string, options?: { amend?: boolean }) => execute(() => gitService.commit(message, options)),
    push: (remote?: string, branch?: string) => execute(() => gitService.push(remote, branch)),
    pull: (remote?: string, branch?: string) => execute(() => gitService.pull(remote, branch)),
    fetch: (remote?: string) => execute(() => gitService.fetch(remote)),
    stash: (message?: string) => execute(() => gitService.stash(message)),
    stashApply: (index?: number) => execute(() => gitService.stashApply(index)),
  };
}

export default gitService;
