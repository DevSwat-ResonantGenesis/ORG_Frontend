# End-to-End Testing Guide

**Date:** January 3, 2025  
**Status:** Ready for Testing

---

## 🚀 **Services Status**

### **Backend (Docker):**
- ✅ API: http://localhost:8001 (Health: OK)
- ✅ Database: Running (Port 5433)
- ✅ ML Worker: Running (Port 9000)

### **Frontend (Local):**
- ✅ Development Server: http://localhost:5175 (Running)

---

## 📋 **Testing Checklist**

### **Step 1: Login/Authentication**

1. Navigate to: http://localhost:5175
2. You'll be redirected to login page
3. **Login with your credentials** or create a test account

**Note:** If you don't have credentials, you may need to:
- Create a test user via the signup page
- Or use existing credentials

---

### **Step 2: Test Module D - Agent Teams**

**URL:** http://localhost:5175/agent-teams

**Test Cases:**
1. ✅ **View Teams List**
   - Should show existing teams or empty state
   - Check for loading states

2. ✅ **Create Team**
   - Click "Create Team" button
   - Fill in:
     - Team name
     - Description
     - Select agents
     - Configure workflow
   - Submit and verify team appears in list

3. ✅ **View Team Details**
   - Click on a team
   - Verify team information displays
   - Check team members list

4. ✅ **Execute Workflow**
   - Select a team
   - Click "Execute Workflow"
   - Provide input data
   - Submit and monitor workflow status

5. ✅ **View Conversation**
   - After workflow execution
   - View conversation history
   - Verify agent messages

**Expected Results:**
- All API calls succeed
- No console errors
- UI updates correctly
- Data persists after refresh

---

### **Step 3: Test Module E - AI Review Pipeline**

**URL:** http://localhost:5175/ai-review

**Test Cases:**
1. ✅ **View Review Queue**
   - Should show pending review tasks
   - Check filters (status, user)

2. ✅ **Submit Patch for Review**
   - Use "Submit for Review" button (from code editor or refactor dialog)
   - Fill in:
     - File path
     - Old code
     - New code
     - Description
   - Submit and verify task appears in queue

3. ✅ **View Review Task**
   - Click on a pending task
   - Verify diff viewer shows old vs new code
   - Check task details

4. ✅ **Approve Task**
   - Open a pending task
   - Click "Approve"
   - Add optional comment
   - Submit and verify status changes to "approved"

5. ✅ **Reject Task**
   - Open a pending task
   - Click "Reject"
   - Add required comment
   - Submit and verify status changes to "rejected"

6. ✅ **Request Modifications**
   - Open a pending task
   - Click "Request Modifications"
   - Add comment about needed changes
   - Submit and verify status changes to "modifications_requested"

**Expected Results:**
- Review queue loads correctly
- Diff viewer displays code changes
- All actions update task status
- No errors in console

---

### **Step 4: Test Module F - Marketplace**

**URL:** http://localhost:5175/marketplace

**Test Cases:**

#### **4.1 Browse Marketplace**
1. ✅ **View Marketplace**
   - Should show marketplace items (or empty state)
   - Check item cards display correctly

2. ✅ **Search & Filter**
   - Test search functionality
   - Filter by item type (agent, plugin, template, etc.)
   - Filter by price (free/paid)
   - Filter by category
   - Verify filters work correctly

3. ✅ **View Item Details**
   - Click on an item card
   - Verify item details page loads
   - Check:
     - Item information
     - Screenshots (if available)
     - Documentation link
     - Price/Free status
     - Ratings and reviews

#### **4.2 Purchase Flow**
1. ✅ **Purchase Paid Item**
   - Navigate to a paid item
   - Click "Purchase" button
   - Complete purchase (may need payment integration)
   - Verify purchase success message
   - Check purchase appears in records

2. ✅ **Install Free Item**
   - Navigate to a free item
   - Click "Install" button
   - Verify installation success
   - Check item appears in installations

3. ✅ **Install Purchased Item**
   - After purchasing, click "Install"
   - Verify installation success
   - Check installation record

#### **4.3 Reviews**
1. ✅ **View Reviews**
   - Navigate to item details
   - Scroll to reviews section
   - Verify reviews display correctly
   - Check ratings and comments

2. ✅ **Create Review**
   - Click "Write Review" button
   - Fill in:
     - Rating (1-5 stars)
     - Title (optional)
     - Comment (optional)
   - Submit review
   - Verify review appears in list
   - Check average rating updates

#### **4.4 My Installations**
**URL:** http://localhost:5175/marketplace/installations

1. ✅ **View Installations**
   - Navigate to installations page
   - Verify installed items list
   - Check installation status
   - Verify installation dates

2. ✅ **Navigate to Item**
   - Click "View Details" on an installation
   - Verify navigates to item details page

---

## 🔍 **Debugging Tips**

### **Check Browser Console:**
- Open Developer Tools (F12)
- Check Console tab for errors
- Check Network tab for failed API calls

### **Check Backend Logs:**
```bash
cd /Applications/ResonantGraphAIV0.1
docker compose logs api -f
```

### **Check Frontend Logs:**
- Look at terminal where `npm run dev` is running
- Check for compilation errors

### **Common Issues:**

1. **401 Unauthorized:**
   - Need to login first
   - Check if session expired
   - Verify JWT token

2. **404 Not Found:**
   - Check if route is registered
   - Verify API endpoint exists
   - Check backend is running

3. **500 Internal Server Error:**
   - Check backend logs
   - Verify database connection
   - Check for missing migrations

4. **CORS Errors:**
   - Verify CORS settings in backend
   - Check API URL configuration

---

## 📊 **Test Results Template**

### **Module D - Agent Teams:**
- [ ] Teams list loads
- [ ] Create team works
- [ ] View team details works
- [ ] Execute workflow works
- [ ] View conversation works

### **Module E - AI Review:**
- [ ] Review queue loads
- [ ] Submit patch works
- [ ] View task details works
- [ ] Approve works
- [ ] Reject works
- [ ] Request modifications works

### **Module F - Marketplace:**
- [ ] Marketplace page loads
- [ ] Search/filter works
- [ ] Item details page loads
- [ ] Purchase flow works
- [ ] Installation works
- [ ] Reviews display correctly
- [ ] Create review works
- [ ] Installations page works

---

## 🎯 **Quick Test URLs**

- **Home:** http://localhost:5175
- **Dashboard:** http://localhost:5175/dashboard
- **Agent Teams:** http://localhost:5175/agent-teams
- **AI Review:** http://localhost:5175/ai-review
- **Marketplace:** http://localhost:5175/marketplace
- **My Installations:** http://localhost:5175/marketplace/installations
- **API Docs:** http://localhost:8001/docs

---

## ✅ **Success Criteria**

All modules are working correctly if:
1. ✅ Pages load without errors
2. ✅ API calls succeed (check Network tab)
3. ✅ Data displays correctly
4. ✅ Actions (create, update, delete) work
5. ✅ No console errors
6. ✅ Responsive design works on mobile

---

**Ready to test!** 🚀

Start by logging in, then test each module systematically.

