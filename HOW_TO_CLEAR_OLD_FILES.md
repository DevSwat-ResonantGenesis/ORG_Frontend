# 🗑️ How to Clear Old Files - Quick Guide

## 🔍 **Why Chat Uses Old Files**

The chat uses **Hash Sphere memory** which stores:
- ✅ Old project files from previous projects
- ✅ Code patterns and snippets
- ✅ Memory anchors (semantic memories)
- ✅ Conversation history

Even though we added explicit project context, Hash Sphere can still find similar patterns from old projects.

---

## 📍 **Where Old Files Are Located**

### **1. Project Files (Backend Filesystem)**

**Location:** `/tmp/resonant_projects/{org_id}/{project_id}/`

**Example Path:**
```
/tmp/resonant_projects/
  └── your-org-id-here/
      ├── project-abc123/
      │   ├── src/
      │   ├── package.json
      │   └── ...
      ├── project-def456/
      └── project-ghi789/
```

**To Find Your Projects:**
```bash
# Check if backend is running locally
ls -la /tmp/resonant_projects/

# Or in Docker container
docker exec -it resonantgraphaiv01-api-1 ls -la /tmp/resonant_projects/
```

---

### **2. Hash Sphere Memory (Database)**

**Location:** PostgreSQL database

**Tables:**
- `memory_anchors` - Code patterns, project memories
- `code_files` - Indexed file metadata  
- `code_chunks` - Code chunks with hashes
- `resonant_chat_messages` - Chat history

**This is why chat remembers old projects!**

---

## 🗑️ **How to Delete Old Files**

### **Option 1: Delete Specific Project**

**Via Filesystem:**
```bash
# Delete one project
rm -rf /tmp/resonant_projects/{your-org-id}/{project-id}

# In Docker
docker exec -it resonantgraphaiv01-api-1 rm -rf /tmp/resonant_projects/{org-id}/{project-id}
```

**Via Database:**
```sql
-- Connect to database
docker exec -it resonantgraphaiv01-db-1 psql -U postgres -d resonant

-- Delete project data
DELETE FROM code_files WHERE project_id = 'your-project-id';
DELETE FROM code_chunks WHERE file_id IN (SELECT id FROM code_files WHERE project_id = 'your-project-id');
```

---

### **Option 2: Delete ALL Old Projects**

**⚠️ WARNING: This deletes everything!**

```bash
# 1. Stop backend
cd /Applications/ResonantGraphAIV0.1
docker compose down

# 2. Delete all project files
rm -rf /tmp/resonant_projects/*

# 3. Clear database (CAUTION!)
docker exec -it resonantgraphaiv01-db-1 psql -U postgres -d resonant << EOF
DELETE FROM memory_anchors;
DELETE FROM code_chunks;
DELETE FROM code_files;
DELETE FROM resonant_chat_messages;
EOF

# 4. Clear frontend cache
# Open browser console and run:
localStorage.clear();

# 5. Restart backend
docker compose up -d
```

---

### **Option 3: Clear Only Hash Sphere Memory (Keep Files)**

**If you want to keep project files but clear memory:**

```sql
-- Connect to database
docker exec -it resonantgraphaiv01-db-1 psql -U postgres -d resonant

-- Delete only memory anchors (keeps project files)
DELETE FROM memory_anchors WHERE org_id = 'your-org-id';

-- Or delete all anchors
DELETE FROM memory_anchors;
```

---

## ✅ **What We Already Fixed**

The chat now:
1. ✅ Uses project-specific chat IDs (`ide-project-{projectId}`)
2. ✅ Includes explicit project context in every message
3. ✅ Tells AI to ignore old project data
4. ✅ Limits code context to 300 characters

**But Hash Sphere memory can still find similar patterns!**

---

## 🎯 **Recommendations**

### **For Development:**
- **Keep old projects** - Useful for reference
- **Clear test projects** - Delete when done
- **Use project-specific chat** - Already working ✅

### **If Chat Still Uses Old Files:**
1. **Clear Hash Sphere memory** (Option 3 above)
2. **Or delete specific old projects** (Option 1)
3. **Or start fresh** (Option 2)

---

## 🔍 **Check What's Stored**

### **List All Projects:**
```bash
# List project folders
ls -la /tmp/resonant_projects/{your-org-id}/

# In Docker
docker exec -it resonantgraphaiv01-api-1 ls -la /tmp/resonant_projects/
```

### **Check Database:**
```sql
-- List all projects
SELECT DISTINCT project_id FROM code_files;

-- Count stored items
SELECT 
  (SELECT COUNT(*) FROM memory_anchors) as anchors,
  (SELECT COUNT(*) FROM code_files) as files,
  (SELECT COUNT(*) FROM code_chunks) as chunks;
```

---

## 💡 **Quick Answer**

**Where are old files?**
- Filesystem: `/tmp/resonant_projects/{org_id}/{project_id}/`
- Database: PostgreSQL `memory_anchors`, `code_files`, `code_chunks`

**Do you need to delete them?**
- **No** - The chat should now prioritize current project
- **Yes** - If you want a completely clean slate

**How to delete?**
- **One project:** `rm -rf /tmp/resonant_projects/{org_id}/{project_id}`
- **All projects:** `rm -rf /tmp/resonant_projects/*`
- **Memory only:** `DELETE FROM memory_anchors;` in database

---

**The chat fix should work, but if old files still appear, use the commands above to clear them!** 🚀

