from sqlalchemy import Column, Integer, String, Numeric, Date, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Practice(Base):
    """Dental Practice Model"""
    __tablename__ = "practices"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    location = Column(String(255))
    status = Column(String(50), default="active")
    
    # Relationships
    fiscal_years = relationship("FiscalYear", back_populates="practice")
    budget_lines = relationship("BudgetLine", back_populates="practice")

class FiscalYear(Base):
    """Fiscal Year Model"""
    __tablename__ = "fiscal_years"
    
    id = Column(Integer, primary_key=True, index=True)
    practice_id = Column(Integer, ForeignKey("practices.id"), nullable=False)
    year = Column(Integer, nullable=False, index=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    
    # Relationships
    practice = relationship("Practice", back_populates="fiscal_years")
    budget_lines = relationship("BudgetLine", back_populates="fiscal_year")
        budget_periods = relationship("BudgetPeriod", back_populates="fiscal_year")

class AccountCategory(Base):
    """Account Category Model for P&L Structure"""
    __tablename__ = "account_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    category_type = Column(String(50))  # revenue, expense
    parent_id = Column(Integer, ForeignKey("account_categories.id"))
    level = Column(Integer, default=0)
    sort_order = Column(Integer, default=0)
    
    # Relationships
    children = relationship("AccountCategory")
    budget_lines = relationship("BudgetLine", back_populates="category")

class BudgetLine(Base):
    """Budget Line Item Model"""
    __tablename__ = "budget_lines"
    
    id = Column(Integer, primary_key=True, index=True)
    practice_id = Column(Integer, ForeignKey("practices.id"), nullable=False)
    budget_period_id = Column(Integer, ForeignKey("budget_periods.id"), nullable=False)
