# 🐛 Debug Project Building - Why It's Not Working

## 🔍 **Step-by-Step Debugging**

### **Step 1: Check Detection**

Open browser console (F12) and look for:
- ✅ `"Project request detected"` = Detection working
- ❌ `"Message does not match project request pattern"` = Detection failed

**Test phrases:**
```
"Build a todo app"
"Can you create a React project"
"I want to build a calculator"
```

---

### **Step 2: Check ProjectBuilder Component**

After detection, check console for:
- ✅ `"ProjectBuilder: Starting generation"` = Component loaded
- ✅ `"ProjectBuilder: Calling generateProject API"` = API call starting
- ❌ `"ProjectBuilder Not Available"` = JSZip not installed

**Fix if JSZip missing:**
```bash
npm install jszip
```

---

### **Step 3: Check API Call**

Open Network tab (F12 → Network) and look for:
- Request to: `POST /code/project/generate`
- Status: 
  - ✅ `200` = Success
  - ❌ `401` = Not authenticated (need to log in)
  - ❌ `404` = Endpoint not found
  - ❌ `500` = Server error

**Check request payload:**
```json
{
  "description": "build a todo app",
  "project_type": "react"
}
```

**Check response:**
```json
{
  "files": [...],
  "setup_instructions": "...",
  "project_structure": {...}
}
```

---

### **Step 4: Check Backend**

**Test backend endpoint:**
```bash
# Check if backend is running
curl http://localhost:8001/health

# Check if endpoint exists (requires auth)
curl http://localhost:8001/docs
# Look for /code/project/generate in Swagger UI
```

**Backend requirements:**
- ✅ FastAPI server running on port 8001
- ✅ `/code/project/generate` endpoint exists
- ✅ Authentication configured (JWT or guest mode)

---

## 🛠️ **Common Issues & Fixes**

### **Issue 1: Detection Not Working**

**Symptoms:**
- Message sent to chat instead of opening ProjectBuilder
- Console shows: `"Message does not match project request pattern"`

**Fix:**
1. Use exact phrases: "Build a todo app", "Create a React project"
2. Or click **"Build"** button (💡) to force build mode
3. Check console for detection details

---

### **Issue 2: ProjectBuilder Not Showing**

**Symptoms:**
- Detection works (console shows "Project request detected")
- But ProjectBuilder doesn't appear

**Fix:**
1. Check if `generatedProject` state is set:
   ```javascript
   // In browser console:
   // Should see ProjectBuilder component render
   ```
2. Check CSS - `projectBuilderWrapper` should be visible
3. Check if IDE mode is active (it hides ProjectBuilder)

---

### **Issue 3: API Call Failing**

**Symptoms:**
- ProjectBuilder shows "Loading..."
- Then shows error message
- Network tab shows failed request

**Common errors:**

**401 Unauthorized:**
```
Error: Authentication required. Please log in to generate projects.
```
**Fix:** Log in or check if guest mode is enabled for this endpoint

**404 Not Found:**
```
Error: Project generation endpoint not found.
```
**Fix:** Check backend has `/code/project/generate` endpoint

**500 Server Error:**
```
Error: Server error. Please try again later.
```
**Fix:** Check backend logs for errors

---

### **Issue 4: No Files Generated**

**Symptoms:**
- API call succeeds (200 status)
- But `files` array is empty

**Fix:**
1. Check backend response has `files` array
2. Check backend logs for generation errors
3. Try different project description

---

## 🔧 **Quick Fixes**

### **Force Build Mode:**
1. Click **"Build"** button (💡) in input toolbar
2. Type any message
3. ProjectBuilder will open

### **Check Console:**
```javascript
// In browser console, check:
console.log('Build mode:', buildMode);
console.log('Generated project:', generatedProject);
```

### **Test API Directly:**
```javascript
// In browser console (if logged in):
fetch('http://localhost:8001/code/project/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    description: 'build a todo app',
    project_type: 'react'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

---

## 📊 **Debug Checklist**

- [ ] Detection working? (Check console for "Project request detected")
- [ ] ProjectBuilder component loading? (Check for "ProjectBuilder: Starting generation")
- [ ] API call being made? (Check Network tab)
- [ ] API call succeeding? (Check response status)
- [ ] Files being generated? (Check response.files array)
- [ ] Backend running? (Check http://localhost:8001/health)
- [ ] Endpoint exists? (Check http://localhost:8001/docs)
- [ ] Authentication working? (Check for 401 errors)

---

## 🎯 **Expected Flow**

1. **User types:** "Build a todo app"
2. **Detection:** ✅ "Project request detected"
3. **State update:** `setGeneratedProject({ description: "...", projectType: undefined })`
4. **Component render:** ProjectBuilder shows
5. **Auto-generate:** `useEffect` triggers `handleGenerate()`
6. **API call:** `POST /code/project/generate`
7. **Response:** Files array received
8. **Display:** File tree and code preview shown

---

## 🚨 **If Still Not Working**

1. **Check all console logs** - Look for errors or warnings
2. **Check Network tab** - See actual API requests/responses
3. **Check backend logs** - See if requests are reaching backend
4. **Try Build button** - Force build mode to bypass detection
5. **Check authentication** - Log in if required

---

## 💡 **Pro Tips**

- **Use Build button** if detection is unreliable
- **Check console first** - Most issues show up there
- **Check Network tab** - See actual API communication
- **Try simpler phrases** - "Build todo app" instead of long sentences
- **Check backend** - Make sure endpoint is implemented

