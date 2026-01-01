import * as vscode from 'vscode';
import { ResonantClient } from '../client';

export class AuditTrailProvider implements vscode.TreeDataProvider<AuditItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<AuditItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  private entries: AuditItem[] = [];

  constructor(private client: ResonantClient) {
    this.loadEntries();
  }

  refresh(): void {
    this.loadEntries();
    this._onDidChangeTreeData.fire(undefined);
  }

  private async loadEntries(): Promise<void> {
    try {
      const entries = await this.client.getAuditTrail({ limit: 50 });
      this.entries = entries.map(entry => new AuditItem(entry));
    } catch {
      this.entries = [];
    }
  }

  getTreeItem(element: AuditItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: AuditItem): AuditItem[] {
    if (!element) {
      return this.entries;
    }
    return [];
  }
}

interface AuditEntry {
  id: string;
  type: string;
  action: string;
  timestamp: number;
  actor: { type: string; name: string };
  details: { description: string };
  result: { success: boolean };
}

class AuditItem extends vscode.TreeItem {
  constructor(public readonly entry: AuditEntry) {
    super(entry.details.description, vscode.TreeItemCollapsibleState.None);

    this.description = this.formatTime(entry.timestamp);
    this.tooltip = `${entry.action}\n${entry.details.description}\nBy: ${entry.actor.name}`;
    this.contextValue = 'auditEntry';

    // Set icon based on type and result
    if (!entry.result.success) {
      this.iconPath = new vscode.ThemeIcon('error', new vscode.ThemeColor('testing.iconFailed'));
    } else {
      switch (entry.type) {
        case 'ai_action':
          this.iconPath = new vscode.ThemeIcon('hubot');
          break;
        case 'file_change':
          this.iconPath = new vscode.ThemeIcon('file');
          break;
        case 'code_execution':
          this.iconPath = new vscode.ThemeIcon('play');
          break;
        case 'git_operation':
          this.iconPath = new vscode.ThemeIcon('git-commit');
          break;
        case 'task_execution':
          this.iconPath = new vscode.ThemeIcon('tasklist');
          break;
        default:
          this.iconPath = new vscode.ThemeIcon('circle-filled');
      }
    }
  }

  private formatTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    
    return new Date(timestamp).toLocaleDateString();
  }
}
