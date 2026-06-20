import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.database import engine, SessionLocal, Base
from app.models import User, Machine, SampleType, Sample, Alert
from app.auth import hash_password
from app.services.sample_generator import MACHINES, SAMPLE_TYPES, USERS, generate_sample_csv
import csv
from datetime import datetime, timezone
from app.services.spc import evaluate_sample


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if db.query(User).count() > 0:
        print("Database already seeded. Skipping.")
        db.close()
        return

    for u in USERS:
        db.add(User(
            username=u["username"],
            email=u["email"],
            hashed_password=hash_password(u["password"]),
            role=u["role"],
        ))
    db.commit()

    for m in MACHINES:
        db.add(Machine(name=m["name"], code=m["code"], location=m["location"]))
    db.commit()

    type_map = {}
    for st in SAMPLE_TYPES:
        obj = SampleType(name=st["name"], unit=st["unit"], lower_spec_limit=st["lsl"], upper_spec_limit=st["usl"], target=st["target"])
        db.add(obj)
        db.flush()
        type_map[st["name"]] = obj
    db.commit()

    machine_map = {m.code: m for m in db.query(Machine).all()}
    operator = db.query(User).filter(User.role == "operator").first()

    csv_path = generate_sample_csv("data/sample_data.csv", 200)
    with open(csv_path, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            machine = machine_map.get(row["machine_code"])
            st = type_map.get(row["sample_type"])
            if not machine or not st:
                continue
            sample = Sample(
                machine_id=machine.id,
                sample_type_id=st.id,
                value=float(row["value"]),
                operator_id=operator.id,
                measured_at=datetime.fromisoformat(row["measured_at"]),
                notes=row.get("notes", ""),
            )
            db.add(sample)
            db.flush()
            alert = evaluate_sample(sample, st, machine, db)
            if alert:
                db.add(alert)
        db.commit()

    print(f"Seeded {len(USERS)} users, {len(MACHINES)} machines, {len(SAMPLE_TYPES)} sample types, 200 samples.")
    db.close()


if __name__ == "__main__":
    seed()
