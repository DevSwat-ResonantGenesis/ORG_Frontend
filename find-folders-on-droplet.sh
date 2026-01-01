#!/bin/bash
# Script to find Frontend and Backend folders on Droplet
# Run this ON YOUR DROPLET: ssh root@137.184.234.252

echo "🔍 Finding Frontend and Backend folders on Droplet..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ============================================
# FIND FRONTEND FOLDER
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📦 SEARCHING FOR FRONTEND FOLDER...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

FRONTEND_FOUND=false

# Method 1: Check common locations
echo "Checking common locations..."
COMMON_FRONTEND_PATHS=(
    "/root/ResonantGraphAI_FrontendV0.1"
    "/root/frontend"
    "/var/www/frontend"
    "/opt/frontend"
    "/home/ubuntu/frontend"
)

for path in "${COMMON_FRONTEND_PATHS[@]}"; do
    if [ -d "$path" ] && [ -d "$path/.git" ]; then
        echo -e "${GREEN}✓ FOUND FRONTEND: $path${NC}"
        echo "  - Has .git: Yes"
        echo "  - Has package.json: $([ -f "$path/package.json" ] && echo 'Yes' || echo 'No')"
        echo "  - Has Dockerfile: $([ -f "$path/Dockerfile" ] && echo 'Yes' || echo 'No')"
        FRONTEND_FOUND=true
        FRONTEND_DIR="$path"
        break
    fi
done

# Method 2: Search by name
if [ "$FRONTEND_FOUND" = false ]; then
    echo ""
    echo "Searching for folders with 'frontend' in name..."
    FRONTEND_SEARCH=$(find /root /home /var/www /opt -maxdepth 3 -type d -iname "*frontend*" 2>/dev/null | grep -v node_modules | head -5)
    
    if [ ! -z "$FRONTEND_SEARCH" ]; then
        echo -e "${YELLOW}Found potential frontend folders:${NC}"
        echo "$FRONTEND_SEARCH" | while read dir; do
            if [ -d "$dir/.git" ]; then
                echo -e "${GREEN}  ✓ $dir (has .git)${NC}"
                if [ -z "$FRONTEND_DIR" ]; then
                    FRONTEND_DIR="$dir"
                fi
            else
                echo -e "${YELLOW}  - $dir (no .git)${NC}"
            fi
        done
    fi
fi

# Method 3: Find by package.json
if [ "$FRONTEND_FOUND" = false ]; then
    echo ""
    echo "Searching for folders with package.json..."
    FRONTEND_BY_PACKAGE=$(find /root /home /var/www /opt -maxdepth 3 -name "package.json" -type f 2>/dev/null | head -5)
    
    if [ ! -z "$FRONTEND_BY_PACKAGE" ]; then
        echo -e "${YELLOW}Found folders with package.json:${NC}"
        echo "$FRONTEND_BY_PACKAGE" | while read file; do
            dir=$(dirname "$file")
            if [ -d "$dir/.git" ]; then
                echo -e "${GREEN}  ✓ $dir (has .git and package.json)${NC}"
                if [ -z "$FRONTEND_DIR" ]; then
                    FRONTEND_DIR="$dir"
                fi
            fi
        done
    fi
fi

# Method 4: Find by Docker containers
echo ""
echo "Checking Docker containers for frontend..."
FRONTEND_CONTAINERS=$(docker ps --format "{{.Names}}" 2>/dev/null | grep -i frontend || echo "")
if [ ! -z "$FRONTEND_CONTAINERS" ]; then
    echo -e "${YELLOW}Found frontend containers:${NC}"
    echo "$FRONTEND_CONTAINERS" | while read container; do
        WORK_DIR=$(docker inspect "$container" --format '{{.Config.Labels.com.docker.compose.project.working_dir}}' 2>/dev/null)
        if [ ! -z "$WORK_DIR" ] && [ "$WORK_DIR" != "<no value>" ]; then
            echo -e "${GREEN}  Container: $container -> $WORK_DIR${NC}"
        fi
    done
fi

echo ""

# ============================================
# FIND BACKEND FOLDER
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📦 SEARCHING FOR BACKEND FOLDER...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

BACKEND_FOUND=false

# Method 1: Check common locations
echo "Checking common locations..."
COMMON_BACKEND_PATHS=(
    "/root/ResonantGraphAIV0.1"
    "/root/backend"
    "/var/www/backend"
    "/opt/backend"
    "/home/ubuntu/backend"
)

for path in "${COMMON_BACKEND_PATHS[@]}"; do
    if [ -d "$path" ] && [ -d "$path/.git" ]; then
        echo -e "${GREEN}✓ FOUND BACKEND: $path${NC}"
        echo "  - Has .git: Yes"
        echo "  - Has main.py: $([ -f "$path/backend/fastapi_app/main.py" ] && echo 'Yes' || echo 'No')"
        echo "  - Has docker-compose.yml: $([ -f "$path/docker-compose.yml" ] && echo 'Yes' || echo 'No')"
        BACKEND_FOUND=true
        BACKEND_DIR="$path"
        break
    fi
done

# Method 2: Search by name
if [ "$BACKEND_FOUND" = false ]; then
    echo ""
    echo "Searching for folders with 'ResonantGraph' or 'backend' in name..."
    BACKEND_SEARCH=$(find /root /home /var/www /opt -maxdepth 3 -type d \( -iname "*resonant*" -o -iname "*backend*" \) 2>/dev/null | grep -v node_modules | head -5)
    
    if [ ! -z "$BACKEND_SEARCH" ]; then
        echo -e "${YELLOW}Found potential backend folders:${NC}"
        echo "$BACKEND_SEARCH" | while read dir; do
            if [ -d "$dir/.git" ]; then
                echo -e "${GREEN}  ✓ $dir (has .git)${NC}"
                if [ -z "$BACKEND_DIR" ]; then
                    BACKEND_DIR="$dir"
                fi
            else
                echo -e "${YELLOW}  - $dir (no .git)${NC}"
            fi
        done
    fi
fi

# Method 3: Find by docker-compose.yml
if [ "$BACKEND_FOUND" = false ]; then
    echo ""
    echo "Searching for folders with docker-compose.yml..."
    BACKEND_BY_DOCKER=$(find /root /home /var/www /opt -maxdepth 3 -name "docker-compose.yml" -type f 2>/dev/null | head -5)
    
    if [ ! -z "$BACKEND_BY_DOCKER" ]; then
        echo -e "${YELLOW}Found folders with docker-compose.yml:${NC}"
        echo "$BACKEND_BY_DOCKER" | while read file; do
            dir=$(dirname "$file")
            if [ -d "$dir/.git" ]; then
                echo -e "${GREEN}  ✓ $dir (has .git and docker-compose.yml)${NC}"
                if [ -z "$BACKEND_DIR" ]; then
                    BACKEND_DIR="$dir"
                fi
            fi
        done
    fi
fi

# Method 4: Find by Docker containers
echo ""
echo "Checking Docker containers for backend..."
BACKEND_CONTAINERS=$(docker ps --format "{{.Names}}" 2>/dev/null | grep -iE "api|backend" || echo "")
if [ ! -z "$BACKEND_CONTAINERS" ]; then
    echo -e "${YELLOW}Found backend/api containers:${NC}"
    echo "$BACKEND_CONTAINERS" | while read container; do
        WORK_DIR=$(docker inspect "$container" --format '{{.Config.Labels.com.docker.compose.project.working_dir}}' 2>/dev/null)
        if [ ! -z "$WORK_DIR" ] && [ "$WORK_DIR" != "<no value>" ]; then
            echo -e "${GREEN}  Container: $container -> $WORK_DIR${NC}"
        fi
    done
fi

echo ""

# ============================================
# SUMMARY
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📋 SUMMARY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ ! -z "$FRONTEND_DIR" ]; then
    echo -e "${GREEN}✅ FRONTEND FOLDER:${NC}"
    echo "   $FRONTEND_DIR"
    echo ""
    echo "   To use in deployment script:"
    echo "   FRONTEND_DIR=\"$FRONTEND_DIR\""
else
    echo -e "${YELLOW}⚠️  FRONTEND FOLDER: Not found${NC}"
    echo "   Please check manually or set in deployment script"
fi

echo ""

if [ ! -z "$BACKEND_DIR" ]; then
    echo -e "${GREEN}✅ BACKEND FOLDER:${NC}"
    echo "   $BACKEND_DIR"
    echo ""
    echo "   To use in deployment script:"
    echo "   BACKEND_DIR=\"$BACKEND_DIR\""
else
    echo -e "${YELLOW}⚠️  BACKEND FOLDER: Not found${NC}"
    echo "   Please check manually or set in deployment script"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ============================================
# LIST ALL GIT REPOS
# ============================================
echo -e "${BLUE}📁 ALL GIT REPOSITORIES FOUND:${NC}"
echo ""
ALL_GIT_REPOS=$(find /root /home /var/www /opt -maxdepth 3 -type d -name ".git" 2>/dev/null | xargs dirname)
if [ ! -z "$ALL_GIT_REPOS" ]; then
    echo "$ALL_GIT_REPOS" | while read repo; do
        echo "  - $repo"
    done
else
    echo "  No git repositories found"
fi

echo ""
echo "✅ Done! Use the paths above in your deployment script."

