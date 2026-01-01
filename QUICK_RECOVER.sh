#!/bin/bash
# Quick Recover - Fastest way to restore frontend folder

cd /root

# Remove if exists (broken)
rm -rf frontend

# Clone fresh
git clone git@github.com:louienemesh/ResonantGraphAI_FrontendV0.1-.git frontend

cd frontend

# Install dependencies
npm install

echo "✅ Frontend folder recovered!"
echo ""
echo "Location: /root/frontend"
echo "Next: bash SIMPLE_REBUILD.sh"

