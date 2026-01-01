# The 5-Minute Skeptic Demo

**Goal:** Convert a skeptical developer in 5 minutes.

**Setup:** Have VS Code open with the demo project. Resonant Genesis server running.

---

## Script

### [0:00] Opening (15 seconds)

> "Let me show you something different. This isn't another Copilot.
> 
> Copilot suggests. Cursor assists. We **execute and prove**."

### [0:15] The Problem (30 seconds)

> "Here's a simple calculator module with 22 tests. All passing."

*Run tests - show green*

> "Now, every AI coding tool has the same problem: 
> What happens when the AI breaks something?
> 
> With Copilot, **you** have to catch it.
> With us, **the system** catches it."

### [0:45] Demo 1: Breaking Tests (90 seconds)

> "Watch what happens when I ask the AI to 'optimize' this code."

*Select calculateTotal function*
*Run: Fix with Proof*
*Enter: "Optimize this function for performance"*

> "The AI is generating a plan... 3 steps.
> Now executing..."

*Watch as:*
1. Changes are applied
2. Tests run automatically
3. Tests FAIL
4. **Auto-rollback triggers**
5. Tests pass again

> "Did you see that? The AI broke 8 tests.
> The system caught it in **200 milliseconds**.
> Auto-rollback. Zero damage.
> 
> Here's the proof."

*Show proof panel: diffs, duration, cost, verification results*

### [2:15] Demo 2: The Audit Trail (45 seconds)

> "Everything is logged. Every AI action. Every change."

*Open Activity Log*

> "Who changed this file? The AI did, at 10:15.
> What did it try to do? Optimize calculateTotal.
> What happened? Verification failed, rolled back.
> 
> This is accountability. This is what's missing from every other tool."

### [3:00] Demo 3: Security (45 seconds)

> "What about dangerous code? What if someone asks to 'clean up files'?"

*Type: "Clean up temp files with rm -rf"*

> "Watch."

*Show blocked execution*

> "Blocked. Before execution. The sandbox validated the code and said no.
> 
> This isn't just 'AI wrote bad code.' This is 'AI can't run dangerous code.'"

### [3:45] Demo 4: The Proof Bundle (45 seconds)

> "Every task produces a proof bundle."

*Open proof from earlier demo*

> "Look at this:
> - Exact changes attempted
> - Duration: 4.2 seconds  
> - Cost: 2.3 cents
> - Verification: 8 tests failed
> - Rollback: successful
> 
> This is evidence. Not claims. Evidence.
> 
> You can audit this. You can trust this."

### [4:30] The Difference (30 seconds)

> "Here's the difference:
> 
> **Copilot:** 'Here's some code, good luck.'
> **Cursor:** 'I'll help you edit, but you verify.'
> **Us:** 'I'll execute, verify, and prove it. And if I break something, I'll fix it.'
> 
> That's not an assistant. That's an **authority**."

### [5:00] Close

> "Questions?"

---

## Key Phrases to Use

- "Execute and prove" (not "suggest and hope")
- "Automatic rollback" (not "undo button")
- "Verification caught it" (not "the tests failed")
- "Zero damage" (not "we fixed it")
- "Evidence, not claims"
- "Accountability"

## Key Phrases to Avoid

- "AI-powered" (everyone says this)
- "Smart" or "intelligent" (vague)
- "Better than Copilot" (sounds defensive)
- "We think" or "we believe" (weak)

## Objections and Responses

**"What if rollback fails?"**
> "Rollback uses file snapshots created before execution. It's deterministic. Here, let me show you the snapshot..."

**"What about large codebases?"**
> "The context window handles up to 100K tokens. For larger changes, we chunk and verify incrementally."

**"How much does it cost?"**
> "Every proof shows the exact cost. That demo was 2.3 cents. You set a max budget per task."

**"Can I use this with VS Code?"**
> "Yes. Install our extension. Keep Copilot for autocomplete. Use us for risky changes."

**"What languages?"**
> "TypeScript, JavaScript, Python today. Go and Rust in verification. More coming."

---

## Post-Demo Actions

1. **If interested:** "Want to try it on your codebase? I can set up a pilot."
2. **If skeptical:** "What would you need to see to trust this?"
3. **If technical questions:** "Let me show you the architecture..."

---

## Demo Checklist

Before every demo:

- [ ] Server running at localhost:8080
- [ ] VS Code extension installed
- [ ] Demo project open (demos/01-failing-tests)
- [ ] Tests passing initially
- [ ] Terminal visible
- [ ] Proof panel accessible
- [ ] Activity log clear or minimal
