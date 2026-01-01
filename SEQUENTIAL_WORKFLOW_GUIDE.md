# How to Make Sequential Workflows Work Properly (One After Another)

## ✅ The Problem

When creating agent teams in **Simple (Auto)** mode with **Sequential** workflow type, all agents might repeat the same work instead of working one after another.

## 🔧 The Solution

The workflow configuration must properly chain `inputKey` and `outputKey` so each step uses the previous step's output.

## 📋 Step-by-Step Guide

### 1. **Create Team in Simple Mode**

1. Go to **Agent Teams** → **Create Team**
2. Select **"Simple"** mode (not Custom JSON)
3. Choose **"Sequential (A → B → C)"** workflow type
4. Select your agents in the **correct order**:
   - **Step 1**: First agent (e.g., Profile Extractor)
   - **Step 2**: Second agent (e.g., Metabolic Calculator)
   - **Step 3**: Third agent (e.g., Meal Plan Builder)
   - And so on...

### 2. **How Sequential Chaining Works**

The system automatically generates:
- **Step 1**: 
  - `inputKey: "userInput"` (your initial input)
  - `outputKey: "profile"` (or agent name)
  
- **Step 2**:
  - `inputKey: "profile"` (uses Step 1's output)
  - `outputKey: "metabolicData"`
  
- **Step 3**:
  - `inputKey: "metabolicData"` (uses Step 2's output)
  - `outputKey: "mealPlan"`

And so on...

### 3. **Important Rules**

✅ **DO:**
- Select agents in the correct order (first → second → third)
- Use **Sequential** workflow type for step-by-step execution
- Ensure each agent has a unique role/purpose
- Let the system auto-generate the workflow config

❌ **DON'T:**
- Select the same agent multiple times
- Mix up the order of agents
- Use `inputKey: "*"` on final steps (causes loops)
- Manually edit the workflow config unless you know what you're doing

### 4. **Verify the Generated Config**

After creating the team, you can check the workflow config:

1. Go to **Agent Teams** page
2. Click on your team
3. Click **Edit**
4. Switch to **"Custom JSON"** mode to see the generated config

You should see something like:
```json
{
  "workflow_config": {
    "type": "sequential",
    "steps": [
      {
        "id": "profile",
        "agentId": "agent-uuid-1",
        "inputKey": "userInput",
        "outputKey": "profile"
      },
      {
        "id": "metabolism",
        "agentId": "agent-uuid-2",
        "inputKey": "profile",  // ✅ Uses previous step's output
        "outputKey": "metabolicData"
      },
      {
        "id": "mealplan",
        "agentId": "agent-uuid-3",
        "inputKey": "metabolicData",  // ✅ Uses previous step's output
        "outputKey": "mealPlan"
      }
    ]
  }
}
```

### 5. **Troubleshooting**

**Problem: All agents doing the same work**
- **Cause**: Steps not properly chained (all using `userInput`)
- **Fix**: 
  1. Delete the team
  2. Recreate it with agents in the correct order
  3. Ensure you selected **Sequential** workflow type

**Problem: Workflow stuck in loop**
- **Cause**: Final step using `inputKey: "*"`
- **Fix**: 
  1. Edit the team
  2. Switch to Custom JSON mode
  3. Change final step's `inputKey` to explicit array: `["profile", "metabolicData", "mealPlan"]`
  4. Save

**Problem: Step 2 not getting Step 1's output**
- **Cause**: `inputKey` doesn't match previous step's `outputKey`
- **Fix**: 
  1. Check the workflow config
  2. Ensure Step 2's `inputKey` exactly matches Step 1's `outputKey`
  3. Example: If Step 1 has `outputKey: "profile"`, Step 2 must have `inputKey: "profile"`

## 🎯 Example: Life Optimization Team

**Correct Order:**
1. **Profile Extractor** → extracts user profile
2. **Metabolic Calculator** → uses profile to calculate metabolism
3. **Meal Plan Builder** → uses metabolic data to create meal plan
4. **Grocery List Builder** → uses meal plan to create grocery list
5. **Fitness Planner** → uses profile to create fitness plan
6. **Sleep Optimizer** → uses profile to create sleep plan
7. **Report Composer** → uses ALL outputs to create final report

**Workflow Config:**
```json
{
  "type": "sequential",
  "steps": [
    {
      "id": "profile",
      "inputKey": "userInput",
      "outputKey": "profile"
    },
    {
      "id": "metabolism",
      "inputKey": "profile",  // ✅ Chain from step 1
      "outputKey": "metabolicData"
    },
    {
      "id": "mealplan",
      "inputKey": "metabolicData",  // ✅ Chain from step 2
      "outputKey": "mealPlan"
    },
    {
      "id": "grocery",
      "inputKey": "mealPlan",  // ✅ Chain from step 3
      "outputKey": "groceryList"
    },
    {
      "id": "fitness",
      "inputKey": "profile",  // ✅ Can use earlier step's output
      "outputKey": "fitnessPlan"
    },
    {
      "id": "sleep",
      "inputKey": "profile",  // ✅ Can use earlier step's output
      "outputKey": "sleepPlan"
    },
    {
      "id": "report",
      "inputKey": ["profile", "metabolicData", "mealPlan", "groceryList", "fitnessPlan", "sleepPlan"],  // ✅ Explicit array, NOT "*"
      "outputKey": "finalReport"
    }
  ]
}
```

## 🔍 How to Check if It's Working

1. **Execute the workflow** with test input
2. **Watch the conversation view**:
   - Step 1 should process your input
   - Step 2 should process Step 1's output (different content)
   - Step 3 should process Step 2's output (different content)
   - Each step should show different messages

3. **If all steps show the same message**, the chaining is broken. Recreate the team.

## 💡 Pro Tips

- **Name your agents clearly** (e.g., "Profile Extractor", "Meal Plan Builder") - this helps the system generate better step IDs
- **Test with simple input first** before using complex workflows
- **Use Custom JSON mode** only if you need advanced control (branching, conditional logic)
- **Check the logs** in the browser console if workflows aren't working

## 🚨 Common Mistakes

1. **Selecting agents in wrong order** → Steps execute but with wrong data flow
2. **Using same agent twice** → Validation error (correctly prevents this)
3. **Using `inputKey: "*"` on final step** → Causes infinite loop
4. **Not selecting Sequential type** → All steps run in parallel instead of sequentially

---

**Status**: ✅ Sequential workflow chaining is implemented and working. Follow this guide to ensure proper execution.

