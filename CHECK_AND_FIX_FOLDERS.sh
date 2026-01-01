#!/bin/bash
# Check folders and fix wrong deployment location

echo "🔍 Checking folder structure..."
echo ""

echo "📁 All folders in /root/:"
ls -la /root/ | grep "^d" | awk '{print "   " $9}'
echo ""

echo "📦 Folders with package.json (frontend indicators):"
find /root -maxdepth 2 -name "package.json" -type f 2>/dev/null | while read file; do
    dir=$(dirname "$file")
    echo "   ✅ $dir"
done
echo ""

echo "🐳 Checking docker-compose.yml in backend:"
if [ -f "/root/ResonantGraphAIV0.1/docker-compose.yml" ]; then
    echo "   Services defined:"
    grep -A 20 "services:" /root/ResonantGraphAIV0.1/docker-compose.yml | grep -E "^\s+[a-z-]+:" | sed 's/^/      /'
    echo ""
    
    if grep -q "frontend:" /root/ResonantGraphAIV0.1/docker-compose.yml; then
        echo "   ⚠️  WARNING: Backend docker-compose.yml has a 'frontend' service"
        echo "   This might be trying to build frontend from wrong location"
        echo ""
        echo "   💡 Solution: Deploy backend services only:"
        echo "      cd /root/ResonantGraphAIV0.1"
        echo "      docker compose up -d --build api ml-worker db"
    fi
fi
echo ""

echo "✅ Correct deployment folders:"
echo "   Frontend: /root/frontend"
echo "   Backend:  /root/ResonantGraphAIV0.1"
echo ""

echo "🚀 To deploy frontend correctly:"
echo "   cd /root/frontend"
echo "   git pull origin main"
echo "   npm run build"
echo "   docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*'"
echo "   docker cp dist/. frontend:/usr/share/nginx/html/"
echo "   docker exec frontend nginx -s reload"

