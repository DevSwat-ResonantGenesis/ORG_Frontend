// ============== AUDIT TRAIL ==============
// Immutable audit log for compliance and debugging

export type AuditAction = 
  | 'agent.create' | 'agent.update' | 'agent.delete' | 'agent.start' | 'agent.stop'
  | 'workflow.create' | 'workflow.publish' | 'workflow.execute'
  | 'execution.start' | 'execution.complete' | 'execution.fail' | 'execution.cancel'
  | 'transaction.debit' | 'transaction.credit' | 'transaction.stake'
  | 'config.update' | 'permission.grant' | 'permission.revoke'
  | 'auth.login' | 'auth.logout' | 'auth.mfa'
  | 'api.call' | 'api.error';

export interface AuditEntry {
  id: string;
  timestamp: Date;
  action: AuditAction;
  actor: {
    userId: string;
    agentId?: string;
    ip?: string;
  };
  target: {
    type: 'agent' | 'workflow' | 'execution' | 'transaction' | 'config' | 'user';
    id: string;
    name?: string;
  };
  details: Record<string, unknown>;
  result: 'success' | 'failure' | 'pending';
  metadata?: {
    traceId?: string;
    sessionId?: string;
    requestId?: string;
  };
}

interface AuditConfig {
  enabled: boolean;
  maxEntries: number;
  persistToStorage: boolean;
  remoteEndpoint?: string;
}

class AuditTrail {
  private config: AuditConfig = {
    enabled: true,
    maxEntries: 10000,
    persistToStorage: true,
  };
  
  private entries: AuditEntry[] = [];
  private listeners: Set<(entry: AuditEntry) => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  configure(config: Partial<AuditConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private generateId(): string {
    return `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadFromStorage(): void {
    if (!this.config.persistToStorage) return;
    
    try {
      const stored = localStorage.getItem('agentos-audit');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.entries = parsed.map((e: AuditEntry) => ({
          ...e,
          timestamp: new Date(e.timestamp),
        }));
      }
    } catch (err) {
      console.error('Failed to load audit trail from storage:', err);
    }
  }

  private saveToStorage(): void {
    if (!this.config.persistToStorage) return;
    
    try {
      // Only persist last 1000 entries to storage
      const toStore = this.entries.slice(-1000);
      localStorage.setItem('agentos-audit', JSON.stringify(toStore));
    } catch (err) {
      console.error('Failed to save audit trail to storage:', err);
    }
  }

  log(
    action: AuditAction,
    actor: AuditEntry['actor'],
    target: AuditEntry['target'],
    details: Record<string, unknown> = {},
    result: AuditEntry['result'] = 'success',
    metadata?: AuditEntry['metadata']
  ): AuditEntry {
    if (!this.config.enabled) {
      return {} as AuditEntry;
    }

    const entry: AuditEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      action,
      actor,
      target,
      details,
      result,
      metadata,
    };

    this.entries.push(entry);
    
    // Trim if exceeds max
    if (this.entries.length > this.config.maxEntries) {
      this.entries = this.entries.slice(-this.config.maxEntries);
    }

    this.saveToStorage();
    this.notifyListeners(entry);
    this.sendRemote(entry);

    return entry;
  }

  private notifyListeners(entry: AuditEntry): void {
    this.listeners.forEach(listener => {
      try {
        listener(entry);
      } catch (err) {
        console.error('Audit listener error:', err);
      }
    });
  }

  private async sendRemote(entry: AuditEntry): Promise<void> {
    if (!this.config.remoteEndpoint) return;
    
    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    } catch (err) {
      console.error('Failed to send audit entry to remote:', err);
    }
  }

  subscribe(listener: (entry: AuditEntry) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  query(filter: {
    action?: AuditAction | AuditAction[];
    actorId?: string;
    targetType?: AuditEntry['target']['type'];
    targetId?: string;
    result?: AuditEntry['result'];
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
  }): AuditEntry[] {
    let results = [...this.entries];

    if (filter.action) {
      const actions = Array.isArray(filter.action) ? filter.action : [filter.action];
      results = results.filter(e => actions.includes(e.action));
    }
    if (filter.actorId) {
      results = results.filter(e => e.actor.userId === filter.actorId || e.actor.agentId === filter.actorId);
    }
    if (filter.targetType) {
      results = results.filter(e => e.target.type === filter.targetType);
    }
    if (filter.targetId) {
      results = results.filter(e => e.target.id === filter.targetId);
    }
    if (filter.result) {
      results = results.filter(e => e.result === filter.result);
    }
    if (filter.fromDate) {
      results = results.filter(e => e.timestamp >= filter.fromDate!);
    }
    if (filter.toDate) {
      results = results.filter(e => e.timestamp <= filter.toDate!);
    }
    if (filter.limit) {
      results = results.slice(-filter.limit);
    }

    return results;
  }

  getByTarget(targetType: AuditEntry['target']['type'], targetId: string): AuditEntry[] {
    return this.query({ targetType, targetId });
  }

  getByActor(actorId: string): AuditEntry[] {
    return this.query({ actorId });
  }

  getRecent(limit: number = 100): AuditEntry[] {
    return this.entries.slice(-limit);
  }

  export(): string {
    return JSON.stringify(this.entries, null, 2);
  }

  clear(): void {
    this.entries = [];
    this.saveToStorage();
  }
}

// Singleton instance
export const auditTrail = new AuditTrail();

export default auditTrail;
