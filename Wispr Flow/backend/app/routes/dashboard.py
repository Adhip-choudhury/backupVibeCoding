from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from ..database import get_db
from ..models import Sample, Machine, Alert, MachineStatus
from ..schemas import DashboardKPIs, SampleOut, AlertOut
from ..auth import get_current_user
from .samples import sample_to_out

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/kpis", response_model=DashboardKPIs)
def get_kpis(db: Session = Depends(get_db), user=Depends(get_current_user)):
    total = db.query(Sample).count()
    active = db.query(Machine).filter(Machine.status == MachineStatus.ACTIVE).count()
    unread = db.query(Alert).filter(Alert.is_read == False).count()
    return DashboardKPIs(
        total_samples=total,
        defect_count=0,
        defect_rate=0.0,
        active_machines=active,
        unread_alerts=unread,
    )


@router.get("/recent-samples", response_model=List[SampleOut])
def recent_samples(limit: int = 20, db: Session = Depends(get_db), user=Depends(get_current_user)):
    samples = db.query(Sample).order_by(Sample.measured_at.desc()).limit(limit).all()
    return [sample_to_out(s) for s in samples]


@router.get("/alerts", response_model=List[AlertOut])
def list_alerts(unread_only: bool = False, limit: int = 50, db: Session = Depends(get_db), user=Depends(get_current_user)):
    q = db.query(Alert)
    if unread_only:
        q = q.filter(Alert.is_read == False)
    q = q.order_by(Alert.created_at.desc()).limit(limit)
    results = []
    for a in q.all():
        results.append(AlertOut(
            id=a.id,
            machine_id=a.machine_id,
            sample_id=a.sample_id,
            severity=a.severity.value,
            message=a.message,
            is_read=a.is_read,
            created_at=a.created_at,
            machine_name=a.machine.name if a.machine else None,
        ))
    return results


@router.post("/alerts/{alert_id}/read")
def mark_alert_read(alert_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if alert:
        alert.is_read = True
        db.commit()
    return {"ok": True}
