# 🧪 Resonant Chat Coding Functionality - Complete Test Plan

## Overview
This document provides comprehensive tests for all coding-related features in Resonant Chat, including file attachments, code selection, code generation, refactoring, and project building.

---

## 📋 Table of Contents

1. [File Attachment Tests](#file-attachment-tests)
2. [Code Selection Tests](#code-selection-tests)
3. [Code Generation Tests](#code-generation-tests)
4. [Code Refactoring Tests](#code-refactoring-tests)
5. [Code Completion Tests](#code-completion-tests)
6. [Code Indexing Tests](#code-indexing-tests)
7. [Code Execution Tests](#code-execution-tests)
8. [Project Building Tests](#project-building-tests)
9. [IDE Mode Tests](#ide-mode-tests)
10. [Integration Tests](#integration-tests)

---

## 📎 File Attachment Tests

### Test 1.1: Basic File Attachment
**Goal:** Verify files can be attached to messages

**Steps:**
1. Click file attachment button (folder icon)
2. Select a text file (`.txt`, `.md`, `.json`)
3. **Expected:**
   - ✅ File appears in attached files list
   - ✅ File name displayed
   - ✅ File count badge shows "1 Files"
   - ✅ Can remove file

**Test Files:**
- `test.txt` (plain text)
- `test.md` (markdown)
- `test.json` (JSON)

### Test 1.2: Code File Attachment
**Goal:** Verify code files are handled correctly

**Steps:**
1. Attach a code file (`.js`, `.ts`, `.py`, `.java`)
2. Send message: "Review this code"
3. **Expected:**
   - ✅ File content is read and included in message
   - ✅ File path is sent to backend
   - ✅ Response references the code file

**Test Files:**
- `example.js` (JavaScript)
- `example.ts` (TypeScript)
- `example.py` (Python)

### Test 1.3: Multiple File Attachment
**Goal:** Verify multiple files can be attached

**Steps:**
1. Attach 3-5 files at once
2. **Expected:**
   - ✅ All files appear in list
   - ✅ File count shows correct number
   - ✅ Can remove individual files
   - ✅ All files sent with message

### Test 1.4: File Content Reading
**Goal:** Verify file content is read correctly

**Steps:**
1. Create a test file with specific content
2. Attach file
3. Send message
4. **Expected:**
   - ✅ File content appears in message context
   - ✅ Content is formatted as `[File: filename]\ncontent`
   - ✅ Large files (>1MB) handled gracefully

### Test 1.5: File Upload to Backend (Logged In)
**Goal:** Verify files are uploaded to backend when logged in

**Steps:**
1. Login
2. Attach a file
3. Check network tab for upload request
4. **Expected:**
   - ✅ `POST /rag/files/upload` request sent
   - ✅ File ID returned
   - ✅ File ID stored in `uploadedFileIds` map
   - ✅ Success message shown

### Test 1.6: File Upload Failure Handling
**Goal:** Verify graceful handling of upload failures

**Steps:**
1. Login
2. Attach file
3. Stop backend (`docker-compose stop api`)
4. **Expected:**
   - ✅ File still attached locally
   - ✅ Error logged but doesn't break UI
   - ✅ Can still send message (file content included)

### Test 1.7: File Type Validation
**Goal:** Verify only valid file types are accepted

**Steps:**
1. Try to attach binary files (`.exe`, `.dll`, `.bin`)
2. **Expected:**
   - ✅ Warning shown for unsupported types
   - ✅ File not added to list
   - ✅ Text/code files still work

### Test 1.8: Large File Handling
**Goal:** Verify large files don't cause errors

**Steps:**
1. Attach a 2-3MB text file
2. Send message
3. **Expected:**
   - ✅ File reads successfully
   - ✅ No "message sent error"
   - ✅ Content included in context

---

## 🎯 Code Selection Tests

### Test 2.1: Code Selection State
**Goal:** Verify code selection is stored correctly

**Steps:**
1. Set code selection: `{ file: "test.js", lines: [10, 20], code: "..." }`
2. Send message
3. **Expected:**
   - ✅ `code_selection` included in request
   - ✅ Backend receives selection data
   - ✅ Response uses code context

**Test Data:**
```javascript
codeSelection = {
  file: "src/components/Button.tsx",
  lines: [15, 25],
  code: "const handleClick = () => { ... }"
}
```

### Test 2.2: Code Selection with File Attachment
**Goal:** Verify code selection works with file attachments

**Steps:**
1. Attach file: `Button.tsx`
2. Set code selection for same file
3. Send message: "Refactor this function"
4. **Expected:**
   - ✅ Both file and selection sent
   - ✅ Selection takes priority for specific lines
   - ✅ Full file context also available

### Test 2.3: Code Selection Clearing
**Goal:** Verify code selection is cleared after send

**Steps:**
1. Set code selection
2. Send message
3. **Expected:**
   - ✅ Selection cleared after send
   - ✅ Next message doesn't include old selection

---

## 🏗️ Code Generation Tests

### Test 3.1: Basic Code Generation
**Goal:** Verify code can be generated from description

**API Endpoint:** `POST /code/generate`

**Request:**
```json
{
  "description": "Create a function that calculates factorial",
  "language": "python",
  "file_path": null,
  "context_files": null
}
```

**Expected Response:**
```json
{
  "code": "def factorial(n):\n    ...",
  "explanation": "This function...",
  "tests": "def test_factorial(): ..."
}
```

**Steps:**
1. Call API directly or use chat with code generation request
2. **Expected:**
   - ✅ Code generated correctly
   - ✅ Explanation provided
   - ✅ Tests included (if applicable)

### Test 3.2: Code Generation with Context
**Goal:** Verify code generation uses file context

**Steps:**
1. Attach file: `utils.py`
2. Send: "Add a function to this file that validates email addresses"
3. **Expected:**
   - ✅ Generated code matches file style
   - ✅ Uses existing imports
   - ✅ Follows file conventions

### Test 3.3: Multi-File Code Generation
**Goal:** Verify related files are considered

**Steps:**
1. Attach multiple related files
2. Send: "Generate a new component that uses these utilities"
3. **Expected:**
   - ✅ Generated code references attached files
   - ✅ Imports match existing structure
   - ✅ Code integrates properly

### Test 3.4: Language-Specific Generation
**Goal:** Verify different languages generate correctly

**Test Languages:**
- Python
- JavaScript/TypeScript
- Java
- C++

**Steps:**
1. Generate code for each language
2. **Expected:**
   - ✅ Syntax correct for each language
   - ✅ Language conventions followed
   - ✅ Proper formatting

---

## 🔧 Code Refactoring Tests

### Test 4.1: Basic Code Refactoring
**Goal:** Verify code can be refactored

**API Endpoint:** `POST /code/refactor`

**Request:**
```json
{
  "file_path": "src/utils.js",
  "code": "function oldCode() { ... }",
  "refactor_request": "Convert to arrow function and add error handling",
  "language": "javascript"
}
```

**Expected Response:**
```json
{
  "original_code": "...",
  "refactored_code": "...",
  "diff": "...",
  "explanation": "...",
  "safety_checks": {...}
}
```

**Steps:**
1. Attach code file
2. Send: "Refactor this to use async/await"
3. **Expected:**
   - ✅ Refactored code provided
   - ✅ Diff shown
   - ✅ Safety checks performed
   - ✅ Explanation provided

### Test 4.2: Refactoring with Hash Sphere Context
**Goal:** Verify refactoring uses similar code patterns

**Steps:**
1. Have similar code patterns in memory
2. Request refactoring
3. **Expected:**
   - ✅ Uses similar patterns from codebase
   - ✅ Maintains consistency
   - ✅ References existing code style

### Test 4.3: Safety Checks
**Goal:** Verify safety checks are performed

**Steps:**
1. Request refactoring that might break code
2. **Expected:**
   - ✅ Safety checks run
   - ✅ Warnings shown if risky
   - ✅ Suggestions for safer alternatives

---

## 💡 Code Completion Tests

### Test 5.1: Basic Code Completion
**Goal:** Verify code completion suggestions work

**API Endpoint:** `POST /code/complete`

**Request:**
```json
{
  "file_path": "src/utils.js",
  "prefix": "const total = ",
  "cursor_position": {"line": 10, "column": 15},
  "language": "javascript"
}
```

**Expected Response:**
```json
{
  "completions": [
    {"text": "const total = sum", "score": 0.95},
    {"text": "const total = calculateTotal", "score": 0.88}
  ],
  "from_memory": true
}
```

**Steps:**
1. Use code completion API
2. **Expected:**
   - ✅ Multiple suggestions provided
   - ✅ Suggestions ranked by relevance
   - ✅ Uses Hash Sphere memory if available

### Test 5.2: Context-Aware Completion
**Goal:** Verify completions use file context

**Steps:**
1. Provide file with existing functions
2. Request completion
3. **Expected:**
   - ✅ Suggestions match file style
   - ✅ Uses existing function names
   - ✅ Respects file structure

### Test 5.3: Memory-Based Completion
**Goal:** Verify completions use Hash Sphere memory

**Steps:**
1. Have code patterns in memory
2. Request completion with similar prefix
3. **Expected:**
   - ✅ `from_memory: true` in response
   - ✅ Suggestions match stored patterns
   - ✅ Better accuracy with memory

---

## 📚 Code Indexing Tests

### Test 6.1: Code Indexing
**Goal:** Verify code files can be indexed

**API Endpoint:** `POST /code/index`

**Request:**
```json
{
  "files": [
    {
      "path": "src/utils.js",
      "content": "function helper() { ... }",
      "language": "javascript"
    }
  ]
}
```

**Expected Response:**
```json
{
  "indexed": 1,
  "updated": 0,
  "errors": 0
}
```

**Steps:**
1. Index code files
2. **Expected:**
   - ✅ Files indexed successfully
   - ✅ Can search indexed code
   - ✅ Hash Sphere anchors created

### Test 6.2: Code Search
**Goal:** Verify indexed code can be searched

**API Endpoint:** `POST /code/search`

**Steps:**
1. Index multiple files
2. Search for function name
3. **Expected:**
   - ✅ Finds relevant code
   - ✅ Returns file paths and code snippets
   - ✅ Uses semantic search

---

## ⚡ Code Execution Tests

### Test 7.1: Code Execution (If Available)
**Goal:** Verify code can be executed safely

**API Endpoint:** `POST /code/execute`

**Note:** Requires Docker for code execution

**Request:**
```json
{
  "code": "print('Hello, World!')",
  "language": "python",
  "timeout": 5
}
```

**Expected Response:**
```json
{
  "output": "Hello, World!",
  "error": null,
  "execution_time": 0.1
}
```

**Steps:**
1. Execute simple code
2. **Expected:**
   - ✅ Code executes successfully
   - ✅ Output returned
   - ✅ Errors caught and returned
   - ✅ Timeout enforced

### Test 7.2: Execution Safety
**Goal:** Verify dangerous code is blocked

**Steps:**
1. Try to execute: `import os; os.system('rm -rf /')`
2. **Expected:**
   - ✅ Execution blocked or sandboxed
   - ✅ Error message shown
   - ✅ No system damage

---

## 🏗️ Project Building Tests

### Test 8.1: Project Detection
**Goal:** Verify project requests are detected

**Steps:**
1. Send: "Build a React todo app"
2. **Expected:**
   - ✅ Project builder opens
   - ✅ Project type detected (React)
   - ✅ Description captured

**Test Phrases:**
- "Create a Python web scraper"
- "Build a Node.js API"
- "Make a React component library"

### Test 8.2: Multi-File Project Generation
**Goal:** Verify complete projects can be generated

**API Endpoint:** `POST /code/project/generate`

**Request:**
```json
{
  "description": "A simple todo app with React",
  "project_type": "react",
  "files": null,
  "context": null
}
```

**Expected Response:**
```json
{
  "files": [
    {
      "path": "src/App.jsx",
      "content": "...",
      "language": "javascript",
      "explanation": "..."
    },
    {
      "path": "package.json",
      "content": "...",
      "language": "json",
      "explanation": "..."
    }
  ],
  "project_structure": {...},
  "setup_instructions": "...",
  "anchors": [...]
}
```

**Steps:**
1. Request project generation
2. **Expected:**
   - ✅ Multiple files generated
   - ✅ Project structure defined
   - ✅ Setup instructions provided
   - ✅ Hash Sphere anchors created

### Test 8.3: Project Type Detection
**Goal:** Verify different project types are handled

**Test Types:**
- React
- Python
- Node.js
- Vue
- Angular

**Steps:**
1. Request each project type
2. **Expected:**
   - ✅ Correct project structure
   - ✅ Appropriate dependencies
   - ✅ Language-specific conventions

---

## 💻 IDE Mode Tests

### Test 9.1: IDE Mode Activation
**Goal:** Verify IDE mode can be activated

**Steps:**
1. Send: "open ide" or "edit project"
2. **Expected:**
   - ✅ IDE mode activated
   - ✅ File browser shown
   - ✅ Code editor available

### Test 9.2: File Operations in IDE
**Goal:** Verify file read/write/delete work

**API Endpoints:**
- `POST /code/files/read`
- `POST /code/files/write`
- `POST /code/files/delete`
- `GET /code/files/list`

**Steps:**
1. Read file
2. Write file
3. List files
4. Delete file
5. **Expected:**
   - ✅ All operations work
   - ✅ Files indexed after write
   - ✅ Hash Sphere anchors created

---

## 🔗 Integration Tests

### Test 10.1: File + Code Selection + Message
**Goal:** Verify all code features work together

**Steps:**
1. Attach file: `utils.js`
2. Set code selection: lines 10-20
3. Send: "Refactor this function to be more efficient"
4. **Expected:**
   - ✅ All context sent to backend
   - ✅ Response uses file + selection
   - ✅ Refactoring is accurate

### Test 10.2: Code Context in Chat
**Goal:** Verify code context is used in chat responses

**Steps:**
1. Attach code file
2. Send: "What does this code do?"
3. **Expected:**
   - ✅ Response analyzes the code
   - ✅ References specific functions
   - ✅ Explains code structure

### Test 10.3: Code Memory Integration
**Goal:** Verify code is stored in Hash Sphere memory

**Steps:**
1. Attach and discuss code
2. Later, ask about similar code
3. **Expected:**
   - ✅ Code patterns stored as anchors
   - ✅ Similar code retrieved
   - ✅ Memory used in responses

---

## 📊 Test Results Template

```
Test Date: ___________
Tester: ___________
Environment: [ ] Local [ ] Docker [ ] Production

File Attachment:
[ ] Test 1.1: Basic Attachment
[ ] Test 1.2: Code Files
[ ] Test 1.3: Multiple Files
[ ] Test 1.4: Content Reading
[ ] Test 1.5: Backend Upload
[ ] Test 1.6: Upload Failure
[ ] Test 1.7: File Type Validation
[ ] Test 1.8: Large Files

Code Selection:
[ ] Test 2.1: Selection State
[ ] Test 2.2: With File Attachment
[ ] Test 2.3: Selection Clearing

Code Generation:
[ ] Test 3.1: Basic Generation
[ ] Test 3.2: With Context
[ ] Test 3.3: Multi-File
[ ] Test 3.4: Language-Specific

Code Refactoring:
[ ] Test 4.1: Basic Refactoring
[ ] Test 4.2: With Hash Sphere
[ ] Test 4.3: Safety Checks

Code Completion:
[ ] Test 5.1: Basic Completion
[ ] Test 5.2: Context-Aware
[ ] Test 5.3: Memory-Based

Code Indexing:
[ ] Test 6.1: Indexing
[ ] Test 6.2: Search

Code Execution:
[ ] Test 7.1: Execution
[ ] Test 7.2: Safety

Project Building:
[ ] Test 8.1: Detection
[ ] Test 8.2: Generation
[ ] Test 8.3: Type Detection

IDE Mode:
[ ] Test 9.1: Activation
[ ] Test 9.2: File Operations

Integration:
[ ] Test 10.1: Combined Features
[ ] Test 10.2: Code Context
[ ] Test 10.3: Memory Integration

Issues Found:
1. 
2. 
3. 

Notes:
```

---

## 🚨 Known Limitations

1. **Code Selection UI:** Currently set via state, no visual selection in editor
2. **Code Execution:** Requires Docker, may not be available in all environments
3. **Multi-File Generation:** Limited to project builder mode
4. **IDE Mode:** Basic implementation, not full IDE

---

## 🎯 Success Criteria

- **File Attachment:** 100% success rate for valid files
- **Code Generation:** 90%+ syntactically correct code
- **Code Refactoring:** 95%+ maintains functionality
- **Code Completion:** 80%+ relevant suggestions
- **Integration:** All features work together seamlessly

---

**Last Updated:** 2025-01-30
**Version:** 1.0

