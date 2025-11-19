"""Pydantic Schemas for API Request/Response Validation

These schemas define the shape of data for API endpoints,
providing automatic validation, serialization, and documentation.
"""

from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, validator


# ==================== Practice Schemas ====================

class PracticeBase(BaseModel):
    name: str = Field(..., max_length=255, description="Practice name")
    location: str = Field(..., max_length=255, description="Practice location code")
    status: str = Field(default="active", max_length=50)

class PracticeCreate(PracticeBase):
    pass

class PracticeUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    location: Optional[str] = Field(None, max_length=255)
    status: Optional[str] = Field(None, max_length=50)

class Practice(PracticeBase):
    id: int
    
    class Config:
        from_attributes = True


# ==================== Fiscal Year Schemas ====================

class FiscalYearBase(BaseModel):
    practice_id: int
    year: int = Field(..., ge=2020, le=2050)
    start_date: date
    end_date: date

class FiscalYearCreate(FiscalYearBase):
    pass

class FiscalYear(FiscalYearBase):
    id: int
    
    class Config:
        from_attributes = True


# ==================== Account Category Schemas ====================

class AccountCategoryBase(BaseModel):
    code: str = Field(..., max_length=20, description="Account code (e.g., 400000)")
    name: str = Field(..., max_length=255)
    category_type: str = Field(..., description="revenue, expense, or metric")
    parent_id: Optional[int] = None
    level: int = Field(default=0, ge=0, le=5)
    sort_order: int = Field(default=0)
    
    @validator('category_type')
    def validate_category_type(cls, v):
        allowed = ['revenue', 'expense', 'metric']
        if v not in allowed:
            raise ValueError(f'category_type must be one of {allowed}')
        return v

class AccountCategoryCreate(AccountCategoryBase):
    pass

class AccountCategory(AccountCategoryBase):
    id: int
    
    class Config:
        from_attributes = True


# ==================== Budget Period Schemas ====================

class BudgetPeriodBase(BaseModel):
    fiscal_year_id: int
    period_month: int = Field(..., ge=1, le=12)
    period_date: date
    status: str = Field(default="draft")
    
    @validator('status')
    def validate_status(cls, v):
        allowed = ['draft', 'active', 'locked']
        if v not in allowed:
            raise ValueError(f'status must be one of {allowed}')
        return v

class BudgetPeriodCreate(BudgetPeriodBase):
    pass

class BudgetPeriod(BudgetPeriodBase):
    id: int
    
    class Config:
        from_attributes = True


# ==================== Budget Line Schemas ====================

class BudgetLineBase(BaseModel):
    practice_id: int
    budget_period_id: int
    category_id: int
    month: int = Field(..., ge=1, le=12)
    budget_amount: Decimal = Field(default=Decimal("0.00"))
    actual_amount: Decimal = Field(default=Decimal("0.00"))
    variance: Decimal = Field(default=Decimal("0.00"))
    notes: Optional[str] = None

class BudgetLineCreate(BudgetLineBase):
    pass

class BudgetLineUpdate(BaseModel):
    budget_amount: Optional[Decimal] = None
    actual_amount: Optional[Decimal] = None
    notes: Optional[str] = None

class BudgetLine(BudgetLineBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ==================== Actuals Schemas ====================

class ActualsBase(BaseModel):
    practice_id: int
    category_id: int
    period_date: date
    amount: Decimal
    source: str = Field(default="manual")
    
    @validator('source')
    def validate_source(cls, v):
        allowed = ['manual', 'quickbooks', 'xero', 'import']
        if v not in allowed:
            raise ValueError(f'source must be one of {allowed}')
        return v

class ActualsCreate(ActualsBase):
    pass

class Actuals(ActualsBase):
    id: int
    imported_at: date
    
    class Config:
        from_attributes = True


# ==================== User Schemas ====================

class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., max_length=255)
    role: str = Field(default="viewer")
    practice_id: Optional[int] = None
    
    @validator('role')
    def validate_role(cls, v):
        allowed = ['admin', 'manager', 'viewer']
        if v not in allowed:
            raise ValueError(f'role must be one of {allowed}')
        return v

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    practice_id: Optional[int] = None

class User(UserBase):
    id: int
    last_login: Optional[date] = None
    
    class Config:
        from_attributes = True


# ==================== Report Schemas ====================

class VarianceReport(BaseModel):
    """Variance Analysis Report"""
    practice: Practice
    period: BudgetPeriod
    total_budget: Decimal
    total_actual: Decimal
    total_variance: Decimal
    variance_percentage: float
    line_items: List[BudgetLine]

class PLReport(BaseModel):
    """Profit & Loss Report"""
    practice: Practice
    start_date: date
    end_date: date
    total_revenue: Decimal
    total_expenses: Decimal
    net_income: Decimal
    categories: List[dict]


# ==================== Bulk Operations ====================

# ==================== Authentication Schemas ====================

class Token(BaseModel):
    """JWT Token Response"""
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    """User response without password"""
    id: int
    email: EmailStr
    full_name: str
    role: str
    practice_id: Optional[int] = None
    last_login: Optional[date] = None
    
    class Config:
        from_attributes = True

class BudgetLineBulkUpdate(BaseModel):
    """Bulk update multiple budget lines"""
    updates: List[dict] = Field(..., description="List of {id: int, budget_amount: Decimal}")

class BulkImportRequest(BaseModel):
    """Request for bulk Excel import"""
    practice_id: int
    fiscal_year: int
    file_data: str = Field(..., description="Base64 encoded Excel file")
