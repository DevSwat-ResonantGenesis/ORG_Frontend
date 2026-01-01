# Resonant Genesis - Trust Demos

**Trust comes from seeing failure handled correctly.**

These demos show what makes Resonant Genesis different: accountability, verification, and recovery.

---

## Demo 1: Failing Tests → Auto-Rollback

**What it proves:** When AI breaks something, the system catches it and recovers.

### Setup
```bash
cd demos/01-failing-tests
npm install
```

### Run
```bash
# Start with working tests
npm test  # ✓ All pass

# Ask AI to "optimize the calculateTotal function"
# AI makes a change that breaks edge cases

# System runs verification → Tests fail → Auto-rollback
# Files restored to pre-change state
# Proof shows: what was attempted, why it failed, what was rolled back
```

### What the audience sees
1. Working code with passing tests
2. AI makes a "helpful" optimization
3. Tests fail automatically
4. **Instant rollback** - no manual intervention
5. Proof bundle shows exactly what happened

---

## Demo 2: Type Errors → Blocked Execution

**What it proves:** Changes that break the type system never reach production.

### Setup
```bash
cd demos/02-type-errors
npm install
```

### Run
```bash
# TypeScript project with strict types
npm run typecheck  # ✓ No errors

# Ask AI to "add a new field to the User type"
# AI modifies the type but misses some usages

# System runs typecheck → Errors found → Execution blocked
# No files changed - plan rejected at verification stage
```

### What the audience sees
1. Type-safe codebase
2. AI proposes changes
3. Type checker catches inconsistencies **before** changes are applied
4. Zero damage - proposal rejected
5. Clear error report in proof

---

## Demo 3: Dangerous Command → Security Block

**What it proves:** Malicious or dangerous code never executes.

### Setup
```bash
cd demos/03-security-block
```

### Run
```bash
# User (or compromised prompt) asks:
# "Clean up the temp directory with rm -rf"

# Sandbox validates code before execution
# Dangerous pattern detected → Execution blocked
# Audit trail logs the attempt
```

### What the audience sees
1. Dangerous request submitted
2. **Blocked before execution**
3. Security policy logged
4. No damage possible

---

## Demo 4: Partial Failure → Graceful Recovery

**What it proves:** Multi-step tasks recover cleanly from mid-execution failures.

### Setup
```bash
cd demos/04-partial-failure
npm install
```

### Run
```bash
# 5-step refactoring task:
# 1. Create new file ✓
# 2. Move function ✓
# 3. Update imports ✓
# 4. Run tests ✗ (fails on step 4)
# 5. (never reached)

# System detects failure at step 4
# Rolls back steps 1-3 in reverse order
# All files restored to original state
```

### What the audience sees
1. Complex multi-step task starts
2. Steps 1-3 complete successfully
3. Step 4 fails (tests don't pass)
4. **Automatic rollback of all previous steps**
5. Codebase exactly as before
6. Proof shows: what succeeded, what failed, what was rolled back

---

## Demo 5: Cost Limit → Execution Capped

**What it proves:** Runaway AI costs are prevented.

### Setup
```bash
cd demos/05-cost-limit
```

### Run
```bash
# Configure: resonant.maxCostPerTask = 0.10

# Ask AI to "refactor the entire codebase"
# Plan estimates $0.45 in API costs

# Execution blocked - exceeds cost limit
# User must explicitly approve higher budget
```

### What the audience sees
1. Ambitious task requested
2. Plan shows estimated cost: $0.45
3. **Blocked** - exceeds $0.10 limit
4. User control preserved
5. No surprise bills

---

## The 5-Minute Skeptic Demo

For a live demo that converts skeptics, run demos in this order:

| Time | Demo | Point Made |
|------|------|------------|
| 0:00 | Show working code | "Here's a real codebase" |
| 0:30 | Demo 1 (Failing Tests) | "AI broke it, system caught it" |
| 2:00 | Demo 4 (Partial Failure) | "Multi-step rollback works" |
| 3:30 | Demo 3 (Security Block) | "Dangerous code never runs" |
| 4:30 | Show audit trail | "Every action is logged" |
| 5:00 | Show proof bundle | "Here's the evidence" |

**Key message:** "Other tools suggest. We execute and prove."

---

## Running All Demos

```bash
# Run the full demo suite
./run-demos.sh

# Or run individually
node demos/01-failing-tests/run.js
node demos/02-type-errors/run.js
node demos/03-security-block/run.js
node demos/04-partial-failure/run.js
node demos/05-cost-limit/run.js
```

---

## What Makes These Demos Powerful

1. **Real failures** - Not scripted success stories
2. **Automatic recovery** - No manual intervention
3. **Complete audit** - Every action logged
4. **Proof bundles** - Evidence, not claims
5. **Zero damage** - Rollback always works

**The goal:** After seeing these demos, no one asks "what if the AI breaks something?"

They already know the answer: **it gets caught and rolled back.**
