# Getting Started

## Prerequisites

- Node.js >= 18
- pnpm >= 8
- PostgreSQL >= 14
- Redis >= 7 (optional, for queues)

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

Create `.env` files:

**`packages/shared/.env`**:
```bash
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/loomi_pms?schema=public"
```

**`apps/web/.env.local`**:
```bash
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
API_URL="http://localhost:4001"
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/loomi_pms?schema=public"
```

**`apps/api/.env`**:
```bash
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/loomi_pms?schema=public"
FRONTEND_URL="http://localhost:3000"
PORT=4001
```

### 3. Set Up Database

```bash
# Create database
createdb loomi_pms

# Run migrations
pnpm db:migrate

# Seed demo data
pnpm db:seed
```

### 4. Start Development Servers

```bash
# Start both servers
pnpm dev

# Or separately
pnpm dev:web  # http://localhost:3000
pnpm dev:api  # http://localhost:4001
```

### 5. Access the Application

- **Web App**: http://localhost:3000
- **API Docs**: http://localhost:4001/api/docs
- **Demo Login**: demo@loomi.com / any password

## Next Steps

- See [Development Guide](./development.md) for local development workflow
- See [Database Setup](./database.md) for detailed database configuration

