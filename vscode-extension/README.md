# Resonant Genesis - Fix with Proof

**Autonomous code execution with verification, proof, and rollback.**

> "Fix this issue and prove it's fixed."

## What This Does

Unlike Copilot (which suggests) or Cursor (which assists), Resonant Genesis **executes and proves**.

When you select code and run "Fix with Proof":

1. **Plan** - AI generates a multi-step execution plan
2. **Execute** - Each step runs with verification
3. **Verify** - Type checks, tests, and lint run automatically
4. **Prove** - You get a bundle: diffs, duration, cost, verification results
5. **Rollback** - One click restores everything if needed

## Commands

| Command | Shortcut | Description |
|---------|----------|-------------|
| Fix with Proof | `Cmd+Shift+F` | Plan, execute, verify, and prove |
| Explain and Fix | - | Analyze code, then optionally fix |
| Verify Changes | - | Run type check + lint + tests |
| Rollback | `Cmd+Shift+Z` | Undo all changes from last task |
| Show Activity Log | - | View all AI/user actions |
| Show Last Proof | - | View the most recent proof |

## Installation

1. Install the extension
2. Start the Resonant Genesis server (`http://localhost:8080`)
3. Select code → Right-click → "Fix with Proof"

## Configuration

```json
{
  "resonant.serverUrl": "http://localhost:8080",
  "resonant.autoVerify": true,
  "resonant.showProofOnComplete": true,
  "resonant.requireConfirmation": true,
  "resonant.maxCostPerTask": 0.50
}
```

## Why This Matters

**The problem with AI coding assistants:**
- They suggest, you verify
- No accountability
- No rollback
- No proof

**What Resonant Genesis provides:**
- Plan before execution
- Step-by-step verification
- Complete audit trail
- One-click rollback
- Proof bundle for every change

## Trust Model

Every execution produces a **proof bundle**:

```
{
  "success": true,
  "summary": "Fixed null pointer exception in 3 steps",
  "totalDuration": 4.2s,
  "totalCost": $0.023,
  "tokensUsed": 1,847,
  "steps": [...],
  "diffs": [...],
  "verificationResults": [
    { "type": "typecheck", "passed": true },
    { "type": "test", "passed": true }
  ]
}
```

If anything fails, rollback restores all files to their exact state before the task.

## Requirements

- VS Code 1.85.0+
- Resonant Genesis server running
- Node.js 18+ (for server)

## License

MIT
