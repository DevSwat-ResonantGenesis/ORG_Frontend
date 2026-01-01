# 🧪 POWER MODULES (A-E) - TESTING GUIDE

## Complete Testing Guide for All 5 Power Modules

---

## 📋 Prerequisites

1. **Backend Running**: Ensure backend API is running on `http://localhost:8001`
2. **Docker Running**: For Module A & D, Docker must be installed and running
3. **Authentication**: Login to get JWT token (or use test token)
4. **Project Loaded**: Have a project ID ready for testing

---

## 🧪 MODULE A: Container Sandbox Testing

### Backend Test
```bash
# Test workspace start
curl -X POST http://localhost:8001/api/workspace/start \
  -H "Content-Type: application/json" \
  -H "Cookie: rg_access_token=<your-token>" \
  -d '{
    "project_id": "test-project",
    "image": "node:20",
    "memory_limit": "2g"
  }'
```

### Frontend Test
1. Open IDE with a project
2. Click "Workspace Container" button in toolbar
3. Select Docker image (Node.js 20, Python 3.11, etc.)
4. Select memory limit (512MB - 4GB)
5. Click "Start Workspace"
6. **Expected**: Workspace starts, status shows "running"
7. **Verify**: Container ID is displayed
8. Click "View Logs" to see container logs
9. Click "Stop" to stop workspace
10. Click "Delete" to remove workspace

### Error Cases
- ❌ **No Docker**: Should show "Docker is not available" error
- ❌ **Invalid project**: Should show "Project not found" error
- ❌ **No auth**: Should show "Authentication required" error

---

## 🚀 MODULE B: Serverless Deploy Testing

### Backend Test
```bash
# Test Vercel deploy
curl -X POST http://localhost:8001/api/deploy/vercel \
  -H "Content-Type: application/json" \
  -H "Cookie: rg_access_token=<your-token>" \
  -d '{
    "project_id": "test-project",
    "name": "my-app"
  }'
```

### Frontend Test
1. Open IDE with a project
2. Click "Deploy" button in toolbar
3. Select provider (Vercel or DigitalOcean)
4. Click "Deploy to [Provider]"
5. **Expected**: Deployment starts, status shows "deploying"
6. **Verify**: Deployment URL appears when ready
7. **Verify**: Logs link is available

### Error Cases
- ❌ **No OAuth token**: Should show "OAuth token required" error
- ❌ **Invalid project**: Should show "Project not found" error
- ❌ **Network error**: Should show connection error

---

## 👥 MODULE C: Workspace Sharing Testing

### Backend Test
```bash
# Create invite link
curl -X POST http://localhost:8001/api/workspace/{workspace_id}/invite \
  -H "Content-Type: application/json" \
  -H "Cookie: rg_access_token=<your-token>" \
  -d '{
    "permission": "edit",
    "expires_in_hours": 24
  }'
```

### Frontend Test
1. Open IDE with a workspace active
2. Click "Collaboration" button in toolbar
3. Click "+ Invite" button
4. Select permission (Edit or Read Only)
5. Set expiration (1-168 hours)
6. Click "Create Invite Link"
7. **Expected**: Invite URL is generated
8. Click "Copy" to copy link
9. **Verify**: Link can be shared with others
10. Test joining workspace via invite link

### Error Cases
- ❌ **No workspace**: Should show "No workspace selected" error
- ❌ **No permission**: Should show "Access denied" error
- ❌ **Expired token**: Should show "Invite token has expired" error

---

## 💻 MODULE D: PTY Terminal Testing

### Backend Test
```bash
# WebSocket test (use wscat or browser)
wscat -c ws://localhost:8001/api/terminal/pty/{workspace_id}
```

### Frontend Test
1. Start a workspace (Module A)
2. Terminal should automatically switch to PTY mode
3. **Expected**: Terminal shows "Connected to workspace terminal..."
4. Type commands (e.g., `ls`, `pwd`, `npm install`)
5. **Verify**: Commands execute in container
6. **Verify**: Output streams in real-time
7. Resize terminal window
8. **Verify**: Terminal resizes correctly

### Error Cases
- ❌ **No workspace**: Should show regular terminal (not PTY)
- ❌ **Connection failed**: Should show "Connection error"
- ❌ **WebSocket closed**: Should show "Connection closed" message

---

## 🔌 MODULE E: Plugin System Testing

### Backend Test
```bash
# List plugins
curl http://localhost:8001/api/plugins \
  -H "Cookie: rg_access_token=<your-token>"

# Install plugin (requires ZIP file)
curl -X POST http://localhost:8001/api/plugins/install \
  -H "Cookie: rg_access_token=<your-token>" \
  -F "plugin_file=@plugin.zip"
```

### Frontend Test
1. Click "Plugins" button in toolbar
2. Click "+ Install Plugin"
3. Select a plugin ZIP file
4. **Expected**: Plugin installs successfully
5. **Verify**: Plugin appears in list
6. Click "Enable" to enable plugin
7. Click "Disable" to disable plugin
8. Click "Uninstall" to remove plugin

### Plugin ZIP Structure
```
plugin.zip
├── plugin.json
├── main.js (or entry point)
└── other files...
```

### plugin.json Example
```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My awesome plugin",
  "entry": "main.js",
  "permissions": ["fs", "ai"],
  "api_version": "1.0.0"
}
```

### Error Cases
- ❌ **Invalid ZIP**: Should show "plugin.json not found" error
- ❌ **Missing entry**: Should show "Entry point not found" error
- ❌ **Invalid manifest**: Should show validation error

---

## 🔄 Complete Workflow Tests

### Workflow 1: Full Development Cycle
1. **Start Workspace** (Module A)
2. **Open Terminal** (Module D - PTY)
3. **Install Dependencies** (`npm install`)
4. **Edit Code** (Monaco Editor)
5. **Deploy** (Module B - Vercel)
6. **Share** (Module C - Invite collaborator)
7. **Install Plugin** (Module E - Custom feature)

### Workflow 2: Collaboration Session
1. **Start Workspace** (Module A)
2. **Create Invite Link** (Module C)
3. **Share Link** with collaborator
4. **Collaborator Joins** (Module C)
5. **Real-time Editing** (Yjs collaboration)
6. **Terminal Access** (Module D - both users)

### Workflow 3: Plugin Development
1. **Create Plugin** (ZIP with manifest)
2. **Install Plugin** (Module E)
3. **Enable Plugin** (Module E)
4. **Test Plugin** (in IDE)
5. **Disable/Uninstall** (Module E)

---

## ✅ Test Checklist

### Module A (Container Sandbox)
- [ ] Start workspace with Node.js image
- [ ] Start workspace with Python image
- [ ] View workspace status
- [ ] View container logs
- [ ] Stop workspace
- [ ] Delete workspace
- [ ] Error: No Docker available
- [ ] Error: Invalid project ID

### Module B (Deployment)
- [ ] Deploy to Vercel (requires token)
- [ ] Deploy to DigitalOcean (requires token)
- [ ] View deployment status
- [ ] View deployment logs
- [ ] Error: No OAuth token
- [ ] Error: Invalid project

### Module C (Workspace Sharing)
- [ ] Create invite link (edit permission)
- [ ] Create invite link (read permission)
- [ ] Copy invite link
- [ ] Join workspace via link
- [ ] View collaborators list
- [ ] Error: No workspace
- [ ] Error: Expired token

### Module D (PTY Terminal)
- [ ] Connect to workspace PTY
- [ ] Execute commands
- [ ] View real-time output
- [ ] Resize terminal
- [ ] Error: No workspace
- [ ] Error: Connection failed

### Module E (Plugin System)
- [ ] Install plugin from ZIP
- [ ] List installed plugins
- [ ] Enable plugin
- [ ] Disable plugin
- [ ] Uninstall plugin
- [ ] Error: Invalid ZIP
- [ ] Error: Missing manifest

---

## 🐛 Common Issues & Solutions

### Issue: "Docker is not available"
**Solution**: Install Docker Desktop and ensure it's running

### Issue: "OAuth token required"
**Solution**: Connect Vercel/DigitalOcean account in settings

### Issue: "Workspace not found"
**Solution**: Start workspace first (Module A)

### Issue: "WebSocket connection failed"
**Solution**: Check backend WebSocket server is running

### Issue: "Plugin installation failed"
**Solution**: Ensure ZIP contains `plugin.json` and entry file

---

## 📊 Test Results Template

```
Module A: Container Sandbox
  ✅ Start workspace: PASS
  ✅ View status: PASS
  ✅ View logs: PASS
  ❌ Stop workspace: FAIL (needs auth)

Module B: Deployment
  ⚠️  Deploy to Vercel: SKIP (no token)
  ⚠️  Deploy to DigitalOcean: SKIP (no token)

Module C: Workspace Sharing
  ✅ Create invite: PASS
  ✅ Copy link: PASS
  ⚠️  Join workspace: SKIP (needs second user)

Module D: PTY Terminal
  ✅ Connect: PASS
  ✅ Execute commands: PASS
  ✅ Real-time output: PASS

Module E: Plugin System
  ✅ List plugins: PASS
  ⚠️  Install plugin: SKIP (no test plugin)
```

---

## 🎯 Success Criteria

All modules are working correctly if:
- ✅ Backend endpoints return 200/201 (with auth) or 401 (without auth)
- ✅ Frontend components render without errors
- ✅ User interactions trigger correct API calls
- ✅ Error messages are clear and helpful
- ✅ Loading states show during async operations
- ✅ Success notifications appear on completion

---

**Ready to test!** 🚀

