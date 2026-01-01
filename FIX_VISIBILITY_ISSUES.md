# 🔧 FIXING VISIBILITY ISSUES

## 🚨 MAIN PROBLEM: Backend Not Running

Your console shows:
```
Could not connect to the server
http://localhost:8001/code/project/files
http://localhost:8001/git/status
```

**The backend Docker containers are not running!**

---

## ✅ FIX STEPS

### 1. Start Backend Docker

```bash
cd /Applications/ResonantGraphAIV0.1
docker-compose up -d
```

Wait 30 seconds, then check:
```bash
docker-compose ps
```

All services should show "Up" status.

---

### 2. Hard Refresh Browser

After backend is running:
- **Mac**: `Cmd + Shift + R`
- **Windows**: `Ctrl + Shift + R`

---

### 3. What You Should See After Fix

#### File Tree Header (Left Sidebar)
- ✅ "Explorer" text on left
- ✅ **New File** button (+ icon)
- ✅ **New Folder** button (folder icon)
- ✅ **Clear Project** button (X icon) - only if project loaded

#### Top Bar (Above Editor)
- ✅ **Model Selector** dropdown ("Auto", "ChatGPT", etc.)
- ✅ **Settings** icon (gear) on right

#### Terminal
- ✅ Terminal panel at bottom
- ✅ **+** button to add new terminal tabs

---

## 🔍 VERIFICATION

### Check Backend is Running:
```bash
curl http://localhost:8001/health
```

Should return: `{"status":"ok"}`

### Check Frontend:
- Open: `http://localhost:5175/ide`
- Hard refresh: `Cmd+Shift+R`
- Check console (F12) - should have NO red errors

---

## 📝 CSS FIXES APPLIED

1. ✅ File tree header: Added `justify-content: space-between !important`
2. ✅ Header buttons: Added proper CSS classes
3. ✅ Model Selector Bar: Integrated into layout

---

## ⚠️ IF STILL NOT VISIBLE

1. **Check Browser Console (F12)**
   - Look for React errors
   - Look for CSS errors

2. **Check Network Tab**
   - Verify backend is responding
   - Check for 404/500 errors

3. **Clear Browser Cache**
   - Chrome: Settings → Privacy → Clear browsing data
   - Or use Incognito mode

4. **Restart Dev Server**
   ```bash
   cd /Applications/ResonantGraphAI_FrontendV0.1
   pkill -f 'vite'
   npm run dev
   ```

---

**The main issue is the backend not running. Once that's fixed, the UI should work!**

