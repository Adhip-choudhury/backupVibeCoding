from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import SampleType, UserRole
from ..schemas import SampleTypeCreate, SampleTypeOut
from ..auth import get_current_user, require_role

router = APIRouter(prefix="/sample-types", tags=["sample_types"])


@router.get("", response_model=List[SampleTypeOut])
def list_sample_types(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(SampleType).all()


@router.post("", response_model=SampleTypeOut)
def create_sample_type(body: SampleTypeCreate, db: Session = Depends(get_db), user=Depends(require_role(UserRole.ENGINEER, UserRole.ADMIN))):
    st = SampleType(**body.model_dump())
    db.add(st)
    db.commit()
    db.refresh(st)
    return st
