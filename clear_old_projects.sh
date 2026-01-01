#!/bin/bash

# Clear Old Project Data Script
# This script clears old project data from frontend cache, backend database, and filesystem

set -e

echo "🧹 Clearing Old Project Data..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get organization ID
ORG_ID=${1:-""}

if [ -z "$ORG_ID" ]; then
    echo -e "${YELLOW}⚠️  No organization ID provided.${NC}"
    echo "Usage: ./clear_old_projects.sh <org-id>"
    echo ""
    echo "To find your org ID:"
    echo "1. Open browser DevTools (F12)"
    echo "2. Go to Application → Cookies"
    echo "3. Look for 'rg-org-id' cookie"
    echo ""
    read -p "Enter your organization ID (or press Enter to skip database cleanup): " ORG_ID
fi

# Step 1: Clear frontend cache instructions
echo -e "${GREEN}📱 Step 1: Frontend Cache${NC}"
echo "To clear frontend cache, open browser console and run:"
echo ""
echo "  localStorage.clear();"
echo "  sessionStorage.clear();"
echo ""
read -p "Press Enter after clearing browser cache..."

# Step 2: Clear filesystem
if [ ! -z "$ORG_ID" ]; then
    echo ""
    echo -e "${GREEN}📁 Step 2: Clearing Project Files${NC}"
    PROJECT_DIR="/tmp/resonant_projects/${ORG_ID}"
    
    if [ -d "$PROJECT_DIR" ]; then
        echo "Found projects directory: $PROJECT_DIR"
        read -p "Delete all projects in this directory? (y/N): " confirm
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            rm -rf "${PROJECT_DIR}"/*
            echo -e "${GREEN}✅ Project files cleared!${NC}"
        else
            echo "Skipped filesystem cleanup."
        fi
    else
        echo "Projects directory not found: $PROJECT_DIR"
    fi
else
    echo ""
    echo -e "${YELLOW}⚠️  Skipping filesystem cleanup (no org ID provided)${NC}"
fi

# Step 3: Database cleanup
if [ ! -z "$ORG_ID" ]; then
    echo ""
    echo -e "${GREEN}🗄️  Step 3: Database Cleanup${NC}"
    echo "To clear database, connect to PostgreSQL and run:"
    echo ""
    echo "  DELETE FROM memory_anchors WHERE org_id = '${ORG_ID}';"
    echo "  DELETE FROM resonance_clusters WHERE org_id = '${ORG_ID}';"
    echo "  DELETE FROM memories WHERE org_id = '${ORG_ID}';"
    echo "  DELETE FROM conversations WHERE org_id = '${ORG_ID}';"
    echo "  DELETE FROM messages WHERE org_id = '${ORG_ID}';"
    echo ""
    
    # Check if psql is available
    if command -v psql &> /dev/null; then
        read -p "Do you want to run database cleanup now? (y/N): " db_confirm
        if [ "$db_confirm" = "y" ] || [ "$db_confirm" = "Y" ]; then
            read -p "Enter database name: " DB_NAME
            read -p "Enter database user: " DB_USER
            read -p "Enter database host (default: localhost): " DB_HOST
            DB_HOST=${DB_HOST:-localhost}
            
            echo "Connecting to database..."
            PGPASSWORD=${PGPASSWORD:-""} psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" <<EOF
DELETE FROM memory_anchors WHERE org_id = '${ORG_ID}';
DELETE FROM resonance_clusters WHERE org_id = '${ORG_ID}';
DELETE FROM memories WHERE org_id = '${ORG_ID}';
DELETE FROM conversations WHERE org_id = '${ORG_ID}';
DELETE FROM messages WHERE org_id = '${ORG_ID}';
SELECT 'Cleaned up data for org: ${ORG_ID}' as result;
EOF
            echo -e "${GREEN}✅ Database cleanup complete!${NC}"
        else
            echo "Skipped database cleanup."
        fi
    else
        echo -e "${YELLOW}⚠️  psql not found. Please run SQL commands manually.${NC}"
    fi
else
    echo ""
    echo -e "${YELLOW}⚠️  Skipping database cleanup (no org ID provided)${NC}"
fi

echo ""
echo -e "${GREEN}✅ Cleanup process complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Hard refresh browser (Cmd/Ctrl + Shift + R)"
echo "2. Re-upload your current project to IDE"
echo "3. Test chat - it should now use only current project"
echo ""

