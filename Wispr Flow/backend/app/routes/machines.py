from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Machine, MachineStatus, UserRole
from ..schemas import MachineCreate, MachineUpdate, MachineOut
from ..auth import get_current_user, require_role

router = APIRouter(prefix="/machines", tags=["machines"])


@router.get("", response_model=List[MachineOut])
def list_machines(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Machine).all()


@router.get("/{machine_id}", response_model=MachineOut)
def get_machine(machine_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    return machine


@router.post("", response_model=MachineOut)
def create_machine(body: MachineCreate, db: Session = Depends(get_db), user=Depends(require_role(UserRole.ENGINEER, UserRole.ADMIN))):
    if db.query(Machine).filter(Machine.code == body.code).first():
        raise HTTPException(status_code=400, detail="Machine code already exists")
    machine = Machine(name=body.name, code=body.code, location=body.location, status=body.status)
    db.add(machine)
    db.commit()
    db.refresh(machine)
    return machine


@router.put("/{machine_id}", response_model=MachineOut)
def update_machine(machine_id: int, body: MachineUpdate, db: Session = Depends(get_db), user=Depends(require_role(UserRole.ENGINEER, UserRole.ADMIN))):
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    if body.name is not None:
        machine.name = body.name
    if body.location is not None:
        machine.location = body.location
    if body.status is not None:
        machine.status = body.status
    db.commit()
    db.refresh(machine)
    return machine
