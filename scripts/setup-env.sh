#!/bin/bash

# LOOMI PMS - Environment Setup Script
# Creates .env files with default values

set -e

echo "🔧 Setting up LOOMI PMS environment files..."

# Create packages/shared/.env
cat > packages/shared/.env << 'EOF'
# Database Connection
# Replace with your PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/loomi_pms?schema=public"
EOF

# Create apps/web/.env.local
cat > apps/web/.env.local << 'EOF'
# NextAuth Configuration
# Generate a secret with: openssl rand -base64 32
NEXTAUTH_SECRET="change-this-to-a-random-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# API URL
API_URL="http://localhost:4001"

# Database (needed for NextAuth)
DATABASE_URL="postgresql://user:password@localhost:5432/loomi_pms?schema=public"
EOF

# Create apps/api/.env
cat > apps/api/.env << 'EOF'
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/loomi_pms?schema=public"

# Frontend URL for CORS
FRONTEND_URL="http://localhost:3000"

# API Port
PORT=4001
EOF

echo "✅ Environment files created!"
echo ""
echo "⚠️  IMPORTANT: Update the DATABASE_URL in all .env files with your PostgreSQL credentials"
echo ""
echo "Next steps:"
echo "1. Update DATABASE_URL with your PostgreSQL credentials"
echo "2. Generate NEXTAUTH_SECRET: openssl rand -base64 32"
echo "3. Run: pnpm db:migrate"
echo "4. Run: pnpm db:seed"
echo "5. Run: pnpm dev"

