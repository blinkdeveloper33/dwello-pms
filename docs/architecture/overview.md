# Architecture Overview

## Tech Stack

- **Monorepo**: pnpm workspaces
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui
- **Backend**: NestJS + TypeScript + OpenAPI/Swagger
- **Database**: PostgreSQL + Prisma
- **Cache/Queue**: Redis + BullMQ (planned)
- **Files**: S3-compatible storage
- **Auth**: NextAuth.js with JWT
- **Billing**: Stripe (planned)

## Project Structure

```
loomi-pms/
├── apps/
│   ├── web/              # Next.js frontend
│   │   └── src/
│   │       ├── app/      # App Router pages
│   │       └── components/ # Page-specific components
│   └── api/              # NestJS backend
│       └── src/
│           ├── auth/     # Authentication module
│           ├── orgs/     # Organizations module
│           ├── properties/ # Properties module
│           ├── quotas/   # Quotas module
│           └── common/   # Shared utilities
├── packages/
│   ├── ui/               # Shared UI components
│   │   └── src/
│   │       └── components/
│   └── shared/           # Shared code
│       ├── prisma/       # Database schema
│       └── src/
│           ├── prisma.ts # Prisma client
│           ├── types/    # TypeScript types
│           └── utils/    # Utility functions
└── docs/                 # Documentation
```

## Multi-Tenancy

- **Org as tenant boundary**: Every table includes `orgId`
- **Property-scoped access**: `property_assignments` table for fine-grained permissions
- **RBAC**: Role-based access control with capability-based permissions

## Plans & Quotas

- **4 Plans**: Starter, Growth, Pro, Enterprise
- **Quotas**: Enforced at API level (units, properties, users, messages, API calls)
- **Feature Flags**: Module packs toggleable per plan

## Module Packs

- **Rental Pack**: Applications, screening, e-sign, lease renewals
- **HOA/Condo Pack**: Violations, ARC, amenities, board approvals
- **Accounting Pro Pack**: COA, journals, AP, bank reconciliation
- **Enterprise Pack**: SSO, API keys, webhooks, advanced audit

