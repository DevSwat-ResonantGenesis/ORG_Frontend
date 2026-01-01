# 📁 Old Files Storage & Hash Sphere Memory Guide

## 🔍 **Why Chat Uses Old Files**

The chat uses **Hash Sphere memory system** which stores:
1. **Old project files** - From previous projects you worked on
2. **Code patterns** - Code snippets and patterns from past projects
3. **Memory anchors** - Semantic memories of your work
4. **Conversation history** - All past conversations

This is why the chat might reference old files even when you're working on a new project.

---

## 📍 **Where Old Files Are Stored**

### **1. Project Files (Backend Filesystem)**

**Location:** `/tmp/resonant_projects/{org_id}/{project_id}/`

**Example:**
```
/tmp/resonant_projects/
  └── your-org-id/
      ├── project-abc123/
      │   ├── src/
      │   ├── package.json
      │   └── ...
      ├── project-def456/
      │   ├── app/
      │   └── ...
      └── project-ghi789/
          └── ...
```

**What's stored:**
- All uploaded project files
- All files you created/modified
- Project structure

**How to find:**
```bash
# On your local machine (if backend is local)
ls -la /tmp/resonant_projects/

# In Docker container
docker exec -it resonantgraphaiv01-api-1 ls -la /tmp/resonant_projects/
```

---

### **2. Hash Sphere Memory (Database)**

**Location:** PostgreSQL database (`resonant` database)

**Tables:**
- `memory_anchors` - Stores code patterns, project memories
- `code_files` - Indexed file metadata
- `code_chunks` - Code chunks with Hash Sphere hashes
- `resonant_chat_messages` - All chat messages

**What's stored:**
- Code patterns from old projects
- Semantic hashes of your code
- Memory anchors linking related code
- Conversation history

**How it works:**
- When you upload a project, files are indexed
- Code chunks are hashed and stored
- Hash Sphere creates memory anchors
- These anchors are used to find similar code

---

### **3. Frontend Local Storage**

**Location:** Browser localStorage

**What's stored:**
- `ide-project-id` - Current project ID
- `resonant_ide_chat_messages` - Chat messages
- Project preferences

**How to clear:**
```javascript
// In browser console
localStorage.removeItem('ide-project-id');
localStorage.removeItem('resonant_ide_chat_messages');
```

---

## 🗑️ **How to Delete Old Files**

### **Option 1: Delete Project Files (Backend)**

**Via Backend API:**
```bash
# Delete entire project
curl -X DELETE http://localhost:8001/code/project/{project_id}
```

**Via Filesystem:**
```bash
# Delete project folder
rm -rf /tmp/resonant_projects/{org_id}/{project_id}

# Delete all projects for your org
rm -rf /tmp/resonant_projects/{org_id}/*
```

**In Docker:**
```bash
docker exec -it resonantgraphaiv01-api-1 rm -rf /tmp/resonant_projects/{org_id}/{project_id}
```

---

### **Option 2: Clear Hash Sphere Memory**

**Delete Memory Anchors:**
```bash
# Via API (if endpoint exists)
curl -X DELETE http://localhost:8001/hash-sphere/anchors/{anchor_id}

# Or delete all for your org
curl -X DELETE http://localhost:8001/hash-sphere/anchors?org_id={org_id}
```

**Delete Code Indexes:**
```bash
# Delete indexed files
curl -X DELETE http://localhost:8001/code/index/{project_id}
```

**Via Database:**
```sql
-- Connect to database
psql -h localhost -p 5433 -U postgres -d resonant

-- Delete memory anchors for your org
DELETE FROM memory_anchors WHERE org_id = 'your-org-id';

-- Delete code files
DELETE FROM code_files WHERE org_id = 'your-org-id';

-- Delete code chunks
DELETE FROM code_chunks WHERE org_id = 'your-org-id';
```

---

### **Option 3: Clear Chat History**

**Frontend:**
- Click "Clear Chat" button in chat panel
- Or manually clear localStorage

**Backend:**
```sql
-- Delete chat messages
DELETE FROM resonant_chat_messages WHERE org_id = 'your-org-id';
```

---

## 🔧 **Why Chat Still Uses Old Files**

### **The Problem:**

Even though we added explicit project context, Hash Sphere memory can still pull old data because:

1. **Semantic Matching** - Hash Sphere finds similar code patterns
2. **Memory Anchors** - Old project anchors are still active
3. **Resonance Search** - Similar code from old projects appears

### **The Fix (Already Applied):**

We added explicit project context in chat messages:
```typescript
[CRITICAL: You MUST use ONLY the CURRENT project files listed below. 
Ignore any old project data from memory.]

CURRENT PROJECT ID: {projectId}
Current project has {count} files:
- file1.ts
- file2.ts
...
```

But Hash Sphere might still find old patterns.

---

## ✅ **Best Practices**

### **1. Use Project-Specific Chat IDs**

✅ **Already implemented:**
- Each project gets its own `chatId`: `ide-project-{projectId}`
- This isolates conversations per project

### **2. Clear Old Projects Regularly**

**When to delete:**
- Projects you no longer need
- Test projects
- Old versions of projects

**How to delete:**
1. Delete project files: `rm -rf /tmp/resonant_projects/{org_id}/{project_id}`
2. Delete from database: `DELETE FROM code_files WHERE project_id = '{project_id}'`
3. Clear chat history for that project

### **3. Use Explicit Project Context**

✅ **Already implemented:**
- Chat always includes current project ID
- Lists current project files
- Tells AI to ignore old data

---

## 🎯 **Quick Fix: Clear Everything**

### **Complete Reset:**

```bash
# 1. Stop backend
cd /Applications/ResonantGraphAIV0.1
docker compose down

# 2. Delete all project files
rm -rf /tmp/resonant_projects/*

# 3. Clear database (CAUTION: This deletes ALL data)
docker exec -it resonantgraphaiv01-db-1 psql -U postgres -d resonant -c "
  DELETE FROM memory_anchors;
  DELETE FROM code_files;
  DELETE FROM code_chunks;
  DELETE FROM resonant_chat_messages;
"

# 4. Clear frontend localStorage
# Open browser console and run:
localStorage.clear();

# 5. Restart backend
docker compose up -d
```

---

## 📊 **Understanding Storage Locations**

| Storage Type | Location | What's Stored | How to Clear |
|-------------|----------|---------------|--------------|
| **Project Files** | `/tmp/resonant_projects/` | Actual file contents | Delete folder |
| **Hash Sphere Memory** | PostgreSQL `memory_anchors` | Code patterns, hashes | Delete from DB |
| **Code Indexes** | PostgreSQL `code_files`, `code_chunks` | Indexed file metadata | Delete from DB |
| **Chat History** | PostgreSQL `resonant_chat_messages` | All conversations | Delete from DB |
| **Frontend Cache** | Browser localStorage | Current project ID, messages | Clear localStorage |

---

## 🔍 **Check What's Stored**

### **List All Projects:**
```bash
# List project folders
ls -la /tmp/resonant_projects/{org_id}/

# In Docker
docker exec -it resonantgraphaiv01-api-1 ls -la /tmp/resonant_projects/
```

### **Check Database:**
```sql
-- List all projects
SELECT DISTINCT project_id FROM code_files;

-- List memory anchors
SELECT anchor_text, anchor_type FROM memory_anchors LIMIT 10;

-- Count stored items
SELECT 
  (SELECT COUNT(*) FROM memory_anchors) as anchors,
  (SELECT COUNT(*) FROM code_files) as files,
  (SELECT COUNT(*) FROM code_chunks) as chunks;
```

---

## 💡 **Recommendations**

### **For Development:**
1. **Keep old projects** - Useful for reference
2. **Use project-specific chat** - Already implemented ✅
3. **Clear test projects** - Delete when done testing

### **For Production:**
1. **Archive old projects** - Move to archive folder
2. **Regular cleanup** - Delete unused projects monthly
3. **Database maintenance** - Clean old memory anchors

---

## 🚀 **Summary**

**Old files are stored in:**
1. ✅ `/tmp/resonant_projects/` - Project files (filesystem)
2. ✅ PostgreSQL database - Hash Sphere memory, indexes
3. ✅ Browser localStorage - Frontend cache

**To clear old files:**
1. Delete project folders: `rm -rf /tmp/resonant_projects/{org_id}/{project_id}`
2. Delete from database: SQL DELETE queries
3. Clear localStorage: `localStorage.clear()`

**The chat fix:**
- ✅ Already uses current project context
- ✅ Project-specific chat IDs
- ✅ Explicit instructions to ignore old data

**You don't need to delete old files** - The chat should now prioritize current project. But if you want a clean slate, use the commands above!

