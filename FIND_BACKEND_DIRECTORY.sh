#!/bin/bash
# Script to find backend directory on Droplet
# Run this on your Droplet

echo "🔍 Finding backend directory..."
echo ""

# Method 1: Find docker-compose.yml
echo "📋 Method 1: Looking for docker-compose.yml..."
find /root /home -name "docker-compose.yml" -type f 2>/dev/null | head -5
echo ""

# Method 2: Find ResonantGraph directory
echo "📋 Method 2: Looking for ResonantGraph directories..."
find /root /home -type d -name "*Resonant*" 2>/dev/null
echo ""

# Method 3: Find backend folder
echo "📋 Method 3: Looking for backend folders..."
find /root /home -type d -name "*backend*" 2>/dev/null
echo ""

# Method 4: Check common locations
echo "📋 Method 4: Checking common locations..."
echo "Checking /root/..."
ls -la /root/ 2>/dev/null | grep -E "Resonant|backend|graph" || echo "  No matches"
echo ""

# Method 5: Find from running containers
echo "📋 Method 5: Finding from running Docker containers..."
docker ps --format "{{.Names}}" | while read container; do
  if [ ! -z "$container" ]; then
    working_dir=$(docker inspect "$container" --format '{{.Config.Labels.com.docker.compose.project.working_dir}}' 2>/dev/null)
    if [ ! -z "$working_dir" ] && [ "$working_dir" != "<no value>" ]; then
      echo "  Container: $container -> $working_dir"
    fi
  fi
done
echo ""

# Method 6: Check docker compose projects
echo "📋 Method 6: Checking docker compose projects..."
docker compose ls 2>/dev/null || docker-compose ps 2>/dev/null || echo "  docker compose not found in current directory"
echo ""

echo "✅ Done! Look for the directory that contains docker-compose.yml"
echo ""
echo "Once found, use:"
echo "  cd /path/to/backend"
echo "  docker compose ps"

