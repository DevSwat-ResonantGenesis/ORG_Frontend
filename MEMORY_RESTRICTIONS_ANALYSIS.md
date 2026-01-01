# 🔍 MEMORY RESTRICTIONS ANALYSIS

## 🚨 PROBLEM

API container is being killed, likely due to memory limits.

---

## 📊 CURRENT MEMORY LIMITS

### API Service
```yaml
mem_limit: 512m      # Maximum 512 MB
mem_reservation: 256m # Reserved 256 MB
```

### ML Worker Service
```yaml
mem_limit: 1g       # Maximum 1 GB
mem_reservation: 512m # Reserved 512 MB
```

### Database Service
```yaml
mem_limit: 512m      # Maximum 512 MB
mem_reservation: 256m # Reserved 256 MB
```

---

## ⚠️ ISSUE

**512 MB for API is TOO LOW!**

The API container is being killed because:
- 512 MB limit is restrictive
- API needs more memory for:
  - Python runtime
  - FastAPI application
  - Code processing
  - File operations
  - Git operations

---

## ✅ RECOMMENDED FIXES

### Option 1: Increase API Memory Limit

Change in `docker-compose.yml`:
```yaml
api:
  mem_limit: 2g      # Increase to 2 GB
  mem_reservation: 1g # Reserve 1 GB
```

### Option 2: Remove Memory Limits (Development)

For development, you can remove limits:
```yaml
api:
  # mem_limit: 512m      # Comment out
  # mem_reservation: 256m # Comment out
```

### Option 3: Increase All Services

```yaml
api:
  mem_limit: 2g
  mem_reservation: 1g

ml-worker:
  mem_limit: 2g      # Increase from 1g
  mem_reservation: 1g # Increase from 512m

db:
  mem_limit: 1g      # Increase from 512m
  mem_reservation: 512m # Increase from 256m
```

---

## 🔍 CHECK SYSTEM MEMORY

### Check Available Memory
```bash
docker info | grep -i memory
free -h
```

### Check Container Memory Usage
```bash
docker stats --no-stream
```

### Check OOM (Out of Memory) Kills
```bash
dmesg | grep -i "killed process"
journalctl -k | grep -i "out of memory"
```

---

## 📝 WHY CONTAINERS GET KILLED

1. **OOM Killer**: Linux kills processes when memory is exhausted
2. **Docker Limits**: Containers exceeding `mem_limit` get killed
3. **System Memory**: If system runs out of memory, Docker kills containers

---

## 🎯 QUICK FIX

Edit `/Applications/ResonantGraphAIV0.1/docker-compose.yml`:

Find the `api:` section and change:
```yaml
mem_limit: 512m
mem_reservation: 256m
```

To:
```yaml
mem_limit: 2g
mem_reservation: 1g
```

Then restart:
```bash
cd /Applications/ResonantGraphAIV0.1
docker-compose down
docker-compose up -d
```

---

**Status:** Memory limits are too restrictive! Need to increase API memory limit.

