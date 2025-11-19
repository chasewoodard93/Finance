"""Database Seeding Script for Dental Budget Application

This script populates the database with initial data including:
- Practices (from Excel sheet tabs)
- Fiscal Years (2026)
- Account Categories (from Excel rows)
- Budget Periods (12 months)
- Budget Line Items (monthly data from Excel)

Usage:
    python scripts/seed_data.py
"""

import sys
import os
from datetime import date, datetime
from decimal import Decimal

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import Practice, FiscalYear, AccountCategory, BudgetPeriod, BudgetLine


def seed_practices(db):
    """Seed dental practice locations"""
    practices_data = [
        {"name": "Beaumont PC", "location": "TX003", "status": "active"},
        {"name": "Austin PC", "location": "TX001", "status": "active"},
        {"name": "Red Oak PC", "location": "TX005", "status": "active"},
        {"name": "Oak Ridge PC", "location": "TX009", "status": "active"},
        {"name": "Rosenberg PC", "location": "TX011", "status": "active"},
    ]
    
    for practice_data in practices_data:
        # Check if practice already exists
        existing = db.query(Practice).filter(Practice.name == practice_data["name"]).first()
        if not existing:
            practice = Practice(**practice_data)
            db.add(practice)
    
    db.commit()
    print(f"✓ Seeded {len(practices_data)} practices")


def seed_account_categories(db):
    """Seed account categories from budget structure"""
    categories_data = [
        # Metrics
        {"code": "980015", "name": "Doctor Days", "category_type": "metric", "level": 0, "sort_order": 1},
        {"code": "980016", "name": "Doctor Days - Ortho", "category_type": "metric", "level": 0, "sort_order": 2},
        {"code": "980050", "name": "Patients Visits- New", "category_type": "metric", "level": 0, "sort_order": 3},
        {"code": "980051", "name": "Ortho Patients Visits- New", "category_type": "metric", "level": 0, "sort_order": 4},
        {"code": "980055", "name": "Patients Visits- Existing", "category_type": "metric", "level": 0, "sort_order": 5},
        {"code": "980056", "name": "Ortho Patients Visits- Existing", "category_type": "metric", "level": 0, "sort_order": 6},
        
        # Revenue - Diagnostic
        {"code": "400000", "name": "Revenue - Diagnostic", "category_type": "revenue", "level": 0, "sort_order": 10},
        
        # Revenue - Orthodontics  
        {"code": "400080", "name": "Revenue - Orthodontics", "category_type": "revenue", "level": 0, "sort_order": 11},
        {"code": "400081", "name": "Revenue - Orthodontics - New Treatment", "category_type": "revenue", "level": 1, "sort_order": 12},
        {"code": "400083", "name": "Revenue - Orthodontics - Mid Treatment", "category_type": "revenue", "level": 1, "sort_order": 13},
        
        # Expenses - Office
        {"code": "640010", "name": "IT - Old Account", "category_type": "expense", "level": 0, "sort_order": 50},
        {"code": "640080", "name": "Processing Fees", "category_type": "expense", "level": 0, "sort_order": 51},
        {"code": "640045", "name": "Patient Sundries", "category_type": "expense", "level": 0, "sort_order": 52},
        
        # Professional Fees
        {"code": "630000", "name": "Professional Fees - Accounting", "category_type": "expense", "level": 0, "sort_order": 60},
        {"code": "630010", "name": "Professional Fees - Tax", "category_type": "expense", "level": 0, "sort_order": 61},
        {"code": "630020", "name": "Professional Fees - Legal", "category_type": "expense", "level": 0, "sort_order": 62},
        
        # Travel
        {"code": "530000", "name": "Travel - Lodging", "category_type": "expense", "level": 0, "sort_order": 70},
        {"code": "530010", "name": "Travel - Airfare", "category_type": "expense", "level": 0, "sort_order": 71},
        {"code": "530020", "name": "Travel - Transportation", "category_type": "expense", "level": 0, "sort_order": 72},
        
        # Admin
        {"code": "520000", "name": "Training and Educational", "category_type": "expense", "level": 0, "sort_order": 80},
        {"code": "520010", "name": "Conventions", "category_type": "expense", "level": 0, "sort_order": 81},
    ]
    
    for cat_data in categories_data:
        existing = db.query(AccountCategory).filter(AccountCategory.code == cat_data["code"]).first()
        if not existing:
            category = AccountCategory(**cat_data)
            db.add(category)
    
    db.commit()
    print(f"✓ Seeded {len(categories_data)} account categories")


def seed_fiscal_year_and_periods(db):
    """Create fiscal year 2026 with 12 monthly periods"""
    # Get first practice for the fiscal year
    practice = db.query(Practice).first()
    if not practice:
        print("✗ No practices found. Seed practices first.")
        return
    
    # Check if fiscal year exists
    fy = db.query(FiscalYear).filter(
        FiscalYear.practice_id == practice.id,
        FiscalYear.year == 2026
    ).first()
    
    if not fy:
        fy = FiscalYear(
            practice_id=practice.id,
            year=2026,
            start_date=date(2026, 1, 1),
            end_date=date(2026, 12, 31)
        )
        db.add(fy)
        db.commit()
        print("✓ Created fiscal year 2026")
    
    # Create 12 monthly budget periods
    for month in range(1, 13):
        existing_period = db.query(BudgetPeriod).filter(
            BudgetPeriod.fiscal_year_id == fy.id,
            BudgetPeriod.period_month == month
        ).first()
        
        if not existing_period:
            period = BudgetPeriod(
                fiscal_year_id=fy.id,
                period_month=month,
                period_date=date(2026, month, 1),
                status="active"
            )
            db.add(period)
    
    db.commit()
    print("✓ Created 12 monthly budget periods for FY 2026")


def seed_sample_budget_data(db):
    """Seed sample budget data for demonstration"""
    # Get first practice and first period
    practice = db.query(Practice).first()
    if not practice:
        return
    
    fy = db.query(FiscalYear).filter(FiscalYear.practice_id == practice.id).first()
    if not fy:
        return
    
    period = db.query(BudgetPeriod).filter(BudgetPeriod.fiscal_year_id == fy.id).first()
    if not period:
        return
    
    # Get some categories
    categories = db.query(AccountCategory).limit(5).all()
    
    for category in categories:
        existing = db.query(BudgetLine).filter(
            BudgetLine.practice_id == practice.id,
            BudgetLine.budget_period_id == period.id,
            BudgetLine.category_id == category.id
        ).first()
        
        if not existing:
            budget_line = BudgetLine(
                practice_id=practice.id,
                budget_period_id=period.id,
                category_id=category.id,
                month=1,
                budget_amount=Decimal("10000.00"),
                actual_amount=Decimal("9500.00"),
                variance=Decimal("500.00")
            )
            db.add(budget_line)
    
    db.commit()
    print("✓ Seeded sample budget line items")


def main():
    """Main seeding function"""
    print("\n🌱 Starting database seeding...\n")
    
    db = SessionLocal()
    
    try:
        # Seed in order
        seed_practices(db)
        seed_account_categories(db)
        seed_fiscal_year_and_periods(db)
        seed_sample_budget_data(db)
        
        print("\n✅ Database seeding completed successfully!\n")
        
    except Exception as e:
        print(f"\n✗ Error during seeding: {str(e)}\n")
        db.rollback()
        raise
    
    finally:
        db.close()


if __name__ == "__main__":
    main()
