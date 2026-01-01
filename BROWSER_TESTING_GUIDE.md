# 🌐 Browser Testing Guide - All 6 Next-Gen Modules

**Date:** 2025-12-04  
**Status:** ✅ **READY FOR BROWSER TESTING**

---

## 🚀 Quick Start

1. **Start Services:**
   ```bash
   # Backend
   cd /Applications/ResonantGraphAIV0.1
   docker compose up -d
   
   # Frontend
   cd /Applications/ResonantGraphAI_FrontendV0.1
   npm run dev
   ```

2. **Open IDE:**
   - Navigate to: `http://localhost:5175/ide`
   - Login if required

3. **Upload a Test Project:**
   - Click "Upload Project ZIP"
   - Upload a sample project (TypeScript/Python recommended)

---

## 🧪 Module Testing Instructions

### Module 1: Real-time Collaboration 👥

**Test Steps:**
1. Open IDE in **two different browser windows** (or incognito)
2. Upload/load the same project in both
3. Open the same file in both windows
4. Click 👥 button in toolbar (or use command palette)
5. Type in one window
6. **Expected:** Changes appear in real-time in the other window
7. Check collaboration panel for user presence indicators

**Success Criteria:**
- ✅ Changes sync in real-time
- ✅ User cursors visible
- ✅ No conflicts or data loss

---

### Module 2: Code Search 🔍

**Test Steps:**
1. Click 🔍 button in toolbar (or press `Cmd+Shift+F`)
2. Type a search query (e.g., "function", "class", "import")
3. **Expected:** Results appear with file paths and line numbers
4. Click a result
5. **Expected:** File opens and navigates to the line
6. Test different search types:
   - Grep search (exact match)
   - Semantic search (AI-powered)
   - Hybrid search (combined)

**Success Criteria:**
- ✅ Search results appear quickly
- ✅ Results are relevant
- ✅ Navigation works correctly
- ✅ Multiple search modes work

---

### Module 3: GitHub Sync 🐙

**Prerequisites:**
- GitHub OAuth configured (see `CONFIGURATION_GUIDE.md`)
- GitHub account with repositories

**Test Steps:**
1. Click 🐙 button in toolbar
2. Click "Connect GitHub"
3. **Expected:** Redirects to GitHub OAuth
4. Authorize the application
5. **Expected:** Redirects back to IDE
6. Test features:
   - **Clone:** Enter repo URL, click Clone
   - **Pull:** Click Pull button
   - **Push:** Make changes, click Push
   - **List Repos:** View your repositories

**Success Criteria:**
- ✅ OAuth flow completes
- ✅ Repositories list loads
- ✅ Clone works
- ✅ Pull/Push operations succeed

---

### Module 4: IntelliSense 💡

**Prerequisites:**
- TypeScript LSP installed: `npm install -g typescript-language-server`
- Python LSP installed: `pip install python-lsp-server` (already in Docker)

**Test Steps:**
1. Open a TypeScript file (`.ts` or `.tsx`)
2. Start typing code
3. **Expected:** Auto-completion suggestions appear
4. Hover over a symbol (variable, function, class)
5. **Expected:** Tooltip with definition/info appears
6. Right-click → "Go to Definition"
7. **Expected:** Navigates to symbol definition
8. Test with Python files (`.py`)
9. **Expected:** Same IntelliSense features work

**Success Criteria:**
- ✅ Auto-completion appears
- ✅ Hover tooltips work
- ✅ Go to Definition works
- ✅ Works for multiple languages

---

### Module 5: Multi-LLM Router 🤖

**Test Steps:**
1. Select different models from dropdown:
   - GPT-4.1
   - GPT-4.1-mini
   - Gemini-Pro
   - Groq Mixtral
   - Auto
2. Make an AI request (chat, code generation, etc.)
3. **Expected:** Request routes to selected model
4. Check response quality and speed
5. Test "Auto" mode
6. **Expected:** Routes to best model for task

**Success Criteria:**
- ✅ Model selection works
- ✅ Requests route correctly
- ✅ Responses are appropriate
- ✅ Auto-routing is intelligent

---

### Module 6: Debugger 🐛

**Prerequisites:**
- `debugpy` installed (already in Docker)
- Python file with code to debug

**Test Steps:**
1. Open a Python file
2. Set a breakpoint (double-click line number or click 🐛 button)
3. Click 🐛 button in toolbar
4. Click "Start Debugging"
5. **Expected:** Execution pauses at breakpoint
6. Inspect variables:
   - View variables panel
   - Check values
7. Use step controls:
   - **Step Into:** Execute line by line
   - **Step Over:** Skip function calls
   - **Continue:** Resume execution
8. View call stack
9. **Expected:** Stack shows function calls

**Success Criteria:**
- ✅ Breakpoints work
- ✅ Execution pauses correctly
- ✅ Variables are inspectable
- ✅ Step controls work
- ✅ Call stack is accurate

---

## 🐛 Troubleshooting

### Collaboration Not Working
- **Check:** WebSocket connection in browser console
- **Check:** Both windows have same file open
- **Check:** Network tab for WebSocket messages

### Code Search Not Working
- **Check:** Backend ML worker is running
- **Check:** Project files are indexed
- **Check:** Search query is valid

### GitHub OAuth Failing
- **Check:** `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set
- **Check:** OAuth app callback URL matches
- **Check:** Browser console for errors

### IntelliSense Not Working
- **Check:** LSP servers are installed
- **Check:** WebSocket connection to LSP endpoint
- **Check:** File language is detected correctly

### Debugger Not Working
- **Check:** `debugpy` is installed
- **Check:** Python file is valid
- **Check:** Breakpoints are set correctly

---

## 📊 Test Results Template

```
Module 1: Collaboration
- [ ] Real-time sync works
- [ ] User presence visible
- [ ] No conflicts

Module 2: Code Search
- [ ] Search results appear
- [ ] Navigation works
- [ ] Multiple modes work

Module 3: GitHub Sync
- [ ] OAuth works
- [ ] Clone works
- [ ] Pull/Push work

Module 4: IntelliSense
- [ ] Auto-completion works
- [ ] Hover tooltips work
- [ ] Go to Definition works

Module 5: Multi-LLM Router
- [ ] Model selection works
- [ ] Routing works
- [ ] Auto mode works

Module 6: Debugger
- [ ] Breakpoints work
- [ ] Variables inspectable
- [ ] Step controls work
```

---

## ✅ Success Criteria

All modules pass if:
- ✅ All UI elements are accessible
- ✅ All features work as expected
- ✅ No console errors
- ✅ No network errors
- ✅ Performance is acceptable

---

**Status:** ✅ **READY FOR BROWSER TESTING**

