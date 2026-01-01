# How to Create Agents and Teams

**Quick Guide to Finding Creation Buttons**

---

## 🎯 **Where to Find the Buttons**

### **1. Create Agent Team Button** ✅

**Location:** Agent Teams Page

**Steps:**
1. Navigate to: **http://localhost:5175/agent-teams**
2. Or click **"Agent Teams"** in the sidebar
3. Look for the **"+ Create Team"** button in the top-right corner of the page
4. If no teams exist, you'll also see a **"Create Your First Team"** button in the empty state

**What it does:**
- Opens a modal to create a new agent team
- You'll need to select existing agents to add to the team
- Configure workflow type (sequential/parallel)

---

### **2. Create Agent Button** ✅

**Location:** Settings → Resonant Chat Settings → Agents Tab

**Steps:**
1. Navigate to: **http://localhost:5175/settings/resonant-chat**
2. Or go to **Settings** in sidebar, then **Resonant Chat**
3. Click on the **"Agents"** tab (should be selected by default)
4. Look for the **"Create Agent"** or **"+"** button in the agents list
5. Or click **"Add New Agent"** button

**What it does:**
- Opens the agent editor to create a new agent
- Configure agent name, description, model, prompts, etc.

---

## 📋 **Step-by-Step Workflow**

### **To Create a Team (You Need Agents First):**

1. **First, Create Agents:**
   - Go to: http://localhost:5175/settings/resonant-chat
   - Click "Agents" tab
   - Click "Create Agent" or "+" button
   - Fill in agent details:
     - Name
     - Description
     - Model/provider
     - System prompt
     - Instructions
   - Save the agent

2. **Then, Create Team:**
   - Go to: http://localhost:5175/agent-teams
   - Click **"+ Create Team"** button (top-right)
   - Fill in:
     - Team name
     - Description (optional)
     - Select agents from the list (the ones you just created)
     - Choose workflow type (sequential/parallel)
   - Click "Create Team"

---

## 🎯 **Visual Guide**

### **Agent Teams Page:**
```
┌─────────────────────────────────────┐
│  Agent Teams          [+ Create Team]│  ← Button here!
├─────────────────────────────────────┤
│                                     │
│  [Empty State or Team Cards]        │
│                                     │
└─────────────────────────────────────┘
```

### **Settings → Agents:**
```
┌─────────────────────────────────────┐
│  Settings → Resonant Chat           │
├─────────────────────────────────────┤
│  [Agents] [Providers] [Patches]     │
├─────────────────────────────────────┤
│  [+ Create Agent] or [Add New]      │  ← Button here!
│                                     │
│  [Agent List]                       │
└─────────────────────────────────────┘
```

---

## 🔗 **Direct URLs**

- **Create Team:** http://localhost:5175/agent-teams (then click "+ Create Team")
- **Create Agent:** http://localhost:5175/settings/resonant-chat (Agents tab)

---

## 💡 **Important Notes**

1. **You need agents before creating teams:**
   - Teams are made up of existing agents
   - Create agents first in Settings
   - Then select them when creating a team

2. **Agent Teams Page:**
   - The "+ Create Team" button is always visible in the header
   - If no teams exist, there's also a button in the empty state

3. **Settings Page:**
   - Agents are managed in Settings → Resonant Chat → Agents
   - This is separate from the Agent Teams page

---

## 🚀 **Quick Test Steps**

1. **Login** to the application
2. **Create an Agent:**
   - Go to Settings → Resonant Chat
   - Click "Create Agent"
   - Fill in details and save
3. **Create a Team:**
   - Go to Agent Teams page
   - Click "+ Create Team"
   - Select the agent you just created
   - Save the team

---

**Ready to create!** 🎉

