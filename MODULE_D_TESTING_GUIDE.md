# 🧪 Module D: Testing Guide

## ✅ **Testing Checklist**

After applying the database migration, test all components of Module D.

---

## 🔧 **1. Backend API Testing**

### **Prerequisites:**
- Backend server running on `http://localhost:8001`
- Valid authentication session
- At least 2 agents created (for team creation)

### **Test Endpoints:**

#### **1.1 Create Agent Team**
```bash
POST /agent-teams
Content-Type: application/json

{
  "name": "Code Review Team",
  "description": "Team for automated code review",
  "agent_ids": ["agent-id-1", "agent-id-2"],
  "workflow_config": {
    "type": "sequential"
  }
}
```

**Expected:** `201 Created` with team object

#### **1.2 List Teams**
```bash
GET /agent-teams
```

**Expected:** `200 OK` with array of teams

#### **1.3 Get Team Details**
```bash
GET /agent-teams/{team_id}
```

**Expected:** `200 OK` with team object

#### **1.4 Get Team Members**
```bash
GET /agent-teams/{team_id}/members
```

**Expected:** `200 OK` with array of members

#### **1.5 Execute Workflow**
```bash
POST /agent-teams/{team_id}/execute
Content-Type: application/json

{
  "input_data": {
    "message": "Refactor this function to use async/await",
    "file_path": "src/utils.ts"
  },
  "project_id": "optional-project-id"
}
```

**Expected:** `201 Created` with workflow object

#### **1.6 Get Workflow Status**
```bash
GET /agent-teams/workflows/{workflow_id}
```

**Expected:** `200 OK` with workflow status

#### **1.7 Get Conversation**
```bash
GET /agent-teams/workflows/{workflow_id}/conversation?limit=50
```

**Expected:** `200 OK` with array of conversation messages

---

## 🎨 **2. Frontend UI Testing**

### **Prerequisites:**
- Frontend dev server running on `http://localhost:5175`
- Logged in user with appropriate permissions
- Backend API accessible

### **Test Pages:**

#### **2.1 Agent Teams Page**
- Navigate to: `http://localhost:5175/agent-teams`
- **Verify:**
  - ✅ Page loads without errors
  - ✅ Shows "Create Team" button
  - ✅ Empty state if no teams exist
  - ✅ Teams list if teams exist

#### **2.2 Create Team Modal**
- Click "Create Team" button
- **Verify:**
  - ✅ Modal opens
  - ✅ Shows team name input
  - ✅ Shows description textarea
  - ✅ Shows workflow type selection
  - ✅ Shows agents list (from available agents)
  - ✅ Can select multiple agents
  - ✅ Create button works
  - ✅ Success toast appears
  - ✅ Team appears in list after creation

#### **2.3 Execute Workflow Modal**
- Click on a team card
- Click "Execute Workflow" button
- **Verify:**
  - ✅ Modal opens
  - ✅ Shows task/message input
  - ✅ Shows project ID input (optional)
  - ✅ Shows workflow info
  - ✅ Execute button works
  - ✅ Workflow starts
  - ✅ Conversation modal opens automatically

#### **2.4 Conversation View**
- After executing workflow, conversation modal should open
- **Verify:**
  - ✅ Shows workflow status
  - ✅ Shows step progress
  - ✅ Shows agent messages
  - ✅ Updates in real-time (polls every 5 seconds)
  - ✅ Shows agent responses
  - ✅ Shows message metadata

---

## 🔍 **3. Integration Testing**

### **3.1 Full Workflow Test**

1. **Create Agents** (if not exist)
   - Create at least 2 agents with different roles
   - Example: "Architect" and "Coder"

2. **Create Team**
   - Create team with 2 agents
   - Use sequential workflow type

3. **Execute Workflow**
   - Submit a task: "Create a function to calculate fibonacci numbers"
   - Monitor workflow execution

4. **Verify Execution**
   - Check workflow status
   - Verify conversation messages
   - Verify agents are invoked in sequence
   - Verify final result

### **3.2 Error Handling Test**

1. **Test Invalid Team Creation**
   - Try creating team with no agents
   - ✅ Should show error

2. **Test Invalid Workflow Execution**
   - Try executing with empty message
   - ✅ Should show error

3. **Test Non-Existent Team**
   - Try accessing team with invalid ID
   - ✅ Should show 404 error

---

## 📊 **4. Database Verification**

### **4.1 Check Tables**
```sql
-- Connect to database
psql -U <user> -d <database>

-- List agent team tables
\dt agent_*

-- Check table structure
\d agent_teams
\d agent_team_members
\d agent_workflows
\d agent_workflow_steps
\d agent_conversations
```

### **4.2 Check Data**
```sql
-- Check teams
SELECT id, name, status, created_at FROM agent_teams;

-- Check team members
SELECT team_id, agent_id, role, "order" FROM agent_team_members;

-- Check workflows
SELECT id, team_id, status, current_step FROM agent_workflows;

-- Check conversations
SELECT id, from_agent_id, to_agent_id, message_type FROM agent_conversations;
```

---

## 🐛 **5. Common Issues & Solutions**

### **Issue: "No agents available"**
- **Solution:** Create agents first using `/agents` endpoint

### **Issue: "Workflow not executing"**
- **Solution:** 
  - Check backend logs for errors
  - Verify agents are configured correctly
  - Check AI provider API keys

### **Issue: "Conversation not updating"**
- **Solution:**
  - Check browser console for errors
  - Verify WebSocket/API connection
  - Check workflow status endpoint

### **Issue: "Permission denied"**
- **Solution:**
  - Verify user role has access to `predictions` category
  - Check authentication session
  - Verify organization context

---

## ✅ **Success Criteria**

All tests pass when:

1. ✅ **Backend API:**
   - All 7 endpoints work correctly
   - Proper error handling
   - Authentication working

2. ✅ **Frontend UI:**
   - All pages load without errors
   - Modals work correctly
   - Real-time updates work

3. ✅ **Database:**
   - All 5 tables created
   - Data persists correctly
   - Relationships work

4. ✅ **Integration:**
   - Full workflow executes successfully
   - Agents communicate correctly
   - Results are stored

---

## 🚀 **Ready for Production**

After all tests pass:

1. ✅ Module D is fully functional
2. ✅ Ready for user testing
3. ✅ Can start Module F (Marketplace)

---

**Happy Testing!** 🎉

