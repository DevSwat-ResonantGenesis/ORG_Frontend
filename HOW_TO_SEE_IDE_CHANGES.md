# 🔍 HOW TO SEE THE NEW IDE CHANGES

## ⚠️ IMPORTANT: Hard Refresh First!

**Before testing, do a HARD REFRESH:**
- **Mac**: `Cmd + Shift + R`
- **Windows/Linux**: `Ctrl + Shift + R`
- Or: Open DevTools (F12) → Right-click refresh → "Empty Cache and Hard Reload"

---

## ✅ WHAT TO TEST

### 1. **Command Palette (Cmd+K / Cmd+P)**

**How to see it:**
1. Go to `http://localhost:5175/ide`
2. Press `Cmd+K` (Mac) or `Ctrl+K` (Windows)
3. **You should see:** A command palette popup with search box
4. Press `Cmd+P` (Mac) or `Ctrl+P` (Windows)
5. **You should see:** File search mode (shows file icon in search box)

**If it doesn't work:**
- Check browser console (F12) for errors
- Make sure you're not typing in an input field
- Try clicking on the page first, then press Cmd+K

---

### 2. **File Tree with Git Status**

**How to see it:**
1. Go to `http://localhost:5175/ide`
2. Upload a project (click "Upload Project ZIP")
3. **You should see:**
   - File tree on the left
   - Right-click context menu (New File, Rename, Delete)
   - Git status dots (M, A, D) next to files (if git repo exists)

**If you don't see git status:**
- Git status only shows if:
  - Project is loaded
  - Git repository is initialized
  - Files have changes

---

### 3. **Git Panel**

**How to see it:**
1. Go to `http://localhost:5175/ide`
2. Upload a project
3. Click the **Git icon** in the left sidebar (4th icon from top)
4. **You should see:**
   - "Staged Changes" section (if files are staged)
   - "Changes" section (unstaged files)
   - Individual stage/unstage buttons (+ and -)
   - Branch management
   - Commit section

**If you don't see it:**
- Make sure a project is loaded
- Git panel only shows when Git icon is clicked
- If no git repo, you'll see "Initialize Repository" button

---

### 4. **Diff Viewer**

**How to see it:**
1. Go to `http://localhost:5175/ide`
2. Upload a project
3. Open a file
4. Use refactoring feature (if available)
5. **You should see:** Side-by-side diff view

**Note:** Diff viewer only appears when refactoring or viewing AI changes

---

## 🔧 TROUBLESHOOTING

### If you see the OLD IDE (with "💻 IDE Mode" header):
- You're looking at the wrong page
- Make sure you're at `http://localhost:5175/ide`
- NOT the inline IDE in Resonant Chat

### If Command Palette doesn't open:
1. Check browser console (F12) for errors
2. Make sure keyboard shortcuts aren't blocked
3. Try clicking on the page first
4. Check if another app is using Cmd+K

### If Git Panel doesn't show:
1. Make sure you clicked the Git icon in sidebar
2. Make sure a project is loaded
3. Check browser console for errors

### If File Tree doesn't show git status:
1. Upload a project first
2. Initialize git repo (click Git icon → Initialize Repository)
3. Make some changes to files
4. Git status will appear

---

## 📋 QUICK CHECKLIST

- [ ] Hard refreshed browser (Cmd+Shift+R)
- [ ] At correct URL: `http://localhost:5175/ide`
- [ ] Command Palette opens with Cmd+K
- [ ] File search works with Cmd+P
- [ ] Git icon visible in sidebar
- [ ] Git Panel opens when clicking Git icon
- [ ] File tree shows right-click menu
- [ ] New File/New Folder buttons in file tree header

---

## 🚨 STILL NOT WORKING?

1. **Check Terminal:**
   - Look at the terminal where `npm run dev` is running
   - Check for red error messages

2. **Check Browser Console:**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

3. **Restart Dev Server:**
   ```bash
   # Kill existing server
   pkill -f 'vite'
   # Restart
   cd /Applications/ResonantGraphAI_FrontendV0.1
   npm run dev
   ```

4. **Clear Everything:**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run dev
   ```

---

## ✅ VERIFICATION COMMANDS

Run these to verify files are updated:

```bash
# Check CommandPalette is imported
grep -n "CommandPalette" src/components/IDE/CursorIDELayout.tsx

# Check GitPanel is imported
grep -n "GitPanel" src/components/IDE/CursorIDELayout.tsx

# Check git status integration
grep -n "getGitStatus" src/components/IDE/CursorIDELayout.tsx
```

All should return results if changes are saved!

