#!/bin/bash
# Remove incorrectly added frontend service from backend docker-compose.yml
# Run this ON YOUR DROPLET

cd /root/ResonantGraphAIV0.1

echo "🔧 Removing 'frontend:' service from backend docker-compose.yml..."
echo ""

# Backup
cp docker-compose.yml docker-compose.yml.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup created: docker-compose.yml.backup.*"

# Find where frontend service starts and ends
FRONTEND_START=$(grep -n "^  frontend:\|^frontend:" docker-compose.yml | cut -d: -f1 | head -1)

if [ -z "$FRONTEND_START" ]; then
    echo "✅ No 'frontend:' service found - nothing to remove"
    exit 0
fi

echo "📍 Found 'frontend:' service starting at line $FRONTEND_START"
echo ""

# Show what will be removed
echo "📋 Frontend service section (will be removed):"
sed -n "${FRONTEND_START},$((FRONTEND_START+20))p" docker-compose.yml | head -15
echo ""

# Find where the next service starts (or end of file)
TOTAL_LINES=$(wc -l < docker-compose.yml)
NEXT_SERVICE=$(sed -n "$((FRONTEND_START+1)),${TOTAL_LINES}p" docker-compose.yml | grep -n "^[a-z].*:" | head -1 | cut -d: -f1)

if [ -z "$NEXT_SERVICE" ]; then
    # No next service, remove until end of file (but keep last newline)
    FRONTEND_END=$TOTAL_LINES
else
    FRONTEND_END=$((FRONTEND_START + NEXT_SERVICE - 2))
fi

echo "📍 Will remove lines $FRONTEND_START to $FRONTEND_END"
echo ""

# Remove the frontend service
sed -i "${FRONTEND_START},${FRONTEND_END}d" docker-compose.yml

echo "✅ Removed 'frontend:' service from backend docker-compose.yml"
echo ""

# Validate
echo "🔍 Validating YAML..."
docker compose config > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ YAML is now valid!"
    echo ""
    echo "📋 Remaining services:"
    grep -n "^[a-z].*:" docker-compose.yml
    echo ""
    echo "🚀 You can now run: docker compose up -d"
else
    echo "❌ Still has errors. Restoring backup..."
    mv docker-compose.yml.backup.* docker-compose.yml 2>/dev/null
    echo "⚠️  Please check manually"
fi

