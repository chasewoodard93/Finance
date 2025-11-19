from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# Import routers
from app.routers import budget, practices, reports, auth

# Initialize FastAPI app
app = FastAPI(
    title="Dental Budget API",
    description="API for managing dental practice budgets",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(budget.router)
app.include_router(practices.router)
app.include_router(reports.router)
app.include_router(auth.router)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Dental Budget API",
        "version": "1.0.0",
        "status": "operational"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "database": "connected",  # Will be implemented
        "cache": "connected"     # Will be implemented
    }

@app.get("/api/v1/practices")
async def get_practices():
    """Get all dental practices"""
    # Placeholder - will be implemented with database
    return {
        "practices": [
            {
                "id": "1",
                "name": "TW Lone Peak Master, LLC",
                "status": "active"
            }
        ]
    }

@app.get("/api/v1/fiscal-years")
async def get_fiscal_years():
    """Get all fiscal years"""
    # Placeholder - will be implemented with database
    return {
        "fiscal_years": [
            {
                "id": "1",
                "year": 2026,
                "start_date": "2026-01-01",
                "end_date": "2026-12-31"
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
