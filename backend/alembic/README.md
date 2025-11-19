# Alembic Database Migrations

This directory contains Alembic database migration scripts for the Dental Budget Application.

## Setup

Alembic is configured to work with PostgreSQL and automatically discovers all SQLAlchemy models from `app.models`.

## Usage

### Create a New Migration

To auto-generate a migration based on model changes:

```bash
cd backend
alembic revision --autogenerate -m "Description of changes"
```

### Apply Migrations

To upgrade to the latest version:

```bash
alembic upgrade head
```

### Downgrade Migrations

To rollback one version:

```bash
alembic downgrade -1
```

### Check Current Version

```bash
alembic current
```

### View Migration History

```bash
alembic history
```

## Configuration

- **env.py**: Contains the Alembic environment configuration
- **Database URL**: Configured via `DATABASE_URL` environment variable
- **Default**: `postgresql://postgres:postgres@localhost:5432/dental_budget`

## Migration Best Practices

1. **Always review** auto-generated migrations before applying
2. **Test migrations** on development database first
3. **Backup database** before running migrations in production
4. **Keep migrations atomic** - one logical change per migration
5. **Add comments** to complex migration scripts

## Initial Setup

For a new database, run:

```bash
# Create all tables
alembic upgrade head

# Run seed data script
python scripts/seed_data.py
```

## Docker Usage

When using Docker Compose:

```bash
docker-compose exec backend alembic upgrade head
```
