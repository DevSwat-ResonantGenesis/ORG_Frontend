# 🔧 Fix Build Error on Droplet

## Problem
The router file on the droplet has old import paths:
- ❌ `'../pages/PredictionsPage/PredictionsPage'` (wrong - singular)
- ✅ `'../pages/Predictions/PredictionsPage-2025'` (correct - plural)

## Solution Options

### Option 1: Reset and Pull Fresh (Recommended)

On your droplet:
```bash
cd /root/frontend

# Stash or discard local changes
git stash
# OR
git reset --hard HEAD

# Pull fresh from GitHub
git pull origin main

# Build
npm run build
```

### Option 2: Use the Fix Script

**Step 1: Upload the fix script**
```bash
# From your local machine:
scp fix-router-on-droplet.sh root@137.184.234.252:/root/
```

**Step 2: Run on droplet**
```bash
ssh root@137.184.234.252
chmod +x /root/fix-router-on-droplet.sh
/root/fix-router-on-droplet.sh
```

### Option 3: Manual Fix

On your droplet:
```bash
cd /root/frontend

# Edit the router file
nano src/router/index.tsx

# Find line 10 and change:
# FROM: import('../pages/PredictionsPage/PredictionsPage')
# TO:   import('../pages/Predictions/PredictionsPage-2025')

# Find line 14 and change:
# FROM: import('../pages/PredictionsPage/PredictionDetailPage')
# TO:   import('../pages/Predictions/PredictionDetailPage')

# Save and exit (Ctrl+X, Y, Enter)

# Build again
npm run build
```

### Option 4: Force Pull (if you have local changes you want to discard)

```bash
cd /root/frontend

# Discard all local changes
git fetch origin
git reset --hard origin/main

# Build
npm run build
```

## Quick Fix Command

```bash
cd /root/frontend
git reset --hard origin/main
git pull origin main
npm run build
```

## After Fixing

Once the build succeeds:
```bash
docker compose restart frontend
```

## Verify

```bash
# Check if build succeeded
ls -la dist/

# Check frontend is running
docker ps | grep frontend

# Test frontend
curl http://localhost/
```

