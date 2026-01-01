import * as vscode from 'vscode';
import { ExecutionProof } from '../client';

export class ProofPanel {
  public static currentPanel: ProofPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, proof: ExecutionProof) {
    this._panel = panel;
    this._panel.webview.html = this.getHtml(proof);

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
  }

  public static show(extensionUri: vscode.Uri, proof: ExecutionProof) {
    const column = vscode.ViewColumn.Beside;

    if (ProofPanel.currentPanel) {
      ProofPanel.currentPanel._panel.reveal(column);
      ProofPanel.currentPanel._panel.webview.html = ProofPanel.currentPanel.getHtml(proof);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'resonantProof',
      'Execution Proof',
      column,
      { enableScripts: true }
    );

    ProofPanel.currentPanel = new ProofPanel(panel, proof);
  }

  private dispose() {
    ProofPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const d = this._disposables.pop();
      if (d) d.dispose();
    }
  }

  private getHtml(proof: ExecutionProof): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          :root {
            --bg: var(--vscode-editor-background);
            --fg: var(--vscode-editor-foreground);
            --border: var(--vscode-panel-border);
            --success: #22c55e;
            --error: #ef4444;
            --warning: #f59e0b;
          }
          body {
            font-family: var(--vscode-font-family);
            padding: 20px;
            color: var(--fg);
            background: var(--bg);
          }
          .header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 20px;
          }
          .status {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
          }
          .status.success { background: rgba(34, 197, 94, 0.2); color: var(--success); }
          .status.failed { background: rgba(239, 68, 68, 0.2); color: var(--error); }
          
          .summary {
            padding: 16px;
            background: var(--vscode-textBlockQuote-background);
            border-radius: 8px;
            margin-bottom: 20px;
          }
          
          .stats {
            display: flex;
            gap: 24px;
            margin-bottom: 20px;
          }
          .stat {
            text-align: center;
          }
          .stat-value {
            font-size: 24px;
            font-weight: bold;
          }
          .stat-label {
            font-size: 12px;
            opacity: 0.7;
          }
          
          .section {
            margin-bottom: 24px;
          }
          .section h2 {
            font-size: 14px;
            text-transform: uppercase;
            opacity: 0.7;
            margin-bottom: 12px;
          }
          
          .step {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 12px;
            background: var(--vscode-list-hoverBackground);
            border-radius: 6px;
            margin-bottom: 8px;
          }
          .step-icon {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
          }
          .step-icon.success { background: rgba(34, 197, 94, 0.2); color: var(--success); }
          .step-icon.failed { background: rgba(239, 68, 68, 0.2); color: var(--error); }
          .step-content { flex: 1; }
          .step-duration {
            font-size: 12px;
            opacity: 0.7;
            font-family: monospace;
          }
          
          .diff {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 12px;
            background: var(--vscode-list-hoverBackground);
            border-radius: 6px;
            margin-bottom: 8px;
          }
          .diff-type {
            font-size: 11px;
            padding: 2px 8px;
            border-radius: 4px;
            text-transform: uppercase;
          }
          .diff-type.created { background: rgba(34, 197, 94, 0.2); color: var(--success); }
          .diff-type.modified { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
          .diff-type.deleted { background: rgba(239, 68, 68, 0.2); color: var(--error); }
          .diff-path {
            flex: 1;
            font-family: monospace;
            font-size: 13px;
          }
          .diff-stats {
            font-family: monospace;
            font-size: 12px;
          }
          .additions { color: var(--success); }
          .deletions { color: var(--error); }
          
          .verification {
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 8px;
          }
          .verification.passed {
            background: rgba(34, 197, 94, 0.1);
            border-left: 3px solid var(--success);
          }
          .verification.failed {
            background: rgba(239, 68, 68, 0.1);
            border-left: 3px solid var(--error);
          }
          .verification-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
          }
          .verification-output {
            font-family: monospace;
            font-size: 11px;
            background: var(--vscode-editor-background);
            padding: 8px;
            border-radius: 4px;
            max-height: 150px;
            overflow: auto;
            white-space: pre-wrap;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Execution Proof</h1>
          <span class="status ${proof.success ? 'success' : 'failed'}">
            ${proof.success ? '✓ Success' : '✗ Failed'}
          </span>
        </div>

        <div class="summary">${proof.summary}</div>

        <div class="stats">
          <div class="stat">
            <div class="stat-value">${(proof.totalDuration / 1000).toFixed(2)}s</div>
            <div class="stat-label">Duration</div>
          </div>
          <div class="stat">
            <div class="stat-value">$${proof.totalCost.toFixed(4)}</div>
            <div class="stat-label">Cost</div>
          </div>
          <div class="stat">
            <div class="stat-value">${proof.tokensUsed.toLocaleString()}</div>
            <div class="stat-label">Tokens</div>
          </div>
          <div class="stat">
            <div class="stat-value">${proof.steps.filter(s => s.success).length}/${proof.steps.length}</div>
            <div class="stat-label">Steps</div>
          </div>
        </div>

        <div class="section">
          <h2>Execution Steps</h2>
          ${proof.steps.map(step => `
            <div class="step">
              <div class="step-icon ${step.success ? 'success' : 'failed'}">
                ${step.success ? '✓' : '✗'}
              </div>
              <div class="step-content">${step.description}</div>
              <div class="step-duration">${(step.duration / 1000).toFixed(2)}s</div>
            </div>
          `).join('')}
        </div>

        ${proof.diffs.length > 0 ? `
          <div class="section">
            <h2>File Changes</h2>
            ${proof.diffs.map(diff => `
              <div class="diff">
                <span class="diff-type ${diff.type}">${diff.type}</span>
                <span class="diff-path">${diff.path}</span>
                <span class="diff-stats">
                  <span class="additions">+${diff.additions}</span>
                  <span class="deletions">-${diff.deletions}</span>
                </span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${proof.verificationResults.length > 0 ? `
          <div class="section">
            <h2>Verification Results</h2>
            ${proof.verificationResults.map(result => `
              <div class="verification ${result.passed ? 'passed' : 'failed'}">
                <div class="verification-header">
                  <span>${result.passed ? '✓' : '✗'}</span>
                  <strong>${result.type}</strong>
                </div>
                ${result.output ? `
                  <div class="verification-output">${this.escapeHtml(result.output.slice(0, 500))}</div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </body>
      </html>
    `;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
