# Database Setup

## PostgreSQL Installation

### macOS (Homebrew)

```bash
brew install postgresql@14
brew services start postgresql@14
```

### Create Database

```bash
# Create database
createdb loomi_pms

# Or with specific user
createdb -U postgres loomi_pms
```

## Database Configuration

### Connection String Format

```
postgresql://username:password@host:port/database?schema=public
```

### Example

```bash
DATABASE_URL="postgresql://vale@localhost:5432/loomi_pms?schema=public"
```

## Migrations

### Create Migration

```bash
pnpm db:migrate
```

This will:
1. Compare schema.prisma with database
2. Generate migration SQL
3. Apply migration
4. Regenerate Prisma client

### Reset Database (Development Only)

```bash
# WARNING: This deletes all data!
pnpm db:migrate reset
```

## Seeding

### Seed Demo Data

```bash
pnpm db:seed
```

This creates:
- Demo organization
- Demo user (demo@loomi.com)
- Sample properties, units, contacts
- Sample charges and work orders

### Custom Seed Data

Edit `packages/shared/src/seed.ts` to customize seed data.

## Prisma Studio

Visual database browser:

```bash
pnpm db:studio
```

Opens at http://localhost:5555

## Troubleshooting

### Connection Errors

- Verify PostgreSQL is running: `brew services list | grep postgres`
- Check database exists: `psql -l | grep loomi_pms`
- Verify credentials in `.env` files

### Migration Errors

- Check schema.prisma syntax: `npx prisma format`
- Verify database connection
- Check for conflicting migrations

