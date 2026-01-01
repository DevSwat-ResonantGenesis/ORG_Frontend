# 🔧 Fix YAML Syntax Error in docker-compose.yml

## Problem
- YAML error: `yaml: line 50: did not find expected key`
- docker-compose.yml has a syntax error on line 50

## Solution

### Step 1: Check the Error

```bash
cd /root/ResonantGraphAIV0.1

# Check YAML syntax
docker compose config
```

This will show you the exact error.

### Step 2: View Line 50

```bash
# See line 50 and surrounding context
sed -n '45,55p' docker-compose.yml
```

### Step 3: Common YAML Errors

**Error 1: Missing Colon**
```yaml
# Wrong:
frontend
  image: nginx:alpine

# Correct:
frontend:
  image: nginx:alpine
```

**Error 2: Wrong Indentation**
```yaml
# Wrong (using tabs or wrong spacing):
frontend:
	image: nginx:alpine  # Tab instead of spaces

# Correct (2 spaces):
frontend:
  image: nginx:alpine  # 2 spaces
```

**Error 3: Missing Quotes**
```yaml
# Wrong:
volumes:
  - /root/frontend/dist:/usr/share/nginx/html:ro

# If path has special chars, might need quotes
```

### Step 4: Fix the Error

**Option A: Edit manually**
```bash
nano docker-compose.yml

# Go to line 50 (Ctrl+_ then type 50)
# Fix the syntax error
# Save (Ctrl+X, Y, Enter)
```

**Option B: Check what's on line 50**
```bash
# Show line 50
sed -n '50p' docker-compose.yml

# Show context (lines 45-55)
sed -n '45,55p' docker-compose.yml
```

### Step 5: Validate After Fix

```bash
# Check syntax
docker compose config

# If no errors, restart
docker compose up -d frontend
```

## Quick Fix Template

If the frontend section is the problem, here's the correct format:

```yaml
frontend:
  image: nginx:alpine
  ports:
    - "80:80"
  volumes:
    - /root/frontend/dist:/usr/share/nginx/html:ro
    - /root/frontend/nginx-spa.conf:/etc/nginx/conf.d/default.conf:ro
  restart: unless-stopped
```

**Important:**
- Use **2 spaces** for indentation (not tabs)
- Colon `:` after `frontend`
- Hyphen `-` for list items
- Quotes around port mapping `"80:80"`

## Validate YAML

```bash
# Check if YAML is valid
docker compose config > /dev/null && echo "✅ Valid" || echo "❌ Invalid"

# See the error
docker compose config
```

Run `docker compose config` to see the exact error message!

