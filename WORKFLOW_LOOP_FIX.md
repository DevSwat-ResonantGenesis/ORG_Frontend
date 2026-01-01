# Workflow Infinite Loop Fix

## ✅ Implementation Complete

This document explains the fix for the infinite loop bug in multi-agent workflows.

---

## 🐛 The Problem

When a workflow's final step used `inputKey: "*"`, the workflow engine would:

1. Execute the final step and produce output
2. Store that output in the context
3. Re-queue the final step because `"*"` includes ALL outputs (including its own)
4. The agent receives the same input again → produces the same output
5. Loop continues infinitely

**Root Cause:** The final step's output was being fed back into itself via the `"*"` wildcard.

---

## ✅ The Solution

### Frontend Fixes

1. **Workflow Validator** (`src/utils/workflowValidator.ts`)
   - Detects when final step uses `inputKey: "*"`
   - Validates workflow structure
   - Suggests corrected configs
   - Checks for duplicate step IDs and outputKeys

2. **UI Validation** (CreateTeamPage & TeamBuilder)
   - Real-time validation as user types
   - Warnings displayed when loop risk detected
   - Auto-suggestion to fix the config
   - Blocks submission if validation fails

3. **Documentation Updates**
   - Updated `WORKFLOW_CONFIG_UI_GUIDE.md` with correct patterns
   - Added warnings about using `"*"` on final steps
   - Provided corrected examples

### Corrected Workflow Pattern

**❌ WRONG (Causes Loop):**
```json
{
  "id": "report",
  "agentId": "agent-uuid",
  "inputKey": "*",
  "outputKey": "finalReport"
}
```

**✅ CORRECT (No Loop):**
```json
{
  "id": "report",
  "agentId": "agent-uuid",
  "inputKey": ["profile", "metabolicData", "mealPlan", "groceryList", "fitnessPlan", "sleepPlan"],
  "outputKey": "finalReport"
}
```

---

## 🔧 What Was Changed

### Files Modified

1. **`src/utils/workflowValidator.ts`** (NEW)
   - `validateWorkflowConfig()` - Validates workflow structure
   - `hasRecursiveLoopRisk()` - Checks for loop risk
   - `suggestCorrectedConfig()` - Suggests fixes

2. **`src/pages/AgentTeams/CreateTeamPage.tsx`**
   - Added workflow validation on submit
   - Real-time validation on JSON edit
   - Warning display for loop risks
   - Auto-correction suggestion

3. **`src/pages/AgentTeams/TeamBuilder.tsx`**
   - Same validation as CreateTeamPage
   - Consistent UX across both components

4. **`src/api/agentTeams.ts`**
   - Updated types to support `inputKey: string | string[]`

5. **`WORKFLOW_CONFIG_UI_GUIDE.md`**
   - Updated examples with correct patterns
   - Added warnings section
   - Documented the loop issue

---

## 🚀 How It Works

### Validation Flow

1. User enters workflow config JSON
2. On change, validator checks:
   - JSON syntax
   - Required fields
   - Duplicate IDs/outputKeys
   - Loop risk (final step with `"*"`)
3. Warnings shown in UI (non-blocking)
4. On submit:
   - Full validation runs
   - Errors block submission
   - Warnings allow submission with confirmation
   - Auto-correction suggested if loop detected

### Example Validation Output

**Warning:**
```
⚠️ Step 7 (report) is the final step but uses inputKey: "*". 
This can cause infinite loops. Use explicit inputKeys like 
["profile", "metabolicData", ...] instead.
```

**Error:**
```
Step 3 (mealplan): inputKey "invalidKey" references a non-existent outputKey. 
Available outputs: profile, metabolicData
```

---

## 📋 Backend Fix Required

**Note:** The frontend now prevents users from creating loop-prone workflows, but the backend workflow engine should also be updated to:

1. **Terminate after final step:**
   ```python
   if step_index == len(steps) - 1:
       # This is the final step
       if step.output exists:
           stop_execution()  # Don't requeue
   ```

2. **Handle array inputKeys:**
   ```python
   if isinstance(step.inputKey, list):
       inputs = [context[key] for key in step.inputKey]
   elif step.inputKey == "*":
       inputs = context  # All outputs
   else:
       inputs = context[step.inputKey]
   ```

3. **Prevent self-reference:**
   ```python
   if step.outputKey in step.inputKey:
       # Don't include own output in input
       inputs = {k: v for k, v in inputs.items() if k != step.outputKey}
   ```

---

## ✅ Testing

To test the fix:

1. **Create a team with loop-prone config:**
   - Use `inputKey: "*"` on final step
   - Should see warning immediately
   - Should be prompted to use corrected version

2. **Create a team with correct config:**
   - Use explicit array `inputKey: ["profile", "metabolicData"]`
   - No warnings should appear
   - Team should create successfully

3. **Test validation:**
   - Missing required fields → Error
   - Duplicate step IDs → Error
   - Invalid inputKey references → Error
   - Final step with `"*"` → Warning

---

## 🎯 Impact

- ✅ **Prevents infinite loops** in new workflows
- ✅ **Better UX** with real-time validation
- ✅ **Clearer documentation** with correct examples
- ✅ **Type safety** with updated TypeScript types

**Note:** Existing workflows with `inputKey: "*"` on final steps will still loop until:
1. They are manually updated via the UI
2. The backend is updated to prevent loops

---

## 📝 Next Steps

1. **Backend Update** (Required)
   - Update workflow executor to handle array inputKeys
   - Add termination logic for final steps
   - Prevent self-reference in inputs

2. **Migration Script** (Optional)
   - Find all teams with loop-prone configs
   - Auto-fix them using `suggestCorrectedConfig()`
   - Update database records

3. **Monitoring** (Recommended)
   - Add metrics for workflow execution time
   - Alert on workflows running > expected duration
   - Detect stuck workflows automatically

---

**Status:** ✅ Frontend fixes complete. Backend update recommended.

