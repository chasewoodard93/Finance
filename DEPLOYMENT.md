# Deployment Guide - Dental Budget Application

## Overview
This guide provides comprehensive instructions for deploying the Dental Budget Application to production environments.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Docker Deployment](#docker-deployment)
4. [Digital Ocean App Platform](#digital-ocean-app-platform)
5. [Environment Variables](#environment-variables)
6. [Database Migration](#database-migration)
7. [Monitoring & Logging](#monitoring--logging)
8. [Scaling](#scaling)
9. [Backup & Recovery](#backup--recovery)

---

## Prerequisites

- Docker & Docker Compose (v3.8+)
- Git
- PostgreSQL 15+
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

## Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/chasewoodard93/Finance.git
cd Finance
```

### 2. Set Up Environment Variables
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your local settings
```

### 3. Run with Docker Compose
```bash
docker-compose up --build
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- PostgreSQL: localhost:5432

---

## Docker Deployment

### Build and Run Services
```bash
# Development mode
docker-compose up --build

# Production mode (with nginx)
docker-compose --profile production up --build -d
```

### Individual Service Management
```bash
# Start specific service
docker-compose up -d postgres
docker-compose up -d backend
docker-compose up -d frontend

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop all services
docker-compose down

# Remove volumes (WARNING: Deletes database data)
docker-compose down -v
```

---

## Digital Ocean App Platform

### Method 1: App Platform (Recommended)

1. **Create New App**
   - Go to Digital Ocean Dashboard → Apps
   - Click "Create App"
   - Connect your GitHub repository

2. **Configure Components**

   **Backend Service:**
   - Type: Web Service
   - Source Directory: `/backend`
   - Build Command: `pip install -r requirements.txt`
   - Run Command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
   - HTTP Port: 8000
   - Instance Size: Basic (512 MB RAM, 1 vCPU)

   **Frontend Service:**
   - Type: Static Site
   - Source Directory: `/frontend`
   - Build Command: `npm install && npm run build`
   - Output Directory: `/build`

   **Database:**
   - Type: PostgreSQL
   - Version: 15
   - Plan: Basic (1 GB RAM)

3. **Environment Variables** (See section below)

4. **Deploy**
   - Review settings
   - Click "Create Resources"
   - Wait for deployment (5-10 minutes)

### Method 2: Droplet with Docker

1. **Create Droplet**
```bash
# SSH into your droplet
ssh root@your-droplet-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo apt-get install docker-compose-plugin
```

2. **Deploy Application**
```bash
# Clone repository
git clone https://github.com/chasewoodard93/Finance.git
cd Finance

# Set environment variables
cp backend/.env.example backend/.env
vim backend/.env  # Edit with production values

# Start services
docker-compose --profile production up -d
```

3. **Configure Firewall**
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## Environment Variables

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/dental_budget

# Security
SECRET_KEY=your-super-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Optional: Docker Registry
DOCKER_USERNAME=your-docker-username
DOCKER_PASSWORD=your-docker-password
```

### Frontend (.env)
```bash
REACT_APP_API_URL=https://api.yourdomain.com
```

---

## Database Migration

### Initial Setup
```bash
# SSH into backend container or server
docker-compose exec backend bash

# Run migrations
alembic upgrade head

# Seed initial data (optional)
python scripts/seed_data.py
```

### Creating New Migrations
```bash
# Generate migration from model changes
alembic revision --autogenerate -m "Add new feature"

# Review generated migration
vim alembic/versions/xxx_add_new_feature.py

# Apply migration
alembic upgrade head
```

---

## Monitoring & Logging

### Application Logs
```bash
# View real-time logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Export logs
docker-compose logs backend > backend.log
```

### Health Checks
```bash
# Backend health check
curl https://api.yourdomain.com/health

# Database connection check
docker-compose exec postgres pg_isready -U postgres
```

### Monitoring Tools (Optional)
- **Prometheus + Grafana**: Metrics collection and visualization
- **Sentry**: Error tracking and monitoring
- **Datadog**: Application performance monitoring

---

## Scaling

### Horizontal Scaling (Digital Ocean App Platform)
1. Go to your app's dashboard
2. Select the component (backend/frontend)
3. Adjust instance count
4. Click "Save" to apply changes

### Vertical Scaling
1. Upgrade instance size in App Platform settings
2. Or modify docker-compose resource limits:

```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 2G
```

---

## Backup & Recovery

### Database Backup
```bash
# Manual backup
docker-compose exec postgres pg_dump -U postgres dental_budget > backup.sql

# Scheduled backup (cron)
0 2 * * * docker-compose exec postgres pg_dump -U postgres dental_budget > /backups/db-$(date +\%Y\%m\%d).sql
```

### Database Restore
```bash
# Restore from backup
docker-compose exec -T postgres psql -U postgres dental_budget < backup.sql
```

### Digital Ocean Managed Database Backups
- Automatic daily backups (retained for 7 days)
- Point-in-time recovery available
- Configure in Database settings

---

## Security Best Practices

1. **Use HTTPS**: Configure SSL certificates (Let's Encrypt)
2. **Strong Secrets**: Generate cryptographically secure SECRET_KEY
3. **Database Security**: Use strong passwords, limit access
4. **CORS**: Restrict to specific domains
5. **Rate Limiting**: Implement API rate limiting
6. **Regular Updates**: Keep dependencies up to date

---

## Troubleshooting

### Backend Won't Start
```bash
# Check logs
docker-compose logs backend

# Common issues:
# - Database connection: Verify DATABASE_URL
# - Missing dependencies: Rebuild container
# - Port conflicts: Change port mapping
```

### Database Connection Failed
```bash
# Test connection
docker-compose exec backend python -c "from app.database import engine; print(engine.execute('SELECT 1').scalar())"

# Check database status
docker-compose ps postgres
```

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/chasewoodard93/Finance/issues
- Email: support@yourdomain.com

---

**Last Updated**: 2025-01-15
**Version**: 1.0.0
