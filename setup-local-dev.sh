#!/bin/bash

# Local Development Setup Script
# Date: 2025-01-27
# Purpose: Set up local development environment for backend

set -e

echo "🚀 Setting up local development environment..."
echo ""

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "⚠️  This script is optimized for macOS. Adjust commands for your OS."
    echo ""
fi

# Step 1: Install Redis
echo "📦 Step 1: Installing Redis..."
if ! command -v redis-cli &> /dev/null; then
    if command -v brew &> /dev/null; then
        echo "Installing Redis via Homebrew..."
        brew install redis
        brew services start redis
        echo "✅ Redis installed and started"
    else
        echo "❌ Homebrew not found. Please install Redis manually:"
        echo "   brew install redis"
        exit 1
    fi
else
    echo "✅ Redis already installed"
fi

# Step 2: Install pgvector
echo ""
echo "📦 Step 2: Installing pgvector..."
if [ ! -d "/tmp/pgvector" ]; then
    echo "Cloning pgvector repository..."
    cd /tmp
    git clone --branch v0.5.1 https://github.com/pgvector/pgvector.git
    cd pgvector
    make
    sudo make install
    echo "✅ pgvector installed"
    cd - > /dev/null
else
    echo "✅ pgvector already cloned (skipping)"
fi

# Step 3: Start PostgreSQL
echo ""
echo "📦 Step 3: Starting PostgreSQL..."
if command -v brew &> /dev/null; then
    brew services start postgresql@14 || echo "PostgreSQL may already be running"
    echo "✅ PostgreSQL started"
else
    echo "⚠️  Please start PostgreSQL manually"
fi

# Step 4: Create local database
echo ""
echo "📦 Step 4: Creating local database..."
DB_NAME="resonant_dev"
if psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "✅ Database '$DB_NAME' already exists"
else
    createdb "$DB_NAME"
    echo "✅ Database '$DB_NAME' created"
fi

# Step 5: Enable pgvector extension
echo ""
echo "📦 Step 5: Enabling pgvector extension..."
psql "$DB_NAME" <<EOF
CREATE EXTENSION IF NOT EXISTS vector;
SELECT * FROM pg_extension WHERE extname = 'vector';
EOF
echo "✅ pgvector extension enabled"

# Step 6: Run migrations
echo ""
echo "📦 Step 6: Running database migrations..."
MIGRATIONS_DIR="migrations"
if [ -d "$MIGRATIONS_DIR" ]; then
    echo "Running migration 001: Provider tables..."
    psql "$DB_NAME" < "$MIGRATIONS_DIR/001_create_provider_tables.sql"
    
    echo "Running migration 002: Universe tables..."
    psql "$DB_NAME" < "$MIGRATIONS_DIR/002_create_universe_tables.sql"
    
    echo "Running migration 003: pgvector setup..."
    psql "$DB_NAME" < "$MIGRATIONS_DIR/003_enable_pgvector.sql"
    
    echo "✅ All migrations completed"
else
    echo "⚠️  Migrations directory not found. Skipping migrations."
fi

# Step 7: Verify setup
echo ""
echo "📦 Step 7: Verifying setup..."
echo ""

# Check Redis
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is running"
else
    echo "❌ Redis is not running. Start with: brew services start redis"
fi

# Check PostgreSQL
if psql "$DB_NAME" -c "SELECT version();" > /dev/null 2>&1; then
    echo "✅ PostgreSQL is accessible"
else
    echo "❌ PostgreSQL is not accessible"
fi

# Check pgvector
if psql "$DB_NAME" -c "SELECT * FROM pg_extension WHERE extname = 'vector';" | grep -q vector; then
    echo "✅ pgvector extension is enabled"
else
    echo "❌ pgvector extension is not enabled"
fi

# Check tables
TABLE_COUNT=$(psql "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('ai_providers', 'universes');")
if [ "$TABLE_COUNT" -ge 2 ]; then
    echo "✅ Database tables created"
else
    echo "⚠️  Some tables may be missing"
fi

echo ""
echo "🎉 Local development environment setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Configure backend .env file:"
echo "      DATABASE_URL=postgresql://localhost:5432/resonant_dev"
echo "      REDIS_URL=redis://localhost:6379"
echo ""
echo "   2. Start developing backend code locally"
echo "   3. Test API endpoints against local database"
echo ""
echo "📚 See DEVELOPMENT_WORKFLOW_GUIDE.md for more details"

