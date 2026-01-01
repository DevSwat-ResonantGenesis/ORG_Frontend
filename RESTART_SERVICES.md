# 🔄 Restart Services Guide

## ✅ **Frontend Restarted**

The frontend has been restarted and should be running on `http://localhost:5175`

---

## ⚠️ **Backend Status**

**Docker is not running** - The backend requires Docker to be started.

### **To Start Backend:**

**Option 1: Start Docker Desktop**
1. Open Docker Desktop application
2. Wait for it to fully start (whale icon in menu bar)
3. Then run:
   ```bash
   cd /Applications/ResonantGraphAIV0.1
   docker compose up -d
   ```

**Option 2: Start Docker via Command Line (if installed)**
```bash
# Start Docker daemon
open -a Docker

# Wait a few seconds, then:
cd /Applications/ResonantGraphAIV0.1
docker compose up -d
```

**Option 3: Run Backend Without Docker (Development)**
```bash
cd /Applications/ResonantGraphAIV0.1/backend/fastapi_app
python3 -m venv .venv
source .venv/bin/activate
pip install -r ../requirements.txt
uvicorn main:app --reload --port 8001
```

---

## 🔍 **Check Status**

**Frontend:**
```bash
# Check if frontend is running
lsof -ti:5175 && echo "✅ Frontend running" || echo "❌ Frontend not running"

# Or visit: http://localhost:5175
```

**Backend:**
```bash
# Check if backend is running
curl http://localhost:8001/health && echo "✅ Backend running" || echo "❌ Backend not running"

# Or check Docker containers
docker compose ps
```

---

## 🚀 **Quick Restart Commands**

**Restart Frontend:**
```bash
cd /Applications/ResonantGraphAI_FrontendV0.1
# Kill existing process
lsof -ti:5175 | xargs kill -9 2>/dev/null
# Start fresh
npm run dev
```

**Restart Backend (with Docker):**
```bash
cd /Applications/ResonantGraphAIV0.1
docker compose restart api
# Or full restart:
docker compose down && docker compose up -d
```

---

## 💡 **If IDE is Still Freezing**

1. **Hard Refresh Browser:**
   - `Cmd/Ctrl + Shift + R`
   - Or clear cache and reload

2. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for errors
   - Check Network tab for failed requests

3. **Restart Browser:**
   - Close all tabs
   - Restart browser completely

4. **Clear Browser Cache:**
   ```javascript
   // Run in browser console:
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

---

## ✅ **Current Status**

- ✅ **Frontend:** Restarted and running
- ⚠️ **Backend:** Requires Docker to be started

**Next Step:** Start Docker Desktop, then run `docker compose up -d` in the backend directory.

