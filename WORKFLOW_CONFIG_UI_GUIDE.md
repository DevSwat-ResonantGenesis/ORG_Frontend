# Workflow Config UI Guide

## ✅ Implementation Complete

The UI now supports inserting `workflow_config` JSON directly through the team creation form.

---

## 📍 Where to Find It

**Location:** Agent Teams Page → Create Team → Workflow Configuration Section

**Path in UI:**
1. Navigate to `/agents` or `/agent-teams`
2. Click "Create Team" button
3. Scroll to "Workflow Configuration" section
4. Select "Custom JSON (Advanced - Define steps manually)"
5. Enter your workflow config JSON

---

## 🎯 How to Use

### Option 1: Simple Mode (Auto-generate)
- Select "Simple (Auto-generate from selected agents)"
- Choose workflow type: Sequential or Parallel
- Select agents
- System auto-generates workflow_config from selected agents

### Option 2: Custom JSON Mode (Recommended for Multi-Agent Workflows)
- Select "Custom JSON (Advanced - Define steps manually)"
- Paste your workflow config JSON in the textarea
- Format must match the schema below

---

## 📋 Workflow Config JSON Format

```json
{
  "type": "sequential",
  "steps": [
    {
      "id": "profile",
      "agentId": "agent-uuid-1",
      "inputKey": "userInput",
      "outputKey": "profile",
      "role": "Profile Extractor",
      "prompt": "Extract structured profile data from user input"
    },
    {
      "id": "metabolism",
      "agentId": "agent-uuid-2",
      "inputKey": "profile",
      "outputKey": "metabolicData",
      "role": "Metabolic Calculator",
      "prompt": "Calculate BMR and calorie targets based on profile"
    },
    {
      "id": "mealplan",
      "agentId": "agent-uuid-3",
      "inputKey": "metabolicData",
      "outputKey": "mealPlan",
      "role": "Meal Plan Builder",
      "prompt": "Create 7-day meal plan"
    },
    {
      "id": "grocery",
      "agentId": "agent-uuid-4",
      "inputKey": "mealPlan",
      "outputKey": "groceryList",
      "role": "Grocery Compiler",
      "prompt": "Compile grocery list from meal plan"
    },
    {
      "id": "fitness",
      "agentId": "agent-uuid-5",
      "inputKey": "profile",
      "outputKey": "fitnessPlan",
      "role": "Fitness Planner",
      "prompt": "Generate 7-day fitness routine"
    },
    {
      "id": "sleep",
      "agentId": "agent-uuid-6",
      "inputKey": "profile",
      "outputKey": "sleepPlan",
      "role": "Sleep Optimizer",
      "prompt": "Create sleep optimization plan"
    },
    {
      "id": "report",
      "agentId": "agent-uuid-7",
      "inputKey": ["profile", "metabolicData", "mealPlan", "groceryList", "fitnessPlan", "sleepPlan"],
      "outputKey": "finalReport",
      "role": "Report Builder",
      "prompt": "Compile final report from all previous outputs"
    }
  ]
}
```

---

## 🔑 Field Descriptions

### Required Fields

- **`id`**: Unique identifier for the step (e.g., "profile", "metabolism")
- **`agentId`**: UUID of the agent to use for this step
- **`inputKey`**: 
  - `"userInput"` for first step
  - Previous step's `outputKey` for chaining (e.g., `"profile"`)
  - Array of outputKeys for final step (e.g., `["profile", "metabolicData", "mealPlan"]`)
  - ⚠️ **DO NOT use `"*"` on final step** - This causes infinite loops!
- **`outputKey`**: Key to store this step's output in context (e.g., "profile", "metabolicData")

### Optional Fields

- **`role`**: Agent role for schema detection (e.g., "Profile Extractor" → uses ProfileOutput schema)
- **`prompt`**: Custom prompt for this step (overrides agent's default prompt)

---

## ✅ What Happens When You Save

1. **JSON is validated** - Invalid JSON shows error
2. **Saved to database** - Stored in `team.workflow_config` column
3. **Used by backend** - Workflow executor reads `workflow_config.steps`
4. **Step chaining works** - Each step receives previous step's output
5. **Schema validation** - Agents with roles get schema validation

---

## 🚨 Important Notes

### ❌ DO NOT PUT IN:
- Team Description field
- Agent Description field
- Team Name field
- Any other field

### ✅ ONLY PUT IN:
- **Workflow Config JSON field** (in team creation/editing form)

---

## 🔍 How to Get Agent UUIDs

1. Go to Agents page (`/agents`)
2. View agent details
3. Copy the agent ID (UUID)
4. Use it in `agentId` field in workflow config

---

## 📝 Example: Life Optimization Team

```json
{
  "type": "sequential",
  "steps": [
    {
      "id": "profile",
      "agentId": "dfb567ae-1234-5678-9abc-def123456789",
      "inputKey": "userInput",
      "outputKey": "profile",
      "role": "Profile Extractor"
    },
    {
      "id": "metabolism",
      "agentId": "a1b2c3d4-5678-9abc-def0-123456789abc",
      "inputKey": "profile",
      "outputKey": "metabolicData",
      "role": "Metabolic Calculator"
    },
    {
      "id": "mealplan",
      "agentId": "b2c3d4e5-6789-abcd-ef01-23456789abcd",
      "inputKey": "metabolicData",
      "outputKey": "mealPlan",
      "role": "Meal Plan Builder"
    },
    {
      "id": "grocery",
      "agentId": "c3d4e5f6-789a-bcde-f012-3456789abcde",
      "inputKey": "mealPlan",
      "outputKey": "groceryList",
      "role": "Grocery Compiler"
    },
    {
      "id": "fitness",
      "agentId": "d4e5f6a7-89ab-cdef-0123-456789abcdef",
      "inputKey": "profile",
      "outputKey": "fitnessPlan",
      "role": "Fitness Planner"
    },
    {
      "id": "sleep",
      "agentId": "e5f6a7b8-9abc-def0-1234-56789abcdef0",
      "inputKey": "profile",
      "outputKey": "sleepPlan",
      "role": "Sleep Optimizer"
    },
    {
      "id": "report",
      "agentId": "f6a7b8c9-abcd-ef01-2345-6789abcdef01",
      "inputKey": ["profile", "metabolicData", "mealPlan", "groceryList", "fitnessPlan", "sleepPlan"],
      "outputKey": "finalReport",
      "role": "Report Builder"
    }
  ]
}
```

---

## 🎨 UI Features

- **JSON Syntax Highlighting**: Monospace font for readability
- **Validation**: Real-time JSON validation
- **Help Text**: Shows required fields and format
- **Example Placeholder**: Template JSON in textarea
- **Error Messages**: Clear errors if JSON is invalid

---

## ⚠️ Important: Preventing Infinite Loops

**DO NOT use `inputKey: "*"` on the final step!**

Using `"*"` on the final step causes the workflow engine to:
1. Feed all outputs (including the final step's own output) back into the final agent
2. Create an infinite loop where the agent repeats the same output
3. Never terminate the workflow

**✅ CORRECT (Final Step):**
```json
{
  "id": "report",
  "agentId": "agent-uuid",
  "inputKey": ["profile", "metabolicData", "mealPlan", "groceryList", "fitnessPlan", "sleepPlan"],
  "outputKey": "finalReport"
}
```

**❌ WRONG (Causes Loop):**
```json
{
  "id": "report",
  "agentId": "agent-uuid",
  "inputKey": "*",
  "outputKey": "finalReport"
}
```

The frontend now validates workflows and warns you if you use `"*"` on the final step.

---

## ✅ Status

- [x] UI field added to TeamBuilder
- [x] JSON editor with validation
- [x] Backend accepts workflow_config
- [x] Workflow executor reads workflow_config.steps
- [x] Step chaining works with inputKey/outputKey
- [x] Schema validation based on agent roles
- [x] **Workflow validation to prevent infinite loops**
- [x] **Warnings for malformed configs**

**Ready to use!** 🚀

