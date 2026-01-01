#!/bin/bash
# Script to install all required dependencies for IDE features

set -e

echo "🚀 Installing IDE Dependencies"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Backend directory
BACKEND_DIR="/Applications/ResonantGraphAIV0.1"

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Backend directory not found: $BACKEND_DIR${NC}"
    echo "Please update BACKEND_DIR in this script with the correct path."
    exit 1
fi

echo -e "${GREEN}✅ Backend directory found: $BACKEND_DIR${NC}"
echo ""

# Step 1: Install Python dependencies
echo -e "${YELLOW}📦 Step 1: Installing Python dependencies...${NC}"
cd "$BACKEND_DIR"

# Check if virtual environment exists
if [ -d ".venv" ] || [ -d "venv" ]; then
    echo "Activating virtual environment..."
    if [ -d ".venv" ]; then
        source .venv/bin/activate
    else
        source venv/bin/activate
    fi
else
    echo "Creating virtual environment..."
    python3 -m venv .venv
    source .venv/bin/activate
fi

# Install requirements
echo "Installing from requirements.txt..."
pip install --upgrade pip
pip install -r requirements.txt

echo -e "${GREEN}✅ Python dependencies installed${NC}"
echo ""

# Step 2: Install LSP servers
echo -e "${YELLOW}📦 Step 2: Installing LSP servers...${NC}"

# Install TypeScript Language Server (global)
echo "Installing TypeScript Language Server..."
if command -v npm &> /dev/null; then
    npm install -g typescript-language-server
    echo -e "${GREEN}✅ TypeScript Language Server installed${NC}"
else
    echo -e "${RED}⚠️  npm not found. Please install Node.js and npm first.${NC}"
fi

# Install Python LSP Server (via pip)
echo "Installing Python LSP Server..."
pip install python-lsp-server[all]
echo -e "${GREEN}✅ Python LSP Server installed${NC}"

echo ""

# Step 3: Verify installations
echo -e "${YELLOW}🔍 Step 3: Verifying installations...${NC}"

# Check Python packages
echo "Checking Python packages..."
python3 -c "import debugpy; print('✅ debugpy:', debugpy.__version__)" || echo "❌ debugpy not found"
python3 -c "import git; print('✅ GitPython:', git.__version__)" || echo "❌ GitPython not found"
python3 -c "from cryptography.fernet import Fernet; print('✅ cryptography: OK')" || echo "❌ cryptography not found"
python3 -c "import httpx; print('✅ httpx:', httpx.__version__)" || echo "❌ httpx not found"

# Check LSP servers
echo ""
echo "Checking LSP servers..."
if command -v typescript-language-server &> /dev/null; then
    echo "✅ typescript-language-server: $(typescript-language-server --version 2>&1 || echo 'installed')"
else
    echo "❌ typescript-language-server not found"
fi

if command -v pylsp &> /dev/null; then
    echo "✅ pylsp: $(pylsp --version 2>&1 || echo 'installed')"
else
    echo "❌ pylsp not found"
fi

echo ""
echo -e "${GREEN}✅ Installation complete!${NC}"
echo ""
echo "📝 Next steps:"
echo "1. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in backend .env file"
echo "2. Set GITHUB_TOKEN_ENCRYPTION_KEY in backend .env file (generate with: python -c 'from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())')"
echo "3. Restart backend API: cd $BACKEND_DIR && docker compose restart api"
echo ""

