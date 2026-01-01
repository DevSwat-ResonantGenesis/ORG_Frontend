import * as vscode from 'vscode';
import { ResonantClient } from './client';
import { TaskTreeProvider } from './views/taskTree';
import { AuditTrailProvider } from './views/auditTrail';
import { ProofPanel } from './panels/proofPanel';

let client: ResonantClient;
let taskTreeProvider: TaskTreeProvider;
let auditTrailProvider: AuditTrailProvider;

export function activate(context: vscode.ExtensionContext) {
  console.log('Resonant Genesis extension activated');

  // Initialize client
  const config = vscode.workspace.getConfiguration('resonant');
  const serverUrl = config.get<string>('serverUrl') || 'http://localhost:8080';
  client = new ResonantClient(serverUrl);

  // Initialize tree providers
  taskTreeProvider = new TaskTreeProvider(client);
  auditTrailProvider = new AuditTrailProvider(client);

  // Register tree views
  vscode.window.registerTreeDataProvider('resonant.tasks', taskTreeProvider);
  vscode.window.registerTreeDataProvider('resonant.auditTrail', auditTrailProvider);

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('resonant.fixWithProof', () => fixWithProof()),
    vscode.commands.registerCommand('resonant.explainAndFix', () => explainAndFix()),
    vscode.commands.registerCommand('resonant.verifyChanges', () => verifyChanges()),
    vscode.commands.registerCommand('resonant.rollback', () => rollback()),
    vscode.commands.registerCommand('resonant.showAuditTrail', () => showAuditTrail()),
    vscode.commands.registerCommand('resonant.showProof', () => showProof()),
  );

  // Set context for keybindings
  vscode.commands.executeCommand('setContext', 'resonant.hasActiveTask', false);

  // Check server connection
  checkServerConnection();
}

export function deactivate() {
  client?.disconnect();
}

// ============== COMMANDS ==============

async function fixWithProof() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active editor');
    return;
  }

  const selection = editor.selection;
  const selectedText = editor.document.getText(selection);
  
  if (!selectedText) {
    vscode.window.showErrorMessage('Please select code to fix');
    return;
  }

  // Get task description from user
  const description = await vscode.window.showInputBox({
    prompt: 'What should be fixed?',
    placeHolder: 'e.g., Fix the null pointer exception, Add error handling, Optimize performance...',
  });

  if (!description) return;

  // Show progress
  await vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: 'Resonant Genesis',
    cancellable: true,
  }, async (progress, token) => {
    try {
      progress.report({ message: 'Creating task...' });

      // Create task context
      const context = {
        files: [{
          path: editor.document.uri.fsPath,
          content: editor.document.getText(),
          language: editor.document.languageId,
        }],
        selectedCode: selectedText,
        language: editor.document.languageId,
      };

      // Create and plan task
      const task = await client.createTask(description, context);
      progress.report({ message: 'Generating plan...' });

      const plan = await client.planTask(task.id);

      // Check cancellation
      if (token.isCancellationRequested) {
        return;
      }

      // Show plan and get confirmation
      const config = vscode.workspace.getConfiguration('resonant');
      const requireConfirmation = config.get<boolean>('requireConfirmation');

      if (requireConfirmation && plan.requiresConfirmation) {
        const confirmed = await showPlanConfirmation(plan);
        if (!confirmed) return;
      }

      // Execute
      progress.report({ message: 'Executing plan...' });
      vscode.commands.executeCommand('setContext', 'resonant.hasActiveTask', true);

      const proof = await client.executeTask(task.id, {
        onStepStart: (step) => {
          progress.report({ message: `Step ${step.order + 1}: ${step.description}` });
        },
        onStepComplete: (step) => {
          if (!step.result?.success) {
            vscode.window.showWarningMessage(`Step failed: ${step.description}`);
          }
        },
      });

      vscode.commands.executeCommand('setContext', 'resonant.hasActiveTask', false);

      // Show proof
      if (proof.success) {
        vscode.window.showInformationMessage(
          `✓ Task completed: ${proof.summary}`,
          'Show Proof',
          'Show Diff'
        ).then(action => {
          if (action === 'Show Proof') {
            ProofPanel.show(context.extensionUri, proof);
          } else if (action === 'Show Diff') {
            showDiff(proof);
          }
        });
      } else {
        const action = await vscode.window.showErrorMessage(
          `Task failed: ${proof.summary}`,
          'Rollback',
          'Show Details'
        );

        if (action === 'Rollback') {
          await rollback();
        } else if (action === 'Show Details') {
          ProofPanel.show(context.extensionUri, proof);
        }
      }

      // Refresh views
      taskTreeProvider.refresh();
      auditTrailProvider.refresh();

    } catch (error) {
      vscode.commands.executeCommand('setContext', 'resonant.hasActiveTask', false);
      vscode.window.showErrorMessage(
        `Resonant Genesis error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  });
}

async function explainAndFix() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active editor');
    return;
  }

  const selection = editor.selection;
  const selectedText = editor.document.getText(selection);
  
  if (!selectedText) {
    vscode.window.showErrorMessage('Please select code to explain and fix');
    return;
  }

  await vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: 'Resonant Genesis - Analyzing...',
    cancellable: true,
  }, async (progress) => {
    try {
      // First, get explanation
      progress.report({ message: 'Analyzing code...' });
      
      const analysis = await client.analyzeCode(selectedText, editor.document.languageId);

      // Show explanation in panel
      const panel = vscode.window.createWebviewPanel(
        'resonantExplain',
        'Code Analysis',
        vscode.ViewColumn.Beside,
        { enableScripts: true }
      );

      panel.webview.html = getAnalysisHtml(analysis);

      // Ask if user wants to fix issues
      if (analysis.issues.length > 0) {
        const action = await vscode.window.showInformationMessage(
          `Found ${analysis.issues.length} issues. Would you like to fix them?`,
          'Fix All',
          'Fix Critical Only',
          'Cancel'
        );

        if (action === 'Fix All' || action === 'Fix Critical Only') {
          const description = action === 'Fix All' 
            ? 'Fix all identified issues'
            : 'Fix critical issues only';

          // Trigger fix with proof
          await vscode.commands.executeCommand('resonant.fixWithProof');
        }
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Analysis failed: ${error}`);
    }
  });
}

async function verifyChanges() {
  await vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: 'Resonant Genesis - Verifying...',
    cancellable: false,
  }, async (progress) => {
    try {
      progress.report({ message: 'Running type check...' });
      const typeResult = await client.verify('typecheck');

      progress.report({ message: 'Running lint...' });
      const lintResult = await client.verify('lint');

      progress.report({ message: 'Running tests...' });
      const testResult = await client.verify('test');

      // Show results
      const passed = typeResult.passed && lintResult.passed && testResult.passed;
      
      if (passed) {
        vscode.window.showInformationMessage('✓ All verifications passed');
      } else {
        const failures = [];
        if (!typeResult.passed) failures.push('Type check');
        if (!lintResult.passed) failures.push('Lint');
        if (!testResult.passed) failures.push('Tests');

        vscode.window.showErrorMessage(
          `Verification failed: ${failures.join(', ')}`,
          'Show Details'
        ).then(action => {
          if (action === 'Show Details') {
            showVerificationDetails({ typeResult, lintResult, testResult });
          }
        });
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Verification failed: ${error}`);
    }
  });
}

async function rollback() {
  const lastTask = client.getLastTask();
  if (!lastTask) {
    vscode.window.showInformationMessage('No task to rollback');
    return;
  }

  const confirm = await vscode.window.showWarningMessage(
    `Rollback all changes from task: "${lastTask.description}"?`,
    { modal: true },
    'Rollback',
    'Cancel'
  );

  if (confirm !== 'Rollback') return;

  await vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: 'Rolling back...',
    cancellable: false,
  }, async () => {
    try {
      await client.rollbackTask(lastTask.id);
      vscode.window.showInformationMessage('✓ Rollback complete');
      taskTreeProvider.refresh();
      auditTrailProvider.refresh();
    } catch (error) {
      vscode.window.showErrorMessage(`Rollback failed: ${error}`);
    }
  });
}

function showAuditTrail() {
  vscode.commands.executeCommand('resonant.auditTrail.focus');
}

function showProof() {
  const lastProof = client.getLastProof();
  if (!lastProof) {
    vscode.window.showInformationMessage('No proof available');
    return;
  }
  ProofPanel.show(vscode.Uri.file(''), lastProof);
}

// ============== HELPERS ==============

async function checkServerConnection() {
  try {
    const healthy = await client.checkHealth();
    if (healthy) {
      vscode.window.setStatusBarMessage('$(check) Resonant Genesis connected', 5000);
    } else {
      vscode.window.showWarningMessage(
        'Resonant Genesis server not available. Some features may not work.'
      );
    }
  } catch {
    vscode.window.showWarningMessage(
      'Could not connect to Resonant Genesis server'
    );
  }
}

async function showPlanConfirmation(plan: any): Promise<boolean> {
  const items = plan.steps.map((step: any, i: number) => ({
    label: `${i + 1}. ${step.description}`,
    description: step.type,
    detail: step.action.target || '',
  }));

  const riskLabel = plan.riskLevel === 'high' ? '⚠️ HIGH RISK' :
                    plan.riskLevel === 'medium' ? '⚡ Medium risk' : '✓ Low risk';

  const result = await vscode.window.showQuickPick(items, {
    title: `Execution Plan (${riskLabel})`,
    placeHolder: `${plan.steps.length} steps | ~${Math.round(plan.estimatedDuration / 1000)}s | $${plan.estimatedCost.toFixed(3)}`,
    canPickMany: false,
    ignoreFocusOut: true,
  });

  if (result) {
    const confirm = await vscode.window.showWarningMessage(
      'Execute this plan?',
      { modal: true },
      'Execute',
      'Cancel'
    );
    return confirm === 'Execute';
  }

  return false;
}

function showDiff(proof: any) {
  if (proof.diffs.length === 0) {
    vscode.window.showInformationMessage('No file changes');
    return;
  }

  // Show diff for first changed file
  const diff = proof.diffs[0];
  if (diff.oldContent && diff.newContent) {
    const oldUri = vscode.Uri.parse(`resonant-old:${diff.path}`);
    const newUri = vscode.Uri.parse(`resonant-new:${diff.path}`);
    vscode.commands.executeCommand('vscode.diff', oldUri, newUri, `${diff.path} (Changes)`);
  }
}

function showVerificationDetails(results: any) {
  const panel = vscode.window.createWebviewPanel(
    'resonantVerification',
    'Verification Results',
    vscode.ViewColumn.Beside,
    {}
  );

  panel.webview.html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: var(--vscode-font-family); padding: 20px; }
        .result { margin-bottom: 20px; }
        .passed { color: #22c55e; }
        .failed { color: #ef4444; }
        pre { background: #1e1e1e; padding: 10px; border-radius: 4px; overflow: auto; }
      </style>
    </head>
    <body>
      <h2>Verification Results</h2>
      ${formatResult('Type Check', results.typeResult)}
      ${formatResult('Lint', results.lintResult)}
      ${formatResult('Tests', results.testResult)}
    </body>
    </html>
  `;
}

function formatResult(name: string, result: any): string {
  return `
    <div class="result">
      <h3 class="${result.passed ? 'passed' : 'failed'}">
        ${result.passed ? '✓' : '✗'} ${name}
      </h3>
      <pre>${result.output || 'No output'}</pre>
    </div>
  `;
}

function getAnalysisHtml(analysis: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: var(--vscode-font-family); padding: 20px; }
        .issue { margin: 10px 0; padding: 10px; border-radius: 4px; }
        .error { background: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; }
        .warning { background: rgba(245, 158, 11, 0.1); border-left: 3px solid #f59e0b; }
        .info { background: rgba(59, 130, 246, 0.1); border-left: 3px solid #3b82f6; }
        .metrics { display: flex; gap: 20px; margin: 20px 0; }
        .metric { text-align: center; }
        .metric-value { font-size: 24px; font-weight: bold; }
      </style>
    </head>
    <body>
      <h2>Code Analysis</h2>
      
      <div class="metrics">
        <div class="metric">
          <div class="metric-value">${analysis.metrics?.lines || 0}</div>
          <div>Lines</div>
        </div>
        <div class="metric">
          <div class="metric-value">${analysis.metrics?.complexity || 0}</div>
          <div>Complexity</div>
        </div>
        <div class="metric">
          <div class="metric-value">${analysis.issues?.length || 0}</div>
          <div>Issues</div>
        </div>
      </div>

      <h3>Issues</h3>
      ${(analysis.issues || []).map((issue: any) => `
        <div class="issue ${issue.type}">
          <strong>Line ${issue.line}:</strong> ${issue.message}
          ${issue.rule ? `<br><small>Rule: ${issue.rule}</small>` : ''}
        </div>
      `).join('')}

      ${(analysis.suggestions || []).length > 0 ? `
        <h3>Suggestions</h3>
        <ul>
          ${analysis.suggestions.map((s: string) => `<li>${s}</li>`).join('')}
        </ul>
      ` : ''}
    </body>
    </html>
  `;
}
