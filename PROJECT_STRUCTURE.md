# Project Structure

## Overview

```
loomi-pms/
├── apps/
│   ├── web/                    # Next.js Frontend
│   │   ├── src/
│   │   │   ├── app/            # App Router pages & API routes
│   │   │   ├── components/     # Page-specific components
│   │   │   ├── lib/             # Utilities (auth, api client)
│   │   │   └── hooks/           # React hooks
│   │   └── public/              # Static assets
│   │
│   └── api/                     # NestJS Backend
│       └── src/
│           ├── modules/         # Feature modules
│           │   ├── auth/        # Authentication
│           │   ├── orgs/        # Organizations
│           │   ├── properties/  # Properties management
│           │   └── quotas/      # Quota management
│           ├── common/          # Shared utilities
│           │   ├── decorators/  # Custom decorators
│           │   ├── guards/      # Auth & RBAC guards
│           │   ├── filters/     # Exception filters
│           │   ├── interceptors/# Response interceptors
│           │   └── pipes/       # Validation pipes
│           ├── config/          # Configuration
│           └── main.ts          # Application entry point
│
├── packages/
│   ├── ui/                      # Shared UI Components
│   │   └── src/
│   │       ├── components/      # React components
│   │       └── utils/           # Component utilities
│   │
│   └── shared/                  # Shared Code
│       ├── prisma/
│       │   ├── schema.prisma    # Database schema
│       │   └── migrations/      # Database migrations
│       └── src/
│           ├── prisma.ts        # Prisma client
│           ├── types/           # TypeScript types
│           ├── utils/           # Utility functions
│           └── seed.ts         # Database seed script
│
├── docs/                        # Documentation
│   ├── setup/                   # Setup guides
│   ├── architecture/            # Architecture docs
│   └── troubleshooting/         # Troubleshooting guides
│
├── scripts/                     # Utility scripts
│   └── setup-env.sh            # Environment setup
│
└── package.json                 # Root workspace config
```

## Module Organization

### API Modules (`apps/api/src/modules/`)

Each module follows NestJS best practices:
- `*.module.ts` - Module definition
- `*.controller.ts` - HTTP endpoints
- `*.service.ts` - Business logic
- `*.dto.ts` - Data transfer objects (when needed)
- `*.entity.ts` - Domain entities (when needed)

### Web App (`apps/web/src/`)

- **`app/`** - Next.js App Router (pages & API routes)
- **`components/`** - Page-specific components
- **`lib/`** - Utilities (auth helpers, API client)
- **`hooks/`** - Reusable React hooks

### Shared Packages

- **`packages/ui`** - Reusable UI components (shadcn/ui style)
- **`packages/shared`** - Database, types, utilities

## Naming Conventions

- **Files**: kebab-case (`user-service.ts`, `auth-guard.ts`)
- **Components**: PascalCase (`UserProfile.tsx`, `AuthGuard.tsx`)
- **Functions**: camelCase (`getUser`, `validateAuth`)
- **Types/Interfaces**: PascalCase (`User`, `AuthConfig`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`, `API_BASE_URL`)

## Import Paths

- Use workspace aliases: `@loomi/shared`, `@loomi/ui`
- Relative imports within same module
- Absolute imports for cross-module: `from '@/lib/auth'`

## Best Practices

1. **Keep modules focused** - One responsibility per module
2. **Use TypeScript strictly** - Enable strict mode
3. **Document public APIs** - Use JSDoc for complex functions
4. **Follow DRY** - Extract shared logic to packages
5. **Test critical paths** - Auth, RBAC, quota enforcement

