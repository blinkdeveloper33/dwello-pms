# Development Guide

## Project Structure

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

## Development Workflow

### Making Schema Changes

1. Edit `packages/shared/prisma/schema.prisma`
2. Generate Prisma client: `pnpm db:generate`
3. Create migration: `pnpm db:migrate`
4. Update TypeScript types if needed

### Adding API Endpoints

1. Create module in `apps/api/src/`
2. Add to `apps/api/src/app.module.ts`
3. Document with Swagger decorators
4. Test via Swagger UI: http://localhost:4001/api/docs

### Adding UI Components

1. Add to `packages/ui/src/components/`
2. Export from `packages/ui/src/index.ts`
3. Use in `apps/web`

## Scripts

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

## Environment Variables

See [Environment Setup](./environment.md) for detailed environment variable documentation.

