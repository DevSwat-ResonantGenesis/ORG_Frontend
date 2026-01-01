# 🔧 Fix YAML Error on Line 50

## Quick Fix Steps

### Step 1: See What's on Line 50

```bash
cd /root/ResonantGraphAIV0.1

# Show line 50 and context
sed -n '45,55p' docker-compose.yml
```

### Step 2: Common Issues on Line 50

**Issue 1: Missing Colon**
```yaml
# Wrong:
frontend
  image: nginx:alpine

# Correct:
frontend:
  image: nginx:alpine
```

**Issue 2: Wrong Indentation**
```yaml
# Wrong (tabs or wrong spacing):
frontend:
	image: nginx:alpine  # Tab

# Correct (2 spaces):
frontend:
  image: nginx:alpine  # 2 spaces
```

**Issue 3: Trailing Characters**
```yaml
# Wrong:
frontend: # extra comment or space

# Correct:
frontend:
```

### Step 3: Fix It

```bash
# Edit the file
nano docker-compose.yml

# Jump to line 50: Press Ctrl+_ then type 50, Enter
# Fix the error
# Save: Ctrl+X, Y, Enter
```

### Step 4: Validate

```bash
# Check if YAML is now valid
docker compose config

# If valid, restart
docker compose up -d frontend
```

## Quick Diagnostic

```bash
cd /root/ResonantGraphAIV0.1 && \
echo "=== Line 50 ===" && \
sed -n '50p' docker-compose.yml && \
echo "" && \
echo "=== Context (lines 45-55) ===" && \
sed -n '45,55p' docker-compose.yml
```

Run this to see what's wrong on line 50!

