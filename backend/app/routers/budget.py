from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from decimal import Decimal

router = APIRouter(prefix="/api/v1/budget", tags=["budget"])

# Pydantic schemas
class BudgetLineCreate(BaseModel):
    practice_id: int
    fiscal_year_id: int
    category_id: int
    month: int
    budget_amount: Decimal
    actual_amount: Decimal = 0
    notes: str = None

class BudgetLineResponse(BaseModel):
    id: int
    practice_id: int
    fiscal_year_id: int
    category_id: int
    month: int
    budget_amount: Decimal
    actual_amount: Decimal
    variance: Decimal
    notes: str = None
    
    class Config:
        from_attributes = True

class PracticeResponse(BaseModel):
    id: int
    name: str
    location: str
    status: str
    
    class Config:
        from_attributes = True

@router.get("/practices", response_model=List[PracticeResponse])
async def get_practices():
    """Get all dental practices"""
    # Mock data for now
    return [
        {"id": 1, "name": "Main Practice", "location": "Dallas, TX", "status": "active"},
        {"id": 2, "name": "Branch Office", "location": "Austin, TX", "status": "active"}
    ]

@router.get("/lines", response_model=List[BudgetLineResponse])
async def get_budget_lines(practice_id: int = None, fiscal_year_id: int = None):
    """Get budget lines with optional filtering"""
    # Mock data for now
    return [
        {
            "id": 1,
            "practice_id": 1,
            "fiscal_year_id": 1,
            "category_id": 1,
            "month": 1,
            "budget_amount": 50000.00,
            "actual_amount": 48500.00,
            "variance": -1500.00,
            "notes": "January revenue"
        }
    ]

@router.post("/lines", response_model=BudgetLineResponse)
async def create_budget_line(line: BudgetLineCreate):
    """Create a new budget line"""
    return {
        "id": 1,
        "practice_id": line.practice_id,
        "fiscal_year_id": line.fiscal_year_id,
        "category_id": line.category_id,
        "month": line.month,
        "budget_amount": line.budget_amount,
        "actual_amount": line.actual_amount,
        "variance": line.actual_amount - line.budget_amount,
        "notes": line.notes
    }
