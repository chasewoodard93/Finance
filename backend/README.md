# Dental Budget API - Backend

FastAPI backend for the Dental Budget Management application.

## Features

- FastAPI REST API with automatic documentation
- PostgreSQL database with SQLAlchemy ORM
- Alembic database migrations
- JWT-based authentication with bcrypt password hashing
- CORS middleware for frontend integration
- Pydantic schemas for request/response validation
- Budget management and financial reporting endpoints

## Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Alembic
- **Authentication**: JWT (python-jose) + bcrypt
- **Validation**: Pydantic v2

## Project Structure

```
backend/
├── alembic/              # Database migrations
│   ├── versions/         # Migration files
│   └── env.py           # Alembic configuration
├── app/
│   ├── models.py        # SQLAlchemy models
│   ├── schemas.py       # Pydantic schemas
│   ├── database.py      # Database connection
│   ├── main.py          # FastAPI application
│   └── routers/         # API endpoints
│       ├── auth.py      # Authentication
│       ├── budget.py    # Budget operations
│       ├── practices.py # Practice management
│       └── reports.py   # Financial reports
├── scripts/
│   └── seed_data.py     # Database seeding
├── .env                 # Environment variables (create from .env.example)
├── .env.example         # Environment template
├── Dockerfile          # Docker container setup
└── requirements.txt     # Python dependencies
```

## Setup Instructions

### Prerequisites

- Python 3.11+
- PostgreSQL 14+
- pip or poetry

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Finance/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Create database**
   ```bash
   createdb dental_budget
   ```

6. **Run migrations**
   ```bash
   alembic upgrade head
   ```

7. **Seed initial data**
   ```bash
   python scripts/seed_data.py
   ```

8. **Start development server**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### Docker Setup

```bash
# Build and run with Docker Compose
docker-compose up -d

# Run migrations in container
docker-compose exec backend alembic upgrade head

# Seed data
docker-compose exec backend python scripts/seed_data.py
```

## API Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get JWT token
- `GET /api/v1/auth/me` - Get current user profile
- `POST /api/v1/auth/refresh` - Refresh JWT token

### Practices
- `GET /api/v1/practices` - List all practices
- `POST /api/v1/practices` - Create new practice
- `GET /api/v1/practices/{id}` - Get practice details
- `PUT /api/v1/practices/{id}` - Update practice
- `DELETE /api/v1/practices/{id}` - Delete practice

### Budget Management
- `GET /api/v1/budget/lines` - Get budget lines
- `POST /api/v1/budget/lines` - Create budget line
- `PUT /api/v1/budget/lines/{id}` - Update budget line
- `DELETE /api/v1/budget/lines/{id}` - Delete budget line

### Reports
- `GET /api/v1/reports/variance` - Get variance report
- `GET /api/v1/reports/pl` - Get P&L report

## Environment Variables

See `.env.example` for all available configuration options:

- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret key (generate with `openssl rand -hex 32`)
- `ALGORITHM` - JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Token expiration time
- `ENVIRONMENT` - Environment name (development/production)

## Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# Show migration history
alembic history
```

## Testing

```bash
# Run tests
pytest

# With coverage
pytest --cov=app tests/
```

## Deployment

### Digital Ocean App Platform

1. Push code to GitHub
2. Create new App in Digital Ocean
3. Connect GitHub repository
4. Configure environment variables
5. Set up managed PostgreSQL database
6. Deploy

### Manual Deployment

1. Set up PostgreSQL database
2. Configure environment variables
3. Run migrations: `alembic upgrade head`
4. Start with gunicorn: `gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker`

## Contributing

1. Create feature branch
2. Make changes
3. Run tests
4. Submit pull request

## License

MIT
