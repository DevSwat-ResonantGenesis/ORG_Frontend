#!/bin/bash
# Fix empty line 50 in docker-compose.yml
# Run this ON YOUR DROPLET

cd /root/ResonantGraphAIV0.1

echo "🔧 Fixing empty line 50..."

# Backup first
cp docker-compose.yml docker-compose.yml.backup

# Remove line 50 (empty line)
sed -i '50d' docker-compose.yml

echo "✅ Removed empty line 50"
echo ""
echo "🔍 Validating YAML..."
docker compose config > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ YAML is now valid!"
    echo ""
    echo "🚀 You can now run: docker compose up -d frontend"
else
    echo "❌ Still has errors. Restoring backup..."
    mv docker-compose.yml.backup docker-compose.yml
    echo "📋 Showing context around line 50:"
    sed -n '45,55p' docker-compose.yml
fi

