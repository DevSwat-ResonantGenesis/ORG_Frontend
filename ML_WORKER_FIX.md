# 🔧 ML WORKER FIX GUIDE

## 🚨 CURRENT STATUS

ML Worker is showing as **"unhealthy"** in docker-compose, but it might actually be working.

---

## 🔍 DIAGNOSIS STEPS

### 1. Check ML Worker Status
```bash
cd /Applications/ResonantGraphAIV0.1
docker-compose ps ml-worker
```

### 2. Check Health Endpoint
```bash
curl http://localhost:9000/health
```

If it returns JSON, the worker is actually working!

### 3. Check Logs
```bash
cd /Applications/ResonantGraphAIV0.1
docker-compose logs ml-worker --tail 50
```

Look for:
- ✅ "Application startup complete"
- ✅ "Uvicorn running on http://0.0.0.0:9000"
- ❌ Any error messages

---

## ✅ POSSIBLE FIXES

### Fix 1: Health Check Too Strict

The health check might be failing even though the service works.

**Check health check config:**
```yaml
healthcheck:
  test: ["CMD-SHELL", "curl -f http://localhost:9000/health || exit 1"]
  interval: 30s
  timeout: 10s
  retries: 3
```

**Solution:** The health check might need more time or a different endpoint.

### Fix 2: Restart ML Worker

```bash
cd /Applications/ResonantGraphAIV0.1
docker-compose restart ml-worker
```

Wait 30 seconds, then check:
```bash
docker-compose ps ml-worker
```

### Fix 3: Rebuild ML Worker

If restart doesn't work:
```bash
cd /Applications/ResonantGraphAIV0.1
docker-compose stop ml-worker
docker-compose build ml-worker
docker-compose up -d ml-worker
```

### Fix 4: Check Dependencies

ML Worker needs:
- ✅ Database connection (should be working)
- ✅ Model files (might be missing)
- ✅ Python dependencies

---

## 🎯 WHAT ML WORKER DOES

The ML Worker provides:
- AI model inference
- Embeddings generation
- Advanced AI features
- Some specialized endpoints

**Note:** Basic IDE features work without ML worker, but advanced AI features won't.

---

## ⚠️ IF ML WORKER IS ACTUALLY WORKING

If `curl http://localhost:9000/health` returns OK, but docker shows "unhealthy", it's likely:
- Health check timeout too short
- Health check endpoint issue
- Docker health check misconfiguration

**Solution:** You can ignore the "unhealthy" status if the service actually responds.

---

## 📝 QUICK TEST

```bash
# Test if ML worker is actually working
curl http://localhost:9000/health

# If it returns JSON, it's working!
# The "unhealthy" status might just be a health check issue
```

---

**Status:** Checking ML Worker health...

