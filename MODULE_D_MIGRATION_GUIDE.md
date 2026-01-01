# 🚀 Module D: Database Migration Guide

## ✅ **Migration Ready to Apply**

The database migration for Module D (Multi-Agent Teams) is ready to be applied.

### **Migration File:**
- `/Applications/ResonantGraphAIV0.1/backend/fastapi_app/alembic/versions/20250102_0024_create_agent_teams.py`

### **Migration Details:**
- **Revision ID:** `20250102_0024`
- **Revises:** `20250102_0023`
- **Creates 5 Tables:**
  1. `agent_teams`
  2. `agent_team_members`
  3. `agent_workflows`
  4. `agent_workflow_steps`
  5. `agent_conversations`

---

## 📋 **Steps to Apply Migration**

### **Option 1: Using Alembic Directly**

```bash
cd /Applications/ResonantGraphAIV0.1/backend

# Check current migration version
python3 -m alembic current

# Check available migrations
python3 -m alembic heads

# Apply migration
python3 -m alembic upgrade head
```

### **Option 2: Using Docker (if backend runs in Docker)**

```bash
cd /Applications/ResonantGraphAIV0.1

# If using docker-compose
docker-compose exec backend alembic upgrade head

# Or if using Docker directly
docker exec -it <container_name> alembic upgrade head
```

### **Option 3: Using Makefile (if available)**

```bash
cd /Applications/ResonantGraphAIV0.1/backend
make migrate
# or
make upgrade
```

---

## ✅ **Verify Migration**

After applying the migration, verify it worked:

```bash
# Check current migration version (should show 20250102_0024)
python3 -m alembic current

# Or check database directly
psql -U <user> -d <database> -c "\dt agent_*"
```

Expected tables:
- ✅ `agent_teams`
- ✅ `agent_team_members`
- ✅ `agent_workflows`
- ✅ `agent_workflow_steps`
- ✅ `agent_conversations`

---

## 🔄 **Rollback (if needed)**

If you need to rollback the migration:

```bash
cd /Applications/ResonantGraphAIV0.1/backend
python3 -m alembic downgrade 20250102_0023
```

---

## 🧪 **Test After Migration**

### **1. Test Backend API**

```bash
# Start backend server
cd /Applications/ResonantGraphAIV0.1/backend
# ... start your backend ...

# Test endpoint
curl -X GET http://localhost:8001/agent-teams \
  -H "Cookie: session=..." \
  -H "RG-Role: admin"
```

### **2. Test Frontend**

```bash
# Start frontend
cd /Applications/ResonantGraphAI_FrontendV0.1
npm run dev

# Navigate to:
# http://localhost:5175/agent-teams
```

---

## 📊 **What Gets Created**

### **Tables:**
- ✅ `agent_teams` - Team configuration
- ✅ `agent_team_members` - Agents in teams
- ✅ `agent_workflows` - Workflow executions
- ✅ `agent_workflow_steps` - Individual steps
- ✅ `agent_conversations` - Agent messages

### **Indexes:**
- ✅ 15+ indexes for performance
- ✅ Foreign key constraints
- ✅ CASCADE deletes

---

## 🚨 **Troubleshooting**

### **Error: "Target database is not up to date"**
```bash
# Check current version
python3 -m alembic current

# Upgrade to latest
python3 -m alembic upgrade head
```

### **Error: "Can't locate revision identified by '20250102_0024'"**
- Make sure migration file exists
- Check file path: `backend/fastapi_app/alembic/versions/20250102_0024_create_agent_teams.py`
- Verify alembic.ini is configured correctly

### **Error: "Table already exists"**
- Migration may have been partially applied
- Check database state: `\dt agent_*`
- May need to manually clean up or rollback first

---

## ✅ **Next Steps After Migration**

1. ✅ **Verify Migration Applied**
   ```bash
   python3 -m alembic current
   ```

2. ✅ **Test Backend API**
   - Start backend server
   - Test `/agent-teams` endpoints

3. ✅ **Test Frontend UI**
   - Start frontend dev server
   - Navigate to `/agent-teams`
   - Create a test team

4. ✅ **Ready for Module F**
   - Module D is complete!
   - Can start Module F (Marketplace) when ready

---

**Migration is ready to apply!** 🚀

