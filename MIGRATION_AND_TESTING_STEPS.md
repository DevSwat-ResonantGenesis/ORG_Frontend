# 🚀 Module D: Migration & Testing Steps

## ✅ **Ready to Apply Migration**

All code is complete! Follow these steps to get Module D running.

---

## 📋 **Step-by-Step Guide**

### **Step 1: Apply Database Migration** (5 minutes)

#### **Option A: Using the Migration Script** (Recommended)

```bash
cd /Applications/ResonantGraphAI_FrontendV0.1
./APPLY_MODULE_D_MIGRATION.sh
```

This script will:
- ✅ Check current migration status
- ✅ Apply the migration automatically
- ✅ Verify it worked
- ✅ Restart the API container
- ✅ Test API health

#### **Option B: Manual Migration (Docker)**

```bash
cd /Applications/ResonantGraphAIV0.1

# Check if API container is running
docker compose ps api

# If not running, start it
docker compose up -d api

# Check current migration
docker compose exec api alembic current

# Apply migration
docker compose exec api alembic upgrade head

# Verify
docker compose exec api alembic current

# Should show: 20250102_0024 (head)

# Restart API to load new router
docker compose restart api
```

#### **Option C: Manual Migration (Local Python)**

```bash
cd /Applications/ResonantGraphAIV0.1/backend

# Activate virtual environment (if using one)
source venv/bin/activate  # or your venv path

# Check current migration
alembic current

# Apply migration
alembic upgrade head

# Verify
alembic current

# Should show: 20250102_0024 (head)
```

---

### **Step 2: Verify Migration Applied** (1 minute)

**Check database tables:**
```bash
# Using Docker
docker compose exec db psql -U postgres -d resonant -c "\dt agent_*"

# Or using local psql
psql -U your_user -d your_db -c "\dt agent_*"
```

**Expected tables:**
- ✅ `agent_teams`
- ✅ `agent_team_members`
- ✅ `agent_workflows`
- ✅ `agent_workflow_steps`
- ✅ `agent_conversations`

---

### **Step 3: Test Backend API** (2 minutes)

**1. Check API is running:**
```bash
curl http://localhost:8001/health
```

**Expected:** `{"status": "healthy"}` or similar

**2. Test agent-teams endpoint:**
```bash
# List teams (should return empty array initially)
curl -X GET http://localhost:8001/agent-teams \
  -H "Cookie: your-session-cookie" \
  -H "RG-Role: admin" \
  -H "Content-Type: application/json"
```

**Expected:** `200 OK` with `[]` (empty array)

**Or use a browser/Postman:**
- URL: `http://localhost:8001/agent-teams`
- Method: `GET`
- Headers: Include your auth cookies

---

### **Step 4: Test Frontend UI** (3 minutes)

**1. Start frontend dev server:**
```bash
cd /Applications/ResonantGraphAI_FrontendV0.1
npm run dev
```

**2. Navigate to Agent Teams page:**
```
http://localhost:5175/agent-teams
```

**What you should see:**
- ✅ Page loads without errors
- ✅ "Create Team" button visible
- ✅ Empty state message (if no teams exist)
- ✅ Or list of existing teams

**3. Check sidebar:**
- ✅ "Agent Teams" link should be visible
- ✅ Clicking it navigates to `/agent-teams`

---

### **Step 5: Create Test Data** (5 minutes)

**1. Create Agents (if needed):**
- Navigate to agents page (if you have one)
- Or use API: `POST /agents`
- Create at least 2 agents with different roles
- Example roles: "architect", "coder", "tester"

**2. Create Your First Team:**
- Click "Create Team" button
- Enter team name: "Test Code Review Team"
- Enter description (optional)
- Select 2+ agents from the list
- Choose workflow type: "Sequential"
- Click "Create Team"

**Expected:**
- ✅ Success toast message
- ✅ Team appears in the list
- ✅ Team card shows agent count

**3. Execute a Test Workflow:**
- Click on the team card
- Click "Execute Workflow" button
- Enter task: "Create a function to calculate fibonacci numbers"
- Optionally add project ID
- Click "Execute Workflow"

**Expected:**
- ✅ Workflow starts
- ✅ Conversation modal opens automatically
- ✅ Shows workflow status
- ✅ Shows step progress
- ✅ Agent messages appear as workflow progresses

**4. View Conversation:**
- Conversation modal should show:
  - ✅ Workflow status (running/completed)
  - ✅ Current step progress
  - ✅ Messages between agents
  - ✅ Agent responses
  - ✅ Real-time updates (polls every 5 seconds)

---

## 🐛 **Troubleshooting**

### **Migration Issues:**

**Error: "Can't locate revision identified by '20250102_0024'"**
- Check migration file exists: `backend/fastapi_app/alembic/versions/20250102_0024_create_agent_teams.py`
- Verify previous migration exists: `20250102_0023`
- Check alembic.ini is configured correctly

**Error: "Target database is not up to date"**
- Check current version: `alembic current`
- May need to apply previous migrations first
- Try: `alembic upgrade head`

**Error: "Table already exists"**
- Migration may have been partially applied
- Check database: `\dt agent_*` in psql
- May need to manually clean up or rollback first

### **Backend API Issues:**

**Error: "Router not found" or "404 on /agent-teams"**
- Verify router is registered in `main.py`
- Check import: `from fastapi_app.routers import agent_teams`
- Verify line: `app.include_router(agent_teams.router)`
- Restart backend server

**Error: "Module not found: agent_teams"**
- Check file exists: `backend/fastapi_app/routers/agent_teams.py`
- Verify imports are correct
- Restart backend server

**Error: "Permission denied" or "401 Unauthorized"**
- Check authentication cookies are set
- Verify user has appropriate role/permissions
- Check organization context is correct

### **Frontend Issues:**

**Error: "Page not found" or "404"**
- Check router: `/agent-teams` route exists in `router/index.tsx`
- Verify component imports are correct
- Check browser console for errors

**Error: "No agents available"**
- Create agents first using `/agents` endpoint
- Check agents API is working
- Verify agents belong to your organization

**Error: "Failed to load teams"**
- Check browser console for errors
- Verify backend API is accessible
- Check network tab for failed requests
- Verify authentication is working

---

## ✅ **Success Checklist**

You'll know everything works when:

1. ✅ Migration applies without errors
2. ✅ `alembic current` shows `20250102_0024`
3. ✅ Database has 5 new `agent_*` tables
4. ✅ Backend starts without errors
5. ✅ `curl http://localhost:8001/agent-teams` returns 200 OK
6. ✅ Frontend page loads at `/agent-teams`
7. ✅ Can create a team successfully
8. ✅ Can execute a workflow
9. ✅ Can view conversation in real-time

---

## 🎯 **Quick Commands Reference**

```bash
# Apply migration (Docker)
docker compose exec api alembic upgrade head

# Check migration status
docker compose exec api alembic current

# Test API
curl http://localhost:8001/agent-teams

# Start frontend
cd /Applications/ResonantGraphAI_FrontendV0.1 && npm run dev

# View tables
docker compose exec db psql -U postgres -d resonant -c "\dt agent_*"
```

---

## 📚 **Additional Resources**

- **Migration Guide:** `MODULE_D_MIGRATION_GUIDE.md`
- **Testing Guide:** `MODULE_D_TESTING_GUIDE.md`
- **Complete Documentation:** `MODULE_D_COMPLETE.md`

---

## 🎉 **Ready to Go!**

Follow the steps above to get Module D fully operational!

**All code is complete and ready for testing!** ✅

