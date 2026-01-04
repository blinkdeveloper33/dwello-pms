# Contributing to LOOMI PMS

## Development Setup

See [Development Guide](./docs/setup/development.md) for detailed setup instructions.

## Code Style

- Use TypeScript strict mode
- Follow ESLint rules
- Use Prettier for formatting
- Write self-documenting code

## Commit Messages

Use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

## Pull Request Process

1. Create feature branch from `main`
2. Make changes
3. Run tests and linting
4. Update documentation if needed
5. Submit PR with clear description

## Project Structure

- **apps/web**: Next.js frontend
- **apps/api**: NestJS backend
- **packages/ui**: Shared UI components
- **packages/shared**: Shared utilities, types, Prisma

## Adding Features

1. Update Prisma schema if needed
2. Create/update API endpoints
3. Add UI components
4. Update documentation
5. Add tests

