#!/bin/bash

# Security Audit Script for ResonantGraph AI
# Run this script to perform security checks

set -e

echo "🔒 Starting Security Audit..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Frontend Security Audit
echo -e "${YELLOW}📦 Frontend Security Audit...${NC}"
cd /Applications/ResonantGraphAI_FrontendV0.1

echo "Running npm audit..."
npm audit --audit-level=moderate || echo -e "${YELLOW}⚠️  Some vulnerabilities found. Review and fix.${NC}"

echo ""
echo "Checking for hardcoded secrets..."
if grep -r "password\|secret\|key\|token" --include="*.ts" --include="*.tsx" --include="*.js" src/ | grep -v "//\|test\|example\|placeholder" | grep -v "process.env\|import.meta.env"; then
    echo -e "${RED}❌ Potential hardcoded secrets found!${NC}"
else
    echo -e "${GREEN}✅ No hardcoded secrets found${NC}"
fi

# Backend Security Audit
echo ""
echo -e "${YELLOW}🐍 Backend Security Audit...${NC}"
cd /Applications/ResonantGraphAIV0.1/backend

echo "Checking Python dependencies..."
if command -v safety &> /dev/null; then
    safety check -r fastapi_requirements.txt || echo -e "${YELLOW}⚠️  Some vulnerabilities found. Review and fix.${NC}"
else
    echo -e "${YELLOW}⚠️  Safety not installed. Install with: pip install safety${NC}"
fi

echo ""
echo "Checking for hardcoded secrets..."
if grep -r "password\|secret\|key\|token" --include="*.py" . | grep -v "#\|test\|example\|placeholder" | grep -v "os.getenv\|os.environ"; then
    echo -e "${RED}❌ Potential hardcoded secrets found!${NC}"
else
    echo -e "${GREEN}✅ No hardcoded secrets found${NC}"
fi

echo ""
echo -e "${GREEN}✅ Security audit complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Review and fix any vulnerabilities found"
echo "2. Run OWASP ZAP scan: https://www.zaproxy.org/"
echo "3. Run Snyk scan: https://snyk.io/"
echo "4. Review security headers in nginx.conf"
echo "5. Verify CORS configuration"

