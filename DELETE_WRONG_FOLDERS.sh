#!/bin/bash
# Delete Wrong Folders from Droplet
# ONLY deletes folders that are NOT the correct structure
# Based on PERMANENT_FOLDER_STRUCTURE.md

set -e

echo "🗑️  Deleting Wrong Folders from Droplet"
echo "========================================="
echo ""
echo "According to PERMANENT_FOLDER_STRUCTURE.md:"
echo "  ✅ CORRECT Frontend: /root/frontend/"
echo "  ✅ CORRECT Backend:  /root/ResonantGraphAIV0.1/"
echo ""

cd /root

# Step 1: List all folders
echo "📋 Step 1: Checking folders in /root..."
echo ""
echo "Current folders:"
ls -d */ 2>/dev/null | sed 's|/$||' | while read folder; do
    echo "  - $folder"
done
echo ""

# Step 2: Identify wrong folders
echo "📋 Step 2: Identifying wrong folders..."
echo ""

WRONG_FOLDERS=()

# Check for wrong frontend folder names
POSSIBLE_WRONG=(
    "ResonantGraphAI_FrontendV0.1-"
    "ResonantGraphAI_FrontendV0.1"
    "frontend-backup"
    "frontend.old"
    "frontend.broken"
)

for folder in "${POSSIBLE_WRONG[@]}"; do
    if [ -d "/root/$folder" ]; then
        # Make sure it's not the correct one
        if [ "$folder" != "frontend" ] && [ "$folder" != "ResonantGraphAIV0.1" ]; then
            echo "⚠️  Found wrong folder: $folder"
            WRONG_FOLDERS+=("$folder")
        fi
    fi
done

# Check for any frontend-* or ResonantGraphAI_Frontend* folders
for folder in /root/*; do
    if [ -d "$folder" ]; then
        folder_name=$(basename "$folder")
        # If it starts with ResonantGraphAI_Frontend but is NOT the correct one
        if [[ "$folder_name" == ResonantGraphAI_Frontend* ]] && [ "$folder_name" != "ResonantGraphAI_FrontendV0.1-" ]; then
            echo "⚠️  Found wrong folder: $folder_name"
            WRONG_FOLDERS+=("$folder_name")
        fi
    fi
done

echo ""

# Step 3: Confirm before deleting
if [ ${#WRONG_FOLDERS[@]} -eq 0 ]; then
    echo "✅ No wrong folders found!"
    echo "   All folders are correct"
    exit 0
fi

echo "📋 Step 3: Folders to delete:"
for folder in "${WRONG_FOLDERS[@]}"; do
    echo "   - /root/$folder"
    if [ -d "/root/$folder" ]; then
        SIZE=$(du -sh "/root/$folder" 2>/dev/null | cut -f1)
        echo "     Size: $SIZE"
    fi
done
echo ""

# Step 4: Safety check - make sure correct folders exist
echo "📋 Step 4: Verifying correct folders exist..."
if [ -d "/root/frontend" ] && [ -f "/root/frontend/package.json" ]; then
    echo "✅ Correct frontend folder exists: /root/frontend"
else
    echo "❌ ERROR: Correct frontend folder NOT found!"
    echo "   Will NOT delete anything - too risky"
    exit 1
fi

if [ -d "/root/ResonantGraphAIV0.1" ]; then
    echo "✅ Correct backend folder exists: /root/ResonantGraphAIV0.1"
else
    echo "⚠️  Backend folder not found (might be OK if not deployed)"
fi
echo ""

# Step 5: Delete wrong folders
echo "📋 Step 5: Deleting wrong folders..."
echo ""

for folder in "${WRONG_FOLDERS[@]}"; do
    if [ -d "/root/$folder" ]; then
        echo "   Deleting: /root/$folder"
        rm -rf "/root/$folder"
        if [ ! -d "/root/$folder" ]; then
            echo "   ✅ Deleted: $folder"
        else
            echo "   ❌ Failed to delete: $folder"
        fi
    fi
done
echo ""

# Step 6: Final verification
echo "📋 Step 6: Final verification..."
echo ""
echo "Remaining folders in /root:"
ls -d */ 2>/dev/null | sed 's|/$||' | while read folder; do
    if [ "$folder" = "frontend" ] || [ "$folder" = "ResonantGraphAIV0.1" ]; then
        echo "  ✅ $folder (CORRECT)"
    else
        echo "  📁 $folder"
    fi
done
echo ""

echo "=========================================="
echo "✅✅✅ CLEANUP COMPLETE! ✅✅✅"
echo "=========================================="
echo ""
echo "✅ Correct folders kept:"
echo "   - /root/frontend/"
echo "   - /root/ResonantGraphAIV0.1/"
echo ""
echo "🗑️  Wrong folders deleted"
echo ""

