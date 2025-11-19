"""Practice Management API Router

Provides CRUD endpoints for managing dental practice entities.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database import get_db
from app.models import Practice as PracticeModel
from app import schemas

router = APIRouter(
    prefix="/practices",
    tags=["practices"]
)


@router.get("/", response_model=List[schemas.Practice])
def get_practices(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all practices with pagination."""
    practices = db.query(PracticeModel).offset(skip).limit(limit).all()
    return practices


@router.get("/{practice_id}", response_model=schemas.Practice)
def get_practice(
    practice_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific practice by ID."""
    practice = db.query(PracticeModel).filter(
        PracticeModel.id == practice_id
    ).first()
    
    if not practice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Practice with id {practice_id} not found"
        )
    
    return practice


@router.post("/", response_model=schemas.Practice, status_code=status.HTTP_201_CREATED)
def create_practice(
    practice: schemas.PracticeCreate,
    db: Session = Depends(get_db)
):
    """Create a new practice."""
    # Check if practice with same name already exists
    existing = db.query(PracticeModel).filter(
        PracticeModel.name == practice.name
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Practice with name '{practice.name}' already exists"
        )
    
    db_practice = PracticeModel(**practice.dict())
    db.add(db_practice)
    db.commit()
    db.refresh(db_practice)
    
    return db_practice


@router.put("/{practice_id}", response_model=schemas.Practice)
def update_practice(
    practice_id: int,
    practice_update: schemas.PracticeUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing practice."""
    db_practice = db.query(PracticeModel).filter(
        PracticeModel.id == practice_id
    ).first()
    
    if not db_practice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Practice with id {practice_id} not found"
        )
    
    # Update only provided fields
    update_data = practice_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_practice, field, value)
    
    db.commit()
    db.refresh(db_practice)
    
    return db_practice


@router.delete("/{practice_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_practice(
    practice_id: int,
    db: Session = Depends(get_db)
):
    """Delete a practice."""
    db_practice = db.query(PracticeModel).filter(
        PracticeModel.id == practice_id
    ).first()
    
    if not db_practice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Practice with id {practice_id} not found"
        )
    
    db.delete(db_practice)
    db.commit()
    
    return None
