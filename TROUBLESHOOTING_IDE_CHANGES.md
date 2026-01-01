# 🔧 Troubleshooting: IDE Changes Not Showing

## Quick Fixes

### 1. Hard Refresh Browser
- **Mac**: `Cmd + Shift + R`
- **Windows/Linux**: `Ctrl + Shift + R`
- Or: Open DevTools (F12) → Right-click refresh button → "Empty Cache and Hard Reload"

### 2. Check Browser Console
- Open DevTools (F12)
- Check Console tab for errors
- Check Network tab for failed requests

### 3. Restart Dev Server
```bash
cd /Applications/ResonantGraphAI_FrontendV0.1
# Kill existing server
pkill -f 'vite'
# Restart
npm run dev
```

### 4. Clear Browser Cache
- Chrome: Settings → Privacy → Clear browsing data → Cached images and files
- Or use Incognito/Private mode

## Verify Changes Are Loaded

1. **Check if files are updated:**
   ```bash
   grep -n "GitPanel" src/components/IDE/CursorIDELayout.tsx
   grep -n "CommandPalette" src/components/IDE/CursorIDELayout.tsx
   ```

2. **Check dev server is running:**
   ```bash
   lsof -ti:5175
   ```

3. **Check for compilation errors:**
   - Look at terminal where `npm run dev` is running
   - Check for red error messages

## What Should You See?

When visiting `http://localhost:5175/ide`, you should see:

1. **File Explorer** (left sidebar) with:
   - Git status indicators (M, A, D dots)
   - Right-click context menu
   - New File/New Folder buttons

2. **Command Palette** (Cmd+K or Cmd+P):
   - Press `Cmd+K` for commands
   - Press `Cmd+P` for file search

3. **Git Panel** (click Git icon in sidebar):
   - Staged Changes section
   - Changes section
   - Individual stage/unstage buttons

4. **Diff Viewer** (when refactoring):
   - Side-by-side comparison
   - File tabs for multi-file diffs

## Still Not Working?

1. Check terminal for errors
2. Check browser console (F12)
3. Try incognito mode
4. Restart dev server
5. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run dev
   ```

