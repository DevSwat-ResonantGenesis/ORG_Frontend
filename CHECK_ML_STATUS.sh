#!/bin/bash

# Check ML infrastructure and model status
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 CHECKING ML INFRASTRUCTURE STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /root/ResonantGraphAIV0.1 2>/dev/null || cd "$(dirname "$0")/.." || echo "⚠️  Could not find backend directory"

echo "📋 Step 1: Checking ML Worker Container..."
if docker compose ps ml-worker 2>/dev/null | grep -q "Up"; then
    echo "   ✅ ML Worker is running"
    ML_WORKER_STATUS="running"
else
    echo "   ❌ ML Worker is not running"
    ML_WORKER_STATUS="stopped"
fi
echo ""

echo "📋 Step 2: Checking ML Worker Health..."
ML_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://137.184.234.252:9000/health 2>/dev/null || echo "000")
if [ "$ML_HEALTH" = "200" ]; then
    echo "   ✅ ML Worker health check: OK"
else
    echo "   ⚠️  ML Worker health check: $ML_HEALTH"
fi
echo ""

echo "📋 Step 3: Checking ML Worker Logs (last 20 lines)..."
echo "   Recent logs:"
docker compose logs ml-worker --tail 20 2>/dev/null | tail -5 | sed 's/^/   /' || echo "   ⚠️  Could not read logs"
echo ""

echo "📋 Step 4: Checking API ML Endpoints..."
API_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://137.184.234.252:8001/health 2>/dev/null || echo "000")
if [ "$API_HEALTH" = "200" ]; then
    echo "   ✅ API is running"
    
    # Try to get models list (may require auth)
    MODELS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://137.184.234.252:8001/ml/models 2>/dev/null || echo "000")
    if [ "$MODELS_RESPONSE" = "200" ]; then
        echo "   ✅ ML Models endpoint accessible"
    elif [ "$MODELS_RESPONSE" = "401" ] || [ "$MODELS_RESPONSE" = "403" ]; then
        echo "   ⚠️  ML Models endpoint requires authentication"
    else
        echo "   ⚠️  ML Models endpoint: $MODELS_RESPONSE"
    fi
else
    echo "   ❌ API is not running"
fi
echo ""

echo "📋 Step 5: Checking for Existing Models..."
# Check if models directory exists in ML worker
if docker compose exec -T ml-worker ls /app/models 2>/dev/null | head -1 > /dev/null; then
    MODEL_COUNT=$(docker compose exec -T ml-worker ls /app/models 2>/dev/null | wc -l || echo "0")
    if [ "$MODEL_COUNT" -gt 0 ]; then
        echo "   ✅ Found $MODEL_COUNT model(s) in ML worker"
        echo "   Models:"
        docker compose exec -T ml-worker ls /app/models 2>/dev/null | sed 's/^/      - /' || echo "      (could not list)"
    else
        echo "   ⚠️  No models found in ML worker"
    fi
else
    echo "   ⚠️  Models directory not found or not accessible"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$ML_WORKER_STATUS" = "running" ] && [ "$ML_HEALTH" = "200" ]; then
    echo "✅ ML Infrastructure: READY"
    echo ""
    echo "   You can:"
    echo "   - Start training jobs"
    echo "   - Use existing models"
    echo "   - Make predictions"
    echo ""
    echo "   Next steps:"
    echo "   1. Check if models exist (see above)"
    echo "   2. If no models: Prepare training data and train"
    echo "   3. If models exist: Test predictions"
else
    echo "⚠️  ML Infrastructure: NEEDS ATTENTION"
    echo ""
    if [ "$ML_WORKER_STATUS" != "running" ]; then
        echo "   - ML Worker is not running"
        echo "   - Start it: docker compose up -d ml-worker"
    fi
    if [ "$ML_HEALTH" != "200" ]; then
        echo "   - ML Worker health check failed"
        echo "   - Check logs: docker compose logs ml-worker"
    fi
fi
echo ""

echo "📚 For more information:"
echo "   - Training guide: ML_TRAINING_GUIDE.md"
echo "   - Testing guide: COMPLETE_TESTING_GUIDE.md"
echo ""

