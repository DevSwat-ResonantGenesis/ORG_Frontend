import * as vscode from 'vscode';
import { ResonantClient, Task } from '../client';

export class TaskTreeProvider implements vscode.TreeDataProvider<TaskItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<TaskItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private client: ResonantClient) {}

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: TaskItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TaskItem): TaskItem[] {
    if (!element) {
      const tasks = this.client.getAllTasks();
      return tasks.map(task => new TaskItem(task));
    }
    return [];
  }
}

class TaskItem extends vscode.TreeItem {
  constructor(public readonly task: Task) {
    super(task.description, vscode.TreeItemCollapsibleState.None);

    this.description = task.status;
    this.tooltip = `${task.description}\nStatus: ${task.status}`;
    this.contextValue = 'task';

    // Set icon based on status
    switch (task.status) {
      case 'completed':
        this.iconPath = new vscode.ThemeIcon('check', new vscode.ThemeColor('testing.iconPassed'));
        break;
      case 'failed':
        this.iconPath = new vscode.ThemeIcon('error', new vscode.ThemeColor('testing.iconFailed'));
        break;
      case 'executing':
        this.iconPath = new vscode.ThemeIcon('sync~spin');
        break;
      case 'rolled_back':
        this.iconPath = new vscode.ThemeIcon('discard', new vscode.ThemeColor('editorWarning.foreground'));
        break;
      default:
        this.iconPath = new vscode.ThemeIcon('circle-outline');
    }
  }
}
