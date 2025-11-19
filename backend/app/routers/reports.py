"""Financial Reporting API Router

Provides endpoints for variance analysis and P&L reporting.
"""

from datetime import date
from decimal import Decimal
from typing import List, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import (
    Practice as PracticeModel,
    BudgetPeriod,
    BudgetLine,
    Actuals,
    AccountCategory
)
from app import schemas

router = APIRouter(
    prefix="/reports",
    tags=["reports"]
)


@router.get("/variance/{practice_id}/{period_id}", response_model=schemas.VarianceReport)
def get_variance_report(
    practice_id: int,
    period_id: int,
    db: Session = Depends(get_db)
):
    """Generate variance analysis report for a practice and budget period."""
    # Verify practice exists
    practice = db.query(PracticeModel).filter(
        PracticeModel.id == practice_id
    ).first()
    
    if not practice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Practice with id {practice_id} not found"
        )
    
    # Verify budget period exists
    period = db.query(BudgetPeriod).filter(
        BudgetPeriod.id == period_id
    ).first()
    
    if not period:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Budget period with id {period_id} not found"
        )
    
    # Get budget lines for this practice and period
    budget_lines = db.query(BudgetLine).join(
        AccountCategory
    ).filter(
        BudgetLine.practice_id == practice_id,
        BudgetLine.budget_period_id == period_id
    ).all()
    
    # Get actuals for this practice and period
    actuals = db.query(Actuals).filter(
        Actuals.practice_id == practice_id,
        Actuals.budget_period_id == period_id
    ).all()
    
    # Build actuals lookup by account_category_id
    actuals_lookup = {
        actual.account_category_id: actual.amount
        for actual in actuals
    }
    
    # Calculate totals
    total_budget = Decimal('0')
    total_actual = Decimal('0')
    line_items = []
    
    for budget_line in budget_lines:
        actual_amount = actuals_lookup.get(budget_line.account_category_id, Decimal('0'))
        variance = actual_amount - budget_line.amount
        
        total_budget += budget_line.amount
        total_actual += actual_amount
        
        line_items.append(schemas.BudgetLine(
            id=budget_line.id,
            practice_id=budget_line.practice_id,
            budget_period_id=budget_line.budget_period_id,
            account_category_id=budget_line.account_category_id,
            amount=budget_line.amount,
            notes=budget_line.notes,
            created_at=budget_line.created_at,
            updated_at=budget_line.updated_at
        ))
    
    total_variance = total_actual - total_budget
    variance_percentage = float((total_variance / total_budget * 100) if total_budget != 0 else 0)
    
    return schemas.VarianceReport(
        practice=schemas.Practice.from_orm(practice),
        period=schemas.BudgetPeriod.from_orm(period),
        total_budget=total_budget,
        total_actual=total_actual,
        total_variance=total_variance,
        variance_percentage=variance_percentage,
        line_items=line_items
    )


@router.get("/pl/{practice_id}", response_model=schemas.PLReport)
def get_pl_report(
    practice_id: int,
    start_date: date = Query(..., description="Start date for P&L report"),
    end_date: date = Query(..., description="End date for P&L report"),
    db: Session = Depends(get_db)
):
    """Generate Profit & Loss report for a practice over a date range."""
    # Verify practice exists
    practice = db.query(PracticeModel).filter(
        PracticeModel.id == practice_id
    ).first()
    
    if not practice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Practice with id {practice_id} not found"
        )
    
    # Get budget periods in date range
    periods = db.query(BudgetPeriod).filter(
        BudgetPeriod.start_date >= start_date,
        BudgetPeriod.end_date <= end_date
    ).all()
    
    if not periods:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No budget periods found between {start_date} and {end_date}"
        )
    
    period_ids = [p.id for p in periods]
    
    # Aggregate actuals by category type
    actuals_summary = db.query(
        AccountCategory.category_type,
        func.sum(Actuals.amount).label('total')
    ).join(
        AccountCategory, Actuals.account_category_id == AccountCategory.id
    ).filter(
        Actuals.practice_id == practice_id,
        Actuals.budget_period_id.in_(period_ids)
    ).group_by(
        AccountCategory.category_type
    ).all()
    
    # Initialize totals
    total_revenue = Decimal('0')
    total_expenses = Decimal('0')
    
    for category_type, total in actuals_summary:
        if category_type == 'revenue':
            total_revenue += total or Decimal('0')
        elif category_type == 'expense':
            total_expenses += total or Decimal('0')
    
    net_income = total_revenue - total_expenses
    
    # Get category details
    categories = db.query(
        AccountCategory.id,
        AccountCategory.name,
        AccountCategory.category_type,
        func.sum(Actuals.amount).label('total')
    ).join(
        Actuals, AccountCategory.id == Actuals.account_category_id
    ).filter(
        Actuals.practice_id == practice_id,
        Actuals.budget_period_id.in_(period_ids)
    ).group_by(
        AccountCategory.id,
        AccountCategory.name,
        AccountCategory.category_type
    ).all()
    
    category_list = [
        {"id": cat.id, "name": cat.name, "type": cat.category_type, "amount": cat.total or Decimal('0')}
        for cat in categories
    ]
    
    return schemas.PLReport(
        practice=schemas.Practice.from_orm(practice),
        start_date=start_date,
        end_date=end_date,
        total_revenue=total_revenue,
        total_expenses=total_expenses,
        net_income=net_income,
        categories=category_list
    )
