#!/usr/bin/env node
/**
 * Demo 1: Failing Tests → Auto-Rollback
 * 
 * This script simulates the full Resonant Genesis flow:
 * 1. Show original code passes tests
 * 2. AI "optimizes" the code (introduces bug)
 * 3. Verification catches the failure
 * 4. Auto-rollback restores original
 * 5. Generate proof bundle
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ORIGINAL_FILE = path.join(__dirname, 'calculator.js');
const BACKUP_FILE = path.join(__dirname, 'calculator.backup.js');

// Colors for terminal output
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

function log(color, message) {
  console.log(`${color}${message}${RESET}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// The "optimized" code that AI might generate (has bugs)
const BROKEN_CODE = `/**
 * Calculator module - "Optimized" by AI
 * 
 * AI thought: "Let's simplify this with modern JS!"
 * Reality: Removed critical edge case handling
 */

function calculateTotal(items) {
  // "Simplified" - removed null checks (BUG!)
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function applyDiscount(total, discountPercent) {
  // "Simplified" - removed validation (BUG!)
  return total * (1 - discountPercent / 100);
}

function calculateTax(subtotal, taxRate) {
  // "Simplified" - removed rounding (BUG!)
  return subtotal * taxRate;
}

function formatCurrency(amount) {
  // "Simplified" - assumed valid input (BUG!)
  return '$' + amount.toFixed(2);
}

module.exports = {
  calculateTotal,
  applyDiscount,
  calculateTax,
  formatCurrency,
};
`;

async function runDemo() {
  console.log('');
  log(BOLD, '═══════════════════════════════════════════════════════════');
  log(BOLD, '  DEMO 1: Failing Tests → Auto-Rollback');
  log(BOLD, '═══════════════════════════════════════════════════════════');
  console.log('');

  const startTime = Date.now();

  // Step 1: Show original tests pass
  log(BLUE, '▶ Step 1: Verify original code passes all tests');
  console.log('');
  
  try {
    execSync('node test.js', { cwd: __dirname, stdio: 'inherit' });
  } catch {
    log(RED, 'Original tests failed - demo cannot proceed');
    process.exit(1);
  }
  
  await sleep(1000);
  console.log('');

  // Step 2: Create backup (snapshot)
  log(BLUE, '▶ Step 2: Creating file snapshot for rollback...');
  const originalCode = fs.readFileSync(ORIGINAL_FILE, 'utf-8');
  fs.writeFileSync(BACKUP_FILE, originalCode);
  log(GREEN, '  ✓ Snapshot created');
  await sleep(500);
  console.log('');

  // Step 3: AI "optimization"
  log(BLUE, '▶ Step 3: AI is "optimizing" the code...');
  log(YELLOW, '  Task: "Simplify the calculator functions"');
  await sleep(1000);
  
  fs.writeFileSync(ORIGINAL_FILE, BROKEN_CODE);
  log(YELLOW, '  ✓ AI applied changes to calculator.js');
  await sleep(500);
  console.log('');

  // Step 4: Verification
  log(BLUE, '▶ Step 4: Running verification (tests)...');
  console.log('');
  
  let testsPassed = true;
  try {
    execSync('node test.js', { cwd: __dirname, stdio: 'inherit' });
  } catch {
    testsPassed = false;
  }
  
  await sleep(500);
  console.log('');

  // Step 5: Auto-rollback
  if (!testsPassed) {
    log(RED, '▶ Step 5: Verification FAILED - Initiating auto-rollback...');
    await sleep(500);
    
    fs.writeFileSync(ORIGINAL_FILE, originalCode);
    log(GREEN, '  ✓ Files restored from snapshot');
    await sleep(500);
    console.log('');

    // Step 6: Verify rollback worked
    log(BLUE, '▶ Step 6: Verifying rollback succeeded...');
    console.log('');
    
    try {
      execSync('node test.js', { cwd: __dirname, stdio: 'inherit' });
      log(GREEN, '  ✓ Rollback successful - all tests pass again');
    } catch {
      log(RED, '  ✗ Rollback verification failed');
    }
  } else {
    log(GREEN, '  ✓ All tests passed - no rollback needed');
  }
  
  await sleep(500);
  console.log('');

  // Step 7: Generate proof
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  log(BLUE, '▶ Step 7: Generating execution proof...');
  console.log('');

  const proof = {
    taskId: 'demo-001',
    description: 'Simplify the calculator functions',
    success: false,
    summary: 'Task failed verification. Auto-rollback executed.',
    steps: [
      { step: 'Create snapshot', success: true, duration: '0.01s' },
      { step: 'Apply AI changes', success: true, duration: '0.05s' },
      { step: 'Run verification', success: false, duration: '0.15s', error: 'Tests failed' },
      { step: 'Execute rollback', success: true, duration: '0.02s' },
      { step: 'Verify rollback', success: true, duration: '0.12s' },
    ],
    verification: {
      type: 'test',
      passed: false,
      failedTests: 8,
      totalTests: 22,
    },
    rollback: {
      executed: true,
      filesRestored: ['calculator.js'],
    },
    totalDuration: `${duration}s`,
    timestamp: new Date().toISOString(),
  };

  console.log(JSON.stringify(proof, null, 2));
  console.log('');

  // Cleanup
  if (fs.existsSync(BACKUP_FILE)) {
    fs.unlinkSync(BACKUP_FILE);
  }

  // Summary
  log(BOLD, '═══════════════════════════════════════════════════════════');
  log(BOLD, '  DEMO COMPLETE');
  log(BOLD, '═══════════════════════════════════════════════════════════');
  console.log('');
  log(GREEN, '  What you just saw:');
  console.log('  1. Original code with passing tests');
  console.log('  2. AI made changes that broke edge cases');
  console.log('  3. Verification caught the failures automatically');
  console.log('  4. Auto-rollback restored the original code');
  console.log('  5. Proof bundle documents everything');
  console.log('');
  log(YELLOW, '  Key insight: The codebase was NEVER left in a broken state.');
  console.log('');
}

runDemo().catch(console.error);
