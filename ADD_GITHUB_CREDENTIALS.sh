#!/bin/bash
# Script to add GitHub OAuth credentials to backend .env file

BACKEND_ENV="/Applications/ResonantGraphAIV0.1/.env"

echo "🔐 Adding GitHub OAuth credentials to .env file..."
echo ""

# Check if .env file exists
if [ ! -f "$BACKEND_ENV" ]; then
    echo "⚠️  .env file not found at $BACKEND_ENV"
    echo "Creating new .env file..."
    touch "$BACKEND_ENV"
fi

# Check if credentials already exist
if grep -q "GITHUB_CLIENT_ID" "$BACKEND_ENV"; then
    echo "⚠️  GitHub credentials already exist in .env"
    echo "Updating existing values..."
    
    # Remove old values
    sed -i.bak '/^GITHUB_CLIENT_ID=/d' "$BACKEND_ENV"
    sed -i.bak '/^GITHUB_CLIENT_SECRET=/d' "$BACKEND_ENV"
    sed -i.bak '/^GITHUB_TOKEN_ENCRYPTION_KEY=/d' "$BACKEND_ENV"
    sed -i.bak '/^API_BASE_URL=/d' "$BACKEND_ENV"
    sed -i.bak '/^FRONTEND_URL=/d' "$BACKEND_ENV"
else
    echo "✅ Adding new GitHub credentials..."
fi

# Add credentials
cat >> "$BACKEND_ENV" << EOF

# GitHub OAuth Configuration
GITHUB_CLIENT_ID=Ov23li7cAVtZtFH5g7PU
GITHUB_CLIENT_SECRET=50d59cd51d4582ff5d4661978011d1b2d03d7a8f
GITHUB_TOKEN_ENCRYPTION_KEY=4aCfW9jcg9JSzMnIGKdJCNhmuPLcyPgBR-NjjAAy9j8=

# API URLs (for OAuth redirects)
API_BASE_URL=http://localhost:8001
FRONTEND_URL=http://localhost:5175
EOF

echo ""
echo "✅ GitHub OAuth credentials added to $BACKEND_ENV"
echo ""
echo "📋 Added values:"
echo "   GITHUB_CLIENT_ID=Ov23li7cAVtZtFH5g7PU"
echo "   GITHUB_CLIENT_SECRET=50d59cd51d4582ff5d4661978011d1b2d03d7a8f"
echo "   GITHUB_TOKEN_ENCRYPTION_KEY=4aCfW9jcg9JSzMnIGKdJCNhmuPLcyPgBR-NjjAAy9j8="
echo ""
echo "🔄 Next step: Restart backend API"
echo "   cd /Applications/ResonantGraphAIV0.1"
echo "   docker compose restart api"
echo ""

