# Common Issues & Solutions

## Sign-In Issues

### "Invalid email or password"

**Check:**
1. Database is set up: `psql -d loomi_pms -c "SELECT email FROM users;"`
2. Demo user exists: Should see `demo@loomi.com`
3. Web server has DATABASE_URL in `.env.local`
4. Server was restarted after adding DATABASE_URL

**Solution:**
- Verify database connection: Visit http://localhost:3000/api/test-db
- Check terminal for debug messages when signing in
- Ensure DATABASE_URL is in `apps/web/.env.local`

## Database Connection Issues

### "Cannot connect to database"

**Check:**
- PostgreSQL is running: `brew services list | grep postgres`
- Database exists: `psql -l | grep loomi_pms`
- Credentials are correct in `.env` files

**Solution:**
```bash
# Start PostgreSQL
brew services start postgresql@14

# Create database if missing
createdb loomi_pms
```

### "role does not exist"

**Solution:**
```bash
# Create PostgreSQL user
psql template1 -c "CREATE USER your_username WITH SUPERUSER CREATEDB;"

# Or reinitialize PostgreSQL
brew services stop postgresql@14
rm -rf /opt/homebrew/var/postgresql@14
initdb /opt/homebrew/var/postgresql@14
brew services start postgresql@14
```

## Port Already in Use

### Port 3000 or 4001 in use

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 4001
lsof -ti:4001 | xargs kill -9
```

## Module Not Found Errors

**Solution:**
```bash
# Reinstall dependencies
pnpm install

# Regenerate Prisma client
pnpm db:generate
```

## TypeScript Errors

**Solution:**
```bash
# Type check
pnpm type-check

# Regenerate Prisma client (fixes Prisma-related TS errors)
pnpm db:generate
```

