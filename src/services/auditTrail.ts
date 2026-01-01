// ============== AUDIT TRAIL SERVICE ==============
// Complete audit logging for all AI and user actions

// ============== TYPES ==============
export interface AuditEntry {
  id: string;
  timestamp: number;
  type: AuditEntryType;
  actor: AuditActor;
  action: string;
  target: AuditTarget;
  details: AuditDetails;
  result: AuditResult;
  metadata: AuditMetadata;
}

export type AuditEntryType = 
  | 'file_change'
  | 'code_execution'
  | 'ai_action'
  | 'git_operation'
  | 'task_execution'
  | 'user_action'
  | 'system_event';

export interface AuditActor {
  type: 'user' | 'ai' | 'system';
  id: string;
  name: string;
}

export interface AuditTarget {
  type: 'file' | 'directory' | 'code' | 'task' | 'git' | 'system';
  path?: string;
  id?: string;
  name?: string;
}

export interface AuditDetails {
  description: string;
  diff?: FileDiff;
  prompt?: string;
  response?: string;
  command?: string;
  output?: string;
  changes?: ChangeRecord[];
}

export interface FileDiff {
  path: string;
  oldContent?: string;
  newContent?: string;
  additions: number;
  deletions: number;
  hunks?: DiffHunk[];
}

export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  content: string;
}

export interface ChangeRecord {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface AuditResult {
  success: boolean;
  error?: string;
  duration: number;
}

export interface AuditMetadata {
  sessionId: string;
  projectId?: string;
  tokensUsed?: number;
  cost?: number;
  model?: string;
  tags?: string[];
}

export interface AuditQuery {
  types?: AuditEntryType[];
  actorTypes?: ('user' | 'ai' | 'system')[];
  targetPath?: string;
  startTime?: number;
  endTime?: number;
  success?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface AuditSummary {
  totalEntries: number;
  byType: Record<AuditEntryType, number>;
  byActor: Record<string, number>;
  totalCost: number;
  totalTokens: number;
  successRate: number;
  timeRange: { start: number; end: number };
}

type AuditEventHandler = (entry: AuditEntry) => void;

// ============== AUDIT TRAIL SERVICE ==============
class AuditTrailService {
  private entries: AuditEntry[] = [];
  private handlers = new Set<AuditEventHandler>();
  private maxEntries = 10000;
  private sessionId: string;
  private currentUser: AuditActor;
  private storageKey = 'audit-trail';
  private persistEnabled = true;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.currentUser = {
      type: 'user',
      id: 'anonymous',
      name: 'Anonymous User',
    };
    this.loadFromStorage();
  }

  // Set current user
  setUser(id: string, name: string): void {
    this.currentUser = { type: 'user', id, name };
  }

  // Log file change
  logFileChange(
    action: 'create' | 'modify' | 'delete' | 'rename',
    path: string,
    details: {
      oldContent?: string;
      newContent?: string;
      oldPath?: string;
      actor?: AuditActor;
    } = {}
  ): AuditEntry {
    const diff = this.computeDiff(path, details.oldContent, details.newContent);

    return this.log({
      type: 'file_change',
      actor: details.actor || this.currentUser,
      action: `file.${action}`,
      target: { type: 'file', path },
      details: {
        description: `${action} file: ${path}`,
        diff,
        changes: details.oldPath ? [{
          field: 'path',
          oldValue: details.oldPath,
          newValue: path,
        }] : undefined,
      },
      result: { success: true, duration: 0 },
    });
  }

  // Log code execution
  logCodeExecution(
    code: string,
    language: string,
    result: {
      success: boolean;
      output: string;
      error?: string;
      duration: number;
    }
  ): AuditEntry {
    return this.log({
      type: 'code_execution',
      actor: this.currentUser,
      action: 'code.execute',
      target: { type: 'code', name: language },
      details: {
        description: `Execute ${language} code`,
        command: code.slice(0, 500),
        output: result.output.slice(0, 1000),
      },
      result: {
        success: result.success,
        error: result.error,
        duration: result.duration,
      },
    });
  }

  // Log AI action
  logAIAction(
    action: string,
    details: {
      prompt: string;
      response: string;
      model?: string;
      tokensUsed?: number;
      cost?: number;
      filesChanged?: string[];
      duration: number;
    }
  ): AuditEntry {
    return this.log({
      type: 'ai_action',
      actor: { type: 'ai', id: details.model || 'unknown', name: `AI (${details.model || 'unknown'})` },
      action: `ai.${action}`,
      target: { type: 'code' },
      details: {
        description: `AI ${action}`,
        prompt: details.prompt.slice(0, 500),
        response: details.response.slice(0, 1000),
        changes: details.filesChanged?.map(f => ({
          field: 'file',
          oldValue: null,
          newValue: f,
        })),
      },
      result: { success: true, duration: details.duration },
      metadata: {
        sessionId: this.sessionId,
        tokensUsed: details.tokensUsed,
        cost: details.cost,
        model: details.model,
      },
    });
  }

  // Log git operation
  logGitOperation(
    operation: string,
    details: {
      branch?: string;
      commit?: string;
      files?: string[];
      message?: string;
      success: boolean;
      error?: string;
      duration: number;
    }
  ): AuditEntry {
    return this.log({
      type: 'git_operation',
      actor: this.currentUser,
      action: `git.${operation}`,
      target: { type: 'git', name: details.branch },
      details: {
        description: `Git ${operation}${details.branch ? ` on ${details.branch}` : ''}`,
        output: details.message,
        changes: details.files?.map(f => ({
          field: 'file',
          oldValue: null,
          newValue: f,
        })),
      },
      result: {
        success: details.success,
        error: details.error,
        duration: details.duration,
      },
    });
  }

  // Log task execution
  logTaskExecution(
    taskId: string,
    action: string,
    details: {
      description: string;
      stepsCompleted?: number;
      totalSteps?: number;
      success: boolean;
      error?: string;
      duration: number;
      cost?: number;
      tokensUsed?: number;
    }
  ): AuditEntry {
    return this.log({
      type: 'task_execution',
      actor: { type: 'ai', id: 'orchestrator', name: 'Task Orchestrator' },
      action: `task.${action}`,
      target: { type: 'task', id: taskId },
      details: {
        description: details.description,
        changes: details.stepsCompleted !== undefined ? [{
          field: 'progress',
          oldValue: 0,
          newValue: `${details.stepsCompleted}/${details.totalSteps}`,
        }] : undefined,
      },
      result: {
        success: details.success,
        error: details.error,
        duration: details.duration,
      },
      metadata: {
        sessionId: this.sessionId,
        cost: details.cost,
        tokensUsed: details.tokensUsed,
      },
    });
  }

  // Log user action
  logUserAction(
    action: string,
    target: AuditTarget,
    details: {
      description: string;
      changes?: ChangeRecord[];
    }
  ): AuditEntry {
    return this.log({
      type: 'user_action',
      actor: this.currentUser,
      action: `user.${action}`,
      target,
      details: {
        description: details.description,
        changes: details.changes,
      },
      result: { success: true, duration: 0 },
    });
  }

  // Log system event
  logSystemEvent(
    event: string,
    details: {
      description: string;
      severity?: 'info' | 'warning' | 'error';
      data?: unknown;
    }
  ): AuditEntry {
    return this.log({
      type: 'system_event',
      actor: { type: 'system', id: 'system', name: 'System' },
      action: `system.${event}`,
      target: { type: 'system' },
      details: {
        description: details.description,
        output: details.data ? JSON.stringify(details.data) : undefined,
      },
      result: { success: true, duration: 0 },
      metadata: {
        sessionId: this.sessionId,
        tags: details.severity ? [details.severity] : undefined,
      },
    });
  }

  // Core log function
  private log(entry: Omit<AuditEntry, 'id' | 'timestamp' | 'metadata'> & { metadata?: Partial<AuditMetadata> }): AuditEntry {
    const fullEntry: AuditEntry = {
      id: this.generateId(),
      timestamp: Date.now(),
      ...entry,
      metadata: {
        sessionId: this.sessionId,
        ...entry.metadata,
      },
    };

    this.entries.unshift(fullEntry);
    this.trimEntries();
    this.notifyHandlers(fullEntry);
    this.saveToStorage();

    return fullEntry;
  }

  // Query entries
  query(query: AuditQuery = {}): AuditEntry[] {
    let results = [...this.entries];

    if (query.types?.length) {
      results = results.filter(e => query.types!.includes(e.type));
    }

    if (query.actorTypes?.length) {
      results = results.filter(e => query.actorTypes!.includes(e.actor.type));
    }

    if (query.targetPath) {
      results = results.filter(e => 
        e.target.path?.includes(query.targetPath!) ||
        e.details.diff?.path.includes(query.targetPath!)
      );
    }

    if (query.startTime) {
      results = results.filter(e => e.timestamp >= query.startTime!);
    }

    if (query.endTime) {
      results = results.filter(e => e.timestamp <= query.endTime!);
    }

    if (query.success !== undefined) {
      results = results.filter(e => e.result.success === query.success);
    }

    if (query.search) {
      const searchLower = query.search.toLowerCase();
      results = results.filter(e =>
        e.action.toLowerCase().includes(searchLower) ||
        e.details.description.toLowerCase().includes(searchLower) ||
        e.target.path?.toLowerCase().includes(searchLower) ||
        e.target.name?.toLowerCase().includes(searchLower)
      );
    }

    const offset = query.offset || 0;
    const limit = query.limit || 100;

    return results.slice(offset, offset + limit);
  }

  // Get entries for a specific file
  getFileHistory(path: string): AuditEntry[] {
    return this.query({
      targetPath: path,
      types: ['file_change', 'ai_action'],
    });
  }

  // Get AI action history
  getAIHistory(): AuditEntry[] {
    return this.query({ types: ['ai_action', 'task_execution'] });
  }

  // Get summary statistics
  getSummary(timeRange?: { start: number; end: number }): AuditSummary {
    let entries = this.entries;

    if (timeRange) {
      entries = entries.filter(e => 
        e.timestamp >= timeRange.start && e.timestamp <= timeRange.end
      );
    }

    const byType: Record<AuditEntryType, number> = {
      file_change: 0,
      code_execution: 0,
      ai_action: 0,
      git_operation: 0,
      task_execution: 0,
      user_action: 0,
      system_event: 0,
    };

    const byActor: Record<string, number> = {};
    let totalCost = 0;
    let totalTokens = 0;
    let successCount = 0;

    for (const entry of entries) {
      byType[entry.type]++;
      byActor[entry.actor.name] = (byActor[entry.actor.name] || 0) + 1;
      
      if (entry.metadata.cost) totalCost += entry.metadata.cost;
      if (entry.metadata.tokensUsed) totalTokens += entry.metadata.tokensUsed;
      if (entry.result.success) successCount++;
    }

    return {
      totalEntries: entries.length,
      byType,
      byActor,
      totalCost,
      totalTokens,
      successRate: entries.length > 0 ? successCount / entries.length : 1,
      timeRange: {
        start: entries.length > 0 ? entries[entries.length - 1].timestamp : Date.now(),
        end: entries.length > 0 ? entries[0].timestamp : Date.now(),
      },
    };
  }

  // Get recent entries
  getRecent(limit: number = 50): AuditEntry[] {
    return this.entries.slice(0, limit);
  }

  // Get all entries
  getAll(): AuditEntry[] {
    return [...this.entries];
  }

  // Clear all entries
  clear(): void {
    this.entries = [];
    this.saveToStorage();
  }

  // Export to JSON
  export(): string {
    return JSON.stringify({
      entries: this.entries,
      summary: this.getSummary(),
      exportedAt: Date.now(),
    }, null, 2);
  }

  // Subscribe to new entries
  onEntry(handler: AuditEventHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  // Compute diff between old and new content
  private computeDiff(path: string, oldContent?: string, newContent?: string): FileDiff | undefined {
    if (!oldContent && !newContent) return undefined;

    const oldLines = (oldContent || '').split('\n');
    const newLines = (newContent || '').split('\n');

    return {
      path,
      oldContent,
      newContent,
      additions: newContent ? newLines.length : 0,
      deletions: oldContent ? oldLines.length : 0,
    };
  }

  private notifyHandlers(entry: AuditEntry): void {
    this.handlers.forEach(handler => handler(entry));
  }

  private trimEntries(): void {
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(0, this.maxEntries);
    }
  }

  private loadFromStorage(): void {
    if (!this.persistEnabled) return;

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        // Only load entries from last 24 hours
        const cutoff = Date.now() - 24 * 60 * 60 * 1000;
        this.entries = (data.entries || []).filter((e: AuditEntry) => e.timestamp > cutoff);
      }
    } catch {
      // Storage not available
    }
  }

  private saveToStorage(): void {
    if (!this.persistEnabled) return;

    try {
      // Only save last 1000 entries to storage
      const toSave = this.entries.slice(0, 1000);
      localStorage.setItem(this.storageKey, JSON.stringify({ entries: toSave }));
    } catch {
      // Storage full or unavailable
    }
  }

  private generateId(): string {
    return `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============== SINGLETON ==============
export const auditTrailService = new AuditTrailService();

// ============== REACT HOOKS ==============
import { useState, useEffect, useCallback } from 'react';

export function useAuditTrail(query?: AuditQuery) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [summary, setSummary] = useState<AuditSummary | null>(null);

  useEffect(() => {
    setEntries(auditTrailService.query(query));
    setSummary(auditTrailService.getSummary());

    const unsubscribe = auditTrailService.onEntry(() => {
      setEntries(auditTrailService.query(query));
      setSummary(auditTrailService.getSummary());
    });

    return unsubscribe;
  }, [query]);

  const refresh = useCallback(() => {
    setEntries(auditTrailService.query(query));
    setSummary(auditTrailService.getSummary());
  }, [query]);

  return { entries, summary, refresh };
}

export function useFileAudit(path: string) {
  const [history, setHistory] = useState<AuditEntry[]>([]);

  useEffect(() => {
    setHistory(auditTrailService.getFileHistory(path));

    const unsubscribe = auditTrailService.onEntry((entry) => {
      if (entry.target.path === path || entry.details.diff?.path === path) {
        setHistory(auditTrailService.getFileHistory(path));
      }
    });

    return unsubscribe;
  }, [path]);

  return history;
}

export function useAuditSummary() {
  const [summary, setSummary] = useState<AuditSummary>(auditTrailService.getSummary());

  useEffect(() => {
    const unsubscribe = auditTrailService.onEntry(() => {
      setSummary(auditTrailService.getSummary());
    });

    return unsubscribe;
  }, []);

  return summary;
}

export default auditTrailService;
