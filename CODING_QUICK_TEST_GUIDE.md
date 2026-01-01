# ⚡ Coding Functionality - Quick Test Guide

## 🚀 5-Minute Quick Test

### Test 1: File Attachment (1 minute)
```
1. Click file button (folder icon)
2. Select a .js or .py file
3. Check: File appears in list
4. Send message: "What does this code do?"
5. Expected: Response analyzes the code
```

### Test 2: Code in Message (1 minute)
```
1. Attach a code file
2. Send: "Refactor this to use arrow functions"
3. Expected: Refactoring suggestions provided
```

### Test 3: Multiple Files (1 minute)
```
1. Attach 3 code files
2. Send: "How do these files work together?"
3. Expected: Response analyzes all files
```

### Test 4: Code Generation (1 minute)
```
1. Send: "Generate a Python function that validates email addresses"
2. Expected: Code generated with explanation
```

### Test 5: Project Detection (1 minute)
```
1. Send: "Build a React todo app"
2. Expected: Project builder opens
```

---

## 📋 Copy-Paste Test Commands

### File Attachment Test
```
Attach: example.js
Message: "Review this code and suggest improvements"
```

### Code Generation Test
```
Message: "Generate a JavaScript function that debounces user input"
```

### Code Refactoring Test
```
Attach: old-code.js
Message: "Refactor this code to use modern ES6 syntax"
```

### Multi-File Test
```
Attach: component.jsx, styles.css, test.js
Message: "Explain how these files work together"
```

### Project Building Test
```
Message: "Create a Python web scraper that extracts data from a website"
```

---

## ✅ Success Checklist

After running tests, verify:

- [ ] Files attach successfully
- [ ] File content included in responses
- [ ] Code generation works
- [ ] Code refactoring works
- [ ] Multiple files handled
- [ ] Project building detected
- [ ] No errors in console
- [ ] Backend receives code context

---

## 🐛 Quick Troubleshooting

**Files not attaching?**
- Check file type (must be text/code)
- Check browser console for errors
- Try smaller file (< 1MB)

**Code generation fails?**
- Check backend is running
- Check AI provider is available
- Try simpler description

**Code selection not working?**
- Currently set programmatically
- Check codeSelection state
- Verify included in request

---

**For full tests, see:** `CODING_FUNCTIONALITY_TEST_PLAN.md`
**For investigation, see:** `CODING_FUNCTIONALITY_INVESTIGATION.md`

