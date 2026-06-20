import csv
import io
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Sample, Machine, SampleType, User, Alert, AlertSeverity, UserRole
from ..schemas import SampleCreate, SampleOut
from ..auth import get_current_user, require_role
from ..services.spc import evaluate_sample

router = APIRouter(prefix="/samples", tags=["samples"])


def sample_to_out(s: Sample) -> SampleOut:
    return SampleOut(
        id=s.id,
        machine_id=s.machine_id,
        sample_type_id=s.sample_type_id,
        value=s.value,
        operator_id=s.operator_id,
        measured_at=s.measured_at,
        notes=s.notes,
        created_at=s.created_at,
        machine_name=s.machine.name if s.machine else None,
        sample_type_name=s.sample_type.name if s.sample_type else None,
    )


@router.get("", response_model=List[SampleOut])
def list_samples(
    machine_id: int | None = None,
    sample_type_id: int | None = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    q = db.query(Sample)
    if machine_id:
        q = q.filter(Sample.machine_id == machine_id)
    if sample_type_id:
        q = q.filter(Sample.sample_type_id == sample_type_id)
    q = q.order_by(Sample.measured_at.desc()).limit(limit)
    return [sample_to_out(s) for s in q.all()]


@router.post("", response_model=SampleOut)
def create_sample(body: SampleCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    machine = db.query(Machine).filter(Machine.id == body.machine_id).first()
    if not machine:
        raise HTTPException(status_code=400, detail="Machine not found")
    st = db.query(SampleType).filter(SampleType.id == body.sample_type_id).first()
    if not st:
        raise HTTPException(status_code=400, detail="Sample type not found")

    sample = Sample(
        machine_id=body.machine_id,
        sample_type_id=body.sample_type_id,
        value=body.value,
        operator_id=user.id,
        measured_at=body.measured_at or datetime.now(timezone.utc),
        notes=body.notes,
    )
    db.add(sample)
    db.commit()
    db.refresh(sample)

    alert = evaluate_sample(sample, st, machine, db)
    if alert:
        db.add(alert)
        db.commit()

    return sample_to_out(sample)


@router.post("/import-csv")
def import_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user=Depends(require_role(UserRole.OPERATOR, UserRole.ENGINEER, UserRole.ADMIN)),
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files accepted")
    content = file.file.read().decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(content))
    imported = 0
    errors = []
    for row in reader:
        try:
            machine = db.query(Machine).filter(Machine.code == row["machine_code"]).first()
            if not machine:
                errors.append(f"Machine not found: {row.get('machine_code')}")
                continue
            st = db.query(SampleType).filter(SampleType.name == row["sample_type"]).first()
            if not st:
                errors.append(f"Sample type not found: {row.get('sample_type')}")
                continue
            sample = Sample(
                machine_id=machine.id,
                sample_type_id=st.id,
                value=float(row["value"]),
                operator_id=user.id,
                measured_at=datetime.fromisoformat(row["measured_at"]) if row.get("measured_at") else datetime.now(timezone.utc),
                notes=row.get("notes", ""),
            )
            db.add(sample)
            db.flush()
            alert = evaluate_sample(sample, st, machine, db)
            if alert:
                db.add(alert)
            imported += 1
        except (KeyError, ValueError) as e:
            errors.append(f"Row error: {e}")
    db.commit()
    return {"imported": imported, "errors": errors}
