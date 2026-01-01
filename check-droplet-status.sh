#!/bin/bash
# 🔍 Comprehensive Droplet Status Check Script
# Checks all folders, connections, Docker containers, and website status

set -e

DROPLET_IP="137.184.234.252"
DOMAIN="dev-swat.com"
FRONTEND_DIR="/root/ResonantGraphAI_FrontendV0.1-"
BACKEND_DIR="/root/ResonantGraphAIV0.1"
NGINX_CONFIG_DIR="/root/frontend"

echo "═══════════════════════════════════════════════════════════════"
echo "🔍 COMPREHENSIVE DROPLET STATUS CHECK"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# ============================================================================
# 1. SYSTEM INFORMATION
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SYSTEM INFORMATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🖥️  Hostname: $(hostname)"
echo "🌐 IP Address: $(hostname -I | awk '{print $1}')"
echo "💻 OS: $(lsb_release -d | cut -f2)"
echo "⏰ Uptime: $(uptime -p)"
echo ""

# Disk space
echo "💾 DISK SPACE:"
df -h / | tail -1 | awk '{print "   Total: " $2 " | Used: " $3 " (" $5 ") | Available: " $4}'
echo ""

# Memory
echo "🧠 MEMORY:"
free -h | grep Mem | awk '{print "   Total: " $2 " | Used: " $3 " | Free: " $4 " | Available: " $7}'
echo ""

# ============================================================================
# 2. FOLDER STRUCTURE - FULL LIST
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📁 FOLDER STRUCTURE - ROOT DIRECTORY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📂 Contents of /root/:"
ls -lah /root/ | grep -E "^d" | awk '{print "   " $9 " (" $5 ")"}'
echo ""

echo "📂 All files and folders in /root/:"
ls -lah /root/ | tail -n +4
echo ""

# Check specific directories
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📁 CHECKING KEY DIRECTORIES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Frontend directory
if [ -d "$FRONTEND_DIR" ]; then
    print_status 0 "Frontend directory exists: $FRONTEND_DIR"
    echo "   Size: $(du -sh $FRONTEND_DIR 2>/dev/null | cut -f1)"
    echo "   Contents:"
    ls -lah "$FRONTEND_DIR" | head -15 | tail -n +4
    echo ""
    
    # Check dist folder
    if [ -d "$FRONTEND_DIR/dist" ]; then
        print_status 0 "Frontend dist/ folder exists"
        echo "   Files in dist/: $(find $FRONTEND_DIR/dist -type f | wc -l)"
        echo "   Size: $(du -sh $FRONTEND_DIR/dist 2>/dev/null | cut -f1)"
        if [ -f "$FRONTEND_DIR/dist/index.html" ]; then
            print_status 0 "index.html exists in dist/"
        else
            print_status 1 "index.html MISSING in dist/"
        fi
    else
        print_status 1 "Frontend dist/ folder MISSING"
    fi
else
    print_status 1 "Frontend directory MISSING: $FRONTEND_DIR"
fi
echo ""

# Backend directory
if [ -d "$BACKEND_DIR" ]; then
    print_status 0 "Backend directory exists: $BACKEND_DIR"
    echo "   Size: $(du -sh $BACKEND_DIR 2>/dev/null | cut -f1)"
    echo "   Contents:"
    ls -lah "$BACKEND_DIR" | head -15 | tail -n +4
    echo ""
    
    if [ -f "$BACKEND_DIR/docker-compose.yml" ]; then
        print_status 0 "docker-compose.yml exists"
    else
        print_status 1 "docker-compose.yml MISSING"
    fi
    
    if [ -f "$BACKEND_DIR/.env" ]; then
        print_status 0 ".env file exists"
    else
        print_warning ".env file not found (may be hidden or missing)"
    fi
else
    print_status 1 "Backend directory MISSING: $BACKEND_DIR"
fi
echo ""

# Nginx config directory
if [ -d "$NGINX_CONFIG_DIR" ]; then
    print_status 0 "Nginx config directory exists: $NGINX_CONFIG_DIR"
    echo "   Contents:"
    ls -lah "$NGINX_CONFIG_DIR"
    echo ""
    
    if [ -f "$NGINX_CONFIG_DIR/nginx-ssl.conf" ]; then
        print_status 0 "nginx-ssl.conf exists"
    else
        print_status 1 "nginx-ssl.conf MISSING"
    fi
else
    print_status 1 "Nginx config directory MISSING: $NGINX_CONFIG_DIR"
fi
echo ""

# ============================================================================
# 3. DOCKER CONTAINERS STATUS
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🐳 DOCKER CONTAINERS STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if Docker is installed and running
if command -v docker &> /dev/null; then
    print_status 0 "Docker is installed"
    
    if systemctl is-active --quiet docker; then
        print_status 0 "Docker service is running"
    else
        print_status 1 "Docker service is NOT running"
        echo "   Attempting to start Docker..."
        systemctl start docker
        sleep 2
    fi
else
    print_status 1 "Docker is NOT installed"
fi
echo ""

# List all containers
echo "📋 ALL DOCKER CONTAINERS:"
docker ps -a
echo ""

# Check frontend container
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 FRONTEND CONTAINER (frontend)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if docker ps -a | grep -q "frontend"; then
    print_status 0 "Frontend container exists"
    
    if docker ps | grep -q "frontend"; then
        print_status 0 "Frontend container is RUNNING"
        
        # Check container details
        echo "   Container ID: $(docker ps | grep frontend | awk '{print $1}')"
        echo "   Image: $(docker inspect frontend --format='{{.Config.Image}}' 2>/dev/null || echo 'Unknown')"
        echo "   Status: $(docker inspect frontend --format='{{.State.Status}}' 2>/dev/null || echo 'Unknown')"
        echo "   Ports: $(docker ps | grep frontend | awk '{print $NF}')"
        echo ""
        
        # Check nginx in container
        if docker exec frontend nginx -t 2>/dev/null; then
            print_status 0 "Nginx configuration is valid"
        else
            print_status 1 "Nginx configuration has ERRORS"
            echo "   Nginx test output:"
            docker exec frontend nginx -t 2>&1 | head -5
        fi
        echo ""
        
        # Check if files exist in container
        echo "📄 Files in container (/usr/share/nginx/html/):"
        if docker exec frontend ls /usr/share/nginx/html/ 2>/dev/null | head -10; then
            FILE_COUNT=$(docker exec frontend sh -c 'find /usr/share/nginx/html -type f 2>/dev/null | wc -l' 2>/dev/null || echo "0")
            echo "   Total files: $FILE_COUNT"
            
            if docker exec frontend test -f /usr/share/nginx/html/index.html 2>/dev/null; then
                print_status 0 "index.html exists in container"
            else
                print_status 1 "index.html MISSING in container"
            fi
        else
            print_status 1 "Cannot access container files"
        fi
        echo ""
        
        # Check SSL certificates
        echo "🔒 SSL Certificates:"
        if docker exec frontend test -f /etc/nginx/ssl/fullchain.pem 2>/dev/null; then
            print_status 0 "SSL certificate exists"
            CERT_EXPIRY=$(docker exec frontend sh -c 'openssl x509 -enddate -noout -in /etc/nginx/ssl/fullchain.pem 2>/dev/null | cut -d= -f2' 2>/dev/null || echo "Unknown")
            echo "   Expires: $CERT_EXPIRY"
        else
            print_status 1 "SSL certificate MISSING"
        fi
        echo ""
        
    else
        print_status 1 "Frontend container is NOT running"
        echo "   Attempting to start..."
        docker start frontend
        sleep 3
        if docker ps | grep -q "frontend"; then
            print_status 0 "Container started successfully"
        else
            print_status 1 "Failed to start container"
            echo "   Last 20 lines of logs:"
            docker logs frontend --tail 20 2>/dev/null || echo "   No logs available"
        fi
    fi
else
    print_status 1 "Frontend container does NOT exist"
fi
echo ""

# Check API container
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔌 API CONTAINER (resonantgraphaiv01-api-1)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if docker ps -a | grep -q "resonantgraphaiv01-api-1"; then
    print_status 0 "API container exists"
    
    if docker ps | grep -q "resonantgraphaiv01-api-1"; then
        print_status 0 "API container is RUNNING"
        echo "   Container ID: $(docker ps | grep resonantgraphaiv01-api-1 | awk '{print $1}')"
        echo "   Status: $(docker inspect resonantgraphaiv01-api-1 --format='{{.State.Status}}' 2>/dev/null || echo 'Unknown')"
    else
        print_status 1 "API container is NOT running"
    fi
else
    print_status 1 "API container does NOT exist"
fi
echo ""

# Check ML Worker container
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🤖 ML WORKER CONTAINER (resonantgraphaiv01-ml-worker-1)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if docker ps -a | grep -q "resonantgraphaiv01-ml-worker-1"; then
    print_status 0 "ML Worker container exists"
    
    if docker ps | grep -q "resonantgraphaiv01-ml-worker-1"; then
        print_status 0 "ML Worker container is RUNNING"
        echo "   Container ID: $(docker ps | grep resonantgraphaiv01-ml-worker-1 | awk '{print $1}')"
    else
        print_status 1 "ML Worker container is NOT running"
    fi
else
    print_warning "ML Worker container does NOT exist (may be optional)"
fi
echo ""

# ============================================================================
# 4. NETWORK & PORTS
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 NETWORK & PORTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔌 Listening ports:"
netstat -tuln | grep LISTEN | awk '{print "   " $4 " (" $1 ")"}'
echo ""

# Check specific ports
echo "🔍 Checking key ports:"
for port in 80 443 8001 9000; do
    if netstat -tuln | grep -q ":$port "; then
        print_status 0 "Port $port is listening"
    else
        print_status 1 "Port $port is NOT listening"
    fi
done
echo ""

# Test HTTP/HTTPS connectivity
echo "🌐 Testing website connectivity:"
if curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:80 | grep -q "200\|301\|302"; then
    print_status 0 "HTTP (port 80) is responding"
else
    print_status 1 "HTTP (port 80) is NOT responding"
fi

if curl -s -o /dev/null -w "%{http_code}" --max-time 5 -k https://localhost:443 | grep -q "200\|301\|302"; then
    print_status 0 "HTTPS (port 443) is responding"
else
    print_status 1 "HTTPS (port 443) is NOT responding"
fi

if curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:8001/health 2>/dev/null | grep -q "200"; then
    print_status 0 "API (port 8001) is responding"
else
    print_status 1 "API (port 8001) is NOT responding"
fi
echo ""

# ============================================================================
# 5. NGINX CONFIGURATION
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚙️  NGINX CONFIGURATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if docker ps | grep -q "frontend"; then
    echo "📄 Current nginx config in container:"
    docker exec frontend cat /etc/nginx/conf.d/default.conf 2>/dev/null | head -30 || echo "   Cannot read config"
    echo ""
    
    # Check if API proxy is configured
    if docker exec frontend cat /etc/nginx/conf.d/default.conf 2>/dev/null | grep -q "location /api"; then
        print_status 0 "API proxy (/api) is configured"
    else
        print_status 1 "API proxy (/api) is NOT configured"
    fi
    
    # Check if SPA fallback is configured
    if docker exec frontend cat /etc/nginx/conf.d/default.conf 2>/dev/null | grep -q "try_files.*index.html"; then
        print_status 0 "SPA fallback (try_files) is configured"
    else
        print_status 1 "SPA fallback is NOT configured (may cause 404 errors)"
    fi
else
    print_warning "Cannot check nginx config - frontend container not running"
fi
echo ""

# ============================================================================
# 6. GIT REPOSITORIES
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 GIT REPOSITORIES STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Frontend repo
if [ -d "$FRONTEND_DIR/.git" ]; then
    print_status 0 "Frontend is a git repository"
    cd "$FRONTEND_DIR"
    echo "   Branch: $(git branch --show-current 2>/dev/null || echo 'Unknown')"
    echo "   Remote: $(git remote get-url origin 2>/dev/null || echo 'No remote')"
    echo "   Last commit: $(git log -1 --format='%h - %s (%ar)' 2>/dev/null || echo 'Unknown')"
    cd - > /dev/null
else
    print_warning "Frontend directory is not a git repository"
fi
echo ""

# Backend repo
if [ -d "$BACKEND_DIR/.git" ]; then
    print_status 0 "Backend is a git repository"
    cd "$BACKEND_DIR"
    echo "   Branch: $(git branch --show-current 2>/dev/null || echo 'Unknown')"
    echo "   Remote: $(git remote get-url origin 2>/dev/null || echo 'No remote')"
    echo "   Last commit: $(git log -1 --format='%h - %s (%ar)' 2>/dev/null || echo 'Unknown')"
    cd - > /dev/null
else
    print_warning "Backend directory is not a git repository"
fi
echo ""

# ============================================================================
# 7. EXTERNAL CONNECTIVITY TEST
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌍 EXTERNAL CONNECTIVITY TEST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Testing external access to website:"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://$DOMAIN" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    print_status 0 "Website is accessible externally (HTTP $HTTP_CODE)"
else
    print_status 1 "Website is NOT accessible externally (HTTP $HTTP_CODE)"
    echo "   This could indicate:"
    echo "   - DNS issues"
    echo "   - Firewall blocking"
    echo "   - SSL certificate issues"
    echo "   - Nginx not properly configured"
fi
echo ""

# Test API endpoint
API_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://$DOMAIN/api/health" 2>/dev/null || echo "000")
if [ "$API_CODE" = "200" ]; then
    print_status 0 "API endpoint is accessible (HTTP $API_CODE)"
else
    print_status 1 "API endpoint is NOT accessible (HTTP $API_CODE)"
fi
echo ""

# ============================================================================
# 8. SUMMARY & RECOMMENDATIONS
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 SUMMARY & RECOMMENDATIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔍 Quick diagnostic commands:"
echo ""
echo "1. Check container logs:"
echo "   docker logs frontend --tail 50"
echo "   docker logs resonantgraphaiv01-api-1 --tail 50"
echo ""
echo "2. Restart containers:"
echo "   docker restart frontend"
echo "   cd $BACKEND_DIR && docker-compose restart"
echo ""
echo "3. Rebuild and deploy frontend:"
echo "   cd $FRONTEND_DIR"
echo "   npm run build"
echo "   docker exec frontend rm -rf /usr/share/nginx/html/*"
echo "   docker cp dist/. frontend:/usr/share/nginx/html/"
echo ""
echo "4. Check nginx config:"
echo "   docker exec frontend nginx -t"
echo "   docker exec frontend nginx -s reload"
echo ""
echo "5. Check system resources:"
echo "   htop"
echo "   df -h"
echo "   free -h"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "✅ Status check complete!"
echo "═══════════════════════════════════════════════════════════════"

