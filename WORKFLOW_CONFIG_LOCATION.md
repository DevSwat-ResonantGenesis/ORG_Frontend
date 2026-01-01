# 📍 Where to Find Workflow Configuration

## Step-by-Step Guide

### 1. Navigate to Agent Teams Page
- Go to: `http://localhost:5175/agent-teams` or click "Agent Teams" in the menu

### 2. Click "Create Team" Button
- Look for the **"Create Team"** button (usually at the top right of the page)
- Click it to open the team creation modal

### 3. Fill in Basic Info
- **Team Name** (required)
- **Description** (optional)

### 4. Find "Workflow Configuration" Section
- **Scroll down** in the modal
- Look for the section labeled: **"Workflow Configuration *"**
- It appears **BEFORE** the "Select Agents" section

### 5. Select "Custom JSON" Option
- You'll see two radio buttons:
  - ⚪ **Simple** (Auto-generate from selected agents)
  - ⚪ **Custom JSON** (Define steps manually) ← **SELECT THIS ONE**

### 6. JSON Editor Appears
- After selecting "Custom JSON", a large textarea will appear
- This is where you paste your workflow config JSON
- It has a blue border to make it stand out

---

## Visual Location in Form Order

```
┌─────────────────────────────────┐
│ Create Agent Team          [×]  │
├─────────────────────────────────┤
│                                 │
│ Team Name *                    │
│ [___________________________]   │
│                                 │
│ Description                    │
│ [___________________________]   │
│                                 │
│ ═══════════════════════════════ │
│ Workflow Configuration *       │ ← HERE!
│                                 │
│ ⚪ Simple                       │
│ ⚪ Custom JSON ← SELECT THIS    │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Workflow Config JSON *      │ │
│ │                             │ │
│ │ {                           │ │
│ │   "type": "sequential",    │ │
│ │   "steps": [...]            │ │
│ │ }                           │ │
│ └─────────────────────────────┘ │
│                                 │
│ Select Agents *                 │
│ [Search agents...]             │
│ [Agent cards...]               │
│                                 │
│ [Cancel]  [Create Team]        │
└─────────────────────────────────┘
```

---

## If You Don't See It

### Check 1: Scroll Down
- The modal might be scrollable
- Make sure you scroll down to see all sections

### Check 2: Browser Cache
- Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac) to hard refresh
- Or clear browser cache

### Check 3: Dev Server
- Make sure `npm run dev` is running
- Check terminal for any errors

### Check 4: Check Console
- Open browser DevTools (F12)
- Check Console tab for errors
- Check if the component is rendering

---

## Quick Test

1. Open: `http://localhost:5175/agent-teams`
2. Click "Create Team"
3. Scroll down past "Description"
4. You should see "Workflow Configuration" section
5. Click the "Custom JSON" radio button
6. The JSON editor textarea should appear below

---

## Expected Behavior

✅ **Before selecting Custom JSON:**
- Shows "Simple" and "Custom JSON" radio buttons
- Below shows "Sequential" and "Parallel" options

✅ **After selecting Custom JSON:**
- Radio buttons still visible
- Large textarea appears with blue border
- Help text appears below textarea
- Placeholder JSON shows example format

---

## Still Can't Find It?

1. **Take a screenshot** of the Create Team modal
2. **Check browser console** for errors (F12 → Console tab)
3. **Verify the route**: Make sure you're on `/agent-teams` page
4. **Check if modal opens**: The "Create Team" button should open a modal overlay

---

## Contact Info

If you still can't find it after these steps, please provide:
- Screenshot of the Create Team modal
- Browser console errors (if any)
- What you see instead of the Workflow Configuration section

