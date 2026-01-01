# 🗑️ Clear Old Project Data - Complete Guide

## ⚠️ **Problem**

The chat is still pulling old project data from Hash Sphere memory instead of using the current project.

---

## 🧹 **Solution: Clear All Old Data**

### **Method 1: Clear Frontend Cache (Quick Fix)**

**Open browser console and run:**

```javascript
// Clear all IDE-related localStorage
localStorage.removeItem('ide-project-id');
localStorage.removeItem('ide-chat-messages');
localStorage.removeItem('ide-chat-history');
localStorage.removeItem('resonant-chat-messages');
localStorage.removeItem('resonant-chat-history');

// Clear all sessionStorage
sessionStorage.clear();

// Clear all localStorage (nuclear option)
// localStorage.clear();

console.log('✅ Frontend cache cleared!');
```

**Or use this one-liner:**
```javascript
['ide-project-id', 'ide-chat-messages', 'ide-chat-history', 'resonant-chat-messages', 'resonant-chat-history'].forEach(k => localStorage.removeItem(k)); sessionStorage.clear(); console.log('✅ Cache cleared!');
```

---

### **Method 2: Clear Backend Hash Sphere Memory**

**Connect to PostgreSQL database and run:**

```sql
-- Replace 'your-org-id' with your actual organization ID
-- You can find it in browser DevTools → Application → Cookies → rg-org-id

-- Clear Hash Sphere memory anchors
DELETE FROM memory_anchors WHERE org_id = 'your-org-id';

-- Clear Hash Sphere clusters
DELETE FROM resonance_clusters WHERE org_id = 'your-org-id';

-- Clear RAG memories
DELETE FROM memories WHERE org_id = 'your-org-id';

-- Clear chat history
DELETE FROM conversations WHERE org_id = 'your-org-id';
DELETE FROM messages WHERE org_id = 'your-org-id';

-- Clear code chunks (if you want to clear all indexed code)
DELETE FROM code_chunks WHERE org_id = 'your-org-id';
DELETE FROM code_files WHERE org_id = 'your-org-id';

-- Verify deletion
SELECT COUNT(*) FROM memory_anchors WHERE org_id = 'your-org-id';
SELECT COUNT(*) FROM memories WHERE org_id = 'your-org-id';
```

---

### **Method 3: Clear Project Files from Filesystem**

**Delete old project files:**

```bash
# Find your organization ID (check browser cookies or database)
ORG_ID="your-org-id"

# Delete all projects for this org
rm -rf /tmp/resonant_projects/${ORG_ID}/*

# Or delete specific project
PROJECT_ID="old-project-id"
rm -rf /tmp/resonant_projects/${ORG_ID}/${PROJECT_ID}

# Verify deletion
ls -la /tmp/resonant_projects/${ORG_ID}/
```

---

### **Method 4: Automated Cleanup Script**

**Create and run this script:**

```bash
#!/bin/bash
# clear_old_projects.sh

echo "🧹 Clearing old project data..."

# Get org ID from environment or prompt
ORG_ID=${1:-"default-org"}

# Clear filesystem
echo "📁 Clearing project files..."
rm -rf /tmp/resonant_projects/${ORG_ID}/*

# Clear database (requires psql access)
echo "🗄️  Clearing database..."
psql -U your_user -d your_database <<EOF
DELETE FROM memory_anchors WHERE org_id = '${ORG_ID}';
DELETE FROM resonance_clusters WHERE org_id = '${ORG_ID}';
DELETE FROM memories WHERE org_id = '${ORG_ID}';
DELETE FROM conversations WHERE org_id = '${ORG_ID}';
DELETE FROM messages WHERE org_id = '${ORG_ID}';
EOF

echo "✅ Cleanup complete!"
```

---

## 🔍 **Find Your Organization ID**

**Method 1: Browser DevTools**
1. Open DevTools (F12)
2. Go to Application → Cookies
3. Look for `rg-org-id` cookie
4. Copy the value

**Method 2: Database Query**
```sql
SELECT DISTINCT org_id FROM memory_anchors;
SELECT DISTINCT org_id FROM memories;
```

**Method 3: Check Backend Logs**
- Look for `RG-Org-ID` header in backend logs
- Or check user session data

---

## ✅ **After Clearing**

1. **Refresh the browser** (hard refresh: `Cmd/Ctrl + Shift + R`)
2. **Re-upload your current project** to IDE
3. **Test chat** - it should now use only current project

---

## 🛡️ **Prevent Future Issues**

**The fix we implemented:**
- ✅ Uses `use_rag: true` to avoid Hash Sphere memory
- ✅ Clears `previousMessages: []` to avoid old context
- ✅ Adds explicit project context in every message
- ✅ Uses project-specific `chatId`

**But if old data persists:**
1. Clear cache using Method 1 above
2. Clear database using Method 2
3. Restart backend server
4. Refresh frontend

---

## 📝 **Quick Reference**

| What to Clear | Where | Command |
|--------------|-------|---------|
| **Frontend Cache** | Browser localStorage | `localStorage.clear()` |
| **Hash Sphere Memory** | PostgreSQL `memory_anchors` | `DELETE FROM memory_anchors WHERE org_id = '...'` |
| **RAG Memories** | PostgreSQL `memories` | `DELETE FROM memories WHERE org_id = '...'` |
| **Project Files** | `/tmp/resonant_projects/` | `rm -rf /tmp/resonant_projects/{org_id}/*` |
| **Chat History** | PostgreSQL `conversations`, `messages` | `DELETE FROM conversations WHERE org_id = '...'` |

---

**After clearing, your chat will only use the current project!** 🎉

