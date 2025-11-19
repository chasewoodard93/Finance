# Dental Budget Application

A comprehensive budgeting and financial management platform for dental practices.

## Overview

This application provides a full-stack solution for managing dental practice budgets, including:

- Multi-practice budget management
- Monthly P&L tracking and variance analysis
- Account category hierarchy with customizable formulas
- Actuals vs Budget comparison
- Role-based access control
- Audit logging
- Data import from Excel/QuickBooks/Xero

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Primary database
- **SQLAlchemy** - ORM
- **Alembic** - Database migrations
- **Redis** - Caching layer
- **Python-Jose** - JWT authentication

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TanStack Query** - Data fetching/caching
- **Zustand** - State management
- **TailwindCSS** - Styling
- **Recharts** - Data visualization

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Local development
- **Nginx** - Reverse proxy
- **GitHub Actions** - CI/CD

## Project Structure

```
dental-budget-app/
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── api/         # API endpoints
│   │   ├── models/      # SQLAlchemy models
│   │   ├── schemas/     # Pydantic schemas
│   │   ├── services/    # Business logic
│   │   └── utils/       # Utilities
│   ├── alembic/         # Database migrations
│   ├── tests/           # Backend tests
│   └── requirements.txt
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom hooks
│   │   ├── services/    # API services
│   │   └── utils/       # Utilities
│   └── package.json
├── docker-compose.yml   # Local development
└── .github/workflows/   # CI/CD pipelines
```

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Git
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)

### Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/chasewoodard93/Finance.git
cd Finance

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Local Development Setup

#### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload
```

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Database Schema

### Core Tables
- **practices** - Dental practice information
- **fiscal_years** - Fiscal year definitions
- **account_categories** - Chart of accounts with hierarchy
- **budget_periods** - Monthly budget periods
- **budget_line_items** - Budget amounts by category/period
- **actuals** - Actual financial data
- **users** - User accounts and roles
- **audit_logs** - Change tracking

## Features

### Phase 1 (Current)
- ✅ Project setup and infrastructure
- ✅ Database schema design
- 🔄 Basic CRUD APIs
- 🔄 Authentication and authorization

### Phase 2 (Planned)
- Budget creation and management
- P&L reporting
- Variance analysis
- Excel import/export

### Phase 3 (Future)
- QuickBooks/Xero integration
- Advanced reporting and dashboards
- Budget templates
- Multi-year comparisons

## API Documentation

Once running, visit `http://localhost:8000/docs` for interactive API documentation.

## Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## Deployment

Deployment instructions will be added as the project progresses.

## Contributing

This is a private project. Contact the repository owner for contribution guidelines.

## License

Proprietary - All rights reserved

## Contact

Chase Woodard - Digital Nomads LLC
