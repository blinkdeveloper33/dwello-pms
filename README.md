# LOOMI PMS

An all-in-one Property + Condo/HOA Management OS built as a modern multi-tenant SaaS platform.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment variables (see docs/setup/getting-started.md)
# Create .env files in packages/shared, apps/web, apps/api

# Set up database
createdb loomi_pms
pnpm db:migrate
pnpm db:seed

# Start development servers
pnpm dev
```

**Access:**
- Web App: http://localhost:3000
- API Docs: http://localhost:4001/api/docs
- Demo Login: demo@loomi.com / any password

## 📚 Documentation

- **[Getting Started](./docs/setup/getting-started.md)** - Installation and setup
- **[Development Guide](./docs/setup/development.md)** - Local development workflow
- **[Database Setup](./docs/setup/database.md)** - PostgreSQL configuration
- **[Architecture](./docs/architecture/overview.md)** - System design
- **[Troubleshooting](./docs/troubleshooting/common-issues.md)** - Common issues

## 🏗️ Architecture

- **Monorepo**: pnpm workspaces
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui
- **Backend**: NestJS + TypeScript + OpenAPI/Swagger
- **Database**: PostgreSQL + Prisma
- **Auth**: NextAuth.js with JWT + RBAC

## 📦 Project Structure

```
loomi-pms/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── packages/
│   ├── ui/           # Shared UI components
│   └── shared/       # Shared types, Prisma, utilities
└── docs/             # Documentation
```

## 🛠️ Available Scripts

- `pnpm dev` - Start both web and API servers
- `pnpm dev:web` - Start only web server
- `pnpm dev:api` - Start only API server
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:migrate` - Run database migrations
- `pnpm db:seed` - Seed demo data
- `pnpm db:studio` - Open Prisma Studio
- `pnpm build` - Build all packages
- `pnpm lint` - Lint all packages
- `pnpm type-check` - Type check all packages

## 🎯 Features

### Core (All Plans)
- Organizations, users, roles, permissions
- Properties, buildings, units
- Contacts directory
- Charges & payments ledger
- Work orders & inspections
- Documents with permissions
- Communications hub
- Reports center
- Unified Inbox
- Audit logs

### Module Packs (Feature Flags)
- **Rental Pack**: Applications, screening, e-sign, lease renewals
- **HOA/Condo Pack**: Violations, ARC, amenities, board approvals
- **Accounting Pro Pack**: COA, journals, AP, bank reconciliation
- **Enterprise Pack**: SSO, API keys, webhooks, advanced audit

## 📋 Development Status

**Phase 1: Foundation** ✅
- Multi-tenancy & RBAC
- Plans & quotas
- Basic UI components
- Authentication

**Phase 2-7**: In progress

See [Architecture Overview](./docs/architecture/overview.md) for details.

## 📝 License

Proprietary
