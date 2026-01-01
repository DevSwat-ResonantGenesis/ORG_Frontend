#!/bin/bash
# Script to find the correct directory names on your droplet

echo "🔍 Finding directories..."
echo ""

echo "📁 Frontend source code directories:"
ls -la ~/ | grep -i "frontend\|resonant" | grep -v "^d.*\\.$" | grep -v "^d.*\\.\\.$"

echo ""
echo "📁 All directories in /root:"
ls -la ~/ | grep "^d" | grep -v "^d.*\\.$" | grep -v "^d.*\\.\\.$"

echo ""
echo "💡 Run this to find your frontend directory:"
echo "   ls -la ~/ | grep -i frontend"

