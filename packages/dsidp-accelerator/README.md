# @resonantgenesis/dsidp-accelerator

**DSID-P IDE Accelerator** - Make any IDE 3-5x faster with parallel execution, semantic caching, and governance verification.

[![npm version](https://badge.fury.io/js/@resonantgenesis%2Fdsidp-accelerator.svg)](https://www.npmjs.com/package/@resonantgenesis/dsidp-accelerator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

| Feature | Benefit |
|---------|---------|
| **Parallel Execution** | 3-5x faster file operations |
| **Semantic Caching** | Zero redundant reads |
| **Governance Verification** | Safer, more accurate edits |
| **Cross-Session Memory** | Context preservation |
| **Resonant Node Integration** | Full DSID-P orchestration |

## Installation

```bash
npm install @resonantgenesis/dsidp-accelerator
# or
yarn add @resonantgenesis/dsidp-accelerator
# or
pnpm add @resonantgenesis/dsidp-accelerator
```

## Quick Start

```typescript
import { createAccelerator } from '@resonantgenesis/dsidp-accelerator';

// Create accelerator with your file reader
const accelerator = createAccelerator({
  fileReader: async (path) => {
    // Your file reading logic
    return fs.readFileSync(path, 'utf-8');
  },
  fileSearcher: async (query, path) => {
    // Your search logic
    return searchFiles(query, path);
  },
});

// Read multiple files in parallel (3-5x faster!)
const contents = await accelerator.parallelRead([
  'src/App.tsx',
  'src/index.ts',
  'src/utils/helpers.ts',
]);

// Verify edits before applying
const check = await accelerator.verifyEdit(oldCode, newCode, filePath);
if (!check.allowed) {
  console.warn('Edit blocked:', check.rule, check.suggestions);
}
```

## Performance Comparison

```
BEFORE (Sequential):
  Read file 1 ──────────→ 100ms
                          Read file 2 ──────────→ 100ms
                                                  Read file 3 ──────────→ 100ms
  Total: 300ms

AFTER (Parallel with DSIDP):
  Read file 1 ──────────→ 100ms
  Read file 2 ──────────→ 100ms  (simultaneous)
  Read file 3 ──────────→ 100ms  (simultaneous)
  Total: 100ms ← 3x FASTER
```

## API Reference

### Configuration

```typescript
interface AcceleratorConfig {
  resonantNodeUrl?: string;      // Default: 'http://localhost:8081'
  maxConcurrent?: number;        // Default: 10
  cacheTtlMs?: number;           // Default: 30000 (30s)
  maxCacheSize?: number;         // Default: 200
  enableGovernance?: boolean;    // Default: true
  enableMemory?: boolean;        // Default: true
  fileReader?: (path: string) => Promise<string>;
  fileSearcher?: (query: string, path: string) => Promise<SearchResult[]>;
  logger?: Logger;
}
```

### Core Methods

#### `parallelRead(paths: string[]): Promise<Map<string, string>>`

Read multiple files in parallel.

```typescript
const contents = await accelerator.parallelRead([
  'src/App.tsx',
  'src/index.ts',
]);
console.log(contents.get('src/App.tsx'));
```

#### `parallelSearch(queries): Promise<SearchResult[][]>`

Search multiple patterns in parallel.

```typescript
const results = await accelerator.parallelSearch([
  { pattern: 'useState', path: 'src/' },
  { pattern: 'useEffect', path: 'src/' },
]);
```

#### `verifyEdit(oldContent, newContent, filePath): Promise<GovernanceCheck>`

Verify an edit before applying.

```typescript
const check = await accelerator.verifyEdit(
  oldCode,
  newCode,
  'src/App.tsx'
);

if (!check.allowed) {
  console.error('Blocked by rule:', check.rule);
  console.log('Suggestions:', check.suggestions);
} else if (check.riskLevel === 'high') {
  console.warn('High-risk edit - review carefully');
}
```

#### `addGovernanceRule(name, rule)`

Add custom governance rules.

```typescript
accelerator.addGovernanceRule('no-console-log', (action) => {
  if (action.content?.includes('console.log')) {
    return {
      allowed: false,
      rule: 'NoConsoleLog',
      confidence: 1.0,
      suggestions: ['Remove console.log before production'],
    };
  }
  return { allowed: true, rule: 'none', confidence: 1.0 };
});
```

### Cross-Session Memory

```typescript
// Save context for next session
await accelerator.saveContext('lastOpenFile', 'src/App.tsx');
await accelerator.saveContext('searchHistory', ['useState', 'useEffect']);

// Restore on next session
const lastFile = await accelerator.getContext('lastOpenFile');
const history = await accelerator.getContext('searchHistory');
```

### Statistics

```typescript
const stats = accelerator.getStats();
console.log({
  cacheHitRate: `${(stats.hitRate * 100).toFixed(1)}%`,
  parallelSpeedup: `${stats.parallelSpeedup.toFixed(1)}x`,
  resonantNode: stats.resonantNodeConnected ? 'Connected' : 'Disconnected',
});
```

## IDE Integration Examples

### VS Code Extension

```typescript
import * as vscode from 'vscode';
import { createAccelerator } from '@resonantgenesis/dsidp-accelerator';

const accelerator = createAccelerator({
  fileReader: async (path) => {
    const uri = vscode.Uri.file(path);
    const content = await vscode.workspace.fs.readFile(uri);
    return Buffer.from(content).toString('utf-8');
  },
});

// Use in your extension
export async function activate(context: vscode.ExtensionContext) {
  // Pre-load commonly accessed files
  const files = await vscode.workspace.findFiles('src/**/*.ts');
  await accelerator.parallelRead(files.map(f => f.fsPath));
}
```

### JetBrains Plugin

```kotlin
import com.resonantgenesis.dsidp.Accelerator

val accelerator = Accelerator.create {
    fileReader { path -> File(path).readText() }
}

// Parallel file loading
val contents = accelerator.parallelRead(listOf(
    "src/main.kt",
    "src/utils.kt"
))
```

### Neovim (Lua)

```lua
local accelerator = require('dsidp-accelerator')

accelerator.setup({
  file_reader = function(path)
    return vim.fn.readfile(path)
  end
})

-- Use in your plugin
vim.api.nvim_create_user_command('DSIDPPreload', function()
  local files = vim.fn.glob('src/**/*.ts', false, true)
  accelerator.parallel_read(files)
end, {})
```

## Resonant Node Integration

For full DSID-P capabilities, connect to a resonant-node:

```typescript
const accelerator = createAccelerator({
  resonantNodeUrl: 'http://localhost:8081',
});

// Check connection
const connected = await accelerator.checkResonantNode();
console.log('Resonant Node:', connected ? 'Connected' : 'Disconnected');
```

### What Resonant Node Provides

- **Cryptographic Identity** - Ed25519 signed operations
- **Causal DAG Ledger** - Full audit trail
- **Trust Scoring** - T0-T4 trust tiers
- **WASM Sandbox** - Isolated execution
- **Multi-Agent Orchestration** - Parallel agent coordination

## License

MIT © ResonantGenesis

## Support

- Documentation: https://docs.resonantgenesis.com/dsidp-accelerator
- Issues: https://github.com/resonantgenesis/dsidp-accelerator/issues
- Discord: https://discord.gg/resonantgenesis
